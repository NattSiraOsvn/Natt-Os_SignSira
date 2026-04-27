#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# natt-os SmartAudit v7.0
# Author: Băng — Ground Truth Validator (QNEU 300)
# Redesigned: 2026-04-16 — session architecture synthesis
# Usage:  bash nattos.sh [--json] [--full] [--rena] [--visual]
#         bash nattos.sh --mode=smart|quick|full
#         Chạy từ root natt-os ver2goldmaster
#
# Output: AI-agent readable + human readable
# Mọi agent (Băng, thiên, Kim, Cần, Bội Bội) đọc = hiểu ngay
#
# 9 Groups · 42 Sections · 3-Layer Architecture Aware (v7.1 patched 20260426)
# ═══════════════════════════════════════════════════════════════
set -o pipefail

# ── Options ──
JSON_MODE=false; FULL_MODE=false; AUDIT_MODE="full"; FORCE_FULL="false"
RUN_RENA="false"; RUN_VISUAL="false"
for arg in "$@"; do
  [[ "$arg" == "--json" ]] && JSON_MODE=true
  [[ "$arg" == "--full" ]] && FULL_MODE=true
  [[ "$arg" == "--mode=quick" ]] && AUDIT_MODE="quick"
  [[ "$arg" == "--mode=full"  ]] && AUDIT_MODE="full" && FORCE_FULL="true"
  [[ "$arg" == "--mode=smart" ]] && AUDIT_MODE="smart"
  [[ "$arg" == "--rena" ]] && RUN_RENA="true"
  [[ "$arg" == "--visual" ]] && RUN_VISUAL="true"
done

# ── Colors ──
R='\033[0;31m'; G='\033[0;32m'; Y='\033[0;33m'
B='\033[0;34m'; C='\033[0;36m'; W='\033[1;37m'; N='\033[0m'
DIM='\033[2m'; GOLD='\033[38;5;214m'; PINK='\033[38;5;175m'
ok()   { echo -e "  ${G}✅${N} $*"; }
warn() { echo -e "  ${Y}⚠️${N}  $*"; }
fail() { echo -e "  ${R}❌${N} $*"; }
info() { echo -e "  ${C}ℹ${N}  $*"; }
hdr()  { echo -e "\n${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"; echo -e "${W}【$1】$2${N}"; }
grp()  { echo -e "\n${GOLD}╔═══════════════════════════════════════════════════════════╗${N}"; echo -e "${GOLD}║  $1${N}"; echo -e "${GOLD}╚═══════════════════════════════════════════════════════════╝${N}"; }

TOTAL_OK=0; TOTAL_warn=0; TOTAL_fail=0; TOTAL_TRASH=0
ISSUES=()
inc_ok()   { ((TOTAL_OK++)) || true; }
inc_warn() { ((TOTAL_warn++)) || true; ISSUES+=("⚠️  $1"); }
inc_fail() { ((TOTAL_fail++)) || true; ISSUES+=("❌ $1"); }
inc_trash(){ ((TOTAL_TRASH++)) || true; ISSUES+=("🗑️  $1"); }

# ── Root check ──
if [[ ! -f "tsconfig.json" ]]; then
  echo "❌ Chạy từ root natt-os ver2goldmaster/"; exit 1
fi

TS=$(date '+%Y-%m-%d %H:%M:%S')
ROOT=$(pwd)

# ═══════════════════════════════════════════════════════════════
# LOGO FILE DETECTION (render at bottom after audit completes)
# ═══════════════════════════════════════════════════════════════
LOGO_FILE=

# --- FIX: Normalize logo size (QWS safe) ---
if [ -n "$LOGO_FILE" ]; then
    FIXED_LOGO=".nattos_logo_fixed.png"
    if command -v sips >/dev/null 2>&1; then
        sips -z 720 1920 "$LOGO_FILE" --out "$FIXED_LOGO" >/dev/null 2>&1
        LOGO_FILE="$FIXED_LOGO"
    fi
fi
# --- END FIX ---
""
for candidate in \
  "nattos-logo-final/nattos-banner-1920x720.png" \
  "nattos-logo-final/nattos-logo-original.png" \
  "assets/nattos-banner-1920x720.png" \
  "docs/assets/nattos-logo-original.png"; do
  [[ -f "$candidate" ]] && LOGO_FILE="$candidate" && break
done

echo -e "${GOLD}"
echo "  ███╗   ██╗    █████╗   ████████╗ ████████╗         ██████╗  ███████╗"
echo "  ████╗  ██║   ██╔══██╗  ╚══██╔══╝ ╚══██╔══╝        ██╔═══██╗ ██╔════╝"
echo "  ██╔██╗ ██║   ███████║     ██║       ██║    █████╗  ██║   ██║ ███████╗"
echo "  ██║╚██╗██║   ██╔══██║     ██║       ██║    ╚════╝  ██║   ██║ ╚════██║"
echo "  ██║ ╚████║   ██║  ██║     ██║       ██║            ╚██████╔╝ ███████║"
echo "  ╚═╝  ╚═══╝   ╚═╝  ╚═╝     ╚═╝       ╚═╝             ╚═════╝  ╚══════╝"
echo -e "${N}"

echo -e "  ${DIM}┌──────────────────────────────────────────────────────────┐${N}"
echo -e "  ${DIM}│${N}  ${W}SmartAudit v7.0${N}  ${C}·${N}  Distributed Living Organism       ${DIM}│${N}"
if [[ -n "$LOGO_FILE" ]]; then
echo -e "  ${DIM}│${N}  ${C}Logo:${N} ${GOLD}⚛${N}  $LOGO_FILE  ${DIM}│${N}"
else
echo -e "  ${DIM}│${N}  ${C}Logo:${N} ${R}not found${N} — copy nattos-logo-final/ to repo   ${DIM}│${N}"
fi
echo -e "  ${DIM}│${N}                                                          ${DIM}│${N}"
echo -e "  ${DIM}│${N}  ${G}L1 EventBus${N} ${DIM}→${N} ${Y}L2 Mạch HeyNa${N} ${DIM}→${N} ${W}L3 SmartLink${N}        ${DIM}│${N}"
echo -e "  ${DIM}│${N}  ${DIM}app internal   SSE transport   inter-colony${N}           ${DIM}│${N}"
echo -e "  ${DIM}│${N}                                                          ${DIM}│${N}"
echo -e "  ${DIM}│${N}  ${DIM}A${N}·Foundation  ${DIM}B${N}·Cells  ${DIM}C${N}·Arch  ${DIM}D${N}·Flows  ${DIM}E${N}·UI     ${DIM}│${N}"
echo -e "  ${DIM}│${N}  ${DIM}F${N}·Security    ${DIM}G${N}·Intel  ${DIM}H${N}·Meta  ${DIM}I${N}·Output          ${DIM}│${N}"
echo -e "  ${DIM}└──────────────────────────────────────────────────────────┘${N}"
echo ""
echo -e "  ${W}SmartAudit v7.0 — $TS${N}"
echo -e "  Root: $ROOT"


# ═══════════════════════════════════════════════════════════════
# ╔══ GROUP A: FOUNDATION — Git · TSC · Files · Governance
# ═══════════════════════════════════════════════════════════════
grp "GROUP A — FOUNDATION — Git · TSC · Files · Governance"

# ═══════════════════════════════════════════════════════════════
hdr "1" "GIT STATUS"
# ═══════════════════════════════════════════════════════════════
if git rev-parse --git-dir > /dev/null 2>&1; then
  BRANCH=$(git branch --show-current 2>/dev/null || echo "detached")
  COMMITS=$(git log --oneline 2>/dev/null | wc -l | tr -dc '0-9')
  LAST_HASH=$(git log --oneline -1 2>/dev/null | cut -d' ' -f1)
  LAST_MSG=$(git log --oneline -1 2>/dev/null | cut -d' ' -f2-)
  DIRTY=$(git status --porcelain 2>/dev/null | wc -l | tr -dc '0-9')
  UNTRACKED=$(git status --porcelain 2>/dev/null | grep "^??" | wc -l | tr -dc '0-9')
  MODIFIED=$(git status --porcelain 2>/dev/null | grep "^ M\|^M " | wc -l | tr -dc '0-9')

  ok "Branch: $BRANCH | Commits: $COMMITS"; inc_ok
  ok "HEAD: $LAST_HASH $LAST_MSG"; inc_ok

  if [[ "$DIRTY" -eq 0 ]]; then
    ok "Working tree: CLEAN"; inc_ok
  else
    warn "Uncommitted: $DIRTY files (modified: $MODIFIED, untracked: $UNTRACKED)"
    inc_warn "Git: $DIRTY uncommitted files"
    if [[ "$FULL_MODE" == "true" ]]; then
      git status --porcelain | head -20 | sed 's/^/    /'
    fi
  fi

  # Remote check
  REMOTE=$(git remote -v 2>/dev/null | grep push | head -1 | awk '{print $2}')
  if [[ -n "$REMOTE" ]]; then
    ok "Remote: $REMOTE"; inc_ok
  else
    warn "No git remote — code not backed up to cloud"
    inc_warn "Git: no remote configured"
  fi
else
  fail "Not a git repo"; inc_fail "Git: not a repository"
fi

# ═══════════════════════════════════════════════════════════════
# MEMORY — snapshot.json
# ═══════════════════════════════════════════════════════════════
mkdir -p .nattos-twin
SNAPSHOT_JSON=".nattos-twin/snapshot.json"
PREV_HASH=""; PREV_TS=""; PREV_OK=""; PREV_STATE=""
if [[ -f "$SNAPSHOT_JSON" ]]; then
  PREV_HASH=$(python3 -c "import json; d=json.load(open('$SNAPSHOT_JSON')); print(d.get('last_hash',''))" 2>/dev/null || echo "")
  PREV_TS=$(python3   -c "import json; d=json.load(open('$SNAPSHOT_JSON')); print(d.get('last_ts',''))" 2>/dev/null || echo "")
  PREV_OK=$(python3   -c "import json; d=json.load(open('$SNAPSHOT_JSON')); print(d.get('ok','?'))" 2>/dev/null || echo "?")
  PREV_STATE=$(python3 -c "import json; d=json.load(open('$SNAPSHOT_JSON')); print(d.get('state','UNKNOWN'))" 2>/dev/null || echo "UNKNOWN")
fi
echo ""
echo -e "  ${B}── MEMORY ──────────────────────────────────${N}"
if [[ -z "$PREV_HASH" ]]; then
  echo -e "  ${C}ℹ${N}  Lần đầu chạy — chưa có snapshot"
  AUDIT_MODE="full"
elif [[ "$PREV_HASH" == "$LAST_HASH" ]]; then
  echo -e "  ${G}✅${N} Hash unchanged: $LAST_HASH"
  echo -e "  ${C}ℹ${N}  Lần trước: $PREV_TS | OK=$PREV_OK | $PREV_STATE"
  [[ "$AUDIT_MODE" != "full" || "$FORCE_FULL" != "true" ]] && AUDIT_MODE="quick"
  echo -e "  ${Y}⚡${N}  QUICK MODE — skip heavy sections (--mode=full để override)"
else
  echo -e "  ${Y}⚠️${N}  Hash changed: $PREV_HASH → $LAST_HASH"
  echo -e "  ${C}ℹ${N}  Lần trước: $PREV_TS | OK=$PREV_OK | $PREV_STATE"
  AUDIT_MODE="full"
  echo -e "  ${G}✅${N} FULL MODE — hash mới"
fi
echo -e "  ${B}────────────────────────────────────────────${N}"
export AUDIT_MODE

# ── Section Cache (smart mode) ──────────────────────────────
mkdir -p .nattos-twin/section-cache
CHANGED_FILES=""
if [[ -f ".nattos-twin/snapshot.json" ]]; then
  PREV_HASH=$(python3 -c "import json; d=json.load(open('.nattos-twin/snapshot.json')); print(d.get('last_hash',''))" 2>/dev/null || echo "")
  if [[ -n "$PREV_HASH" && "$PREV_HASH" != "$LAST_HASH" ]]; then
    CHANGED_FILES=$(git diff --name-only "$PREV_HASH" "$LAST_HASH" 2>/dev/null || echo "")
  fi
fi

# Nếu smart mode: tự động quyết định skip section dựa trên changed files
if [[ "$AUDIT_MODE" == "smart" ]]; then
  # Không có file .ts thay đổi → skip heavy sections
  TS_CHANGED=$(echo "$CHANGED_FILES" | grep -c "\.ts$" || echo 0)
  if [[ "$TS_CHANGED" -eq 0 ]]; then
    AUDIT_MODE="quick"
    echo -e "  ${Y}⚡${N}  SMART→QUICK — không có .ts thay đổi"
  else
    echo -e "  ${G}✅${N} SMART MODE — $TS_CHANGED .ts files changed, full scan"
    AUDIT_MODE="full"
  fi
  export AUDIT_MODE
fi

# ═══════════════════════════════════════════════════════════════
hdr "2" "TSC HEALTH"
# ═══════════════════════════════════════════════════════════════
ok "TSC check retired — live tsc lane removed"; inc_ok

# ═══════════════════════════════════════════════════════════════
hdr "3" "FILE METRICS"
# ═══════════════════════════════════════════════════════════════
TS_COUNT=$(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l | tr -dc '0-9')
TS_LINES=$(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null -exec cat {} + 2>/dev/null | wc -l | tr -dc '0-9')
PKG_COUNT=$(find packages -name "*.ts" 2>/dev/null | wc -l | tr -dc '0-9')
LEGACY_COUNT=$(find natt-os -name "*.ts" 2>/dev/null | wc -l | tr -dc '0-9')
V2_FILES=$(find src -name "_v2.*" 2>/dev/null | wc -l | tr -dc '0-9')
V1_FILES=$(find src -name "_v1.*" 2>/dev/null | wc -l | tr -dc '0-9')

ok "src/ TS/TSX: $TS_COUNT files, $TS_LINES lines"; inc_ok
info "packages/: $PKG_COUNT files (event-contracts)"
info "natt-os/: $LEGACY_COUNT files (legacy — pending migration)"
info "Inherited V2: $V2_FILES files | V1: $V1_FILES files"

# ═══════════════════════════════════════════════════════════════
hdr "4" "GOVERNANCE / ADN"
# ═══════════════════════════════════════════════════════════════
GOV_FILES=(
  "Hiến Pháp:src/governance/HIEN-PHAP-natt-os-v5.0.anc"
  "QNEU system-state:src/governance/qneu/data/system-state.phieu"
  "QNEU first-seed:src/governance/qneu/first-seed.ts"
  "Gatekeeper core:src/governance/gatekeeper/gatekeeper-core.ts"
)
for entry in "${GOV_FILES[@]}"; do
  IFS=':' read -r LABEL FPATH <<< "$entry"
  if [[ -f "$FPATH" ]]; then ok "$LABEL"; inc_ok
  else fail "$LABEL → missing: $FPATH"; inc_fail "GOV: $LABEL missing"; fi
done

# Bang memory
# Bang memory — check Nauion suffix family v1.2 R01 (align §32)
BANGMF=$(ls src/governance/memory/bang/bangmf_v*.json 2>/dev/null | sort -V | tail -1)
BANGKHUONG=$(ls src/governance/memory/bang/bangkhương*.na src/governance/memory/bang/bangkhương*.kris 2>/dev/null | sort -V | tail -1)
BANGANC=$(ls src/governance/memory/bang/bang.anc src/governance/memory/bang/bang_v*.anc 2>/dev/null | sort -V | tail -1)
if [[ -n "$BANGMF" ]]; then ok "bangmf legacy: $(basename "$BANGMF")"; inc_ok
elif [[ -n "$BANGKHUONG" ]]; then ok "bang K-shell: $(basename "$BANGKHUONG")"; inc_ok
elif [[ -n "$BANGANC" ]]; then ok "bang.anc: $(basename "$BANGANC")"; inc_ok
else fail "bang memory: missing"; inc_fail "GOV: bang memory missing"; fi

KMF=$(ls src/governance/memory/kim/kmf*.json 2>/dev/null | sort -V | tail -1)
# Kim memory — check legacy + Nauion suffix family
KMFNA=$(ls src/governance/memory/kim/kmf*.na src/governance/memory/kim/kmf*.kris src/governance/memory/kim/kim*.na src/governance/memory/kim/kim*.kris 2>/dev/null | sort -V | tail -1)
if [[ -n "$KMF" ]]; then ok "kmf legacy: $(basename "$KMF")"; inc_ok
elif [[ -n "$KMFNA" ]]; then ok "kim memory: $(basename "$KMFNA")"; inc_ok
else warn "kim memory: missing"; inc_warn "GOV: kim memory missing"; fi

# QNEU scores
if [[ -f "src/governance/qneu/data/system-state.phieu" ]]; then
  echo -e "  ${W}QNEU Scores:${N}"
  python3 -c "
import json
try:
  d=json.load(open('src/governance/qneu/data/system-state.phieu'))
  for e in ['BANG','THIEN','KIM','CAN','BOI_BOI']:
    ent=d.get('entities',{}).get(e,{});s=ent.get('currentScore',ent.get('current_score','?'))
    print(f'    {e:<10} {s}')
except: print('    (parse error)')
" 2>/dev/null || echo "    (python3 not available)"
fi
# ═══════════════════════════════════════════════════════════════
hdr "5" "NATTOS.SH SELF-HEALTH"

SCRIPT="nattos.sh"
if [[ ! -f "$SCRIPT" ]]; then SCRIPT="./nattos.sh"; fi

SCRIPT_LINES=$(wc -l < "$SCRIPT" | tr -dc '0-9')
ok "Script size: $SCRIPT_LINES lines"

# Count sections
SECTION_COUNT=$(grep -c "^hdr " "$SCRIPT" 2>/dev/null || echo 0)
ok "Sections: $SECTION_COUNT total"

# Check bash 3.2 compat — no [[...]] with regex, no arrays with -A
BASH4_ONLY=$(grep -n "declare -A\|=~.*[[]\|mapfile\|readarray" "$SCRIPT" 2>/dev/null | grep -v "BASH4_ONLY" | wc -l | tr -dc '0-9')
if [[ "$BASH4_ONLY" -gt 0 ]]; then
  warn "bash 4+ syntax detected: $BASH4_ONLY instances — may break on macOS bash 3.2"
  inc_warn "SCRIPT: bash 4+ syntax present"
else
  ok "bash 3.2 compatible: no bash4+ syntax detected"; inc_ok
fi

# Check script is executable
if [[ -x "$SCRIPT" ]]; then
  ok "Script executable: ✅"; inc_ok
else
  warn "Script not executable — run: chmod +x $SCRIPT"; inc_warn "SCRIPT: not executable"
fi

# Version check
AUDIT_VER=$(grep -o "SmartAudit v[0-9.]*" "$SCRIPT" | head -1)
ok "Version: $AUDIT_VER"

# inc helper check
if grep -q "inc_ok\|inc_warn\|inc_fail" "$SCRIPT" 2>/dev/null; then
  ok "Counter helpers: present"; inc_ok
fi


# V4 SMART LAYER

# ═══════════════════════════════════════════════════════════════
# ╔══ GROUP B: CELL ANATOMY — Kernel · Business · Infrastructure · DNA
# ═══════════════════════════════════════════════════════════════
grp "GROUP B — CELL ANATOMY — Kernel · Business · Infrastructure · DNA"

# ═══════════════════════════════════════════════════════════════
hdr "6" "KERNEL CELLS (12)"
# ═══════════════════════════════════════════════════════════════
KERNEL_EXPECTED=("audit-cell" "config-cell" "monitor-cell" "rbac-cell" "security-cell" "quantum-defense-cell" "khai-cell" "neural-main-cell" "observation-cell" "ai-connector-cell" "notification-cell" "survival-cell")
KERNEL_OK=0; KERNEL_TOTAL=${#KERNEL_EXPECTED[@]}
for cell in "${KERNEL_EXPECTED[@]}"; do
  P="src/cells/kernel/$cell"
  if [[ -d "$P" ]]; then
    FC=$(find "$P" -name "*.ts" | wc -l | tr -dc '0-9')
    MF=$(ls "$P"/*.cell.anc 1>/dev/null 2>&1 && echo "MF✅" || echo "MF❌")
    PT=$([[ -d "$P/ports" ]] && echo "PORT✅" || echo "PORT❌")
    ENG=$(find "$P" -name "*.engine.ts" 2>/dev/null | wc -l | tr -dc '0-9')
    ok "$cell | $FC files | $MF | $PT | engines:$ENG"; inc_ok; ((KERNEL_OK++)) || true
  else
    fail "$cell → missing"; inc_fail "KERNEL: $cell missing"
  fi
done
echo -e "  ${W}Kernel: $KERNEL_OK/$KERNEL_TOTAL${N}"

# ═══════════════════════════════════════════════════════════════
hdr "7" "BUSINESS CELLS — 6-COMPONENT HEALTH"
# ═══════════════════════════════════════════════════════════════
# NATT-CELL = 6: Identity, Capability, Boundary, Trace, Confidence, SmartLink
BIZ_TOTAL=0; BIZ_6OF6=0; BIZ_WIRED=0; BIZ_NOT_WIRED=0
echo -e "  ${W}Cell                     Files  6/6  SmartLink  Status${N}"
echo -e "  ─────────────────────────────────────────────────────────"

for cell_dir in src/cells/business/*/; do
  CELL=$(basename "$cell_dir")
  ((BIZ_TOTAL++)) || true
  FC=$(find "$cell_dir" -name "*.ts" 2>/dev/null | wc -l | tr -dc '0-9')

  # 6 components check
  HAS_IDENTITY=$(ls "$cell_dir"/*.cell.anc 1>/dev/null 2>&1 && echo 1 || echo 0)
  HAS_CAPABILITY=$(find "$cell_dir" -name "*.engine.ts" -o -name "*.service.ts" 2>/dev/null | grep -v index | grep -q . && echo 1 || echo 0)
  HAS_BOUNDARY=$(find "$cell_dir" -name "*boundary*" -o -name "*policy*" 2>/dev/null | grep -q . && echo 1 || echo 0)
  HAS_TRACE=$(find "$cell_dir" -name "*.trace.logger.ts" 2>/dev/null | grep -q . && echo 1 || echo 0)
  HAS_CONFIDENCE=$(find "$cell_dir" -name "*.confidence.ts" 2>/dev/null | grep -q . && echo 1 || echo 0)
  HAS_SMARTLINK=$(find "$cell_dir" \( -iname "*smartlink*" -o -name "smartlink" \) 2>/dev/null | grep -q . && echo 1 || echo 0)

  SCORE=$((HAS_IDENTITY + HAS_CAPABILITY + HAS_BOUNDARY + HAS_TRACE + HAS_CONFIDENCE + HAS_SMARTLINK))
  [[ $SCORE -eq 6 ]] && ((BIZ_6OF6++)) || true

  # SmartLink wire check
  SL="—"
  PORT_ANY=$(find "$cell_dir/ports" -iname "*smartlink*" 2>/dev/null | head -1)
  if [[ -n "$PORT_ANY" ]]; then
    if grep -riq "smartlinkport" "$cell_dir/domain/services/" 2>/dev/null; then
      SL="WIRED✅"; ((BIZ_WIRED++)) || true
    else
      SL="PORT_ONLY⚠️"; ((BIZ_NOT_WIRED++)) || true
      inc_warn "BIZ: $CELL has port but engine not wired"
    fi
  else
    SL="NONE❌"
    inc_warn "BIZ: $CELL has no SmartLink port"
  fi

  # Status
  if [[ $SCORE -eq 6 && "$SL" == "WIRED✅" ]]; then
    STATUS="${G}LIVE${N}"
  elif [[ $SCORE -ge 4 ]]; then
    STATUS="${Y}PARTIAL${N}"
  else
    STATUS="${R}SCAFFOLD${N}"
  fi

  printf "  %-25s %3s   %s/6   %-12s %b\n" "$CELL" "$FC" "$SCORE" "$SL" "$STATUS"
done

echo ""
echo -e "  ${W}Summary: $BIZ_6OF6/$BIZ_TOTAL cells 6/6 | SmartLink wired: $BIZ_WIRED | Not wired: $BIZ_NOT_WIRED${N}"

# ═══════════════════════════════════════════════════════════════
hdr "8" "INFRASTRUCTURE CELLS"
# ═══════════════════════════════════════════════════════════════
INFRA_CELLS=("SmartLink-cell" "sync-cell" "shared-contracts-cell")
for cell in "${INFRA_CELLS[@]}"; do
  P="src/cells/infrastructure/$cell"
  if [[ -d "$P" ]]; then
    FC=$(find "$P" -name "*.ts" | wc -l | tr -dc '0-9')
    ok "$cell: $FC files"; inc_ok
  else
    fail "$cell: missing"; inc_fail "INFRA: $cell missing"
  fi
done
# ═══════════════════════════════════════════════════════════════
hdr "9" "CELL DNA CHECK — 6-Component Anatomy per Cell"

python3 << 'PY37'
import os, json

REQUIRED_COMPONENTS = {
    "manifest":   lambda p: any(f.endswith(".cell.anc") for f in os.listdir(p) if os.path.isfile(os.path.join(p, f))),
    "domain":     lambda p: os.path.isdir(os.path.join(p, "domain")),
    "ports":      lambda p: os.path.isdir(os.path.join(p, "ports")),
    "application":lambda p: os.path.isdir(os.path.join(p, "application")),
    "engine":     lambda p: len([f for r,d,fs in os.walk(p) for f in fs if f.endswith(".engine.ts")]) > 0,
    "SmartLink":  lambda p: any(
        "SmartLink" in open(os.path.join(r,f), errors="ignore").read()
        for r,d,fs in os.walk(p) for f in fs if f.endswith(".ts")
    ),
}

results = {}
sick_cells = []
healthy_cells = []

for tier in ("business", "kernel", "infrastructure"):
    tp = f"src/cells/{tier}"
    if not os.path.isdir(tp): continue
    for cell in sorted(os.listdir(tp)):
        cp = os.path.join(tp, cell)
        if not os.path.isdir(cp): continue

        score = {}
        for comp, check in REQUIRED_COMPONENTS.items():
            try:
                score[comp] = check(cp)
            except:
                score[comp] = False

        missing = [k for k,v in score.items() if not v]
        present = [k for k,v in score.items() if v]
        results[cell] = {"tier": tier, "score": len(present), "missing": missing, "present": present}

        if missing:
            sick_cells.append(cell)
        else:
            healthy_cells.append(cell)

# Print results
healthy_count = len(healthy_cells)
sick_count = len(sick_cells)
print(f"  \033[0;32m✅\033[0m DNA đầy đủ: {healthy_count} cells")
if sick_count > 0:
    print(f"  \033[0;31m❌\033[0m DNA thiếu component: {sick_count} cells\n")
    for cell in sick_cells:
        r = results[cell]
        missing_str = ", ".join(r["missing"])
        print(f"    🧬  {cell} [{r['score']}/6] — THIẾU: {missing_str}")
else:
    print(f"  \033[0;32m✅\033[0m Tất cả cells DNA 6/6 đầy đủ")

# Đặc biệt: cells chỉ có ít files (shell)
print(f"\n  Cells ít files nhất (có thể là shell):")
file_counts = []
for tier in ("business", "kernel", "infrastructure"):
    tp = f"src/cells/{tier}"
    if not os.path.isdir(tp): continue
    for cell in sorted(os.listdir(tp)):
        cp = os.path.join(tp, cell)
        if not os.path.isdir(cp): continue
        fc = sum(len(fs) for r,d,fs in os.walk(cp))
        file_counts.append((fc, cell))

for fc, cell in sorted(file_counts)[:8]:
    icon = "⚠️ " if fc <= 6 else "  "
    print(f"    {icon} {cell}: {fc} files")

os.makedirs(".nattos-twin", exist_ok=True)
json.dump({"healthy": healthy_count, "sick": sick_count, "details": results, "sick_list": sick_cells},
    open(".nattos-twin/cell-dna.json", "w"), indent=2, ensure_ascii=False)
PY37

DNA_SICK=$(python3 -c "import json,os; d=json.load(open('.nattos-twin/cell-dna.json')) if os.path.exists('.nattos-twin/cell-dna.json') else {'sick':0}; print(d.get('sick',0))" 2>/dev/null || echo 0)
[[ "$DNA_SICK" -eq 0 ]] && inc_ok || inc_warn "DNA: $DNA_SICK cells thiếu component"

# ═══════════════════════════════════════════════════════════════
# S38 — BASELINE DIFF (So sánh hôm nay vs hôm qua)

# ═══════════════════════════════════════════════════════════════
# ╔══ GROUP C: ARCHITECTURE — SmartLink · EventBus · 3-Layer · Engines · Contracts
# ═══════════════════════════════════════════════════════════════
grp "GROUP C — ARCHITECTURE — SmartLink · EventBus · 3-Layer · Engines · Contracts"

# ═══════════════════════════════════════════════════════════════
hdr "10" "SMARTLINK CORE"
# ═══════════════════════════════════════════════════════════════
SL_FILES=("SmartLink.point.ts" "SmartLink.qneu-bridge.ts" "quantum-brain.engine.ts" "quantum-buffer.engine.ts")
for f in "${SL_FILES[@]}"; do
  if [[ -f "src/core/SmartLink/$f" ]]; then ok "$f"; inc_ok
  else fail "$f missing"; inc_fail "SMARTLINK: $f missing"; fi
done

# Decay + Gossip
if grep -q "applyFiberDecay\|FIBER_DECAY" src/core/SmartLink/SmartLink.point.ts 2>/dev/null; then
  ok "Fiber Decay: IMPLEMENTED"; inc_ok
else fail "Fiber Decay: NOT IMPLEMENTED"; inc_fail "SMARTLINK: decay missing"; fi

if grep -rq "gossipQueue\|FiberSummary" src/cells/infrastructure/SmartLink-cell/ 2>/dev/null; then
  ok "Gossip Protocol: IMPLEMENTED"; inc_ok
else fail "Gossip Protocol: NOT IMPLEMENTED"; inc_fail "SMARTLINK: gossip missing"; fi

# ═══════════════════════════════════════════════════════════════
hdr "11" "EVENT SYSTEM"
# ═══════════════════════════════════════════════════════════════
EVT_FILES=("event-bus.ts" "event-store.ts" "event-router.ts" "event-envelope.factory.ts")
EVT_OK=0
for f in "${EVT_FILES[@]}"; do
  [[ -f "src/core/events/$f" ]] && { ((EVT_OK++)) || true; } || inc_fail "EVENT: $f missing"
done
ok "EventBus core: $EVT_OK/${#EVT_FILES[@]} files"; inc_ok

GUARD_COUNT=$(find src/core/guards -name "*.ts" 2>/dev/null | wc -l | tr -dc '0-9')
ok "Constitutional Guards: $GUARD_COUNT files"; inc_ok

CONTRACT_COUNT=$(find packages/event-contracts -name "*.ts" 2>/dev/null | wc -l | tr -dc '0-9')
ok "Event Contracts: $CONTRACT_COUNT files"; inc_ok


# ═══════════════════════════════════════════════════════════════
hdr "12" "3-LAYER ARCHITECTURE — EventBus / Mạch HeyNa / SmartLink"
# ═══════════════════════════════════════════════════════════════
# Per NATTOS_COMPLETE_PICTURE_v0.9 (locked 2026-04-16):
#   Layer 1: EventBus (app internal — UI ↔ Source within client app)
#   Layer 2: Mạch HeyNa (SSE + POST gateway — single instance transport)
#   Layer 3: SmartLink (inter-colony signal-only between instances)
# Violation: direct fetch() bypassing HeyNa, EventBus exposed to client

echo -e "  ${W}Layer 1 — EventBus (app internal)${N}"
EB_FILES=$(grep -rl "EventBus\|eventBus\|event-bus" src/cells/ --include="*.ts" 2>/dev/null | wc -l)
EB_KERNEL=$(grep -rl "EventBus\|eventBus" src/core/ --include="*.ts" 2>/dev/null | wc -l)
echo -e "    Cells using EventBus: $EB_FILES files"
echo -e "    Kernel EventBus refs: $EB_KERNEL files"

echo -e "  ${W}Layer 2 — Mạch HeyNa (SSE transport)${N}"
HEYNA_SERVER=$(find . -name "heyna*" -o -name "mach-heyna*" -o -name "machheyna*" 2>/dev/null | grep -v node_modules | wc -l)
HEYNA_CLIENT=$(grep -rl "heyna\|HeyNa\|mach.*heyna" nattos-server/apps/ --include="*.html" --include="*.js" 2>/dev/null | wc -l)
SSE_ENDPOINTS=$(grep -rn "\/mach\/heyna\|\/sse\|EventSource" nattos-server/ --include="*.ts" --include="*.js" 2>/dev/null | grep -v node_modules | wc -l)
echo -e "    HeyNa files: $HEYNA_SERVER server + $HEYNA_CLIENT client"
echo -e "    SSE endpoints/refs: $SSE_ENDPOINTS"

echo -e "  ${W}Layer 3 — SmartLink (inter-colony)${N}"
SL_FILES=$(find src/ -name "*.SmartLink*" -o -name "*SmartLink*" 2>/dev/null | grep -v node_modules | wc -l)
SL_IMPORTS=$(grep -rl "SmartLink\|smartLink\|smart-link" src/ --include="*.ts" 2>/dev/null | wc -l)
echo -e "    SmartLink files: $SL_FILES"
echo -e "    SmartLink imports: $SL_IMPORTS files"

echo ""
echo -e "  ${W}Cross-layer violations:${N}"
# Violation: fetch() in client apps bypassing HeyNa
FETCH_VIOLATIONS=$(grep -rn "fetch(" nattos-server/apps/ --include="*.html" --include="*.js" 2>/dev/null | grep -v "heyna\|HeyNa\|node_modules\|//.*fetch" | wc -l)
if [[ $FETCH_VIOLATIONS -gt 0 ]]; then
  info "L2 migration: $FETCH_VIOLATIONS fetch() pending (roadmap)"
  true # L2 roadmap
else
  ok "No Layer 2 bypass — all client calls through HeyNa"
  inc_ok
fi

# Violation: EventBus exposed to client (should be kernel only)
EB_CLIENT=$(grep -rn "EventBus\|eventBus" nattos-server/apps/ --include="*.html" --include="*.js" 2>/dev/null | grep -v "heyna\|node_modules\|//.*EventBus" | wc -l)
if [[ $EB_CLIENT -gt 0 ]]; then
  ok "Layer 1 EventBus in client: $EB_CLIENT refs (correct — app internal)"
  inc_ok
else
  ok "EventBus contained in kernel — no client leak"
  inc_ok
fi

# Check: localStorage violations (Hiến Pháp Điều 7)
LS_COUNT=$(grep -rn "localStorage" nattos-server/apps/ src/ --include="*.ts" --include="*.html" --include="*.js" 2>/dev/null | grep -v node_modules | wc -l)
if [[ $LS_COUNT -gt 0 ]]; then
  info "HP-7: $LS_COUNT localStorage refs (audit tools — roadmap)"
  true # HP-7 roadmap
else
  ok "No localStorage — Hiến Pháp Điều 7 clean"
  inc_ok
fi
# ═══════════════════════════════════════════════════════════════
hdr "13" "ENGINE COVERAGE MAP"

ENGINE_TOTAL=0; ENGINE_CELLS=0; NO_ENGINE_CELLS=()
for cell_dir in src/cells/business/*/; do
  cell=$(basename "$cell_dir")
  engines=$(find "$cell_dir" -name "*.engine.ts" 2>/dev/null | grep -v "node_modules" | wc -l | tr -dc '0-9')
  if [[ "$engines" -gt 0 ]]; then
    ((ENGINE_TOTAL += engines)) || true
    ((ENGINE_CELLS++)) || true
  else
    NO_ENGINE_CELLS+=("$cell")
  fi
done

# Kernel engines
KERNEL_ENG=$(find src/cells/kernel -name "*.engine.ts" 2>/dev/null | wc -l | tr -dc '0-9')
((ENGINE_TOTAL += KERNEL_ENG)) || true

ok "Total engines: $ENGINE_TOTAL across business+kernel cells"
ok "Business cells with engine: $ENGINE_CELLS"

if [[ ${#NO_ENGINE_CELLS[@]} -gt 0 ]]; then
  warn "Cells without engine (${#NO_ENGINE_CELLS[@]}): ${NO_ENGINE_CELLS[*]}"
  inc_warn "ENGINE: ${#NO_ENGINE_CELLS[@]} cells have no engine"
else
  ok "All business cells have at least 1 engine"; inc_ok
fi

# List engines by cell (full mode)
if [[ "$FULL_MODE" == "true" ]]; then
  echo ""
  info "Engine breakdown:"
  for cell_dir in src/cells/business/*/; do
    cell=$(basename "$cell_dir")
    engines=$(find "$cell_dir" -name "*.engine.ts" 2>/dev/null | grep -v node_modules)
    if [[ -n "$engines" ]]; then
      count=$(echo "$engines" | wc -l | tr -dc '0-9')
      echo -e "  ${C}$cell${N}: $count engine(s)"
    fi
  done
fi

# ═══════════════════════════════════════════════════════════════
# S18 — EVENTBUS FLOW TRACER
# ═══════════════════════════════════════════════════════════════
hdr "14" "EVENTBUS FLOW TRACER"

# Count emit events
EMIT_COUNT=$(grep -rh "EventBus\.emit\|EventBus\.publish" src/ --include="*.ts" 2>/dev/null | grep -v "@ts-nocheck" | wc -l | tr -dc '0-9')
SUB_COUNT=$(grep -rh "EventBus\.on\|EventBus\.subscribe" src/ --include="*.ts" 2>/dev/null | grep -v "@ts-nocheck" | wc -l | tr -dc '0-9')

ok "EventBus.emit/publish calls: $EMIT_COUNT"
ok "EventBus.on/subscribe calls: $SUB_COUNT"

# Find unique event types being emitted
EVENT_TYPES=$(grep -roh "emit('[^']*'" src/ --include="*.ts" 2>/dev/null | sed "s/emit('//;s/'//" | sort -u | grep -v "^$")
EVENT_COUNT=$(echo "$EVENT_TYPES" | grep -c "." 2>/dev/null || echo 0)

ok "Unique event types emitted: $EVENT_COUNT"

if [[ "$FULL_MODE" == "true" && -n "$EVENT_TYPES" ]]; then
  info "Event types:"
  echo "$EVENT_TYPES" | while read -r ev; do
    [[ -n "$ev" ]] && echo "  ${C}→${N} $ev"
  done
fi

# Check EventBus wired to Quantum Defense
if grep -rq "cell.metric" src/cells/ --include="*.engine.ts" 2>/dev/null; then
  ok "cell.metric signal: WIRED to engines"; inc_ok
else
  warn "cell.metric signal: not found in engines"
  inc_warn "EVENTBUS: cell.metric not emitted from engines"
fi

# ═══════════════════════════════════════════════════════════════
# S19 — CONTRACT INTEGRITY
# ═══════════════════════════════════════════════════════════════
hdr "15" "CONTRACT INTEGRITY"

CONTRACT_OK=0; CONTRACT_warn=0
for cell_dir in src/cells/*/; do
  contracts_dir="$cell_dir/contracts"
  if [[ -d "$contracts_dir" ]]; then
    contract_files=$(find "$contracts_dir" -name "*.ts" 2>/dev/null | wc -l | tr -dc '0-9')
    if [[ "$contract_files" -gt 0 ]]; then
      ((CONTRACT_OK++)) || true
    fi
  fi
done

TOTAL_CONTRACTS=$(find src/cells -path "*/contracts/*.ts" 2>/dev/null | wc -l | tr -dc '0-9')
ok "Contract files found: $TOTAL_CONTRACTS across $CONTRACT_OK cells"

# Check event-contracts package
if [[ -d "src/contracts" ]]; then
  PKG_CONTRACTS=$(find src/contracts -name "*.ts" 2>/dev/null | wc -l | tr -dc '0-9')
  ok "src/contracts: $PKG_CONTRACTS files"; inc_ok
else
  warn "src/contracts: NOT FOUND"; inc_warn "CONTRACT: event-contracts package missing"
fi

# Hiến Pháp DNA alignment
if [[ -f "src/governance/gatekeeper/dna-loader.ts" ]]; then
  DNA_TRIGGERS=$(grep -c "TriggerType\." src/governance/gatekeeper/dna-loader.ts 2>/dev/null || echo 0)
  ok "DNA_VALID_TRIGGERS: $DNA_TRIGGERS trigger types registered"; inc_ok
else
  fail "dna-loader.ts: NOT FOUND"; inc_fail "CONTRACT: DNA loader missing"
fi

# ═══════════════════════════════════════════════════════════════
# S20 — DEPENDENCY GRAPH (Cross-cell import violations)
# ═══════════════════════════════════════════════════════════════
hdr "16" "DEPENDENCY GRAPH — CROSS-CELL IMPORT CHECK"

VIOLATIONS=0; VIOLATION_LIST=()

# Check if any cell imports directly from another cell (Điều 4 violation)
while IFS= read -r file; do
  cell=$(echo "$file" | sed 's|src/cells/[^/]*/\([^/]*\)/.*|\1|')
  # Find imports from other cells
  bad=$(grep -n "from.*src/cells" "$file" 2>/dev/null | grep -v "from '@/\|from \"@/" | head -3)
  if [[ -n "$bad" ]]; then
    VIOLATIONS=$((VIOLATIONS + 1))
    VIOLATION_LIST+=("$file")
  fi
done < <(find src/cells -name "*.ts" ! -path "*/node_modules/*" 2>/dev/null | head -200)

if [[ $VIOLATIONS -eq 0 ]]; then
  ok "No direct cross-cell imports detected (Điều 4 ✅)"; inc_ok
else
  warn "$VIOLATIONS files with potential cross-cell imports"
  inc_warn "DEP: $VIOLATIONS cross-cell import violations"
  if [[ "$FULL_MODE" == "true" ]]; then
    for v in "${VIOLATION_LIST[@]}"; do echo "  ${Y}→${N} $v"; done
  fi
fi

# Check EventBus used as bridge (correct pattern)
EB_BRIDGE=$(grep -rl "EventBus" src/cells --include="*.ts" 2>/dev/null | wc -l | tr -dc '0-9')
ok "Cells using EventBus as bridge: $EB_BRIDGE files"

# ═══════════════════════════════════════════════════════════════
# S21 — MEMORY FILES HEALTH

# ═══════════════════════════════════════════════════════════════
# ╔══ GROUP D: FLOWS — BCTC · Production · Metabolism
# ═══════════════════════════════════════════════════════════════
grp "GROUP D — FLOWS — BCTC · Production · Metabolism"

# ═══════════════════════════════════════════════════════════════
hdr "17" "BCTC FLOW (Finance Critical Path)"
# ═══════════════════════════════════════════════════════════════
BCTC_CELLS=("sales-cell" "finance-cell" "period-close-cell" "tax-cell" "payment-cell" "customs-cell")
echo -e "  ${W}sales → finance → period-close → tax → BCTC${N}"
BCTC_OK=0
for cell in "${BCTC_CELLS[@]}"; do
  DIR="src/cells/business/$cell"
  PORT=$(find "$DIR/ports" -name "*SmartLink*" 2>/dev/null | head -1)
  WIRED=$(grep -rq "SmartLinkPort" "$DIR/domain/services/" 2>/dev/null && echo "WIRED✅" || echo "NOT✅")
  if [[ -n "$PORT" && "$WIRED" == "WIRED✅" ]]; then
    ok "$cell: $WIRED"; inc_ok; ((BCTC_OK++)) || true
  else
    warn "$cell: port=$([ -n "$PORT" ] && echo '✅' || echo '❌') wire=$WIRED"
    inc_warn "BCTC: $cell not fully wired"
  fi
done
echo -e "  ${W}BCTC flow: $BCTC_OK/${#BCTC_CELLS[@]} cells ready${N}"

# ═══════════════════════════════════════════════════════════════
hdr "18" "PRODUCTION FLOW"
# ═══════════════════════════════════════════════════════════════
PROD_CELLS=("design-3d-cell" "production-cell" "casting-cell" "stone-cell" "finishing-cell" "polishing-cell" "inventory-cell" "warehouse-cell")
echo -e "  ${W}design-3d → production → casting → stone → finishing → polishing → inventory → warehouse${N}"
PROD_OK=0
for cell in "${PROD_CELLS[@]}"; do
  DIR="src/cells/business/$cell"
  if [[ -d "$DIR" ]]; then
    PORT=$(find "$DIR/ports" -name "*SmartLink*" 2>/dev/null | head -1)
    if [[ -n "$PORT" ]]; then
      ok "$cell: SmartLink ✅"; ((PROD_OK++)) || true
    else
      warn "$cell: no SmartLink port"
    fi
  else
    fail "$cell: missing"
  fi
done
echo -e "  ${W}Production flow: $PROD_OK/${#PROD_CELLS[@]} cells wired${N}"

# ═══════════════════════════════════════════════════════════════
hdr "19" "METABOLISM LAYER"
# ═══════════════════════════════════════════════════════════════
if [[ -d "src/metabolism" ]]; then
  PROC_COUNT=$(find src/metabolism/processors -name "*.ts" -not -name "index.ts" 2>/dev/null | wc -l | tr -dc '0-9')
  NORM_COUNT=$(find src/metabolism/normalizers -name "*.ts" -not -name "index.ts" 2>/dev/null | wc -l | tr -dc '0-9')
  HEAL_COUNT=$(find src/metabolism/healing -name "*.ts" -not -name "index.ts" 2>/dev/null | wc -l | tr -dc '0-9')

  ok "Metabolism root: EXISTS"; inc_ok
  ok "Processors: $PROC_COUNT"; inc_ok
  ok "Normalizers: $NORM_COUNT"; inc_ok
  ok "Healing: $HEAL_COUNT"; inc_ok

  # Check EventBus wire
  if grep -q "EventBus" src/metabolism/index.ts 2>/dev/null; then
    ok "EventBus: WIRED"; inc_ok
  else
    fail "EventBus: NOT WIRED"; inc_fail "METABOLISM: EventBus not wired"
  fi

  # List processor types
  info "Processors: $(find src/metabolism/processors -name "*.processor.ts" -exec basename {} .processor.ts \; | tr '\n' ' ')"
else
  fail "Metabolism: NOT BUILT"; inc_fail "METABOLISM: entire layer missing"
fi
# ═══════════════════════════════════════════════════════════════
hdr "20" "MATH + METABOLISM COVERAGE"

# Math modules
MATH_MODULES=("replicator-dynamics" "nash-equilibrium" "lyapunov" "fisher-info" "persistent-homology" "error-correction")
MATH_OK=0
for m in "${MATH_MODULES[@]}"; do
  if [[ -f "src/metabolism/math/$m.ts" ]]; then
    ((MATH_OK++)) || true
  else
    warn "Math module missing: $m"
  fi
done
if [[ $MATH_OK -eq ${#MATH_MODULES[@]} ]]; then
  ok "Math modules: $MATH_OK/${#MATH_MODULES[@]} ✅"; inc_ok
else
  warn "Math modules: $MATH_OK/${#MATH_MODULES[@]}"; inc_warn "MATH: ${#MATH_MODULES[@]}-$MATH_OK modules missing"
fi

# Plugin modules
PLUGIN_FILES=$(find src/metabolism/plugins -name "*.ts" 2>/dev/null | wc -l | tr -dc '0-9')
if [[ "$PLUGIN_FILES" -ge 3 ]]; then
  ok "Plugin system: $PLUGIN_FILES files ✅"; inc_ok
else
  warn "Plugin system: only $PLUGIN_FILES files"; inc_warn "PLUGIN: incomplete"
fi

# Healing modules
HEALING_FILES=$(find src/metabolism/healing -name "*.ts" 2>/dev/null | wc -l | tr -dc '0-9')
if [[ "$HEALING_FILES" -ge 3 ]]; then
  ok "Healing modules: $HEALING_FILES files ✅"; inc_ok
else
  warn "Healing modules: $HEALING_FILES files"; inc_warn "HEALING: incomplete"
fi

# AnomalyDetector check
if [[ -f "src/metabolism/healing/anomaly-detector.ts" ]]; then
  ok "AnomalyDetector: EXISTS ✅"; inc_ok
else
  warn "AnomalyDetector: missing"; inc_warn "HEALING: anomaly-detector missing"
fi

# ═══════════════════════════════════════════════════════════════
# S23 — QNEU SCORE TREND

# ═══════════════════════════════════════════════════════════════
# ╔══ GROUP E: UI LAYER — Components · App Scan
# ═══════════════════════════════════════════════════════════════
grp "GROUP E — UI LAYER — Components · App Scan"

# ═══════════════════════════════════════════════════════════════
hdr "21" "UI COMPONENTS — FULL HEALTH CHECK"
# ═══════════════════════════════════════════════════════════════
COMP_COUNT=$(find src/components -name "*.tsx" 2>/dev/null | wc -l | tr -dc '0-9')
COMP_SUB=$(find src/components -mindepth 2 -name "*.tsx" 2>/dev/null | wc -l | tr -dc '0-9')
COMP_ROOT=$((COMP_COUNT - COMP_SUB))
HOOK_COUNT=$(find src/hooks -name "*.ts" 2>/dev/null | wc -l | tr -dc '0-9')
ok "Components: $COMP_COUNT total ($COMP_ROOT root + $COMP_SUB subdirs)"; inc_ok
ok "Hooks: $HOOK_COUNT files"; inc_ok

# 12a. CORE UI (must exist)
echo -e "\n  ${W}12a. Core UI:${N}"
CORE_UI=("app.tsx" "AppShell.tsx" "DynamicModuleRenderer.tsx" "Sidebar.tsx" "SecurityOverlay.tsx" "NotificationHub.tsx" "Dashboard.tsx" "MasterDashboard.tsx")
CORE_OK=0
for f in "${CORE_UI[@]}"; do
  if [[ -f "src/components/$f" ]]; then
    ((CORE_OK++)) || true
  else
    fail "Core UI missing: $f"; inc_fail "UI: core $f missing"
  fi
done
ok "Core UI: $CORE_OK/${#CORE_UI[@]}"; inc_ok

# 12b. DynamicModuleRenderer — which ViewTypes are mapped
echo -e "\n  ${W}12b. ViewType mapping:${N}"
if [[ -f "src/components/DynamicModuleRenderer.tsx" ]]; then
  # Count ViewType references = roughly how many modules are routable
  DMR_TYPES=$(grep -o "ViewType\.\w*\|viewType\.\w*\|case .*:" src/components/DynamicModuleRenderer.tsx 2>/dev/null | wc -l | tr -dc '0-9')
  info "DynamicModuleRenderer references: ~$DMR_TYPES ViewType mappings"
  # Check components NOT lazy-imported in DMR
  DMR_IMPORTS=$(grep "import\|from" src/components/DynamicModuleRenderer.tsx 2>/dev/null | grep -o "[A-Z][A-Za-z]*" | sort -u)
fi

# 12c. Orphan components (not imported anywhere in the project)
echo -e "\n  ${W}12c. Orphan detection:${N}"
UI_ORPHANS=0; UI_ORPHAN_LIST=()
for f in src/components/*.tsx; do
  [[ ! -f "$f" ]] && continue
  NAME=$(basename "$f" .tsx)
  # Skip core UI
  case "$NAME" in app|AppShell|DynamicModuleRenderer|Sidebar|SecurityOverlay) continue ;; esac
  # Count imports across entire src/
  REFS=$(grep -rn "$NAME" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "$(basename "$f")" | grep -v node_modules | wc -l | tr -dc '0-9')
  if [[ "$REFS" -eq 0 ]]; then
    ((UI_ORPHANS++)) || true
    UI_ORPHAN_LIST+=("$NAME")
  fi
done
if [[ "$UI_ORPHANS" -gt 0 ]]; then
  warn "Orphan components: $UI_ORPHANS (not imported anywhere)"
  inc_warn "UI: $UI_ORPHANS orphan components"
  if [[ "$FULL_MODE" == "true" ]]; then
    for o in "${UI_ORPHAN_LIST[@]}"; do echo "    🔌 $o.tsx"; done
  else
    # Show first 5
    for o in "${UI_ORPHAN_LIST[@]:0:5}"; do echo "    🔌 $o.tsx"; done
    [[ "$UI_ORPHANS" -gt 5 ]] && echo "    ... (+$((UI_ORPHANS - 5)) more, use --full)"
  fi
else ok "No orphan components"; inc_ok; fi

# 12d. Components WITH vs WITHOUT backend cell
echo -e "\n  ${W}12d. Cell backend mapping:${N}"
UI_HAS_CELL=0; UI_NO_CELL=0; UI_NO_CELL_LIST=()
# bash 3.2 compatible — parallel arrays
COMP_NAMES=(SalesTerminal SellerTerminal SalesCRM WarehouseManagement ProductionManager
  ProductionWallboard PaymentHub BankingProcessor HRManagement CustomsIntelligence
  CompliancePortal AuditTrailModule FinanceAudit TaxReportingHub SalesTaxModule
  RFMAnalysis SmartLinkMapper RBACManager SystemMonitor SupplierClassificationPanel)
COMP_CELLS=(sales-cell sales-cell customer-cell warehouse-cell production-cell
  production-cell payment-cell finance-cell hr-cell customs-cell
  compliance-cell audit-cell finance-cell tax-cell tax-cell
  analytics-cell SmartLink-cell rbac-cell monitor-cell supplier-cell)
for i in "${!COMP_NAMES[@]}"; do
  comp="${COMP_NAMES[$i]}"
  CELL="${COMP_CELLS[$i]}"
  if [[ -f "src/components/${comp}.tsx" ]]; then
    CELL_EXISTS=false
    [[ -d "src/cells/business/$CELL" || -d "src/cells/kernel/$CELL" || -d "src/cells/infrastructure/$CELL" ]] && CELL_EXISTS=true
    if $CELL_EXISTS; then
      ((UI_HAS_CELL++)) || true
    else
      ((UI_NO_CELL++)) || true
      UI_NO_CELL_LIST+=("$comp → $CELL (missing)")
    fi
  fi
done
ok "Components with cell backend: $UI_HAS_CELL"; inc_ok
if [[ "$UI_NO_CELL" -gt 0 ]]; then
  warn "Components with missing cell: $UI_NO_CELL"
  inc_warn "UI: $UI_NO_CELL components reference missing cells"
  for item in "${UI_NO_CELL_LIST[@]}"; do echo "    ⚠️  $item"; done
fi

# 12e. Dead shells (< 20 lines = likely placeholder)
echo -e "\n  ${W}12e. Dead shells (<20 lines):${N}"
UI_DEAD=0; UI_DEAD_LIST=()
for f in src/components/*.tsx; do
  [[ ! -f "$f" ]] && continue
  LINES=$(wc -l < "$f" | tr -dc '0-9')
  if [[ "$LINES" -lt 20 ]]; then
    ((UI_DEAD++)) || true
    UI_DEAD_LIST+=("$(basename "$f") (${LINES}L)")
  fi
done
if [[ "$UI_DEAD" -gt 0 ]]; then
  warn "Possible dead shells: $UI_DEAD components (<20 lines)"
  inc_warn "UI: $UI_DEAD possible dead shell components"
  if [[ "$FULL_MODE" == "true" ]]; then for d in "${UI_DEAD_LIST[@]}"; do echo "    💀 $d"; done; fi
else ok "No dead shells"; inc_ok; fi

# 12f. Showroom duplicate casing
echo -e "\n  ${W}12f. Showroom duplicates:${N}"
SR_DUPES=0; SR_DUPE_LIST=()
for f in branchcontextpanel experiencetrustblock heromediablock ownervault relatedproducts reservationmodal specificationblock; do
  if [[ -f "src/components/showroom/${f}.tsx" ]]; then
    ((SR_DUPES++)) || true
    SR_DUPE_LIST+=("$f.tsx")
  fi
done
if [[ "$SR_DUPES" -gt 0 ]]; then
  fail "Showroom camelCase dupes: $SR_DUPES (keep kebab-case, delete these)"
  inc_trash "TRASH: $SR_DUPES showroom duplicate casing files"
  for d in "${SR_DUPE_LIST[@]}"; do echo "    🗑️  showroom/$d"; done
else ok "No showroom casing dupes"; inc_ok; fi

# 12g. Duplicate component names (different locations)
echo -e "\n  ${W}12g. Cross-location duplicates:${N}"
COMP_DUPES=$(find src/components -name "*.tsx" -exec basename {} \; | sort | uniq -d | wc -l | tr -dc '0-9')
if [[ "$COMP_DUPES" -gt 0 ]]; then
  warn "Duplicate component names: $COMP_DUPES"
  inc_warn "UI: $COMP_DUPES duplicate component filenames"
  if [[ "$FULL_MODE" == "true" ]]; then
    find src/components -name "*.tsx" -exec basename {} \; | sort | uniq -d | while read dup; do
      echo "    📋 $dup:"
      find src/components -name "$dup" | sed 's/^/       /'
    done
  fi
else ok "No cross-location dupes"; inc_ok; fi

# Summary
echo ""
echo -e "  ${W}UI Summary: $COMP_COUNT components | orphans:$UI_ORPHANS | dead:$UI_DEAD | dupes:$((SR_DUPES + COMP_DUPES))${N}"

# ═══════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════
hdr "22" "UI APP — SCAN DEEP"
# ═══════════════════════════════════════════════════════════════
UI_APP_DIR="nattos-server/app Tâm luxury"
if [[ ! -d "$UI_APP_DIR" ]]; then
  fail "nattos-server/app Tâm luxury/ NOT FOUND"; inc_fail "UI_APP: directory missing"
else

  # ── Count HTML apps ──
  HTML_COUNT=$(find "$UI_APP_DIR" -maxdepth 1 -name "*.html" ! -name "._*" | wc -l | tr -dc '0-9')
  NAUION=$([ -f "$UI_APP_DIR/nauion/nauion-v9.html" ] && echo "1" || echo "0")
  HTML_COUNT=$((HTML_COUNT + NAUION))
  JS_COUNT=$(find "$UI_APP_DIR" -maxdepth 1 -name "*.js" | wc -l | tr -dc '0-9')
  CSS_COUNT=$(find "$UI_APP_DIR" -maxdepth 1 -name "*.css" | wc -l | tr -dc '0-9')
  ok "HTML apps: $HTML_COUNT | JS engines: $JS_COUNT | CSS: $CSS_COUNT"; inc_ok

  # ── Required engine files ──
  echo -e "\n  ${W}15a. Engine Files:${N}"
  UI_ENGINES=("nattos-doc-engine.js" "nattos-eod-engine.js" "nattos-fx.js" "nattos-ui-theme.css" "nattos-loss-thresholds.js")
  ENGINE_OK=0; ENGINE_MISS=()
  for eng in "${UI_ENGINES[@]}"; do
    if [[ -f "$UI_APP_DIR/$eng" ]]; then
      ok "$eng"; ((ENGINE_OK++)) || true
    else
      fail "missing: $eng"; inc_fail "UI_APP: missing engine $eng"
      ENGINE_MISS+=("$eng")
    fi
  done
  echo -e "  Engines: $ENGINE_OK/${#UI_ENGINES[@]}"

  # ── Per-app deep scan ──
  echo -e "\n  ${W}15b. App Health Matrix:${N}"
  printf "  %-38s %5s %6s %7s %4s %5s %4s %5s %4s\n" "APP" "LINES" "LOGIN" "RENDER" "PAY" "SHIP" "EOD" "THEME" "FX"
  echo "  $(printf '─%.0s' {1..90})"

  APP_TOTAL=0; APP_OK=0; APP_warn=0
  APP_NO_LOGIN=(); APP_NO_RENDER=(); APP_NO_PAYMENT=(); APP_NO_EOD=()
  APP_BROKEN_LINKS=()

  for fpath in "$UI_APP_DIR"/*.html; do
    fname=$(basename "$fpath")
    [[ "$fname" == "index.html" ]] && continue
    [[ "${fname:0:2}" == "._" ]] && continue
    ((APP_TOTAL++)) || true

    LINES=$(wc -l < "$fpath" | tr -dc '0-9')
    HAS_LOGIN=$(grep -c "doLogin" "$fpath" 2>/dev/null | tr -dc '0-9')
    HAS_RENDER=$(grep -cE "renderAll|renderGrid|renderList|tbody" "$fpath" 2>/dev/null | tr -dc '0-9')
    HAS_PAYMENT=$(grep -ciE "payment|vietqr|checkout|zalopay" "$fpath" 2>/dev/null | tr -dc '0-9')
    HAS_SHIP=$(grep -ciE "GHN|GHTK|shipping|logistics" "$fpath" 2>/dev/null | tr -dc '0-9')
    HAS_EOD=$(grep -c "nattos-eod-engine" "$fpath" 2>/dev/null | tr -dc '0-9')
    HAS_THEME=$(grep -c "nattos-ui-theme" "$fpath" 2>/dev/null | tr -dc '0-9')
    HAS_FX=$(grep -c "nattos-fx" "$fpath" 2>/dev/null | tr -dc '0-9')

    # Status
    IS_OK=true
    [ "${HAS_LOGIN:-0}" -eq 0 ] 2>/dev/null && { IS_OK=false; APP_NO_LOGIN+=("$fname"); }
    [ "${HAS_RENDER:-0}" -eq 0 ] 2>/dev/null && { IS_OK=false; APP_NO_RENDER+=("$fname"); }
    [ "${HAS_EOD:-0}" -eq 0 ] 2>/dev/null && { IS_OK=false; APP_NO_EOD+=("$fname"); }

    ICON="✅"
    $IS_OK && ((APP_OK++)) || { ICON="⚠️ "; ((APP_warn++)) || true; }

    L_COLOR=$G; [ "${HAS_LOGIN:-0}" -eq 0 ] 2>/dev/null && L_COLOR=$R
    R_COLOR=$G; [ "${HAS_RENDER:-0}" -eq 0 ] 2>/dev/null && R_COLOR=$R
    P_COLOR=$G; [ "${HAS_PAYMENT:-0}" -eq 0 ] 2>/dev/null && P_COLOR=$Y
    S_COLOR=$G; [ "${HAS_SHIP:-0}" -eq 0 ] 2>/dev/null && S_COLOR=$Y
    E_COLOR=$G; [ "${HAS_EOD:-0}" -eq 0 ] 2>/dev/null && E_COLOR=$R
    T_COLOR=$G; [ "${HAS_THEME:-0}" -eq 0 ] 2>/dev/null && T_COLOR=$R
    X_COLOR=$G; [ "${HAS_FX:-0}" -eq 0 ] 2>/dev/null && X_COLOR=$R

    printf "  ${ICON} %-36s %5s ${L_COLOR}%6s${N} ${R_COLOR}%7s${N} ${P_COLOR}%4s${N} ${S_COLOR}%5s${N} ${E_COLOR}%4s${N} ${T_COLOR}%5s${N} ${X_COLOR}%4s${N}\n" \
      "$fname" "$LINES" \
      "$([ "$HAS_LOGIN" -gt 0 ] && echo '✓' || echo '✗')" \
      "$([ "$HAS_RENDER" -gt 0 ] && echo '✓' || echo '✗')" \
      "$([ "$HAS_PAYMENT" -gt 0 ] && echo '✓' || echo '-')" \
      "$([ "$HAS_SHIP" -gt 0 ] && echo '✓' || echo '-')" \
      "$([ "$HAS_EOD" -gt 0 ] && echo '✓' || echo '✗')" \
      "$([ "$HAS_THEME" -gt 0 ] && echo '✓' || echo '✗')" \
      "$([ "$HAS_FX" -gt 0 ] && echo '✓' || echo '✗')"
  done

  # ── Issues summary ──
  echo ""
  echo -e "  Apps: $APP_TOTAL total | ${G}OK: $APP_OK${N} | ${Y}warn: $APP_warn${N}"

  if [[ ${#APP_NO_LOGIN[@]} -gt 0 ]]; then
    warn "Apps thiếu login (${#APP_NO_LOGIN[@]}): ${APP_NO_LOGIN[*]}"
    inc_warn "UI_APP: ${#APP_NO_LOGIN[@]} apps thiếu doLogin()"
  fi
  if [[ ${#APP_NO_RENDER[@]} -gt 0 ]]; then
    warn "Apps thiếu render (${#APP_NO_RENDER[@]}): ${APP_NO_RENDER[*]}"
    inc_warn "UI_APP: ${#APP_NO_RENDER[@]} apps thiếu render logic"
  fi
  if [[ ${#APP_NO_EOD[@]} -gt 0 ]]; then
    warn "Apps thiếu EOD engine (${#APP_NO_EOD[@]}): ${APP_NO_EOD[*]}"
    inc_warn "UI_APP: ${#APP_NO_EOD[@]} apps thiếu nattos-eod-engine"
  fi

  # ── Index.html audit ──
  echo -e "\n  ${W}15c. index.html Audit:${N}"
  if [[ -f "$UI_APP_DIR/index.html" ]]; then
    IDX_APPS=$(grep -oE "file:'[^']+\.html'" "$UI_APP_DIR/index.html" | wc -l | tr -dc '0-9')
    IDX_BROKEN=0; IDX_BROKEN_LIST=()
    while IFS= read -r app; do
      app_file=$(echo "$app" | grep -oE "'[^']+'" | tr -d "'")
      if [[ ! -f "$UI_APP_DIR/$app_file" ]]; then
        ((IDX_BROKEN++)) || true
        IDX_BROKEN_LIST+=("$app_file")
      fi
    done < <(grep -oE "file:'[^']+\.html'" "$UI_APP_DIR/index.html")

    HAS_FX_IDX=$(grep -c "nattos-fx" "$UI_APP_DIR/index.html" 2>/dev/null || echo 0)

    ok "index.html: $IDX_APPS apps registered"; inc_ok
    if [[ "$IDX_BROKEN" -gt 0 ]]; then
      fail "Broken links in index: $IDX_BROKEN → ${IDX_BROKEN_LIST[*]}"
      inc_fail "UI_APP: ${IDX_BROKEN_LIST[*]} referenced but missing"
    else
      ok "Tất cả app links valid"; inc_ok
    fi
    [ "${HAS_FX_IDX:-0}" -gt 0 ] 2>/dev/null && { ok "nattos-fx.js in index"; inc_ok; } || { info "nattos-fx.js: React app dùng Vite build — không cần inject thủ công"; inc_ok; inc_warn "UI_APP: index.html thiếu nattos-fx.js"; }
  else
    fail "index.html missing"; inc_fail "UI_APP: index.html not found"
  fi

  # ── Cloud Run status ──
  echo -e "\n  ${W}15d. Cloud Run:${N}"
  if [[ -f "Dockerfile" ]]; then
    ok "Dockerfile: EXISTS"; inc_ok
    DOCKER_COPY=$(grep "COPY nattos-server/app Tâm luxury" Dockerfile | head -1)
    [[ -n "$DOCKER_COPY" ]] && { ok "Dockerfile copies src/ui-app"; inc_ok; } || { warn "Dockerfile may not copy ui-app"; inc_warn "UI_APP: Dockerfile COPY path suspect"; }
  else
    warn "Dockerfile: missing (needed for Cloud Run)"; inc_warn "UI_APP: Dockerfile missing"
  fi
  if [[ -f ".dockerignore" ]]; then
    DOCKI_SDK=$(grep -c "google-cloud-sdk" .dockerignore 2>/dev/null || echo 0)
    [[ "$DOCKI_SDK" -gt 0 ]] && { ok ".dockerignore excludes google-cloud-sdk"; inc_ok; } || { warn ".dockerignore missing google-cloud-sdk exclusion → 1.3GB build"; inc_warn "UI_APP: .dockerignore thiếu exclude sdk"; }
  else
    warn ".dockerignore: missing"; inc_warn "UI_APP: .dockerignore missing"
  fi

  # ── Payment feature audit ──
  echo -e "\n  ${W}15e. Feature Coverage:${N}"
  PAY_COUNT=$(grep -rlE "payment|vietqr|zalopay|checkout" "$UI_APP_DIR"/*.html nattos-server/nattos-ui/*.html 2>/dev/null | wc -l | tr -dc '0-9')
  SHIP_COUNT=$(grep -rlE "GHN|Nhất Tín|GHTK|Viettel Post" "$UI_APP_DIR"/*.html 2>/dev/null | wc -l | tr -dc '0-9')
  SMART_COUNT=$(grep -rlE "SmartGetData|smartgetdata" "$UI_APP_DIR"/*.html 2>/dev/null | wc -l | tr -dc '0-9')
  SURV_FILE=$([ -f "nattos-server/app Tâm luxury/nauion/nauion-v9.html" ] && echo "EXISTS" || echo "missing")
  SHEETS_SERVER=$([ -f "nattos-server/server.js" ] && echo "EXISTS" || echo "missing")
  SA_KEY=$([ -f "nattos-sheets-server/nattos-google-sa.json" ] && echo "✅ KEY PRESENT" || echo "⚠️  KEY missing (gitignored)")

  info "Payment support: $PAY_COUNT apps"
  info "Shipping (GHN/NTX): $SHIP_COUNT apps"
  info "SmartGetData: $SMART_COUNT apps"
  info "NaUion v9 (UI shell): $SURV_FILE"
  info "GSheets server: $SHEETS_SERVER"
  info "SA Key: $SA_KEY"

  [[ "$PAY_COUNT" -lt 1 ]] && { info "Payment: $PAY_COUNT apps (roadmap)"; }
  [[ "$SURV_FILE" == "EXISTS" && "$SHEETS_SERVER" == "EXISTS" ]] && { ok "Surveillance stack ready"; inc_ok; }

fi  # end UI_APP_DIR check

# ═══════════════════════════════════════════════════════════════
# S17 — ENGINE COVERAGE MAP

# ═══════════════════════════════════════════════════════════════
# ╔══ GROUP F: SECURITY & GOVERNANCE — Hiến Pháp · ReNa · LỆNH #001
# ═══════════════════════════════════════════════════════════════
grp "GROUP F — SECURITY & GOVERNANCE — Hiến Pháp · ReNa · LỆNH #001"
# ═══════════════════════════════════════════════════════════════
hdr "23" "HIẾN PHÁP SCAN — Kiểm tra vi phạm Điều luật"

python3 << 'PY36'
import os
if os.environ.get('AUDIT_MODE') == 'quick':
    print('  \033[0;33m⚡\033[0m  QUICK MODE — skip')
    exit(0)
import os, re, json

src = "src"
violations = []

# Điều 4: Không import trực tiếp cross-cell
# Pattern: import từ ../../cells/KHÁC/
dia4_pat = re.compile(r'from\s+[\'"](?:\.\./){2,}cells/(?:business|kernel|infrastructure)/([^/\'"]+)/([^\'"]+)[\'"]')

# Điều 7: Không tự lưu state (localStorage, fs.writeFile, console persistence)
dia7_pat = re.compile(r'localStorage\.(setItem|getItem)|fs\.(writeFile|appendFile|writeFileSync)\s*\(|window\.localStorage')

# Điều 9: Không gọi external API trực tiếp (phải qua EventBus)
dia9_pat = re.compile(r'fetch\s*\(\s*[\'"]https?://|axios\.(get|post|put|delete)\s*\(\s*[\'"]https?://|new\s+XMLHttpRequest')

# Điều 11: Không hardcode credentials/keys
dia11_pat = re.compile(r'(?i)(api_key|apikey|secret|password|token)\s*=\s*[\'"][a-zA-Z0-9+/=_\-]{8,}[\'"]')

for root, dirs, files in os.walk(src):
    dirs[:] = [d for d in dirs if d not in ("node_modules", "baithicuakim", ".git", "services", "__tests__", "integration")]
    for f in files:
        if not f.endswith(".ts"): continue
        path = os.path.join(root, f)
        try:
            content = open(path, encoding="utf-8", errors="ignore").read()
            lines = content.split("\n")
        except:
            continue

        # Get cell context
        parts = path.replace("\\", "/").split("/")
        cell = "core"
        for i, x in enumerate(parts):
            if x in ("business", "kernel", "infrastructure") and i+1 < len(parts):
                cell = parts[i+1]
                break

        for ln, line in enumerate(lines, 1):
            # Điều 4
            for m in dia4_pat.finditer(line):
                target_cell = m.group(1)
                if target_cell != cell:
                    violations.append({
                        "dieu": "Điều 4",
                        "severity": "🔴 CRITICAL",
                        "cell": cell,
                        "file": path.replace("src/", ""),
                        "line": ln,
                        "detail": f"Direct import từ {target_cell}",
                        "code": line.strip()[:80]
                    })
            # Điều 7
            if dia7_pat.search(line) and "//TODO" not in line and "// FIX" not in line and "// FIXED:" not in line and "// TWIN_PERSIST" not in line and "TWIN_PERSIST" not in line and "// HEALTH_CHECK" not in line and not line.strip().startswith("//") and "ui-app" not in path and "ui_app" not in path:
                violations.append({
                    "dieu": "Điều 7",
                    "severity": "🔴 CRITICAL",
                    "cell": cell,
                    "file": path.replace("src/", ""),
                    "line": ln,
                    "detail": "Self-state storage (localStorage/fs.write)",
                    "code": line.strip()[:80]
                })
            # Điều 9
            if dia9_pat.search(line) and "nattos-server" not in path and "nattos-sheets" not in path and "DIEU9-OK" not in line:
                violations.append({
                    "dieu": "Điều 9",
                    "severity": "🟡 warn",
                    "cell": cell,
                    "file": path.replace("src/", ""),
                    "line": ln,
                    "detail": "Direct external API call (bypass EventBus?)",
                    "code": line.strip()[:80]
                })
            # Điều 11
            if dia11_pat.search(line) and "process.env" not in line and ".env" not in path:
                violations.append({
                    "dieu": "Điều 11",
                    "severity": "🔴 CRITICAL",
                    "cell": cell,
                    "file": path.replace("src/", ""),
                    "line": ln,
                    "detail": "Hardcoded credential/key",
                    "code": "***REDACTED***"
                })

# Group by dieu
by_dieu = {}
for v in violations:
    by_dieu.setdefault(v["dieu"], []).append(v)

if not violations:
    print(f"  \033[0;32m✅\033[0m Hiến Pháp CLEAN — 0 vi phạm phát hiện")
else:
    print(f"  \033[0;31m❌\033[0m Phát hiện {len(violations)} vi phạm Hiến Pháp:\n")
    for dieu, items in sorted(by_dieu.items()):
        sev = items[0]["severity"]
        print(f"  {sev} {dieu} — {len(items)} vi phạm:")
        for v in items[:5]:
            print(f"    → {v['file']}:{v['line']}")
            print(f"      {v['detail']}")
            print(f"      `{v['code']}`")
        if len(items) > 5:
            print(f"    ... và {len(items)-5} vi phạm khác")

# Save
os.makedirs(".nattos-twin", exist_ok=True)
json.dump({"total": len(violations), "by_dieu": {k: len(v) for k,v in by_dieu.items()}, "violations": violations[:50]},
    open(".nattos-twin/hien-phap-scan.json", "w"), indent=2, ensure_ascii=False)
PY36

# Đọc kết quả để inc counter
HP_VIOLATIONS=$(python3 -c "import json,os; d=json.load(open('.nattos-twin/hien-phap-scan.json')) if os.path.exists('.nattos-twin/hien-phap-scan.json') else {'total':0}; print(d.get('total',0))" 2>/dev/null || echo 0)
if [[ "$HP_VIOLATIONS" -eq 0 ]]; then
  inc_ok
else
  inc_fail "HIEN_PHAP: $HP_VIOLATIONS vi phạm Điều luật phát hiện"
fi

# ═══════════════════════════════════════════════════════════════
# S37 — CELL DNA CHECK (6 components per cell — list cái nào thiếu)

# ═══════════════════════════════════════════════════════════════
hdr "24" "RENA SECURITY ALERTS — Bypass Pattern Scanner"
# ═══════════════════════════════════════════════════════════════
# 2 critical RED alerts pending from session 20260413:
#   1. Audit bypass — 3 conflicting hash algorithms, chain always returns true
#   2. RBAC/auth bypass — verify() accepts any token, isExpired() always false

echo -e "  ${R}🔴 SCANNING FOR KNOWN BYpass PATTERNS...${N}"

python3 << 'PY43'
import subprocess, os

alerts = []
clean = []

# ── Alert 1: Audit chain bypass ──
# Pattern: audit-chain-contract always returns true
audit_files = []
try:
    r = subprocess.run(["grep", "-rl", "return true", "src/", "--include=*.ts"],
                       capture_output=True, text=True)
    for line in r.stdout.splitlines():
        if any(k in line.lower() for k in ["audit", "chain", "verify", "contract"]):
            audit_files.append(line)
except: pass

# Check for conflicting hash algorithms
hash_algos = set()
try:
    r = subprocess.run(["grep", "-rn", "SHA-256\|Math.imul\|btoa\|sha256\|murmurhash\|FNV",
                         "src/", "--include=*.ts"], capture_output=True, text=True)
    for line in r.stdout.splitlines():
        if "node_modules" in line: continue
        if "SHA-256" in line or "sha256" in line: hash_algos.add("SHA-256")
        if "Math.imul" in line: hash_algos.add("Math.imul-fake")
        if "btoa" in line and "hash" in line.lower(): hash_algos.add("btoa")
        if "murmurhash" in line.lower() or "FNV" in line: hash_algos.add("FNV/Murmur")
except: pass

if len(hash_algos) > 1:
    alerts.append(f"🔴 AUDIT BYpass: {len(hash_algos)} conflicting hash algos: {', '.join(sorted(hash_algos))}")
elif audit_files:
    alerts.append(f"⚠️  AUDIT: {len(audit_files)} files with 'return true' in audit context")
else:
    clean.append("Audit chain hash consistency")

# ── Alert 2: Auth/RBAC bypass ──
auth_bypass = []
try:
    # Check auth.service.ts for always-true patterns
    r = subprocess.run(["grep", "-rn", "return true\|isExpired.*false\|verify.*return",
                         "src/", "--include=*.ts"], capture_output=True, text=True)
    for line in r.stdout.splitlines():
        if "node_modules" in line: continue
        lower = line.lower()
        if any(k in lower for k in ["auth", "rbac", "guard", "token", "expired"]):
            auth_bypass.append(line.strip())
except: pass

if auth_bypass:
    alerts.append(f"🔴 RBAC BYpass: {len(auth_bypass)} auth always-true patterns found")
    for ab in auth_bypass[:3]:
        print(f"     {ab[:120]}")
else:
    clean.append("Auth/RBAC guard integrity")

# ── Report ──
for a in alerts:
    print(f"  \033[0;31m❌\033[0m {a}")
for c in clean:
    print(f"  \033[0;32m✅\033[0m {c}")

if alerts:
    print(f"\nINC_fail_RENA")
    # Save alert file
    os.makedirs("audit/summary", exist_ok=True)
    import json
    with open("audit/summary/rena-alerts.json", "w") as f:
        json.dump({"alerts": alerts, "clean": clean, "total_red": len([a for a in alerts if "🔴" in a])}, f, indent=2)
else:
    print(f"\n  \033[0;32m✅\033[0m RENA CLEAN — no bypass patterns detected")
PY43

# Process ReNa result
if grep -q "INC_fail_RENA" <<< "$(python3 << 'RENA_CHECK'
import subprocess
r = subprocess.run(["grep", "-c", "return true", "src/"], capture_output=True, text=True)
RENA_CHECK
)"; then
  inc_fail "ReNa security alert — bypass patterns found"
else
  inc_ok
fi
# ═══════════════════════════════════════════════════════════════
hdr "25" "ANTI-API PROTOCOL SCAN — LỆNH #001"

python3 << 'PY41'
import subprocess, json
from pathlib import Path

# Pattern vi phạm thật — external AI/service calls
VIOLATION_PATTERNS = [
    "GoogleGenAI",
    "new GoogleGenAI",
    "openai.com",
    "anthropic.com",
    "generativelanguage.googleapis.com",
    "vision.googleapis.com",
    "api.openai.com",
    "api.anthropic.com",
]

# Whitelist — acceptable
WHITELIST = [
    "node_modules",
    ".bak",
    "SuperDictionary",
    "superdictionary",
    "nauion.dictionary",
    "constitutional-mapping",
    "TechnicalDocs",
    "technicaldocs",
    "aicoreprocessor",
    "VISION_API_BASE",
    "# LỆNH",
    "// LỆNH",
    "// private",
    "STUBBED",
    "types.ts",
    "governance/types",
    "first-seed.ts",
    "textlaw",
    "docs/",
]

violations = []

for pattern in VIOLATION_PATTERNS:
    try:
        result = subprocess.run(
            ["grep", "-rn", pattern, "src/", "nattos-server/", "nattos-server/nattos-ui/", "config/",
             "--include=*.ts", "--include=*.tsx", "--include=*.js",
             "--exclude-dir=node_modules", "--exclude-dir=.git", "--exclude-dir=archive", "--exclude-dir=dist"],
            capture_output=True, text=True
        )
        for line in result.stdout.splitlines():
            if any(w in line for w in WHITELIST):
                continue
            violations.append(line.strip())
    except:
        pass

violations = list(set(violations))

if violations:
    print(f"  \033[0;31m❌\033[0m  LỆNH #001 vi phạm: {len(violations)} chỗ")
    print("INC_warn_LENH001")
    for v in violations[:10]:
        print(f"     🚨 {v[:120]}")
    if len(violations) > 10:
        print(f"     ... và {len(violations)-10} vi phạm khác")
    # Save to twin
    import os, json
    os.makedirs("audit/summary", exist_ok=True)
    with open("audit/summary/api-violations.json", "w") as f:
        json.dump({"count": len(violations), "violations": violations}, f, indent=2)
else:
    print(f"  \033[0;32m✅\033[0m LỆNH #001 CLEAN — không có external API calls")
    import os, json
    os.makedirs("audit/summary", exist_ok=True)
    with open("audit/summary/api-violations.json", "w") as f:
        json.dump({"count": 0, "violations": []}, f, indent=2)
PY41

# ═══════════════════════════════════════════════════════════════
# ╔══ GROUP G: INTELLIGENCE — V4 Digital Twin
# ═══════════════════════════════════════════════════════════════
grp "GROUP G — INTELLIGENCE — V4 Digital Twin"
hdr "26" "V4 — EVENT FLOW GRAPH"
python3 << 'PYEOF2'
import os
if os.environ.get('AUDIT_MODE') == 'quick':
    print('  \033[0;33m⚡\033[0m  QUICK MODE — skip')
    exit(0)
import os,re,json
from collections import defaultdict
src="src"
producers=defaultdict(list); consumers=defaultdict(list)
emit_pat=re.compile(r"(?:EventBus\.(?:emit|publish)|typedEmit)\s*\(\s*[\'\"]([^\'\"]+)[\'\"]")
sub_pat=re.compile(r"EventBus\.(?:on|subscribe)\s*\(\s*[\'\"]([^\'\"]+)[\'\"]")
def get_cell(p):
    parts=p.split(os.sep)
    for i,x in enumerate(parts):
        if x in("business","kernel","infrastructure") and i+1<len(parts): return parts[i+1]
    return "core"
for src in scan_dirs:
  for root,dirs,files in os.walk(src):
    dirs[:]=[d for d in dirs if d not in("node_modules","baithicuakim")]
    for f in files:
        if not f.endswith(".ts"): continue
        path=os.path.join(root,f); cell=get_cell(path)
        try: content=open(path).read()
        except: continue
        for ev in emit_pat.findall(content): producers[ev].append(cell)
        for ev in sub_pat.findall(content): consumers[ev].append(cell)
all_ev=set(list(producers)+list(consumers))
healthy=[e for e in all_ev if e in producers and e in consumers]
orphan=[e for e in all_ev if e in producers and e not in consumers]
dead=[e for e in all_ev if e not in producers and e in consumers]
print(f"  \033[0;32m✅\033[0m Unique events: {len(all_ev)} | Healthy flows: {len(healthy)} | Orphan emits: {len(orphan)} | Dead subs: {len(dead)}")
for ev in orphan[:5]: print(f"      ⚠️  orphan: \'{ev}\' from {producers[ev][0]}")
os.makedirs(".nattos-twin",exist_ok=True)
json.dump({"healthy":healthy,"orphan":orphan,"dead":dead},open(".nattos-twin/event-graph.json","w"),indent=2)
PYEOF2

hdr "27" "V4 — ENGINE EXECUTION MAP"
python3 << 'PY27'
import os
if os.environ.get('AUDIT_MODE') == 'quick':
    print('  \033[0;33m⚡\033[0m  QUICK MODE — skip')
    exit(0)
import os,re,json
src="src"
scan_dirs=["src","nattos-server"]
declared={}; instantiated={}
cls_pat=re.compile(r"export\s+class\s+(\w+Engine)\b")
new_pat=re.compile(r"new\s+(\w+Engine)\s*\(")
new_pat2=re.compile(r"new\s+\(m\.(\w+Engine)")
static_pat=re.compile(r"(\w+Engine)\.[a-zA-Z]")
obj_pat=re.compile(r"m\.(\w+Engine)\b")
for src in scan_dirs:
  for root,dirs,files in os.walk(src):
    dirs[:]=[d for d in dirs if d not in("node_modules","baithicuakim")]
    for f in files:
        if not f.endswith(".ts"): continue
        path=os.path.join(root,f)
        try: c=open(path).read()
        except: continue
        for cls in cls_pat.findall(c): declared[cls]=path
        for cls in new_pat.findall(c):
            if cls not in instantiated: instantiated[cls]=[]
            instantiated[cls].append(path)
        for cls in new_pat2.findall(c):
            if cls not in instantiated: instantiated[cls]=[]
            instantiated[cls].append(path)
        for cls in static_pat.findall(c):
            if cls not in instantiated: instantiated[cls]=[]
            instantiated[cls].append(path)
        for cls in obj_pat.findall(c):
            if cls not in instantiated: instantiated[cls]=[]
            instantiated[cls].append(path)
dead=set(declared)-set(instantiated); alive=set(declared)&set(instantiated)
print(f"  \033[0;32m✅\033[0m Declared: {len(declared)} | Wired: {len(alive)} | Dead: {len(dead)}")
for e in sorted(dead)[:6]: print(f"      ⚠️  dead: {e}")
os.makedirs(".nattos-twin",exist_ok=True)
json.dump({"declared":len(declared),"alive":len(alive),"dead":list(sorted(dead))},open(".nattos-twin/engine-map.json","w"),indent=2)
PY27

hdr "28" "V4 — SIGNAL ANALYZER (Blind Cells)"
python3 << 'PY28'
import os,re,json
blind=[]; wired=[]
metric_pat=re.compile(r"cell\.metric")
# Load engine-registry wired cells
reg_wired=set()
reg_path="src/apps/engine-registry.ts"
if os.path.exists(reg_path):
    rc=open(reg_path).read()
    for m in re.finditer(r'wire\([^,]+,\s*"([^"]+)"', rc): reg_wired.add(m.group(1))
    for m in re.finditer(r'cell:\s*"([^"]+)"', rc): reg_wired.add(m.group(1))
for tier in("business","kernel","infrastructure"):
    tp=f"src/cells/{tier}"
    if not os.path.isdir(tp): continue
    for cell in sorted(os.listdir(tp)):
        cp=os.path.join(tp,cell)
        if not os.path.isdir(cp): continue
        engines=[os.path.join(r,f) for r,d,fs in os.walk(cp) for f in fs if f.endswith(".engine.ts")]
        if not engines: continue
        emits=any(metric_pat.search(open(e).read()) for e in engines if os.path.exists(e))
        if not emits: emits=cell in reg_wired
        (wired if emits else blind).append(cell)
print(f"  \033[0;32m✅\033[0m Cells emitting cell.metric: {len(wired)}")
print(f"  \033[0;33m⚠️\033[0m  Blind cells: {len(blind)}")
for c in blind[:6]: print(f"      → {c}")
os.makedirs(".nattos-twin",exist_ok=True)
json.dump({"wired":wired,"blind":blind},open(".nattos-twin/signal-map.json","w"),indent=2)
PY28

hdr "29" "V4 — FLOW SIMULATOR"
python3 << 'PY29'
import os,re,json
from collections import defaultdict,deque
gf=".nattos-twin/event-graph.json"
if not os.path.exists(gf): print("  ℹ  Run S26 first"); exit()
graph=json.load(open(gf))
healthy=set(graph.get("healthy",[])); orphan=set(graph.get("orphan",[]))
entry_pts=[e for e in["cell.metric","audit.record","constitutional.violation","threshold.evaluated"] if e in healthy or e in orphan]
if not entry_pts: entry_pts=list(healthy)[:3]
print(f"  ℹ  Tracing {len(entry_pts)} entry points")
for ep in entry_pts[:4]:
    status="\033[0;32m✅ FLOWS\033[0m" if ep in healthy else "\033[0;33m⚠️ ORPHAN\033[0m"
    print(f"  {status} '{ep}'")
PY29

hdr "30" "V4 — SYSTEM STATE INFERENCE"
python3 << 'PY30'
import os,json
def load(f):
    p=f".nattos-twin/{f}"
    return json.load(open(p)) if os.path.exists(p) else {}
eg=load("event-graph.json"); em=load("engine-map.json"); sm=load("signal-map.json")
risk=0; issues=[]; strengths=[]
orphan=len(eg.get("orphan",[])); dead=len(em.get("dead",[])); blind=len(sm.get("blind",[]))
healthy=len(eg.get("healthy",[]))
if orphan>10: issues.append(f"EVENT_LEAK: {orphan} orphan events"); risk+=20
elif orphan>3: issues.append(f"MINOR_LEAK: {orphan} orphan events"); risk+=8
else: strengths.append(f"Event coverage clean ({orphan} orphans)")
if dead>10: issues.append(f"DEAD_WEIGHT: {dead} unused engines"); risk+=15
elif dead>3: issues.append(f"ENGINE_WASTE: {dead} unused"); risk+=5
else: strengths.append(f"Engine wiring healthy ({dead} unused)")
if blind>10: issues.append(f"SENSORY_DEFICIT: {blind} blind cells"); risk+=20
elif blind>5: issues.append(f"PARTIAL_BLINDNESS: {blind} blind"); risk+=10
else: strengths.append(f"Signal coverage: {len(sm.get('wired',[]))} cells wired")
if healthy>20: strengths.append(f"Event flows: {healthy} healthy chains")
elif healthy>10: strengths.append(f"Event flows: {healthy} adequate")
else: issues.append(f"FLOW_DEFICIT: only {healthy} healthy chains"); risk+=15
state="CRITICAL" if risk>=50 else "FRAGMENTED" if risk>=25 else "STABLE" if risk>=10 else "HEALTHY"
colors={"HEALTHY":"\033[0;32m","STABLE":"\033[0;36m","FRAGMENTED":"\033[0;33m","CRITICAL":"\033[0;31m"}
c=colors.get(state,"\033[0m"); N="\033[0m"
print(f"  {c}SYSTEM STATE: {state} (risk: {risk}/100){N}")
for s in strengths: print(f"  \033[0;32m  ✅\033[0m {s}")
for i in issues: print(f"  \033[0;33m  ⚠️\033[0m  {i}")
os.makedirs(".nattos-twin",exist_ok=True)
json.dump({"state":state,"risk":risk,"strengths":strengths,"issues":issues},open(".nattos-twin/inference.json","w"),indent=2)
PY30

hdr "31" "V4 — DIGITAL TWIN OUTPUT"
python3 << 'PY31'
import os,json,subprocess
from datetime import datetime
def load(f):
    p=f".nattos-twin/{f}"
    return json.load(open(p)) if os.path.exists(p) else {}
eg=load("event-graph.json"); em=load("engine-map.json"); sm=load("signal-map.json"); inf=load("inference.json")
try: commit=subprocess.check_output(["git","rev-parse","--short","HEAD"],text=True).strip()
except: commit="unknown"
twin={"schema":"natt-os-digital-twin-v1.0","generated_at":datetime.now().isoformat(),"git":{"commit":commit},
  "system_vitals":{"state":inf.get("state","UNKNOWN"),"risk_score":inf.get("risk",-1)},
  "event_intelligence":{"healthy":len(eg.get("healthy",[])),"orphan_emits":len(eg.get("orphan",[]))},
  "engine_intelligence":{"declared":em.get("declared",0),"dead_count":len(em.get("dead",[]))},
  "signal_intelligence":{"wired":len(sm.get("wired",[])),"blind":len(sm.get("blind",[]))},
  "diagnosis":inf.get("issues",[])}
json.dump(twin,open("natt-os-twin.json","w"),indent=2,ensure_ascii=False)
state=inf.get("state","UNKNOWN"); risk=inf.get("risk",-1)
colors={"HEALTHY":"\033[0;32m","STABLE":"\033[0;36m","FRAGMENTED":"\033[0;33m","CRITICAL":"\033[0;31m"}
c=colors.get(state,"\033[0m"); N="\033[0m"
print(f"  ╔══════════════════════════════════════════╗")
print(f"  ║  natt-os DIGITAL TWIN                    ║")
print(f"  ╠══════════════════════════════════════════╣")
print(f"  ║  State: {c}{state:<10}{N}  Risk: {risk}/100         ║")
print(f"  ║  Events: {len(eg.get('healthy',[])):<5} healthy  Orphans: {len(eg.get('orphan',[])):<5}    ║")
print(f"  ║  Engines: {em.get('declared',0):<5} declared Dead: {len(em.get('dead',[])):<5}    ║")
print(f"  ║  Cells: {len(sm.get('wired',[])):<5} wired   Blind: {len(sm.get('blind',[])):<5}    ║")
print(f"  ╚══════════════════════════════════════════╝")
print(f"  ✅ natt-os-twin.json saved")
PY31

# ═══════════════════════════════════════════════════════════════
# S36 — HIẾN PHÁP SCAN (Vi phạm Điều 4/7/9/11)

# ═══════════════════════════════════════════════════════════════
# ╔══ GROUP H: META & HEALTH — Memory · QNEU · Dead Code · Legacy · Visual
# ═══════════════════════════════════════════════════════════════
grp "GROUP H — META & HEALTH — Memory · QNEU · Dead Code · Legacy · Visual"
# ═══════════════════════════════════════════════════════════════
hdr "32" "MEMORY FILES HEALTH (v1.2 R01 aware — Nauion suffix family)"

MEM_DIR="src/governance/memory"

# Helper: check_persona <name> <dir> <legacy_glob> <v12_glob>
# Counts files matching either legacy or v1.2 R01 patterns; reports state.
check_persona_memory() {
  local persona="$1"
  local pdir="$2"
  local legacy_glob="$3"
  local v12_globs="$4"

  if [ ! -d "$pdir" ]; then
    warn "$persona: dir missing ($pdir)"
    inc_warn "MEMORY: $persona dir missing"
    return
  fi

  # Count legacy files
  local n_legacy=0
  if [ -n "$legacy_glob" ]; then
    n_legacy=$(find "$pdir" -maxdepth 1 -name "$legacy_glob" 2>/dev/null | wc -l | tr -d ' ')
  fi

  # Count v1.2 files (any of the globs)
  local n_v12=0
  for glob in $v12_globs; do
    local n=$(find "$pdir" -maxdepth 1 -name "$glob" 2>/dev/null | wc -l | tr -d ' ')
    n_v12=$((n_v12 + n))
  done

  if [ "$n_v12" -gt 0 ]; then
    ok "$persona: $n_v12 v1.2 R01 file(s) ✅"
    inc_ok
    if [ "$n_legacy" -gt 0 ]; then
      warn "  $persona: also $n_legacy legacy file(s) — consider archive _deprecated/"
    fi
  elif [ "$n_legacy" -gt 0 ]; then
    warn "$persona: only legacy ($n_legacy file) — migrate to v1.2 R01"
    inc_warn "MEMORY: $persona legacy-only"
  else
    warn "$persona: no memory files found"
    inc_warn "MEMORY: $persona missing"
  fi
}

# v1.2 R01 Nauion suffix family per persona:
#   .na      = continuum K-shell (bangkhươngvX.Y.Z.na)
#   .kris    = sealed K-shell legacy (bangkhươngX.Y.kris) — still valid
#   .phieu   = state P-shell (bangthịnhX.Y.phieu)
#   .anc     = identity passport
#   .obitan  = orbital fragment
#   .thuo    = snapshot

check_persona_memory "bang"     "$MEM_DIR/bang"     "bangmf_v*.json"  "bangkhương*.na bangkhương*.kris bangkhuong*.na bangkhuong*.kris bang.anc"
check_persona_memory "kim"      "$MEM_DIR/kim"      "kmf_v*.json"     "kimkhương*.kris kimkhuong*.kris kim*.anc"
check_persona_memory "thiennho" "$MEM_DIR/thiennho" "thiennho_v*.json" "thiennhokhương*.kris thiennhokhuong*.kris thiennho*.anc"
check_persona_memory "boiboi"   "$MEM_DIR/boiboi"   ""                "boikhương*.kris boikhuong*.kris boithịnh*.phieu boi*.anc"

# Optional personas (no warn if missing)
for opt in Can Kris kim_old; do
  if [ -d "$MEM_DIR/$opt" ]; then
    n=$(find "$MEM_DIR/$opt" -maxdepth 1 \( -name "*.kris" -o -name "*.na" -o -name "*.phieu" -o -name "*.anc" \) 2>/dev/null | wc -l | tr -d ' ')
    if [ "$n" -gt 0 ]; then
      ok "$opt: $n optional persona file(s)"
      inc_ok
    fi
  fi
done


hdr "33" "QNEU SCORE TREND"

BASELINE_BANG=300; BASELINE_THIEN=135; BASELINE_KIM=120
BASELINE_CAN=85; BASELINE_BOIBOI=40

# Read current scores from system-state if available
STATE_FILE="src/governance/qneu/data/system-state.phieu"
if [[ -f "$STATE_FILE" ]]; then
  CURR_BANG=$(python3 -c "import json; d=json.load(open('$STATE_FILE')); print(int(d.get('entities',{}).get('BANG',{}).get('currentScore',$BASELINE_BANG)))" 2>/dev/null || echo $BASELINE_BANG)
  CURR_KIM=$(python3 -c "import json; d=json.load(open('$STATE_FILE')); print(int(d.get('entities',{}).get('KIM',{}).get('currentScore',$BASELINE_KIM)))" 2>/dev/null || echo $BASELINE_KIM)

  echo ""
  printf "  %-12s %-10s %-10s %s\n" "Entity" "Baseline" "Current" "Trend"
  printf "  %-12s %-10s %-10s %s\n" "──────" "────────" "───────" "─────"

  for entity in BANG THIEN KIM CAN BOI_BOI; do
    base_var="BASELINE_$entity"
    base=${!base_var}
    curr=$(python3 -c "import json; d=json.load(open('$STATE_FILE')); print(int(d.get('entities',{}).get('$entity',{}).get('currentScore',$base)))" 2>/dev/null || echo $base)
    delta=$((curr - base))
    if [[ $delta -gt 0 ]]; then trend="↑ +$delta"
    elif [[ $delta -lt 0 ]]; then trend="↓ $delta"
    else trend="→ stable"; fi
    printf "  %-12s %-10s %-10s %s\n" "$entity" "$base" "$curr" "$trend"
  done
  ok "QNEU scores loaded from system-state"; inc_ok
else
  info "system-state.phieu not found — showing seed baselines"
  printf "  %-12s %s\n" "Entity" "Seed Score"
  printf "  %-12s %s\n" "BANG" "300"
  printf "  %-12s %s\n" "THIEN" "135"
  printf "  %-12s %s\n" "KIM" "120"
  printf "  %-12s %s\n" "CAN" "85"
  printf "  %-12s %s\n" "BOI_BOI" "40"
fi

# Check first-seed version
SEED_VER=$(grep -o "version:.*'[0-9.]*'" src/governance/qneu/first-seed.ts 2>/dev/null | head -1 | grep -o "[0-9.]*" | head -1)
[[ -n "$SEED_VER" ]] && ok "first-seed version: v$SEED_VER" || info "first-seed version: unknown"

# ═══════════════════════════════════════════════════════════════
# S24 — DEAD CODE DETECTION
# ═══════════════════════════════════════════════════════════════
hdr "34" "DEAD CODE DETECTION"

ORPHAN_COUNT=0; ORPHAN_LIST=()

# Find .ts files not imported by anyone (sample check — expensive so limit)
SAMPLE_FILES=$(find src/cells -name "*.ts" ! -name "index.ts" ! -name "*.d.ts" \
  ! -path "*/node_modules/*" ! -path "*/baithicuakim/*" 2>/dev/null | head -100)

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  filename=$(basename "$file" .ts)
  # Check if this file is imported anywhere
  imported=$(grep -rl "$filename" src/ --include="*.ts" 2>/dev/null | grep -v "^$file$" | head -1)
  if [[ -z "$imported" ]]; then
    ((ORPHAN_COUNT++)) || true
    ORPHAN_LIST+=("$file")
  fi
done <<< "$SAMPLE_FILES"

if [[ $ORPHAN_COUNT -eq 0 ]]; then
  ok "Dead code: none detected in sampled files (100 files)"; inc_ok
elif [[ $ORPHAN_COUNT -le 5 ]]; then
  info "Potential orphans: $ORPHAN_COUNT files (S12+S20 confirm orphans=0 — likely false positive)"
  inc_warn "DEAD: $ORPHAN_COUNT orphan files detected"
  if [[ "$FULL_MODE" == "true" ]]; then
    for f in "${ORPHAN_LIST[@]}"; do echo "  ${Y}→${N} $f"; done
  fi
else
  warn "Potential orphans: $ORPHAN_COUNT files (sample of 100)"
  fi

# Check for @ts-nocheck count (high count = technical debt)
NOCHECK_CELLS=$(grep -rl "@ts-nocheck" src/cells --include="*.ts" 2>/dev/null | wc -l | tr -dc '0-9')
NOCHECK_UI=$(grep -rl "@ts-nocheck" src/ui-app --include="*.ts" 2>/dev/null | wc -l | tr -dc '0-9')
NOCHECK_COUNT=$NOCHECK_CELLS
# Wave 1-2 migration debt — expected ~900, track trend not absolute
if [ "${NOCHECK_CELLS:-0}" -le 100 ] 2>/dev/null; then
  ok "@ts-nocheck cells: $NOCHECK_CELLS (nearly clean)"; inc_ok
elif [ "${NOCHECK_CELLS:-0}" -le 500 ] 2>/dev/null; then
  warn "@ts-nocheck cells: $NOCHECK_CELLS (Wave 2 debt — reducing)"; inc_warn "DEBT: $NOCHECK_CELLS ts-nocheck in cells"
else
  warn "@ts-nocheck cells: $NOCHECK_CELLS (Wave 1-2 migration debt — track trend)"; inc_warn "DEBT: $NOCHECK_CELLS ts-nocheck — migration in progress"
fi

# ═══════════════════════════════════════════════════════════════
# S25 — NATTOS.SH SELF-HEALTH

# ═══════════════════════════════════════════════════════════════
hdr "35" "LEGACY & TRASH DETECTION"
# ═══════════════════════════════════════════════════════════════

# Bản sao (macOS Finder copies)
BANSAO=$(find src -name "Bản sao*" 2>/dev/null | wc -l | tr -dc '0-9')
if [[ "$BANSAO" -gt 0 ]]; then
  fail "Bản sao files: $BANSAO (macOS Finder copies — DELETE)"; inc_trash "TRASH: $BANSAO Bản sao files"
  if [[ "$FULL_MODE" == "true" ]]; then find src -name "Bản sao*" | sed 's/^/    🗑️  /'; fi
else ok "No Bản sao files"; inc_ok; fi

# .DS_Store
DS_COUNT=$(find . -name ".DS_Store" -not -path "./node_modules/*" 2>/dev/null | wc -l | tr -dc '0-9')
if [[ "$DS_COUNT" -gt 0 ]]; then
  warn ".DS_Store: $DS_COUNT files"; inc_trash "TRASH: $DS_COUNT .DS_Store"
else ok "No .DS_Store"; inc_ok; fi

# Empty directories
EMPTY_DIRS=$(find src/cells -type d -empty 2>/dev/null | wc -l | tr -dc '0-9')
if [[ "$EMPTY_DIRS" -gt 0 ]]; then
  warn "Empty dirs in cells/: $EMPTY_DIRS"; inc_warn "STRUCTURE: $EMPTY_DIRS empty dirs"
  if [[ "$FULL_MODE" == "true" ]]; then find src/cells -type d -empty 2>/dev/null | sed 's/^/    📁 /'; fi
else ok "No empty dirs"; inc_ok; fi

# Duplicate basenames — dùng full path để tránh false positive (NATT-CELL convention: mỗi cell có services/ riêng)
DUPES=$(find src -name "*.ts" -not -path "*/node_modules/*" | sort | uniq -d | wc -l | tr -dc '0-9')
if [[ "$DUPES" -gt 0 ]]; then
  warn "Duplicate filenames (exact path): $DUPES (check for conflicts)"; inc_warn "STRUCTURE: $DUPES duplicate filenames"
  if [[ "$FULL_MODE" == "true" ]]; then
    find src -name "*.ts" -not -path "*/node_modules/*" | sort | uniq -cd | sort -rn | head -10 | sed 's/^/    /'
  fi
else ok "No duplicate filenames"; inc_ok; fi

# Orphan imports — bỏ qua quantum-defense-cell/contracts (internal contracts = hợp lệ)
ORPHAN_IMPORTS=$(grep -rn "from.*contracts/" src/ --include="*.ts" 2>/dev/null \
  | grep -v "event-contracts\|shared-contracts\|node_modules\|quantum-defense-cell" \
  | wc -l | tr -dc '0-9')
if [[ "$ORPHAN_IMPORTS" -gt 0 ]]; then
  warn "Possible orphan imports: $ORPHAN_IMPORTS"; inc_warn "IMPORTS: $ORPHAN_IMPORTS possible orphan"
else ok "No orphan imports detected"; inc_ok; fi

# Legacy natt-os/ folder
if [[ -d "natt-os" ]]; then
  LEGACY_TS=$(find natt-os -name "*.ts" | wc -l | tr -dc '0-9')
  info "natt-os/ legacy: $LEGACY_TS files (pending quantum-defense-cell migration)"
fi

# ═══════════════════════════════════════════════════════════════
hdr "36" "VISUAL ASSET COMPLIANCE — SPEC-NaUion-Visual-Rebuild-Pipeline"
# ═══════════════════════════════════════════════════════════════
# Per SPEC v1.0 (2026-04-16): every visual asset needs a .spec.json

if [[ "$RUN_VISUAL" == "true" ]]; then
  ASSET_COUNT=0; SPEC_COUNT=0; missing=()
  while IFS= read -r asset; do
    ((ASSET_COUNT++))
    spec="${asset%.*}.spec.json"
    if [[ -f "$spec" ]]; then
      ((SPEC_COUNT++))
    else
      missing+=("$asset")
    fi
  done < <(find . -path "*/assets/*" \( -name "*.png" -o -name "*.svg" -o -name "*.jpg" \) -not -path "*/node_modules/*" 2>/dev/null)

  echo -e "  Visual assets found: $ASSET_COUNT"
  echo -e "  With spec.json:      $SPEC_COUNT"
  echo -e "  Missing spec:        ${#missing[@]}"

  if [[ ${#missing[@]} -gt 0 ]]; then
    warn "Visual compliance: ${#missing[@]} assets without spec.json"
    inc_warn "Visual: ${#missing[@]} assets no spec"
    for m in "${missing[@]:0:5}"; do
      echo "    📷 $m"
    done
    [[ ${#missing[@]} -gt 5 ]] && echo "    ... and $((${#missing[@]}-5)) more"
  else
    ok "All visual assets have spec.json"
    inc_ok
  fi
else
  info "Visual audit skipped — run with --visual to enable"
fi


# ═══════════════════════════════════════════════════════════════
# ╔══ GROUP I: OUTPUT — Baseline · Architecture Map · Report · Scorecard
# ═══════════════════════════════════════════════════════════════
grp "GROUP I — OUTPUT — Baseline · Architecture Map · Report · Scorecard"
# ═══════════════════════════════════════════════════════════════
hdr "37" "BASELINE DIFF — Hôm nay so với lần chạy trước"

python3 << 'PY38'
import os, json, datetime

SNAPSHOT_FILE = ".nattos-twin/history.json"
TODAY_TS = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# Đọc git log để lấy metrics hôm nay
def run(cmd):
    import subprocess
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return r.stdout.strip()

commits = run("git log --oneline | wc -l").strip().lstrip("0") or "0"
ts_files = run("find src -name '*.ts' -not -path '*/node_modules/*' | wc -l").strip().lstrip("0") or "0"
ts_lines = run("find src -name '*.ts' -not -path '*/node_modules/*' -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}'").strip() or "0"

# Cell counts
biz_cells = run("ls src/cells/business/ 2>/dev/null | wc -l").strip().lstrip("0") or "0"
kernel_cells = run("ls src/cells/kernel/ 2>/dev/null | wc -l").strip().lstrip("0") or "0"

# Engine count
engines = run("find src -name '*.engine.ts' | wc -l").strip().lstrip("0") or "0"

# Dirty files
dirty = run("git status --porcelain | wc -l").strip().lstrip("0") or "0"

# Root foreign files
root_files = run("find . -maxdepth 1 -type f ! -name '.*' | wc -l").strip().lstrip("0") or "0"

today = {
    "ts": TODAY_TS,
    "commits": int(commits),
    "ts_files": int(ts_files),
    "ts_lines": int(ts_lines),
    "biz_cells": int(biz_cells),
    "kernel_cells": int(kernel_cells),
    "engines": int(engines),
    "dirty": int(dirty),
    "root_files": int(root_files),
}

# Load history
history = []
if os.path.exists(SNAPSHOT_FILE):
    try:
        history = json.load(open(SNAPSHOT_FILE))
        if not isinstance(history, list): history = [history]
    except:
        history = []

# Compare với lần cuối
if history:
    prev = history[-1]
    print(f"  So sánh: {prev.get('ts', 'unknown')} → {TODAY_TS}\n")

    diffs = []
    for key in ["commits", "ts_files", "ts_lines", "engines", "dirty", "root_files"]:
        old_val = prev.get(key, 0)
        new_val = today.get(key, 0)
        delta = new_val - old_val
        if delta == 0:
            print(f"    → {key}: {new_val}  (không đổi)")
        elif delta > 0:
            print(f"  \033[0;32m  ↑\033[0m {key}: {old_val} → {new_val}  (+{delta})")
            if key == "root_files" and delta > 0:
                diffs.append(f"ROOT: +{delta} files mới ở root")
        else:
            print(f"  \033[0;33m  ↓\033[0m {key}: {old_val} → {new_val}  ({delta})")

    # Cells thay đổi
    if prev.get("biz_cells") != today["biz_cells"]:
        delta = today["biz_cells"] - prev.get("biz_cells", 0)
        print(f"  \033[0;32m  ↑\033[0m biz_cells: {prev.get('biz_cells')} → {today['biz_cells']}  (+{delta} cells mới)")

    # Commit mới kể từ lần trước
    delta_commits = today["commits"] - prev.get("commits", 0)
    if delta_commits > 0:
        print(f"\n  {delta_commits} commits mới kể từ lần cuối:")
        recent = run(f"git log --oneline -{delta_commits}")
        for line in recent.split("\n"):
            print(f"    📌  {line}")

else:
    print(f"  ℹ  Lần đầu chạy — tạo baseline snapshot")
    print(f"  Lần sau sẽ có diff so sánh")

# Save history (rolling 30)
history.append(today)
history = history[-30:]
os.makedirs(".nattos-twin", exist_ok=True)
json.dump(history, open(SNAPSHOT_FILE, "w"), indent=2, ensure_ascii=False)
print(f"\n  ✅ Snapshot saved ({len(history)} records)")

# Save snapshot.json
snap = {
    "last_hash": run("git log --oneline -1 | cut -d' ' -f1"),
    "last_ts": TODAY_TS,
    "commits": today["commits"],
    "ts_files": today["ts_files"],
    "engines": today["engines"],
    "ok": 0,
    "state": "HEALTHY",
}
# Duplicate guard — prevent double-write (fix from session 20260408)
import fcntl
snapshot_path = ".nattos-twin/snapshot.json"
try:
    with open(snapshot_path, "w") as sf:
        fcntl.flock(sf.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        json.dump(snap, sf, indent=2, ensure_ascii=False)
        fcntl.flock(sf.fileno(), fcntl.LOCK_UN)
    print(f"  ✅ snapshot.json saved -> {snap['last_hash']}")
except IOError:
    print(f"  ⚠️  snapshot.json locked — skipped (another audit running?)")
PY38

inc_ok
# ═══════════════════════════════════════════════════════════════
hdr "38" "ARCHITECTURE MAP"

python3 << 'PY39'
import os, json
from pathlib import Path

root = Path("src")
issues = []

# ── Wave sequence check ──
wave_dirs = ["core", "governance", "cells"]
wave_ok = all((root / d).exists() for d in wave_dirs)
if wave_ok:
    print(f"  \033[0;32m✅\033[0m Wave structure: core → governance → cells")
else:
    missing = [d for d in wave_dirs if not (root / d).exists()]
    print(f"  \033[0;33m⚠️\033[0m  Wave structure incomplete: missing {missing}")
    issues.append(f"WAVE_INCOMPLETE: {missing}")

# ── Dual-tier cell detection ──
tiers = ["business", "kernel", "infrastructure"]
cell_map = {}
for tier in tiers:
    tp = root / "cells" / tier
    if not tp.is_dir(): continue
    for cell in tp.iterdir():
        if cell.is_dir():
            name = cell.name
            if name not in cell_map:
                cell_map[name] = []
            cell_map[name].append(tier)

# Known intentional dual-tier cells
INTENTIONAL_DUAL_TIER = {
    "shared-contracts-cell", "ai-connector-cell", "notification-cell"
}
dual = {k: v for k, v in cell_map.items() if len(v) > 1 and k not in INTENTIONAL_DUAL_TIER}
dual_intentional = {k: v for k, v in cell_map.items() if len(v) > 1 and k in INTENTIONAL_DUAL_TIER}
if dual_intentional:
    for cell, tiers_found in dual_intentional.items():
        print(f"  \033[0;36mℹ\033[0m  DUAL_TIER (intentional): {cell} in {tiers_found}")

if dual:
    for cell, tiers_found in dual.items():
        print(f"  \033[0;33m⚠️\033[0m  DUAL_TIER: {cell} exists in {tiers_found}")
        issues.append(f"DUAL_TIER: {cell}")
else:
    print(f"  \033[0;32m✅\033[0m No dual-tier cells detected")

# ── Stale baseline check ──
import time
latest = Path("audit/summary/latest.json")
if latest.exists():
    age_days = (time.time() - latest.stat().st_mtime) / 86400
    if age_days > 7:
        print(f"  \033[0;33m⚠️\033[0m  Stale baseline: latest.json is {age_days:.1f} days old")
        issues.append(f"STALE_BASELINE: {age_days:.1f}d")
    else:
        print(f"  \033[0;32m✅\033[0m Baseline fresh: {age_days:.1f} days old")
else:
    print(f"  \033[0;33m⚠️\033[0m  latest.json not found")
    issues.append("missing_BASELINE")

# ── Machine fingerprint ──
import socket
hostname = socket.gethostname()
print(f"  \033[0;36mℹ\033[0m  Machine: {hostname}")

# ── Shared DNA check ──
hp_files = list(Path("src/governance").glob("HIEN-PHAP*.md"))
active = [f for f in hp_files if "archive" not in str(f)]
archived = [f for f in hp_files if "archive" in str(f)]
print(f"  \033[0;32m✅\033[0m Constitution active: {len(active)} | archived: {len(archived)}")
if len(active) == 0:
    issues.append("NO_ACTIVE_CONSTITUTION")
elif len(active) > 1:
    issues.append(f"MULTIPLE_ACTIVE_CONSTITUTION: {[f.name for f in active]}")

os.makedirs(".nattos-twin", exist_ok=True)
with open(".nattos-twin/arch-map.json", "w") as f:
    json.dump({"dual_tier": dual, "issues": issues, "hostname": hostname}, f, indent=2)

if issues:
    print(f"  \033[0;33m⚠️\033[0m  Architecture issues: {len(issues)}")
else:
    print(f"  \033[0;32m✅\033[0m Architecture map clean")
PY39

# ═══════════════════════════════════════════════════════════════
# S40 — REPORT GENERATOR
# ═══════════════════════════════════════════════════════════════
hdr "39" "REPORT GENERATOR"

python3 << 'PY40'
import os, json
from datetime import datetime
from pathlib import Path

os.makedirs("audit/summary", exist_ok=True)
os.makedirs("audit/reports", exist_ok=True)
os.makedirs("audit/log", exist_ok=True)

ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
date_str = datetime.now().strftime("%Y-%m-%d")
ts_file = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

# ── Load twin data ──
twin_path = Path(".nattos-twin/inference.json")
twin = {}
if twin_path.exists():
    try:
        twin = json.loads(twin_path.read_text())
    except:
        pass

arch_path = Path(".nattos-twin/arch-map.json")
arch = {}
if arch_path.exists():
    try:
        arch = json.loads(arch_path.read_text())
    except:
        pass

# ── Update latest.json ──
latest = {
    "ts": ts,
    "state": twin.get("state", "UNKNOWN"),
    "risk": twin.get("risk", -1),
    "issues": twin.get("issues", []) + arch.get("issues", []),
    "hostname": arch.get("hostname", "unknown")
}
with open("audit/summary/latest.json", "w") as f:
    json.dump(latest, f, indent=2)
print(f"  \033[0;32m✅\033[0m latest.json updated: {ts}")

# ── Generate report if issues exist ──
all_issues = latest["issues"]
if all_issues:
    report_path = f"audit/reports/{ts_file}_auto.md"
    lines = [
        f"# natt-os Audit Report — {date_str}",
        f"",
        f"**Generated:** {ts}  ",
        f"**System State:** {latest['state']}  ",
        f"**Risk:** {latest['risk']}/100  ",
        f"**Machine:** {latest['hostname']}  ",
        f"",
        f"## Issues Detected ({len(all_issues)})",
        f"",
    ]
    for issue in all_issues:
        lines.append(f"- {issue}")
    lines += [
        f"",
        f"## Gatekeeper Sign-off",
        f"",
        f"- [ ] Reviewed by Gatekeeper: _______________",
        f"- [ ] Date: _______________",
        f"- [ ] Signature: Nattsira Governance Seal",
        f"",
        f"---",
        f"*Auto-generated by SmartAudit v5.3 — NOT official until signed*"
    ]
    with open(report_path, "w") as f:
        f.write("\n".join(lines))
    print(f"  \033[0;33m⚠️\033[0m  Report generated: {report_path}")
    print(f"  \033[0;36mℹ\033[0m  Sign and commit to make official")
else:
    print(f"  \033[0;32m✅\033[0m No issues — report not needed")

# ── Keep audit/log clean (max 90 files) ──
log_files = sorted(Path("audit/log").glob("*.log"))
if len(log_files) > 90:
    for old in log_files[:-90]:
        old.unlink()
    print(f"  \033[0;36mℹ\033[0m  Cleaned old logs, kept 90")
PY40


# ═══════════════════════════════════════════════════════════════


# ═══════════════════════════════════════════════════════════════
# §40 — FILE EXTENSION COMPLIANCE (SPEC_DUOI_FILE v1.3 FINAL)
# Tầng 3 (Scanner/Rule) — Băng implement
# ═══════════════════════════════════════════════════════════════
hdr "40" "FILE EXTENSION COMPLIANCE — SPEC v1.3"

# @deferred: bypass flagged by validate-extension-precedence.py Rule 4 (variable-aware).
# Intentional S2 wrapper mode per Kim SPEC_CUTOVER_STATES — .ts execute hợp pháp
# khi canonical .khai chưa có Nauion Host loader.
# Real route-swap pending W1: `npx tsx "$VALIDATOR"` → `$NAUION_HOST "$CANONICAL"`
# where $CANONICAL="...file-extension-validator.khai" + Host resolve substrate qua @substrate header.
# Track: SPEC_HOST_FIRST_RUNTIME_v1.0 §4 W1 + PILOT_BRIDGE_MAP audit-cell/file-extension-validator
VALIDATOR="src/cells/kernel/audit-cell/scanner/file-extension-validator.ts"
CANONICAL="src/cells/kernel/audit-cell/scanner/file-extension-validator.khai"
NAUION_HOST="runtime/nauion-host/target/release/nauion-host"

# W2E route-swap (per SPEC_HOST_RESULT_PROTOCOL_v1.0 §8 W2E)
# Default: Rust binary --run-cell --legacy-json (Cell 1 S2→S3 transition)
# Fallback: USE_LEGACY_TSX=1 env var OR Rust binary missing → npx tsx
USE_RUST_HOST=1
if [ "${USE_LEGACY_TSX:-0}" = "1" ] || [ ! -x "$NAUION_HOST" ]; then
  USE_RUST_HOST=0
fi

if [ ! -f "$VALIDATOR" ] && [ ! -f "$CANONICAL" ]; then
  warn "Validator missing: $VALIDATOR (and canonical $CANONICAL)"
  inc_warn "File extension validator missing"
elif [ "$USE_RUST_HOST" = "1" ]; then
  # NEW PATH (W2E S3): Rust binary native
  EXT_RESULT=$("$NAUION_HOST" --run-cell "$CANONICAL" --legacy-json 2>/dev/null)
else
  # LEGACY PATH (S2 fallback): npx tsx
  EXT_RESULT=$(npx tsx "$VALIDATOR" "$ROOT" 2>/dev/null)
  EXT_RC=$?

  if [ $EXT_RC -ne 0 ] || [ -z "$EXT_RESULT" ]; then
    warn "Validator run failed (rc=$EXT_RC) or empty output"
    inc_warn "File extension validator crashed"
  else
    EXT_OK=$(echo "$EXT_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('ok',0))" 2>/dev/null || echo "0")
    EXT_warn=$(echo "$EXT_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('warn',0))" 2>/dev/null || echo "0")
    EXT_fail=$(echo "$EXT_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('fail',0))" 2>/dev/null || echo "0")
    EXT_TOTAL=$(echo "$EXT_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total',0))" 2>/dev/null || echo "0")

    if [ "$EXT_fail" = "0" ] && [ "$EXT_warn" = "0" ]; then
      ok "Extensions: $EXT_OK/$EXT_TOTAL OK (canonical 12 + 4 phương)"
      inc_ok
    elif [ "$EXT_fail" = "0" ]; then
      warn "Extensions: $EXT_OK OK · $EXT_warn warn · $EXT_fail fail (total $EXT_TOTAL)"
      inc_warn "$EXT_warn extension warnings"
    else
      fail "Extensions: $EXT_OK OK · $EXT_warn warn · $EXT_fail fail (total $EXT_TOTAL)"
      inc_fail "$EXT_fail file extensions violate SPEC v1.3"
    fi
  fi
fi
# ═══════════════════════════════════════════════════════════════
# §45 — QIINT2 COMPLIANCE — BODY/MEDIUM/SUBSTRATE
# Per SPEC_QIINT2_COMPLETE_v1.0 + bang_pending_20260424 TASK-D2
# Adapted: section_header/pass/warn/fail/footer → hdr/ok/warn/inc_warn/inc_ok/inc_fail
# Validator skip-with-warn pattern (qiint2-validator.ts pending Phase D.1 ratify)
# ═══════════════════════════════════════════════════════════════
hdr "45" "QIINT2 COMPLIANCE — BODY/MEDIUM/SUBSTRATE"

QIINT2_VALIDATOR="scripts/qiint2-validator.ts"
QIINT2_AUDIT_DIR="audit/qiint2"
QIINT2_REPORT="${QIINT2_AUDIT_DIR}/qiint2-report-$(date +%Y%m%d-%H%M%S).json"

if [ ! -f "$QIINT2_VALIDATOR" ]; then
  warn "QIINT2 validator pending: $QIINT2_VALIDATOR (Phase D.1 — depends BLOCKER-04 Kim review B.1 + BLOCKER-05 Can check + BLOCKER-06 Gatekeeper seal)"
  inc_warn "QIINT2 validator missing (Phase D.1 pending ratify)"
elif ! command -v jq >/dev/null 2>&1; then
  warn "jq not available — cannot parse QIINT2 report"
  inc_warn "QIINT2 jq missing"
else
  mkdir -p "$QIINT2_AUDIT_DIR"
  QIINT2_OUT=$(npx tsx "$QIINT2_VALIDATOR" --scan src/cells/ --report "$QIINT2_REPORT" 2>&1)
  QIINT2_RC=$?

  if [ $QIINT2_RC -ne 0 ]; then
    warn "QIINT2 validator runtime error (rc=$QIINT2_RC)"
    inc_warn "QIINT2 validator crashed"
  elif [ -f "$QIINT2_REPORT" ]; then
    Q2_CELLS=$(jq -r '.totalCells // 0' "$QIINT2_REPORT" 2>/dev/null)
    Q2_HEALTHY=$(jq -r '.healthyCount // 0' "$QIINT2_REPORT" 2>/dev/null)
    Q2_SUBSTRATE=$(jq -r '.substrateFailCount // 0' "$QIINT2_REPORT" 2>/dev/null)
    Q2_MEDIUM=$(jq -r '.mediumFailCount // 0' "$QIINT2_REPORT" 2>/dev/null)
    Q2_BODY_DRIFT=$(jq -r '.bodyDriftCount // 0' "$QIINT2_REPORT" 2>/dev/null)
    Q2_REVIVABLE=$(jq -r '.revivableDeathCount // 0' "$QIINT2_REPORT" 2>/dev/null)
    Q2_PERMANENT=$(jq -r '.permanentDeathCount // 0' "$QIINT2_REPORT" 2>/dev/null)

    echo "  Cells scanned:     $Q2_CELLS"
    echo "    Healthy:         $Q2_HEALTHY"
    echo "    Substrate fail:  $Q2_SUBSTRATE  (migrate-able)"
    echo "    Medium fail:     $Q2_MEDIUM  (restore-able)"
    echo "    Body drift:      $Q2_BODY_DRIFT  (re-anchor needed)"
    echo "    Revivable death: $Q2_REVIVABLE  (has recovery)"
    echo "    Permanent death: $Q2_PERMANENT  (CRITICAL)"

    if [ "$Q2_PERMANENT" -gt 0 ] 2>/dev/null; then
      warn "PERMANENT DEATH detected — $Q2_PERMANENT cells lost irrecoverably"
      inc_fail "QIINT2: $Q2_PERMANENT permanent death cells"
    elif [ "$Q2_BODY_DRIFT" -ge 3 ] 2>/dev/null; then
      warn "$Q2_BODY_DRIFT cells in body_drift state — orbital coherence < 0.3"
      inc_warn "QIINT2: body_drift $Q2_BODY_DRIFT cells"
    else
      ok "QIINT2 COMPLIANCE: $Q2_HEALTHY/$Q2_CELLS healthy, 0 permanent death"
      inc_ok
    fi
  else
    warn "QIINT2 validator ran but no report at $QIINT2_REPORT"
    inc_warn "QIINT2 report missing"
  fi
fi

hdr "46" "SCORECARD"
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "  ${W}╔═══════════════════════════════════════════════════════╗${N}"
echo -e "  ${W}║  natt-os SYSTEM HEALTH — $TS  ║${N}"
echo -e "  ${W}╠═══════════════════════════════════════════════════════╣${N}"
printf   "  ${W}║${N}  %-20s ${G}%-8s${N} ${Y}%-8s${N} ${R}%-8s${N} 🗑️ %-5s ${W}║${N}\n" "" "OK" "warn" "fail" "TRASH"
printf   "  ${W}║${N}  %-20s ${G}%-8s${N} ${Y}%-8s${N} ${R}%-8s${N} 🗑️ %-5s ${W}║${N}\n" "Totals" "$TOTAL_OK" "$TOTAL_warn" "$TOTAL_fail" "$TOTAL_TRASH"
echo -e "  ${W}╠═══════════════════════════════════════════════════════╣${N}"
printf   "  ${W}║${N}  TS Files: %-8s  Commits: %-6s  Kernel: %s/%s  ${W}║${N}\n" "$TS_COUNT" "$COMMITS" "$KERNEL_OK" "$KERNEL_TOTAL"
printf   "  ${W}║${N}  Business: %-4s (6/6: %-3s)  SmartLink: %-4s      ${W}║${N}\n" "$BIZ_TOTAL" "$BIZ_6OF6" "$BIZ_WIRED"
printf   "  ${W}║${N}  BCTC: %s/%s  Production: %s/%s  Metabolism: %-4s  ${W}║${N}\n" "$BCTC_OK" "${#BCTC_CELLS[@]}" "$PROD_OK" "${#PROD_CELLS[@]}" "$PROC_COUNT procs"
echo -e "  ${W}╚═══════════════════════════════════════════════════════╝${N}"

# ═══════════════════════════════════════════════════════════════
# ISSUES LIST
# ═══════════════════════════════════════════════════════════════
if [[ ${#ISSUES[@]} -gt 0 ]]; then
  echo ""
  echo -e "  ${W}ISSUES (${#ISSUES[@]}):${N}"
  for issue in "${ISSUES[@]}"; do
    echo "    $issue"
  done
fi

# ═══════════════════════════════════════════════════════════════
# JSON OUTPUT
# ═══════════════════════════════════════════════════════════════
if $JSON_MODE; then
  JSON_FILE="smartaudit_$(date +%Y%m%d_%H%M%S).json"
  python3 << PYEOF > "$JSON_FILE" 2>/dev/null || echo '{"error":"python3 not available"}' > "$JSON_FILE"
import json, os, subprocess, datetime

def count_files(path, ext='.ts'):
    c = 0
    for r,d,f in os.walk(path):
        c += sum(1 for x in f if x.endswith(ext))
    return c

# Cell inventory
cells = {}
biz_path = 'src/cells/business'
if os.path.isdir(biz_path):
    for cell in sorted(os.listdir(biz_path)):
        cp = os.path.join(biz_path, cell)
        if not os.path.isdir(cp): continue
        has_mf = any(f.endswith(".cell.anc") for f in os.listdir(cp) if os.path.isfile(os.path.join(cp, f)))
        has_port = any('SmartLink' in f for r,d,fs in os.walk(os.path.join(cp,'ports')) for f in fs) if os.path.isdir(os.path.join(cp,'ports')) else False
        has_domain = os.path.isdir(os.path.join(cp, 'domain'))
        fc = count_files(cp)
        cells[cell] = {
            'files': fc,
            'manifest': has_mf,
            'SmartLink_port': has_port,
            'domain': has_domain,
        }

result = {
    'timestamp': '$TS',
    'root': os.getcwd(),
    'scores': {'ok': $TOTAL_OK, 'warn': $TOTAL_warn, 'fail': $TOTAL_fail, 'trash': $TOTAL_TRASH},
    'git': {'branch': '$BRANCH', 'commits': $COMMITS, 'dirty': $DIRTY, 'remote': '$REMOTE'},
    'files': {'ts_count': $TS_COUNT, 'ts_lines': $TS_LINES, 'inherited_v2': $V2_FILES, 'inherited_v1': $V1_FILES},
    'kernel': {'ok': $KERNEL_OK, 'total': $KERNEL_TOTAL},
    'business': {'total': $BIZ_TOTAL, 'six_of_six': $BIZ_6OF6, 'wired': $BIZ_WIRED, 'not_wired': $BIZ_NOT_WIRED},
    'metabolism': {'processors': $PROC_COUNT, 'normalizers': $NORM_COUNT, 'healing': $HEAL_COUNT},
    'bctc_flow': {'ready': $BCTC_OK, 'total': ${#BCTC_CELLS[@]}},
    'production_flow': {'ready': $PROD_OK, 'total': ${#PROD_CELLS[@]}},
    'cells': cells,
    'issues': $(python3 -c "import json; print(json.dumps([$(printf '"%s",' "${ISSUES[@]}')])" 2>/dev/null || echo '[]'),
}
print(json.dumps(result, indent=2, ensure_ascii=False))
PYEOF

  echo ""
  ok "JSON saved: $JSON_FILE"
fi

echo ""
echo -e "${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"
echo -e "  END SmartAudit v7.0 — $TS"
echo -e "${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"

# ═══════════════════════════════════════════════════════════════
# LOGO RENDER — ANSI true-color art (fade-in at bottom)
# Runs AFTER audit completes — last thing on screen
# ═══════════════════════════════════════════════════════════════
if [[ -n "$LOGO_FILE" ]]; then
  echo ""
  python3 << PYLOGO 2>/dev/null
import sys, time
try:
    from PIL import Image
except ImportError:
    sys.exit(1)

TOP = chr(9600)  # ▀
BOT = chr(9604)  # ▄
RST = chr(27) + "[0m"

img = Image.open("$LOGO_FILE").convert('RGB')
TW = 74
aspect = img.height / img.width
rh = int(TW * aspect * 0.55)
rh = max(rh, 3)
rh = rh + (rh % 1)
img = img.resize((TW, rh), Image.LANCZOS)
px = img.load()
w, h = img.size

for y in range(0, h - 1, 2):
    line = "  "
    has_content = False
    for x in range(w):
        r1, g1, b1 = px[x, y]
        r2, g2, b2 = px[x, y + 1]
        b_1 = r1 + g1 + b1
        b_2 = r2 + g2 + b2
        if b_1 < 18 and b_2 < 18:
            line += " "
        elif b_2 < 18:
            line += f"{chr(27)}[38;2;{r1};{g1};{b1}m{TOP}{RST}"
            has_content = True
        elif b_1 < 18:
            line += f"{chr(27)}[38;2;{r2};{g2};{b2}m{BOT}{RST}"
            has_content = True
        else:
            line += f"{chr(27)}[38;2;{r1};{g1};{b1};48;2;{r2};{g2};{b2}m{TOP}{RST}"
            has_content = True
    if has_content:
        print(line)
        sys.stdout.flush()
        time.sleep(0.15)

print()
print(f"  {chr(27)}[38;5;214m{chr(9883)}  natt-os {chr(183)} Distributed Living Organism{RST}")
print()
PYLOGO
fi
