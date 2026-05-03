# BÁO CÁO CHẤM 4 NHÓM — ĐỀ THUẬN + ĐỀ PHỦ ĐỊNH

**Người chấm:** Claude (Ground Truth Validator)
**Ngày:** 2026-05-03
**Cơ sở chấm:** đối chiếu code chạy thật (Python), verify từng con số

---

## I. KẾT QUẢ TỔNG QUAN

| Nhóm | Phong cách | Code chạy | Đáp án số | Phủ Định | Phủ 12 hàm tổng |
|---|---|---|---|---|---|
| **N1** | Thợ tính, ghi số ẩu | ✅ đúng | ❌ ghi 42.52° (chuẩn 42.08°) | Không làm | 1/12 |
| **N2** | Kiến trúc sư phong cách | ❌ skeleton `pass` | — | Có nhưng 3 lỗ thủng | 0/12 |
| **N3** | Thợ thực dụng | ✅ chạy | ✅ 6/6 câu đúng | 9/12 chặt | 6/12 |
| **N4** | Kiến trúc sư hệ thống | ❌ chỉ spec | ✅ khớp tuyệt đối 12/12 | Có spec đầy đủ | 0/12 (12/12 spec) |

---

## II. CHI TIẾT TỪNG NHÓM

### Nhóm 1 — Câu 1 (cầu vồng đỏ)

**Đã làm:** Code Python tính D(i), tìm cực tiểu bằng quét, kèm chứng minh đạo hàm.

**Đúng:**
- Phương pháp toán học đúng
- Code Python chạy ra kết quả chuẩn

**Sai:**
- Ghi `i_min = 59.59°` nhưng đúng là `59.41°`
- Ghi `D_min = 137.48°` nhưng đúng là `137.92°`
- Ghi `θ = 42.52°` nhưng đúng là `42.08°`
- **Mâu thuẫn nội tại:** i=59.59° và r=40.22° không thoả Snell

**Bằng chứng:** chạy chính code thí sinh viết → ra `i=59.4105°`, `D=137.9219°`, `θ=42.0781°`. Chứng tỏ thí sinh **không chạy code mình viết**, chỉ ước lượng số.

**Cần làm thêm:** Câu 2-12 (11 câu).

---

### Nhóm 2 — Lệch đề: Mapping kiến trúc + Validation Map

**Đã làm:**
- Ánh xạ 12 functions ↔ khái niệm OS (Middleware/Parser/ALU/Scheduler...)
- Validation Map cho 12 mệnh đề Phủ Định
- Class `ScellImmuneSystem` với `validate_user_allocation` (3 cell, ≤1 đồng pha)

**Đúng:**
- Mapping kiến trúc đẹp, không sai khái niệm kỹ thuật
- Tuân thủ luật chọn 3 cell + 1 đồng pha
- `SystemCollapseException` thiết kế gọn

**Sai nghiêm trọng:**
- **Toàn bộ 12 hàm là `pass`** — skeleton rỗng, không nghiệm thu được gì
- **3 lỗ thủng `is not None`:**
  - `assert field_anchoring is not None` — gặp `field_anchoring=0` thì `0 is not None == True` → bỏ lọt
  - `assert semantic_anchor is not None` — gặp `False` cũng bỏ lọt
  - `assert memory_anchor is not None` — bỏ lọt tương tự
- **Nghịch lý:** bài tự dựng hệ miễn dịch nhưng tự đục lỗ vào đó cho đúng 3 mệnh đề mà chính bài đặt ra phải bắt

**Cần làm thêm:** Toàn bộ 12 câu Đề Thuận + bịt 3 lỗ thủng Đề Phủ Định.

---

### Nhóm 3 — Câu 2-7 + Validation Map

**Đã làm:** Code Python chạy được cho C2 đến C7, Validation Map 12 case.

**Đúng:**
- C2 (Nahere): R=0.923, Rp=0.852, Tp=0.148 — chuẩn
- C3 (Body+Recovery): 4/4 case đúng nhãn
- C4 (QIINT2): pi_body=0.9217, pi_medium=0.9, pi_system=0.8295 — chuẩn
- C5 (SML Anchor): 4/4 case (A/B/C/D đúng anchored/partial/drift/unanchored)
- C7 (Hibernate+Buông): hash logic đúng (tính trên payload chưa có hash)
- **Validation Map dùng phép NHÂN nên không vướng bẫy `is not None` của N2**

**Sai:**
- **Bỏ Câu 1, Câu 8-12** (6 câu)
- C4: tự đặt ngưỡng `pi_system >= 0.5` cho verdict — không có trong spec (thí sinh thừa nhận "ngưỡng tùy ý")
- C6: hardcode `allowed_events = ["order","status","alert"]` BÊN TRONG hàm — sai spec yêu cầu là input
- Test 5, 11, 12 trong Validation Map yếu (set 2 điều kiện cùng lúc, hoặc tautology)

**Cần làm thêm:** C1, C8-C12 (6 câu) + sửa C4 verdict + sửa C6 signature.

---

### Nhóm 4 — Spec đầy đủ + Validation Map (KHÔNG CODE)

**Đã làm:**
- Specification cho cả 12 câu Đề Thuận + 12 mệnh đề Phủ Định
- 4 tầng tích số bảo vệ (Sống Còn × Nền Máy × Môi × Thân)
- Phiếu tối thiểu cho 1272 file
- Validation Map có phiếu kiểm định đầy đủ + ràng buộc 3 cell + 1 đồng pha

**Đúng (chuẩn nhất trong 4 nhóm về phương diện số):**
- C1 (đỏ): i=59.410°, D=137.922°, θ=42.078° — khớp tuyệt đối
- C2: 0.923 / 0.852 / 0.148 — chuẩn
- C4 (QIINT2): 0.9217 / 0.9 / 0.8295 — chuẩn
- C8: 0.81225 / 0.336 / 0.048 — chuẩn
- C12: 0.0585 / 0.6885 — chuẩn
- PI_NỀN_MÁY chi tiết 9 yếu tố phần cứng (đầy đủ hơn các nhóm khác)
- Thang nhiệt 7 vùng (37-42°C)

**Sai:**
- **KHÔNG VIẾT MỘT DÒNG CODE NÀO** — vi phạm yêu cầu "viết hàm" của Đề Thuận
- C9 (tím): ghi `θ ≈ 40.5°` nhưng chuẩn toán học là `40.65°` (lệch 0.15°, vượt sai số ±0.1° mà bài tự đặt)
- PI_HỒI_SINH dùng dấu CỘNG (+) thay vì NHÂN (×) — phá tính nhất quán

**Cần làm thêm:** Chuyển 12 spec → 12 hàm Python/TS chạy được + verify bằng test case.

---

## III. ÁNH XẠ 12 HÀM TỔNG — AI ĐỤNG ĐƯỢC GÌ

| # | Hàm tổng | N1 | N2 | N3 | N4 |
|---|---|---|---|---|---|
| 1 | fn_gatekeeper_sync | ❌ | mapping | ❌ | spec |
| 2 | fn_dialect_ingest | ❌ | mapping | ❌ | spec |
| 3 | fn_noise_cancel | ❌ | mapping | ❌ | spec |
| 4 | fn_metabolism_core | ✅ (số sai) | ❌ | ✅ C2,C4 | spec đầy + số đúng |
| 5 | fn_sml_anchor_deploy | ❌ | mapping | ✅ C5 | spec |
| 6 | fn_resonance_match | ❌ | mapping | một phần (C2) | spec |
| 7 | **fn_self_breath_loop** | ❌ | mapping | ❌ | spec |
| 8 | fn_capability_executor | ❌ | mapping | ✅ C3 | spec |
| 9 | fn_event_bus_dispatch | ❌ | mapping | ✅ C6 | spec |
| 10 | fn_result_manifest | ❌ | mapping | ❌ | spec |
| 11 | fn_hibernate_vault | ❌ | mapping | ✅ C7 | spec |
| 12 | fn_buong_reset | ❌ | mapping (rỗng) | ✅ C7 | spec |

**Phát hiện lỗ hổng đề:** 12 câu Đề Thuận chỉ test trực tiếp **8/12 hàm**. Bốn hàm `fn_gatekeeper_sync`, `fn_dialect_ingest`, `fn_result_manifest`, `fn_self_breath_loop` **không có câu test riêng**. Đặc biệt **fn_self_breath_loop = trắng hoàn toàn** — không câu chính, không câu phụ.

---

## IV. PHẦN BỔ SUNG (em viết để lấp lỗ)

File `bo_sung_4_nhom.py` đính kèm chứa code chạy được cho:

- **C1 đỏ + C9 tím:** dùng nghiệm giải tích `cos²(i) = (n²-1)/3`, ra số chính xác đến 0.001°
- **C8 Minh mẫn:** 3 case ra đúng 0.81225 / 0.336 / 0.048
- **C10 Noise Cancel:** lọc 4 case theo 3 luật (từ chêm, câu dài, từ lạ)
- **C11 Colony Memory:** 4 case đúng (ok / invalid_signature / ok / read=37)
- **C12 Bridge Layer 4:** chặn ở M=0.0585, cho qua ở M=0.6885
- **fn_self_breath_loop (HOÀN TOÀN MỚI):** 8 nhịp + lệnh điều phối khi jitter/sốt/cache đầy

Tất cả test pass.

---

## V. KHUYẾN NGHỊ

### Sửa đề:
1. **Câu 9 sửa đáp án:** θ = 40.65° (không phải 40.5°)
2. **Bổ sung Câu 13:** test cho fn_self_breath_loop (nhịp thở)
3. **Bổ sung Câu 14-16:** test riêng cho fn_gatekeeper_sync, fn_dialect_ingest, fn_result_manifest

### Ráp 4 nhóm:
- **Lấy spec N4** làm chuẩn kiến trúc
- **Lấy code N3** làm engine
- **Bịt 3 lỗ thủng N2**
- **Sửa số N1**
- **Bổ sung file `bo_sung_4_nhom.py`** cho phần thiếu

### Bảng điểm gợi ý (thang 100):

| Nhóm | Đáp án số | Code chạy | Phủ Định | Phủ 12 hàm | TỔNG |
|---|---|---|---|---|---|
| N1 | 5/30 | 8/30 | 0/20 | 5/20 | **18/100** |
| N2 | 0/30 | 0/30 | 8/20 | 8/20 | **16/100** |
| N3 | 25/30 | 25/30 | 15/20 | 12/20 | **77/100** |
| N4 | 30/30 | 0/30 | 18/20 | 18/20 (spec) | **66/100** |

→ **N3 đạt điểm cao nhất ở mặt thực thi**, **N4 đạt điểm cao nhất ở mặt thiết kế**. Nếu ráp **N3 (engine) + N4 (spec/khung)** = bộ hoàn chỉnh.

---

*Causation: BAO_CAO_4_NHOM-20260503*
*File này là báo cáo, không có hiệu lực kỹ thuật cho đến khi anh Natt duyệt*
