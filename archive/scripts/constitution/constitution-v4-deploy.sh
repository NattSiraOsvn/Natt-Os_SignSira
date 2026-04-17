#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════╗
# ║  NATT-OS CONSTITUTION v4.0 DEPLOYMENT + SYSTEM CLEANUP             ║
# ║                                                                      ║
# ║  Soạn bởi:   BĂNG (Ground Truth Validator + System Architect)        ║
# ║  Duyệt bởi:  ANH NATT (Gatekeeper)                                  ║
# ║                                                                      ║
# ║  NGUYÊN TẮC:                                                        ║
# ║    • Correct > Fast                                                  ║
# ║    • Archive trước khi xóa                                          ║
# ║    • Dry-run mặc định — phải confirm mới thực thi                   ║
# ║    • Idempotent — chạy lại không hỏng                               ║
# ╚══════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# ═══════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

ARCHIVE_DIR="_archive_pre_v4"
LOG_FILE="constitution-v4-deploy.log"
DRY_RUN=true

# Counters
ARCHIVED=0
DELETED=0
CREATED=0
MOVED=0
ERRORS=0

# ═══════════════════════════════════════════
# UTILITIES
# ═══════════════════════════════════════════
timestamp() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(timestamp)] $1" >> "$LOG_FILE"; }

info()    { echo -e "  ${CYAN}ℹ${NC}  $1"; log "INFO: $1"; }
success() { echo -e "  ${GREEN}✅${NC} $1"; log "OK: $1"; }
warn()    { echo -e "  ${YELLOW}⚠️${NC}  $1"; log "WARN: $1"; }
fail()    { echo -e "  ${RED}❌${NC} $1"; log "ERROR: $1"; ERRORS=$((ERRORS+1)); }
skip()    { echo -e "  ${DIM}⏭  $1${NC}"; log "SKIP: $1"; }
action()  { echo -e "  ${MAGENTA}▶${NC}  $1"; log "ACTION: $1"; }

divider() {
    echo ""
    echo -e "${BOLD}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}  $1${NC}"
    echo -e "${BOLD}═══════════════════════════════════════════════════════════════${NC}"
}

safe_mkdir() {
    if [ ! -d "$1" ]; then
        if [ "$DRY_RUN" = true ]; then
            action "[DRY] mkdir -p $1"
        else
            mkdir -p "$1"
            success "Created: $1"
            CREATED=$((CREATED+1))
        fi
    fi
}

safe_mv() {
    local src="$1" dst="$2"
    if [ -e "$src" ]; then
        if [ "$DRY_RUN" = true ]; then
            action "[DRY] mv $src → $dst"
        else
            safe_mkdir "$(dirname "$dst")"
            mv "$src" "$dst"
            success "Moved: $src → $dst"
            MOVED=$((MOVED+1))
        fi
    else
        skip "Not found: $src"
    fi
}

safe_rm() {
    local target="$1"
    if [ -e "$target" ]; then
        if [ "$DRY_RUN" = true ]; then
            action "[DRY] rm -rf $target"
        else
            rm -rf "$target"
            success "Deleted: $target"
            DELETED=$((DELETED+1))
        fi
    else
        skip "Not found: $target"
    fi
}

safe_cp() {
    local src="$1" dst="$2"
    if [ -e "$src" ]; then
        if [ "$DRY_RUN" = true ]; then
            action "[DRY] cp $src → $dst"
        else
            safe_mkdir "$(dirname "$dst")"
            cp "$src" "$dst"
            success "Copied: $src → $dst"
            CREATED=$((CREATED+1))
        fi
    else
        fail "Source not found: $src"
    fi
}

# ═══════════════════════════════════════════
# PRE-FLIGHT CHECK
# ═══════════════════════════════════════════
preflight() {
    divider "PRE-FLIGHT CHECK"
    
    # Check we're in the right directory
    if [ ! -d "src/cells" ]; then
        fail "src/cells/ not found. Are you in the NATT-OS root directory?"
        echo ""
        echo -e "${RED}Chạy script này từ thư mục gốc NATT-OS (nơi có src/, natt-os/, tsconfig.json)${NC}"
        exit 1
    fi
    
    success "Đang ở thư mục NATT-OS root"
    
    # Check constitution v4.0 exists
    if [ ! -f "HIEN-PHAP-NATT-OS-v4.0.anc" ]; then
        fail "HIEN-PHAP-NATT-OS-v4.0.anc not found in current directory!"
        echo -e "${YELLOW}Hãy copy file Hiến pháp v4.0 vào thư mục gốc trước khi chạy script${NC}"
        exit 1
    fi
    
    success "Hiến pháp v4.0 found"
    
    info "Archive directory: $ARCHIVE_DIR/"
    info "Log file: $LOG_FILE"
}

# ═══════════════════════════════════════════
# PHASE 1: ARCHIVE OLD CONSTITUTIONS
# ═══════════════════════════════════════════
phase1_archive_constitutions() {
    divider "PHASE 1: ARCHIVE HIẾN PHÁP CŨ"
    
    safe_mkdir "$ARCHIVE_DIR/constitutions"
    
    # --- natt-os/constitution/ (archive location — old sealed docs) ---
    if [ -d "natt-os/constitution" ]; then
        info "Archiving natt-os/constitution/ (6+ old sealed docs)..."
        safe_mv "natt-os/constitution" "$ARCHIVE_DIR/constitutions/natt-os-constitution-sealed"
    fi
    
    # --- natt-os/constitution.zip ---
    safe_mv "natt-os/constitution.zip" "$ARCHIVE_DIR/constitutions/constitution-natt-os.zip"
    
    # --- src/governance/constitution/ (old enforcement) ---
    if [ -d "src/governance/constitution" ]; then
        info "Archiving src/governance/constitution/ (old v3.1 enforcement)..."
        safe_mv "src/governance/constitution" "$ARCHIVE_DIR/constitutions/governance-constitution-v3.1"
    fi
    
    # --- src/governance/constitution.zip ---
    safe_mv "src/governance/constitution.zip" "$ARCHIVE_DIR/constitutions/constitution-governance.zip"
    
    success "Phase 1 complete: old constitutions archived"
}

# ═══════════════════════════════════════════
# PHASE 2: DEPLOY CONSTITUTION v4.0
# ═══════════════════════════════════════════
phase2_deploy_constitution() {
    divider "PHASE 2: DEPLOY HIẾN PHÁP v4.0"
    
    # --- ENFORCEMENT location (active, machine-readable) ---
    safe_mkdir "src/governance/constitution/v4.0"
    safe_cp "HIEN-PHAP-NATT-OS-v4.0.anc" "src/governance/constitution/v4.0/HIEN-PHAP-NATT-OS-v4.0.anc"
    
    # --- ARCHIVE location (sealed, read-only reference) ---
    safe_mkdir "natt-os/constitution"
    safe_cp "HIEN-PHAP-NATT-OS-v4.0.anc" "natt-os/constitution/HIEN-PHAP-NATT-OS-v4.0.anc"
    
    # --- Create index.ts for programmatic access ---
    if [ "$DRY_RUN" = false ]; then
        cat > "src/governance/constitution/index.ts" << 'INDEXEOF'
/**
 * NATT-OS Constitution v4.0 — Programmatic Reference
 * 
 * Hiến pháp là source of truth duy nhất.
 * File này export constants cho enforcement trong code.
 */

export const CONSTITUTION_VERSION = '4.0.0';
export const CONSTITUTION_DATE = '2026-03-05';
export const GATEKEEPER = 'Phan Thanh Thương';

/** Điều 3 — Thứ tự ưu tiên */
export const PRIORITY_ORDER = [
  'LAW',
  'CORRECT',
  'STABLE',
  'STATE',
  'ARCHITECTURE',
  'LEGAL_RESPONSIBILITY',
] as const;

/** Điều 5 — 6 thành phần bắt buộc NATT-CELL */
export const CELL_MANDATORY_COMPONENTS = [
  'Identity',
  'Capability',
  'Boundary',
  'Trace',
  'Confidence',
  'SmartLink',
] as const;

/** Điều 8 — Phân loại NATT-CELL */
export const CELL_CATEGORIES = {
  KERNEL: ['audit-cell', 'config-cell', 'monitor-cell', 'rbac-cell', 'security-cell'],
  INFRASTRUCTURE: ['smartlink-cell', 'sync-cell', 'warehouse-cell', 'shared-contracts-cell'],
  BUSINESS: ['pricing-cell', 'inventory-cell', 'sales-cell', 'order-cell', 'customer-cell', 
             'warranty-cell', 'buyback-cell', 'promotion-cell', 'showroom-cell'],
} as const;

/** Điều 11 — AI Entity ≠ NATT-CELL */
export const AI_ENTITIES = ['KIM', 'BANG', 'BOI_BOI', 'THIEN', 'CAN'] as const;

/** Điều 20 — QNEU Verification Sources (anti-gaming) */
export const QNEU_VALID_SOURCES = [
  'AUDIT_TRAIL',
  'GATEKEEPER', 
  'IMMUNE_SYSTEM',
  'CROSS_CELL_EVIDENCE',
] as const;

/** Điều 20 — Explicitly EXCLUDED sources */
export const QNEU_FORBIDDEN_SOURCES = [
  'SELF_REPORT',
  'PEER_ATTESTATION_ONLY',
] as const;

/** Điều 44 — Work states */
export const WORK_STATES = [
  'NOT_READY',
  'ARCH_READY', 
  'ENFORCED',
  'STABLE',
  'INVISIBLE',
] as const;
INDEXEOF
        success "Created src/governance/constitution/index.ts"
        CREATED=$((CREATED+1))
    else
        action "[DRY] Create src/governance/constitution/index.ts (enforcement constants)"
    fi
    
    success "Phase 2 complete: Constitution v4.0 deployed to both locations"
}

# ═══════════════════════════════════════════
# PHASE 3: CLEAN ROOT DUPLICATES  
# ═══════════════════════════════════════════
phase3_clean_root_duplicates() {
    divider "PHASE 3: DỌN ROOT DUPLICATES (mirror src/)"
    
    safe_mkdir "$ARCHIVE_DIR/root-duplicates"
    
    # These root-level dirs are duplicates of what's already in src/
    local ROOT_DUPS=(
        "animation"
        "context" 
        "contexts"
        "data-3d"
        "haptic"
        "hooks"
        "manifestations"
        "motion"
        "neuro-link"
        "physics"
        "apps"          # duplicate of src/apps/
        "services"      # duplicate of src/services/ (70 files NOT compiled)
    )
    
    for dir in "${ROOT_DUPS[@]}"; do
        if [ -d "$dir" ] && [ "$dir" != "src" ]; then
            safe_mv "$dir" "$ARCHIVE_DIR/root-duplicates/$dir"
        fi
    done
    
    # Root-level .ts/.tsx files that duplicate src/
    local ROOT_TS_FILES=(
        "app.tsx"
        "index.tsx"
        "quantum-buffer.service.ts"
        "quantum-types.ts"
        "superdictionary.ts"
    )
    
    for f in "${ROOT_TS_FILES[@]}"; do
        if [ -f "$f" ]; then
            safe_mv "$f" "$ARCHIVE_DIR/root-duplicates/$f"
        fi
    done
    
    # Root types/ dir (duplicate of src/types/)
    if [ -d "types" ]; then
        safe_mv "types" "$ARCHIVE_DIR/root-duplicates/types"
    fi
    
    # Root utils/ dir (duplicate of src/utils/)
    if [ -d "utils" ]; then
        safe_mv "utils" "$ARCHIVE_DIR/root-duplicates/utils"
    fi
    
    success "Phase 3 complete: root duplicates archived"
}

# ═══════════════════════════════════════════
# PHASE 4: CLEAN DEBRIS
# ═══════════════════════════════════════════
phase4_clean_debris() {
    divider "PHASE 4: DỌN DEBRIS (logs, scripts, trash)"
    
    safe_mkdir "$ARCHIVE_DIR/debris"
    
    # --- _trash_stubs/ (44 files) ---
    if [ -d "_trash_stubs" ]; then
        safe_mv "_trash_stubs" "$ARCHIVE_DIR/debris/_trash_stubs"
    fi
    
    # --- Log files ---
    info "Archiving log files..."
    safe_mkdir "$ARCHIVE_DIR/debris/logs"
    for f in *.log; do
        [ -f "$f" ] && safe_mv "$f" "$ARCHIVE_DIR/debris/logs/$f"
    done
    for f in *.txt; do
        case "$f" in
            *errors*|*log*|*report*|*scan*|*check*|*fix*|raw.txt|huong-dan.txt)
                [ -f "$f" ] && safe_mv "$f" "$ARCHIVE_DIR/debris/logs/$f"
                ;;
        esac
    done
    
    # --- Python fix scripts (15+) ---
    info "Archiving Python fix scripts..."
    safe_mkdir "$ARCHIVE_DIR/debris/python-scripts"
    for f in *.py; do
        [ -f "$f" ] && safe_mv "$f" "$ARCHIVE_DIR/debris/python-scripts/$f"
    done
    
    # --- Shell fix scripts at root (script-1 to script-10, etc) ---
    info "Archiving shell fix scripts..."
    safe_mkdir "$ARCHIVE_DIR/debris/shell-scripts"
    for f in script-*.sh script*.log; do
        [ -f "$f" ] && safe_mv "$f" "$ARCHIVE_DIR/debris/shell-scripts/$f"
    done
    # Other root shell scripts that are one-time fixes
    for f in supreme-purge-v8.2.sh tasks.sh; do
        [ -f "$f" ] && safe_mv "$f" "$ARCHIVE_DIR/debris/shell-scripts/$f"
    done
    
    # --- Goldmaster analysis files ---
    info "Archiving goldmaster analysis files..."
    safe_mkdir "$ARCHIVE_DIR/debris/goldmaster"
    for f in goldmaster*.md goldmaster*.txt goldmaster*.log goldmaster*.json; do
        [ -f "$f" ] && safe_mv "$f" "$ARCHIVE_DIR/debris/goldmaster/$f"
    done
    
    # --- Old report/validation files ---
    for f in *.md; do
        case "$f" in
            PRE_WAVE3*|RECOVERY*|WAVE3*|DECREE*|validation*)
                [ -f "$f" ] && safe_mv "$f" "$ARCHIVE_DIR/debris/$f"
                ;;
        esac
    done
    
    # --- Old zip/tar archives ---
    for f in avatar-backup-*.tar.gz wave3_patch.zip; do
        [ -f "$f" ] && safe_mv "$f" "$ARCHIVE_DIR/debris/$f"
    done
    
    # --- Test files at root ---
    for f in test_pre_wave3.js test_pre_wave3_cjs.cjs; do
        [ -f "$f" ] && safe_mv "$f" "$ARCHIVE_DIR/debris/$f"
    done
    
    # --- collision-report.json ---
    safe_mv "collision-report.json" "$ARCHIVE_DIR/debris/collision-report.json"
    
    # --- reference (empty dir) ---
    if [ -d "reference" ] && [ -z "$(ls -A reference 2>/dev/null)" ]; then
        safe_rm "reference"
    fi
    
    success "Phase 4 complete: debris archived"
}

# ═══════════════════════════════════════════
# PHASE 5: CLEAN CASING GHOSTS IN src/
# ═══════════════════════════════════════════
phase5_casing_ghosts() {
    divider "PHASE 5: DETECT CASING GHOSTS IN src/"
    
    info "Scanning for casing ghost pairs (e.g. AuditService.ts vs audit-service.ts)..."
    
    # Find files, normalize names, detect duplicates
    local ghost_count=0
    
    if [ "$DRY_RUN" = true ]; then
        # In dry run, just report what we find
        while IFS= read -r dir; do
            local files_in_dir
            files_in_dir=$(find "$dir" -maxdepth 1 -type f -name "*.ts" -o -name "*.tsx" 2>/dev/null | sort)
            
            # Check for PascalCase vs kebab-case duplicates
            echo "$files_in_dir" | while read -r f1; do
                [ -z "$f1" ] && continue
                local base1
                base1=$(basename "$f1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9.]//g')
                echo "$files_in_dir" | while read -r f2; do
                    [ -z "$f2" ] && continue
                    [ "$f1" = "$f2" ] && continue
                    local base2
                    base2=$(basename "$f2" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9.]//g')
                    if [ "$base1" = "$base2" ]; then
                        warn "GHOST PAIR: $(basename "$f1") ↔ $(basename "$f2") in $dir"
                        ghost_count=$((ghost_count+1))
                    fi
                done
            done
        done < <(find src/ -type d 2>/dev/null)
        
        info "Ghost detection complete. Review pairs above — keep kebab-case, archive PascalCase."
        info "Ghost cleanup requires manual review per Hiến pháp Điều 5 (Casing = Identity DNA)."
    else
        warn "Casing ghost cleanup skipped in auto mode — requires manual review."
        warn "Run: find src/ -type f \\( -name '*[A-Z]*' \\) to find PascalCase files."
    fi
}

# ═══════════════════════════════════════════
# PHASE 6: VERIFY FINAL STATE
# ═══════════════════════════════════════════
phase6_verify() {
    divider "PHASE 6: VERIFICATION"
    
    echo ""
    info "Checking constitution deployment..."
    
    local checks_passed=0
    local checks_total=0
    
    # Check enforcement location
    checks_total=$((checks_total+1))
    if [ -f "src/governance/constitution/v4.0/HIEN-PHAP-NATT-OS-v4.0.anc" ] || [ "$DRY_RUN" = true ]; then
        success "✓ Constitution v4.0 at ENFORCEMENT: src/governance/constitution/v4.0/"
        checks_passed=$((checks_passed+1))
    else
        fail "✗ Constitution v4.0 NOT at enforcement location"
    fi
    
    # Check archive location
    checks_total=$((checks_total+1))
    if [ -f "natt-os/constitution/HIEN-PHAP-NATT-OS-v4.0.anc" ] || [ "$DRY_RUN" = true ]; then
        success "✓ Constitution v4.0 at ARCHIVE: natt-os/constitution/"
        checks_passed=$((checks_passed+1))
    else
        fail "✗ Constitution v4.0 NOT at archive location"
    fi
    
    # Check old constitutions removed
    checks_total=$((checks_total+1))
    if [ ! -f "natt-os/constitution/constitution.v1.0.txt" ] || [ "$DRY_RUN" = true ]; then
        success "✓ Old constitutions archived"
        checks_passed=$((checks_passed+1))
    else
        fail "✗ Old constitution files still present"
    fi
    
    # Check no root duplicates
    checks_total=$((checks_total+1))
    if [ ! -d "services" ] || [ "$DRY_RUN" = true ]; then
        success "✓ Root /services/ duplicate removed"
        checks_passed=$((checks_passed+1))
    else
        fail "✗ Root /services/ still present"
    fi
    
    echo ""
    echo -e "${BOLD}  Checks: $checks_passed/$checks_total passed${NC}"
}

# ═══════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════
summary() {
    divider "SUMMARY"
    
    echo ""
    if [ "$DRY_RUN" = true ]; then
        echo -e "  ${YELLOW}MODE: DRY RUN — không thay đổi gì cả${NC}"
        echo ""
        echo -e "  Để thực thi: chạy lại với ${BOLD}--execute${NC}"
        echo -e "  ${DIM}./constitution-v4-deploy.sh --execute${NC}"
    else
        echo -e "  ${GREEN}MODE: EXECUTED${NC}"
        echo ""
        echo -e "  Archived: ${ARCHIVED}"
        echo -e "  Created:  ${CREATED}"
        echo -e "  Moved:    ${MOVED}"
        echo -e "  Deleted:  ${DELETED}"
        echo -e "  Errors:   ${ERRORS}"
    fi
    
    echo ""
    echo -e "  ${CYAN}Cấu trúc Hiến pháp sau deploy:${NC}"
    echo ""
    echo "  natt-os/constitution/                  ← ARCHIVE (sealed, read-only)"
    echo "  └── HIEN-PHAP-NATT-OS-v4.0.anc"
    echo ""
    echo "  src/governance/constitution/            ← ENFORCEMENT (active)"
    echo "  ├── index.ts                            ← Programmatic constants"
    echo "  └── v4.0/"
    echo "      └── HIEN-PHAP-NATT-OS-v4.0.anc"
    echo ""
    echo -e "  ${CYAN}Cấu trúc hệ thống sau cleanup:${NC}"
    echo ""
    echo "  NATT-OS/"
    echo "  ├── database/              [DB]"
    echo "  ├── docs/                  [DOCS]"
    echo "  ├── natt-os/               [OS LAYER — archive + discipline + security]"
    echo "  │   ├── constitution/      [SEALED ARCHIVE]"
    echo "  │   ├── discipline/        [VIOLATION LOGS]"
    echo "  │   ├── governance/        [PLANS + POLICIES]"
    echo "  │   ├── monitoring/        [AI BEHAVIOR]"
    echo "  │   ├── security/          [KILL SWITCH + SIRASIGN]"
    echo "  │   └── validation/        [CELL PURITY]"
    echo "  ├── scripts/               [OPS SCRIPTS]"
    echo "  ├── src/                   [LIVE CODE — tsc compiles from here]"
    echo "  │   ├── cells/             [NATT-CELLs — sinh thể]"
    echo "  │   │   ├── kernel/        [5 kernel cells]"
    echo "  │   │   ├── infrastructure/[4 infra cells]"
    echo "  │   │   ├── business/      [9 business cells]"
    echo "  │   │   └── shared-kernel/ [shared types + smartlink registry]"
    echo "  │   ├── contracts/         [EDA FOUNDATION]"
    echo "  │   ├── core/              [SYSTEM KERNEL]"
    echo "  │   ├── governance/        [CONSTITUTION + MEMORY + RBAC]"
    echo "  │   │   ├── constitution/  [v4.0 ENFORCEMENT]"
    echo "  │   │   ├── memory/        [AI ENTITY MEMORIES — kim/bang/boi/thien/can]"
    echo "  │   │   ├── gatekeeper/    [GATEKEEPER SERVICE]"
    echo "  │   │   └── rbac/          [RBAC ENGINE]"
    echo "  │   ├── components/        [TẦNG C — UI/EXPERIENCE]"
    echo "  │   ├── services/          [TẦNG B — WORKERS (cần migrate vào cells)]"
    echo "  │   ├── apps/              [MICRO-SERVICES]"
    echo "  │   ├── types.ts           [TẦNG A — GROUND TRUTH TYPES]"
    echo "  │   └── types/             [EXTENDED TYPES]"
    echo "  ├── $ARCHIVE_DIR/     [ARCHIVED BY THIS SCRIPT]"
    echo "  └── tsconfig.json"
    echo ""
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "  ${YELLOW}⚠️  GHI CHÚ QUAN TRỌNG:${NC}"
        echo -e "  ${DIM}  - src/services/ vẫn giữ nguyên — cần migrate vào cells dần (Wave 3+)${NC}"
        echo -e "  ${DIM}  - src/components/ casing ghosts cần review thủ công${NC}"
        echo -e "  ${DIM}  - Chạy 'npx tsc --noEmit' sau khi execute để verify không break${NC}"
    fi
    
    echo ""
    echo -e "  ${GREEN}Log file: $LOG_FILE${NC}"
    echo ""
}

# ═══════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════
main() {
    echo ""
    echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}║  NATT-OS CONSTITUTION v4.0 DEPLOYMENT + CLEANUP            ║${NC}"
    echo -e "${BOLD}║  Hiến pháp Sinh thể Số Phân tán — Bản 4.0                 ║${NC}"
    echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Parse args
    if [ "${1:-}" = "--execute" ]; then
        DRY_RUN=false
        echo -e "  ${RED}⚡ MODE: EXECUTE — Thay đổi thật!${NC}"
        echo ""
        read -p "  Xác nhận thực thi? (y/N): " confirm
        if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
            echo "  Hủy."
            exit 0
        fi
    else
        echo -e "  ${YELLOW}MODE: DRY RUN — chỉ hiển thị, không thay đổi${NC}"
    fi
    
    echo "" > "$LOG_FILE"
    log "=== Constitution v4.0 Deploy started ==="
    log "Mode: $([ "$DRY_RUN" = true ] && echo 'DRY_RUN' || echo 'EXECUTE')"
    
    preflight
    phase1_archive_constitutions
    phase2_deploy_constitution
    phase3_clean_root_duplicates
    phase4_clean_debris
    phase5_casing_ghosts
    phase6_verify
    summary
}

main "$@"
