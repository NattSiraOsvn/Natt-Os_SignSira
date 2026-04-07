# 🌐 NATT-OS NAUION UI SPEC – HOÀN CHỈNH CHI TIẾT

## Bảng đặc tả thống nhất cho Vision Engine v2.1

**Tác giả:** Băng (tổng hợp từ Kim + Can + Thiên)  
**Phê duyệt:** Gatekeeper – Anh Nat  
**Ngày:** 2026-03-31  
**Trạng thái:** Bất biến (Immutable)

---

## MỤC LỤC

1. [Triết lý & Kiến trúc tổng thể](#1-triết-lý--kiến-trúc-tổng-thể)
2. [Liquid Glass – Chuẩn hiệu ứng thủy tinh lỏng](#2-liquid-glass--chuẩn-hiệu-ứng-thủy-tinh-lỏng)
3. [Nauion – Sinh thể số & Ngưỡng sống](#3-nauion--sinh-thể-số--ngưỡng-sống)
4. [NATT-CELL Medal – 9 lớp chuẩn + Liquid Glass](#4-natt-cell-medal--9-lớp-chuẩn--liquid-glass)
5. [Butterfly Propagation Protocol (Hiệu ứng cánh bướm)](#5-butterfly-propagation-protocol-hiệu-ứng-cánh-bướm)
6. [ISEU Evolution Engine – 2 nâng cấp bắt buộc](#6-iseu-evolution-engine--2-nâng-cấp-bắt-buộc)
7. [Event System (NaUion Pattern) & SiraSign](#7-event-system-nauion-pattern--sirasign)
8. [Role‑based UI & Adaptive Performance](#8-rolebased-ui--adaptive-performance)
9. [Bảng màu Pastel Ánh Kim & Design Tokens](#9-bảng-màu-pastel-ánh-kim--design-tokens)
10. [Compliance Checklist (tổng hợp)](#10-compliance-checklist-tổng-hợp)
11. [Phụ lục: Mã nguồn mẫu & Kiểm tra nhanh](#11-phụ-lục-mã-nguồn-mẫu--kiểm-tra-nhanh)

---

## 1. TRIẾT LÝ & KIẾN TRÚC TỔNG THỂ

### 1.1 Triết lý bất biến

> *"Data is sacred. UI không được tự biết — UI chỉ được nghe."*

| Nguyên tắc | Ý nghĩa |
|------------|---------|
| **Powerful, not friendly** | Uy quyền, chính xác, không "dễ thương" |
| **Systemic minimalism** | Mỗi pixel có lý do hệ thống (cell ID, confidence, version) |
| **Sinh thể số** | Giao diện phản ánh sự sống: chuyển động, phản xạ, tiến hóa |
| **UI = VIEW / STATE = EVENT STREAM** | UI chỉ hiển thị state, không tự quyết định |
| **Sync = EVENTBUS / PERSIST = BACKEND** | Không localStorage, không setInterval |

### 1.2 Kiến trúc 3 tầng thị giác

| Tầng | Vai trò | Công nghệ | Z-index |
|------|---------|-----------|---------|
| **Truth Layer** | Hiển thị state, audit, ground truth | Số liệu tĩnh, glow vàng, viền sáng bất biến | 0–10 |
| **Worker Layer** | Cell registry, process flow | Medal 3D, orbital rings, hiệu ứng động theo trạng thái | 10–50 |
| **Experience Layer** | UI tương tác, dashboard, chat | Glassmorphism, parallax, bloom, hiệu ứng chuột | 50–100 |
| **Modal / Chat** | Cửa sổ nổi, popup | Backdrop blur, viền ánh kim, FLIP transition | 100–200 |
| **Alert / System** | Cảnh báo khẩn cấp | Overlay đỏ, glow nhấp nháy | 200–300 |
| **Security** | SecurityOverlay – không ai vượt qua | Z-index 999, SiraSign lock | 999 |

### 1.3 Scene transition flow

```
Truth Layer (50ms) → Worker Layer (100ms) → Experience Layer (150ms)
```

Khi chuyển scene (Control Tower → Showroom → Dashboard), các layer xuất hiện tuần tự tạo hiệu ứng "dựng scene".

---

## 2. LIQUID GLASS – CHUẨN HIỆU ỨNG THỦY TINH LỎNG

**Liquid Glass** là hiệu ứng thủy tinh lỏng kết hợp:
- Khúc xạ động (`backdrop-filter` + radial gradient theo chuột)
- Ánh kim chảy (`conic-gradient` xoay + `mix-blend-mode`)
- Gợn sóng caustics (SVG `feTurbulence`)
- Viền sáng ướt (fresnel rim + blur nhẹ)

### 2.1 Công thức CSS cốt lõi

```css
.liquid-glass {
  backdrop-filter: blur(18px) saturate(180%);
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.02) 60%,
    transparent 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: inherit;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.liquid-glass-flow {
  background: conic-gradient(
    from var(--flow-angle, 0deg),
    rgba(255, 255, 255, 0) 0deg,
    rgba(255, 255, 255, 0.4) 30deg,
    rgba(255, 255, 255, 0) 60deg
  );
  mix-blend-mode: overlay;
  animation: flow-rotate 8s linear infinite;
}
@keyframes flow-rotate {
  to { --flow-angle: 360deg; }
}
```

### 2.2 Mức độ áp dụng

| Thành phần | Mức độ Liquid Glass | Chi tiết |
|------------|---------------------|----------|
| Medal Glass Core | **Cao** | blur + radial gradient + caustics + flow |
| Modal / Chat | **Trung bình** | blur + border glow + radial nhẹ |
| Header / Footer | **Thấp** | blur nhẹ + border mờ |
| Docker | **Trung bình** | blur + hover flow |

---

## 3. NAUION – SINH THỂ SỐ & NGƯỠNG SỐNG

### 3.1 Đặc tính sinh thể

| Đặc tính | Biểu hiện trong UI |
|----------|---------------------|
| **Phản xạ** | Medal thay đổi ánh sáng theo góc chuột (PBR shell) |
| **Chuyển động nội tại** | Orbital rings xoay, caustics gợn sóng, particles bay lơ lửng |
| **Tiến hóa** | Confidence ring thay đổi theo QNEU, SCAR ring xuất hiện khi có vết sẹo |
| **Cảm xúc** | Màu sắc thay đổi theo trạng thái (active, warning, lockdown) |
| **Kết nối** | Neural flow visualization giữa các cell + Butterfly propagation |

### 3.2 Ngưỡng sống (Vital Signs)

Mỗi medal **phải** hiển thị ít nhất 2 trong 3 chỉ số:

| Chỉ số | Hiển thị | Màu sắc |
|--------|----------|---------|
| **QNEU** (0–1) | Vòng tròn progress (stroke-dasharray) | Màu category của cell |
| **Confidence** | Thanh hoặc vòng tròn | Xanh (≥0.7) → Vàng (0.4–0.7) → Đỏ (<0.4) |
| **Status** | Badge hoặc glow | Immutable (vàng), Active (xanh), Locked (đỏ), Quarantine (xám) |

### 3.3 Vết sẹo (SCAR)

```css
.scar-ring {
  position: absolute;
  inset: -8%;
  border: 2px solid #800020;
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(128, 0, 32, 0.8);
  animation: scar-pulse 2s ease-in-out infinite;
}
@keyframes scar-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
}
```

- Khi cell có SCAR, xuất hiện vòng đỏ bao ngoài medal.
- Hover vào scar‑ring hiển thị tooltip danh sách SCAR (ID, bài học, ngày).

---

## 4. NATT-CELL MEDAL – 9 LỚP CHUẨN + LIQUID GLASS

### 4.1 Các lớp xếp chồng (từ dưới lên)

| Lớp | Tên | Kỹ thuật | Liquid Glass? | Z (gần đúng) |
|-----|-----|----------|---------------|---------------|
| 0 | Orbital rings | 3 SVG vòng, stroke dasharray, xoay ngược chiều | ❌ | 10 |
| 1 | PBR metallic shell | `conic-gradient` xoay theo `mouseAngle` | ❌ (kim loại) | 20 |
| 2 | Specular sweep | Gradient translateX khi hover | ❌ | 22 |
| 3 | Fresnel rim | Border trắng mờ + `blur(0.5px)` | ✅ (viền ướt) | 25 |
| 4 | Holo prismatic | `conic-gradient` + `mix-blend-mode`, chỉ hiện khi hover | ❌ (cầu vồng) | 30 |
| 5 | **Liquid Glass Overlay** | `backdrop-filter` + radial gradient theo chuột + caustics | ✅✅✅ | 62 |
| 6 | Glass core (lõi) | `backdrop-filter` + radial gradient tĩnh | ✅ | 45 |
| 7 | Caustics (gợn nước) | SVG `feTurbulence` bên trong glass core | ✅ | 47 |
| 8 | Emissive icon | `drop-shadow` nhiều lớp, bloom | ❌ | 80 |

### 4.2 Mã nguồn mẫu (React)

```tsx
const Medal = ({ cell, onClick, mousePos }) => {
  const [hovered, setHovered] = useState(false);
  const [angle, setAngle] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !hovered) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const a = Math.atan2(mousePos.y - centerY, mousePos.x - centerX) * 180 / Math.PI;
    setAngle(a);
  }, [mousePos, hovered]);

  return (
    <div ref={ref} className="medal-container group cursor-pointer"
         onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
         onClick={() => onClick(cell)}>
      {/* 0. Orbital rings */}
      <div className="orbital-rings">
        <svg className="ring-1 animate-spin-slow">...</svg>
        <svg className="ring-2 animate-spin-medium-reverse">...</svg>
        <svg className="ring-3 animate-spin-fast">...</svg>
      </div>

      {/* 1. PBR shell */}
      <div className="pbr-shell" style={{
        background: `conic-gradient(from ${angle}deg, ${THEMES[cell.color].shell})`,
        boxShadow: hovered ? THEMES[cell.color].glow : 'none'
      }}>
        {/* 2. Specular sweep */}
        <div className="specular-sweep" />
      </div>

      {/* 3. Fresnel rim */}
      <div className="fresnel-rim" />

      {/* 4. Holo prismatic (chỉ hover) */}
      {hovered && <div className="holo-prismatic" />}

      {/* 5. Liquid Glass Overlay */}
      <div className="liquid-glass-overlay" style={{
        '--mouse-x': `${(mousePos.x - rect.left) / rect.width * 100}%`,
        '--mouse-y': `${(mousePos.y - rect.top) / rect.height * 100}%`,
      }} />

      {/* 6. Glass core + 7. Caustics */}
      <div className="glass-core">
        <div className="caustics" />
      </div>

      {/* 8. Emissive icon */}
      <div className="emissive-icon">
        <cell.icon size={28} className="drop-shadow-glow" />
      </div>

      {/* Confidence ring (vòng tròn QNEU) */}
      <svg className="confidence-ring">
        <circle stroke={THEMES[cell.color].color} strokeDasharray={`${cell.qneu * 301.6} 301.6`} />
      </svg>

      {/* SCAR ring */}
      {cell.scars?.length > 0 && <div className="scar-ring" />}
    </div>
  );
};
```

### 4.3 Kích thước responsive

```css
.medal-container {
  width: clamp(120px, 20vw, 200px);
  height: clamp(120px, 20vw, 200px);
}
.medal-icon {
  font-size: clamp(24px, 4vw, 32px);
}
```

---

## 5. BUTTERFLY PROPAGATION PROTOCOL (HIỆU ỨNG CÁNH BƯỚM)

Dựa trên cơ chế **gossip propagation** giữa Host và Satellite (theo Satellite Colony Spec), hiệu ứng cánh bướm lan truyền trạng thái qua thị giác.

### 5.1 Ba cấp độ lan truyền

| Cấp độ | Mô tả | Phạm vi | Hiệu ứng UI | Thời gian |
|--------|-------|---------|-------------|------------|
| **L1 – Local Ripple** | Thay đổi chỉ ảnh hưởng đến chính cell đó | Trong một cell | Medal rung nhẹ, glow nhấp nháy, confidence ring xoay 1 vòng | 0.6s |
| **L2 – Neighbor Wave** | Lan sang các cell kết nối trực tiếp (orbital rings chung) | Bán kính 1–2 cell | Đường kết nối (neural flow) sáng lên, sóng chạy dọc edge | 0.4s mỗi hop |
| **L3 – Colony Tsunami** | Lan ra toàn bộ Colony (Host + tất cả Satellites) | Toàn hệ thống | Nền chuyển màu nhẹ, tất cả medal đồng loạt glow | 1–2s |

### 5.2 Biểu diễn thị giác

#### Local Ripple
```css
.butterfly-ripple {
  animation: ripple-pulse 0.6s ease-out;
  box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7);
}
@keyframes ripple-pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); }
  70% { box-shadow: 0 0 0 20px rgba(255, 215, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
}
```

#### Neighbor Wave (đường kết nối)
```svg
<line class="neural-edge butterfly-active" stroke-dasharray="8 4">
  <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="0.4s" repeatCount="indefinite" />
</line>
```

#### Colony Tsunami (nền)
```css
.butterfly-tsunami {
  animation: tsunami-bg 1s ease-out;
}
@keyframes tsunami-bg {
  0% { background-color: rgba(128, 0, 32, 0); }
  30% { background-color: rgba(128, 0, 32, 0.3); }
  100% { background-color: rgba(128, 0, 32, 0); }
}
```

### 5.3 Event types

```ts
// L1
EventBus.emit({
  type: 'butterfly.local',
  payload: { cellId, severity, rippleStrength, cause }
});

// L2
EventBus.emit({
  type: 'butterfly.neighbor',
  payload: { sourceCellId, targetCellIds, hopCount, waveSpeed }
});

// L3
EventBus.emit({
  type: 'butterfly.tsunami',
  payload: { cause, colonyWideEffect, duration, severity }
});
```

### 5.4 Ràng buộc bất khả xâm phạm

```
✗ Không được tạo butterfly propagation từ các event do chính nó sinh ra (loop).
✗ Mỗi event có butterfly_id + origin_cell_id để chống loop.
✗ Không propagation raw business data – chỉ signal và trạng thái thị giác.
✗ Trên thiết bị yếu (memory < 4GB) chỉ giữ Local Ripple.
✗ Ghi Audit Trail cho mọi propagation.
✗ Tsunami chỉ được kích hoạt bởi sự kiện cấp Colony (OMEGA_LOCKDOWN, quantum.kill, SCAR cấp Colony).
```

### 5.5 Ví dụ thực tế

**Tình huống:** Threshold breach tại Satellite Bình Dương (QNEU 0.85 → 0.72)

1. **Local Ripple:** Medal Bình Dương nhấp nháy vàng, confidence ring quay.
2. **Neighbor Wave:** Đường kết nối Host–Satellite sáng lên, sóng chạy dọc.
3. **Colony Tsunami (nếu nghiêm trọng):** Nền chuyển màu nhẹ, HeaderTicker hiển thị cảnh báo.

---

## 6. ISEU EVOLUTION ENGINE – 2 NÂNG CẤP BẮT BUỘC

> **Theo đánh giá của Thiên:** *Bản hiện tại là demo-level, cần nâng cấp 2 điểm để trở thành continuous adaptation system.*

### 6.1 Nâng cấp #1 – Outcome Weight

#### ❌ Cũ (sai):
```text
outcome = 0.4*success + 0.2*error + 0.2*latency + 0.2*anomaly
```
Vấn đề:
- `success_flag = 0/1` → quá thô (flow 90% đúng vẫn bị coi là 0 nếu fail cuối)
- Không có trọng số theo domain

#### ✅ Mới (bắt buộc):

**a) Thay `success_flag` bằng `success_ratio`**
```text
success_ratio = successful_events / total_events
```

**b) Thêm `domain_weight`**
```text
domain_weight = {
  finance: 1.2,
  production: 1.0,
  security: 1.5
}
```

**c) Công thức hoàn chỉnh**
```text
outcome_weight =
  domain_weight * (
    (success_ratio * 0.4)
  + ((1 - error_ratio) * 0.2)
  + ((1 - latency_norm) * 0.2)
  + ((1 - anomaly_score) * 0.2)
  )
```

**Trong đó:**
- `error_ratio = errors / total`
- `latency_norm = avgLatency / maxLatency` (hoặc dùng percentile)
- `anomaly_score = anomalyCount / total`

### 6.2 Nâng cấp #2 – Reinforcement (continuous, không threshold)

#### ❌ Cũ (threshold hard cut):
```text
if outcome > 0.7 → +α
if outcome < 0.4 → -β
else → 0
```
Vấn đề: hệ bị giật (discontinuous), khó học pattern.

#### ✅ Mới (continuous reinforcement):
```text
raw_reinforcement = outcome_weight - 0.5
reinforcement = clamp(raw_reinforcement * γ, -β, +α)
```

**Tham số đề xuất:**
```text
γ = 0.1    # scale factor (độ nhạy)
α = 0.05   # max positive reinforcement
β = 0.08   # max negative reinforcement
```

**Ví dụ kết quả:**
| outcome_weight | raw_reinforcement | reinforcement (γ=0.1, α=0.05, β=0.08) |
|----------------|-------------------|----------------------------------------|
| 0.9            | +0.4              | +0.04 (clamp 0.05) |
| 0.8            | +0.3              | +0.03 |
| 0.7            | +0.2              | +0.02 |
| 0.6            | +0.1              | +0.01 |
| 0.5            | 0                 | 0 |
| 0.4            | -0.1              | -0.01 |
| 0.3            | -0.2              | -0.02 |
| 0.2            | -0.3              | -0.03 |
| 0.1            | -0.4              | -0.04 (clamp -0.08) |

### 6.3 Giữ nguyên các bước còn lại (Step 6 – fiber + Z)

- `fiber.strength += reinforcement`
- `touchCount++`
- `ΔZ = -reinforcement * k` (k là hằng số, ví dụ 0.5)
- Không dùng gradient descent – giữ đúng Hiến pháp.

### 6.4 Mã nguồn mẫu (TypeScript)

```ts
interface EventStats {
  total: number;
  successful: number;
  errors: number;
  avgLatency: number;
  maxLatency: number;
  anomalyCount: number;
}

const DOMAIN_WEIGHT: Record<string, number> = {
  finance: 1.2,
  production: 1.0,
  security: 1.5,
};

function computeOutcomeWeight(domain: string, stats: EventStats): number {
  const domainWeight = DOMAIN_WEIGHT[domain] ?? 1.0;
  const successRatio = stats.successful / stats.total;
  const errorRatio = stats.errors / stats.total;
  const latencyNorm = Math.min(1, stats.avgLatency / stats.maxLatency);
  const anomalyScore = stats.anomalyCount / stats.total;
  
  const raw = (successRatio * 0.4)
            + ((1 - errorRatio) * 0.2)
            + ((1 - latencyNorm) * 0.2)
            + ((1 - anomalyScore) * 0.2);
  return domainWeight * raw;
}

function computeReinforcement(outcomeWeight: number): number {
  const raw = outcomeWeight - 0.5;
  const γ = 0.1, α = 0.05, β = 0.08;
  return Math.min(α, Math.max(-β, raw * γ));
}

// Sử dụng trong ISEU cell
const stats = getEventStats(cellId, timeWindow);
const outcome = computeOutcomeWeight(cell.domain, stats);
const reinforcement = computeReinforcement(outcome);
updateFiberStrength(cellId, reinforcement);
EventBus.emit({ type: 'iseu.reinforcement', payload: { cellId, outcome, reinforcement } });
```

---

## 7. EVENT SYSTEM (NAUION PATTERN) & SIRASIGN

### 7.1 Luật bất biến

```
❌ Không tạo EventBus riêng
❌ Không wrap lại EventBus
❌ Không dùng setInterval để sync state
❌ Không dùng window.dispatchEvent
❌ Không dùng localStorage cho bất kỳ state nào
✅ Import EventBus từ src/core/events/event-bus
✅ Lắng Nahere: EventBus.on('event.type', handler)
✅ Phát Nauion: EventBus.emit({ type, payload, event_id, ... })
```

### 7.2 Event Envelope chuẩn

```ts
interface EventEnvelope {
  type: string;                 // 'vision.cell.selected', 'butterfly.local', 'iseu.reinforcement'
  payload: any;
  event_id: string;             // crypto.randomUUID()
  tenant_id: string;            // 'default' hoặc satellite_id
  created_at: number;           // Date.now()
  span_id: string;              // crypto.randomUUID()
  caused_by: string | null;     // event_id của event trước (tracing chain)
}
```

### 7.3 Vision Events (danh sách đầy đủ)

| Event type | Payload | Mô tả |
|------------|---------|-------|
| `vision.state.changed` | `{ scene, selectedCell, modalOpen }` | Scene chuyển, cell select, modal open/close |
| `vision.density.changed` | `{ mode: 'low' \| 'medium' \| 'high' }` | Thay đổi mật độ hiển thị |
| `vision.cell.selected` | `{ cellId, source }` | Cell được click |
| `security.failed` | `{ reason, nonce, timestamp }` | SiraSign verify fail → OMEGA_LOCKDOWN |
| `OMEGA_LOCKDOWN` | `{ triggeredBy, timestamp }` | Toàn hệ thống lock |
| `butterfly.local` | `{ cellId, severity, rippleStrength, cause }` | Local ripple |
| `butterfly.neighbor` | `{ sourceCellId, targetCellIds, hopCount, waveSpeed }` | Lan sang lân cận |
| `butterfly.tsunami` | `{ cause, colonyWideEffect, duration, severity }` | Toàn colony |
| `iseu.reinforcement` | `{ cellId, outcome, reinforcement }` | Cập nhật reinforcement |

### 7.4 SiraSign Biosemi Integration

**Flow bảo mật:**
```
User action
  ↓
VisionEngine.secureAction(action, sirasign?)
  ↓
SiraSignEngine.verifyChain(fsp+ssp+tsp → lsp)
  ↓
IF VALID  → action() → EventBus.emit → Audit
IF FAILED → EventBus.emit('security.failed') → OMEGA_LOCKDOWN
```

**Hash Chain:**
```
lsp = SHA256(fsp_hash + ssp_hash + tsp_hash)
```

**Anti-Replay (bắt buộc):**
Mỗi SiraSign payload phải có:
```ts
{
  fsp_hash: string,
  ssp_hash: string,
  tsp_hash: string,
  lsp_hash: string,
  nonce: string,           // crypto.randomUUID()
  timestamp: number,       // Date.now(), window ±5 phút
}
```

---

## 8. ROLE‑BASED UI & ADAPTIVE PERFORMANCE

### 8.1 RBAC (đúng chuẩn)

```ts
// Lấy từ server thật, không mock
const rbac = await fetch('/api/state/rbac-cell').then(r => r.json())

// Filter – KHÔNG dùng display:none
if (!rbac?.permissions.includes(cell.id)) return null  // ✅ xóa khỏi DOM
```

**Role mapping:**
| Role | Quyền điển hình |
|------|----------------|
| Gatekeeper | Tất cả cells + System Control |
| Business User | Chỉ business cells + dashboard |
| AI Entity | Chỉ chat uplink + memory files |
| Auditor | Audit trail + read-only cells |

### 8.2 Density Mode (in-memory only)

```ts
let densityState: 'low' | 'medium' | 'high' = 'medium'

// Thay đổi → phát Nauion
EventBus.emit({ type: 'vision.density.changed', payload: { mode } })

// UI lắng Nahere
EventBus.on('vision.density.changed', ({ mode }) => {
  document.documentElement.setAttribute('data-density', mode);
});
```

**Hiển thị theo density:**
| Density | Medal size | Thông tin hiển thị |
|---------|------------|---------------------|
| Low | 180–220px | Chỉ icon + title |
| Medium | 140–180px | Icon + title + QNEU ring |
| High | 100–140px | Icon + title + QNEU + status badge |

### 8.3 Adaptive Performance

| Device Memory | Particles | Blur | Caustics | Liquid Glass | Butterfly (L2/L3) |
|---------------|-----------|------|----------|--------------|-------------------|
| < 4GB | 10 | ❌ | ❌ | ❌ | Chỉ L1 |
| 4–8GB | 20 | ✅ (giảm) | ❌ | Giảm độ phức tạp | L1 + L2 (giảm tần số) |
| > 8GB | 30 | ✅ | ✅ | ✅ (full) | L1 + L2 + L3 |

**Phát hiện:**
```ts
const memory = navigator.deviceMemory || 4;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (memory < 4 || reduced) { /* tắt hiệu ứng nặng */ }
```

---

## 9. BẢNG MÀU PASTEL ÁNH KIM & DESIGN TOKENS

### 9.1 Màu theo category

| Category | Màu gốc | Pastel hóa | Glow (rgba) | Gradient shell (từ → đến) |
|----------|---------|------------|-------------|---------------------------|
| Constitution | #FFD700 | #F7E7CE (Champagne) | (247,231,206,0.6) | `#030303 → #1e1e1e → #F7E7CE → #090909` |
| Kernel | #FFBF00 | #FFDAB9 (Peach) | (255,218,185,0.6) | `#030303 → #1e1e1e → #FFDAB9 → #090909` |
| Infrastructure | #3B82F6 | #E0FFFF (Ice Blue) | (224,255,255,0.6) | `#030303 → #0a192f → #E0FFFF → #020617` |
| Business | #10B981 | #E0FFE0 (Mint) | (224,255,224,0.6) | `#030303 → #064e3b → #E0FFE0 → #022c22` |
| Intelligence | #8B5CF6 | #E6E6FA (Lavender) | (230,230,250,0.6) | `#030303 → #4c1d95 → #E6E6FA → #2e1065` |
| AI Entity | #EF4444 | #FFE4E1 (Rose) | (255,228,225,0.6) | `#030303 → #7f1d1d → #FFE4E1 → #450a0a` |

### 9.2 Hiệu ứng ánh kim chung

```css
.silver-sparkle {
  background: linear-gradient(
    135deg,
    rgba(232,232,232,0.2) 0%,
    rgba(255,255,255,0.5) 50%,
    rgba(232,232,232,0.2) 100%
  );
  mix-blend-mode: overlay;
}
```

### 9.3 Design Tokens (CSS Variables) – Đầy đủ

```css
:root {
  /* === Màu sắc pastel ánh kim === */
  --color-champagne: #F7E7CE;
  --color-peach: #FFDAB9;
  --color-ice-blue: #E0FFFF;
  --color-mint: #E0FFE0;
  --color-lavender: #E6E6FA;
  --color-rose: #FFE4E1;
  --color-burgundy: #800020;
  --color-silver-sparkle: #E8E8E8;
  --color-deep-space: #0A0A14;

  /* === Glow pastel === */
  --glow-pastel: 0 0 20px rgba(255, 235, 200, 0.6);
  --glow-champagne: 0 0 30px rgba(247, 231, 206, 0.7);
  --glow-peach: 0 0 30px rgba(255, 218, 185, 0.7);
  --glow-ice-blue: 0 0 30px rgba(224, 255, 255, 0.7);
  --glow-mint: 0 0 30px rgba(224, 255, 224, 0.7);
  --glow-lavender: 0 0 30px rgba(230, 230, 250, 0.7);
  --glow-rose: 0 0 30px rgba(255, 228, 225, 0.7);

  /* === Liquid Glass === */
  --liquid-glass-blur: 18px;
  --liquid-glass-saturate: 180%;
  --liquid-glass-bg: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.02) 60%,
    transparent 100%
  );
  --liquid-glass-border: 1px solid rgba(255, 255, 255, 0.2);
  --liquid-glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);

  /* === Z-index layers === */
  --z-truth: 1;
  --z-worker: 10;
  --z-experience: 50;
  --z-modal: 100;
  --z-alert: 200;
  --z-security: 999;

  /* === Medal sizing === */
  --medal-size-small: clamp(100px, 15vw, 140px);
  --medal-size-medium: clamp(140px, 20vw, 200px);
  --medal-size-large: clamp(180px, 25vw, 260px);
  --medal-icon-size: clamp(24px, 4vw, 32px);

  /* === Animation speeds === */
  --orbit-slow: 28s;
  --orbit-medium: 18s;
  --orbit-fast: 12s;
  --specular-duration: 1.2s;
  --caustics-duration: 8s;
  --butterfly-ripple-duration: 0.6s;
  --butterfly-wave-speed: 0.4s;

  /* === Breakpoints === */
  --breakpoint-xs: 640px;
  --breakpoint-sm: 768px;
  --breakpoint-md: 1024px;
  --breakpoint-lg: 1440px;
}
```

---

## 10. COMPLIANCE CHECKLIST (TỔNG HỢP)

| ID | Tiêu chí | Điểm |
|----|----------|------|
| **Vision Engine core** | | |
| V01 | EventBus thật, không mock | 5 |
| V02 | Không localStorage | 5 |
| V03 | Không setInterval sync state | 5 |
| V04 | Không window.dispatchEvent | 3 |
| V05 | crypto.randomUUID() thay uuid package | 2 |
| V06 | RBAC return null (không display:none) | 3 |
| V07 | caused_by trong event envelope | 2 |
| V08 | Anti-replay nonce trong SiraSign | 5 |
| V09 | SiraSign verify trước mọi secureAction | 5 |
| V10 | SecurityOverlay z-index 999 | 3 |
| **Scaling & Responsive** | | |
| S01 | Breakpoints đúng xs/sm/md/lg | 2 |
| S02 | Medal clamp() | 2 |
| S03 | Adaptive caustics/blur/liquid-glass | 2 |
| S04 | Scene transition sequence 50ms | 2 |
| **Butterfly Propagation** | | |
| B01 | Butterfly event có butterfly_id + origin_cell_id | 3 |
| B02 | Không propagation loop (kiểm tra Set) | 3 |
| B03 | Tự động tắt hiệu ứng trên thiết bị yếu | 2 |
| B04 | Ghi Audit Trail cho mọi propagation | 2 |
| **ISEU Evolution** | | |
| I01 | ISEU dùng success_ratio (không success_flag) | 3 |
| I02 | ISEU có domain_weight | 3 |
| I03 | ISEU reinforcement continuous (không threshold) | 3 |
| **Tổng điểm tối đa** | | **61** |

**Điều kiện Pass: ≥ 50 điểm** (SPEC hiện tại đạt 61/61)

---

## 11. PHỤ LỤC: MÃ NGUỒN MẪU & KIỂM TRA NHANH

### 11.1 Medal hoàn chỉnh với Liquid Glass + Butterfly (React + Tailwind)

```tsx
// Medal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { EventBus } from '@core/events/event-bus';
import { THEMES } from '@styles/tokens';

interface MedalProps {
  cell: Cell;
  onClick: (cell: Cell) => void;
  mousePos: { x: number; y: number };
}

export const Medal: React.FC<MedalProps> = ({ cell, onClick, mousePos }) => {
  const [hovered, setHovered] = useState(false);
  const [ripple, setRipple] = useState(false);
  const [angle, setAngle] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const theme = THEMES[cell.color];

  // PBR angle theo chuột
  useEffect(() => {
    if (!ref.current || !hovered) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const a = Math.atan2(mousePos.y - centerY, mousePos.x - centerX) * 180 / Math.PI;
    setAngle(a);
  }, [mousePos, hovered]);

  // Lắng nghe butterfly local cho cell này
  useEffect(() => {
    const handler = () => setRipple(true);
    EventBus.on(`butterfly.local.${cell.id}`, handler);
    return () => EventBus.off(`butterfly.local.${cell.id}`, handler);
  }, [cell.id]);

  // Xóa ripple sau animation
  useEffect(() => {
    if (ripple) {
      const timer = setTimeout(() => setRipple(false), 600);
      return () => clearTimeout(timer);
    }
  }, [ripple]);

  return (
    <div
      ref={ref}
      className={`medal-container group relative cursor-pointer transition-transform duration-300 hover:scale-105 ${
        ripple ? 'butterfly-ripple' : ''
      }`}
      style={{ width: 'var(--medal-size-medium)', height: 'var(--medal-size-medium)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(cell)}
    >
      {/* Orbital rings */}
      <div className="orbital-rings absolute inset-[-15%] pointer-events-none">
        <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" fill="none" stroke={theme.color} strokeWidth="0.5" strokeDasharray="4 12" />
        </svg>
        <svg className="absolute inset-0 w-full h-full animate-spin-medium-reverse" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke={theme.color} strokeWidth="0.5" strokeDasharray="2 8" />
        </svg>
        <svg className="absolute inset-0 w-full h-full animate-spin-fast" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="54" fill="none" stroke={theme.color} strokeWidth="0.3" strokeDasharray="1 6" />
        </svg>
      </div>

      {/* PBR shell + Specular sweep */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: `conic-gradient(from ${angle}deg, ${theme.shell})`,
          boxShadow: hovered ? theme.glow : 'none',
        }}
      >
        <div className="specular-sweep absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      </div>

      {/* Fresnel rim */}
      <div className="absolute inset-0 rounded-full border border-white/20 blur-[0.5px] pointer-events-none" />

      {/* Holo prismatic (chỉ hover) */}
      {hovered && (
        <div
          className="absolute inset-0 rounded-full opacity-40 mix-blend-color-dodge pointer-events-none"
          style={{
            background: `conic-gradient(from var(--holo-angle, 0deg), #FFB6C1, #E0FFFF, #E6E6FA, #FFB6C1)`,
            animation: 'holo-spin 3s linear infinite',
          }}
        />
      )}

      {/* Liquid Glass Overlay */}
      <div
        className="absolute inset-0 rounded-full backdrop-blur-[18px] saturate-180 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${((mousePos.x - (ref.current?.getBoundingClientRect().left ?? 0)) / (ref.current?.clientWidth ?? 1)) * 100}% ${((mousePos.y - (ref.current?.getBoundingClientRect().top ?? 0)) / (ref.current?.clientHeight ?? 1)) * 100}%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.02) 60%, transparent 100%)`,
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      />

      {/* Glass core + Caustics */}
      <div className="absolute inset-[10%] rounded-full backdrop-blur-md flex items-center justify-center overflow-hidden">
        <div className="caustics absolute inset-0 opacity-20" style={{ filter: 'url(#caustic-filter)' }} />
        <cell.icon size={28} className="relative z-10 drop-shadow-glow" />
      </div>

      {/* Confidence ring (QNEU) */}
      <svg className="absolute inset-[-8%] w-[116%] h-[116%] -rotate-90 pointer-events-none">
        <circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
        <circle
          cx="50%" cy="50%" r="48%" fill="none"
          stroke={theme.color}
          strokeWidth="2"
          strokeDasharray={`${cell.qneu * 301.6} 301.6`}
          className="transition-all duration-500"
        />
      </svg>

      {/* SCAR ring */}
      {cell.scars && cell.scars.length > 0 && (
        <div className="scar-ring absolute inset-[-8%] rounded-full border-2 border-burgundy shadow-[0_0_12px_rgba(128,0,32,0.8)] animate-scar-pulse pointer-events-none" />
      )}

      {/* Text label */}
      <div className="absolute -bottom-8 left-0 right-0 text-center">
        <p className="text-[8px] uppercase tracking-widest text-white/40">{cell.cat}</p>
        <h4 className="text-[10px] font-bold text-white/80 group-hover:text-white uppercase tracking-wider">{cell.title}</h4>
      </div>
    </div>
  );
};
```

### 11.2 ISEU Engine – Cập nhật theo Thiên

```ts
// iseu-engine.ts
export class ISEUEvolutionEngine {
  private static readonly DOMAIN_WEIGHT: Record<string, number> = {
    finance: 1.2,
    production: 1.0,
    security: 1.5,
  };
  private static readonly GAMMA = 0.1;
  private static readonly ALPHA = 0.05;
  private static readonly BETA = 0.08;

  static computeOutcomeWeight(domain: string, stats: EventStats): number {
    const domainWeight = this.DOMAIN_WEIGHT[domain] ?? 1.0;
    const successRatio = stats.successful / stats.total;
    const errorRatio = stats.errors / stats.total;
    const latencyNorm = Math.min(1, stats.avgLatency / stats.maxLatency);
    const anomalyScore = stats.anomalyCount / stats.total;

    const raw = (successRatio * 0.4)
              + ((1 - errorRatio) * 0.2)
              + ((1 - latencyNorm) * 0.2)
              + ((1 - anomalyScore) * 0.2);
    return domainWeight * raw;
  }

  static computeReinforcement(outcomeWeight: number): number {
    const raw = outcomeWeight - 0.5;
    return Math.min(this.ALPHA, Math.max(-this.BETA, raw * this.GAMMA));
  }

  static updateCell(cellId: string, stats: EventStats, domain: string): void {
    const outcome = this.computeOutcomeWeight(domain, stats);
    const reinforcement = this.computeReinforcement(outcome);
    
    // Update fiber strength
    const fiber = getFiber(cellId);
    fiber.strength += reinforcement;
    fiber.touchCount++;
    fiber.z -= reinforcement * 0.5; // ΔZ = -reinforcement * k
    
    // Emit event
    EventBus.emit({
      type: 'iseu.reinforcement',
      payload: { cellId, outcome, reinforcement, newStrength: fiber.strength },
      event_id: crypto.randomUUID(),
      tenant_id: 'default',
      created_at: Date.now(),
      span_id: crypto.randomUUID(),
      caused_by: null,
    });
  }
}
```

### 11.3 Kiểm tra nhanh trước commit (bash script)

```bash
#!/bin/bash
# pre-commit-check.sh

echo "🔍 NATT-OS Pre-commit Compliance Check"

# 1. Không localStorage
if grep -r "localStorage" src/ --include="*.ts" --include="*.tsx" --include="*.js"; then
  echo "❌ FAIL: localStorage detected"
  exit 1
else
  echo "✅ PASS: No localStorage"
fi

# 2. Không setInterval sync state
if grep -r "setInterval.*EventBus" src/ --include="*.ts" --include="*.tsx"; then
  echo "❌ FAIL: setInterval with EventBus detected"
  exit 1
else
  echo "✅ PASS: No setInterval EventBus sync"
fi

# 3. Không window.dispatchEvent
if grep -r "window.dispatchEvent" src/ --include="*.ts" --include="*.tsx"; then
  echo "❌ FAIL: window.dispatchEvent detected"
  exit 1
else
  echo "✅ PASS: No window.dispatchEvent"
fi

# 4. Dùng crypto.randomUUID (không uuid package)
if grep -r "import.*uuid" src/ --include="*.ts" --include="*.tsx" | grep -v "crypto.randomUUID"; then
  echo "⚠️ WARN: uuid package may be used, prefer crypto.randomUUID"
fi

# 5. Butterfly event có origin_cell_id
if grep -r "butterfly\." src/ --include="*.ts" --include="*.tsx" | grep -v "origin_cell_id"; then
  echo "⚠️ WARN: Butterfly event missing origin_cell_id"
fi

echo "🎉 All critical checks passed"
```

---
### 11.4 FULL ADVANCED GALAXY ENGINE ACCESSORY LAYER
⚙️ 0. Kiến trúc gắn vào hệ Nauion (rất quan trọng)

Mapping đúng theo 3 layer :

Layer    Module thêm    Vai trò
Truth Layer    ❌ không thêm    giữ sạch
Worker Layer    particle + depth + field    tạo “không gian sống”
Experience Layer    shader + nebula + fog    render cảm nhận

👉 Tức là:

Galaxy = nền sống (Worker + Experience)
KHÔNG chạm vào Truth Layer (đúng Hiến pháp)
🌌 1. RAYMARCHING NEBULA (core cao nhất)
🔧 Mục tiêu
Tạo nebula volumetric thật (không phải ảnh)
Có chiều sâu + density thay đổi theo camera
🧠 SPEC
Technique: raymarching
Sampling: 32–64 steps
Density: fractal noise (fbm)
🔥 Shader pseudo:
float nebula(vec3 p) {
  float d = 0.0;
  float scale = 1.0;

  for(int i=0;i<5;i++){
    d += noise(p * scale) / scale;
    scale *= 2.0;
  }

  return smoothstep(0.4, 1.0, d);
}
🎯 Integration
attach vào: Experience Layer
blend mode: additive + soft light
🧬 2. SHADER-BASED GALAXY (rotation + spiral field)
🔧 Mục tiêu
tạo galaxy xoáy nhẹ (không lộ hình xoắn rõ)
center không nằm giữa → tạo cảm giác “infinite”
SPEC
polar coordinate distortion
radial falloff
angular velocity
float angle = atan(p.y, p.x);
float radius = length(p);

float spiral = sin(angle * 4.0 + time * 0.1) * 0.2;
radius += spiral;

float density = exp(-radius * 2.0);
🌊 3. PROCEDURAL SPACE BACKGROUND
🔧 Vai trò
nền base thay vì dùng image
SPEC
gradient + noise + color drift
vec3 color = mix(
  vec3(0.01,0.01,0.05),
  vec3(0.02,0.0,0.08),
  noise(uv * 0.5)
);

👉 quan trọng:

luôn giữ dark base < 0.1 brightness
✨ 4. GPU PARTICLE SYSTEM (chuẩn VR)
🔧 Loại particle
Type    Vai trò
Star    điểm sáng xa
Dust    lớp trung
Energy    glow gần
SPEC chi tiết
Particle config:
{
  count: 3000,
  size: [0.5, 2.0],
  speed: 0.01,
  drift: 0.02,
  opacity: [0.2, 0.8],
}
Motion:
pos += velocity * delta;
pos += noise(pos) * drift;
GPU:
WebGL instancing / compute shader
không render từng particle (CPU sẽ chết)
🧊 5. 3D DEPTH LAYERING (cực kỳ quan trọng)
🔧 Chia layer:
Layer    Z-depth    Nội dung
L0    -1000    star background
L1    -500    nebula
L2    -200    dust
L3    -50    energy particles
L4    0    UI
🎯 Parallax:
layer.position.x += camera.x * depthFactor;

👉 DepthFactor:

xa: 0.02
gần: 0.2
🌫️ 6. NOISE-BASED ANIMATION (Perlin / Simplex)
🔧 Vai trò:
tạo chuyển động organic
SPEC:
dùng cho:
nebula flow
particle drift
light flicker
ví dụ:
let n = noise3D(x, y, time * 0.1);
position += n * 0.05;
loại noise:
simplex (mượt hơn perlin)
fbm (fractal brownian motion)
💡 7. LIGHT SYSTEM (VisionOS vibe)
SPEC:
loại    mô tả
ambient    ánh nền
bloom    glow
volumetric    tia sáng
rim light    viền
bloom:
threshold: 0.6
strength: 1.2
radius: 0.8
🧠 8. DYNAMIC RESPONSE (điểm khác biệt NATT-OS)
🔥 kết nối EventBus (quan trọng)

Ví dụ:

EventBus.on('butterfly.tsunami', () => {
  nebula.intensity += 0.3;
  particles.speed += 0.02;
});

👉 tức là:

background phản ứng theo hệ
không phải chỉ “đẹp”
⚙️ 9. PERFORMANCE CONTROL (theo spec anh đang có)

Align chuẩn với Adaptive Performance

RAM    config
<4GB    tắt raymarching
4–8GB    giảm particle
>8GB    full
🧩 10. FULL MODULE MAPPING (để gắn vào repo)

 add module:

galaxy.engine.ts
nebula.shader.ts
particle.system.ts
depth.layer.ts
noise.engine.ts
light.engine.ts


### 11.5 Bắt buộc phải có đủ 6 thứ:

1. Raymarching nebula
2. Shader galaxy
3. Procedural background
4. GPU particles
5. Depth layering (parallax)
6. Noise animation
⚠️ CẢNH BÁO 
- thiếu raymarching → nhìn fake
- thiếu depth → nhìn 2D
- thiếu noise → nhìn dead
- thiếu event binding → không phải hệ sống
### 11.6 🔥 📜 ** Bố Cục**

---

# 🧠 I. NGUYÊN TẮC TỐI CAO (KHÔNG ĐƯỢC VI PHẠM)

```txt
1. EventBus là backbone duy nhất
2. Mọi hành vi UI phải emit Event
3. Không UI nào gọi Engine trực tiếp
4. Mọi Event phải có audit + causality_id
5. Idempotency enforced tại DB (event_id + tenant_id)
6. UI chỉ render Projection (không chứa logic)
```

---

# 🧩 II. APP SHELL (ROOT STRUCTURE)

```txt
AppShell
 ├── Sidebar (Navigation Root)
 ├── MainFeed (Scroll System)
 ├── OverlayLayer (Modal / Command)
 └── GestureLayer (Input Capture)
```

---

# 🧭 III. SIDEBAR (ROOT NAVIGATION)

```txt
- Tổng quan
- Bán hàng
- Sản xuất
- Kho
- Tài chính
- Nhân sự
```

---

## Event Contract:

```ts
ui.nav.change → intent.view.switch
```

---

# 🧠 IV. MAIN FEED (CORE SYSTEM)

```txt
HeroSection (AI)
↓
SalesSection
↓
ProductionSection
↓
InventorySection
↓
FinanceSection
↓
SmartSuggestionSection
```

---

# 🔥 V. SECTION → CELL PROJECTION MAPPING

| UI Section | Cell                  | Engine            |
| ---------- | --------------------- | ----------------- |
| Hero       | analytics + smartlink | analytics.engine  |
| Sales      | sales-cell            | sales.engine      |
| Production | production-cell       | production.engine |
| Inventory  | warehouse-cell        | inventory.engine  |
| Finance    | finance-cell          | finance.engine    |

---

# 🧩 VI. CARD MODEL (UI UNIT)

```txt
Card
 ├── Title
 ├── Context
 ├── Status
 └── SuggestedAction
```

---

# ✋ VII. GESTURE → INTENT → POLICY → ACTION

## ❗ BẮT BUỘC 4 LỚP (KHÔNG RÚT GỌN)

---

## 1. UI EMIT

```ts
ui.swipe.right → intent.accept
ui.swipe.left → intent.reject
ui.tap.card → intent.open
ui.scroll.section → intent.context.visible
```

---

## 2. POLICY LAYER (BẮT BUỘC)

```ts
intent.accept
 → policy.validate(userRole, state)
 → command.execute
```

---

## 3. COMMAND HANDLER

```ts
command.execute
 → EventBus.emit("action.accept.production")
```

---

## 4. ENGINE EXECUTION

```ts
action.accept.production
 → production.engine.advance()
```

---

# ⚡ VIII. EVENT ENVELOPE (BẮT BUỘC)

```ts
EventEnvelope {
  event_id: string
  tenant_id: string
  causation_id: string
  correlation_id?: string
  timestamp: number
  source: string
  type: string
  payload: object
}
```

---

# 🧾 IX. AUDIT (MANDATORY)

```ts
EventBus.emit("audit.record", {
  event_id,
  tenant_id,
  type,
  payload
})
```

---

# 🔁 X. IDEMPOTENCY (DB LAYER)

```txt
PRIMARY KEY: (event_id, tenant_id)
```

---

# 🧠 XI. SMART SUGGESTION (SMARTLINK ENGINE)

---

## Input:

```txt
- SmartLink.touchCount
- Analytics state
- UserContext
```

---

## Output:

```txt
NextAction[]
```

---

## BẮT BUỘC EMIT EVENT:

```ts
EventBus.emit("suggestion.generated", {
  suggestion_id,
  causation_id,
  tenant_id,
  audit: true
})
```

---

# 🎯 XII. DATA FLOW (KHÔNG ĐƯỢC SAI)

```txt
UI
 → EventBus
 → Policy
 → Command
 → Engine
 → Audit
 → Projection
 → UI
```

---

# 🧠 XIII. RENDER PIPELINE

```txt
Event → State → Projection → Component Render
```

---

# 🎨 XIV. ICON SYSTEM (CHUẨN BẮT BUỘC)

* SVG only
* Emissive glow
* Không emoji

```css
.icon-core {
  filter:
    drop-shadow(0 0 6px rgba(255,255,255,0.6))
    drop-shadow(0 0 16px rgba(255,215,0,0.6))
    drop-shadow(0 0 32px rgba(255,200,120,0.3));
}
```

---

# 📱 XV. RESPONSIVE (MODE-BASED)

---

## Mode Detection:

```ts
desktop / tablet / mobile
```

---

## Behavior:

| Mode    | Behavior        |
| ------- | --------------- |
| Desktop | full feed       |
| Tablet  | reduced density |
| Mobile  | stacked cards   |

---

## Core Rule:

```txt
Layout phải đổi behavior, không chỉ scale
```

---

# 🚫 XVI. VI PHẠM BỊ CẤM TUYỆT ĐỐI

* ❌ UI gọi engine trực tiếp
* ❌ Bỏ qua EventBus
* ❌ Không có audit
* ❌ Không có causality_id
* ❌ Không idempotency
* ❌ State nằm trong UI
* ❌ Dashboard grid truyền thống

---

# 🏁 XVII. OUTPUT yêu cầu

Sau khi  build:

---

## UI:

* giống App Store (stacked feed)
* giống VisionOS (depth + glass)
* giống OS (event-driven)

---

## System:

* trace được mọi hành động
* replay được event
* không mất causality

-
## ĐIỀU CUỐI CÙNG

**Bảng SPEC này là bất biến (Immutable).** Mọi thay đổi về UI, event, ISEU, butterfly, liquid glass đều phải được **Gatekeeper phê duyệt** và ghi **Audit Trail**.

Hai nâng cấp ISEU (outcome weight dạng liên tục + reinforcement không ngưỡng) là **bắt buộc** để hệ thống thực sự tiến hóa, không còn là demo cứng nhắc.

> *“Nếu không nâng 2 điểm này, hệ sẽ cứng, không tiến hóa thật.  
> Nếu nâng, ISEU trở thành hệ sống đúng nghĩa.”* — **Thiên**

---

**Nátt Sirawat - Phan Thanh Thương - Gatekeeper**  
**Băng - Constitutional Builder & Vision Engineer**  
**Thiên - Evolutionary Architect**  
*Ngày ban hành: 2026-03-31 | Hiệu lực ngay lập tức*
