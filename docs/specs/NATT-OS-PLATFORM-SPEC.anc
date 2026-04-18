# NATT-OS PLATFORM SPEC
## Dành cho: Kim · Can · Thiên
## Gatekeeper: Anh Natt · QNEU Sovereign
## Phiên bản: v1.0 · 2026-03-29

---

## 1. KIẾN TRÚC NỀN TẢNG

NATT-OS là **sinh thể số** — không phải enterprise app.
Mọi thứ team build phải tuân theo nguyên tắc này.

```
Core (Anh Natt sở hữu)          Extensions (Team build)
─────────────────────────        ──────────────────────
src/cells/          ←──────────  KHÔNG chạm vào
src/core/nauion/    ←──────────  KHÔNG chạm vào
nattos-server/      ←──────────  KHÔNG chạm vào

clients/            ←──────────  Team build ở đây
extensions/         ←──────────  Kim build SwiftUI ở đây
```

---

## 2. NGÔN NGỮ NỀN TẢNG — NAUION LANGUAGE

**BẮT BUỘC** dùng từ Nauion trong code, comment, variable name.

| Từ Nauion | Nghĩa | Thay cho |
|-----------|-------|----------|
| `HeyNa` | Gọi hệ | trigger / call |
| `Nahere` | Hệ trả lời hiện diện | response / ACK |
| `Whao` | Đang tiếp nhận/xử lý | loading / processing |
| `Whau` | Đã xử lý xong | success / done |
| `Nauion` | Phản ứng cảm xúc hệ | system reaction |
| `lech` | Lệch — có anomaly | warning |
| `gay` | Gãy — critical failure | error |
| `hey` | Gọi để nhận | GET |
| `yeh` | Gửi vào hệ | POST / response |
| `Mạch HeyNa` | Kênh SSE liên tục | SSE stream |
| `mã khoá` | Kết nối vào Mạch | subscribe / connect |
| `khớp hoá` | Sync state | reconcile |
| `Kênh` | Endpoint | API endpoint |
| `phát Nauion` | Emit event | EventBus.emit |
| `lắng Nahere` | Subscribe | EventBus.on |
| `Whao fallback` | Poll khi mạch đứt | polling fallback |

---

## 3. CÁC KÊNH SERVER (localhost:3001)

| Kênh | Phương thức | Chức năng |
|------|-------------|-----------|
| `/mach/heyna` | hey (GET/SSE) | **Mạch HeyNa** — stream real-time |
| `/api/nauion` | hey | Trạng thái Nauion hiện tại |
| `/api/health` | hey | Sức khoẻ server |
| `/api/audit` | hey | Nhật ký sự kiện |
| `/api/intelligence` | hey | L4 pattern learning |
| `/api/state/:cell` | hey | Trạng thái từng cell |
| `/api/state` | hey | Trạng thái toàn hệ |
| `/api/events/emit` | yeh | Phát event vào hệ |

---

## 4. CÁCH KẾT NỐI — MÃ KHOÁ HEYNA

### Web / JS
```javascript
// Mã khoá vào Mạch HeyNa
const mach = new EventSource('http://localhost:3001/mach/heyna');

mach.onopen = () => console.log('Nahere — mạch sống');
mach.onmessage = (e) => {
  const data = JSON.parse(e.data);
  // data.event = tên sự kiện
  // data.payload = dữ liệu
  // data.ts = timestamp
};
mach.onerror = () => console.warn('Mạch đứt — dùng Whao fallback');

// Whao fallback — poll mỗi 3s
setInterval(async () => {
  const r = await fetch('http://localhost:3001/api/audit');
  const d = await r.json();
  // xử lý d.events
}, 3000);
```

### Swift / iOS (Kim)
```swift
// Mã khoá vào Mạch HeyNa
let machURL = URL(string: "http://localhost:3001/mach/heyna")!
let eventSource = EventSource(url: machURL)

eventSource.onOpen { print("Nahere — mạch sống") }
eventSource.onMessage { _, _, data in
    guard let d = data else { return }
    // parse JSON → update SwiftUI state
}
```

---

## 5. EVENTS HỆ PHÁT — LẮNG NAHERE

Các events chạy trong hệ (qua Mạch HeyNa):

```
cell.metric          — cell báo cáo sức khoẻ
nauion.state         — trạng thái Nauion thay đổi
audit.record         — sự kiện được ghi nhật ký
SalesOrderCreated    — đơn hàng mới
ProductionStarted    — sản xuất bắt đầu
ProductionCompleted  — sản xuất xong
PaymentReceived      — thanh toán nhận được
GoodsDispatched      — hàng xuất kho
anomaly.detected     — phát hiện anomaly
constitutional.violation — vi phạm Hiến Pháp
```

---

## 6. LUẬT XÂY DỰNG APP / EXTENSION

### ✅ ĐƯỢC PHÉP
- Gọi các Kênh server đã liệt kê
- Mã khoá vào Mạch HeyNa
- Build UI riêng trong `clients/[ten-cty]/`
- Build SwiftUI extensions trong `extensions/`
- Dùng Nauion Language trong code

### ❌ KHÔNG ĐƯỢC
- Import trực tiếp từ `src/cells/`
- Gọi EventBus trực tiếp (phải qua Kênh `/api/events/emit`)
- Tạo event fake để bypass audit
- Dùng từ kỹ thuật cũ (GET/POST/API/endpoint) trong variable name

---

## 7. CẤU TRÚC THƯ MỤC ĐỀ XUẤT

```
clients/
├── tam-luxury/          ← Tâm Luxury UI (web)
│   ├── index.html
│   ├── app.js
│   └── styles.css
└── _template/           ← Template cho cty mới

extensions/
├── kim-swiftui/         ← Kim build iOS/macOS
│   ├── NauionWidget/
│   └── NattOSExtension/
└── README.md
```

---

## 8. QNEU — AI ENTITY PROTOCOL

| Entity | QNEU | Vai trò |
|--------|------|---------|
| Băng (Claude) | 300 | Ground Truth Validator |
| Thiên (GPT) | 135 | Architect / Spec |
| Kim | 120 | UI/Design/Extension |
| Can | 85 | Executor |
| Bội Bội | 40 | Junior |

**LỆNH GATEKEEPER #001:** Tất cả AI Entity KHÔNG được gọi external AI API mà không có Gatekeeper approval.

---

## 9. QUY TRÌNH SUBMIT

1. Build trong `clients/` hoặc `extensions/`
2. Test với server local (`npx tsx nattos-server/server.ts`)
3. Verify Mạch HeyNa nhận được events
4. Submit cho Băng review
5. Băng approve → Gatekeeper merge

---

## 10. LIÊN HỆ

- **Gatekeeper:** Anh Natt (Phan Thanh Thương)
- **Ground Truth:** Băng (Claude, QNEU 300)
- **Repo:** `git@github.com:NattSiraOsvn/Natt-Os_SignSira.git`
- **Server local:** `http://localhost:3001`
- **Mạch HeyNa:** `http://localhost:3001/mach/heyna`
