---
status: SUPERSEDED
archived_at: 2026-04-20
archived_by: Băng (QNEU 313.5) · authority refactor_technical_debt
state_anchor: 2026-02-11 (warehouse QUARANTINE, Wave 3 pending, 4 cells chưa 6/6)
current_state: 2026-04-20 (warehouse LIVE 6/6 WIRED, 37/37 business cells live)
supersede_reason: |
  State gap 2+ tháng. Bảng chỉ đạo anchor vào snapshot 2026-02-11 không còn
  phản ánh repo hiện tại:
    - warehouse-cell đã unquarantine, LIVE 6/6, wire vào Production flow 8/8
      (evidence: QUARANTINE_GUARD.ts dòng 3: "Wave B production flow complete.
      Cell đã đủ 6 components Điều 9.")
    - 4 cells được liệt "legacy" (hr/sales/showroom/constants) đều LIVE 6/6:
      - hr-cell 25 files 6/6 WIRED
      - sales-cell 23 files 6/6 WIRED (BCTC flow chính)
      - showroom-cell 15 files 6/6 WIRED
      - constants-cell 10 files 6/6 WIRED
    - event-cell trong bảng KHÔNG tồn tại trong repo hiện tại
    - shared-contracts-cell đã dual-tier intentional (business + infrastructure)
    - Nếu script dựa bảng này chạy: 4 live cells vào _legacy/, BCTC + Production
      flow vỡ đồng thời.
  Chữ ký "Băng: ✅ Đồng ý" trong bảng: Băng session 20260420 KHÔNG chốt.
  Có thể là Băng phiên cũ (5.9.0 tháng 3) đã đồng ý với Wave 3 approach gốc
  khi warehouse thật sự đang quarantine — bây giờ state đã khác.
do_not_execute: true
evidence_audit: audit/reports/2026-04-20_19-07-17_auto.md
gatekeeper_signature: (chờ anh Natt ký nếu duyệt archive path này)
---

# BẢNG TỔNG HỢP CHỈ ĐẠO CHÍNH THỨC (PRE-WAVE 3) — SUPERSEDED

**Mục tiêu gốc:** Cung cấp cho **Bối Bối** một bảng chỉ đạo duy nhất, rõ ràng, không mâu thuẫn, để **viết code chi tiết** và **triển khai script 1-lệnh Phase A-B-C** cho NATT-OS Pre-Wave 3.

---

## I. NGUYÊN TẮC BẤT DI BẤT DỊCH (Áp dụng cho toàn bộ code)

| STT | Nguyên tắc | Nội dung bắt buộc | Người xác nhận |
|---|---|---|---|
| 1 | FILESYSTEM > MEMORY | Mọi kết luận phải dựa trên cây thư mục + git history, không dựa suy đoán | Thiên Lớn |
| 2 | Correct > Fast | Ưu tiên đúng Hiến pháp, chậm cũng được | Kim |
| 3 | Standardize → Automate → Monitor → Improve | Phase A-B là chuẩn hoá, Phase C mới hash & monitor | Băng |
| 4 | Separation of Powers | Script không tự ý quyết định nghiệp vụ | Thiên Lớn |
| 5 | No Silent Fix | Mọi thay đổi phải có log, audit, commit | Kim |

## II. QUY ƯỚC KIẾN TRÚC

| Hạng mục | Quy ước chính thức | Người chốt |
|---|---|---|
| 5-layer folder | domain / application / interface / infrastructure / ports | Băng |
| 7 lớp ADN | Identity, Capability, Boundary, Trace, Confidence, SmartLink, Lifecycle | Thiên Lớn |
| Quan hệ 5-layer ↔ 7-ADN | 5-layer = implementation anatomy, 7-ADN = metadata (manifest) | Thiên Lớn |
| Vị trí 7-ADN | CHỈ nằm trong `neural-main-cell.cell.anc`, KHÔNG tạo folder | Kim |

## III. PHASE A — CLEANUP & CHUẨN HOÁ (SUPERSEDED — DO NOT EXECUTE)

| Việc | Mô tả | ⚠ State hiện tại 2026-04-20 |
|---|---|---|
| Xoá legacy ./cells/ | Canonical root | ℹ Đã xong trước đó |
| Legacy cells → `_legacy/` | hr/event/sales/showroom/constants | ❌ **CẢ 4 ĐỀU LIVE 6/6 WIRED** |
| shared-kernel rename | → infrastructure/shared-contracts-cell | ❌ **shared-contracts-cell đã dual-tier intentional** |

## IV. PHASE B — WAREHOUSE QUARANTINE (SUPERSEDED)

| Hạng mục | Bảng gốc | ⚠ State hiện tại 2026-04-20 |
|---|---|---|
| Trạng thái | QUARANTINED | ❌ **LIVE, 6/6, wire Production 8/8** |

## V. PHASE C — AUDIT, HASH, REGISTRY

(Giữ nguyên — phần này phần lớn không conflict state hiện tại, nhưng đã có audit chain SHA-256 thật hoạt động)

## VIII. TRẠNG THÁI CHỐT (REFERENCE ONLY — KHÔNG CÒN HIỆU LỰC)

- Kim: ✅ Đồng ý (phiên cũ, không xác nhận lại ở 20260420)
- Băng: ✅ Đồng ý (**Băng session 20260420 KHÔNG chốt — chữ ký này từ phiên khác**)
- Thiên Lớn: ✅ Xác nhận Hiến pháp (quyền này thuộc Gatekeeper, không phải Thiên Lớn)

→ Bảng này **chỉ giữ làm lineage**. KHÔNG dùng cho quyết định code mới.

Kim hoặc Thiên Lớn nếu cần Wave mới → re-scope với ground truth 20260420 + Gatekeeper signature.

---
*Archived by Băng · verified_by Băng · chờ anh Natt ký duyệt*
