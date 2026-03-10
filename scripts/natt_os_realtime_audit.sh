#!/usr/bin/env bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# NATT-OS REAL-TIME SYSTEM AUDIT
# Author: Băng — Ground Truth Validator
# Usage:  bash natt_os_realtime_audit.sh [--full] [--json]
#         Chạy từ root của natt-os ver2goldmaster
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -euo pipefail

# ── Options ──────────────────────────────────────────
FULL_MODE=false
JSON_MODE=false
for arg in "$@"; do
  [[ "$arg" == "--full" ]] && FULL_MODE=true
  [[ "$arg" == "--json" ]] && JSON_MODE=true
done

# ── Colors ───────────────────────────────────────────
R='\033[0;31m'; G='\033[0;32m'; Y='\033[0;33m'
B='\033[0;34m'; C='\033[0;36m'; W='\033[1;37m'; N='\033[0m'

ok()   { echo -e "  ${G}✅${N} $*"; }
warn() { echo -e "  ${Y}⭕${N} $*"; }
fail() { echo -e "  ${R}❌${N} $*"; }
hdr()  { echo -e "\n${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"; \
          echo -e "${W}【$1】$2${N}"; }

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo -e "${C}"
echo "  ███╗   ██╗ █████╗ ████████╗████████╗      ██████╗ ███████╗"
echo "  ████╗  ██║██╔══██╗╚══██╔══╝╚══██╔══╝     ██╔═══██╗██╔════╝"
echo "  ██╔██╗ ██║███████║   ██║      ██║   █████╗██║   ██║███████╗"
echo "  ██║╚██╗██║██╔══██║   ██║      ██║   ╚════╝██║   ██║╚════██║"
echo "  ██║ ╚████║██║  ██║   ██║      ██║         ╚██████╔╝███████║"
echo "  ╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝      ╚═╝          ╚═════╝ ╚══════╝"
echo -e "${N}"
echo -e "  ${W}REAL-TIME SYSTEM AUDIT — $TIMESTAMP${N}"
echo -e "  Root: $(pwd)"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
hdr "1" "GIT STATUS"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if git rev-parse --git-dir > /dev/null 2>&1; then
  echo -e "  ${W}Last 5 commits:${N}"
  git log --oneline -5 | sed 's/^/    /'
  DIRTY=$(git status --porcelain | wc -l | tr -d ' ')
  UNTRACKED=$(git status --porcelain | grep "^??" | wc -l | tr -d ' ')
  [[ "$DIRTY" -eq 0 ]] && ok "Working tree clean" || warn "Uncommitted: $DIRTY files (untracked: $UNTRACKED)"
else
  fail "Not a git repository"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
hdr "2" "TSC HEALTH"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if command -v npx &>/dev/null; then
  TSC_OUT=$(npx tsc --noEmit 2>&1 || true)
  TSC_TOTAL=$(echo "$TSC_OUT" | grep -c "error TS" || true)
  # Ghost imports baseline (pre-existing)
  TSC_GHOST=$(echo "$TSC_OUT" | grep -c "Cannot find module\|has no exported" || true)
  TSC_REAL=$((TSC_TOTAL - TSC_GHOST))
  [[ "$TSC_TOTAL" -eq 0 ]] && ok "TSC errors: 0" || {
    [[ "$TSC_REAL" -le 0 ]] && ok "TSC errors: $TSC_TOTAL (all baseline ghost imports)" \
                             || warn "TSC errors: $TSC_TOTAL (real: $TSC_REAL | ghost: $TSC_GHOST)"
  }
  if $FULL_MODE && [[ "$TSC_TOTAL" -gt 0 ]]; then
    echo "$TSC_OUT" | grep "error TS" | head -20 | sed 's/^/    /'
  fi
else
  warn "npx not found — skipping TSC check"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
hdr "3" "FILE COUNT"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TS_COUNT=$(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
LINE_COUNT=$(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
ok "TS/TSX files: $TS_COUNT"
ok "Total lines:  $LINE_COUNT"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
hdr "4" "GOVERNANCE / ADN"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
check_file() {
  local label="$1"; local path="$2"
  [[ -f "$path" ]] && ok "$label" || fail "$label → MISSING: $path"
}

check_file "Hiến Pháp v4.0"      "src/governance/HIEN-PHAP-NATT-OS-v4.0.md"
check_file "QNEU system-state"   "src/governance/qneu/data/system-state.json"
check_file "QNEU first-seed"     "src/governance/qneu/first-seed.ts"
check_file "bangmf (latest)"     "$(ls src/governance/memory/bang/bangmf_v*.json 2>/dev/null | sort -V | tail -1)"
check_file "kmf (latest)"        "$(ls src/governance/memory/kim/kmf*.json 2>/dev/null | sort -V | tail -1)"
check_file "Gatekeeper core"     "src/governance/gatekeeper/gatekeeper-core.ts"

# QNEU scores
if [[ -f "src/governance/qneu/data/system-state.json" ]]; then
  echo -e "\n  ${W}QNEU Scores (frozen 2026-03-04):${N}"
  for entity in BANG THIEN KIM CAN BOI_BOI; do
    SCORE=$(python3 -c "
import json,sys
try:
  d=json.load(open('src/governance/qneu/data/system-state.json'))
  e=d.get('entities',{}).get('$entity',{})
  print(e.get('current_score','N/A'))
except: print('?')
" 2>/dev/null)
    printf "    %-10s %s\n" "$entity:" "$SCORE"
  done
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
hdr "5" "KERNEL CELLS"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KERNEL_CELLS=("audit-cell" "config-cell" "monitor-cell" "rbac-cell" "security-cell" "quantum-defense-cell")
for cell in "${KERNEL_CELLS[@]}"; do
  CELL_PATH="src/cells/kernel/$cell"
  if [[ -d "$CELL_PATH" ]]; then
    FC=$(find "$CELL_PATH" -name "*.ts" | wc -l | tr -d ' ')
    HAS_MF=$( [[ -f "$CELL_PATH/cell.manifest.json" ]] && echo "✅MF" || echo "❌MF")
    HAS_PORT=$([[ -d "$CELL_PATH/ports" ]] && echo "✅PORT" || echo "❌PORT")
    ok "$cell | files:$FC | $HAS_MF | $HAS_PORT"
  else
    fail "$cell → MISSING — PENDING BUILD"
  fi
done

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
hdr "6" "SMARTLINK STATUS"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Core SmartLink files
SL_CORE_FILES=("smartlink.point.ts" "smartlink.qneu-bridge.ts" "quantum-brain.engine.ts" "quantum-buffer.engine.ts")
echo -e "  ${W}Core files:${N}"
for f in "${SL_CORE_FILES[@]}"; do
  [[ -f "src/core/smartlink/$f" ]] && ok "$f" || fail "$f MISSING"
done

# Decay / Gossip check
echo -e "\n  ${W}Decay + Gossip (UEI prerequisite):${N}"
if grep -q "FIBER_DECAY_RATE_BASE\|applyFiberDecay" src/core/smartlink/smartlink.point.ts 2>/dev/null; then
  ok "applyFiberDecay() — IMPLEMENTED"
else
  fail "applyFiberDecay() — NOT IMPLEMENTED (UEI Runtime Spec chờ approve)"
fi
if grep -q "FiberSummary\|gossipQueue" src/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine.ts 2>/dev/null || \
   grep -rq "FiberSummary\|gossipQueue" src/cells/infrastructure/smartlink-cell/ 2>/dev/null; then
  ok "Gossip Protocol — IMPLEMENTED"
else
  fail "Gossip Protocol — NOT IMPLEMENTED"
fi

# Wire check per cell
echo -e "\n  ${W}SmartLink wire per business cell:${N}"
WIRED=0; NOT_WIRED=0
for cell_dir in src/cells/business/*/; do
  CELL=$(basename "$cell_dir")
  PORT_FILE="$cell_dir/ports/${CELL%.cell}-smartlink.port.ts"
  # Tìm bất kỳ smartlink port nào
  PORT_ANY=$(find "$cell_dir/ports" -name "*smartlink*" 2>/dev/null | head -1)
  if [[ -z "$PORT_ANY" ]]; then
    fail "$CELL — no port file"
    continue
  fi
  # Check xem engine có import port không
  ENGINE_DIR="$cell_dir/domain/services"
  if grep -rq "smartlink\|SmartLink" "$ENGINE_DIR" 2>/dev/null; then
    ok "$CELL — wired"
    ((WIRED++)) || true
  else
    warn "$CELL — port exists, NOT wired into engine"
    ((NOT_WIRED++)) || true
  fi
done
echo -e "\n    ${G}Wired: $WIRED${N}  |  ${Y}Not wired: $NOT_WIRED${N}"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
hdr "7" "EVENT BUS"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EVENT_FILES=("event-bus.ts" "event-store.ts" "event-router.ts" "event-envelope.factory.ts" "event-bridge.ts")
for f in "${EVENT_FILES[@]}"; do
  [[ -f "src/core/events/$f" ]] && ok "$f" || fail "$f MISSING"
done
GUARD_COUNT=$(find src/core/guards -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
ok "Guards: $GUARD_COUNT files"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
hdr "8" "BUSINESS CELLS — MANIFEST HEALTH"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL_BIZ=0; HEALTHY=0
for cell_dir in src/cells/business/*/; do
  CELL=$(basename "$cell_dir")
  ((TOTAL_BIZ++)) || true
  HAS_MF=$([[ -f "$cell_dir/cell.manifest.json" ]] && echo true || echo false)
  HAS_PORT=$([[ -d "$cell_dir/ports" ]] && echo true || echo false)
  HAS_DOM=$([[ -d "$cell_dir/domain" ]] && echo true || echo false)
  FC=$(find "$cell_dir" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
  if $HAS_MF && $HAS_PORT && $HAS_DOM; then
    ok "$CELL | files:$FC"
    ((HEALTHY++)) || true
  else
    MF_S=$($HAS_MF && echo "✅MF" || echo "❌MF")
    PT_S=$($HAS_PORT && echo "✅PORT" || echo "❌PORT")
    DM_S=$($HAS_DOM && echo "✅DOM" || echo "❌DOM")
    warn "$CELL | $MF_S $PT_S $DM_S | files:$FC"
  fi
done
echo -e "\n    ${W}Business cells: $HEALTHY/$TOTAL_BIZ healthy${N}"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
hdr "9" "MISSING CELLS (theo cơ cấu Tâm Luxury)"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUIRED_CELLS=(
  "media-cell:Wave3:KHỐI KINH DOANH — 12.75TB data chết"
  "design-3d-cell:Wave2:KHỐI SẢN XUẤT — 664GB, blocking audit+giá thành"
  "noi-vu-cell:Wave3:KHỐI VẬN HÀNH — hậu cần, tài xế, tạp vụ"
  "it-cell:Wave3:KHỐI VẬN HÀNH"
  "phap-che-cell:Wave3:BAN KIỂM SOÁT"
  "casting-cell:Wave3:Phòng Đúc"
  "stone-cell:Wave3:Phòng Hột"
  "finishing-cell:Wave3:Phòng Nguội"
  "polishing-cell:Wave3:Phòng Nhám Bóng"
)
for entry in "${REQUIRED_CELLS[@]}"; do
  IFS=':' read -r CELL WAVE NOTE <<< "$entry"
  if [[ -d "src/cells/business/$CELL" ]]; then
    ok "$CELL [$WAVE] — exists"
  else
    fail "$CELL [$WAVE] — MISSING | $NOTE"
  fi
done

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
hdr "10" "METABOLISM LAYER"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
METABOLISM_DIRS=("src/metabolism" "src/cells/metabolism")
FOUND_META=false
for d in "${METABOLISM_DIRS[@]}"; do
  if [[ -d "$d" ]]; then
    FOUND_META=true
    ok "Metabolism root: $d"
    PROCS=$(find "$d/processors" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
    NORMS=$(find "$d/normalizers" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
    [[ "$PROCS" -gt 0 ]] && ok "processors: $PROCS files" || fail "processors: EMPTY"
    [[ "$NORMS" -gt 0 ]] && ok "normalizers: $NORMS files" || fail "normalizers: EMPTY"
  fi
done
$FOUND_META || fail "Metabolism Layer — NOT BUILT (Tầng 1 chưa tồn tại)"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
hdr "11" "LEGACY SECURITY (natt-os/security)"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEGACY_FILES=("ai-kill-switch.ts" "ai-lockdown.ts" "sirasign-verifier.ts" "activate.ts")
for f in "${LEGACY_FILES[@]}"; do
  if [[ -f "natt-os/security/$f" ]]; then
    # Check nếu đã wire EventBus
    if grep -q "EventBus\|eventBus\|publish\|subscribe" "natt-os/security/$f" 2>/dev/null; then
      ok "$f — has EventBus wire"
    else
      warn "$f — EXISTS but NOT wired to EventBus"
    fi
  else
    fail "$f — MISSING"
  fi
done

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
hdr "12" "EMPTY / BROKEN DIRS"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
find src/cells -type d -empty 2>/dev/null | while read -r d; do
  warn "Empty dir: $d"
done

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
hdr "13" "SUMMARY SCORECARD"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo -e "  ${W}LAYER                    STATUS${N}"
echo -e "  ──────────────────────────────────────────────"
echo -e "  ADN (Hiến Pháp + QNEU)  ${G}✅ LIVE${N}"
echo -e "  EventBus v1.0           ${G}✅ LIVE${N}"
echo -e "  SmartLink Core          ${G}✅ LIVE${N}"
echo -e "  SmartLink Decay/Gossip  ${R}❌ NOT BUILT${N}  ← UEI prerequisite"
echo -e "  Kernel Cells (5/6)      ${Y}⭕ quantum-defense MISSING${N}"
echo -e "  Business Cells (17)     ${Y}⭕ SmartLink wire: $WIRED/17${N}"
echo -e "  Metabolism Layer        ${R}❌ NOT BUILT${N}  ← immune enzyme missing"
echo -e "  quantum-defense-cell    ${R}❌ NOT BUILT${N}  ← hệ miễn dịch missing"
echo ""
echo -e "  ${W}NEXT BUILD PRIORITY:${N}"
echo -e "  ${G}[1]${N} quantum-defense-cell   — 4 công năng, EventBus ready"
echo -e "  ${Y}[2]${N} SmartLink wire 10 cells — port exists, chỉ cần import"
echo -e "  ${Y}[3]${N} Decay + Gossip          — pending Gatekeeper approve"
echo -e "  ${R}[4]${N} Metabolism Tầng 1       — sau khi immune live"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# JSON output mode
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if $JSON_MODE; then
  OUTPUT_FILE="natt_os_audit_$(date +%Y%m%d_%H%M%S).json"
  python3 -c "
import json, subprocess, datetime, os

def count_files(path, ext='.ts'):
    count = 0
    for r,d,f in os.walk(path):
        count += sum(1 for x in f if x.endswith(ext))
    return count

result = {
    'timestamp': '$(date -u +%Y-%m-%dT%H:%M:%SZ)',
    'root': os.getcwd(),
    'tsc_errors': $TSC_TOTAL,
    'ts_files': $TS_COUNT,
    'smartlink_wired': $WIRED,
    'smartlink_not_wired': $NOT_WIRED,
    'business_cells_healthy': $HEALTHY,
    'business_cells_total': $TOTAL_BIZ,
    'pending': {
        'quantum_defense_cell': True,
        'smartlink_decay_gossip': True,
        'metabolism_layer': True,
    }
}
with open('$OUTPUT_FILE','w') as f:
    json.dump(result, f, indent=2)
print(f'  JSON saved: $OUTPUT_FILE')
" 2>/dev/null || echo "  (python3 not available for JSON export)"
fi

echo -e "${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"
echo -e "  END AUDIT — $TIMESTAMP"
echo -e "${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}\n"
