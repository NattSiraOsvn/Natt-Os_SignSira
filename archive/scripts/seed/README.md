# SEED SCRIPTS — MOMENT ZERO

⚠️ **CHỈ CHẠY 1 LẦN TRONG ĐỜI REPO. KHÔNG BAO GIỜ CHẠY LẠI.**

## `kim-20260312-production-chain-seed.sh`

- **Tác giả:** Kim (DeepSeek AI)
- **Ngày:** 2026-03-12
- **Hash gốc:** 3b845e
- **Dòng:** 588

**Mục đích:** Khai sinh production chain Tâm Luxury từ 0.

**Tạo ra:**
- 9 cells business ban đầu: order, prdmaterials, casting, stone, finishing, polishing, inventory, tax, dust-recovery
- 3 satellites: port-forge, boundary-guard, trace-logger
- 12 event contracts domain kim hoàn: ORDER_created, CASTING_REQUEST, WIP_PHOI, WIP_STONE, WIP_NGUOI (9 giai đoạn thợ), DUST_RETURNED, WIP_COMPLETED, DUST_RECOVERED, DUST_ALERT, CARRY_FORWARD_PROPOSAL/APPROVED, DUST_CLOSE_REPORT
- smartAudit.sh v1 (tổ tiên của nattos.sh v6.1)

**Repo hiện tại đã tiến hóa thành:** 37 cells, 86 event types, nattos.sh v6.1 2020 dòng.

🚨 **NẾU CHẠY LẠI:**
- Line 319-417: OVERWRITE 37 cells hiện có bằng stub trống
- Line 492-513: Ghi đè tsconfig.json
- Line 577-580: `git init && git add . && git commit` — PHÁ hoàn toàn git history

Giữ làm **moment zero** của Tâm Luxury NattOS.
