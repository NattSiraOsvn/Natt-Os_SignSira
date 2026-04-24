#!/bin/bash
# ============================================================================
# Natt-OS NODE OWNERSHIP SCANNER
# Đo độ phụ thuộc của repo vào Node ecosystem.
# Mục đích: biết rõ "nợ" bao nhiêu trước khi quyết định tách.
#
# Tác giả: Băng (Validator)
# Không phán xét. Chỉ đếm. Anh Natt quyết.
# ============================================================================

REPO="${1:-.}"
cd "$REPO" || { echo "Path không tồn tại: $REPO"; exit 2; }

# Grep excludes (for content scans)
GE=(--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist \
    --exclude-dir=build --exclude-dir=archive --exclude-dir=__MACOSX \
    --exclude-dir=.next --exclude-dir=coverage --exclude-dir=out)

# Find excludes (for file counts) — array để safe với space trong path
FE=(-not -path "*/node_modules/*" -not -path "*/.git/*" \
    -not -path "*/dist/*" -not -path "*/build/*" \
    -not -path "*/archive/*" -not -path "*/__MACOSX/*" \
    -not -path "*/.next/*" -not -path "*/coverage/*")

# Helper: đếm matches grep, trả 0 nếu lỗi
gcount() {
    grep -RI "${GE[@]}" "$@" . 2>/dev/null | wc -l | tr -d ' '
}

# Helper: đếm file theo extension
fcount() {
    find . -type f -name "$1" "${FE[@]}" 2>/dev/null | wc -l | tr -d ' '
}

# Helper: yes/no file existence
has_file() {
    [ -f "$1" ] && echo "YES" || echo "no"
}

has_dir() {
    [ -d "$1" ] && echo "YES" || echo "no"
}

# ============================================================================
echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  Natt-OS NODE OWNERSHIP SCANNER                                  ║"
echo "║  Đo độ phụ thuộc Node ecosystem — đếm thuần, không phán xét.    ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "Repo: $(pwd)"
echo ""

# ─────────────────────────────────────────────────────────────────────
# [1] NODE-EXECUTABLE FILES (files cần Node/V8 để chạy)
# ─────────────────────────────────────────────────────────────────────
echo "[1] NODE-EXECUTABLE FILES"
echo "    ──────────────────────────────────────────────────"

ts=$(fcount "*.ts")
tsx=$(fcount "*.tsx")
js=$(fcount "*.js")
jsx=$(fcount "*.jsx")
cjs=$(fcount "*.cjs")
mjs=$(fcount "*.mjs")
json_f=$(fcount "*.json")

printf "    %-30s %6d files\n" ".ts  (TypeScript)"       "$ts"
printf "    %-30s %6d files\n" ".tsx (React TS)"         "$tsx"
printf "    %-30s %6d files\n" ".js  (JavaScript)"       "$js"
printf "    %-30s %6d files\n" ".jsx (React JS)"         "$jsx"
printf "    %-30s %6d files\n" ".cjs (CommonJS)"         "$cjs"
printf "    %-30s %6d files\n" ".mjs (ES module)"        "$mjs"
printf "    %-30s %6d files\n" ".json (JS origin)"       "$json_f"

total_exec=$((ts + tsx + js + jsx + cjs + mjs))
printf "    %-30s %6d files  <-- must rewrite\n" "EXECUTABLE total"    "$total_exec"
echo ""

# ─────────────────────────────────────────────────────────────────────
# [2] NODE API USAGE (built-in modules + globals)
# ─────────────────────────────────────────────────────────────────────
echo "[2] NODE API USAGE"
echo "    ──────────────────────────────────────────────────"

# Built-in modules (require OR import)
n_fs=$(grep -RIE "${GE[@]}" "(require\(['\"]fs['\"]|from ['\"]fs['\"])" . 2>/dev/null | wc -l | tr -d ' ')
n_path=$(grep -RIE "${GE[@]}" "(require\(['\"]path['\"]|from ['\"]path['\"])" . 2>/dev/null | wc -l | tr -d ' ')
n_http=$(grep -RIE "${GE[@]}" "(require\(['\"]http['\"]|from ['\"]http['\"]|require\(['\"]https['\"]|from ['\"]https['\"])" . 2>/dev/null | wc -l | tr -d ' ')
n_crypto=$(grep -RIE "${GE[@]}" "(require\(['\"]crypto['\"]|from ['\"]crypto['\"])" . 2>/dev/null | wc -l | tr -d ' ')
n_os=$(grep -RIE "${GE[@]}" "(require\(['\"]os['\"]|from ['\"]os['\"])" . 2>/dev/null | wc -l | tr -d ' ')
n_stream=$(grep -RIE "${GE[@]}" "(require\(['\"]stream['\"]|from ['\"]stream['\"])" . 2>/dev/null | wc -l | tr -d ' ')
n_child=$(grep -RIE "${GE[@]}" "(require\(['\"]child_process['\"]|from ['\"]child_process['\"])" . 2>/dev/null | wc -l | tr -d ' ')
n_other=$(grep -RIE "${GE[@]}" "(require\(['\"](url|util|events|net|tls|zlib|dgram|dns|worker_threads|cluster|vm|buffer|assert|querystring)['\"])" . 2>/dev/null | wc -l | tr -d ' ')

printf "    %-30s %6d occurrences\n" "fs (filesystem)"        "$n_fs"
printf "    %-30s %6d occurrences\n" "path"                   "$n_path"
printf "    %-30s %6d occurrences\n" "http / https"           "$n_http"
printf "    %-30s %6d occurrences\n" "crypto"                 "$n_crypto"
printf "    %-30s %6d occurrences\n" "os"                     "$n_os"
printf "    %-30s %6d occurrences\n" "stream"                 "$n_stream"
printf "    %-30s %6d occurrences\n" "child_process"          "$n_child"
printf "    %-30s %6d occurrences\n" "other built-ins"        "$n_other"

# Node globals
g_process=$(gcount "process\.")
g_buffer=$(gcount "Buffer\.")
g_dirname=$(grep -RI "${GE[@]}" -E "__dirname|__filename" . 2>/dev/null | wc -l | tr -d ' ')
g_setimm=$(gcount "setImmediate\|clearImmediate")

printf "    %-30s %6d occurrences\n" "process.* (global)"     "$g_process"
printf "    %-30s %6d occurrences\n" "Buffer.* (global)"      "$g_buffer"
printf "    %-30s %6d occurrences\n" "__dirname / __filename" "$g_dirname"
printf "    %-30s %6d occurrences\n" "setImmediate (Node-only)" "$g_setimm"

node_api_total=$((n_fs + n_path + n_http + n_crypto + n_os + n_stream + n_child + n_other + g_process + g_buffer + g_dirname + g_setimm))
printf "    %-30s %6d occurrences <-- must replace\n" "NODE API total"         "$node_api_total"
echo ""

# ─────────────────────────────────────────────────────────────────────
# [3] NPM PACKAGE DEPENDENCIES
# ─────────────────────────────────────────────────────────────────────
echo "[3] NPM PACKAGE DEPENDENCIES"
echo "    ──────────────────────────────────────────────────"

if [ -f package.json ]; then
    deps=$(python3 -c "import json; d=json.load(open('package.json')); print(len(d.get('dependencies',{})))" 2>/dev/null || echo 0)
    devdeps=$(python3 -c "import json; d=json.load(open('package.json')); print(len(d.get('devDependencies',{})))" 2>/dev/null || echo 0)
    peerdeps=$(python3 -c "import json; d=json.load(open('package.json')); print(len(d.get('peerDependencies',{})))" 2>/dev/null || echo 0)

    printf "    %-30s %6d packages\n" "runtime deps"           "$deps"
    printf "    %-30s %6d packages\n" "dev deps"               "$devdeps"
    printf "    %-30s %6d packages\n" "peer deps"              "$peerdeps"

    # Size of node_modules
    if [ -d node_modules ]; then
        nm_size=$(du -sh node_modules 2>/dev/null | cut -f1)
        nm_count=$(find node_modules -maxdepth 2 -type d -name "package.json" 2>/dev/null | wc -l | tr -d ' ')
        printf "    %-30s %6s  (transitive packages installed)\n" "node_modules size"      "$nm_size"
    else
        echo "    node_modules/ : not installed"
    fi
else
    echo "    package.json NOT FOUND"
    deps=0
    devdeps=0
fi
echo ""

# ─────────────────────────────────────────────────────────────────────
# [4] TYPESCRIPT TOOLCHAIN
# ─────────────────────────────────────────────────────────────────────
echo "[4] TYPESCRIPT TOOLCHAIN"
echo "    ──────────────────────────────────────────────────"

printf "    %-30s %s\n" "tsconfig.json"          "$(has_file tsconfig.json)"
printf "    %-30s %s\n" "tsconfig.*.json (other)" "$(find . -maxdepth 2 -name 'tsconfig.*.json' 2>/dev/null | wc -l | tr -d ' ') files"
printf "    %-30s %s\n" "ts-node in deps"         "$(grep -l ts-node package.json 2>/dev/null && echo YES || echo no)"
printf "    %-30s %s\n" "tsx in deps"             "$(grep -l '\"tsx\"' package.json 2>/dev/null && echo YES || echo no)"
printf "    %-30s %s\n" ".d.ts type definitions"  "$(fcount "*.d.ts") files"

# Type annotations count (rough: ': Type' pattern in .ts files)
type_anno=$(grep -RIE "${GE[@]}" --include="*.ts" --include="*.tsx" ": [A-Z][a-zA-Z<>\[\]|&, ]+" . 2>/dev/null | wc -l | tr -d ' ')
printf "    %-30s %6d occurrences\n" "type annotations (rough)" "$type_anno"
echo ""

# ─────────────────────────────────────────────────────────────────────
# [5] BUILD TOOLS (tất cả đều Node-based)
# ─────────────────────────────────────────────────────────────────────
echo "[5] BUILD TOOLS (all Node-based)"
echo "    ──────────────────────────────────────────────────"

for tool in vite webpack esbuild rollup parcel jest mocha vitest eslint prettier postcss tailwindcss next; do
    if [ -f package.json ]; then
        found=$(python3 -c "
import json
d = json.load(open('package.json'))
deps = {**d.get('dependencies',{}), **d.get('devDependencies',{})}
keys = [k for k in deps if '$tool' in k.lower()]
print('YES' if keys else 'no')
" 2>/dev/null)
    else
        found="no"
    fi
    printf "    %-30s %s\n" "$tool" "$found"
done
echo ""

# ─────────────────────────────────────────────────────────────────────
# [6] CONFIG FILES (Node-ecosystem infrastructure)
# ─────────────────────────────────────────────────────────────────────
echo "[6] CONFIG & LOCK FILES"
echo "    ──────────────────────────────────────────────────"

printf "    %-30s %s\n" "package.json"           "$(has_file package.json)"
printf "    %-30s %s\n" "package-lock.json"      "$(has_file package-lock.json)"
printf "    %-30s %s\n" "yarn.lock"              "$(has_file yarn.lock)"
printf "    %-30s %s\n" "pnpm-lock.yaml"         "$(has_file pnpm-lock.yaml)"
printf "    %-30s %s\n" ".npmrc"                 "$(has_file .npmrc)"
printf "    %-30s %s\n" ".nvmrc"                 "$(has_file .nvmrc)"
printf "    %-30s %s\n" "node_modules/"          "$(has_dir node_modules)"
printf "    %-30s %s\n" ".node-version"          "$(has_file .node-version)"
echo ""

# ─────────────────────────────────────────────────────────────────────
# [7] REACT ECOSYSTEM (Meta's framework)
# ─────────────────────────────────────────────────────────────────────
echo "[7] REACT / META ECOSYSTEM"
echo "    ──────────────────────────────────────────────────"

r_jsx=$((tsx + jsx))
r_usestate=$(gcount "useState")
r_useeffect=$(gcount "useEffect")
r_fromreact=$(grep -RI "${GE[@]}" -E "from ['\"]react['\"]" . 2>/dev/null | wc -l | tr -d ' ')

printf "    %-30s %6d files\n" "JSX files (.tsx + .jsx)" "$r_jsx"
printf "    %-30s %6d occurrences\n" "useState hooks"         "$r_usestate"
printf "    %-30s %6d occurrences\n" "useEffect hooks"        "$r_useeffect"
printf "    %-30s %6d occurrences\n" "import from 'react'"    "$r_fromreact"
echo ""

# ─────────────────────────────────────────────────────────────────────
# [8] SHELL / SHEBANG BINDINGS
# ─────────────────────────────────────────────────────────────────────
echo "[8] SHEBANG / RUNTIME BINDINGS"
echo "    ──────────────────────────────────────────────────"

shebang_node=$(grep -RI "${GE[@]}" -l "^#!/usr/bin/env node" . 2>/dev/null | wc -l | tr -d ' ')
shebang_ts=$(grep -RI "${GE[@]}" -l "^#!/usr/bin/env ts-node" . 2>/dev/null | wc -l | tr -d ' ')
npx_usage=$(grep -RI "${GE[@]}" "npx " . 2>/dev/null | wc -l | tr -d ' ')
npm_scripts=0
if [ -f package.json ]; then
    npm_scripts=$(python3 -c "import json; print(len(json.load(open('package.json')).get('scripts',{})))" 2>/dev/null || echo 0)
fi

printf "    %-30s %6d files\n" "#!/env node shebang"    "$shebang_node"
printf "    %-30s %6d files\n" "#!/env ts-node shebang" "$shebang_ts"
printf "    %-30s %6d occurrences\n" "npx invocations"        "$npx_usage"
printf "    %-30s %6d scripts\n" "npm scripts"            "$npm_scripts"
echo ""

# ─────────────────────────────────────────────────────────────────────
# SUMMARY & VERDICT
# ─────────────────────────────────────────────────────────────────────
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  SUMMARY                                                         ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
printf "  Executable files bound to Node:   %6d\n" "$total_exec"
printf "  Node API call sites:              %6d\n" "$node_api_total"
printf "  npm runtime packages:             %6d\n" "$deps"
printf "  npm dev packages:                 %6d\n" "$devdeps"
printf "  React JSX files:                  %6d\n" "$r_jsx"
echo ""

# Ownership score (rough — càng cao càng phụ thuộc)
# Normalize: files/100 + api/500 + deps/10 + jsx/50
score=$(python3 -c "
f = $total_exec / 100.0
a = $node_api_total / 500.0
d = ($deps + $devdeps) / 10.0
j = $r_jsx / 50.0
total = f + a + d + j
print(f'{total:.1f}')
" 2>/dev/null)

printf "  Ownership debt score:             %6s  (lower = more independent)\n" "$score"
echo ""

# Verdict tiers
if [ "$total_exec" -lt 50 ] && [ "$node_api_total" -lt 100 ] && [ "$deps" -lt 5 ]; then
    echo "  VERDICT: READY. Scope nhỏ — có thể viết native runtime."
elif [ "$total_exec" -lt 500 ] && [ "$node_api_total" -lt 1000 ]; then
    echo "  VERDICT: PARTIAL. Phải rewrite đáng kể — khả thi theo phase."
else
    echo "  VERDICT: NOT READY."
    echo ""
    echo "  Muốn tách Node hoàn toàn, phải:"
    printf "    1. Rewrite %d executable files sang ngôn ngữ native\n" "$total_exec"
    printf "    2. Replace %d Node API call sites bằng native equivalent\n" "$node_api_total"
    printf "    3. Substitute/drop %d npm packages (%d + %d)\n" "$((deps+devdeps))" "$deps" "$devdeps"
    echo "    4. Viết native runtime (thay V8)"
    echo "    5. Viết native build tool (thay vite/tsc/esbuild)"
    echo "    6. Viết native package manager (thay npm)"
    echo "    7. Bỏ React — build UI layer riêng (nếu dùng UI)"
    echo ""
    echo "  Ước lượng: 2-5 năm cho 1 team full-time."
fi
echo ""
echo "══════════════════════════════════════════════════════════════════"
echo ""
