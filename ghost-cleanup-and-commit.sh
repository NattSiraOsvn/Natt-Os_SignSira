#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# PHASE 1: DỌN CASING GHOSTS + PHASE 2: GIT COMMIT
# Quy tắc: GIỮ kebab-case, ARCHIVE PascalCase/joined
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

GHOST_ARCHIVE="_archive_pre_v4/casing-ghosts"
MOVED=0

info()    { echo -e "  ${CYAN}ℹ${NC}  $1"; }
success() { echo -e "  ${GREEN}✅${NC} $1"; MOVED=$((MOVED+1)); }
warn()    { echo -e "  ${YELLOW}⚠️${NC}  $1"; }

safe_ghost_mv() {
    local src="$1" keep="$2"
    if [ -f "$src" ]; then
        local rel_dir
        rel_dir=$(dirname "$src")
        mkdir -p "$GHOST_ARCHIVE/$rel_dir"
        mv "$src" "$GHOST_ARCHIVE/$src"
        success "Ghost archived: $src (kept: $(basename "$keep"))"
    fi
}

echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  PHASE 1: DỌN CASING GHOSTS${NC}"
echo -e "${BOLD}  Quy tắc: GIỮ kebab-case → ARCHIVE joined/PascalCase${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo ""

mkdir -p "$GHOST_ARCHIVE"

# ═══ src/ root level ═══
info "src/ root..."
safe_ghost_mv "src/superdictionary.ts" "src/super-dictionary.ts"

# ═══ src/core/ ═══
info "src/core/..."
safe_ghost_mv "src/core/uiruntime.tsx" "src/core/ui-runtime.tsx"
safe_ghost_mv "src/core/idempotency.service.ts" "src/core/idempotency-service.ts"
safe_ghost_mv "src/core/outbox.service.ts" "src/core/outbox-service.ts"

# src/core/core/production/
safe_ghost_mv "src/core/core/production/productionenforcer.ts" "src/core/core/production/production-enforcer.ts"

# src/core/audit/
safe_ghost_mv "src/core/audit/omegalockdown.ts" "src/core/audit/omega-lockdown.ts"

# ═══ src/utils/ ═══
info "src/utils/..."
safe_ghost_mv "src/utils/validateproductmedia.ts" "src/utils/validate-product-media.ts"
safe_ghost_mv "src/utils/xmlcanonicalizer.ts" "src/utils/xml-canonicalizer.ts"

# ═══ src/components/ ═══
info "src/components/..."
safe_ghost_mv "src/components/productcard.tsx" "src/components/product-card.tsx"
safe_ghost_mv "src/components/productdetailmodal.tsx" "src/components/product-detail-modal.tsx"
safe_ghost_mv "src/components/customizationrequest.tsx" "src/components/customizationrequest.tsx"
safe_ghost_mv "src/components/filterpanel.tsx" "src/components/filterpanel.tsx"

# src/components/common/
safe_ghost_mv "src/components/common/loadingspinner.tsx" "src/components/common/loading-spinner.tsx"

# src/components/analytics/
safe_ghost_mv "src/components/analytics/governance-kpiboard.tsx" "src/components/analytics/governance-kpi-board.tsx"

# src/components/approval/
safe_ghost_mv "src/components/approval/approvalDASHBOARD.tsx" "src/components/approval/approval-dashboard.tsx"

# src/components/showroom/ (7 pairs)
info "src/components/showroom/..."
safe_ghost_mv "src/components/showroom/branchcontextpanel.tsx" "src/components/showroom/branch-context-panel.tsx"
safe_ghost_mv "src/components/showroom/experiencetrustblock.tsx" "src/components/showroom/experience-trust-block.tsx"
safe_ghost_mv "src/components/showroom/heromediablock.tsx" "src/components/showroom/hero-media-block.tsx"
safe_ghost_mv "src/components/showroom/ownervault.tsx" "src/components/showroom/owner-vault.tsx"
safe_ghost_mv "src/components/showroom/relatedproducts.tsx" "src/components/showroom/related-products.tsx"
safe_ghost_mv "src/components/showroom/reservationmodal.tsx" "src/components/showroom/reservation-modal.tsx"
safe_ghost_mv "src/components/showroom/specificationblock.tsx" "src/components/showroom/specification-block.tsx"

# ═══ src/governance/ ═══
info "src/governance/..."
safe_ghost_mv "src/governance/rbac/RBACCore.tsx" "src/governance/rbac/rbac-core.tsx"
safe_ghost_mv "src/governance/gatekeeper/GatekeeperCore.ts" "src/governance/gatekeeper/gatekeeper-core.ts"

# ═══ src/services/ (biggest ghost zone) ═══
info "src/services/ flat files..."
safe_ghost_mv "src/services/customsservice.ts" "src/services/customs-service.ts"
safe_ghost_mv "src/services/dictionaryapprovalservice.ts" "src/services/dictionary-approval-service.ts"
safe_ghost_mv "src/services/dictionaryservice.ts" "src/services/dictionary-service.ts"
safe_ghost_mv "src/services/documentai.ts" "src/services/document-ai.ts"
safe_ghost_mv "src/services/einvoiceservice.ts" "src/services/e-invoice-service.ts"
safe_ghost_mv "src/services/eventBridge.ts" "src/services/event-bridge.ts"
safe_ghost_mv "src/services/learningengine.ts" "src/services/learning-engine.ts"
safe_ghost_mv "src/services/moduleregistry.ts" "src/services/module-registry.ts"
safe_ghost_mv "src/services/notificationservice.ts" "src/services/notification-service.ts"
safe_ghost_mv "src/services/offlineservice.ts" "src/services/offline-service.ts"
safe_ghost_mv "src/services/paymentservice.ts" "src/services/payment-service.ts"
safe_ghost_mv "src/services/quantumbufferservice.ts" "src/services/quantum-buffer-service.ts"
safe_ghost_mv "src/services/quantumengine.ts" "src/services/quantum-engine.ts"
safe_ghost_mv "src/services/recoveryengine.ts" "src/services/recovery-engine.ts"
safe_ghost_mv "src/services/sellerengine.ts" "src/services/seller-engine.ts"
safe_ghost_mv "src/services/threatdetectionservice.ts" "src/services/threat-detection-service.ts"
safe_ghost_mv "src/services/authservice.ts" "src/services/authservice.ts"
safe_ghost_mv "src/services/blockchainservice.ts" "src/services/blockchainservice.ts"

# src/services/ subdirs with ghosts
info "src/services/ subdirs..."
safe_ghost_mv "src/services/staging/EventStagingLayer.ts" "src/services/staging/event-staging-layer.ts"
safe_ghost_mv "src/services/calibration/CalibrationEngine.ts" "src/services/calibration/calibration-engine.ts"
safe_ghost_mv "src/services/admin/AuditService.ts" "src/services/admin/audit-service.ts"
safe_ghost_mv "src/services/conflict/conflictresolver.ts" "src/services/conflict/conflict-resolver.ts"
safe_ghost_mv "src/services/parser/documentparserlayer.ts" "src/services/parser/document-parser-layer.ts"
safe_ghost_mv "src/services/analytics/analyticsapi.ts" "src/services/analytics/analytics-api.ts"
safe_ghost_mv "src/services/monitoring/OrphanDetectionBot.ts" "src/services/monitoring/OrphanDetectionBot.ts"
safe_ghost_mv "src/services/scoring/ContextScoringEngine.ts" "src/services/scoring/ContextScoringEngine.ts"
safe_ghost_mv "src/services/supplier/SupplierEngine.ts" "src/services/supplier/SupplierEngine.ts"
safe_ghost_mv "src/services/ReconciliationService.ts" "src/services/ReconciliationService.ts"
safe_ghost_mv "src/services/RefundWorkflowService.ts" "src/services/RefundWorkflowService.ts"
safe_ghost_mv "src/services/customsUtils.ts" "src/services/customsUtils.ts"
safe_ghost_mv "src/services/enterpriseLinker.ts" "src/services/enterpriseLinker.ts"
safe_ghost_mv "src/services/gdbEngine.ts" "src/services/gdbEngine.ts"

# ═══ Other scattered ghosts ═══
info "Other locations..."
safe_ghost_mv "src/common/loadingspinner.tsx" "src/components/common/loading-spinner.tsx"
safe_ghost_mv "src/admin/auditservice.ts" "src/admin/auditservice.ts"
safe_ghost_mv "src/haptic/hapticengine.ts" "src/haptic/hapticengine.ts"
safe_ghost_mv "src/motion/usemotionsensor.ts" "src/motion/usemotionsensor.ts"
safe_ghost_mv "src/context/usecontextualui.ts" "src/context/usecontextualui.ts"
safe_ghost_mv "src/physics/physicsengine.ts" "src/physics/physicsengine.ts"
safe_ghost_mv "src/data-3d/datapoint3d.tsx" "src/data-3d/datapoint3d.tsx"
safe_ghost_mv "src/animation/usestaggeredanimation.ts" "src/animation/usestaggeredanimation.ts"
safe_ghost_mv "src/eventbridge.ts" "src/eventbridge.ts"

# ═══ Rác trong governance/memory ═══
info "Cleaning build artifacts from governance/memory/bang/..."
if [ -d "src/governance/memory/bang/lịch sử làm việc của bang" ]; then
    mkdir -p "$GHOST_ARCHIVE/bang-build-artifacts"
    mv "src/governance/memory/bang/lịch sử làm việc của bang" "$GHOST_ARCHIVE/bang-build-artifacts/"
    success "Archived: bang build artifacts (70+ .js/.css/.html files)"
fi

echo ""
echo -e "${BOLD}  Ghost cleanup: $MOVED items archived${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# PHASE 2: GIT
# ═══════════════════════════════════════════════════════════════

echo -e "${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  PHASE 2: GIT COMMIT${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if git is initialized
if [ -d ".git" ]; then
    info "Git found at .git/"
elif [ -d "git" ]; then
    warn "Git at ./git/ (no dot prefix). Fixing..."
    mv git .git
    success "Renamed git/ → .git/"
else
    info "No git found. Initializing..."
    git init
    success "Git initialized"
fi

# Check .gitignore
if [ ! -f ".gitignore" ]; then
    if [ -f "gitignore" ]; then
        mv gitignore .gitignore
        success "Renamed gitignore → .gitignore"
    else
        cat > .gitignore << 'GIEOF'
node_modules/
dist/
*.log
.DS_Store
src/governance/qneu/data/
GIEOF
        success "Created .gitignore"
    fi
fi

# Ensure qneu data is gitignored
if ! grep -q "src/governance/qneu/data/" .gitignore 2>/dev/null; then
    echo "src/governance/qneu/data/" >> .gitignore
    success "Added qneu/data/ to .gitignore"
fi

# Stage everything
git add -A

# Show status summary
echo ""
info "Git status:"
git status --short | head -30
echo ""

CHANGED=$(git status --short | wc -l | tr -d ' ')
info "Total changed files: $CHANGED"
echo ""

# Commit
git commit -m "🧬 NATT-OS Constitution v4.0 + QNEU v1.1 First Seed

HIẾN PHÁP v4.0:
- Deploy 2 tầng: natt-os/constitution/ (archive) + src/governance/constitution/ (enforcement)
- Phân tách AI Entity vs NATT-CELL (Điều 11-13)
- QNEU đo AI evolution, không đo cell (Điều 16-20)
- Constitution index.ts enforcement constants

QNEU v1.1 RUNTIME (src/governance/qneu/):
- First seed planted: 5 AI Entity scores (BANG:300, THIEN:135, KIM:120, CAN:85, BOI_BOI:40)
- 39 audit events persisted
- Calculator + Imprint Engine + Validator + Persistence + Runtime
- Storage interface (file→SQLite→PostgreSQL ready)
- Audit-cell SmartLink bridge (seed stage)
- Decay cron runner
- 32/32 unit tests passed

CLEANUP:
- Old constitutions archived to _archive_pre_v4/
- Root duplicates archived (12 dirs + 5 files)
- Debris archived (44 trash + 25 logs + 23 Python + 12 shell)
- ~50 casing ghosts archived (keep kebab-case)
- Build artifacts removed from governance/memory/
- Exam files excluded from tsc

tsc: 5 errors (hr-engine.ts only — pre-existing)
Gatekeeper: Anh Natt (Phan Thanh Thương)"

echo ""
success "Git committed!"
echo ""

# Show commit
git log --oneline -1
echo ""
echo -e "${BOLD}  Done. Sinh thể có DNA mới, QNEU sống, ghosts dọn, git sealed.${NC}"
echo ""
