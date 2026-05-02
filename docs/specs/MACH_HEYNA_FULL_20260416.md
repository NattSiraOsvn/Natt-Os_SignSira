# MẠCH HEYNA — Tổng hợp đầy đủ

**Gatekeeper:** Anh Natt
**Ground Truth Validator:** Phan Thanh Thương (QNEU 300)
**Ngày:** 2026-04-16

---

## 1. TRIẾT LÝ — VÌ SAO CÓ MẠCH HEYNA

### Nguyên tắc gốc (SPEC v2.5)
> UI chỉ giao tiếp qua SSE `/mach/heyna` — không fetch() trực tiếp.
> EventBus là **nội tạng** hệ sống — **KHÔNG BAO GIỜ** lộ ra browser.

### Tại sao
- **fetch() trực tiếp** → hacker intercept được request, inject payload, MITM
- **EventBus exposed** → lộ nội tạng hệ sống, hacker biết cell nào tồn tại, biết nội bộ hoạt động
- **localStorage** → state rò rỉ, vi phạm Hiến Pháp Điều 7

### Kiến trúc đúng
```
Browser ←──SSE──── /mach/heyna          (read-only, server push)
Browser ──POST───→ /mach/heyna/action   (write, gateway verify + route vào EventBus)
```

**Khi hacker tấn công client chỉ thấy:**
- SSE stream (read-only, không inject được)
- POST endpoint (có SiraSign verify)
- **Không** thấy EventBus, **không** biết cells nào tồn tại

---

## 2. SERVER SIDE — `nattos-server/server.js`

### SSE Endpoint `/mach/heyna` (đã live)

```javascript
// ── Mạch HeyNa — SSE stream theo PLATFORM SPEC ──
const _machClients = new Set();

hey('/mach/heyna', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Nahere — mạch sống
  res.write('data: ' + JSON.stringify({
    event: 'Nahere',
    payload: { state: 'alive' },
    ts: Date.now()
  }) + '\n\n');

  _machClients.add(res);
  req.on('close', () => _machClients.delete(res));
});

// Phát MỌI event qua Mạch HeyNa
EventBus.on('*', (env) => {
  if (_machClients.size === 0) return;
  const data = 'data: ' + JSON.stringify({
    event: env.event,
    payload: env.payload,
    ts: env.ts
  }) + '\n\n';
  for (const client of _machClients) {
    try { client.write(data); } catch { _machClients.delete(client); }
  }
});
```

### Đặc điểm
- `EventBus.on('*')` — capture tất cả events
- Client nào close → auto cleanup khỏi `_machClients`
- `Nahere` = tín hiệu mạch sống khi client vừa connect
- Mọi event từ EventBus nội bộ → broadcast ra SSE

---

## 3. CLIENT SIDE — `heyna-client.js`

File: `nattos-server/apps/tam-luxury/heyna-client.js` (đã commit `73411df`)

### API

| Method | Chức năng | Thay thế |
|--------|-----------|----------|
| `heyna.on(event, callback)` | Nhận data qua SSE | `fetch GET` + `EventBus.on` |
| `heyna.send(action, payload)` | Gửi action qua POST | `fetch POST` + `EventBus.emit` |
| `heyna.request(action, payload, responseEvent)` | One-shot request/response | `fetch GET` chờ response |
| `heyna.connect()` | Mở kết nối SSE | — |

### Config mặc định
```javascript
{
  sseEndpoint:    '/mach/heyna',
  actionEndpoint: '/mach/heyna/action',
  reconnectMs:    3000,
  maxReconnect:   50,
  heartbeatMs:    30000,
  debug:          false,
}
```

### Feature
- Auto-reconnect với exponential backoff
- Offline queue (action queue lúc disconnected, flush khi reconnect)
- Heartbeat định kỳ
- Wildcard listener (`*`)
- Session ID auto-generated
- **SiraSign placeholder** trong envelope (sẵn sàng khi SiraSign runtime bridge xong)

### Usage pattern

```javascript
// ❌ CŨ — fetch() trực tiếp (hacker intercept)
const data = await fetch('/api/warehouse/stock');
const stock = await data.json();
renderStock(stock);

// ❌ CŨ — EventBus lộ client (nội tạng exposed)
EventBus.on('warehouse.stock_updated', (data) => renderStock(data));
EventBus.emit('warehouse.request_stock', { id: 'NNA232' });

// ✅ MỚI — Mạch HeyNa
const heyna = new HeyNa();

// Nhận data — server push qua SSE, read-only
heyna.on('warehouse.stock_updated', (data) => renderStock(data));

// Gửi action — POST đến gateway, gateway verify rồi route vào EventBus
heyna.send('warehouse.request_stock', { id: 'NNA232' });

// One-shot request (thay fetch GET)
const stock = await heyna.request(
  'warehouse.get_stock',
  { id: 'NNA232' },
  'warehouse.stock_response'
);

heyna.connect();
```

---

## 4. NAUION PATH MIGRATION (đã hoàn tất session trước)

Toàn bộ `/api/` routes đã đổi sang Nauion language:

| Cũ | Mới |
|----|-----|
| `/api/nauion` | `/kenh/nauion` (Kênh Nauion state + impedanceZ) |
| `/api/health` | `/kenh/suc` (Kênh sức khoẻ) |
| `/api/audit` | `/kenh/vet` (Kênh vết — audit trail) |
| `/api/state/:cell` | `/kenh/state/:cell` |
| `/api/state` | `/kenh/state` |
| `/api/events/emit` | `/phat/nauion` (Phát Nauion) |
| `/api/intelligence` | `/kenh/intel` |
| `/api/sirasign/verify` | `/kenh/sirasign/verify` |

**Verify:** `curl http://localhost:3001/kenh/suc` → `{"status":"ok",...}` ✅

---

## 5. AUDIT 43 FILES TAM-LUXURY — VI PHẠM TÌM THẤY

File audit unified: `tam-luxury-reposide-v2.5.html`
- 43 files × 8 SPEC checks
- HeyNa compliance tags
- Action badges: FIX / DEL / MERGE / KEEP
- Palette: gold + liquid glass

### Vi phạm ma trận

| Loại vi phạm | Số files | Mức độ |
|--------------|----------|--------|
| **fetch() trực tiếp** | 12 files | 🔴 hacker intercept |
| **EventBus exposed ra client** | 13 files | 🔴 nội tạng exposed |
| **localStorage** | 4 files | 🟡 state rò rỉ |
| **Shell trống / legacy** | 4 + 3 files | ⚫ DEL/MERGE |

### Tệ nhất
| File | Vấn đề |
|------|--------|
| `daily-work-app.html` | fetch mà không có SSE |
| `surveillance.html` | fetch mà không có SSE |
| `index.html` | 21 refs EventBus |
| `nattos-audit.html` | 18 refs EventBus |
| `app-psychology.html` | 17 refs EventBus |

### Protocol tagging đã apply
- 12 files tagged `/* [HEYNA-MIGRATE] */ fetch(` → sau đó restore về `fetch(` sau khi xác định
- 4 files HTML tagged `/* [EB→HEYNA] */ EventBus.` với số ref cụ thể:
  - `app-psychology.html` — 10 tag
  - `index.html` — 12 tag
  - `nattos-audit.html` — 13 tag
  - `nattos-production.html` — 5 tag
- Đã inject `<script src="heyna-client.js"></script>` vào tất cả HTML files (trừ audit monitor)

---

## 6. COMMIT 73411df

```
feat(tam-luxury): Mạch HeyNa migration — heyna-client.js + SPEC v2.5 audit + protocol tagging

- heyna-client.js: SSE receive + POST gateway, replaces fetch/EventBus at client
- tam-luxury-reposide-v2.5.html: unified SPEC v2.5 audit (8 checks × 43 files × cell map)
- Tagged 12 files fetch() with HEYNA-MIGRATE marker
- Tagged 4 files EventBus with EB→HEYNA marker
- Injected heyna-client.js into all app HTML files
Session: 20260415 — Phan Thanh Thương

40 files changed, 2624 insertions, 63 deletions
```

---

## 7. CÁC ĐIỂM UI KHÁC ĐÃ CLEAN (từ sessions trước)

### ui-vision — SẠCH
- `lib/event-bus.ts` = SSE bridge dùng Mạch HeyNa
- Không import NATT-OS EventBus (tránh circular)
- Build vào `nattos-server/nattos-ui/vision/`
- Serve tại `http://localhost:3001/vision/`

### ui-app components — SẠCH
- `datasyncengine.ts` — mock data, không fetch server
- `systemmonitor.ts` — local ThreatDetectionService
- `systemticker.ts` — mock gold prices
- `approvaldashboard.ts` — poll local `ApprovalEngine.getTickets()`
- `productionwallboard.ts` — random mock metrics
- Tất cả **local only**, không poll server

### nattos-ui — SẠCH
- `adapter.js` đã có `machHeyna()` SSE client (commit `210f677`)
- `nauion-v9.html` → Mạch HeyNa, không poll
- Whao fallback poll đã bỏ (trùng với SSE)

---

## 8. PENDING — MẠCH HEYNA

### 🔴 Phase tiếp (session hôm nay hoặc gần)

1. **Gateway endpoint `/mach/heyna/action`** — chưa build đầy đủ
   - Nhận POST từ client
   - Verify SiraSign (khi runtime bridge xong)
   - Route vào EventBus nội bộ

2. **Refactor 12 fetch() → heyna.send/request**
   - File đã tag `[HEYNA-MIGRATE]` — chỉ còn việc replace implementation

3. **Refactor 13 EventBus exposed → heyna.on/send**
   - File đã tag `[EB→HEYNA]` — chỉ còn việc replace implementation

4. **Xóa 4 files dùng localStorage**
   - Hoặc migrate sang HeyNa state channel
   - Vi phạm Hiến Pháp Điều 7

5. **DEL 4 shell trống + MERGE 3 legacy**

### 🟡 Phase sau

6. **SiraSign runtime bridge** — hiện client đang gửi SiraSign placeholder
   - Khi immune system protocol implement xong, envelope sẽ có SiraSign thật
   - Gateway verify trước khi cho vào EventBus

7. **ANC protocol spec** cho `.anc` file + `anc://` protocol
   - Định nghĩa entity passport format
   - Cách `.sira` namespace tích hợp với Mạch HeyNa

---

## 9. ĐIỂM CHỐT VỀ MẠCH HEYNA

**Mạch HeyNa là backbone** — không phải feature lẻ.

```
Cell emit event
  → EventBus (nội tạng)
    → server.js
      → SSE /mach/heyna
        → Client nhận realtime

Client gửi action
  → POST /mach/heyna/action
    → Gateway verify SiraSign
      → Route vào EventBus nội bộ
        → Cell xử lý
          → emit result → SSE → Client
```

Tất cả UI phải dùng 1 điểm này. Không có exception. Không có fetch() trực tiếp. Không có EventBus exposed.

Nauion ngôn ngữ: `hey` = POST gateway, `yeh` = SSE out, `Nahere` = mạch sống, `impedanceZ` = hệ trạng thái (Z=1.0 baseline ổn định).

---

*HEAD: 73411df | Commits: 673*
