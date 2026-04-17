#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# NATT-OS SmartAudit v2.0
# Author: Băng — Ground Truth Validator
# Usage:  bash smartAudit.sh [--json] [--full]
#         Chạy từ root natt-os ver2goldmaster
#
# Output: AI-agent readable + human readable
# Mọi agent (Băng, Thiên, Kim, Cần, Bội Bội) đọc = hiểu ngay
# ═══════════════════════════════════════════════════════════════
set -uo pipefail

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
echo -e "  ${W}SmartAudit v2.0 — $TS${N}"
echo -e "  Root: $ROOT"

# =============================================================================
# 1. AUDIT (gọi lại nattos.sh với các tham số)
# =============================================================================
run_audit() {
    local json_flag=""
    local full_flag=""
    for arg in "$@"; do
        [[ "$arg" == "--json" ]] && json_flag="--json"
        [[ "$arg" == "--full" ]] && full_flag="--full"
    done
    # Gọi script audit hiện có, truyền tham số
    ./nattos.sh $json_flag $full_flag
}

# =============================================================================
# 2. TẠO CELL MỚI (6 components + manifest + port + engine mẫu)
# =============================================================================
generate_cell() {
    if [[ $# -lt 2 ]]; then
        fail "Thiếu tham số: generate-cell <tên-cell> <loại>"
        echo "  Loại: business, kernel, infrastructure"
        return 1
    fi
    local name="$1"
    local type="$2"
    local base_dir="src/cells/$type"
    if [[ ! -d "$base_dir" ]]; then
        fail "Thư mục loại cell không tồn tại: $base_dir"
        return 1
    fi
    local cell_dir="$base_dir/${name}-cell"
    if [[ -d "$cell_dir" ]]; then
        fail "Cell đã tồn tại: $cell_dir"
        return 1
    fi

    info "Tạo cell mới: $name ($type) tại $cell_dir"
    mkdir -p "$cell_dir"/{domain,application,infrastructure,interface,ports}

    # 1. Manifest
    cat > "$cell_dir/neural-main-cell.cell.anc" <<EOF
{
  "id": "${name}-cell",
  "name": "$name cell",
  "version": "1.0.0",
  "qneu": 100,
  "dependencies": [],
  "smartlink": {
    "subscribes": [],
    "emits": []
  }
}
EOF

    # 2. Domain entity (mẫu)
    cat > "$cell_dir/domain/${name}.entity.ts" <<EOF
export interface ${name^}Entity {
  id: string;
  // TODO: define fields
}
EOF

    # 3. Domain service (engine)
    cat > "$cell_dir/domain/services/${name}.engine.ts" <<EOF
import { EventBus } from '@/core/events/event-bus';

export class ${name^}Engine {
  constructor() {
    // TODO: implement
  }

  async start() {
    // Subscribe to events
  }
}
EOF

    # 4. Application use-case mẫu
    mkdir -p "$cell_dir/application/use-cases"
    cat > "$cell_dir/application/use-cases/sample.usecase.ts" <<EOF
export class SampleUseCase {
  execute() {
    // TODO
  }
}
EOF

    # 5. Ports – SmartLink port
    cat > "$cell_dir/ports/${name}-smartlink.port.ts" <<EOF
import { forgeSmartLinkPort } from '@/satellites/port-forge/port.factory';

export const ${name^}SmartLinkPort = forgeSmartLinkPort({
  cellId: '${name}-cell',
  signals: {
    // TODO: define signals
  }
});
EOF

    # 6. Interface (adapter) mẫu
    cat > "$cell_dir/interface/${name}.adapter.ts" <<EOF
export class ${name^}Adapter {
  // TODO
}
EOF

    # 7. Index
    cat > "$cell_dir/index.ts" <<EOF
export * from './domain/${name}.entity';
export * from './domain/services/${name}.engine';
export * from './ports/${name}-smartlink.port';
EOF

    ok "Cell $name đã được tạo với đủ 6 components + port + engine mẫu."
    info "Hãy bổ sung logic vào các file vừa tạo."
}

# =============================================================================
# 3. DỌN DẸP: xoá Bản sao*, .DS_Store, thư mục rỗng
# =============================================================================
clean_trash() {
    info "Đang dọn dẹp file rác..."
    local count=0

    # Xoá Bản sao
    while IFS= read -r f; do
        rm -v "$f"
        ((count++))
    done < <(find . -name "Bản sao*" -not -path "./node_modules/*" 2>/dev/null || true)

    # Xoá .DS_Store
    while IFS= read -r f; do
        rm -v "$f"
        ((count++))
    done < <(find . -name ".DS_Store" -not -path "./node_modules/*" 2>/dev/null || true)

    # Xoá thư mục rỗng trong src/cells
    while IFS= read -r d; do
        rmdir -v "$d" 2>/dev/null && ((count++)) || true
    done < <(find src/cells -type d -empty 2>/dev/null || true)

    ok "Đã dọn dẹp $count mục rác."
}

# =============================================================================
# 4. ARCHIVE: chuyển các file memory cũ (JSON) vào thư mục archive/
# =============================================================================
archive_memory() {
    info "Đang archive file memory cũ..."
    local archive_dir="archive/memory_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$archive_dir"

    # Di chuyển tất cả các file JSON trong memory/ có dấu hiệu cũ (theo ngày sửa)
    # Ở đây ta di chuyển tất cả các file không phải là bản mới nhất (tuỳ chỉnh)
    # Ví dụ: di chuyển tất cả trừ 5 file gần nhất của mỗi người
    # Để đơn giản, ta di chuyển toàn bộ vào archive và để lại link tượng trưng (không bắt buộc)
    # Thực tế nên có logic thông minh hơn, nhưng tạm thời ta chỉ di chuyển các file có tên chứa "v1" hoặc "old".
    find src/governance/memory -name "*.json" -type f | while read f; do
        # Nếu file có chứa "v1" hoặc "old" trong tên thì cho vào archive
        if [[ "$f" =~ v1|old|backup ]]; then
            mv -v "$f" "$archive_dir/"
        fi
    done

    # Di chuyển các file .zip cũ nếu có
    find . -maxdepth 1 -name "*.zip" -type f -mtime +30 -exec mv -v {} "$archive_dir/" \;

    ok "Đã archive các file cũ vào $archive_dir"
}

# =============================================================================
# 5. PHÁT HIỆN DEAD CODE (dùng ts-prune hoặc grep)
# =============================================================================
detect_deadcode() {
    info "Đang kiểm tra dead code..."
    if command -v ts-prune &>/dev/null; then
        ts-prune | grep -v "(used in module)" || true
    else
        warn "ts-prune chưa được cài đặt. Dùng phương pháp grep thô sơ."
        # Tìm các file .ts không được import trong src/
        find src -name "*.ts" -not -name "index.ts" | while read f; do
            base=$(basename "$f" .ts)
            if ! grep -qr "from.*$base" src/ --include="*.ts" --include="*.tsx" 2>/dev/null; then
                echo "⚠️  Có thể không dùng: $f"
            fi
        done
    fi
}

# =============================================================================
# 6. CI: chạy audit, deadcode, dọn dẹp nhẹ; nếu có lỗi thì báo fail
# =============================================================================
run_ci() {
    info "Chạy CI pipeline..."
    local exit_code=0

    # Audit (chế độ json để dễ parse, nhưng ta chỉ cần nhìn kết quả)
    if ! ./nattos.sh; then
        fail "Audit thất bại"
        exit_code=1
    fi

    # Dead code detection (cảnh báo, không fail)
    detect_deadcode || true

    # Dọn dẹp nhẹ (chỉ cảnh báo, không tự động xoá)
    local trash=$(find . -name "Bản sao*" -o -name ".DS_Store" 2>/dev/null | wc -l)
    if [[ $trash -gt 0 ]]; then
        warn "Có $trash file rác. Chạy './nattos-manager.sh clean' để dọn."
    fi

    if [[ $exit_code -eq 0 ]]; then
        ok "CI passed."
    else
        fail "CI failed."
    fi
    return $exit_code
}

# =============================================================================
# 7. TÍCH HỢP GIT HOOK (tuỳ chọn)
# =============================================================================
install_hook() {
    local hook=".git/hooks/pre-commit"
    if [[ ! -d ".git" ]]; then
        fail "Không phải git repository."
        return 1
    fi
    cat > "$hook" <<'EOF'
#!/bin/sh
# NATT-OS pre-commit hook: chạy CI trước khi commit
exec ./nattos-manager.sh ci
EOF
    chmod +x "$hook"
    ok "Đã cài đặt pre-commit hook."
}

# =============================================================================
# 8. HIỂN THỊ TRỢ GIÚP
# =============================================================================
show_help() {
    cat <<EOF
Sử dụng: ./nattos-manager.sh <lệnh> [tham số]

Lệnh:
  audit [--json] [--full]        Chạy SmartAudit
  generate-cell <tên> <loại>      Tạo cell mới (loại: business, kernel, infrastructure)
  clean                            Dọn dẹp file rác (Bản sao, .DS_Store, thư mục rỗng)
  archive                          Archive các file memory cũ
  deadcode                          Phát hiện dead code
  ci                                Chạy CI (audit + deadcode + kiểm tra rác)
  install-hook                      Cài đặt pre-commit hook (chạy CI tự động)
  help                              Hiển thị trợ giúp này
EOF
}

# =============================================================================
# MAIN
# =============================================================================
if [[ $# -eq 0 ]]; then
    show_help
    exit 0
fi

cmd="$1"
shift

case "$cmd" in
    audit)
        run_audit "$@"
        ;;
    generate-cell)
        generate_cell "$@"
        ;;
    clean)
        clean_trash
        ;;
    archive)
        archive_memory
        ;;
    deadcode)
        detect_deadcode
        ;;
    ci)
        run_ci
        ;;
    install-hook)
        install_hook
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        fail "Lệnh không hợp lệ: $cmd"
        show_help
        exit 1
        ;;
esac
