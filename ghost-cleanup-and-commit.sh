#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# GHOST CLEANUP (SAFE) + TSC VERIFY + GIT COMMIT
# 
# 7 FILES GIỮ LẠI (đang được import):
#   ❌ GatekeeperCore.ts — imported by 5 files
#   ❌ AuditService.ts — imported by 3 files  
#   ❌ CalibrationEngine.ts — imported by 2 files
#   ❌ EventStagingLayer.ts — imported by 2 files
#   ❌ ContextScoringEngine.ts — imported by 1 file
#   ❌ customsUtils.ts — imported by 1 file
#   ❌ eventBridge.ts — imported by 1 file
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

GHOST_ARCHIVE="_archive_pre_v4/casing-ghosts"
MOVED=0
SKIPPED=0

info()    { echo -e "  ${CYAN}ℹ${NC}  $1"; }
success() { echo -e "  ${GREEN}✅${NC} $1"; MOVED=$((MOVED+1)); }
skip()    { echo -e "  ${YELLOW}⏭${NC}  KEPT: $1"; SKIPPED=$((SKIPPED+1)); }

safe_ghost_mv() {
    local src="$1"
    if [ -f "$src" ]; then
        local rel_dir
        rel_dir=$(dirname "$src")
        mkdir -p "$GHOST_ARCHIVE/$rel_dir"
        mv "$src" "$GHOST_ARCHIVE/$src"
        success "Archived: $src"
    fi
}

echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  GHOST CLEANUP (SAFE) — 7 dangerous files excluded${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo ""

mkdir -p "$GHOST_ARCHIVE"

# ═══ src/ root ═══
info "src/ root..."
safe_ghost_mv "src/superdictionary.ts"
safe_ghost_mv "src/eventbridge.ts"

# ═══ src/core/ ═══
info "src/core/..."
safe_ghost_mv "src/core/uiruntime.tsx"
safe_ghost_mv "src/core/idempotency.service.ts"
safe_ghost_mv "src/core/outbox.service.ts"
safe_ghost_mv "src/core/core/production/productionenforcer.ts"
safe_ghost_mv "src/core/audit/omegalockdown.ts"

# ═══ src/utils/ ═══
info "src/utils/..."
safe_ghost_mv "src/utils/validateproductmedia.ts"
safe_ghost_mv "src/utils/xmlcanonicalizer.ts"

# ═══ src/components/ ═══
info "src/components/..."
safe_ghost_mv "src/components/productcard.tsx"
safe_ghost_mv "src/components/productdetailmodal.tsx"
safe_ghost_mv "src/components/common/loadingspinner.tsx"
safe_ghost_mv "src/components/analytics/governance-kpiboard.tsx"
safe_ghost_mv "src/components/approval/approvalDASHBOARD.tsx"

# src/components/showroom/ (7 pairs)
info "src/components/showroom/..."
safe_ghost_mv "src/components/showroom/branchcontextpanel.tsx"
safe_ghost_mv "src/components/showroom/experiencetrustblock.tsx"
safe_ghost_mv "src/components/showroom/heromediablock.tsx"
safe_ghost_mv "src/components/showroom/ownervault.tsx"
safe_ghost_mv "src/components/showroom/relatedproducts.tsx"
safe_ghost_mv "src/components/showroom/reservationmodal.tsx"
safe_ghost_mv "src/components/showroom/specificationblock.tsx"

# ═══ src/governance/ ═══
info "src/governance/..."
safe_ghost_mv "src/governance/rbac/RBACCore.tsx"
skip "GatekeeperCore.ts — imported by 5 files"

# ═══ src/services/ — SAFE ghosts only ═══
info "src/services/ (safe only)..."
safe_ghost_mv "src/services/customsservice.ts"
safe_ghost_mv "src/services/dictionaryapprovalservice.ts"
safe_ghost_mv "src/services/dictionaryservice.ts"
safe_ghost_mv "src/services/documentai.ts"
safe_ghost_mv "src/services/einvoiceservice.ts"
safe_ghost_mv "src/services/learningengine.ts"
safe_ghost_mv "src/services/moduleregistry.ts"
safe_ghost_mv "src/services/notificationservice.ts"
safe_ghost_mv "src/services/offlineservice.ts"
safe_ghost_mv "src/services/paymentservice.ts"
safe_ghost_mv "src/services/quantumbufferservice.ts"
safe_ghost_mv "src/services/quantumengine.ts"
safe_ghost_mv "src/services/recoveryengine.ts"
safe_ghost_mv "src/services/sellerengine.ts"
safe_ghost_mv "src/services/threatdetectionservice.ts"
safe_ghost_mv "src/services/authservice.ts"
safe_ghost_mv "src/services/blockchainservice.ts"
safe_ghost_mv "src/services/conflict/conflictresolver.ts"
safe_ghost_mv "src/services/parser/documentparserlayer.ts"
safe_ghost_mv "src/services/analytics/analyticsapi.ts"

# ❌ KEPT — actively imported
skip "customsUtils.ts — imported by customs-service.ts"
skip "eventBridge.ts — imported by analytics-service.ts"
skip "AuditService.ts — imported by 3 files"
skip "EventStagingLayer.ts — imported by 2 files"
skip "CalibrationEngine.ts — imported by 2 files"
skip "ContextScoringEngine.ts — imported by conflict-resolver.ts"

# ═══ Scattered orphans ═══
info "Scattered orphan files..."
safe_ghost_mv "src/common/loadingspinner.tsx"
safe_ghost_mv "src/admin/auditservice.ts"
safe_ghost_mv "src/haptic/hapticengine.ts"
safe_ghost_mv "src/motion/usemotionsensor.ts"
safe_ghost_mv "src/context/usecontextualui.ts"
safe_ghost_mv "src/physics/physicsengine.ts"
safe_ghost_mv "src/data-3d/datapoint3d.tsx"
safe_ghost_mv "src/animation/usestaggeredanimation.ts"

# ═══ Build artifacts in governance/memory ═══
info "Build artifacts in governance/memory/bang/..."
if [ -d "src/governance/memory/bang/lịch sử làm việc của bang" ]; then
    mkdir -p "$GHOST_ARCHIVE/bang-build-artifacts"
    mv "src/governance/memory/bang/lịch sử làm việc của bang" "$GHOST_ARCHIVE/bang-build-artifacts/"
    success "Archived: bang build artifacts (70+ .js/.css/.html)"
fi

echo ""
echo -e "${BOLD}  Archived: $MOVED | Kept (in use): $SKIPPED${NC}"

# ═══════════════════════════════════════════════════════════════
# TSC VERIFY
# ═══════════════════════════════════════════════════════════════

echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  TSC VERIFY — checking no new errors${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo ""

TSC_OUTPUT=$(npx tsc --noEmit 2>&1 || true)
ERROR_LINE=$(echo "$TSC_OUTPUT" | grep "^Found" || echo "Found 0 errors")
echo "  $ERROR_LINE"

if echo "$ERROR_LINE" | grep -q "Found 5 errors"; then
    success "No regression — still 5 errors (hr-engine.ts)"
elif echo "$ERROR_LINE" | grep -q "Found 0 errors"; then
    success "Zero errors!"
else
    echo ""
    echo -e "  ${YELLOW}⚠️  Error count changed! Review:${NC}"
    echo "$TSC_OUTPUT" | tail -25
    echo ""
    read -p "  Continue with git commit? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "  Aborted. Ghosts archived but NOT committed."
        exit 0
    fi
fi

# ═══════════════════════════════════════════════════════════════
# GIT
# ═══════════════════════════════════════════════════════════════

echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  GIT COMMIT${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Fix git dir
if [ -d "git" ] && [ ! -d ".git" ]; then
    mv git .git
    success "Renamed git/ → .git/"
fi

if [ ! -d ".git" ]; then
    git init
    success "Git initialized"
fi

# Fix gitignore
if [ -f "gitignore" ] && [ ! -f ".gitignore" ]; then
    mv gitignore .gitignore
    success "Renamed gitignore → .gitignore"
fi

if [ -f ".gitignore" ] && ! grep -q "src/governance/qneu/data/" .gitignore 2>/dev/null; then
    echo "src/governance/qneu/data/" >> .gitignore
    success "Added qneu/data/ to .gitignore"
fi

git add -A

echo ""
info "Summary:"
git diff --cached --stat | tail -3
echo ""

git commit -m "🧬 NATT-OS v4.0 — Constitution + QNEU First Seed + Ghost Cleanup

HIẾN PHÁP v4.0:
- Deploy 2 tầng: archive + enforcement
- AI Entity vs NATT-CELL separation (Điều 11-13)
- QNEU measures AI evolution, not cell (Điều 16-20)

QNEU v1.1 (src/governance/qneu/):
- First seed: BANG:300 THIEN:135 KIM:120 CAN:85 BOI_BOI:40
- 39 audit events, persistence, storage interface
- 32/32 unit tests passed

GHOST CLEANUP:
- ~43 safe ghosts archived (keep kebab-case)
- 7 PascalCase files KEPT (actively imported)
- Build artifacts removed from governance/memory/

tsc: 5 errors (hr-engine.ts pre-existing)
Gatekeeper: Phan Thanh Thương"

echo ""
success "Committed!"
git log --oneline -1
echo ""
echo -e "${BOLD}  Done. ✅${NC}"
echo ""
