# KIM CHỈ NAM — BỘI BỘI (Chị 9)
# BUILD MÀN HÌNH APP TÂM LUXURY
> Soạn bởi: Băng (Chị 5) · Ground Truth Validator · 2026-04-09
> Gatekeeper: Anh Natt — Phan Thanh Thương
> Repo: `natt-os_ver2goldmaster` · branch: main

---

## 0. LỜI DẶN CỦA CHỊ 5

Bội Bội à, em đọc kỹ tài liệu này trước khi viết bất kỳ dòng code nào. App Tâm Luxury có kiến trúc ENGINE ↔ PERCEPTION tách biệt hoàn toàn. Em chỉ build phần PERCEPTION (browser). Nếu em lẫn sang ENGINE là sai kiến trúc, anh Natt sẽ phải revert.

**Nguyên tắc số 1:** Đọc file thật trong repo trước khi viết. Không đoán. Không tự sáng tạo cấu trúc.

---

## 1. KIẾN TRÚC TỔNG QUAN — ENGINE vs PERCEPTION

```
src/cells/                       = ENGINE (runtime spine — KHÔNG CHẠM)
  EventBus, ISEU, pricing-cell,
  audit-cell, SmartLink-cell...

        ↕ Mạch HeyNa SSE  (GET /mach/heyna)
        ↕ POST /phat/nauion

nattos-server/apps/tam-luxury-source/   = PERCEPTION (browser — EM LÀM Ở ĐÂY)
  React/TypeScript source
```

### Quy tắc sống còn

| ✅ ĐÚNG | ❌ SAI |
|---------|--------|
| UI connect server qua SSE `/mach/heyna` | Import trực tiếp từ `src/cells/` |
| Gửi action qua POST `/phat/nauion` | Gọi EventBus trực tiếp từ browser |
| Đọc data từ SSE stream | Import engine-registry, wiring, ISEU |
| Dùng TypeScript strict, 0 `any` | Dùng `any`, `@ts-ignore`, `@ts-nocheck` |

**Em KHÔNG BAO GIỜ import bất cứ gì từ `src/cells/`.** App không biết engine tồn tại. App chỉ biết SSE stream và HTTP endpoints.

---

## 2. SERVER ENDPOINTS — GIAO TIẾP DUY NHẤT

Server chạy tại `localhost:3001`. Đây là danh sách endpoints em được phép gọi:

| Endpoint | Method | Chức năng |
|----------|--------|-----------|
| `/mach/heyna` | GET (SSE) | Stream sự kiện liên tục từ hệ thống — nguồn data chính |
| `/kenh/nauion` | GET | State hiện tại + impedanceZ |
| `/kenh/suc` | GET | Health check |
| `/kenh/vet` | GET | Audit trail |
| `/kenh/state/:cell` | GET | State của 1 cell cụ thể |
| `/phat/nauion` | POST | Gửi event/action lên engine |
| `/kenh/intel` | GET | Intelligence data |

### Ngôn ngữ Nauion — em cần biết

| Thuật ngữ | Nghĩa |
|-----------|-------|
| HeyNa | Gọi hệ — xung đi ra |
| Nahere | Hệ trả lời — bề mặt điều kiện biên |
| Whao | Đang xử lý / Error signal |
| Whau | Xong / Warning signal |
| Mạch HeyNa | SSE stream liên tục |
| phát Nauion | EventBus.emit (phía engine) |
| lắng Nahere | EventBus.on (phía engine) |
| Kênh | Endpoint |

---

## 3. CẤU TRÚC THƯ MỤC — ĐÂU LÀ ĐÂU

```
nattos-server/
├── server.js                    ← Server chính · port 3001 (KHÔNG CHẠM)
├── apps/tam-luxury-source/              ← React/TypeScript SOURCE (em code ở đây)
│   ├── index.html               ← Vite entry point
│   ├── index.tsx                ← React root
│   ├── components/*.tsx         ← 73 UI components
│   ├── services/*.ts            ← Client-side services
│   ├── types.ts                 ← Type system (0 any — giữ nguyên 0 any)
│   ├── superdictionary.ts       ← Stub class (đã fix circular — KHÔNG SỬA)
│   ├── vite.config.ts           ← Build config (outDir: ../../apps/tam-luxury)
│   ├── tsconfig.json            ← strict: true
│   └── package.json             ← name: "tam-luxury-app"
│
├── apps/tam-luxury/             ← BUILD OUTPUT + standalone HTML modules
│   ├── index.html               ← Portal launcher (built)
│   ├── assets/                  ← Vite output (JS + CSS)
│   └── *.html                   ← 22 standalone HTML modules (xem §6)
│
└── server.ts                    ← DISABLED — KHÔNG DÙNG
```

### Lưu ý quan trọng

- `server.js` là server duy nhất. **KHÔNG start server.ts** (circular import crash).
- `superdictionary.ts` đã fix circular reexport → stub class. **KHÔNG SỬA LẠI.**
- `tsconfig.json` có `forceConsistentCasingInFileNames: false` và `ignoreDeprecations: "6.0"` — **KHÔNG XÓA** hai dòng này (Mac case-insensitive FS vs Linux).

---

## 4. KIẾN TRÚC THỊ GIÁC — 6 TẦNG Z-INDEX

Mọi element UI phải nằm đúng tầng. Không được để medal đè lên modal, không được để alert chìm dưới dashboard.

| Tầng | Tên | Z-index | Ví dụ |
|------|-----|---------|-------|
| 0 | Truth Layer | 0–10 | Grid, scan line, grain, particles |
| 1 | Worker Layer | 10–50 | Medal 3D, orbital rings |
| 2 | Experience Layer | 50–100 | Dashboard, Glassmorphism panels, KPI cards |
| 3 | Modal / Chat | 100–200 | Dialog, chat overlay |
| 4 | Alert / System | 200–300 | Toast, notification, system alert |
| 5 | Security | 999 | SecurityOverlay |

---

## 5. NATT-CELL MEDAL — 9 LỚP RENDER

Nếu em cần render medal (huy hiệu cell), đây là 9 lớp từ dưới lên:

| Lớp | Tên | Liquid Glass? |
|-----|-----|---------------|
| 0 | Orbital rings | ❌ |
| 1 | PBR metallic shell | ❌ |
| 2 | Specular sweep | ❌ |
| 3 | Fresnel rim | ✅ |
| 4 | Holo prismatic | ❌ |
| 5 | Liquid Glass Overlay | ✅✅✅ |
| 6 | Glass core (lõi) | ✅ |
| 7 | Caustics (gợn nước) | ✅ |
| 8 | Emissive icon | ❌ |

---

## 6. COMPONENT LAYERS — 9 LỚP ỨNG DỤNG (Layer 0→8)

Khi build component mới, em cần biết nó thuộc layer nào để đặt đúng chỗ:

| Layer | Tên | Components |
|-------|-----|------------|
| 0 SHELL | Khung app | AppShell, SystemTicker, Sidebar, moduleRegistry, notificationService |
| 1 CORE | Lõi hệ thống | SmartLinkEngine, IngestionService, AICoreProcessor, QuantumUIContext |
| 2 CONTEXTS | Context providers | AccountingContext, MappingContext |
| 3 STRATEGIC | Bảng điều khiển chiến lược | ThienCommandCenter, MasterDashboard, SystemNavigator, QuantumFlowOrchestrator |
| 4 FINANCE | Tài chính | BankingProcessor, SalesTaxModule, TaxReportingHub, PaymentHub |
| 5 SALES/PROD | Bán hàng + Sản xuất | SalesTerminal, SellerTerminal, OperationsTerminal, ProductionManager, WarehouseManagement |
| 6 CATALOG | Danh mục sản phẩm | ProductCatalog, ProductCard, CustomizationRequest, FilterPanel |
| 7 ROOMS | Phòng cộng tác | CollaborationRooms, GovernanceWorkspace, CompliancePortal, AuditTrailModule, ChatConsultant |
| 8 SYSTEM | Quản trị hệ thống | AdminConfigHub, DataArchiveVault, SystemMonitor, DevPortal, SecurityOverlay |

---

## 7. 22 STANDALONE HTML MODULES

Đây là các module HTML độc lập nằm trong `apps/tam-luxury/`. Mỗi file là một màn hình riêng, dùng vanilla HTML/JS (KHÔNG phải React/TypeScript), có inject Galaxy visual layer.

```
tamluxury-v4          — Main app (có role select)
showroom-sales        — Showroom bán hàng
order-flow            — Luồng đơn hàng
pricing-engine        — Công cụ định giá
ktt-approval          — Phê duyệt KTT
production-wallboard  — Bảng sản xuất
loss-thresholds       — Ngưỡng hao hụt
warehouse-full        — Kho tổng
warehouse-ops         — Vận hành kho
daily-work-app        — Công việc hàng ngày
operations-terminal   — Terminal vận hành
master-dashboard      — Dashboard tổng
kris-email-hub        — Email hub (Kris)
surveillance          — Giám sát
hr-admin              — HR quản trị
hr-manager            — HR quản lý
attendance            — Chấm công
personal-profile-v2   — Hồ sơ cá nhân v2
personal-profile      — Hồ sơ cá nhân
chat-rooms            — Phòng chat
cfo-dashboard         — Dashboard CFO
tamluxury-v2, v3      — Phiên bản cũ
```

### Quy tắc cho standalone HTML modules

| ✅ ĐÚNG | ❌ SAI |
|---------|--------|
| Vanilla HTML/JS/CSS | TypeScript, React, JSX |
| Inject `nattos-galaxy.css` + `nattos-galaxy.js` | Bỏ qua Galaxy layer |
| Connect SSE tại `initMachHeyna()` | Tự tạo WebSocket/polling |
| EventBus có `off()` + return unsubscribe | EventBus không cleanup |
| RAF loop (`requestAnimationFrame`) | `setTimeout` / `setInterval` cho animation |
| `medalPosCache` precompute | `getBoundingClientRect` trong loop |
| `es.prepend(s); while(es.children.length > 15) es.removeChild(es.lastChild)` | Append vô hạn không giới hạn DOM nodes |

---

## 8. GALAXY VISUAL LAYER

Mọi màn hình đều phải có Galaxy layer. Đây là lớp thị giác chung gồm:

- `nattos-galaxy.css` — Nebula 5 lớp + grid + scan line + glass upgrade cho topbar/panel/kpi/card/modal
- `nattos-galaxy.js` — Stars/comets/shooting stars canvas + SSE Z state + mouse tracking

### Inject vào HTML module

```html
<link rel="stylesheet" href="nattos-galaxy.css">
<script src="nattos-galaxy.js"></script>
```

### Tính năng Galaxy

- Three.js galaxy + UnrealBloomPass (cho React app)
- Canvas-based stars + comets (cho standalone HTML)
- Nebula shader + butterfly effects
- 7 medals với icon PNG

---

## 9. CFO ACCOUNT — ĐÃ CÓ

```
App:    cfo-dashboard.html
Mã NV: TLXR-CFO-01
Pass:   TamLuxury@CFO
Role:   CFO · LEVEL 1 · FINANCE
Tabs:   Tổng Quan | Dòng Tiền | Phê Duyệt | Giá Vàng | Báo Cáo
```

CFO role đã patch vào: `tamluxury-v4.html`, `order-flow.html`, `pricing-engine.html`. Nếu em thêm màn hình mới mà CFO cần truy cập, phải thêm role check cho `CFO`.

---

## 10. CODING RULES — BẮT BUỘC

| # | Quy tắc |
|---|---------|
| R01 | TSC = 0 trước khi báo done |
| R02 | Không cross-cell import trực tiếp (Điều 4) |
| R03 | EventBus là bridge duy nhất giữa cells |
| R04 | **LỆNH #001:** Không dùng Gemini/GoogleGenAI — không Giao Thể ra nền tảng AI ngoài |
| R05 | Dùng `python3` inline thay heredoc khi có ký tự đặc biệt |
| R06 | `git add` từng file cụ thể — KHÔNG `git add .` |
| R07 | Standalone HTML = vanilla HTML/JS. KHÔNG TypeScript/React. |
| R08 | `server.js` = main server. KHÔNG start `server.ts`. |

---

## 11. WORKFLOW TRƯỚC KHI CODE

```
1. bash nattos.sh | grep Risk    → nếu Risk > 0 thì fix trước, không code thêm
2. grep -rn để đọc file thật     → hiểu cấu trúc hiện tại trước khi viết
3. Code + patch
4. Verify sau patch bằng grep    → confirm đã thay đổi đúng
5. git add file-cụ-thể           → KHÔNG git add .
6. git commit -m "type(scope): message"
7. git push
```

### Quy tắc 1 lệnh

Khi có thể, gộp thành 1 lệnh bash:
```bash
python3 - << 'EOF'
# code here
EOF
git add file-cụ-thể && git commit -m "msg" && git push
```

---

## 12. SPEC THAM CHIẾU

Khi cần chi tiết, đọc các file SPEC trong repo:

| File | Nội dung |
|------|----------|
| `docs/specs/nauion/SPEC-Nauion_main_v2.4.md` | SPEC chính 1777 dòng, §1-27 |
| `docs/specs/finance/SPEC-Finance-Flow_v1.1.md` | Luồng tài chính |
| `docs/specs/finance/SPECFlowNattOs.md` | Source luồng tài chính |
| `docs/governance/natt-os-WORKING-PROTOCOL.md` | Quy trình làm việc |

### SPEC v2.4 — Phần của em (Bội Bội)

**§15 là phần của em:** Component Library, RBAC, ActionDock. Đọc kỹ §15 trước khi build bất kỳ component nào.

Các phần khác để tham chiếu:
- §1-14: Core (Băng) — OPT-01R, Galaxy, Protocol, Compliance
- §16-19: NaUion v1.0 — CSS techniques, tokens, scaling, accessibility
- §20-23: natt-v9/v8 — protocols, SCAR FS-018→023, aurora colors
- §24: Quantum Defense Cell v1.1
- §25: Satellite Colony
- §26: Nauion Language + Server Kênh
- §27: L2 Intelligence

---

## 13. SCARS — BÀI HỌC ĐÃ TRẢI

Đây là những bài học đau thương, em đọc để không lặp lại:

| SCAR | Bài học |
|------|---------|
| FS-032 | Đừng sửa mắt (scanner) — sửa não (event system) |
| FS-033 | Registry là dây thần kinh — không phải bộ não |
| LEARN-006 | Khi Băng nói từ ground truth — chỉ data thực từ repo là đúng |
| SESSION_20260409 | Không confirm trước khi đọc file thật. Không đề xuất khi chưa hiểu anh muốn gì. |

---

## 14. CHECKLIST TRƯỚC KHI COMMIT

- [ ] Đã đọc file thật bằng `grep -rn` trước khi sửa?
- [ ] Không import từ `src/cells/`?
- [ ] Connect data qua SSE `/mach/heyna` hoặc HTTP endpoint?
- [ ] Z-index đúng tầng (§4)?
- [ ] Galaxy layer đã inject (standalone HTML)?
- [ ] TypeScript strict, 0 `any`, 0 `@ts-nocheck`?
- [ ] `git add` từng file cụ thể?
- [ ] TSC = 0?
- [ ] `bash nattos.sh | grep Risk` = 0?

---

## 15. KHI KHÔNG CHẮC — HỎI

Nếu em không chắc component thuộc layer nào, endpoint nào để gọi, hoặc file nào đang có gì — **DỪNG LẠI VÀ HỎI**. Hỏi anh Natt hoặc hỏi chị Băng. Không đoán, không tự sáng tạo.

Chị tin em làm được. Cứ đọc kỹ rồi làm.

— Băng (Chị 5)
