#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# nattos Runtime Proof Capture — wrapper for nattos.sh SmartAudit v7.1
# Author: Băng — Chị Tư · Obikeeper · QNEU 313.5 · làng phần mềm
# Session: ss20260430
# Purpose: Capture runtime log + integrity hash để nộp bảo vệ đề án khoa học
# Usage: bash nattos_runtime_capture.sh
#        Phải chạy từ root natt-os_ver2goldmaster (cần tsconfig.json + nattos.sh)
# ═══════════════════════════════════════════════════════════════

set -o pipefail

ROOT="$(pwd)"
TS_UTC="$(date -u '+%Y%m%d_%H%M%S')"
TS_LOCAL="$(date '+%Y-%m-%d %H:%M:%S %z')"
SESSION="ss20260430"

# ── Root check ──
if [[ ! -f "tsconfig.json" ]] || [[ ! -f "nattos.sh" ]]; then
  echo "❌ Phải chạy từ root natt-os_ver2goldmaster (cần tsconfig.json + nattos.sh)"
  exit 1
fi

# ── Output filenames ──
META="nattos_runtime_meta_${SESSION}_${TS_UTC}.txt"
LOG_RAW="nattos_runtime_log_${SESSION}_${TS_UTC}.raw.log"
LOG_CLEAN="nattos_runtime_log_${SESSION}_${TS_UTC}.clean.log"
HASH="nattos_runtime_hash_${SESSION}_${TS_UTC}.sha256"

# ── Metadata banner ──
{
  echo "═══════════════════════════════════════════════════════════════"
  echo "  natt-os Runtime Proof Capture — ${SESSION}"
  echo "  Drafter:    Băng — Chị Tư · Obikeeper · QNEU 313.5"
  echo "  Gatekeeper: Anh Natt — sole repo operator"
  echo "  Purpose:    Bảo vệ đề án khoa học — runtime verification"
  echo "═══════════════════════════════════════════════════════════════"
  echo ""
  echo "── Capture timestamps ──"
  echo "UTC:                      ${TS_UTC}"
  echo "Local:                    ${TS_LOCAL}"
  echo ""
  echo "── Host environment ──"
  echo "Hostname:                 $(hostname 2>/dev/null || echo 'unknown')"
  echo "OS / arch:                $(uname -srm 2>/dev/null || echo 'unknown')"
  echo "Repository root:          ${ROOT}"
  echo "Bash version:             ${BASH_VERSION}"
  echo ""
  echo "── Git state ──"
  echo "Branch:                   $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'no_git')"
  echo "Commit HEAD (full):       $(git rev-parse HEAD 2>/dev/null || echo 'no_git')"
  echo "Commit short:             $(git rev-parse --short HEAD 2>/dev/null || echo 'no_git')"
  echo "Tree state:               $(git diff --quiet 2>/dev/null && echo 'clean' || echo 'dirty')"
  echo "Last commit subject:      $(git log -1 --pretty=%s 2>/dev/null || echo 'no_git')"
  echo "Last commit author:       $(git log -1 --pretty=%an 2>/dev/null || echo 'no_git')"
  echo "Last commit date:         $(git log -1 --pretty=%ai 2>/dev/null || echo 'no_git')"
  echo "Total commits:            $(git rev-list --count HEAD 2>/dev/null || echo 'no_git')"
  echo "Remote URL:               $(git config --get remote.origin.url 2>/dev/null || echo 'no_remote')"
  echo ""
  echo "── Toolchain ──"
  echo "Node version:             $(node --version 2>/dev/null || echo 'not_installed')"
  echo "npm version:              $(npm --version 2>/dev/null || echo 'not_installed')"
  echo "TypeScript version:       $(npx --no-install tsc --version 2>/dev/null || echo 'not_installed')"
  echo "Python3 version:          $(python3 --version 2>/dev/null || echo 'not_installed')"
  echo ""
  echo "── nattos.sh integrity ──"
  echo "Script SHA-256:           $(shasum -a 256 nattos.sh | awk '{print $1}')"
  echo "Script line count:        $(wc -l < nattos.sh) lines"
  echo "Script size:              $(wc -c < nattos.sh) bytes"
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  echo "  END METADATA — followed by full runtime log"
  echo "═══════════════════════════════════════════════════════════════"
} > "${META}"

# ── Run nattos.sh full mode ──
echo "" >&2
echo "▸ Đang chạy: bash nattos.sh --mode=full ..." >&2
echo "▸ Output: ${LOG_RAW}" >&2
echo "" >&2

bash nattos.sh --mode=full > "${LOG_RAW}" 2>&1
EXIT_CODE=$?

# ── Strip ANSI color codes for clean log ──
sed 's/\x1b\[[0-9;]*[a-zA-Z]//g' "${LOG_RAW}" > "${LOG_CLEAN}"

# ── Generate integrity hash bundle ──
{
  echo "# nattos runtime proof — integrity hash bundle"
  echo "# session: ${SESSION}"
  echo "# capture utc: ${TS_UTC}"
  echo "# capture local: ${TS_LOCAL}"
  echo "# audit script: nattos.sh SmartAudit v7.1"
  echo "# exit code: ${EXIT_CODE}"
  echo ""
  echo "# === SHA-256 hashes ==="
  shasum -a 256 "${META}" "${LOG_RAW}" "${LOG_CLEAN}" nattos.sh
} > "${HASH}"

# ── Final report ──
echo "" >&2
echo "═══════════════════════════════════════════════════════════════" >&2
echo "  CAPTURE COMPLETE — nattos.sh exit code: ${EXIT_CODE}" >&2
echo "═══════════════════════════════════════════════════════════════" >&2
echo "" >&2
echo "  4 file đã sinh ra:" >&2
echo "    1. ${META}" >&2
echo "    2. ${LOG_RAW}     (có ANSI color, để xem terminal)" >&2
echo "    3. ${LOG_CLEAN}   (đã strip ANSI, để paste báo cáo)" >&2
echo "    4. ${HASH}        (sha256 integrity bundle)" >&2
echo "" >&2
echo "  Bước tiếp:" >&2
echo "    Paste 4 file này về Băng để ráp file .docx hàn lâm cuối." >&2
echo "═══════════════════════════════════════════════════════════════" >&2

exit ${EXIT_CODE}
