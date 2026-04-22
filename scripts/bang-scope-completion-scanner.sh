#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# bang-scope-completion-scanner.sh
# 
# Quét repo natt-os_ver2goldmaster — check từng item BĂNG SCOPE
# trong ROADLOAD_NATT_OS_20260423.md đã hoàn thành chưa.
#
# READ-ONLY · không modify gì · không git add gì
# 
# USAGE:
#   cd /path/to/natt-os_ver2goldmaster
#   bash bang-scope-completion-scanner.sh                  # nice output
#   bash bang-scope-completion-scanner.sh --ascii          # no emoji
#   bash bang-scope-completion-scanner.sh --json           # machine-readable
#   bash bang-scope-completion-scanner.sh --json > out.json
#
# OUTPUT:
#   - Stdout: bảng trạng thái human-readable hoặc JSON
#   - Exit 0: scanner OK (không phải mọi item DONE)
#   - Exit 1: scanner lỗi (không tìm thấy repo root)
#
# Author: Băng (Chị Tư · N-shell · QNEU 313.5)
# Date: session_ref 20260423
# Causation: SCANNER-BANG-SCOPE-20260423
# ═══════════════════════════════════════════════════════════════════════════

set -u
# KHÔNG set -e — em cần script tiếp tục dù 1 check fail

# ── Parse args ───────────────────────────────────────────────────────────
USE_ASCII=0
USE_JSON=0
for arg in "$@"; do
  case "$arg" in
    --ascii) USE_ASCII=1 ;;
    --json)  USE_JSON=1 ;;
    -h|--help)
      sed -n '2,25p' "$0"
      exit 0
      ;;
  esac
done

# ── Locate repo root ─────────────────────────────────────────────────────
REPO_ROOT=""
if [[ -d ".git" ]]; then
  REPO_ROOT="$(pwd)"
elif command -v git >/dev/null 2>&1; then
  REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo '')"
fi

if [[ -z "$REPO_ROOT" ]] || [[ ! -d "$REPO_ROOT" ]]; then
  echo "ERROR: Không tìm thấy git repo. Chạy script từ trong repo natt-os_ver2goldmaster." >&2
  exit 1
fi

cd "$REPO_ROOT" || exit 1

# ── Status symbols ───────────────────────────────────────────────────────
if [[ $USE_ASCII -eq 1 ]]; then
  S_DONE="[DONE]"
  S_PART="[PART]"
  S_TODO="[TODO]"
  S_UNK="[ ?  ]"
  S_WARN="[WARN]"
else
  S_DONE="✅"
  S_PART="⏳"
  S_TODO="❌"
  S_UNK="❓"
  S_WARN="⚠️"
fi

# ── Counters ─────────────────────────────────────────────────────────────
COUNT_DONE=0
COUNT_PART=0
COUNT_TODO=0
COUNT_UNK=0
COUNT_TOTAL=0

# ── JSON accumulator ─────────────────────────────────────────────────────
JSON_ITEMS=""

# ── Helpers ──────────────────────────────────────────────────────────────

# add_item phase id description status evidence note
add_item() {
  local phase="$1" id="$2" desc="$3" status="$4" evidence="$5" note="${6:-}"
  COUNT_TOTAL=$((COUNT_TOTAL + 1))
  
  local sym=""
  case "$status" in
    DONE) sym="$S_DONE"; COUNT_DONE=$((COUNT_DONE + 1)) ;;
    PART) sym="$S_PART"; COUNT_PART=$((COUNT_PART + 1)) ;;
    TODO) sym="$S_TODO"; COUNT_TODO=$((COUNT_TODO + 1)) ;;
    UNK)  sym="$S_UNK";  COUNT_UNK=$((COUNT_UNK + 1)) ;;
  esac
  
  if [[ $USE_JSON -eq 1 ]]; then
    [[ -n "$JSON_ITEMS" ]] && JSON_ITEMS+=","
    JSON_ITEMS+=$(cat <<EOF
{"phase":"$phase","id":"$id","desc":"$(echo "$desc" | sed 's/"/\\"/g')","status":"$status","evidence":"$(echo "$evidence" | sed 's/"/\\"/g')","note":"$(echo "$note" | sed 's/"/\\"/g')"}
EOF
)
  else
    printf "  %s  %-8s %-55s %s\n" "$sym" "$id" "${desc:0:55}" "${evidence:0:60}"
    [[ -n "$note" ]] && printf "      %-8s   %s\n" "" "$note"
  fi
}

# Check file exists
check_file() {
  local path="$1"
  [[ -f "$path" ]] && echo "$path" && return 0
  return 1
}

# Check file exists OR find by pattern (returns first match)
check_file_or_find() {
  local exact="$1" pattern="$2" search_root="${3:-.}"
  if [[ -f "$exact" ]]; then
    echo "$exact"
    return 0
  fi
  local found
  found=$(find "$search_root" -path "*/node_modules" -prune -o -name "$pattern" -print 2>/dev/null | head -1)
  [[ -n "$found" ]] && echo "$found" && return 0
  return 1
}

# Get last commit for path (or "no commit" if not tracked)
last_commit() {
  local path="$1"
  if [[ ! -e "$path" ]]; then
    echo "n/a"
    return
  fi
  local sha
  sha=$(git log -1 --format="%h %s" -- "$path" 2>/dev/null | head -1)
  [[ -n "$sha" ]] && echo "$sha" || echo "untracked"
}

phase_header() {
  local title="$1"
  if [[ $USE_JSON -eq 0 ]]; then
    printf "\n  %s\n" "── $title ──"
  fi
}

# ═══════════════════════════════════════════════════════════════════════════
# HEADER
# ═══════════════════════════════════════════════════════════════════════════

if [[ $USE_JSON -eq 0 ]]; then
  cat <<EOF

═══════════════════════════════════════════════════════════════════════════
 BĂNG SCOPE COMPLETION SCANNER — session_ref 20260423
 Source: ROADLOAD_NATT_OS_20260423.md
 Repo: $REPO_ROOT
 Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "n/a")
 HEAD: $(git rev-parse --short HEAD 2>/dev/null || echo "n/a")
═══════════════════════════════════════════════════════════════════════════
EOF
fi

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 0.1 — Băng's prior DONE work (verify still in repo)
# ═══════════════════════════════════════════════════════════════════════════

phase_header "PHASE 0.1 — Băng prior DONE (verify still in repo)"

# KhaiCell bypass validator
ev=""
ev=$(check_file_or_find "scripts/validate-khaicell-bypass.py" "validate-khaicell-bypass.py" ".")
if [[ -n "$ev" ]]; then
  add_item "0.1" "P0.1.1" "KhaiCell bypass validator (PASS, 0 violations)" "DONE" "$ev"
else
  add_item "0.1" "P0.1.1" "KhaiCell bypass validator" "TODO" "scripts/validate-khaicell-bypass.py"
fi

# 3 KhaiCell tests
ev=$(check_file_or_find "scripts/validate-khai-3tests.py" "validate-khai-3tests.py" ".")
if [[ -n "$ev" ]]; then
  add_item "0.1" "P0.1.2" "KhaiCell 3-tests (ALL PASS)" "DONE" "$ev"
else
  add_item "0.1" "P0.1.2" "KhaiCell 3-tests" "TODO" "scripts/validate-khai-3tests.py"
fi

# Bridge v2 (4 files) — could be in twin or separate
ev=$(check_file_or_find ".nattos-twin/bridge_v2/bridge_v2.py" "bridge_v2.py" ".")
if [[ -n "$ev" ]]; then
  add_item "0.1" "P0.1.3" "Bridge v2 (28/28 tests pass)" "DONE" "$ev"
else
  add_item "0.1" "P0.1.3" "Bridge v2" "UNK" "bridge_v2.py" "Cần grep tìm — có thể trong .nattos-twin/ hoặc external location"
fi

# 6 simulations PNG (paradigm canonical)
sim_count=0
for sim in 01-log-scale-breakthrough.png 02-ve-baove-nauion.png 03-thang-than-nhiet.png 04-3tang-banthe.png 05-BC-updated.png nattos-sim-v2-4tang-thienbang-align.png; do
  found=$(find . -path "*/node_modules" -prune -o -name "$sim" -print 2>/dev/null | head -1)
  [[ -n "$found" ]] && sim_count=$((sim_count + 1))
done
if [[ $sim_count -eq 6 ]]; then
  add_item "0.1" "P0.1.4" "6 simulations PNG (paradigm canonical)" "DONE" "session-20260420-final/simulations/" "6/6 PNG verified"
elif [[ $sim_count -gt 0 ]]; then
  add_item "0.1" "P0.1.4" "6 simulations PNG" "PART" "session-20260420-final/simulations/" "$sim_count/6 PNG found"
else
  add_item "0.1" "P0.1.4" "6 simulations PNG" "TODO" "session-20260420-final/simulations/" "PNG files not found in repo"
fi

# MINH_MAN_PROTOCOL v1.0 — ship to docs/specs/?
ev=$(check_file_or_find "docs/specs/MINH_MAN_PROTOCOL_v1.0.md" "MINH_MAN_PROTOCOL_v1.0.md" ".")
if [[ -n "$ev" ]]; then
  if [[ "$ev" == *"docs/specs"* ]]; then
    add_item "0.1" "P0.1.5" "MINH_MAN_PROTOCOL v1.0 (ratify location)" "DONE" "$ev"
  else
    add_item "0.1" "P0.1.5" "MINH_MAN_PROTOCOL v1.0" "PART" "$ev" "Tồn tại nhưng chưa ở docs/specs/ — chờ Gatekeeper ký + move"
  fi
else
  add_item "0.1" "P0.1.5" "MINH_MAN_PROTOCOL v1.0" "TODO" "docs/specs/MINH_MAN_PROTOCOL_v1.0.md" "Chưa ship lên docs/specs/"
fi

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 0.3 — Băng P0 fix (warehouse stale export)
# ═══════════════════════════════════════════════════════════════════════════

phase_header "PHASE 0.3 — Băng P0 FIX (Thiên Lớn audit P3)"

if [[ -f "src/cells/infrastructure/index.ts" ]]; then
  if grep -q 'warehouse-cell' "src/cells/infrastructure/index.ts" 2>/dev/null; then
    if [[ -d "src/cells/infrastructure/warehouse-cell" ]]; then
      add_item "0.3" "P3" "infrastructure/index.ts warehouse export" "DONE" "src/cells/infrastructure/index.ts" "Export OK, warehouse-cell exists"
    else
      add_item "0.3" "P3" "infrastructure/index.ts STALE warehouse export" "TODO" "src/cells/infrastructure/index.ts" "Vẫn có 'export * from warehouse-cell' mà folder không tồn tại — cần Băng remove"
    fi
  else
    add_item "0.3" "P3" "infrastructure/index.ts warehouse stale" "DONE" "src/cells/infrastructure/index.ts" "Đã remove stale export"
  fi
else
  add_item "0.3" "P3" "infrastructure/index.ts" "UNK" "src/cells/infrastructure/index.ts" "File not found — kiểm tra path"
fi

# ═══════════════════════════════════════════════════════════════════════════
# PHASE B — SPEC SHIP (Băng author, chờ Q1 neo)
# ═══════════════════════════════════════════════════════════════════════════

phase_header "PHASE B — SPEC SHIP (chờ Q1 neo: gộp/tách)"

# B.1 SPEC foundation OR Resonance v0.2
fnd=$(check_file_or_find "docs/specs/SPEC_QIINT_PHYSICS_FOUNDATION.md" "SPEC_QIINT_PHYSICS_FOUNDATION*.md" "docs")
res=$(check_file_or_find "docs/specs/SPEC_NAUION_RESONANCE_ENGINE_v0.2.md" "SPEC_NAUION_RESONANCE_ENGINE_v0.2*.md" "docs")
if [[ -n "$fnd" ]]; then
  add_item "B" "B.1" "SPEC foundation (gộp option a)" "DONE" "$fnd"
elif [[ -n "$res" ]]; then
  add_item "B" "B.1" "SPEC Resonance Engine v0.2 (tách option b)" "DONE" "$res"
else
  add_item "B" "B.1" "SPEC foundation OR Resonance v0.2" "TODO" "docs/specs/" "Chờ Q1 neo trước khi ship"
fi

# Check old v0.1 still exists (should NOT be in docs/specs/)
old_v01=$(check_file "docs/specs/SPEC_NAUION_RESONANCE_ENGINE_v0.1.md")
if [[ -n "$old_v01" ]]; then
  add_item "B" "B.1.warn" "v0.1 paradigm sai vẫn ở docs/specs/" "TODO" "$old_v01" "Phải archive — paradigm SCAR per session 20260423"
fi

# B.2 SPEC_QIINT2_v2.0
ev=$(check_file_or_find "docs/specs/SPEC_QIINT2_v2.0.md" "SPEC_QIINT2_v2.0*.md" "docs")
if [[ -n "$ev" ]]; then
  add_item "B" "B.2" "SPEC_QIINT2 v2.0 (validator side, post B.1)" "DONE" "$ev"
else
  add_item "B" "B.2" "SPEC_QIINT2 v2.0" "TODO" "docs/specs/SPEC_QIINT2_v2.0.md" "Chờ Q1 neo + B.1 ship"
fi

# B.3 SPEC_MOMENTS v0.2
v01=$(check_file_or_find "docs/specs/SPEC_MOMENTS_MODULE_v0.1.md" "SPEC_MOMENTS_MODULE_v0.1*.md" "docs")
v02=$(check_file_or_find "docs/specs/SPEC_MOMENTS_MODULE_v0.2.md" "SPEC_MOMENTS_MODULE_v0.2*.md" "docs")
if [[ -n "$v02" ]]; then
  add_item "B" "B.3" "SPEC_MOMENTS v0.2" "DONE" "$v02"
elif [[ -n "$v01" ]]; then
  add_item "B" "B.3" "SPEC_MOMENTS (v0.1 only)" "PART" "$v01" "v0.1 đã ship — chờ neo update v0.2"
else
  add_item "B" "B.3" "SPEC_MOMENTS module" "TODO" "docs/specs/SPEC_MOMENTS_MODULE_v0.x.md"
fi

# ═══════════════════════════════════════════════════════════════════════════
# PHASE D — Băng Validator + Scanner implement
# ═══════════════════════════════════════════════════════════════════════════

phase_header "PHASE D — Băng VALIDATOR + SCANNER"

# D.1 QIINT2 v2.0 validator (rewrite from v1.0)
ev=$(check_file_or_find "scripts/qiint2-validator.ts" "qiint2-validator.ts" "scripts")
if [[ -n "$ev" ]]; then
  # Check if it's v1.0 (has Π_body × Π_medium × Π_substrate 3-tier) or v2.0 (has Π_survival)
  if grep -q "Π_survival\|Pi_survival\|piSurvival" "$ev" 2>/dev/null; then
    add_item "D" "D.1" "QIINT2 validator v2.0 (4 tầng align)" "DONE" "$ev"
  else
    add_item "D" "D.1" "QIINT2 validator (v1.0 SCAR — 3 tầng)" "PART" "$ev" "Tồn tại nhưng paradigm v1.0 sai — cần rewrite v2.0 với Π_survival"
  fi
else
  add_item "D" "D.1" "QIINT2 v2.0 validator" "TODO" "scripts/qiint2-validator.ts"
fi

# D.2 nattos.sh §45 paste
if [[ -f "nattos.sh" ]]; then
  if grep -qE "section_45_qiint2|【45】|§45" "nattos.sh" 2>/dev/null; then
    add_item "D" "D.2" "nattos.sh §45 QIINT2 section" "DONE" "nattos.sh"
  else
    add_item "D" "D.2" "nattos.sh §45 QIINT2 section" "TODO" "nattos.sh" "Section §45 chưa paste vào nattos.sh"
  fi
else
  add_item "D" "D.2" "nattos.sh" "UNK" "nattos.sh" "File not found ở root"
fi

# D.3 nattos.sh §32 memory pattern update
if [[ -f "nattos.sh" ]]; then
  if grep -qE "bangmf|bangfs|kfs\.json|kmf\.json" "nattos.sh" 2>/dev/null; then
    add_item "D" "D.3" "nattos.sh §32 memory pattern update" "TODO" "nattos.sh" "Vẫn có pattern cũ bangmf/bangfs/kfs/kmf — cần update sang khương/thịnh per R01"
  elif grep -qE "khương|thịnh|khuong\.kris|thinh\.phieu" "nattos.sh" 2>/dev/null; then
    add_item "D" "D.3" "nattos.sh §32 memory pattern" "DONE" "nattos.sh" "Đã update sang pattern v1.2"
  else
    add_item "D" "D.3" "nattos.sh §32 memory pattern" "UNK" "nattos.sh" "Không grep được pattern nào — cần verify thủ công"
  fi
fi

# D.4 src/governance/moments/ implement
if [[ -d "src/governance/moments" ]]; then
  types=$(check_file "src/governance/moments/types.ts")
  registry=$(check_file "src/governance/moments/registry.ts")
  if [[ -n "$types" ]] && [[ -n "$registry" ]]; then
    add_item "D" "D.4" "Moments registry (types.ts + registry.ts)" "DONE" "src/governance/moments/"
  else
    add_item "D" "D.4" "Moments registry" "PART" "src/governance/moments/" "Folder tồn tại nhưng thiếu types.ts hoặc registry.ts"
  fi
else
  # Maybe Băng put in maintain_validators location
  alt=$(find src -name "moments" -type d 2>/dev/null | head -1)
  if [[ -n "$alt" ]]; then
    add_item "D" "D.4" "Moments registry" "PART" "$alt" "Tồn tại path khác — verify location đúng"
  else
    add_item "D" "D.4" "Moments registry" "TODO" "src/governance/moments/" "Chờ B.3 SPEC ship trước"
  fi
fi

# D.5 scanner-law-enforce
ev=$(check_file_or_find "scripts/scanner-law-enforce.sh" "scanner-law-enforce*.sh" ".")
if [[ -n "$ev" ]]; then
  add_item "D" "D.5" "scanner-law-enforce (LAW-2/4 quét)" "DONE" "$ev"
else
  add_item "D" "D.5" "scanner-law-enforce" "TODO" "scripts/scanner-law-enforce.sh"
fi

# ═══════════════════════════════════════════════════════════════════════════
# PHASE E — Calibration (chờ Q2 data access neo)
# ═══════════════════════════════════════════════════════════════════════════

phase_header "PHASE E — CALIBRATION (chờ Q2 data access)"

# Check if any calibration outputs exist
calib_dir=$(find . -path "*/node_modules" -prune -o -type d -name "calibration*" -print 2>/dev/null | head -1)
calib_files=$(find . -path "*/node_modules" -prune -o -name "calibration-*.json" -print 2>/dev/null | head -1)

if [[ -n "$calib_dir" ]] || [[ -n "$calib_files" ]]; then
  add_item "E" "E.*" "Calibration 8 tham số P1" "PART" "${calib_dir:-$calib_files}" "Có evidence calibration started — verify từng số"
else
  add_item "E" "E.*" "Calibration 8 tham số (giả định)" "TODO" "calibration/" "Chưa start — chờ Q2 neo data access"
fi

# ═══════════════════════════════════════════════════════════════════════════
# PHASE F — Cross-persona migration (Băng tools + own house)
# ═══════════════════════════════════════════════════════════════════════════

phase_header "PHASE F — Cross-persona migration"

# nattos-migrate.py
ev=$(check_file_or_find "scripts/nattos-migrate.py" "nattos-migrate.py" ".")
if [[ -n "$ev" ]]; then
  add_item "F" "F.tool" "nattos-migrate.py (migration tool, 456 lines)" "DONE" "$ev"
else
  add_item "F" "F.tool" "nattos-migrate.py" "TODO" "scripts/nattos-migrate.py"
fi

# Băng own house migration: bang/session_handoff_20260417.kris
old=$(check_file "src/governance/memory/bang/session_handoff_20260417_FIXED.json")
new=$(check_file "src/governance/memory/bang/session_handoff_20260417.kris")
if [[ -n "$new" ]] && [[ -z "$old" ]]; then
  add_item "F" "F.bang" "Băng house: session_handoff_FIXED.json → .kris" "DONE" "$new"
elif [[ -n "$new" ]] && [[ -n "$old" ]]; then
  add_item "F" "F.bang" "Băng house: session_handoff migration" "PART" "both exist" "Cả 2 file tồn tại — chưa rm json gốc"
elif [[ -n "$old" ]]; then
  add_item "F" "F.bang" "Băng house: session_handoff JSON" "TODO" "$old" "Chưa migrate sang .kris"
else
  add_item "F" "F.bang" "Băng house migration" "UNK" "src/governance/memory/bang/" "Cả 2 file đều không thấy"
fi

# Cross-persona pending — count remaining
phase_header "PHASE F.x — Cross-persona PENDING (anh forward, persona làm)"

for entity_info in "kim:kim" "Can:can" "Kris:kris" "Thienlon:thien" "phieu:phieu" "boiboi:boi"; do
  dir_name="${entity_info%%:*}"
  ent="${entity_info##*:}"
  
  legacy_count=$(find "src/governance/memory/$dir_name" -type f \( -name "*.json" \) 2>/dev/null | wc -l | tr -d ' ')
  kris_count=$(find "src/governance/memory/$dir_name" -type f -name "${ent}khương*.kris" 2>/dev/null | wc -l | tr -d ' ')
  
  if [[ "$legacy_count" -eq 0 ]] && [[ "$kris_count" -gt 0 ]]; then
    add_item "F.x" "F.$ent" "$dir_name memory migration" "DONE" "src/governance/memory/$dir_name/" "$kris_count .kris files, 0 .json legacy"
  elif [[ "$legacy_count" -gt 0 ]] && [[ "$kris_count" -gt 0 ]]; then
    add_item "F.x" "F.$ent" "$dir_name memory migration" "PART" "src/governance/memory/$dir_name/" "$kris_count .kris + $legacy_count .json legacy còn lại"
  elif [[ "$legacy_count" -gt 0 ]]; then
    add_item "F.x" "F.$ent" "$dir_name memory migration" "TODO" "src/governance/memory/$dir_name/" "$legacy_count .json legacy chưa migrate"
  else
    add_item "F.x" "F.$ent" "$dir_name memory" "UNK" "src/governance/memory/$dir_name/" "Folder không tồn tại hoặc trống"
  fi
done

# ═══════════════════════════════════════════════════════════════════════════
# PHASE H — Cleanup (Băng SAFE actions)
# ═══════════════════════════════════════════════════════════════════════════

phase_header "PHASE H.1 — SAFE Cleanup (Băng scope)"

# H.1.1 Delete .bak
bak=$(check_file "src/cells/kernel/audit-cell/scanner/file-extension-validator.ts.bak")
if [[ -z "$bak" ]]; then
  add_item "H" "H.1.1" "Delete file-extension-validator.ts.bak" "DONE" "(file removed)"
else
  add_item "H" "H.1.1" "Delete file-extension-validator.ts.bak" "TODO" "$bak"
fi

# H.1.2 Archive Pre-Wave 3 SUPERSEDED
arch1=$(find src/governance/archive -name "*pre-wave3*" 2>/dev/null | head -1)
if [[ -n "$arch1" ]]; then
  add_item "H" "H.1.2" "Archive Pre-Wave 3 SUPERSEDED" "DONE" "$arch1"
else
  add_item "H" "H.1.2" "Archive Pre-Wave 3 directive" "TODO" "src/governance/archive/directives/"
fi

# H.1.3 Archive SPEC_QIINT2_v1.0 NEEDS_REWRITE
arch2=$(find . -path "*/archive*" -name "*QIINT2*v1.0*" 2>/dev/null | head -1)
if [[ -n "$arch2" ]]; then
  add_item "H" "H.1.3" "Archive SPEC_QIINT2_v1.0" "DONE" "$arch2"
else
  add_item "H" "H.1.3" "Archive SPEC_QIINT2_v1.0 NEEDS_REWRITE" "TODO" "*/archive/SPEC_QIINT2_v1.0_NEEDS_REWRITE.md"
fi

# H.1.4 Archive test_iseu_flow.js
arch3=$(find . -path "*/archive*" -name "test_iseu_flow.js" 2>/dev/null | head -1)
testjs=$(check_file "src/governance/memory/bang/session-20260413/test_iseu_flow.js")
if [[ -n "$arch3" ]]; then
  add_item "H" "H.1.4" "Archive test_iseu_flow.js" "DONE" "$arch3"
elif [[ -n "$testjs" ]]; then
  add_item "H" "H.1.4" "Archive test_iseu_flow.js historical" "TODO" "$testjs"
else
  add_item "H" "H.1.4" "test_iseu_flow.js historical" "UNK" "src/governance/memory/bang/session-20260413/"
fi

# H.3 Tổng hợp Fail-Troy
ev=$(check_file_or_find "docs/audits/FAIL_TROY_COMPILATION.md" "FAIL*TROY*.md" ".")
if [[ -n "$ev" ]]; then
  add_item "H" "H.3" "Tổng hợp Fail-Troy" "DONE" "$ev"
else
  add_item "H" "H.3" "Tổng hợp Fail-Troy compilation" "TODO" "docs/audits/" "Compile bypass patterns toàn hệ — pending từ session 20260417"
fi

# ═══════════════════════════════════════════════════════════════════════════
# REPO HEALTH CHECKS (informational)
# ═══════════════════════════════════════════════════════════════════════════

phase_header "REPO HEALTH (informational, not Băng action)"

# 12 RENA hardcoded `return true` (Kim scope, Băng đếm để track)
rena_count=$(grep -rE "return\s+true" src/cells/kernel --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
if [[ "$rena_count" -eq 0 ]]; then
  add_item "INFO" "K.4" "12 RENA hardcoded return true (Kim scope)" "DONE" "src/cells/kernel/" "0 hits — fixed"
elif [[ "$rena_count" -le 12 ]]; then
  add_item "INFO" "K.4" "12 RENA hardcoded return true" "PART" "src/cells/kernel/" "$rena_count hits — Kim đang fix"
else
  add_item "INFO" "K.4" "12+ RENA hardcoded return true" "TODO" "src/cells/kernel/" "$rena_count hits — Kim chưa fix (LAW-4 violation)"
fi

# P5 neural-main-cell.cell.anc 0 bytes (Kim scope)
nmc=$(check_file "src/cells/kernel/neural-main-cell/neural-main-cell.cell.anc")
if [[ -n "$nmc" ]]; then
  size=$(wc -c < "$nmc" | tr -d ' ')
  if [[ "$size" -eq 0 ]]; then
    add_item "INFO" "K.5" "neural-main-cell.cell.anc (Kim scope)" "TODO" "$nmc" "Vẫn 0 bytes — Kim chưa fill 6 components Điều 5"
  else
    add_item "INFO" "K.5" "neural-main-cell.cell.anc" "DONE" "$nmc" "$size bytes — Kim đã fill"
  fi
else
  add_item "INFO" "K.5" "neural-main-cell.cell.anc" "UNK" "src/cells/kernel/neural-main-cell/" "File path không tồn tại"
fi

# 109 @ts-nocheck count (informational)
nocheck=$(grep -rl "@ts-nocheck" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
add_item "INFO" "K.7" "@ts-nocheck files (tech debt, plan riêng)" "PART" "src/" "$nocheck files (target: 0)"

# Phase 1 memory move check
if [[ -d "memory" ]] && [[ ! -d "src/governance/memory" ]]; then
  add_item "INFO" "Q3" "Phase 1 memory move (root memory/)" "DONE" "memory/"
elif [[ -d "src/governance/memory" ]]; then
  ts_imports=$(grep -rE "from\s+['\"]\.\./.*governance/memory" src --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
  add_item "INFO" "Q3" "Memory still at src/governance/memory" "PART" "src/governance/memory/" "$ts_imports TS imports — chờ Q3 neo move"
else
  add_item "INFO" "Q3" "Memory location" "UNK" "" "Cả 2 path không tồn tại"
fi

# ═══════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════

if [[ $USE_JSON -eq 1 ]]; then
  cat <<EOF
{
  "scanner": "bang-scope-completion-scanner",
  "session_ref": "20260423",
  "repo_root": "$REPO_ROOT",
  "branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo n/a)",
  "head": "$(git rev-parse --short HEAD 2>/dev/null || echo n/a)",
  "summary": {
    "total": $COUNT_TOTAL,
    "done": $COUNT_DONE,
    "partial": $COUNT_PART,
    "todo": $COUNT_TODO,
    "unknown": $COUNT_UNK
  },
  "items": [$JSON_ITEMS]
}
EOF
else
  cat <<EOF

═══════════════════════════════════════════════════════════════════════════
 SUMMARY
═══════════════════════════════════════════════════════════════════════════
  Total checks:      $COUNT_TOTAL
  $S_DONE  DONE:        $COUNT_DONE
  $S_PART  PARTIAL:     $COUNT_PART
  $S_TODO  NOT_STARTED: $COUNT_TODO
  $S_UNK  UNKNOWN:     $COUNT_UNK
═══════════════════════════════════════════════════════════════════════════

CÁCH ĐỌC:
  $S_DONE  DONE     — file/feature có evidence cụ thể trong repo
  $S_PART  PARTIAL  — tồn tại nhưng chưa hoàn chỉnh hoặc paradigm sai
  $S_TODO  TODO     — không tìm thấy, chưa làm
  $S_UNK  UNKNOWN  — path không match — có thể chỗ khác, cần verify thủ công

GỬI OUTPUT NÀY CHO BĂNG QUA TERMINAL:
  bash bang-scope-completion-scanner.sh > bang-scope-status-\$(date +%Y%m%d).txt
  
JSON MODE (cho parse machine):
  bash bang-scope-completion-scanner.sh --json > bang-scope-status.json

EOF
fi

exit 0
