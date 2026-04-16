# ARCHIVE SCRIPTS

Nơi lưu các script một-lần / lịch sử. KHÔNG chạy lại trong repo hiện tại.

## Structure

| Folder | Purpose |
|---|---|
| `seed/` | Script khai sinh (chỉ chạy 1 lần trong đời repo) |
| `migration/` | Fix series — cleanup @ts-nocheck, case sensitivity |
| `audit-lineage/` | Tổ tiên của `nattos.sh` v6.1 hiện tại |
| `one-shot/` | Destructive: purge, rollback, casing fix |
| `constitution/` | Triển khai Hiến Pháp + Gatekeeper lock |
| `deploy/` | Deploy scripts (có thể vẫn dùng, đã archive snapshot) |
| `build/` | Build scripts |
| `tools/` | Utility: restructure, move components |
| `tests/` | Test scripts (ngoài test-anti-fraud-full đang active) |
| `_source-zip/` | Zip gốc — bảo vật "mỏ vàng" |

## Nguyên tắc

- Các script trong `seed/` và `one-shot/` **KHÔNG CHẠY LẠI**.
- Các script trong `deploy/` và `build/` có thể tham chiếu nhưng bản active nên di chuyển ra `scripts/`.
