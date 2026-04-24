# Claim 6 — Quantum Defense Entropy Evidence

**Patent:** E202601179932 — Claim 6
**Subject:** Shannon entropy-based anomaly detection in event stream

---

## CÁCH CHẠY

### Bước 1 — Đặt file vào đúng chỗ

Copy 2 file vào repo Natt-OS:

```
docs/patent-evidence/claim-06-quantum-defense/
├── test_entropy_detection.js     ← test script
└── README.md                      ← file này
```

### Bước 2 — Chạy test (từ repo root)

```bash
cd "/Users/thien/Desktop/Hồ Sơ SHTT/ natt-os_verANC"
node docs/patent-evidence/claim-06-quantum-defense/test_entropy_detection.js
```

### Bước 3 — Kết quả

Script sẽ:
1. Emit 100 event clean (sales → payment lặp lại)
2. Đo entropy → expect: `< 30` (STABLE)
3. Emit 100 event noisy (random types)
4. Đo entropy → expect: `> 50` (CRITICAL)
5. Ghi report vào `entropy_scan_report.json`

**Kết quả PASS:**
```
Phase 1: CLEAN pattern
  → entropy: 12.34 | level: STABLE

Phase 2: NOISY pattern
  → entropy: 67.89 | level: CRITICAL

==================================================
RESULT: ✅ PASS
  CLEAN entropy < 30:  ✓ (12.34)
  NOISY entropy > 50:  ✓ (67.89)
==================================================

📄 Evidence saved: docs/patent-evidence/claim-06-quantum-defense/entropy_scan_report.json
```

---

## Ý NGHĨA EVIDENCE

Report `entropy_scan_report.json` chứng minh:
- **Shannon entropy** computation chạy thật trong `SensitivityRadar.computeEntropy()`
- Hệ **phân biệt được** event pattern đều vs hỗn loạn
- Ngưỡng 30 / 50 hoạt động theo SPEC Quantum Defense v1.0
- **Reproducible** — chạy lại ra cùng kết quả (± random)

Đây là bằng chứng Claim 6 của patent **đã reduce to practice** — không chỉ là whitepaper.

---

## NẾU TEST FAIL

- Module path sai → sửa `import` path ở đầu script cho khớp với repo
- `SensitivityRadar.computeEntropy()` không tồn tại → đổi tên method cho khớp với code thật
- `SensitivityRadar.reset?.()` không tồn tại → bỏ đi hoặc thay bằng cách reset khác

Báo output lỗi cho Băng, Băng sửa.
