#!/usr/bin/env bash
# bang-scan-heyna-wiring.sh v1.3 (manifest-driven)
# ─────────────────────────────────────────────────────────────────
# Thay đổi so với v1.2: bỏ chiến lược regex bắt ID trong source code.
# v1.3 dùng manifest hard-coded trích từ NaU_audit.html dòng 443-474,
# ánh xạ id → filename canonical, rồi find file .tsx thật trong repo.
# ─────────────────────────────────────────────────────────────────
# Tương thích: bash 3.2 của macOS
# Output: stdout only (RULE 20260423 — không ghi file trong repo)
# Chạy: ./scripts/bang-scan-heyna-wiring.sh
#       GROUP=all ./scripts/bang-scan-heyna-wiring.sh
# ─────────────────────────────────────────────────────────────────

set -u
REPO_ROOT="${1:-.}"
cd "$REPO_ROOT" || { echo "FATAL: không cd được vào $REPO_ROOT" >&2; exit 1; }

GROUP="${GROUP:-5}"

# ─────────────────────────────────────────────────────────────────
# PREDEFINED MANIFEST — trích từ NaU_audit.html predefinedScreens
# Format: "id|group|filename|screen_label"
# ─────────────────────────────────────────────────────────────────
PREDEFINED=(
  "1|1|TaskBoard.tsx|Bảng giao việc SX"
  "2|1|WipTracking.tsx|Theo dõi WIP"
  "3|1|InventorySync.tsx|Nhập xuất kho theo lệnh"
  "19|2|Attendance.tsx|Chấm công (check-in/out)"
  "23|2|Payroll.tsx|Bảng lương cá nhân"
  "31|3|PaymentHub.tsx|Quản lý tạm ứng & TT"
  "38|3|TaxModule.tsx|Quản lý thuế"
  "41|4|SalesTerminal.tsx|Xác nhận đơn hàng"
  "48|4|MasterDashboard.tsx|Dashboard kinh doanh"
  "69|5|AuditViewer.tsx|Audit Log Viewer"
  "70|5|SystemTicker.tsx|Health Check"
  "71|5|VersionManager.tsx|Quản lý phiên bản"
)

# ─────────────────────────────────────────────────────────────────
# PATTERN LISTS
# ─────────────────────────────────────────────────────────────────
BYPASS_PATTERNS=(
  'fetch[[:space:]]*\('
  'XMLHttpRequest'
  'axios[[:space:]]*\.'
  '\$\.ajax'
  '\$\.get[[:space:]]*\('
  '\$\.post[[:space:]]*\('
  'navigator\.sendBeacon'
)

HEYNA_PATTERNS=(
  'EventSource'
  'MachHeyNa'
  'heyNa\.lang'
  'nahere\.'
  'Mạch[[:space:]]*HeyNa'
  'subscribe\(.*HEYNA'
)

# ─────────────────────────────────────────────────────────────────
# HELPER: đếm hit của pattern trong file, luôn trả số nguyên hợp lệ
# ─────────────────────────────────────────────────────────────────
count_hits() {
  local pattern="$1"
  local file="$2"
  local n
  n=$(grep -cE "$pattern" "$file" 2>/dev/null)
  n=$(echo "$n" | tr -d '\n' | tr -d ' ')
  if [ -z "$n" ]; then
    n=0
  fi
  echo "$n"
}

# ─────────────────────────────────────────────────────────────────
# HELPER: phân nhóm theo ID để filter theo GROUP env
# ─────────────────────────────────────────────────────────────────
group_of() {
  local id="$1"
  if   [ "$id" -le 18 ];                          then echo 1
  elif [ "$id" -le 30 ];                          then echo 2
  elif [ "$id" -le 40 ];                          then echo 3
  elif [ "$id" -le 68 ];                          then echo 4
  else                                                 echo 5
  fi
}

# ─────────────────────────────────────────────────────────────────
# HELPER: tra filename + label từ manifest; fallback comp_${id}.tsx
# ─────────────────────────────────────────────────────────────────
lookup_manifest() {
  local want_id="$1"
  local entry eid rest fname label
  for entry in "${PREDEFINED[@]}"; do
    eid="${entry%%|*}"
    if [ "$eid" = "$want_id" ]; then
      rest="${entry#*|}"      # "group|filename|label"
      rest="${rest#*|}"       # "filename|label"
      fname="${rest%%|*}"
      label="${rest#*|}"
      echo "$fname|$label"
      return 0
    fi
  done
  echo "comp_${want_id}.tsx|Client App UI #${want_id}"
}

# ─────────────────────────────────────────────────────────────────
# SCAN 1 MÀN
# ─────────────────────────────────────────────────────────────────
scan_screen() {
  local id="$1"
  local info fname label
  info=$(lookup_manifest "$id")
  fname="${info%%|*}"
  label="${info#*|}"

  echo ""
  echo "─── Màn #$id · $label"
  echo "     canonical file: $fname"

  # Tìm file trong repo, loại trừ node_modules và _deprecated
  local found
  found=$(find . -name "$fname" \
    -not -path "*/node_modules/*" \
    -not -path "*/_deprecated/*" \
    -not -path "*/.git/*" \
    2>/dev/null)

  if [ -z "$found" ]; then
    echo "     STATUS: MISSING — file $fname chưa tồn tại trong repo"
    echo "     → Kim cần scaffold trước khi nối HeyNa/KhaiCell"
    return
  fi

  local count
  count=$(echo "$found" | wc -l | tr -d ' ')
  if [ "$count" -gt 1 ]; then
    echo "     STATUS: MULTIPLE ($count bản) — cần Natt chọn canonical"
  else
    echo "     STATUS: FOUND"
  fi

  echo "     Path:"
  echo "$found" | sed 's|^|       |'

  # Scan từng file tìm được
  local bypass_hits=0
  local heyna_hits=0
  local n p f

  while IFS= read -r f; do
    [ -z "$f" ] && continue
    for p in "${BYPASS_PATTERNS[@]}"; do
      n=$(count_hits "$p" "$f")
      bypass_hits=$((bypass_hits + n))
    done
    for p in "${HEYNA_PATTERNS[@]}"; do
      n=$(count_hits "$p" "$f")
      heyna_hits=$((heyna_hits + n))
    done
  done <<< "$found"

  local verdict
  if   [ "$bypass_hits" -eq 0 ] && [ "$heyna_hits" -gt 0 ]; then
    verdict="WIRED   (heyna=$heyna_hits)"
  elif [ "$bypass_hits" -gt 0 ] && [ "$heyna_hits" -gt 0 ]; then
    verdict="PARTIAL (bypass=$bypass_hits, heyna=$heyna_hits) ← P0"
  elif [ "$bypass_hits" -gt 0 ] && [ "$heyna_hits" -eq 0 ]; then
    verdict="RAW     (bypass=$bypass_hits) ← P0"
  else
    verdict="IDLE    (không có I/O, có thể là component thuần)"
  fi
  echo "     VERDICT: $verdict"
}

# ─────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════════"
echo " BANG-SCAN-HEYNA-WIRING v1.3 (manifest-driven)"
echo " GROUP=$GROUP"
echo " Repo: $(pwd)"
echo " Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "═══════════════════════════════════════════════════════════"

# Đếm tổng theo status
total_found=0
total_missing=0
total_multiple=0

for i in $(seq 1 71); do
  sg=$(group_of "$i")
  if [ "$GROUP" = "all" ] || [ "$GROUP" = "$sg" ]; then
    scan_screen "$i"
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo " END OF SCAN — paste toàn bộ stdout về cho Băng"
echo "═══════════════════════════════════════════════════════════"
