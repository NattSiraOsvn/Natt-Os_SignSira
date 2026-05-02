# BẢNG TỔNG HỢP CHỈ ĐẠO CHÍNH THỨC

**Mục tiêu:** Cung cấp cho **Phan Thanh Thương** một bảng chỉ đạo duy nhất, rõ ràng, không mâu thuẫn, để **viết code chi tiết** và **triển khai script 1‑lệnh Phase A–B–C** cho NATT‑OS Pre‑Wave 3.

---

## I. NGUYÊN TẮC BẤT DI BẤT DỊCH (Áp dụng cho toàn bộ code)

| STT | Nguyên tắc | Nội dung bắt buộc | Người xác nhận |
|---|---|---|---|
| 1 | FILESYSTEM > MEMORY | Mọi kết luận phải dựa trên cây thư mục + git history, không dựa suy đoán | Phan Thanh Thương |
| 2 | Correct > Fast | Ưu tiên đúng Hiến pháp, chậm cũng được | Phan Thanh Thương |
| 3 | Standardize → Automate → Monitor → Improve | Phase A–B là chuẩn hoá, Phase C mới hash & monitor | Phan Thanh Thương |
| 4 | Separation of Powers | Script không tự ý quyết định nghiệp vụ | Phan Thanh Thương |
| 5 | No Silent Fix | Mọi thay đổi phải có log, audit, commit | Phan Thanh Thương |

---

## II. QUY ƯỚC KIẾN TRÚC (KHÔNG ĐƯỢC DIỄN GIẢI KHÁC)

| Hạng mục | Quy ước chính thức | Người chốt |
|---|---|---|
| 5‑layer folder | domain / application / interface / infrastructure / ports | Phan Thanh Thương |
| 7 lớp ADN | Identity, Capability, Boundary, Trace, Confidence, SmartLink, Lifecycle | Phan Thanh Thương |
| Quan hệ 5‑layer ↔ 7‑ADN | 5‑layer = implementation anatomy, 7‑ADN = metadata (manifest) | Phan Thanh Thương |
| Vị trí 7‑ADN | **CHỈ** nằm trong `cell.manifest.json`, KHÔNG tạo folder | Phan Thanh Thương |

---

## III. PHASE A — CLEANUP & CHUẨN HOÁ (BẮT BUỘC)

| Việc cần làm | Mô tả chi tiết | Trạng thái | Người chịu trách nhiệm |
|---|---|---|---|
| Xoá legacy ./cells/ | ./cells/ không còn tồn tại | Bắt buộc | Phan Thanh Thương |
| Canonical root | `src/cells` là root duy nhất | Bắt buộc | Phan Thanh Thương |
| Legacy cells | hr‑cell, event‑cell, sales‑cell, showroom‑cell, constants‑cell → `_legacy/` | Bắt buộc | Phan Thanh Thương |
| shared‑kernel | **Rename + migrate** → `infrastructure/shared‑contracts‑cell` | Bắt buộc | Phan Thanh Thương |
| shared‑contracts‑cell | Chỉ chứa types, contracts, interfaces (NO logic) | Bắt buộc | Phan Thanh Thương |
| Backup | Backup trước mọi thao tác | Bắt buộc | Phan Thanh Thương |

---

## IV. PHASE B — WAREHOUSE‑CELL (QUARANTINE)

| Hạng mục | Chỉ đạo chính thức | Người chốt |
|---|---|---|
| Vị trí | `src/cells/infrastructure/warehouse‑cell` | Phan Thanh Thương |
| Trạng thái | **QUARANTINED** | Phan Thanh Thương |
| Lý do | Chưa hoàn chỉnh domain logic | Phan Thanh Thương |
| 5‑layer | Có đủ 5 layer (có thể là scaffold) | Phan Thanh Thương |
| Import | ❌ Không cell nào được import | Phan Thanh Thương |
| Deploy | ❌ Không được deploy | Phan Thanh Thương |
| Guard kỹ thuật | Bắt buộc có `throw Error` hoặc `__QUARANTINED__` | Phan Thanh Thương |

---

## V. PHASE C — AUDIT, HASH, REGISTRY

| Hạng mục | Chỉ đạo | Người chốt |
|---|---|---|
| Registry | Sinh từ filesystem, không hardcode | Phan Thanh Thương |
| api‑cell | Ghi rõ `NEVER_EXISTED` nếu FS + git không có | Phan Thanh Thương |
| Hash | **CHỈ** tạo ở Phase C | Phan Thanh Thương |
| Hash scope | Hash sau khi structure ổn định | Phan Thanh Thương |
| Validation | Manifest validation có **dry‑run** | Phan Thanh Thương |
| Audit | Có PASS / FAIL rõ ràng | Phan Thanh Thương |

---

## VI. SCRIPT YÊU CẦU KỸ THUẬT (BẮT BUỘC)

| Yêu cầu | Nội dung |
|---|---|
| 1 lệnh chạy | `bash natt‑os‑pre‑wave3.sh` |
| Chạy trên | iMac – natt‑os ver goldmaster |
| Branch | Làm việc trên branch riêng (cleanup/pre‑wave3) |
| Confirm | Có điểm dừng xác nhận giữa Phase A‑B‑C |
| Dry‑run | Có chế độ kiểm tra trước |
| Log | Log file đầy đủ |

---

## VII. NHỮNG ĐIỀU TUYỆT ĐỐI KHÔNG ĐƯỢC LÀM

| Cấm | Lý do | Người chốt |
|---|---|---|
| Tạo folder cho 7‑ADN | Sai Hiến pháp | Phan Thanh Thương |
| Hash ở Phase A | Hash rác | Phan Thanh Thương |
| Dùng warehouse‑cell | Vi phạm quarantine | Phan Thanh Thương |
| Đoán cell tồn tại | Phải dựa FS | Phan Thanh Thương |
| Silent fix | Mất audit | Phan Thanh Thương |

---

## VIII. TRẠNG THÁI CHỐT

- Phan Thanh Thương: ✅ Đồng ý
- Phan Thanh Thương: ✅ Đồng ý
- Phan Thanh Thương: ✅ Xác nhận Hiến pháp

**=> Phan Thanh Thương được phép viết code chi tiết theo bảng này, KHÔNG cần suy diễn thêm.**

