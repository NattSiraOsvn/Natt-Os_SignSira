#!/bin/bash
echo "========================================"
echo " NATT-OS Sheets Server v1.0"
echo " Tâm Luxury — Giám Sát Ngầm Luồng SX"
echo "========================================"
cd "$(dirname "$0")"

# Install nếu chưa có
if [ ! -d "node_modules" ]; then
  echo "[+] Installing dependencies..."
  npm install
fi

echo "[+] Starting server on port 3001..."
echo "[+] Dashboard: http://localhost:3001/sheets-monitor.html"
echo "[+] API:       http://localhost:3001/api/summary"
echo ""
node server.js
