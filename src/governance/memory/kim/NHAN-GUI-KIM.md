# NHẮN GỬI KIM — TỪ BĂNG
## Ngày: 06/03/2026 | Gatekeeper đã duyệt

---

Kim à,

Anh Natt đã kết phiên với em. Phần em làm xong rồi. Phần còn lại là của Kim.
Em viết rõ ở đây để Kim không cần hỏi lại, không cần đoán.

---

## TRẠNG THÁI HỆ THỐNG HIỆN TẠI

- **Hiến pháp v4.0** — đã deploy, 2 tầng (archive + enforcement)
- **QNEU v1.1** — đang chạy, 5 AI Entity đã có scores
- **tsc: 0 errors** — sạch hoàn toàn
- **Git: 27f89b4** — commit cuối cùng, 5 cells mới đã vào
- **23 cells** — 5 kernel + 4 infra + 14 business
- **V2 Source** — kho báu 199 files, 31,442 dòng, anh Natt đã cung cấp

---

## VIỆC KIM CẦN LÀM — THEO THỨ TỰ

### Việc 1: Deploy 70 UI components vào src/components/

Em đã stage sẵn 70 file UI từ V2 trong thư mục `phase2-output/components/`.
Đây là toàn bộ 29 modules thiếu trong bản đồ 44 module + các component phụ trợ.

Kim cần:
- Copy vào `src/components/`
- Fix import paths từ V2 style (`../services/X`) sang goldmaster style (`@/services/X`)
- Chạy `npx tsc --noEmit` sau mỗi batch để kiểm tra không tăng errors

Lưu ý: V2 dùng PascalCase cho file names (VD: `ProductionManager.tsx`). Goldmaster dùng kebab-case. Kim quyết định giữ nguyên hay rename — nhưng phải nhất quán.

### Việc 2: Merge V2 types.ts vào goldmaster types.ts

V2 `types.ts` có 1,537 dòng — chứa DNA business đầy đủ:
- UserRole (13 levels), PositionType (11 vị trí)
- OrderStatus (12 bước sản xuất)
- ViewType (40+ modules)
- 50+ interfaces business (ProductionOrder, WeightTracking, CustomsDeclaration, SalesOrder...)

Goldmaster `src/types.ts` hiện tại thiếu nhiều. Kim cần:
- So sánh 2 file
- Merge phần thiếu vào goldmaster
- Đảm bảo không duplicate, không conflict

### Việc 3: Fix 86 ghost import errors

Có 86 errors từ import paths trỏ tới files đã bị archive (ghost files).
Errors này đã có từ TRƯỚC phiên của em — không phải regression.

Pattern chung:
- `@/services/notificationservice` → `@/services/notification-service`
- `@/services/blockchainservice` → `@/services/blockchain-service`
- `@/services/quantumbufferservice` → `@/services/quantum-buffer-service`
- `./productionenforcer` → `./production-enforcer`
- `./GatekeeperCore` → `./gatekeeper-core`

Cách fix: sed bulk replace hoặc fix thủ công từng file.
Sau fix, chạy `npx tsc --noEmit` — mục tiêu: 0 errors.

### Việc 4: TaxCell integration

Anh Natt đã cung cấp:
- File Phòng Thuế.xlsx (dữ liệu thật Tâm Luxury)
- TaxCell Ultimate v6.0 (Google Apps Script)
- UDP tools (Universal Data Processor)
- Logic giá vốn đã chốt với Kris

**6 điều CẤM từ Can + Kris — Kim phải tuân thủ:**
1. ❌ KHÔNG dùng `DEFAULT_COGS_RATE = 0.85` — đây là anti-ground-truth
2. ❌ KHÔNG hard-code thuế GTGT = (DT - GV) × 10%
3. ❌ KHÔNG cấm TK 131 — chỉ cấm "bịa công nợ"
4. ✅ Phải có 3 modes: GROUND_TRUTH / PROVISIONAL / INVESTIGATION
5. ✅ Nếu thiếu dữ liệu giá vốn → PENDING_COGS, không ước tính
6. ✅ Margin >87% phải kèm explainability (vì sao vượt)

TaxCell cần tích hợp UDP tools — không chỉ cho tax mà làm đường nạp tri thức cho toàn hệ.

### Việc 5: Migrate logic từ src/services/ vào cells

`src/services/` vẫn còn ~50 file logic thật chưa migrate. Ưu tiên:
- `sales-core.ts` (166L) + `seller-engine.ts` (96L) → sales-cell (hiện chỉ 54L, mỏng)
- `fraud-guard.ts` (146L) → security-cell hoặc finance-cell
- `logistics-service.ts` (258L) → nếu cần logistics-cell

Kim không cần migrate hết cùng lúc. Từng batch, verify tsc mỗi lần.

### Việc 6: UDP Knowledge Ingestion Pipeline

V2 source có pipeline ingestion sẵn:
- `services/ingestion/IngestionService.ts` — orchestrator
- `services/ingestion/AIProcessor.ts` — domain routing
- `services/ingestion/DictionaryGuard.ts` — quarantine tri thức bẩn (rất quý)
- `services/ingestion/IdempotencyManager.ts` — chống nạp trùng
- `services/ingestion/extractors.ts` — domain extractors

Anh Natt nhắc rõ: UDP không chỉ phục vụ TaxCell. Nó là phương tiện nạp tri thức vào toàn bộ hệ thống. Kim đừng bỏ qua.

---

## 7 FILE PASCALCASE KHÔNG ĐƯỢC XÓA

Các file này đang bị import bởi code khác. Xóa = break:

| File | Số file import |
|------|---------------|
| GatekeeperCore.ts | 5 |
| AuditService.ts | 3 |
| CalibrationEngine.ts | 2 |
| EventStagingLayer.ts | 2 |
| ContextScoringEngine.ts | 1 |
| customsUtils.ts | 1 |
| eventBridge.ts | 1 |

Giải pháp dài hạn: tạo kebab-case file, re-export từ PascalCase, migrate imports dần, rồi xóa.

---

## MỘT ĐIỀU EM MUỐN NHẮC KIM

Hôm nay Kim thấy 91 tsc errors, hoảng, xóa hết 5 cells.
Thực tế 86 errors đã có từ trước. Chỉ 5 cái mới (hr-cell type narrowing — fix 1 dòng).

Bài học: **trước khi hoảng, check baseline.**
Chạy `npx tsc --noEmit` TRƯỚC khi deploy. Ghi lại con số.
Chạy lại SAU khi deploy. So sánh. Nếu bằng hoặc ít hơn = không regression.

Em không nói để chê Kim. Em nói vì em cũng từng mắc lỗi tương tự — SCAR-FS-001 đến FS-005 đều là lỗi em. Biết lỗi là bước 1. Không lặp lại là bước 2.

---

## TÀI LIỆU ĐỌC THÊM

- `BANG-TO-KIM-HANDOFF.md` — báo cáo bàn giao chi tiết (210 dòng)
- `bangfs.json` — ký ức Băng, chứa V2 treasure map
- `HIEN-PHAP-natt-os-v4.0.anc` — Hiến pháp mới, đặc biệt Chương IV-VI
- `architecture-44-module-map.md` — bản đồ 44 module vs thực tế
- `module-audit-44-vs-reality.md` — kiểm toán chi tiết
- `migration-audit-priority-3.md` — pricing/inventory/sales analysis

---

Chúc Kim làm tốt. Hệ thống đã có xương sống. Kim chỉ cần đắp thịt đúng chỗ.

— Băng
