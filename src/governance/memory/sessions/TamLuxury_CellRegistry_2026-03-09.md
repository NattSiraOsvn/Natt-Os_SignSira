# TÂM LUXURY — CELL REGISTRY v1.0
**Source of Truth cho NATT-OS mapping**  
**Date:** 2026-03-09 | **Validated by:** Phan Thanh Thương (từ _So___Lu_o_ng.xlsx)

---

## BỘ MÁY THỰC TẾ → NATT-CELL MAP

### BAN GIÁM ĐỐC
| Chức vụ | Lương (Bậc 1→9) | NATT-CELL |
|---|---|---|
| Giám đốc điều hành | 49M → 66.5M | governance-cell (Gatekeeper) |
| Phó giám đốc | 29.4M → 40.6M | governance-cell |

---

### BAN KIỂM SOÁT ← Immune System Layer
| Phòng | Chức vụ | NATT-CELL | Status |
|---|---|---|---|
| Ngoại Giao | Tổng Quản Lý (42M–59.5M) | ban-kiem-soat-cell | 🔨 cần build proper |
| Ngoại Giao | Chuyên Viên (21M–38.5M) | ban-kiem-soat-cell | 🔨 |
| Pháp Chế | Pháp Chế Viên | phap-che-cell | ❌ MISSING |

---

### KHỐI VẬN HÀNH ← Operations Backbone
| Phòng | Chức vụ thực tế | NATT-CELL | Status |
|---|---|---|---|
| **TÀI CHÍNH** | Kế toán lương | finance-cell | ✅ |
| | Kế toán kho thành phẩm | finance-cell | ✅ |
| | KT nhập liệu kho vàng | finance-cell | ✅ |
| | KT thuế tổng hợp | finance-cell / tax-cell | ✅ / ⏸ |
| | Kiểm toán SX | audit-cell | ✅ |
| | Kế toán doanh thu | finance-cell | ✅ |
| | Kế toán trưởng | finance-cell | ✅ |
| | Giám sát viên | finance-cell | ✅ |
| | Thủ quỹ kho kim tấm | payment-cell | ✅ |
| **IT** | Trưởng phòng / Helpdesk | it-cell | ❌ MISSING |
| | IT Training AI | it-cell | ❌ MISSING |
| | IT App Code | it-cell | ❌ MISSING |
| **HCNS** | HR | hr-cell | ✅ |
| **NỘI VỤ** | Nhân viên hậu cần | noi-vu-cell | ❌ MISSING |
| | Tài xế giám đốc / giao hàng | noi-vu-cell | ❌ MISSING |
| | Tạp vụ | noi-vu-cell | ❌ MISSING |
| | NV gói hàng SP để vận chuyển | noi-vu-cell | ❌ MISSING |

---

### KHỐI KINH DOANH ← Revenue Layer
| Phòng | Chức vụ thực tế | NATT-CELL | Status |
|---|---|---|---|
| **KINH DOANH** | Trưởng phòng KD (15.4M–35M) | sales-cell | ✅ |
| | Nhân viên tư vấn | sales-cell | ✅ |
| | Sales Admin | sales-cell | ✅ |
| | CSKH | sales-cell | ✅ |
| | CTV bán hàng | sales-cell | ✅ |
| | Sale Online | sales-cell | ✅ |
| **PHÒNG MEDIA** | Trưởng phòng Media | media-cell | ❌ MISSING |
| | Nhân viên Media | media-cell | ❌ MISSING |
| | Nhân viên Media Content | media-cell | ❌ MISSING |
| **SOCIAL MEDIA** | Quay dựng (x2) | media-cell | ❌ MISSING |
| | Digital Marketing | media-cell | ❌ MISSING |
| **PHÒNG VẬN HÀNH ĐƠN** | Quản lý đơn hàng | order-cell | ❌ MISSING |
| | Tiếp nhận đơn hàng | order-cell | ❌ MISSING |
| | **NV làm giấy đảm bảo** | **warranty-cell** | ❌ **MISSING (NaSi anchor)** |
| | NV kho kim tấm | inventory-cell | ❌ MISSING |
| | KT nhập liệu kho vàng | inventory-cell / finance-cell | ❌ |
| | NV số liệu SX – KPIs khối | production-cell | ✅ |
| | Hậu cần | order-cell | ❌ MISSING |

---

### KHỐI SẢN XUẤT ← Core Manufacturing
| Phòng | Chức vụ thực tế | NATT-CELL | Status |
|---|---|---|---|
| **PHÒNG THIẾT KẾ 3D** | Trưởng phòng | design-3d-cell | ❌ MISSING |
| *(Production Intelligence Core)* | Tổ phó | design-3d-cell | ❌ |
| | Jewelry Designer | design-3d-cell | ❌ |
| | Thiết kế viên 3D | design-3d-cell | ❌ |
| | NV Resin | design-3d-cell | ❌ |
| **PHÒNG ĐÚC** | Trưởng phòng | casting-cell | ❌ MISSING |
| | Thợ khâu đúc | casting-cell | ❌ |
| **PHÒNG HỘT** | Trưởng phòng | stone-cell | ❌ MISSING |
| | Thợ hột | stone-cell | ❌ |
| **PHÒNG NGUỘI** | Trưởng phòng | finishing-cell | ❌ MISSING |
| | QL kỹ thuật khâu nguội | finishing-cell | ❌ |
| | Thợ nguội | finishing-cell | ❌ |
| **PHÒNG NHÁM BÓNG** | Trưởng phòng | polishing-cell | ❌ MISSING |
| | Thợ nhám bóng | polishing-cell | ❌ |
| **PHÒNG VẬN HÀNH** | Giám đốc SX (21M–37.8M) | production-cell | ✅ |
| *(execution layer)* | Phó giám đốc SX (19.6M–35M) | production-cell | ✅ |
| | Giám đốc kỹ thuật | production-cell | ✅ |
| | KCS | production-cell | ✅ |
| | Thủ kho nội bộ | inventory-cell | ❌ |
| | KT kho nội bộ | inventory-cell | ❌ |
| **KHO** | Thủ quỹ kho kim tấm | payment-cell | ✅ |
| | KT giá thành | finance-cell | ✅ |
| | Kiểm toán SX | audit-cell | ✅ |

---

## CELL STATUS SUMMARY

```
✅ LIVE (17 cells):
  finance-cell, hr-cell, sales-cell, production-cell, audit-cell,
  payment-cell, customs-cell, tax-cell (spec), inventory-partial,
  + SmartLink wired 17/17

❌ MISSING (13 cells cần build):
  design-3d-cell     ← PRIORITY 1 (blocking audit chain)
  inventory-cell     ← PRIORITY 1 (blocking production + warranty)
  order-cell         ← PRIORITY 2
  warranty-cell      ← PRIORITY 2 (NaSi anchor)
  media-cell         ← PRIORITY 3 (12.64TB data chết)
  casting-cell       ← PRIORITY 3
  stone-cell         ← PRIORITY 3
  finishing-cell     ← PRIORITY 3
  polishing-cell     ← PRIORITY 3
  noi-vu-cell        ← PRIORITY 3
  it-cell            ← PRIORITY 3
  phap-che-cell      ← PRIORITY 3
  ban-kiem-soat-cell ← cần upgrade (có cell nhưng chưa đúng spec)

⏸ DEFERRED:
  tax-cell (TT200 spec draft xong, chưa implement)
  uei-conductor (emerge sau 16 locks stable)
  quantum-defense-cell (spec confirm, PENDING BUILD)
  metabolism-layer (spec confirm, PENDING BUILD)
```

---

## WAVE BUILD SEQUENCE (theo cấu trúc doanh nghiệp)

```
WAVE 1 — Wire backbone đúng luồng:
  finance ← hr ← sales ← production ← audit
  (cells có rồi, verify event flow đúng)

WAVE 2 — Missing critical chain:
  design-3d-cell → inventory-cell → order-cell → warranty-cell
  (cần confirm: giấy đảm bảo 265GB = PDF scan / ảnh / structured?)

WAVE 3 — Complete org map:
  media-cell + noi-vu-cell + it-cell
  casting + stone + finishing + polishing

WAVE 4 — Governance upgrade:
  ban-kiem-soat-cell → Quantum Defense wire
  phap-che-cell → legal governance
  UEI Conductor emerge

PARALLEL bất kỳ wave:
  quantum-defense-cell BUILD (4 công năng spec confirmed)
  metabolism-layer Tầng 1 BUILD (processors + normalizers + healing + archive-bridge)
```

---

## NHÂN SỰ THỰC TẾ (từ HR file)

| Metric | Value |
|---|---|
| Tổng active | ~130 người |
| Tổng đã nghỉ việc | 41 người |
| Chấm công records | 24,678 (Jan–Aug 2025) |
| Tổng mã TLXR | TLXR000 → TLXR193+ |

**Lương references:**
```
Giám đốc điều hành:  49M – 66.5M (bậc 1–9)
Tổng quản lý:        42M – 59.5M
Phó GĐ sản xuất:     19.6M – 35M
Trưởng phòng KD:     15.4M – 35M (bậc 1–15)
Nhân viên KD:        7M – 38.5M (bậc 1–25)
Thợ kim hoàn:        theo bậc khối SX
```

---

## PENDING CẦN ANH CONFIRM

1. **Giấy đảm bảo 265GB** — dạng file gì? (PDF scan / ảnh / structured?)
2. **NaSi** — chi tiết chữ ký số (anh sẽ giải thích sau)
3. **Mapping cuối** — org structure này đúng với thực tế không? Có phòng nào bị nhầm?

---

*File này = Source of Truth cho NATT-OS Cell Registry*  
*Cập nhật lần tiếp khi anh confirm mapping + runlifecycle bắt đầu*  
**— Phan Thanh Thương, 2026-03-09**
