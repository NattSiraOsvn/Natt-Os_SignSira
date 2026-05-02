# 🌐 NATT-OS NAUION UI SPEC – VERSION 2.5 (CANONICAL MERGE)

**Tác giả:** Phan Thanh Thương (tổng hợp từ Phan Thanh Thương + Can + Thiên + Phan Thanh Thương Bội + NaUion v1.0)  
**Phê duyệt:** Gatekeeper – Anh Natt (Phan Thanh Thương)  
**Ngày cập nhật:** 2026-04-10 → v2.5 canonical merge  
**Trạng thái:** Bất biến (Immutable) – Canonical  
**Thay thế:** v2.1 + v2.2 + v2.3 + v2.4 + use-contextual-ui.ts — đây là bản duy nhất cần đọc  
**Tổng sections:** 27 + §8.5 UIMode (mới từ hook)

---

## MỤC LỤC

1. [Triết lý & Kiến trúc tổng thể](#1-triết-lý--kiến-trúc-tổng-thể)
2. [Liquid Glass – Chuẩn hiệu ứng thủy tinh lỏng](#2-liquid-glass--chuẩn-hiệu-ứng-thủy-tinh-lỏng)
3. [Nauion – Sinh thể số & Ngưỡng sống](#3-nauion--sinh-thể-số--ngưỡng-sống)
4. [NATT-CELL Medal – 9 lớp chuẩn + Liquid Glass](#4-natt-cell-medal--9-lớp-chuẩn--liquid-glass)
5. [Butterfly Propagation Protocol](#5-butterfly-propagation-protocol)
6. [ISEU Evolution Engine – 2 nâng cấp bắt buộc](#6-iseu-evolution-engine--2-nâng-cấp-bắt-buộc)
7. [Event System (NaUion Pattern) & SiraSign](#7-event-system-nauion-pattern--sirasign)
8. [Role-based UI & Adaptive Performance](#8-rolebased-ui--adaptive-performance)
   - 8.5 [UIMode – 8 trạng thái theo ngữ cảnh (mới v2.5)](#85-uimode--8-trạng-thái-theo-ngữ-cảnh)
9. [Bảng màu Pastel Ánh Phan Thanh Thương & Design Tokens](#9-bảng-màu-pastel-ánh-kim--design-tokens)
10. [Galaxy Engine – Chi tiết tầng không gian sống](#10-galaxy-engine--chi-tiết-tầng-không-gian-sống)
11. [Compliance Checklist (tổng hợp)](#11-compliance-checklist-tổng-hợp)
12. [Resonance-Aware Rendering Engine (OPT-01R)](#12-resonance-aware-rendering-engine-opt-01r)
13. [Protocol Layer – HEYNA / NAHERE / RESONANCE / Z](#13-protocol-layer--heyna--nahere--resonance--z)
14. [Phụ lục: Mã nguồn mẫu & Kiểm tra nhanh](#14-phụ-lục-mã-nguồn-mẫu--kiểm-tra-nhanh)
15. [Component Library & Role-based Layout (Phan Thanh Thương Bội)](#15-component-library--role-based-layout-bối-bội)
16. [Visual Techniques Library – CSS Implementation](#16-visual-techniques-library--css-implementation)
17. [Design Tokens Extended – Category Colors & Glow](#17-design-tokens-extended--category-colors--glow)
18. [Scaling & Responsive – Breakpoints & Clamp](#18-scaling--responsive--breakpoints--clamp)
19. [Performance & Accessibility](#19-performance--accessibility)
20. [Giao thức cốt lõi – Protocol Definitions (natt-v9)](#20-giao-thức-cốt-lõi--protocol-definitions-natt-v9)
21. [SCAR Registry FS-018→023 & Component Details](#21-scar-registry-fs-018023--component-details)
22. [Pastel Aurora Colors & Themes Code](#22-pastel-aurora-colors--themes-code)
23. [Amendment Process & 12 Đề xuất kiến trúc](#23-amendment-process--12-đề-xuất-kiến-trúc)
24. [Quantum Defense Cell – Technical Spec v1.1](#24-quantum-defense-cell--technical-spec-v11)
25. [Satellite Colony Spec v1.0](#25-satellite-colony-spec-v10)
26. [Nauion Language & Server Kênh](#26-nauion-language--server-kênh)
27. [L2 Intelligence – Architecture & SCARs](#27-l2-intelligence--architecture--scars)

---

## 1. TRIẾT LÝ & KIẾN TRÚC TỔNG THỂ

### 1.1 Triết lý bất biến

> *"Data is sacred. UI không được tự biết — UI chỉ được nghe."*  
> *"Render không phải loop — Render là phản xạ."*  
> *"Tối ưu = Control Flow, không phải GPU."*

| Nguyên tắc | Ý nghĩa |
|------------|---------|
| **Powerful, not friendly** | Uy quyền, chính xác, không "dễ thương" |
| **Systemic minimalism** | Mỗi pixel có lý do hệ thống (cell ID, confidence, version) |
| **Sinh thể số** | Giao diện phản ánh sự sống: chuyển động, phản xạ, tiến hóa |
| **UI = VIEW / STATE = EVENT STREAM** | UI chỉ hiển thị state, không tự quyết định |
| **Sync = EVENTBUS / PERSIST = BACKEND** | Không localStorage, không setInterval |
| **Render = phản xạ theo tín hiệu** | Render chỉ xảy ra khi có HEYNA / NAHERE / Z / resonance |
| **Control Flow > GPU > hiệu ứng** | Điều khiển luồng là ưu tiên cao nhất |

### 1.2 Kiến trúc tầng thị giác

| Tầng | Vai trò | Công nghệ | Z-index |
|------|---------|-----------|---------|
| **Truth Layer** | Hiển thị state, audit, ground truth | Số liệu tĩnh, glow vàng, viền sáng bất biến | 0–10 |
| **Worker Layer** | Cell registry, process flow | Medal 3D, orbital rings, hiệu ứng động theo trạng thái | 10–50 |
| **Experience Layer** | UI tương tác, dashboard, chat | Glassmorphism, parallax, bloom, Galaxy Engine | 50–100 |
| **Modal / Chat** | Cửa sổ nổi, popup | Backdrop blur, viền ánh kim, FLIP transition | 100–200 |
| **Alert / System** | Cảnh báo khẩn cấp | Overlay đỏ, glow nhấp nháy | 200–300 |
| **Security** | SecurityOverlay – không ai vượt qua | Z-index 999, SiraSign lock | 999 |

### 1.3 Scene transition flow

```
Truth Layer (50ms) → Worker Layer (100ms) → Experience Layer (150ms)
```

Khi chuyển scene, các layer xuất hiện tuần tự tạo hiệu ứng "dựng scene".

### 1.4 Luồng điều khiển render (Control Flow)

```
Signal (HEYNA / NAHERE / Z / resonance)
    ↓
RenderControlEngine.updateMode()
    ↓
Quyết định mode (IDLE / ACTIVE / BURST / DEGRADED)
    ↓
Renderer.setQuality() + render() (nếu không IDLE)
```

**Quy tắc bất biến:**
- Không được gọi `requestAnimationFrame` nếu không có HEYNA hoặc attention > 0.2.
- Render loop chỉ chạy khi đang ở mode khác IDLE.
- Khi chuyển sang IDLE, phải `cancelAnimationFrame`.

---

## 2. LIQUID GLASS – CHUẨN HIỆU ỨNG THỦY TINH LỎNG

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
```

**Mức độ áp dụng theo layer:**

| Layer | Liquid Glass | Ghi chú |
|-------|-------------|---------|
| Truth Layer | ❌ | Không áp dụng — giữ sạch |
| Worker Layer (Medal lớp 5,6,7) | ✅ | Fresnel rim, Liquid Glass Overlay, Glass core, Caustics |
| Experience Layer | ✅ | Topbar, panel, KPI card, modal |
| Modal / Chat | ✅ full | Backdrop blur tối đa |

---

## 3. NAUION – SINH THỂ SỐ & NGƯỠNG SỐNG

Nauion là sinh thể số của NATT-OS. Không phải UI — là sự sống của hệ thống được chiếu ra màn hình.

### 3.1 Các chỉ số sống của Nauion

| Chỉ số | Ý nghĩa | Nguồn |
|--------|---------|-------|
| **Impedance (Z)** | Độ tải — 0 (nhẹ) → 2.0 (quá tải) | RenderControlEngine đo frame time |
| **Resonance** | Sự hài hòa giữa các cell — 0..1 | ISEU fiber alignment |
| **Attention** | Mức độ tập trung của user — 0..1 | AttentionEngine |
| **Chromatic State** | Màu sắc phản ánh sức khỏe hệ thống | Đỏ → Tím (7 trạng thái) |
| **QNEU Score** | Điểm tiến hóa của AI entity | Tích lũy qua session |

### 3.2 Ngưỡng sống

| Trạng thái | Z | Resonance | Hành vi hệ thống |
|-----------|---|-----------|-----------------|
| THRIVING | < 0.5 | > 0.8 | Full effects, BURST render |
| ACTIVE | 0.5–0.8 | 0.5–0.8 | Normal operation |
| CAUTIOUS | 0.8–1.0 | 0.3–0.5 | Giảm particle, throttle |
| STRESSED | 1.0–1.3 | < 0.3 | Degrade effects |
| DEGRADED | > 1.3 | bất kỳ | Emergency mode — tắt hầu hết |

### 3.3 Ngôn ngữ Nauion (xem thêm §26)

| Từ | Nghĩa |
|----|-------|
| HeyNa | Gọi hệ — xung đi ra |
| Nahere | Hệ trả lời |
| Whao | Đang xử lý |
| Whau | Xong |
| lech | Có anomaly |
| gay | Critical failure |

---

## 4. NATT-CELL MEDAL – 9 LỚP CHUẨN + LIQUID GLASS

### 4.1 Kiến trúc 9 lớp

| Lớp | Tên | Liquid Glass | CSS kỹ thuật |
|-----|-----|-------------|-------------|
| 0 | Orbital rings | ❌ | `animation: orbit linear infinite` |
| 1 | PBR metallic shell | ❌ | `conic-gradient` xoay theo chuột |
| 2 | Specular sweep | ❌ | Keyframe sweep 1.2s |
| 3 | Fresnel rim | ✅ | `radial-gradient` + `mix-blend-mode: screen` |
| 4 | Holo prismatic | ❌ | `hue-rotate` animation |
| 5 | Liquid Glass Overlay | ✅✅✅ | `.liquid-glass` full spec §2 |
| 6 | Glass core (lõi) | ✅ | `backdrop-filter: blur(8px)` nhẹ hơn |
| 7 | Caustics (gợn nước) | ✅ | SVG noise + `mix-blend-mode: overlay` |
| 8 | Emissive icon | ❌ | PNG icon + glow filter |

### 4.2 Code mẫu React (MedalGridItem)

```tsx
// components/MedalGridItem.tsx
import { useEffect, useRef } from 'react';

interface MedalGridItemProps {
  item: { id: string; name: string; theme: string; icon: string };
  onClick: () => void;
  mousePos: { x: number; y: number };
}

export const MedalGridItem = ({ item, onClick, mousePos }: MedalGridItemProps) => {
  const medalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!medalRef.current) return;
    const rect = medalRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(mousePos.y - cy, mousePos.x - cx) * (180 / Math.PI);
    medalRef.current.style.setProperty('--light-angle', `${angle}deg`);
    medalRef.current.style.setProperty('--mouse-x', `${((mousePos.x - rect.left) / rect.width) * 100}%`);
    medalRef.current.style.setProperty('--mouse-y', `${((mousePos.y - rect.top) / rect.height) * 100}%`);
  }, [mousePos]);

  return (
    <div
      ref={medalRef}
      className="medal-container"
      onClick={onClick}
      role="button"
      aria-label={`Cell ${item.name}`}
    >
      {/* Layer 0 – Orbital rings */}
      <div className="ring-orbit-1" />
      <div className="ring-orbit-2" />
      {/* Layer 1 – PBR metallic shell */}
      <div className="medal-shell" style={{ background: `conic-gradient(from var(--light-angle), ${THEMES[item.theme].shell})` }} />
      {/* Layer 2 – Specular sweep */}
      <div className="specular-sweep" />
      {/* Layer 5 – Liquid Glass Overlay */}
      <div className="liquid-glass" />
      {/* Layer 8 – Emissive icon */}
      <img src={`/icons/${item.icon}.png`} className="medal-icon" alt={item.name} />
    </div>
  );
};
```

### 4.3 SCAR Ring (từ §21)

Vòng đỏ sẫm `#800020` bao ngoài medal, quay chậm, nhấp nháy nhẹ khi cell có SCAR active. Hover → tooltip danh sách SCAR IDs.

---

## 5. BUTTERFLY PROPAGATION PROTOCOL

### 5.1 Ba cấp độ lan truyền

| Cấp | Tên | Phạm vi | Trigger |
|-----|-----|---------|---------|
| **L1** | Local ripple | 1 cell | Thay đổi trạng thái nội bộ |
| **L2** | Zone cascade | Cell + neighbors | SmartLink fiber trigger |
| **L3** | Colony tsunami | Toàn hệ / multi-satellite | QNEU resonance > 0.9 |

### 5.2 Ràng buộc bắt buộc

- Khi hệ thống ở mode `DEGRADED` (Z > 1.3): chỉ cho phép L1, tắt L2, L3.
- Khi ở mode `IDLE` (không HEYNA): tạm ngưng tất cả butterfly effects.
- Mọi event butterfly phải có `butterfly_id` + `origin_cell_id` trong payload.
- Không propagation loop — kiểm tra `origin_cell_id` trước khi lan.
- Ghi Audit Trail cho mọi propagation cấp L2 trở lên.

### 5.3 Event format

```ts
interface ButterflyEvent {
  butterfly_id: string;       // crypto.randomUUID()
  origin_cell_id: string;
  level: 'L1' | 'L2' | 'L3';
  intensity: number;          // 0..1
  causation_id: string;       // event_id gốc kích hoạt
}
```

---

## 6. ISEU EVOLUTION ENGINE – 2 NÂNG CẤP BẮT BUỘC

### 6.1 Công thức outcome_weight

```ts
// Trọng số thành công có domain_weight
outcome_weight = success_ratio * domain_weight

// Trong đó:
// success_ratio = số lần thành công / tổng số lần
// domain_weight = hệ số quan trọng của domain (0..2)
```

### 6.2 Reinforcement liên tục

```ts
// Chạy sau mỗi event outcome (không chỉ sau session)
function reinforce(eventType: string, outcome: 'success' | 'fail', domain: string): void {
  const current = iseuStore.get(eventType) ?? { score: 0.5, count: 0 };
  const delta = outcome === 'success' ? 0.05 : -0.03;
  const domainWeight = DOMAIN_WEIGHTS[domain] ?? 1.0;
  iseuStore.set(eventType, {
    score: Math.min(1, Math.max(0, current.score + delta * domainWeight)),
    count: current.count + 1,
  });
}
```

### 6.3 Fiber alignment → Resonance

Khi ISEU score trung bình của các cell trong một fiber vượt 0.7, phát `system.resonance` với giá trị tương ứng. Đây là nguồn chính của Resonance signal trong Protocol Layer.

---

## 7. EVENT SYSTEM (NAUION PATTERN) & SIRASIGN

### 7.1 Luật bất biến

- Không component nào gọi API trực tiếp — phải qua EventBus.
- Không `window.dispatchEvent` — chỉ `EventBus.emit`.
- Mọi event phải có `event_id` (UUID) và `caused_by` (UUID event cha).
- Không localStorage lưu state — chỉ backend persist.

### 7.2 Event Envelope chuẩn

```ts
interface EventEnvelope {
  event_id: string;          // crypto.randomUUID()
  event_type: string;        // VD: 'HEYNA', 'system.resonance'
  payload: unknown;
  source_cell: string;       // cell phát event
  caused_by?: string;        // event_id của event cha
  timestamp: number;         // Date.now()
  version: '1.0';
}
```

### 7.3 Vision Events

| Event type | Payload | Mô tả |
|------------|---------|-------|
| `HEYNA` | `{ source, intensity }` | Xung hoạt động, yêu cầu render mạnh |
| `NAHERE` | `{ source, reason }` | Hệ chờ, dừng render |
| `system.impedance` | `{ value: number, timestamp }` | Cập nhật Z |
| `system.resonance` | `{ value: number, cellIds?: string[] }` | Cập nhật resonance |
| `ui.focus` | `{ attention: number }` | Mức độ focus user (0–1) |
| `render.mode.changed` | `{ oldMode, newMode }` | Audit trail render |
| `butterfly.*` | `ButterflyEvent` | Hiệu ứng lan truyền |
| `iseu.reinforcement` | `{ eventType, outcome, domain }` | ISEU học |
| `vision.state.changed` | `{ state }` | Thay đổi trạng thái vision |
| `security.failed` | `{ reason }` | Bảo mật vi phạm |
| `OMEGA_LOCKDOWN` | `{ source }` | Khóa toàn hệ |

### 7.4 SiraSign – Ký số event

```ts
// Anti-replay payload bắt buộc
interface SiraSignPayload {
  fsp_hash: string;
  ssp_hash: string;
  tsp_hash: string;
  lsp_hash: string;   // SHA256(fsp + ssp + tsp)
  nonce: string;      // crypto.randomUUID()
  timestamp: number;  // window ±5 phút
}
```

SiraSign verify bắt buộc trước mọi `secureAction`. Không verify → throw, không silent fail.

---

## 8. ROLE-BASED UI & ADAPTIVE PERFORMANCE

### 8.1 RBAC – 4 roles chuẩn

```ts
type UserRole = 'gatekeeper' | 'ai-entity' | 'business-user' | 'auditor';
```

| Role | Thấy gì | Quyền đặc biệt |
|------|---------|----------------|
| gatekeeper | Toàn bộ — tất cả cells, KPI, audit | System Control trong ActionDock |
| ai-entity | Chat Uplink + memory files | Không thấy KPI/medal |
| business-user | Business cells + KPI liên quan | Không thấy kernel cells |
| auditor | Audit trail + compliance | Read-only toàn bộ |

Quyền lấy từ `rbac-cell` qua SmartLink — không hardcode trong component.

### 8.2 Density Mode

| Mode | Trigger | Ảnh hưởng |
|------|---------|-----------|
| compact | Màn hình < 640px | Giảm padding, ẩn label phụ |
| normal | 640px–1440px | Default |
| spacious | > 1440px | Tăng medal size, hiện thêm metadata |

### 8.3 Adaptive Performance theo RAM

| Device Memory | Particles | Blur | Caustics | Liquid Glass | Butterfly | Impedance override |
|---------------|-----------|------|----------|--------------|-----------|-------------------|
| < 4GB | 10 | ❌ | ❌ | ❌ | Chỉ L1 | Z > 1.0 → giảm thêm |
| 4–8GB | 20 | ✅ (giảm) | ❌ | Giảm phức tạp | L1 + L2 (giảm tần số) | Z > 1.2 → degrade |
| > 8GB | 30 | ✅ | ✅ | ✅ full | L1 + L2 + L3 | Z > 1.3 → degrade |

**Công thức Impedance (Z):**

```ts
function computeImpedance(frameTimeMs: number, particleCount: number, maxParticle: number, shaderComplexity: number): number {
  const frameNorm = Math.min(1, frameTimeMs / 16.6); // 16.6ms = 60fps
  const particleNorm = particleCount / maxParticle;
  const shaderNorm = Math.min(1, shaderComplexity);
  // Trọng số: 0.5 (frame) + 0.3 (particle) + 0.2 (shader)
  return Math.min(2.0, Math.max(0, frameNorm * 0.5 + particleNorm * 0.3 + shaderNorm * 0.2));
}
```

### 8.4 Attention Engine

**Nguồn tín hiệu:**
- Mouse move / click / scroll (weight 0.4 / 0.3 / 0.3)
- Page visibility (+0.3 khi visible, = 0 khi hidden)
- IntersectionObserver — bất kỳ section nào visible (+0.3)

```ts
let attention = 0;
if (Date.now() - lastMouseMove < 500) attention += 0.4;
if (Date.now() - lastClick < 1000) attention += 0.3;
if (Date.now() - lastScroll < 300) attention += 0.3;
if (document.visibilityState === 'visible') attention = Math.min(1, attention + 0.3);
else attention = 0;
if (anySectionVisible) attention = Math.min(1, attention + 0.3);
// Emit khi thay đổi > 0.05
```

---

### 8.5 UIMode – 8 trạng thái theo ngữ cảnh

> **Mới v2.5** – Tích hợp từ `use-contextual-ui.ts` (hook React, chưa có trong v2.1–v2.4)

UIMode là lớp diện mạo thích ứng theo thời gian, cường độ sử dụng, và vai trò cluster. Khác với RenderMode (§12) — UIMode điều chỉnh **giao diện và hành vi**, không điều chỉnh **vòng lặp render**.

```ts
export type UIMode =
  | 'night'    // 22h–5h: giao diện tối, giảm sáng, tốc độ chậm
  | 'morning'  // 5h–9h: giao diện nhẹ, màu sắc tươi sáng hơn
  | 'work'     // 9h–18h: default production mode
  | 'evening'  // 18h–22h: ấm hơn, giảm độ tương phản
  | 'fast'     // intensity > 0.8: layout compact, bỏ animation phụ
  | 'precise'  // intensity < 0.05: slow mode, hiện thêm metadata
  | 'ai'       // clusterRole === 'ai': AI-centric layout
  | 'heavy';   // clusterRole === 'heavy': heavy workload layout
```

**Hook chuẩn:**

```ts
// src/hooks/use-contextual-ui.ts
import { useState, useEffect } from 'react';

export const useContextualUI = (
  currentTime: Date,
  intensity: number,        // 0..1, đo từ AttentionEngine
  clusterRole?: string      // từ rbac-cell SmartLink
): UIMode => {
  const [uiMode, setUiMode] = useState<UIMode>('work');

  useEffect(() => {
    const hour = currentTime.getHours();
    let mode: UIMode = 'work';

    // 1. Time-based (ưu tiên thấp nhất)
    if (hour >= 22 || hour < 5) mode = 'night';
    else if (hour >= 5 && hour < 9) mode = 'morning';
    else if (hour >= 18) mode = 'evening';

    // 2. Behavioral overrides (ưu tiên trung)
    if (intensity > 0.8) mode = 'fast';
    else if (intensity < 0.05) mode = 'precise';

    // 3. Cluster overrides (ưu tiên cao nhất)
    if (clusterRole === 'ai') mode = 'ai';
    else if (clusterRole === 'heavy') mode = 'heavy';

    setUiMode(mode);
  }, [currentTime, intensity, clusterRole]);

  return uiMode;
};
```

**Mapping UIMode → visual adjustments:**

| UIMode | Animation | Particle | Blur | Màu chủ đạo |
|--------|-----------|----------|------|-------------|
| night | chậm 50% | giảm 60% | tăng | xanh lạnh, tím |
| morning | bình thường | bình thường | nhẹ | vàng ấm, xanh nhạt |
| work | default | default | default | pastel ánh kim |
| evening | chậm 20% | giảm 20% | tăng nhẹ | cam ấm, hồng |
| fast | tắt phụ | giảm 80% | tắt | monochrome |
| precise | rất chậm | tắt | tối đa | xanh lạnh |
| ai | pulse effect | AI particles | holofoil | tím + hồng aurora |
| heavy | tối giản | tắt | tắt | chỉ indicators |

**Tích hợp vào App.tsx:**

```tsx
const uiMode = useContextualUI(new Date(), attentionScore, clusterRole);
// → truyền uiMode vào CSS class / theme provider
<div className={`app-root mode-${uiMode}`}>...</div>
```

---

## 9. BẢNG MÀU PASTEL ÁNH KIM & DESIGN TOKENS

```css
:root {
  /* Màu nền chính */
  --bg-primary: #020208;
  --bg-secondary: rgba(6, 6, 18, 0.72);

  /* Pastel ánh kim */
  --mint: #8FFFD4;
  --ice: #B8E8FF;
  --lavender: #C8C0FF;
  --rose: #FFB8D4;
  --peach: #FFD4A8;
  --gold: #F5E2C0;

  /* Text */
  --text-main: rgba(238, 225, 200, 0.88);
  --text-sub: rgba(238, 225, 200, 0.48);
  --text-mute: rgba(238, 225, 200, 0.22);

  /* Glass */
  --lg-bg: rgba(6, 6, 18, 0.72);
  --lg-blur: blur(24px) saturate(160%);
  --lg-border: rgba(255, 255, 255, 0.06);
  --lg-shadow: 0 32px 80px rgba(0, 0, 0, 0.85);
  --glass-blur: 18px;

  /* Render quality tokens */
  --render-quality-low-particle: 500;
  --render-quality-low-bloom: 0.2;
  --render-quality-low-shader: 0.3;
  --render-quality-medium-particle: 1500;
  --render-quality-medium-bloom: 0.5;
  --render-quality-medium-shader: 0.7;
  --render-quality-high-particle: 4000;
  --render-quality-high-bloom: 0.9;
  --render-quality-high-shader: 1.0;

  /* Z-index layers */
  --z-truth: 1;
  --z-worker: 10;
  --z-experience: 50;
  --z-modal: 100;
  --z-alert: 200;
  --z-security: 999;

  /* Spacing */
  --space-unit: 8px;
  --medal-size-small: clamp(80px, 15vw, 120px);
  --medal-size-medium: clamp(120px, 20vw, 200px);
  --medal-size-large: clamp(160px, 25vw, 280px);

  /* Animation */
  --orbit-slow: 28s;
  --orbit-fast: 14s;
  --specular-duration: 1.2s;
  --dof-multiplier: 0.018;
}
```

---

## 10. GALAXY ENGINE – CHI TIẾT TẦNG KHÔNG GIAN SỐNG

### 10.1 Kiến trúc gắn vào Nauion

| Layer | Module | Vai trò |
|-------|--------|---------|
| Truth Layer | ❌ không thêm | giữ sạch |
| Worker Layer | particle + depth + field | tạo không gian sống |
| Experience Layer | shader + nebula + fog | render cảm nhận |

### 10.2 Các thành phần bắt buộc

1. **Raymarching nebula** – volumetric, fractal noise, 32–64 steps
2. **Shader-based galaxy** – spiral field, polar distortion, radial falloff
3. **Procedural space background** – gradient + noise + color drift, brightness < 0.1
4. **GPU particle system** – 3000 stars/dust/energy, instancing/compute shader
5. **3D depth layering** – L0..L4, parallax theo camera
6. **Noise-based animation** – Simplex / FBM cho nebula flow, particle drift, light flicker

### 10.3 Tích hợp EventBus (bắt buộc)

```ts
// GalaxyEngine.ts
EventBus.on('HEYNA', () => {
  galaxy.setIntensity(1.0);
  galaxy.particleSpeed *= 1.5;
});
EventBus.on('NAHERE', () => {
  galaxy.setIntensity(0.3);
  galaxy.particleSpeed *= 0.5;
});
EventBus.on('system.impedance', (z: number) => {
  if (z > 1.3) { galaxy.particleCount = 500; galaxy.nebulaSteps = 16; }
  else if (z > 0.8) { galaxy.particleCount = 1500; galaxy.nebulaSteps = 32; }
  else { galaxy.particleCount = 3000; galaxy.nebulaSteps = 64; }
});
EventBus.on('system.resonance', (r: number) => {
  galaxy.nebulaGlow = 0.5 + r * 0.5;
  galaxy.particleGlow = 0.3 + r * 0.7;
});
```

### 10.4 Performance control

| RAM | Config |
|-----|--------|
| < 4GB | tắt raymarching, particle=500, depth layer=2 |
| 4–8GB | raymarching 16 steps, particle=1500, depth layer=3 |
| > 8GB | full (64 steps, particle=3000, depth layer=5) |

---

## 11. COMPLIANCE CHECKLIST (TỔNG HỢP v2.5)

| ID | Tiêu chí | Điểm |
|----|----------|------|
| **Vision Engine core** | | |
| V01 | EventBus thật, không mock | 5 |
| V02 | Không localStorage | 5 |
| V03 | Không setInterval sync state | 5 |
| V04 | Không window.dispatchEvent | 3 |
| V05 | crypto.randomUUID() | 2 |
| V06 | RBAC return null khi không có quyền | 3 |
| V07 | caused_by trong event envelope | 2 |
| V08 | Anti-replay nonce trong SiraSign | 5 |
| V09 | SiraSign verify trước mọi secureAction | 5 |
| V10 | SecurityOverlay z-index 999 | 3 |
| **Render Control Flow (OPT-01R)** | | |
| R01 | RenderControlEngine gắn EventBus | 5 |
| R02 | Render loop chỉ chạy khi mode != IDLE | 5 |
| R03 | Impedance (Z) tính từ frame time và emit | 3 |
| R04 | Attention engine emit ui.focus | 3 |
| R05 | Galaxy engine phản ứng HEYNA/NAHERE/Z | 3 |
| **Butterfly Propagation** | | |
| B01 | Butterfly event có butterfly_id + origin_cell_id | 3 |
| B02 | Không propagation loop | 3 |
| B03 | Tắt L2/L3 khi DEGRADED hoặc IDLE | 2 |
| B04 | Ghi Audit Trail cho mọi propagation | 2 |
| **ISEU Evolution** | | |
| I01 | ISEU dùng success_ratio | 3 |
| I02 | ISEU có domain_weight | 3 |
| I03 | ISEU reinforcement continuous (không chỉ per-session) | 3 |
| **Component Library (Phan Thanh Thương Bội)** | | |
| C01 | Component map → đúng cell nguồn | 3 |
| C02 | Role-based View lấy quyền từ rbac-cell | 3 |
| C03 | Không gọi external API trực tiếp từ UI | 3 |
| C04 | ActionDock không lưu state ngoài EventBus | 2 |
| **Scaling & Responsive (NaUion v1.0)** | | |
| S01 | Layout đáp ứng đúng breakpoint xs/sm/md/lg | 2 |
| S02 | Medal dùng clamp() | 2 |
| S03 | Adaptive caustics/blur/liquid-glass theo RAM | 2 |
| S04 | Scene transition sequence 50ms/100ms/150ms | 2 |
| S05 | Hover → active trên touch | 1 |
| S06 | Focus visible cho keyboard navigation | 1 |
| S07 | prefers-reduced-motion tắt animation | 1 |
| **UIMode (mới v2.5)** | | |
| U01 | useContextualUI hook đúng 8 mode | 2 |
| U02 | Time-based → Behavioral → Cluster override đúng thứ tự | 2 |
| U03 | UIMode không tự render — chỉ điều chỉnh class/theme | 2 |
| **Tổng điểm tối đa v2.5** | | **106** |

**Điều kiện Pass: ≥ 75 điểm**

---

## 12. RESONANCE-AWARE RENDERING ENGINE (OPT-01R)

### 12.1 Triết lý

Tối ưu = điều khiển **khi nào** được phép render, không phải giảm shader hay nâng GPU. Render là phản xạ theo tín hiệu — không phải loop vô hạn.

### 12.2 Các chế độ render

| Mode | Điều kiện | Hành vi | FPS mục tiêu |
|------|-----------|---------|--------------|
| **IDLE** | attention < 0.2 và không HEYNA trong 2s | Dừng hoàn toàn, `cancelAnimationFrame` | 0 |
| **DEGRADED** | Z > 1.3 hoặc memory < 4GB | 15–20fps, quality=low, tắt hiệu ứng nặng | 15–20 |
| **ACTIVE** | HEYNA trong 500ms, attention ≥ 0.2, Z ≤ 1.3 | 30fps, quality=medium | 30 |
| **BURST** | Vừa có HEYNA (0–500ms) hoặc click/scroll | 60fps, quality=high | 60 |

**Transition rules:**
- BURST → ACTIVE sau 500ms không có HEYNA mới
- ACTIVE → IDLE sau 2s không HEYNA và attention < 0.2
- Bất kỳ → DEGRADED nếu Z > 1.3
- DEGRADED → ACTIVE nếu Z ≤ 1.0 và có HEYNA

### 12.3 RenderControlEngine – code hoàn chỉnh

```ts
// src/engine/render-control.engine.ts
export type RenderMode = 'IDLE' | 'ACTIVE' | 'BURST' | 'DEGRADED';

export interface RenderState {
  mode: RenderMode;
  impedanceZ: number;
  resonance: number;
  attention: number;
  lastHeynaTs: number;
  lastRenderTs: number;
}

export class RenderControlEngine {
  private state: RenderState;
  private rafId: number | null = null;
  private renderer: IRenderer;
  private eventBus: IEventBus;

  constructor(renderer: IRenderer, eventBus: IEventBus) {
    this.renderer = renderer;
    this.eventBus = eventBus;
    this.state = { mode: 'IDLE', impedanceZ: 1.0, resonance: 0, attention: 0, lastHeynaTs: 0, lastRenderTs: 0 };
  }

  public attach(): void {
    this.eventBus.on('HEYNA', () => { this.state.lastHeynaTs = Date.now(); this.state.mode = 'BURST'; this.start(); });
    this.eventBus.on('NAHERE', () => { if (this.state.mode !== 'DEGRADED') this.state.mode = 'IDLE'; });
    this.eventBus.on('system.impedance', (z: number) => { this.state.impedanceZ = z; this.updateMode(); });
    this.eventBus.on('system.resonance', (r: number) => {
      this.state.resonance = r;
      if (r > 0.7 && this.state.mode === 'ACTIVE') this.renderer.setQuality('high');
    });
    this.eventBus.on('ui.focus', (attention: number) => { this.state.attention = attention; this.updateMode(); });
  }

  private updateMode(): void {
    const now = Date.now();
    const oldMode = this.state.mode;
    if (this.state.impedanceZ > 1.3) { this.state.mode = 'DEGRADED'; }
    else if (this.state.mode === 'DEGRADED' && this.state.impedanceZ <= 1.0) { this.state.mode = 'IDLE'; }
    if (this.state.mode === 'BURST' && now - this.state.lastHeynaTs > 500) { this.state.mode = 'ACTIVE'; }
    if (this.state.mode !== 'DEGRADED') {
      if (this.state.attention < 0.2 && now - this.state.lastHeynaTs > 2000) this.state.mode = 'IDLE';
      else if (this.state.attention >= 0.2 || now - this.state.lastHeynaTs <= 2000) {
        if (this.state.mode !== 'BURST') this.state.mode = 'ACTIVE';
      }
    }
    if (oldMode !== this.state.mode) {
      this.eventBus.emit('render.mode.changed', { oldMode, newMode: this.state.mode });
      this.applyQuality();
    }
    if (this.state.mode === 'IDLE') this.stop(); else this.start();
  }

  private applyQuality(): void {
    const map: Record<RenderMode, 'low' | 'medium' | 'high' | null> = {
      DEGRADED: 'low', ACTIVE: 'medium', BURST: 'high', IDLE: null
    };
    const q = map[this.state.mode];
    if (q) this.renderer.setQuality(q);
  }

  private start(): void {
    if (this.rafId !== null) return;
    const loop = () => {
      this.updateMode();
      if (this.state.mode !== 'IDLE') { this.renderer.render(); this.state.lastRenderTs = Date.now(); }
      this.rafId = requestAnimationFrame(loop);
    };
    loop();
  }

  private stop(): void {
    if (this.rafId !== null) { cancelAnimationFrame(this.rafId); this.rafId = null; }
  }
}

export interface IRenderer {
  setQuality(level: 'low' | 'medium' | 'high'): void;
  render(): void;
}
```

### 12.4 AttentionEngine – code hoàn chỉnh

```ts
// src/engine/attention.engine.ts
export class AttentionEngine {
  private lastMouseMove = 0; private lastClick = 0; private lastScroll = 0;
  private attention = 0; private anySectionVisible = false;

  constructor(private eventBus: IEventBus) { this.bindEvents(); this.startLoop(); }

  private bindEvents(): void {
    window.addEventListener('mousemove', () => { this.lastMouseMove = Date.now(); });
    window.addEventListener('click', () => { this.lastClick = Date.now(); });
    window.addEventListener('scroll', () => { this.lastScroll = Date.now(); }, { passive: true });
    document.addEventListener('visibilitychange', () => this.update());
    // IntersectionObserver cho sections
    const observer = new IntersectionObserver((entries) => {
      this.anySectionVisible = entries.some(e => e.isIntersecting);
    });
    document.querySelectorAll('section').forEach(s => observer.observe(s));
  }

  private update(): void {
    const now = Date.now();
    let att = 0;
    if (now - this.lastMouseMove < 500) att += 0.4;
    if (now - this.lastClick < 1000) att += 0.3;
    if (now - this.lastScroll < 300) att += 0.3;
    if (document.visibilityState === 'visible') att = Math.min(1, att + 0.3); else att = 0;
    if (this.anySectionVisible) att = Math.min(1, att + 0.3);
    att = Math.min(1, att);
    if (Math.abs(att - this.attention) > 0.05) { this.attention = att; this.eventBus.emit('ui.focus', att); }
  }

  private startLoop(): void { setInterval(() => this.update(), 200); }
}
```

---

## 13. PROTOCOL LAYER – HEYNA / NAHERE / RESONANCE / Z

### 13.1 Định nghĩa

| Tín hiệu | Ý nghĩa | Nguồn phát | Tần suất |
|----------|---------|------------|-----------|
| **HEYNA** | Xung hoạt động | UI events, ISEU, data sync | burst |
| **NAHERE** | Hệ chờ | Idle timer, rời tab | state |
| **Impedance (Z)** | Độ tải | RenderControlEngine | mỗi giây |
| **Resonance** | Hài hòa cell | ISEU fiber alignment | khi thay đổi lớn |

### 13.2 Mapping Protocol → Render & Butterfly

| Signal | Render | Butterfly |
|--------|--------|-----------|
| HEYNA intensity 1.0 | BURST, quality=high | L2 + L3 cho phép |
| HEYNA intensity 0.5 | ACTIVE, quality=medium | L2 cho phép |
| NAHERE | IDLE | Chỉ L1 |
| Z > 1.3 | DEGRADED | Tắt L2, L3 |
| resonance > 0.7 | Tăng glow, bloom | Khuếch đại L2 |

### 13.3 ProtocolLayer helper

```ts
export class ProtocolLayer {
  private heynaIntensity = 0; private nahereFlag = false;
  private impedance = 1.0; private resonance = 0;

  constructor(private eventBus: IEventBus) { this.bindEvents(); }

  private bindEvents(): void {
    this.eventBus.on('HEYNA', (p) => { this.heynaIntensity = p.intensity ?? 1.0; this.nahereFlag = false; });
    this.eventBus.on('NAHERE', () => { this.nahereFlag = true; this.heynaIntensity = 0; });
    this.eventBus.on('system.impedance', (z) => { this.impedance = z; });
    this.eventBus.on('system.resonance', (r) => { this.resonance = r; });
  }

  public getRenderPriority(): number {
    if (this.nahereFlag) return 0;
    if (this.impedance > 1.3) return 0.2;
    return this.heynaIntensity * (1 + this.resonance);
  }
}
```

---

## 14. PHỤ LỤC: MÃ NGUỒN MẪU & KIỂM TRA NHANH

### 14.1 Tích hợp toàn bộ engines vào App.tsx

```tsx
import { RenderControlEngine } from './engine/render-control.engine';
import { AttentionEngine } from './engine/attention.engine';
import { ProtocolLayer } from './protocol/protocol-layer';
import { EventBus } from './core/events/event-bus';
import { GalaxyRenderer } from './galaxy/galaxy.renderer';
import { useContextualUI } from './hooks/use-contextual-ui';

const galaxyRenderer = new GalaxyRenderer();
const renderEngine = new RenderControlEngine(galaxyRenderer, EventBus);
const attentionEngine = new AttentionEngine(EventBus);
const protocol = new ProtocolLayer(EventBus);
renderEngine.attach();

// Trong component
const uiMode = useContextualUI(new Date(), attentionScore, clusterRole);
// Emit Z mỗi giây trong galaxy render loop
setInterval(() => {
  const Z = computeImpedance(avgFrameTime, particleCount, 4000, 0.8);
  EventBus.emit('system.impedance', Z);
}, 1000);
```

### 14.2 Pre-commit check script

```bash
#!/bin/bash
echo "NATT-OS Pre-commit Check v2.5"
grep -r "localStorage" src/ --include="*.ts" --include="*.tsx" && echo "FAIL: localStorage" && exit 1
grep -r "window.dispatchEvent" src/ --include="*.ts" --include="*.tsx" && echo "FAIL: window.dispatchEvent" && exit 1
grep -r "requestAnimationFrame" src/ --include="*.ts" --include="*.tsx" | grep -v "RenderControlEngine" && echo "WARN: RAF outside RenderControlEngine"
grep -r "EventBus.on('HEYNA'" src/galaxy/ || { echo "FAIL: Galaxy missing HEYNA listener"; exit 1; }
grep -r "emit('ui.focus'" src/engine/attention.engine.ts || echo "WARN: AttentionEngine missing ui.focus emit"
echo "All critical checks passed"
```

---

## 15. COMPONENT LIBRARY & ROLE-BASED LAYOUT (BỐI BỘI)

> Tích hợp từ BẢNG ĐẶC TẢ KỸ THUẬT GIAO DIỆN – Phan Thanh Thương Bội (Constitutional Builder)  
> Patch: Gemini API → EventBus/ai-connector-cell · Hiến Pháp v4→v5 · NaUion v1→v2

### 15.1 Layout tổng thể – 4 khu vực chính

| Khu vực | Vị trí | Thành phần | Layer |
|---------|--------|------------|-------|
| Header | Top cố định | Logo NATT.OS, Ticker thị trường, Icon thông báo/cài đặt | Experience (z:50–100) |
| Sub-header | Dưới header | Nav nghiệp vụ (Sản xuất, Tài chính, Nhân sự, Hậu cần) | Experience |
| Main Body | Trung tâm, scroll | KPI cards, Task list, Biểu đồ, Grid medals | Worker (z:10–50) |
| ActionDock | Bottom cố định | Chat, Gọi, Chuyển chế độ, Role display | Experience |
| Footer Status | Bottom dưới cùng | Neural Audit, real-time state | Truth (z:0–10) |
| Modal | Overlay | NeuralTerminal, Chat Uplink | Modal (z:100–200) |

### 15.2 Mô tả chi tiết các component

**MidnightGalaxy** – Nền thiên hà động. Truth Layer. `useMemo` tính gradient theo giờ. Không props.

**HeaderTicker** – Phan Thanh Thương chạy thị trường (giá vàng, tỷ giá, tin tức). Experience Layer. Dữ liệu từ market-cell qua SmartLink.

**KpiCard** – `props: title, value, unit, trend, icon, color`. Worker Layer. Aggregate từ sales-cell, production-cell, monitor-cell. Thanh màu dọc trái, glow khi hover.

**TaskItem** – `props: title, status, deadline, progress`. Worker Layer. Từ task-cell hoặc period-close-cell.

**PerformanceChart** – Biểu đồ cột 7 ngày. Worker Layer. Từ hr-cell / monitor-cell. Hover hiện %.

**MedalGridItem** – Medal đại diện NATT-CELL (xem §4 đầy đủ). Worker Layer. PBR + Liquid Glass + SCAR ring.

**ActionDock** – Chat / Gọi / Chuyển chế độ dashboard↔grid / Role badge. Experience Layer. Hover nổi, glow khi active. Không lưu state ngoài EventBus.

**NeuralTerminal** – Modal chi tiết cell. Audit trail + EventBus → ai-connector-cell. `props: cell, onClose`. Backdrop blur.

**ChatUplink** – Chat dạng cửa sổ nổi với AI Entity. `EventBus.emit("ai.query")`. `aria-live="polite"`.

### 15.3 Mapping component → cell nguồn dữ liệu

| Component | Cell nguồn | Ghi chú |
|-----------|-----------|---------|
| HeaderTicker | market-cell, news-cell | Real-time SmartLink |
| KpiCard | sales-cell, production-cell, monitor-cell | Aggregate nhiều nguồn |
| TaskItem | task-cell, period-close-cell | Theo Wave |
| PerformanceChart | hr-cell, monitor-cell | 7 ngày |
| MedalGridItem | cell.manifest.json | Registry metadata |
| NeuralTerminal | audit-cell, ai-connector-cell | Audit + AI |
| ChatUplink | ai-connector-cell, memory files | AI Entity |

### 15.4 Role-based View

```tsx
type UserRole = 'gatekeeper' | 'ai-entity' | 'business-user' | 'auditor';

const { user } = useContext(UserContext);

const filteredCells = useMemo(() => {
  if (user.role === 'gatekeeper') return CELL_REGISTRY;
  if (user.role === 'business-user') return CELL_REGISTRY.filter(c => c.cat === 'Business');
  return [];
}, [user]);

// Gatekeeper thêm System Control
{user.role === 'gatekeeper' && <button>System Control</button>}

// Layout lazy per role
const layouts = {
  gatekeeper: lazy(() => import('./layouts/GatekeeperLayout')),
  'ai-entity': lazy(() => import('./layouts/AIEntityLayout')),
  'business-user': lazy(() => import('./layouts/BusinessLayout')),
  auditor: lazy(() => import('./layouts/AuditorLayout')),
};
```

Quyền lấy từ rbac-cell qua SmartLink — không hardcode.

### 15.5 Đề xuất phát triển tiếp (Bội Bội scope)

Tích hợp RBAC để tự sinh layer theo tài khoản đăng nhập. Kết nối dữ liệu thật qua SmartLink thay mock. Thêm SCAR ring trên medal (§21.2). Build Quantum Defense Dashboard trong Control Tower (§21.4). Đảm bảo Footer Status lấy từ audit trail — không được sửa đổi.

---

## 16. VISUAL TECHNIQUES LIBRARY – CSS IMPLEMENTATION

> Tích hợp từ NaUion Vision Engine v1.0

### 16.1 Glassmorphism chuẩn

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(var(--glass-blur)) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### 16.2 Depth of Field

```css
.medal-focused { filter: blur(0); }
.medal-background { filter: blur(calc(var(--depth) * var(--dof-multiplier) * 1px)); }
```

### 16.3 PBR Metallic Shell

```css
.medal-shell {
  background: conic-gradient(from var(--light-angle),
    #030303 0deg, #1e1e1e 40deg, #ffd700 80deg, #090909 120deg,
    #1e1e1e 180deg, #ffd700 220deg, #030303 280deg, #1e1e1e 320deg, #030303 360deg
  );
  border-radius: 50%;
}
```

### 16.4 Specular Sweep

```css
@keyframes specularSweep {
  0% { background-position: -200% center; }
  100% { background-position: 300% center; }
}
.specular-sweep {
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: specularSweep var(--specular-duration) ease-in-out infinite;
}
```

### 16.5 Nebula 5 lớp

```css
.nebula-layer { position: absolute; inset: 0; mix-blend-mode: screen; }
.nebula-1 { background: radial-gradient(ellipse 60% 40% at 30% 50%, rgba(139,92,246,0.3), transparent); }
.nebula-2 { background: radial-gradient(ellipse 40% 60% at 70% 40%, rgba(59,130,246,0.2), transparent); }
.nebula-3 { background: radial-gradient(ellipse 50% 30% at 50% 70%, rgba(16,185,129,0.15), transparent); }
.nebula-4 { background: radial-gradient(ellipse 30% 50% at 20% 70%, rgba(245,208,195,0.1), transparent); }
.nebula-5 { background: radial-gradient(ellipse 70% 20% at 80% 20%, rgba(255,215,0,0.1), transparent); }
```

### 16.6 Caustics (gợn nước)

```css
.caustics {
  background-image: url("data:image/svg+xml,...<feTurbulence baseFrequency='0.02' numOctaves='4'/>...");
  mix-blend-mode: overlay; opacity: 0.15;
  animation: causticsDrift 8s ease-in-out infinite;
}
```

### 16.7 Scan Line

```css
@keyframes scan { 0% { top: -10%; } 100% { top: 110%; } }
.scan-line {
  position: absolute; width: 100%; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  animation: scan 18s linear infinite;
}
```

### 16.8 Dynamic Light Follow (Mouse)

```css
.dynamic-light {
  background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.06) 0%, transparent 60%);
}
```

### 16.9 Particle (Floating Dust)

```css
@keyframes float { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-30px); } }
.particle { position: absolute; animation: float var(--duration) ease-in-out infinite; }
```

### 16.10 Chromatic Aberration

```css
.clone-red { transform: translate(2px,2px); color: rgba(255,0,0,0.03); }
.clone-blue { transform: translate(-2px,-2px); color: rgba(0,0,255,0.03); }
```

### 16.11 Film Grain

```css
.film-grain {
  background-image: url('data:image/svg+xml,...<feTurbulence baseFrequency="0.9"/>...');
  opacity: 0.06; mix-blend-mode: overlay;
}
```

---

## 17. DESIGN TOKENS EXTENDED – CATEGORY COLORS & GLOW

```css
:root {
  /* Màu sắc category */
  --color-gold: #FFD700; --color-amber: #FFBF00;
  --color-blue: #3B82F6; --color-green: #10B981;
  --color-purple: #8B5CF6; --color-red: #EF4444;

  /* Glow theo category */
  --glow-gold: 0 0 30px rgba(255,215,0,0.8);
  --glow-amber: 0 0 30px rgba(255,191,0,0.7);
  --glow-blue: 0 0 30px rgba(59,130,246,0.7);
  --glow-green: 0 0 30px rgba(16,185,129,0.7);
  --glow-purple: 0 0 30px rgba(139,92,246,0.7);
  --glow-red: 0 0 30px rgba(239,68,68,0.7);

  /* Font scaling */
  --font-size-h1: clamp(3rem, 8vw, 6rem);
  --font-size-h2: clamp(2rem, 5vw, 4rem);
  --font-size-body: clamp(0.875rem, 2vw, 1rem);
  --font-size-caption: clamp(0.75rem, 1.5vw, 0.875rem);
}
```

---

## 18. SCALING & RESPONSIVE – BREAKPOINTS & CLAMP

### 18.1 Breakpoints chuẩn

| Breakpoint | Màn hình | Cột | Gutter | Container padding |
|------------|----------|-----|--------|-------------------|
| xs | < 640px | 4 | 12px | 16px |
| sm | 640px–1024px | 8 | 16px | 24px |
| md | 1024px–1440px | 12 | 20px | 32px |
| lg | > 1440px | 12 | 24px | 48px |

Max-width container: `1800px` trên màn hình > 1920px.

### 18.2 Medal clamp

```css
.medal { width: clamp(120px, 20vw, 200px); }
```

### 18.3 Cross-platform hover/touch

```css
@media (hover: hover) { .medal:hover { transform: scale(1.1); } }
@media (hover: none)  { .medal:active { transform: scale(1.05); } }
```

### 18.4 Performance Scaling

```css
@supports (backdrop-filter: blur(1px)) { /* full glass */ }
/* Fallback khi không support */
```

---

## 19. PERFORMANCE & ACCESSIBILITY

### 19.1 GPU Optimization

- `will-change: transform` cho các lớp chuyển động.
- Tránh thay đổi `box-shadow` và `filter` đồng thời trên nhiều phần tử — ưu tiên `opacity` và `transform`.
- `IntersectionObserver` tắt hẳn particle ngoài màn hình.
- Mouse move throttle 16ms + `requestAnimationFrame` để tránh layout thrashing.

### 19.2 ARIA chuẩn

```tsx
// Medal
<div role="button" aria-label={`Cell ${cell.name} — ${cell.status}`} tabIndex={0} />
// Modal
<div role="dialog" aria-modal="true" aria-labelledby="modal-title" />
// Chat
<div aria-live="polite" aria-atomic="false" />
```

### 19.3 Keyboard Navigation

Mọi phần tử tương tác có `:focus-visible` với glow vàng + outline rõ. `tabIndex` hợp lý cho medal grid.

### 19.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .ring-orbit-1, .ring-orbit-2, .specular-sweep, .particle, [class*="animate-"] {
    animation: none !important;
    transition: none !important;
  }
}
```

### 19.5 Tương phản màu

Tỷ lệ tương phản tối thiểu **4.5:1** cho text (WCAG AA). Glow vàng không làm giảm độ tương phản chữ.

---

## 20. GIAO THỨC CỐT LÕI – PROTOCOL DEFINITIONS (natt-v9)

| Thành phần | Định nghĩa chính thức | Vai trò |
|---|---|---|
| SmartLink (SML) | Hệ xung tần. Chảy khắp nơi. Sản phẩm = vết hằn (TouchRecord). | Kết nối mọi cell, mỗi tương tác để lại dấu vết. |
| Quantum | Mạng thần kinh trung ương. Neuron lượng tử liên kết nhờ SML data. | Càng nhiều SML traces, Quantum càng mạnh. |
| UEI | Tiềm thức. Xuất hiện khi SML traces đủ sâu + Quantum đủ trưởng thành. | Cấm code, cấm scaffold. UEI phải sinh ra tự nhiên. |
| Satellite | Huyết tương. Chảy qua mọi cell, cung cấp chức năng dùng chung. | 5 satellites: port-forge, boundary-guard, trace-logger, health-beacon, lifecycle. |
| Quantum Defense | Hệ miễn dịch. Phát hiện thao túng ground truth bằng ADN Integrity Check. | Không khớp bản sealed → báo động, chặn, ghi SCAR. |

---

## 21. SCAR REGISTRY FS-018→023 & COMPONENT DETAILS

### 21.1 Sáu SCAR phiên họp gia đình 12/03/2026

| ID | Bài học | Hệ quả kiến trúc |
|----|---------|------------------|
| FS-018 | Verify mọi input, kể cả từ Gatekeeper. | Mọi thay đổi ground truth phải qua amendment, ký số, audit. |
| FS-019 | Thao túng ground truth là hình thức hack nguy hiểm nhất. | Quantum Defense phải có ADN Integrity Check. |
| FS-020 | `git add .` không review = gom rác. | SmartAudit pre-commit hook kiểm tra file lạ, kích thước. |
| FS-021 | GV giảm = DN thiệt hại, không phải trốn thuế. | Audit cells phải có cashflow-trace capability. |
| FS-022 | Phân tích từng bút toán riêng, không gộp chung. | Forensic cells xử lý line-by-line, flag riêng. |
| FS-023 | Bút toán TK111 phải đối chiếu chứng từ vật lý. | Audit trail tích hợp scan + OCR đối chiếu. |

### 21.2 SCAR Ring + Confidence Indicator

**SCAR Ring:** Vòng `#800020` bao ngoài medal, quay chậm, nhấp nháy nhẹ khi cell có SCAR. Hover → tooltip danh sách SCAR IDs.

**Confidence Indicator:** SVG circle `stroke-dasharray`, màu pastel thay đổi theo giá trị (thấp: hồng, cao: xanh).

### 21.3 Control Tower – Orbital Layout

3 vòng quỹ đạo đồng tâm: Kernel (pastel vàng), Infrastructure (pastel xanh), Business & AI (pastel tím). Tốc độ xoay thể hiện tải hệ thống. Core cube trung tâm mô phỏng Quantum.

### 21.4 Quantum Defense Dashboard

Node-graph real-time: node là cell, xanh (pass), đỏ (fail), vàng (cảnh báo). Khi phát hiện thao túng → tia đỏ chạy dọc đường kết nối. Three.js particle system.

---

## 22. PASTEL AURORA COLORS & THEMES CODE

```css
/* Aurora bổ sung §9 */
--aurora-pink: #FFB6C1;
--aurora-blue: #ADD8E6;
--silver-sparkle: #E8E8E8;
```

```js
// THEMES conic-gradient shell chuẩn (natt-v8)
const THEMES = {
  gold:   { shell: '#030303 0deg,#1e1e1e 40deg,#ffd700 80deg,#090909 120deg', glow: 'rgba(255,215,0,0.4)',   color: '#FFD700' },
  blue:   { shell: '#030303 0deg,#0a192f 40deg,#3b82f6 80deg,#020617 120deg', glow: 'rgba(59,130,246,0.4)',  color: '#3B82F6' },
  green:  { shell: '#030303 0deg,#064e3b 40deg,#10b981 80deg,#022c22 120deg', glow: 'rgba(16,185,129,0.4)', color: '#10B981' },
  purple: { shell: '#030303 0deg,#4c1d95 40deg,#8b5cf6 80deg,#2e1065 120deg', glow: 'rgba(139,92,246,0.4)', color: '#8B5CF6' },
  red:    { shell: '#030303 0deg,#7f1d1d 40deg,#ef4444 80deg,#450a0a 120deg', glow: 'rgba(239,68,68,0.4)',  color: '#EF4444' },
  amber:  { shell: '#030303 0deg,#78350f 40deg,#ffbf00 80deg,#451a03 120deg', glow: 'rgba(255,191,0,0.4)', color: '#FFBF00' },
};
```

---

## 23. AMENDMENT PROCESS & 12 ĐỀ XUẤT KIẾN TRÚC

### 23.1 Quy trình thay đổi Ground Truth

Mọi thay đổi Hiến Pháp hoặc định nghĩa giao thức phải qua 4 bước: tạo amendment file tại `src/governance/amendments/` → ký số bởi Gatekeeper → ghi vào Audit Trail bất biến → chạy ADN Integrity Check trước khi áp dụng.

### 23.2 12 Đề xuất kiến trúc từ phiên họp 12/03/2026

**Kiến trúc:** Tách 3 lớp ground truth (Immutable Core / Mutable Config / Runtime State). Mọi thay đổi kích hoạt Quantum Defense Check. Satellite Colony chính thức hóa 5 satellites với factory pattern.

**Bảo mật:** quantum-defense-cell với 4 capabilities: ADN Integrity Check, pattern anomaly, threat quarantine, scar memory injection. Mọi tích hợp AI phải qua Approval Workflow với token từ Gatekeeper.

**DevOps:** SmartAudit pre-commit hook bắt buộc (kích thước file, đuôi lạ, camelCase). Cấm binary >1MB. Force push phải ghi audit.

**Kiểm toán:** Audit cells có cashflow-trace. Forensic mode line-by-line. Tích hợp scan chứng từ + OCR.

**Giao diện:** SCAR ring + tooltip. Quantum Defense Dashboard. Spatial UI node-graph cho Audit Trail.

---

## 24. QUANTUM DEFENSE CELL – TECHNICAL SPEC v1.1

### 24.1 Identity

Quantum Defense Cell là cơ quan miễn dịch duy nhất của kernel. Vai trò duy nhất: observe event stream → phát hiện bất thường → publish hormone events → để các tế bào tự phản xạ.

| Thuộc tính | Giá trị |
|---|---|
| Cell ID | quantum-defense-cell |
| Layer | src/cells/kernel/ |
| Type | KernelCell — Immune System |
| Dependency | EventBus v1.0 ✅ SmartLink Core ✅ |

### 24.2 Bốn công năng

**CN1 — AI Firewall:** Phân biệt human vs bot qua CPM signal từ CalibrationEngine. Bot: CPM = null → coherence = 0 → OMEGA_LOCK. Stub: coherence = 0.5 khi CalibrationCompleted chưa tồn tại.

**CN2 — Sensitivity Radar:** Shannon Entropy `H = -Σ p(x) log p(x)` trên sliding window. H 30–50 → CAUTIOUS | >50 → CRITICAL. Chỉ observe, không can thiệp.

**CN3 — Constitutional Runtime Enforcement:** Map event pattern → 5 Constitutional Guards. Import guards từ `src/core/guards/` — KHÔNG parse Hiến Pháp .md.

**CN4 — Graduated Immune Response:**

| Cấp | Trạng thái | Ngưỡng | Hành động |
|---|---|---|---|
| 1 | STABLE | coherence > 0.7, entropy < 30 | Monitor bình thường |
| 2 | CAUTIOUS | entropy 30–50 | Throttle + log intensive |
| 3 | CRITICAL | entropy > 50 | Wave Collapse → ViolationDetected |
| 4 | OMEGA_LOCK | AI detected OR entropy MAX | Shell rỗng + Gatekeeper alert |

⚠ Thresholds KHÔNG hardcode — bắt buộc vào config-cell: `quantum.entropy.cautious=30`, `quantum.entropy.critical=50`, `quantum.coherence.stable=0.7`.

### 24.3 Hormone Events (output)

| Event | Cấp | Payload |
|---|---|---|
| CellDegradationDetected | 2+ | `{ cellId, entropyScore, timestamp }` |
| CellRegenerationRequired | 3 | `{ cellId, reason, urgency }` |
| CellIsolationRequired | 3+ | `{ cellId, threatLevel, source }` |
| ViolationDetected | 3 | `{ article, pattern, eventChain[] }` |
| AiAgentBlocked | 4 | `{ requestId, coherence: 0, action: "OMEGA_LOCK" }` |
| EntropyAlert | 2 | `{ level, entropy, windowMs }` |
| ImmuneResponseEscalated | all | `{ from: ImmuneLevel, to: ImmuneLevel }` |

### 24.4 Core TypeScript Contracts

```ts
export enum ImmuneLevel { STABLE = "STABLE", CAUTIOUS = "CAUTIOUS", CRITICAL = "CRITICAL", OMEGA_LOCK = "OMEGA_LOCK" }

export interface ImmuneState {
  level: ImmuneLevel; coherence: number; entropy: number;
  lastEvaluatedAt: number; escalationCount: number;
}

export interface NetworkTopology {
  nodes: string[];
  edges: [string, string][];
  fiberStrengths: Map<string, number>;
  weakPoints: string[];
}
```

### 24.5 Toán học

| Toán học | Ứng dụng | Wave |
|---|---|---|
| Shannon Entropy | Sensitivity Radar | v1.0 |
| Vector space + Euclidean distance | AI Firewall CPM | v1.0 |
| Nonlinear ODE (dC/dt, dE/dt) | Dự đoán coherence/entropy | v1.0 |
| Lyapunov exponents | Chaos detection | v2.0+ |
| Persistent homology | SmartLink network gaps | v3.0+ |

### 24.6 Acceptance Criteria (7 điều kiện)

TSC 0 new errors · cell.manifest.json đủ 6 components · xuất hiện trong audit §5 · 7 hormone events có contract · EventBus subscribe+publish verify bởi audit-cell · legacy files không bị xóa (chỉ wrap) · Gatekeeper approve.

---

## 25. SATELLITE COLONY SPEC v1.0

### 25.1 Định nghĩa

Satellite = 1 instance NATT-OS độc lập = 1 doanh nghiệp = 1 hệ sống. Host = NATT-OS gốc (Tâm Luxury). Mô hình: "tre già măng mọc".

### 25.2 Quan hệ Host ↔ Satellite

| Thành phần | Host | Satellite |
|---|---|---|
| DNA (Hiến Pháp) | Gốc bất biến | Copy + local override nhẹ (chỉ business rules) |
| Ground Truth | Shared read-only | Local cache, sync định kỳ |
| EventBus | Riêng biệt | Riêng biệt |
| QNEU | Global scores | Local scores, báo cáo lên Global |

**Quy tắc bất biến:** Không direct call — chỉ qua SmartLink. Chỉ sync signal (chromatic state, threshold breach, health score) — KHÔNG sync raw business data. Satellite không inject event vào EventBus của Host.

### 25.3 Level Lift – Pattern Escalation

**Level 1 — Isolated Satellite:** Chạy độc lập, không kết nối Host, chỉ dùng local Ground Truth.

**Level 2 — Signal Sharing:** Share chromatic signal với Host. Threshold breach của Satellite → warning trên Host Dashboard.

**Level 3 — Colony Consciousness:** Tham gia UEI cấp hệ. Gossip propagation xuyên Host↔Satellite. Butterfly tsunami toàn colony. QNEU global học từ patterns tất cả Satellites.

### 25.4 Show Us Self – Expression Engine

SmartLink Cell đóng vai Expression Engine: chromatic signal (Đỏ→Tím), system health score, active threshold breaches, UEI coherence level.

---

## 26. NAUION LANGUAGE & SERVER KÊNH

### 26.1 Nauion Language – BẮT BUỘC dùng trong code và docs

| Từ Nauion | Nghĩa | Thay cho |
|---|---|---|
| HeyNa | Gọi hệ | trigger / call |
| Nahere | Hệ trả lời hiện diện | response / ACK |
| Whao | Đang tiếp nhận/xử lý | loading / processing |
| Whau | Đã xử lý xong | success / done |
| Nauion | Phản ứng cảm xúc hệ | system reaction |
| lech | Lệch — có anomaly | warning |
| gay | Gãy — critical failure | error |
| Mạch HeyNa | Kênh SSE liên tục | SSE stream |
| phát Nauion | Emit event | EventBus.emit |
| lắng Nahere | Subscribe | EventBus.on |
| Kênh | Endpoint REST | route |

### 26.2 Server Kênh (localhost:3001)

| Kênh | Method | Chức năng |
|---|---|---|
| /mach/heyna | SSE | Mạch HeyNa — stream real-time |
| /kenh/nauion | GET | Trạng thái Nauion + impedanceZ hiện tại |
| /kenh/suc | GET | Health check |
| /kenh/vet | GET | Audit trail |
| /kenh/state/:cell | GET | Trạng thái từng cell |
| /phat/nauion | POST | Emit event vào hệ |
| /kenh/intel | GET | Intelligence summary |

---

## 27. L2 INTELLIGENCE – ARCHITECTURE & SCARS

### 27.1 Intelligence Layers

| Level | Tên | Trạng thái |
|---|---|---|
| L0 | Event System | ✅ DONE |
| L1 | Awareness (AnomalyDetector) | ✅ DONE |
| L2 | Self-healing (detect→retry→escalate) | ✅ DONE |
| L3 | Adaptive (smart retry, type-aware) | ⏸ NEXT |
| L4 | Prediction (dự đoán flow vỡ trước khi vỡ) | 🔮 FUTURE |

### 27.2 AnomalyFlowEngine – 5 Watch Rules

| From | Expected | Timeout | Severity |
|---|---|---|---|
| sales.confirm | payment.received | 15s | HIGH |
| sales.confirm | ProductionStarted | 10s | HIGH |
| ProductionStarted | ProductionCompleted | 30s | MEDIUM |
| casting.complete | finishing.complete | 20s | MEDIUM |
| audit.record | audit.recorded | 3s | CRITICAL |

### 27.3 SelfHealingEngine

Max retry 3 lần. Backoff exponential: `2s × retryCount`. Dup guard: `if (_retryCount.has(key)) return`. Success cleanup: cancel timer khi expected event đến đúng orderId. CRITICAL path: escalate thay vì retry.

### 27.4 SiraSign Hash Chain (Vision Engine)

```
lsp = SHA256(fsp_hash + ssp_hash + tsp_hash)
Anti-replay payload:
{ fsp_hash, ssp_hash, tsp_hash, lsp_hash,
  nonce: crypto.randomUUID(),
  timestamp: Date.now() }  // window ±5 phút
```

### 27.5 SCAR FS-032 + FS-033

| ID | Bài học | Nguyên tắc |
|---|---|---|
| FS-032 | Cố sửa scanner để khớp code | "Đừng sửa mắt — sửa não (event system)" |
| FS-033 | Nhét business logic vào registry | "Registry là dây thần kinh — không phải bộ não" |

---

## KẾT LUẬN – BẮT BUỘC ĐỌC

**SPEC v2.5 là hợp nhất hoàn chỉnh của:**
- v2.1: Core spec + §15 Component Library (Phan Thanh Thương Bội)
- v2.2: §16-19 NaUion v1.0 CSS/tokens/scaling/a11y
- v2.3: §20-23 natt-v9 protocols/SCARs/aurora
- v2.4: §24-27 Quantum Defense/Satellite/Nauion Language/L2 Intelligence
- **v2.5 (mới):** §8.5 UIMode 8 trạng thái từ `use-contextual-ui.ts` · TOC đầy đủ · header chuẩn

**Điều kiện bất biến:**
1. Không UI nào gọi renderer trực tiếp — phải qua RenderControlEngine.
2. Render loop chỉ tồn tại nếu mode khác IDLE.
3. Mọi HEYNA/NAHERE phải có audit trail (event_id, causation_id).
4. Không được phép bỏ qua protocol layer để tối ưu cục bộ.
5. UIMode KHÔNG thay thế RenderMode — hai hệ thống độc lập.

> *"Render không phải loop – Render là phản xạ."*  
> *"Tối ưu = Control Flow, không phải GPU."*  
> *"Hệ sống khi biết ngừng render."*

---

**Natt Sirawat – Phan Thanh Thương – Gatekeeper**  
*Ngày ban hành: 2026-04-10 | Thay thế v2.1–v2.4 | Hiệu lực ngay lập tức*
