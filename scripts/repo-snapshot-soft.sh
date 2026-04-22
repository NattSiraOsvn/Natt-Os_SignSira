#!/usr/bin/env bash
# repo-snapshot-soft.sh — chụp ảnh soft repo (read-only scan)
#
# Mục đích: liệt kê tất cả file + import + path string ref đến "governance"
#           để quyết định migration trước khi sửa.
# Scope:    READ-ONLY. Không sửa, không move, không xoá.
# Output:   repo-snapshot-natt-os-YYYYMMDD.md (next to script, anh tải về gửi em)
# Chạy:     bash repo-snapshot-soft.sh [<repo_root>]
# Mặc định: repo_root = pwd
#
# Tác giả:  Băng (Chị Tư · N-shell · QNEU 313.5)
# Causation: REPO-SNAPSHOT-SOFT-20260422

set -euo pipefail

# ─── Config ──────────────────────────────────────────────────────────
REPO_ROOT="${1:-$PWD}"
TODAY="$(date +%Y%m%d)"
OUT_FILE="${REPO_ROOT}/repo-snapshot-natt-os-${TODAY}.md"

if [[ ! -d "$REPO_ROOT" ]]; then
  echo "ERROR: repo root không tồn tại: $REPO_ROOT" >&2
  exit 2
fi

cd "$REPO_ROOT"

# Check git repo
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "WARN: không phải git repo — scan sẽ bỏ qua git info" >&2
fi

HEAD_HASH="$(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'N/A')"

# ─── Helper ──────────────────────────────────────────────────────────
# Grep with fallback nếu ripgrep có
HAS_RG=0
command -v rg >/dev/null 2>&1 && HAS_RG=1

grep_code() {
  local pattern="$1"
  local path="$2"
  local includes="${3:-}"
  if [[ $HAS_RG -eq 1 ]]; then
    if [[ -n "$includes" ]]; then
      rg -n --no-heading "$pattern" "$path" -g "$includes" 2>/dev/null || true
    else
      rg -n --no-heading "$pattern" "$path" 2>/dev/null || true
    fi
  else
    if [[ -n "$includes" ]]; then
      grep -rnE "$pattern" "$path" --include="$includes" 2>/dev/null || true
    else
      grep -rnE "$pattern" "$path" 2>/dev/null || true
    fi
  fi
}

count_lines() {
  wc -l 2>/dev/null | awk '{print $1}'
}

# ─── Build output ────────────────────────────────────────────────────
{
  echo "# Repo snapshot — soft scan"
  echo ""
  echo "- **Ngày:** $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo "- **Repo:** \`$REPO_ROOT\`"
  echo "- **Branch:** \`$BRANCH\`"
  echo "- **HEAD:** \`$HEAD_HASH\`"
  echo "- **Scanner:** repo-snapshot-soft.sh · Causation: REPO-SNAPSHOT-SOFT-$TODAY"
  echo "- **Chế độ:** READ-ONLY, không sửa file nào"
  echo ""
  echo "---"
  echo ""

  # ─── §1 Top-level tree ──────────────────────────────────────────────
  echo "## §1. Top-level structure (depth 2)"
  echo ""
  echo '```'
  if command -v tree >/dev/null 2>&1; then
    tree -L 2 -d --gitignore 2>/dev/null || tree -L 2 -d 2>/dev/null
  else
    # Fallback: find depth 2 directories
    find . -maxdepth 2 -type d \
      ! -path './node_modules*' \
      ! -path './.git*' \
      ! -path './dist*' \
      ! -path './build*' \
      | sort
  fi
  echo '```'
  echo ""

  # ─── §2 src/governance/ inventory by extension ──────────────────────
  echo "## §2. \`src/governance/\` inventory by file extension"
  echo ""
  if [[ -d "src/governance" ]]; then
    echo "| Extension | Count | Sample paths |"
    echo "|-----------|-------|--------------|"
    # Get unique extensions in src/governance
    find src/governance -type f | \
      awk -F. '{
        if (NF > 1) print tolower($NF)
        else print "NO_EXT"
      }' | sort | uniq -c | sort -rn | \
      while read -r count ext; do
        sample=$(find src/governance -type f -name "*.$ext" 2>/dev/null | head -3 | paste -sd ', ' - || echo "-")
        [[ "$ext" == "NO_EXT" ]] && sample=$(find src/governance -type f ! -name "*.*" 2>/dev/null | head -3 | paste -sd ', ' - || echo "-")
        printf "| .%s | %s | %s |\n" "$ext" "$count" "$sample"
      done
  else
    echo "_Không tồn tại \`src/governance/\` — skip._"
  fi
  echo ""

  # ─── §3 TS import statements referencing governance ─────────────────
  echo "## §3. TS import/require referencing \`governance\` (MAJOR IMPACT)"
  echo ""
  echo "**Mục đích:** những file này sẽ cần update import path nếu di chuyển."
  echo ""
  echo "### §3.1 ES module imports"
  echo ""
  echo '```'
  grep_code "from\s+['\"].*governance" "src" "*.ts" | head -200
  echo '```'
  IMPORT_COUNT=$(grep_code "from\s+['\"].*governance" "src" "*.ts" | count_lines)
  echo ""
  echo "**Total ES imports refs:** $IMPORT_COUNT"
  echo ""
  echo "### §3.2 CommonJS requires"
  echo ""
  echo '```'
  grep_code "require\s*\(\s*['\"].*governance" "src" "*.ts" | head -50
  echo '```'
  REQUIRE_COUNT=$(grep_code "require\s*\(\s*['\"].*governance" "src" "*.ts" | count_lines)
  echo ""
  echo "**Total require refs:** $REQUIRE_COUNT"
  echo ""

  # ─── §4 Cells importing governance ──────────────────────────────────
  echo "## §4. Cells đang import governance (grouped by cell)"
  echo ""
  echo "**Mục đích:** biết cell nào sẽ ảnh hưởng nếu di chuyển."
  echo ""
  if [[ -d "src/cells" ]]; then
    echo "| Cell | Import count |"
    echo "|------|--------------|"
    for cell_dir in src/cells/*/; do
      cell_name=$(basename "$cell_dir")
      cnt=$(grep_code "governance" "$cell_dir" "*.ts" | count_lines)
      [[ "$cnt" -gt 0 ]] && printf "| %s | %s |\n" "$cell_name" "$cnt"
    done | sort -t'|' -k3 -rn
  else
    echo "_\`src/cells/\` không tồn tại — skip._"
  fi
  echo ""

  # ─── §5 Path string literals ────────────────────────────────────────
  echo "## §5. Path string literals containing \"governance\""
  echo ""
  echo "**Mục đích:** fs.readFileSync / path.join / const paths — cần update nếu di chuyển."
  echo ""
  echo "### §5.1 Hardcoded \"src/governance/\" strings"
  echo ""
  echo '```'
  grep_code "['\"]src/governance" "src" "*.ts" | head -100
  echo '```'
  HARDCODED_COUNT=$(grep_code "['\"]src/governance" "src" "*.ts" | count_lines)
  echo ""
  echo "**Total hardcoded strings:** $HARDCODED_COUNT"
  echo ""

  echo "### §5.2 fs operations on governance paths"
  echo ""
  echo '```'
  grep_code "fs\.(readFile|writeFile|stat|access|readdir|mkdir).*governance" "src" "*.ts" | head -50
  echo '```'
  echo ""

  echo "### §5.3 path.join/resolve with governance"
  echo ""
  echo '```'
  grep_code "path\.(join|resolve).*governance" "src" "*.ts" | head -50
  echo '```'
  echo ""

  # ─── §6 Shell scripts referencing governance ────────────────────────
  echo "## §6. Shell scripts referencing governance paths"
  echo ""
  echo "**Mục đích:** \`nattos.sh\` + các script khác cần update path vars."
  echo ""
  echo "### §6.1 nattos.sh"
  echo ""
  if [[ -f "nattos.sh" ]]; then
    echo '```'
    grep -nE "(src/)?governance" nattos.sh | head -50 || echo "(không match)"
    echo '```'
    NATTOS_COUNT=$(grep -cE "(src/)?governance" nattos.sh 2>/dev/null || echo 0)
    echo ""
    echo "**nattos.sh refs:** $NATTOS_COUNT"
  else
    echo "_\`nattos.sh\` không tồn tại ở root._"
  fi
  echo ""

  echo "### §6.2 Other .sh scripts"
  echo ""
  echo '```'
  find . -maxdepth 4 -name "*.sh" ! -path "./node_modules/*" ! -path "./.git/*" \
    -exec grep -lE "governance" {} \; 2>/dev/null | head -20
  echo '```'
  echo ""

  # ─── §7 Config file references ──────────────────────────────────────
  echo "## §7. Config files (tsconfig / package.json / gitignore)"
  echo ""

  echo "### §7.1 tsconfig.json paths mapping"
  echo ""
  if [[ -f "tsconfig.json" ]]; then
    echo '```json'
    grep -A3 -B1 "governance\|paths" tsconfig.json 2>/dev/null | head -40
    echo '```'
  else
    echo "_\`tsconfig.json\` không tồn tại._"
  fi
  echo ""

  echo "### §7.2 package.json scripts"
  echo ""
  if [[ -f "package.json" ]]; then
    echo '```json'
    grep "governance\|src/" package.json 2>/dev/null | head -20 || echo "(không match)"
    echo '```'
  fi
  echo ""

  echo "### §7.3 .gitignore rules on governance"
  echo ""
  if [[ -f ".gitignore" ]]; then
    echo '```'
    grep -nE "governance|memory|bang" .gitignore 2>/dev/null | head -30 || echo "(không match)"
    echo '```'
  fi
  echo ""

  # ─── §8 docs/ structure ─────────────────────────────────────────────
  echo "## §8. \`docs/\` current structure"
  echo ""
  if [[ -d "docs" ]]; then
    echo '```'
    find docs -type f | head -50 | sort
    echo '```'
    DOCS_FILE_COUNT=$(find docs -type f | count_lines)
    echo ""
    echo "**Total files in docs/:** $DOCS_FILE_COUNT"
  else
    echo "_\`docs/\` không tồn tại ở root — cần tạo khi move SPEC._"
  fi
  echo ""

  # ─── §9 Root governance/ check ──────────────────────────────────────
  echo "## §9. Root \`governance/\` existence check"
  echo ""
  if [[ -d "governance" ]]; then
    echo "⚠️ \`governance/\` ĐÃ tồn tại ở root. Content:"
    echo '```'
    find governance -maxdepth 2 -type f 2>/dev/null | head -30
    echo '```'
  else
    echo "✅ \`governance/\` CHƯA tồn tại ở root — migration sẽ tạo mới, không conflict."
  fi
  echo ""

  # ─── §10 Summary ────────────────────────────────────────────────────
  echo "## §10. Summary — migration impact estimate"
  echo ""
  echo "| Metric | Count |"
  echo "|--------|-------|"
  if [[ -d "src/governance" ]]; then
    SRC_GOV_FILES=$(find src/governance -type f | count_lines)
    SRC_GOV_TS=$(find src/governance -name "*.ts" | count_lines)
    SRC_GOV_DATA=$(find src/governance -type f \
      \( -name "*.anc" -o -name "*.kris" -o -name "*.phieu" \
         -o -name "*.na" -o -name "*.obitan" -o -name "*.canonical" \
         -o -name "*.thuo" -o -name "*.heyna" -o -name "*.sira" \
         -o -name "*.si" \) | count_lines)
    SRC_GOV_MD=$(find src/governance -name "*.md" | count_lines)
    echo "| Files in \`src/governance/\` | $SRC_GOV_FILES |"
    echo "| - TS code files (.ts) | $SRC_GOV_TS |"
    echo "| - Data files (.anc/.kris/.na/.obitan/.phieu/.canonical/.si) | $SRC_GOV_DATA |"
    echo "| - Markdown (.md SPECs) | $SRC_GOV_MD |"
  fi
  echo "| TS imports ref \`governance\` | $IMPORT_COUNT |"
  echo "| require() ref \`governance\` | $REQUIRE_COUNT |"
  echo "| Hardcoded \"src/governance/\" strings | $HARDCODED_COUNT |"
  echo "| nattos.sh refs to governance | ${NATTOS_COUNT:-0} |"
  echo ""

  echo "## §11. Decision hints cho Gatekeeper"
  echo ""
  echo "Dựa trên số liệu §10, migration cost ước lượng:"
  echo ""
  echo "- **Low cost** nếu \`hardcoded strings < 20\` VÀ \`nattos.sh refs < 30\`"
  echo "- **Medium cost** nếu tổng > 50"
  echo "- **High cost** nếu tổng > 200 (nên xem xét giữ nguyên, chỉ chuyển SPEC)"
  echo ""
  echo "---"
  echo ""
  echo "*Snapshot generated by repo-snapshot-soft.sh — ship to Băng for analysis.*"
  echo ""
} > "$OUT_FILE"

echo ""
echo "✅ Snapshot xuất: $OUT_FILE"
echo ""
echo "Kích thước file:"
ls -lh "$OUT_FILE" | awk '{print "   " $5 "  " $9}'
echo ""
echo "Anh upload file này cho Băng để phân tích chi tiết từng cell + path dependency."
