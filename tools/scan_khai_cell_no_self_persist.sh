#!/usr/bin/env bash
# scan_khai_cell_no_self_persist.sh
# Chan HP-7 self-state persistence trong khai-cell
# Ratify anh Ca Thien Lon ss20260428: KhaiCell phan mem thuan, khong fs.write* trong cell.
set -e
TARGET="src/cells/kernel/khai-cell"
echo "=== Scanner: KhaiCell HP-7 self-state persistence check ==="
echo "Target: $TARGET"
echo ""
if [ ! -d "$TARGET" ]; then
  echo "ERROR: target directory not found"
  exit 2
fi
MATCHES=$(grep -rn -E "fs\.(writeFile|writeFileSync|appendFile|appendFileSync|createWriteStream)" "$TARGET" --include="*.ts" --include="*.khai" 2>/dev/null || true)
if [ -n "$MATCHES" ]; then
  echo "FAIL: HP-7 violation - fs.write* found in khai-cell"
  echo ""
  echo "$MATCHES"
  echo ""
  echo "RULE: KhaiCell phan mem thuan, khong tu persist filesystem."
  echo "      Emit ra EventBus hoac giu in-memory."
  exit 1
fi
echo "PASS: KhaiCell khong co fs.write* self-state persistence"
exit 0
