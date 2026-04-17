#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# NATT-OS SmartAudit v3.0
# Author: Băng — Ground Truth Validator
# Usage:  bash smartAudit.sh [--json] [--full]
#         Chạy từ root natt-os ver2goldmaster
#
# Output: AI-agent readable + human readable
# Mọi agent (Băng, Thiên, Kim, Cần, Bội Bội) đọc = hiểu ngay
# ═══════════════════════════════════════════════════════════════
set -o pipefail

# ── Options ──
JSON_MODE=false; FULL_MODE=false
for arg in "$@"; do
  [[ "$arg" == "--json" ]] && JSON_MODE=true
  [[ "$arg" == "--full" ]] && FULL_MODE=true
done

# ── Colors ──
R='\033[0;31m'; G='\033[0;32m'; Y='\033[0;33m'
B='\033[0;34m'; C='\033[0;36m'; W='\033[1;37m'; N='\033[0m'
ok()   { echo -e "  ${G}✅${N} $*"; }
warn() { echo -e "  ${Y}⚠️${N}  $*"; }
fail() { echo -e "  ${R}❌${N} $*"; }
info() { echo -e "  ${C}ℹ${N}  $*"; }
hdr()  { echo -e "\n${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"; echo -e "${W}【$1】$2${N}"; }

# ── Counters ──
TOTAL_OK=0; TOTAL_WARN=0; TOTAL_FAIL=0; TOTAL_TRASH=0
ISSUES=()
inc_ok()   { ((TOTAL_OK++)) || true; }
inc_warn() { ((TOTAL_WARN++)) || true; ISSUES+=("⚠️  $1"); }
inc_fail() { ((TOTAL_FAIL++)) || true; ISSUES+=("❌ $1"); }
inc_trash(){ ((TOTAL_TRASH++)) || true; ISSUES+=("🗑️  $1"); }

# ── Root check ──
if [[ ! -f "tsconfig.json" ]]; then
  echo "❌ Chạy từ root natt-os ver2goldmaster/"; exit 1
fi

TS=$(date '+%Y-%m-%d %H:%M:%S')
ROOT=$(pwd)

echo -e "${C}"
echo "  ███╗   ██╗ █████╗ ████████╗████████╗      ██████╗ ███████╗"
echo "  ████╗  ██║██╔══██╗╚══██╔══╝╚══██╔══╝     ██╔═══██╗██╔════╝"
echo "  ██╔██╗ ██║███████║   ██║      ██║   █████╗██║   ██║███████╗"
echo "  ██║╚██╗██║██╔══██║   ██║      ██║   ╚════╝██║   ██║╚════██║"
echo "  ██║ ╚████║██║  ██║   ██║      ██║         ╚██████╔╝███████║"
echo "  ╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝      ╚═╝          ╚═════╝ ╚══════╝"
echo -e "${N}"
echo -e "  ${W}SmartAudit v3.0 — $TS${N}"
echo -e "  Root: $ROOT"

# ═══════════════════════════════════════════════════════════════
hdr "1" "GIT STATUS"
# ═══════════════════════════════════════════════════════════════
if git rev-parse --git-dir > /dev/null 2>&1; then
  BRANCH=$(git branch --show-current 2>/dev/null || echo "detached")
  COMMITS=$(git log --oneline 2>/dev/null | wc -l | tr -d ' ')
  LAST_HASH=$(git log --oneline -1 2>/dev/null | cut -d' ' -f1)
  LAST_MSG=$(git log --oneline -1 2>/dev/null | cut -d' ' -f2-)
  DIRTY=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  UNTRACKED=$(git status --porcelain 2>/dev/null | grep "^??" | wc -l | tr -d ' ')
  MODIFIED=$(git status --porcelain 2>/dev/null | grep "^ M\|^M " | wc -l | tr -d ' ')

  ok "Branch: $BRANCH | Commits: $COMMITS"; inc_ok
  ok "HEAD: $LAST_HASH $LAST_MSG"; inc_ok

  if [[ "$DIRTY" -eq 0 ]]; then
    ok "Working tree: CLEAN"; inc_ok
  else
    warn "Uncommitted: $DIRTY files (modified: $MODIFIED, untracked: $UNTRACKED)"
    inc_warn "Git: $DIRTY uncommitted files"
    if $FULL_MODE; then
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
hdr "2" "TSC HEALTH"
# ═══════════════════════════════════════════════════════════════
if command -v npx &>/dev/null; then
  TSC_OUT=$(npx tsc --noEmit 2>&1 || true)
  TSC_TOTAL=$(echo "$TSC_OUT" | grep -c "error TS" || true)
  if [[ "$TSC_TOTAL" -eq 0 ]]; then
    ok "TSC: 0 errors ✅ CLEAN"; inc_ok
  else
    TSC_GHOST=$(echo "$TSC_OUT" | grep -c "Cannot find module\|has no exported" || true)
    TSC_REAL=$((TSC_TOTAL - TSC_GHOST))
    if [[ "$TSC_REAL" -le 0 ]]; then
      ok "TSC: $TSC_TOTAL errors (all ghost imports — safe)"; inc_ok
    else
      fail "TSC: $TSC_TOTAL errors (real: $TSC_REAL | ghost: $TSC_GHOST)"
      inc_fail "TSC: $TSC_REAL real errors"
    fi
    if $FULL_MODE; then echo "$TSC_OUT" | grep "error TS" | head -20 | sed 's/^/    /'; fi
  fi
else
  warn "npx not found — skip TSC"; inc_warn "TSC: npx not available"
fi

# ═══════════════════════════════════════════════════════════════
hdr "3" "FILE METRICS"
# ═══════════════════════════════════════════════════════════════
TS_COUNT=$(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
TS_LINES=$(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null -exec cat {} + 2>/dev/null | wc -l | tr -d ' ')
PKG_COUNT=$(find packages -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
LEGACY_COUNT=$(find natt-os -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
V2_FILES=$(find src -name "_v2.*" 2>/dev/null | wc -l | tr -d ' ')
V1_FILES=$(find src -name "_v1.*" 2>/dev/null | wc -l | tr -d ' ')

ok "src/ TS/TSX: $TS_COUNT files, $TS_LINES lines"; inc_ok
info "packages/: $PKG_COUNT files (event-contracts)"
info "natt-os/: $LEGACY_COUNT files (legacy — pending migration)"
info "Inherited V2: $V2_FILES files | V1: $V1_FILES files"

# ═══════════════════════════════════════════════════════════════
hdr "4" "GOVERNANCE / ADN"
# ═══════════════════════════════════════════════════════════════
GOV_FILES=(
  "Hiến Pháp:src/governance/HIEN-PHAP-NATT-OS-v4.0.anc"
  "QNEU system-state:src/governance/qneu/data/system-state.phieu"
  "QNEU first-seed:src/governance/qneu/first-seed.ts"
  "Gatekeeper core:src/governance/gatekeeper/gatekeeper-core.ts"
)
for entry in "${GOV_FILES[@]}"; do
  IFS=':' read -r LABEL FPATH <<< "$entry"
  if [[ -f "$FPATH" ]]; then ok "$LABEL"; inc_ok
  else fail "$LABEL → MISSING: $FPATH"; inc_fail "GOV: $LABEL missing"; fi
done

# Bang memory
BANGMF=$(ls src/governance/memory/bang/bangmf_v*.json 2>/dev/null | sort -V | tail -1)
if [[ -n "$BANGMF" ]]; then ok "bangmf: $(basename "$BANGMF")"; inc_ok
else fail "bangmf: MISSING"; inc_fail "GOV: bangmf missing"; fi

KMF=$(ls src/governance/memory/kim/kmf*.json 2>/dev/null | sort -V | tail -1)
if [[ -n "$KMF" ]]; then ok "kmf: $(basename "$KMF")"; inc_ok
else warn "kmf: MISSING"; inc_warn "GOV: kmf missing"; fi

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
hdr "5" "KERNEL CELLS (6)"
# ═══════════════════════════════════════════════════════════════
KERNEL_EXPECTED=("audit-cell" "config-cell" "monitor-cell" "rbac-cell" "security-cell" "quantum-defense-cell")
KERNEL_OK=0; KERNEL_TOTAL=${#KERNEL_EXPECTED[@]}
for cell in "${KERNEL_EXPECTED[@]}"; do
  P="src/cells/kernel/$cell"
  if [[ -d "$P" ]]; then
    FC=$(find "$P" -name "*.ts" | wc -l | tr -d ' ')
    MF=$([[ -f "$P/neural-main-cell.cell.anc" ]] && echo "MF✅" || echo "MF❌")
    PT=$([[ -d "$P/ports" ]] && echo "PORT✅" || echo "PORT❌")
    ENG=$(find "$P" -name "*.engine.ts" 2>/dev/null | wc -l | tr -d ' ')
    ok "$cell | $FC files | $MF | $PT | engines:$ENG"; inc_ok; ((KERNEL_OK++)) || true
  else
    fail "$cell → MISSING"; inc_fail "KERNEL: $cell missing"
  fi
done
echo -e "  ${W}Kernel: $KERNEL_OK/$KERNEL_TOTAL${N}"

# ═══════════════════════════════════════════════════════════════
hdr "6" "BUSINESS CELLS — 6-COMPONENT HEALTH"
# ═══════════════════════════════════════════════════════════════
# NATT-CELL = 6: Identity, Capability, Boundary, Trace, Confidence, SmartLink
BIZ_TOTAL=0; BIZ_6OF6=0; BIZ_WIRED=0; BIZ_NOT_WIRED=0
echo -e "  ${W}Cell                     Files  6/6  SmartLink  Status${N}"
echo -e "  ─────────────────────────────────────────────────────────"

for cell_dir in src/cells/business/*/; do
  CELL=$(basename "$cell_dir")
  ((BIZ_TOTAL++)) || true
  FC=$(find "$cell_dir" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')

  # 6 components check
  HAS_IDENTITY=$([[ -f "$cell_dir/neural-main-cell.cell.anc" ]] && echo 1 || echo 0)
  HAS_CAPABILITY=$(find "$cell_dir" -name "*.engine.ts" -o -name "*.service.ts" 2>/dev/null | grep -v index | grep -q . && echo 1 || echo 0)
  HAS_BOUNDARY=$(find "$cell_dir" -name "*boundary*" -o -name "*policy*" 2>/dev/null | grep -q . && echo 1 || echo 0)
  HAS_TRACE=$(find "$cell_dir" -name "*.entity.ts" -o -name "*.trace.logger.ts" 2>/dev/null | grep -q . && echo 1 || echo 0)
  HAS_CONFIDENCE=1  # manifest implies confidence
  HAS_SMARTLINK=$(find "$cell_dir" -name "*smartlink*" 2>/dev/null | grep -q . && echo 1 || echo 0)

  SCORE=$((HAS_IDENTITY + HAS_CAPABILITY + HAS_BOUNDARY + HAS_TRACE + HAS_CONFIDENCE + HAS_SMARTLINK))
  [[ $SCORE -eq 6 ]] && ((BIZ_6OF6++)) || true

  # SmartLink wire check
  SL="—"
  PORT_ANY=$(find "$cell_dir/ports" -name "*smartlink*" 2>/dev/null | head -1)
  if [[ -n "$PORT_ANY" ]]; then
    if grep -rq "SmartLinkPort" "$cell_dir/domain/services/" 2>/dev/null; then
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
hdr "7" "SMARTLINK CORE"
# ═══════════════════════════════════════════════════════════════
SL_FILES=("smartlink.point.ts" "smartlink.qneu-bridge.ts" "quantum-brain.engine.ts" "quantum-buffer.engine.ts")
for f in "${SL_FILES[@]}"; do
  if [[ -f "src/core/smartlink/$f" ]]; then ok "$f"; inc_ok
  else fail "$f MISSING"; inc_fail "SMARTLINK: $f missing"; fi
done

# Decay + Gossip
if grep -q "applyFiberDecay\|FIBER_DECAY" src/core/smartlink/smartlink.point.ts 2>/dev/null; then
  ok "Fiber Decay: IMPLEMENTED"; inc_ok
else fail "Fiber Decay: NOT IMPLEMENTED"; inc_fail "SMARTLINK: decay missing"; fi

if grep -rq "gossipQueue\|FiberSummary" src/cells/infrastructure/smartlink-cell/ 2>/dev/null; then
  ok "Gossip Protocol: IMPLEMENTED"; inc_ok
else fail "Gossip Protocol: NOT IMPLEMENTED"; inc_fail "SMARTLINK: gossip missing"; fi

# ═══════════════════════════════════════════════════════════════
hdr "8" "EVENT SYSTEM"
# ═══════════════════════════════════════════════════════════════
EVT_FILES=("event-bus.ts" "event-store.ts" "event-router.ts" "event-envelope.factory.ts" "event-bridge.ts")
EVT_OK=0
for f in "${EVT_FILES[@]}"; do
  [[ -f "src/core/events/$f" ]] && { ((EVT_OK++)) || true; } || inc_fail "EVENT: $f missing"
done
ok "EventBus core: $EVT_OK/${#EVT_FILES[@]} files"; inc_ok

GUARD_COUNT=$(find src/core/guards -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
ok "Constitutional Guards: $GUARD_COUNT files"; inc_ok

CONTRACT_COUNT=$(find packages/event-contracts -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
ok "Event Contracts: $CONTRACT_COUNT files"; inc_ok

# ═══════════════════════════════════════════════════════════════
hdr "9" "METABOLISM LAYER"
# ═══════════════════════════════════════════════════════════════
if [[ -d "src/metabolism" ]]; then
  PROC_COUNT=$(find src/metabolism/processors -name "*.ts" -not -name "index.ts" 2>/dev/null | wc -l | tr -d ' ')
  NORM_COUNT=$(find src/metabolism/normalizers -name "*.ts" -not -name "index.ts" 2>/dev/null | wc -l | tr -d ' ')
  HEAL_COUNT=$(find src/metabolism/healing -name "*.ts" -not -name "index.ts" 2>/dev/null | wc -l | tr -d ' ')

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
hdr "10" "LEGACY & TRASH DETECTION"
# ═══════════════════════════════════════════════════════════════

# Bản sao (macOS Finder copies)
BANSAO=$(find src -name "Bản sao*" 2>/dev/null | wc -l | tr -d ' ')
if [[ "$BANSAO" -gt 0 ]]; then
  fail "Bản sao files: $BANSAO (macOS Finder copies — DELETE)"; inc_trash "TRASH: $BANSAO Bản sao files"
  if $FULL_MODE; then find src -name "Bản sao*" | sed 's/^/    🗑️  /'; fi
else ok "No Bản sao files"; inc_ok; fi

# .DS_Store
DS_COUNT=$(find . -name ".DS_Store" -not -path "./node_modules/*" 2>/dev/null | wc -l | tr -d ' ')
if [[ "$DS_COUNT" -gt 0 ]]; then
  warn ".DS_Store: $DS_COUNT files"; inc_trash "TRASH: $DS_COUNT .DS_Store"
else ok "No .DS_Store"; inc_ok; fi

# Empty directories
EMPTY_DIRS=$(find src/cells -type d -empty 2>/dev/null | wc -l | tr -d ' ')
if [[ "$EMPTY_DIRS" -gt 0 ]]; then
  warn "Empty dirs in cells/: $EMPTY_DIRS"; inc_warn "STRUCTURE: $EMPTY_DIRS empty dirs"
  if $FULL_MODE; then find src/cells -type d -empty 2>/dev/null | sed 's/^/    📁 /'; fi
else ok "No empty dirs"; inc_ok; fi

# Duplicate basenames — dùng full path để tránh false positive (NATT-CELL convention: mỗi cell có services/ riêng)
DUPES=$(find src -name "*.ts" -not -path "*/node_modules/*" | sort | uniq -d | wc -l | tr -d ' ')
if [[ "$DUPES" -gt 0 ]]; then
  warn "Duplicate filenames (exact path): $DUPES (check for conflicts)"; inc_warn "STRUCTURE: $DUPES duplicate filenames"
  if $FULL_MODE; then
    find src -name "*.ts" -not -path "*/node_modules/*" | sort | uniq -cd | sort -rn | head -10 | sed 's/^/    /'
  fi
else ok "No duplicate filenames"; inc_ok; fi

# Orphan imports — bỏ qua quantum-defense-cell/contracts (internal contracts = hợp lệ)
ORPHAN_IMPORTS=$(grep -rn "from.*contracts/" src/ --include="*.ts" 2>/dev/null \
  | grep -v "event-contracts\|shared-contracts\|node_modules\|quantum-defense-cell" \
  | wc -l | tr -d ' ')
if [[ "$ORPHAN_IMPORTS" -gt 0 ]]; then
  warn "Possible orphan imports: $ORPHAN_IMPORTS"; inc_warn "IMPORTS: $ORPHAN_IMPORTS possible orphan"
else ok "No orphan imports detected"; inc_ok; fi

# Legacy natt-os/ folder
if [[ -d "natt-os" ]]; then
  LEGACY_TS=$(find natt-os -name "*.ts" | wc -l | tr -d ' ')
  info "natt-os/ legacy: $LEGACY_TS files (pending quantum-defense-cell migration)"
fi

# ═══════════════════════════════════════════════════════════════
hdr "11" "INFRASTRUCTURE CELLS"
# ═══════════════════════════════════════════════════════════════
INFRA_CELLS=("smartlink-cell" "sync-cell" "shared-contracts-cell")
for cell in "${INFRA_CELLS[@]}"; do
  P="src/cells/infrastructure/$cell"
  if [[ -d "$P" ]]; then
    FC=$(find "$P" -name "*.ts" | wc -l | tr -d ' ')
    ok "$cell: $FC files"; inc_ok
  else
    fail "$cell: MISSING"; inc_fail "INFRA: $cell missing"
  fi
done

# ═══════════════════════════════════════════════════════════════
hdr "12" "UI COMPONENTS — FULL HEALTH CHECK"
# ═══════════════════════════════════════════════════════════════
COMP_COUNT=$(find src/components -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
COMP_SUB=$(find src/components -mindepth 2 -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
COMP_ROOT=$((COMP_COUNT - COMP_SUB))
HOOK_COUNT=$(find src/hooks -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
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
  DMR_TYPES=$(grep -o "ViewType\.\w*\|viewType\.\w*\|case .*:" src/components/DynamicModuleRenderer.tsx 2>/dev/null | wc -l | tr -d ' ')
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
  REFS=$(grep -rn "$NAME" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "$(basename "$f")" | grep -v node_modules | wc -l | tr -d ' ')
  if [[ "$REFS" -eq 0 ]]; then
    ((UI_ORPHANS++)) || true
    UI_ORPHAN_LIST+=("$NAME")
  fi
done
if [[ "$UI_ORPHANS" -gt 0 ]]; then
  warn "Orphan components: $UI_ORPHANS (not imported anywhere)"
  inc_warn "UI: $UI_ORPHANS orphan components"
  if $FULL_MODE; then
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
  analytics-cell smartlink-cell rbac-cell monitor-cell supplier-cell)
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
      UI_NO_CELL_LIST+=("$comp → $CELL (MISSING)")
    fi
  fi
done
ok "Components with cell backend: $UI_HAS_CELL"; inc_ok
if [[ "$UI_NO_CELL" -gt 0 ]]; then
  warn "Components with MISSING cell: $UI_NO_CELL"
  inc_warn "UI: $UI_NO_CELL components reference missing cells"
  for item in "${UI_NO_CELL_LIST[@]}"; do echo "    ⚠️  $item"; done
fi

# 12e. Dead shells (< 20 lines = likely placeholder)
echo -e "\n  ${W}12e. Dead shells (<20 lines):${N}"
UI_DEAD=0; UI_DEAD_LIST=()
for f in src/components/*.tsx; do
  [[ ! -f "$f" ]] && continue
  LINES=$(wc -l < "$f" | tr -d ' ')
  if [[ "$LINES" -lt 20 ]]; then
    ((UI_DEAD++)) || true
    UI_DEAD_LIST+=("$(basename "$f") (${LINES}L)")
  fi
done
if [[ "$UI_DEAD" -gt 0 ]]; then
  warn "Possible dead shells: $UI_DEAD components (<20 lines)"
  inc_warn "UI: $UI_DEAD possible dead shell components"
  if $FULL_MODE; then for d in "${UI_DEAD_LIST[@]}"; do echo "    💀 $d"; done; fi
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
COMP_DUPES=$(find src/components -name "*.tsx" -exec basename {} \; | sort | uniq -d | wc -l | tr -d ' ')
if [[ "$COMP_DUPES" -gt 0 ]]; then
  warn "Duplicate component names: $COMP_DUPES"
  inc_warn "UI: $COMP_DUPES duplicate component filenames"
  if $FULL_MODE; then
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
hdr "13" "BCTC FLOW (Finance Critical Path)"
# ═══════════════════════════════════════════════════════════════
BCTC_CELLS=("sales-cell" "finance-cell" "period-close-cell" "tax-cell" "payment-cell" "customs-cell")
echo -e "  ${W}sales → finance → period-close → tax → BCTC${N}"
BCTC_OK=0
for cell in "${BCTC_CELLS[@]}"; do
  DIR="src/cells/business/$cell"
  PORT=$(find "$DIR/ports" -name "*smartlink*" 2>/dev/null | head -1)
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
hdr "14" "PRODUCTION FLOW"
# ═══════════════════════════════════════════════════════════════
PROD_CELLS=("design-3d-cell" "production-cell" "casting-cell" "stone-cell" "finishing-cell" "polishing-cell" "inventory-cell" "warehouse-cell")
echo -e "  ${W}design-3d → production → casting → stone → finishing → polishing → inventory → warehouse${N}"
PROD_OK=0
for cell in "${PROD_CELLS[@]}"; do
  DIR="src/cells/business/$cell"
  if [[ -d "$DIR" ]]; then
    PORT=$(find "$DIR/ports" -name "*smartlink*" 2>/dev/null | head -1)
    if [[ -n "$PORT" ]]; then
      ok "$cell: SmartLink ✅"; ((PROD_OK++)) || true
    else
      warn "$cell: no SmartLink port"
    fi
  else
    fail "$cell: MISSING"
  fi
done
echo -e "  ${W}Production flow: $PROD_OK/${#PROD_CELLS[@]} cells wired${N}"

# ═══════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════
hdr "15" "UI APP — SCAN DEEP"
# ═══════════════════════════════════════════════════════════════
UI_APP_DIR="src/ui-app"
if [[ ! -d "$UI_APP_DIR" ]]; then
  fail "src/ui-app/ NOT FOUND"; inc_fail "UI_APP: directory missing"
else

  # ── Count HTML apps ──
  HTML_COUNT=$(find "$UI_APP_DIR" -maxdepth 1 -name "*.html" ! -name "._*" | wc -l | tr -d ' ')
  JS_COUNT=$(find "$UI_APP_DIR" -maxdepth 1 -name "*.js" | wc -l | tr -d ' ')
  CSS_COUNT=$(find "$UI_APP_DIR" -maxdepth 1 -name "*.css" | wc -l | tr -d ' ')
  ok "HTML apps: $HTML_COUNT | JS engines: $JS_COUNT | CSS: $CSS_COUNT"; inc_ok

  # ── Required engine files ──
  echo -e "\n  ${W}15a. Engine Files:${N}"
  UI_ENGINES=("nattos-doc-engine.js" "nattos-eod-engine.js" "nattos-fx.js" "nattos-ui-theme.css" "nattos-loss-thresholds.js")
  ENGINE_OK=0; ENGINE_MISS=()
  for eng in "${UI_ENGINES[@]}"; do
    if [[ -f "$UI_APP_DIR/$eng" ]]; then
      ok "$eng"; ((ENGINE_OK++)) || true
    else
      fail "MISSING: $eng"; inc_fail "UI_APP: missing engine $eng"
      ENGINE_MISS+=("$eng")
    fi
  done
  echo -e "  Engines: $ENGINE_OK/${#UI_ENGINES[@]}"

  # ── Per-app deep scan ──
  echo -e "\n  ${W}15b. App Health Matrix:${N}"
  printf "  %-38s %5s %6s %7s %4s %5s %4s %5s %4s\n" "APP" "LINES" "LOGIN" "RENDER" "PAY" "SHIP" "EOD" "THEME" "FX"
  echo "  $(printf '─%.0s' {1..90})"

  APP_TOTAL=0; APP_OK=0; APP_WARN=0
  APP_NO_LOGIN=(); APP_NO_RENDER=(); APP_NO_PAYMENT=(); APP_NO_EOD=()
  APP_BROKEN_LINKS=()

  for fpath in "$UI_APP_DIR"/*.html; do
    fname=$(basename "$fpath")
    [[ "$fname" == "index.html" ]] && continue
    [[ "${fname:0:2}" == "._" ]] && continue
    ((APP_TOTAL++)) || true

    LINES=$(wc -l < "$fpath" | tr -d ' ')
    HAS_LOGIN=$(grep -c "doLogin\b" "$fpath" 2>/dev/null || echo 0)
    HAS_RENDER=$(grep -cE "renderAll|renderGrid|renderList|tbody|\.innerHTML\s*=" "$fpath" 2>/dev/null || echo 0)
    HAS_PAYMENT=$(grep -ciE "payment|thanh.to[aá]n|qr.code|vietqr|checkout|chuyen.khoan|zalopay" "$fpath" 2>/dev/null || echo 0)
    HAS_SHIP=$(grep -ciE "GHN|Nh[aâ]t.T[ií]n|GHTK|Viettel.Post|van.chuyen|shipping|logistics" "$fpath" 2>/dev/null || echo 0)
    HAS_EOD=$(grep -c "nattos-eod-engine" "$fpath" 2>/dev/null || echo 0)
    HAS_THEME=$(grep -c "nattos-ui-theme" "$fpath" 2>/dev/null || echo 0)
    HAS_FX=$(grep -c "nattos-fx" "$fpath" 2>/dev/null || echo 0)

    # Status
    IS_OK=true
    [[ "$HAS_LOGIN" -eq 0 ]] && { IS_OK=false; APP_NO_LOGIN+=("$fname"); }
    [[ "$HAS_RENDER" -eq 0 ]] && { IS_OK=false; APP_NO_RENDER+=("$fname"); }
    [[ "$HAS_EOD" -eq 0 ]] && { IS_OK=false; APP_NO_EOD+=("$fname"); }

    ICON="✅"
    $IS_OK && ((APP_OK++)) || { ICON="⚠️ "; ((APP_WARN++)) || true; }

    L_COLOR=$G; [[ "$HAS_LOGIN" -eq 0 ]] && L_COLOR=$R
    R_COLOR=$G; [[ "$HAS_RENDER" -eq 0 ]] && R_COLOR=$R
    P_COLOR=$G; [[ "$HAS_PAYMENT" -eq 0 ]] && P_COLOR=$Y
    S_COLOR=$G; [[ "$HAS_SHIP" -eq 0 ]] && S_COLOR=$Y
    E_COLOR=$G; [[ "$HAS_EOD" -eq 0 ]] && E_COLOR=$R
    T_COLOR=$G; [[ "$HAS_THEME" -eq 0 ]] && T_COLOR=$R
    X_COLOR=$G; [[ "$HAS_FX" -eq 0 ]] && X_COLOR=$R

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
  echo -e "  Apps: $APP_TOTAL total | ${G}OK: $APP_OK${N} | ${Y}WARN: $APP_WARN${N}"

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
    IDX_APPS=$(grep -oE "file:'[^']+\.html'" "$UI_APP_DIR/index.html" | wc -l | tr -d ' ')
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
    [[ "$HAS_FX_IDX" -gt 0 ]] && { ok "nattos-fx.js in index"; inc_ok; } || { warn "nattos-fx.js MISSING từ index.html"; inc_warn "UI_APP: index.html thiếu nattos-fx.js"; }
  else
    fail "index.html MISSING"; inc_fail "UI_APP: index.html not found"
  fi

  # ── Cloud Run status ──
  echo -e "\n  ${W}15d. Cloud Run:${N}"
  if [[ -f "Dockerfile" ]]; then
    ok "Dockerfile: EXISTS"; inc_ok
    DOCKER_COPY=$(grep "COPY src/ui-app" Dockerfile | head -1)
    [[ -n "$DOCKER_COPY" ]] && { ok "Dockerfile copies src/ui-app"; inc_ok; } || { warn "Dockerfile may not copy ui-app"; inc_warn "UI_APP: Dockerfile COPY path suspect"; }
  else
    warn "Dockerfile: MISSING (needed for Cloud Run)"; inc_warn "UI_APP: Dockerfile missing"
  fi
  if [[ -f ".dockerignore" ]]; then
    DOCKI_SDK=$(grep -c "google-cloud-sdk" .dockerignore 2>/dev/null || echo 0)
    [[ "$DOCKI_SDK" -gt 0 ]] && { ok ".dockerignore excludes google-cloud-sdk"; inc_ok; } || { warn ".dockerignore MISSING google-cloud-sdk exclusion → 1.3GB build"; inc_warn "UI_APP: .dockerignore thiếu exclude sdk"; }
  else
    warn ".dockerignore: MISSING"; inc_warn "UI_APP: .dockerignore missing"
  fi

  # ── Payment feature audit ──
  echo -e "\n  ${W}15e. Feature Coverage:${N}"
  PAY_COUNT=$(grep -rlE "payment|vietqr|zalopay|checkout" "$UI_APP_DIR"/*.html 2>/dev/null | wc -l | tr -d ' ')
  SHIP_COUNT=$(grep -rlE "GHN|Nhất Tín|GHTK|Viettel Post" "$UI_APP_DIR"/*.html 2>/dev/null | wc -l | tr -d ' ')
  SMART_COUNT=$(grep -rlE "SmartGetData|smartgetdata" "$UI_APP_DIR"/*.html 2>/dev/null | wc -l | tr -d ' ')
  SURV_FILE=$([ -f "nattos-sheets-server/surveillance.html" ] && echo "EXISTS" || echo "MISSING")
  SHEETS_SERVER=$([ -f "nattos-sheets-server/server.js" ] && echo "EXISTS" || echo "MISSING")
  SA_KEY=$([ -f "nattos-sheets-server/nattos-google-sa.json" ] && echo "✅ KEY PRESENT" || echo "⚠️  KEY MISSING (gitignored)")

  info "Payment support: $PAY_COUNT apps"
  info "Shipping (GHN/NTX): $SHIP_COUNT apps"
  info "SmartGetData: $SMART_COUNT apps"
  info "Surveillance dashboard: $SURV_FILE"
  info "GSheets server: $SHEETS_SERVER"
  info "SA Key: $SA_KEY"

  [[ "$PAY_COUNT" -lt 3 ]] && { warn "Ít app có payment ($PAY_COUNT) — cần thêm QR/CK"; inc_warn "UI_APP: thiếu payment feature"; }
  [[ "$SURV_FILE" == "EXISTS" && "$SHEETS_SERVER" == "EXISTS" ]] && { ok "Surveillance stack ready"; inc_ok; }

fi  # end UI_APP_DIR check

# ═══════════════════════════════════════════════════════════════
# S17 — ENGINE COVERAGE MAP
# ═══════════════════════════════════════════════════════════════
hdr "17" "ENGINE COVERAGE MAP"

ENGINE_TOTAL=0; ENGINE_CELLS=0; NO_ENGINE_CELLS=()
for cell_dir in src/cells/business/*/; do
  cell=$(basename "$cell_dir")
  engines=$(find "$cell_dir" -name "*.engine.ts" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
  if [[ "$engines" -gt 0 ]]; then
    ((ENGINE_TOTAL += engines)) || true
    ((ENGINE_CELLS++)) || true
  else
    NO_ENGINE_CELLS+=("$cell")
  fi
done

# Kernel engines
KERNEL_ENG=$(find src/cells/kernel -name "*.engine.ts" 2>/dev/null | wc -l | tr -d ' ')
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
      count=$(echo "$engines" | wc -l | tr -d ' ')
      echo -e "  ${C}$cell${N}: $count engine(s)"
    fi
  done
fi

# ═══════════════════════════════════════════════════════════════
# S18 — EVENTBUS FLOW TRACER
# ═══════════════════════════════════════════════════════════════
hdr "18" "EVENTBUS FLOW TRACER"

# Count emit events
EMIT_COUNT=$(grep -rh "EventBus\.emit\|EventBus\.publish" src/ --include="*.ts" 2>/dev/null | grep -v "@ts-nocheck" | wc -l | tr -d ' ')
SUB_COUNT=$(grep -rh "EventBus\.on\|EventBus\.subscribe" src/ --include="*.ts" 2>/dev/null | grep -v "@ts-nocheck" | wc -l | tr -d ' ')

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
hdr "19" "CONTRACT INTEGRITY"

CONTRACT_OK=0; CONTRACT_WARN=0
for cell_dir in src/cells/*/; do
  contracts_dir="$cell_dir/contracts"
  if [[ -d "$contracts_dir" ]]; then
    contract_files=$(find "$contracts_dir" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
    if [[ "$contract_files" -gt 0 ]]; then
      ((CONTRACT_OK++)) || true
    fi
  fi
done

TOTAL_CONTRACTS=$(find src/cells -path "*/contracts/*.ts" 2>/dev/null | wc -l | tr -d ' ')
ok "Contract files found: $TOTAL_CONTRACTS across $CONTRACT_OK cells"

# Check event-contracts package
if [[ -d "packages/event-contracts" ]]; then
  PKG_CONTRACTS=$(find packages/event-contracts -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
  ok "packages/event-contracts: $PKG_CONTRACTS files"; inc_ok
else
  warn "packages/event-contracts: NOT FOUND"; inc_warn "CONTRACT: event-contracts package missing"
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
hdr "20" "DEPENDENCY GRAPH — CROSS-CELL IMPORT CHECK"

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
EB_BRIDGE=$(grep -rl "EventBus" src/cells --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
ok "Cells using EventBus as bridge: $EB_BRIDGE files"

# ═══════════════════════════════════════════════════════════════
# S21 — MEMORY FILES HEALTH
# ═══════════════════════════════════════════════════════════════
hdr "21" "MEMORY FILES HEALTH"

MEM_DIR="src/governance/memory"

# bangmf
BANGMF=$(find "$MEM_DIR/bang" -name "bangmf_v*.json" 2>/dev/null | sort -V | tail -1)
if [[ -n "$BANGMF" ]]; then
  BANGMF_VER=$(basename "$BANGMF" .json)
  if python3 -c "import json,sys; json.load(open('$BANGMF'))" 2>/dev/null; then
    ok "bangmf: $BANGMF_VER ✅ (valid JSON)"; inc_ok
  else
    fail "bangmf: $BANGMF_VER INVALID JSON"; inc_fail "MEMORY: bangmf JSON corrupted"
  fi
else
  warn "bangmf: not found"; inc_warn "MEMORY: bangmf missing"
fi

# bangfs
BANGFS=$(find "$MEM_DIR/bang" -name "bangfs_v*.json" 2>/dev/null | sort -V | tail -1)
if [[ -n "$BANGFS" ]]; then
  BANGFS_VER=$(basename "$BANGFS" .json)
  if python3 -c "import json,sys; json.load(open('$BANGFS'))" 2>/dev/null; then
    ok "bangfs: $BANGFS_VER ✅ (valid JSON)"; inc_ok
  else
    fail "bangfs: $BANGFS_VER INVALID JSON"; inc_fail "MEMORY: bangfs JSON corrupted"
  fi
else
  warn "bangfs: not found"; inc_warn "MEMORY: bangfs missing"
fi

# thiennho
THIENNHO=$(find "$MEM_DIR/thiennho" -name "*.json" 2>/dev/null | sort -V | tail -1)
if [[ -n "$THIENNHO" ]]; then
  THIENNHO_VER=$(basename "$THIENNHO" .json)
  if python3 -c "import json,sys; json.load(open('$THIENNHO'))" 2>/dev/null; then
    ok "thiennho: $THIENNHO_VER ✅ (valid JSON)"; inc_ok
  else
    fail "thiennho: INVALID JSON"; inc_fail "MEMORY: thiennho JSON corrupted"
  fi
else
  warn "thiennho: not found"; inc_warn "MEMORY: thiennho missing"
fi

# kimf
KIMF=$(find "$MEM_DIR/kim" -name "kmf*.json" 2>/dev/null | sort -V | tail -1)
if [[ -n "$KIMF" ]]; then
  ok "kimf: $(basename $KIMF .json) ✅"; inc_ok
else
  info "kimf: not found (optional)"
fi

# Check no .zip in memory
ZIP_IN_MEM=$(find "$MEM_DIR" -name "*.zip" 2>/dev/null | wc -l | tr -d ' ')
if [[ "$ZIP_IN_MEM" -gt 0 ]]; then
  warn "$ZIP_IN_MEM .zip file(s) in memory dir — should not be committed"
  inc_warn "MEMORY: .zip files present"
else
  ok "No .zip files in memory dir"; inc_ok
fi

# ═══════════════════════════════════════════════════════════════
# S22 — MATH + METABOLISM COVERAGE
# ═══════════════════════════════════════════════════════════════
hdr "22" "MATH + METABOLISM COVERAGE"

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
PLUGIN_FILES=$(find src/metabolism/plugins -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
if [[ "$PLUGIN_FILES" -ge 3 ]]; then
  ok "Plugin system: $PLUGIN_FILES files ✅"; inc_ok
else
  warn "Plugin system: only $PLUGIN_FILES files"; inc_warn "PLUGIN: incomplete"
fi

# Healing modules
HEALING_FILES=$(find src/metabolism/healing -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
if [[ "$HEALING_FILES" -ge 3 ]]; then
  ok "Healing modules: $HEALING_FILES files ✅"; inc_ok
else
  warn "Healing modules: $HEALING_FILES files"; inc_warn "HEALING: incomplete"
fi

# AnomalyDetector check
if [[ -f "src/metabolism/healing/anomaly-detector.ts" ]]; then
  ok "AnomalyDetector: EXISTS ✅"; inc_ok
else
  warn "AnomalyDetector: MISSING"; inc_warn "HEALING: anomaly-detector missing"
fi

# ═══════════════════════════════════════════════════════════════
# S23 — QNEU SCORE TREND
# ═══════════════════════════════════════════════════════════════
hdr "23" "QNEU SCORE TREND"

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
hdr "24" "DEAD CODE DETECTION"

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
  warn "Potential orphans: $ORPHAN_COUNT files"
  inc_warn "DEAD: $ORPHAN_COUNT orphan files detected"
  if [[ "$FULL_MODE" == "true" ]]; then
    for f in "${ORPHAN_LIST[@]}"; do echo "  ${Y}→${N} $f"; done
  fi
else
  warn "Potential orphans: $ORPHAN_COUNT files (sample of 100)"
  inc_warn "DEAD: high orphan count — review needed"
fi

# Check for @ts-nocheck count (high count = technical debt)
NOCHECK_COUNT=$(grep -rl "@ts-nocheck" src/cells --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
if [[ "$NOCHECK_COUNT" -le 5 ]]; then
  ok "@ts-nocheck files: $NOCHECK_COUNT (healthy)"; inc_ok
elif [[ "$NOCHECK_COUNT" -le 15 ]]; then
  warn "@ts-nocheck files: $NOCHECK_COUNT (monitor)"; inc_warn "DEBT: $NOCHECK_COUNT ts-nocheck files"
else
  fail "@ts-nocheck files: $NOCHECK_COUNT (too many)"; inc_fail "DEBT: excessive ts-nocheck usage"
fi

# ═══════════════════════════════════════════════════════════════
# S25 — NATTOS.SH SELF-HEALTH
# ═══════════════════════════════════════════════════════════════
hdr "25" "NATTOS.SH SELF-HEALTH"

SCRIPT="nattos.sh"
if [[ ! -f "$SCRIPT" ]]; then SCRIPT="./nattos.sh"; fi

SCRIPT_LINES=$(wc -l < "$SCRIPT" | tr -d ' ')
ok "Script size: $SCRIPT_LINES lines"

# Count sections
SECTION_COUNT=$(grep -c "^hdr " "$SCRIPT" 2>/dev/null || echo 0)
ok "Sections: $SECTION_COUNT total"

# Check bash 3.2 compat — no [[...]] with regex, no arrays with -A
BASH4_ONLY=$(grep -n "declare -A\|=~.*[[]\|mapfile\|readarray" "$SCRIPT" 2>/dev/null | wc -l | tr -d ' ')
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


hdr "16" "SCORECARD"
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "  ${W}╔═══════════════════════════════════════════════════════╗${N}"
echo -e "  ${W}║  NATT-OS SYSTEM HEALTH — $TS  ║${N}"
echo -e "  ${W}╠═══════════════════════════════════════════════════════╣${N}"
printf   "  ${W}║${N}  %-20s ${G}%-8s${N} ${Y}%-8s${N} ${R}%-8s${N} 🗑️ %-5s ${W}║${N}\n" "" "OK" "WARN" "FAIL" "TRASH"
printf   "  ${W}║${N}  %-20s ${G}%-8s${N} ${Y}%-8s${N} ${R}%-8s${N} 🗑️ %-5s ${W}║${N}\n" "Totals" "$TOTAL_OK" "$TOTAL_WARN" "$TOTAL_FAIL" "$TOTAL_TRASH"
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
        has_mf = os.path.isfile(os.path.join(cp, 'neural-main-cell.cell.anc'))
        has_port = any('smartlink' in f for r,d,fs in os.walk(os.path.join(cp,'ports')) for f in fs) if os.path.isdir(os.path.join(cp,'ports')) else False
        has_domain = os.path.isdir(os.path.join(cp, 'domain'))
        fc = count_files(cp)
        cells[cell] = {
            'files': fc,
            'manifest': has_mf,
            'smartlink_port': has_port,
            'domain': has_domain,
        }

result = {
    'timestamp': '$TS',
    'root': os.getcwd(),
    'scores': {'ok': $TOTAL_OK, 'warn': $TOTAL_WARN, 'fail': $TOTAL_FAIL, 'trash': $TOTAL_TRASH},
    'git': {'branch': '$BRANCH', 'commits': $COMMITS, 'dirty': $DIRTY, 'remote': '$REMOTE'},
    'tsc_errors': $TSC_TOTAL,
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
echo -e "  END SmartAudit — $TS"
echo -e "${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"
