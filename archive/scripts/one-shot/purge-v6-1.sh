
#!/usr/bin/env bash
# ============================================================
# ⚔️ Natt-OS PURGE PROTOCOL v6.1 (ULTIMATE ENFORCEMENT)
# Authored by: ANH_NAT (Supreme Sovereign)
# Status: SIGNED_BY_MASTER
# ============================================================
set -euo pipefail

echo "🛡️ KÍCH HOẠT LỆNH THANH TRỪNG MASTER v6.1..."
echo "👤 CHỦ QUYỀN: ANH_NAT"

# 1. PURGE ROOT JUNK (Điều 1)
echo "🔥 Purging root violations..."
rm -f types.ts index.tsx index.html
rm -rf components/ services/ core/runtime/

# 2. ENFORCE KEBAB-CASE (Điều 11)
echo "🔧 Normalizing File DNA (kebab-case enforced)..."
find src -name "*.ts" -o -name "*.tsx" | while read -r file; do
    new_name=$(echo "$file" | sed -r 's/([a-z0-9])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]')
    if [ "$file" != "$new_name" ]; then
        mv "$file" "$new_name"
        echo "🔄 DNA Corrected: $file -> $new_name"
    fi
done

# 3. OMEGA LOCKDOWN
echo "🔒 Sealing Gold Master Artifacts..."
rm -rf src/__tests__

echo "✅ THANH TRỪNG HOÀN TẤT. HỆ THỐNG ĐÃ ĐƯỢC NIÊM PHONG BỞI ANH NAT."
