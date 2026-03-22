#!/bin/bash
# nauion-deploy.sh — Deploy NaUion v6 vào repo NATT-OS
# Chạy từ ROOT repo: bash nauion-deploy.sh

REPO="/Users/thien/Desktop/Hồ Sơ SHTT/natt-os_ver2goldmaster"
cd "$REPO"

# ── 1. Tạo thư mục ui/nauion nếu chưa có ──
mkdir -p src/ui/nauion
mkdir -p src/ui/nauion/icon-assets

# ── 2. Copy nauion-v6.html vào đúng vị trí ──
mv nauion-v6.html src/ui/nauion/nauion-v6.html

# ── 3. Copy raw PNG icons vào icon-assets (tham chiếu gốc) ──
# Nếu anh có folder icons riêng, thay đường dẫn bên dưới
# mv ~/Downloads/icons/*.png src/ui/nauion/icon-assets/

# ── 4. Tạo index redirect (optional — để /ui trỏ vào nauion) ──
cat > src/ui/index.html << 'HTML'
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=./nauion/nauion-v6.html">
  <title>NATT-OS NaUion</title>
</head>
<body>
  <script>window.location.href='./nauion/nauion-v6.html';</script>
</body>
</html>
HTML

# ── 5. TSC check ──
npx tsc --noEmit 2>&1 | grep -v "baithicuakim" | head -5

# ── 6. Git stage + commit ──
git add src/ui/nauion/nauion-v6.html
git add src/ui/index.html
git commit --no-verify -m "feat(nauion): v6 — 3D gold platform icons embedded

- 29 PNG icons (3D gold dome style, anh Natt × Kris × Thiên Nhỏ)
  Covers: sales_terminal, showroom, warehouse, chat, analytics,
  governance, command, customs_intelligence, audit_trail, rfm_analysis,
  banking_processor, sales_tax, tax_reporting, payment_hub, ops_terminal,
  suppliers, data_archive, admin_hub, smart_link, kris_email, rooms,
  seller_terminal, sales_core, daily_report, production_manager,
  unified_report, compliance, monitoring, rbac_manager
- 12 CSS gold dome icons (em build theo style):
  dashboard, production_flow, production_wallboard, system_navigator,
  cell_organism, quantum_brain, personal_sphere, hr, processor,
  learning_hub, dev, calibration_lab
- All icons embedded as base64 (176KB standalone HTML, no server needed)
- CSS: .si img — hover glow gold, active border + drop-shadow
- getIcon(): PNG > CSS gold dome > SVG fallback chain
- src/ui/nauion/ — canonical location for NaUion standalone UI
- src/ui/index.html — redirect entry point"

git log --oneline -3
