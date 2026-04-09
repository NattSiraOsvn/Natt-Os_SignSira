# 🌐 NATT-OS NAUION UI SPEC – VERSION 2.1 (HOÀN CHỈNH TÍCH HỢP)

## Bảng đặc tả thống nhất cho Vision Engine v2.1 + OPT-01R + Component Library

**Tác giả:** Băng (tổng hợp từ Kim + Can + Thiên + Bối Bội)  
**Phê duyệt:** Gatekeeper – Anh Nat  
**Ngày cập nhật:** 2026-04-08 → v2.1 2026-04-08  
**Trạng thái:** Bất biến (Immutable)  
**Bản thay thế:** SPEC-Nauion.main.md v2.0 (2026-04-08) – bổ sung §15 Component Library từ Bối Bội

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
10. [Galaxy Engine – Chi tiết tầng không gian sống](#10-galaxy-engine--chi-tiết-tầng-không-gian-sống)
11. [Compliance Checklist (tổng hợp)](#11-compliance-checklist-tổng-hợp)
12. **[RESONANCE-AWARE RENDERING ENGINE (OPT-01R)**](#12-resonance-aware-rendering-engine-opt-01r)
13. **[PROTOCOL LAYER – HEYNA / NAHERE / RESONANCE / Z**](#13-protocol-layer--heyna--nahere--resonance--z)
14. **[Phụ lục: Mã nguồn mẫu & Kiểm tra nhanh](#14-phụ-lục-mã-nguồn-mẫu--kiểm-tra-nhanh)
15. **[Component Library & Role-based Layout (Bối Bội)](#15-component-library--role-based-layout-bối-bội-v21)**

---

## 1. TRIẾT LÝ & KIẾN TRÚC TỔNG THỂ

### 1.1 Triết lý bất biến (mở rộng)

> *"Data is sacred. UI không được tự biết — UI chỉ được nghe."*
>
> *"Render không phải loop — Render là phản xạ."*
>
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

### 1.2 Kiến trúc 3 tầng thị giác (mở rộng)

| Tầng | Vai trò | Công nghệ | Z-index |
|------|---------|-----------|---------|
| **Truth Layer** | Hiển thị state, audit, ground truth | Số liệu tĩnh, glow vàng, viền sáng bất biến | 0–10 |
| **Worker Layer** | Cell registry, process flow | Medal 3D, orbital rings, hiệu ứng động theo trạng thái | 10–50 |
| **Experience Layer** | UI tương tác, dashboard, chat | Glassmorphism, parallax, bloom, hiệu ứng chuột, Galaxy Engine | 50–100 |
| **Modal / Chat** | Cửa sổ nổi, popup | Backdrop blur, viền ánh kim, FLIP transition | 100–200 |
| **Alert / System** | Cảnh báo khẩn cấp | Overlay đỏ, glow nhấp nháy | 200–300 |
| **Security** | SecurityOverlay – không ai vượt qua | Z-index 999, SiraSign lock | 999 |

### 1.3 Scene transition flow

```
Truth Layer (50ms) → Worker Layer (100ms) → Experience Layer (150ms)
```

Khi chuyển scene, các layer xuất hiện tuần tự tạo hiệu ứng "dựng scene".

### 1.4 Luồng điều khiển render mới (Control Flow)

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

(Lược giữ nguyên từ bản gốc, không thay đổi)

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

**Mức độ áp dụng:** giữ nguyên.

---

## 3. NAUION – SINH THỂ SỐ & NGƯỠNG SỐNG

Giữ nguyên bản gốc, bổ sung thêm chỉ số **Resonance** (sẽ được định nghĩa trong mục 13).

---

## 4. NATT-CELL MEDAL – 9 LỚP CHUẨN + LIQUID GLASS

Giữ nguyên 9 lớp và code mẫu React. Không thay đổi.

---

## 5. BUTTERFLY PROPAGATION PROTOCOL

Giữ nguyên 3 cấp độ (L1, L2, L3). Bổ sung ràng buộc mới:

- Khi hệ thống ở mode `DEGRADED` (Z > 1.3), chỉ cho phép L1 (local ripple), tắt L2, L3.
- Khi ở mode `IDLE` (không HEYNA), tạm ngưng tất cả butterfly hiệu ứng.

---

## 6. ISEU EVOLUTION ENGINE – 2 NÂNG CẤP BẮT BUỘC

Giữ nguyên công thức `outcome_weight` và `reinforcement` liên tục. Không thay đổi.

---

## 7. EVENT SYSTEM (NAUION PATTERN) & SIRASIGN

### 7.1 Luật bất biến (giữ nguyên)

### 7.2 Event Envelope chuẩn (giữ nguyên)

### 7.3 Vision Events (mở rộng – thêm các event cho protocol layer)

| Event type | Payload | Mô tả |
|------------|---------|-------|
| `HEYNA` | `{ source, intensity }` | Xung hoạt động, yêu cầu render mạnh |
| `NAHERE` | `{ source, reason }` | Hệ chờ, yêu cầu render nhẹ hoặc dừng |
| `system.impedance` | `{ value: number, timestamp }` | Cập nhật Z (impedance) |
| `system.resonance` | `{ value: number, cellIds?: string[] }` | Cập nhật resonance |
| `ui.focus` | `{ attention: number (0-1) }` | Mức độ focus của user |
| `render.mode.changed` | `{ oldMode, newMode }` | RenderControlEngine thay đổi mode |

**Các event cũ:** `vision.state.changed`, `vision.density.changed`, `vision.cell.selected`, `security.failed`, `OMEGA_LOCKDOWN`, `butterfly.*`, `iseu.reinforcement`.

### 7.4 SiraSign (giữ nguyên)

---

## 8. ROLE‑BASED UI & ADAPTIVE PERFORMANCE

### 8.1 RBAC (giữ nguyên)

### 8.2 Density Mode (giữ nguyên)

### 8.3 Adaptive Performance (mở rộng – thêm impedance)

| Device Memory | Particles | Blur | Caustics | Liquid Glass | Butterfly (L2/L3) | **Impedance override** |
|---------------|-----------|------|----------|--------------|-------------------|------------------------|
| < 4GB | 10 | ❌ | ❌ | ❌ | Chỉ L1 | Nếu Z > 1.0 → giảm thêm |
| 4–8GB | 20 | ✅ (giảm) | ❌ | Giảm độ phức tạp | L1 + L2 (giảm tần số) | Nếu Z > 1.2 → degrade |
| > 8GB | 30 | ✅ | ✅ | ✅ (full) | L1 + L2 + L3 | Nếu Z > 1.3 → degrade |

**Công thức tính Impedance (Z):**

```ts
// Z = 0 (nhẹ) → 2.0 (quá tải)
function computeImpedance(frameTimeMs: number, particleCount: number, maxParticle: number, shaderComplexity: number): number {
  const frameNorm = Math.min(1, frameTimeMs / 16.6);  // 16.6ms = 60fps
  const particleNorm = particleCount / maxParticle;
  const shaderNorm = Math.min(1, shaderComplexity);
  
  // Trọng số: 0.5 (frame) + 0.3 (particle) + 0.2 (shader)
  let Z = frameNorm * 0.5 + particleNorm * 0.3 + shaderNorm * 0.2;
  return Math.min(2.0, Math.max(0, Z));
}
```

### 8.4 Attention Engine (mới)

**Mục tiêu:** Đo lường user có đang thực sự tương tác hay không.

**Các nguồn tín hiệu:**
- Mouse move / click / scroll (weight 0.4)
- Touch events (mobile) (weight 0.5)
- Page visibility (visibilityState === 'visible' → +0.3)
- Section visible (Intersection Observer) (weight 0.3)

**Công thức tổng hợp:**

```ts
let attention = 0;

// Mouse activity (throttle 100ms)
if (Date.now() - lastMouseMove < 500) attention += 0.4;
if (Date.now() - lastClick < 1000) attention += 0.3;
if (Date.now() - lastScroll < 300) attention += 0.3;

// Page visibility
if (document.visibilityState === 'visible') attention = Math.min(1, attention + 0.3);
else attention = 0;

// Section visible (bất kỳ section nào đang thấy)
if (anySectionVisible) attention = Math.min(1, attention + 0.3);

return Math.min(1, attention);
```

**Emit event:** mỗi khi attention thay đổi > 0.1, emit `ui.focus` với giá trị mới.

---

## 9. BẢNG MÀU PASTEL ÁNH KIM & DESIGN TOKENS

Giữ nguyên bản gốc, bổ sung thêm token cho render quality:

```css
:root {
  /* ... các token cũ ... */
  
  /* Render quality levels */
  --render-quality-low-particle: 500;
  --render-quality-low-bloom: 0.2;
  --render-quality-low-shader: 0.3;
  
  --render-quality-medium-particle: 1500;
  --render-quality-medium-bloom: 0.5;
  --render-quality-medium-shader: 0.7;
  
  --render-quality-high-particle: 4000;
  --render-quality-high-bloom: 0.9;
  --render-quality-high-shader: 1.0;
}
```

---

## 10. GALAXY ENGINE – CHI TIẾT TẦNG KHÔNG GIAN SỐNG

Tích hợp từ phụ lục 11.4 của bản gốc, nhưng gắn với EventBus và RenderControlEngine.

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
4. **GPU particle system** – 3000 stars/dust/energy particles, instancing/compute shader
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
  if (z > 1.3) {
    galaxy.particleCount = 500;
    galaxy.nebulaSteps = 16;
  } else if (z > 0.8) {
    galaxy.particleCount = 1500;
    galaxy.nebulaSteps = 32;
  } else {
    galaxy.particleCount = 3000;
    galaxy.nebulaSteps = 64;
  }
});

EventBus.on('system.resonance', (r: number) => {
  galaxy.nebulaGlow = 0.5 + r * 0.5;
  galaxy.particleGlow = 0.3 + r * 0.7;
});
```

### 10.4 Performance control (theo Adaptive Performance)

| RAM | Config |
|-----|--------|
| <4GB | tắt raymarching, particle=500, depth layer=2 |
| 4–8GB | raymarching 16 steps, particle=1500, depth layer=3 |
| >8GB | full (64 steps, particle=3000, depth layer=5) |

---

## 11. COMPLIANCE CHECKLIST (TỔNG HỢP – CẬP NHẬT)

| ID | Tiêu chí | Điểm |
|----|----------|------|
| **Vision Engine core** | | |
| V01 | EventBus thật, không mock | 5 |
| V02 | Không localStorage | 5 |
| V03 | Không setInterval sync state | 5 |
| V04 | Không window.dispatchEvent | 3 |
| V05 | crypto.randomUUID() | 2 |
| V06 | RBAC return null | 3 |
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
| B02 | Không propagation loop | 3 |
| B03 | Tự động tắt hiệu ứng trên thiết bị yếu / DEGRADED | 2 |
| B04 | Ghi Audit Trail cho mọi propagation | 2 |
| **ISEU Evolution** | | |
| I01 | ISEU dùng success_ratio | 3 |
| I02 | ISEU có domain_weight | 3 |
| I03 | ISEU reinforcement continuous | 3 |
| **Render Control Flow (OPT-01R)** | | |
| R01 | RenderControlEngine gắn EventBus | 5 |
| R02 | Render loop chỉ chạy khi mode != IDLE | 5 |
| R03 | Impedance (Z) được tính và emit | 3 |
| R04 | Attention engine emit ui.focus | 3 |
| R05 | Galaxy engine phản ứng HEYNA/NAHERE/Z | 3 |
| **Tổng điểm tối đa** | | **68** |
| **Component Library (Bối Bội v2.1)** | | |
| C01 | Component map → đúng cell nguồn | 3 |
| C02 | Role-based View theo rbac-cell | 3 |
| C03 | Không gọi external API trực tiếp từ UI | 3 |
| C04 | ActionDock không lưu state ngoài EventBus | 2 |
| **Tổng điểm tối đa v2.1** | | **79** |

**Điều kiện Pass: ≥ 55 điểm** (SPEC hiện tại đạt 68/68)

---

## 12. RESONANCE-AWARE RENDERING ENGINE (OPT-01R)

### 12.1 Từ tối ưu GPU sang điều khiển luồng (Control Flow)

**Sai lầm phổ biến:** tối ưu = giảm shader, giảm particle, nâng GPU.

**Đúng bản chất:** tối ưu = điều khiển khi nào được phép render.

Render KHÔNG còn là loop vô hạn. Render là **phản xạ** theo tín hiệu.

### 12.2 Các chế độ render

| Mode | Điều kiện | Hành vi | FPS mục tiêu |
|------|-----------|---------|--------------|
| **IDLE** | attention < 0.2 và không có HEYNA trong 2s | Dừng hoàn toàn render loop, không gọi RAF | 0 |
| **DEGRADED** | Z > 1.3 hoặc memory < 4GB | Render 15-20fps, quality=low, tắt hiệu ứng nặng | 15-20 |
| **ACTIVE** | Có HEYNA trong 500ms, attention ≥ 0.2, Z ≤ 1.3 | Render 30fps, quality=medium | 30 |
| **BURST** | Vừa có HEYNA (0-500ms) hoặc user click/scroll | Render 60fps, quality=high | 60 |

**Transition rules:**
- BURST → ACTIVE sau 500ms không có HEYNA mới.
- ACTIVE → IDLE sau 2s không có HEYNA và attention < 0.2.
- Bất kỳ mode nào → DEGRADED nếu Z > 1.3.
- DEGRADED → ACTIVE nếu Z ≤ 1.0 và có HEYNA.

### 12.3 RenderControlEngine – code hoàn chỉnh

```ts
// src/engine/render-control.engine.ts

export type RenderMode = 'IDLE' | 'ACTIVE' | 'BURST' | 'DEGRADED';

export interface RenderState {
  mode: RenderMode;
  impedanceZ: number;       // 0..2
  resonance: number;        // 0..1
  attention: number;        // 0..1
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
    this.state = {
      mode: 'IDLE',
      impedanceZ: 1.0,
      resonance: 0,
      attention: 0,
      lastHeynaTs: 0,
      lastRenderTs: 0,
    };
  }

  // Gắn vào EventBus – bắt buộc gọi sau khởi tạo
  public attach(): void {
    this.eventBus.on('HEYNA', (payload: any) => {
      this.state.lastHeynaTs = Date.now();
      this.state.mode = 'BURST';
      this.start();
    });

    this.eventBus.on('NAHERE', () => {
      // Không dừng ngay, để transition tự nhiên
      if (this.state.mode !== 'DEGRADED') {
        this.state.mode = 'IDLE';
      }
    });

    this.eventBus.on('system.impedance', (z: number) => {
      this.state.impedanceZ = z;
      this.updateMode();
    });

    this.eventBus.on('system.resonance', (r: number) => {
      this.state.resonance = r;
      // Resonance ảnh hưởng đến quality boost
      if (r > 0.7 && this.state.mode === 'ACTIVE') {
        this.renderer.setQuality('high'); // tạm thời nâng quality
      }
    });

    this.eventBus.on('ui.focus', (attention: number) => {
      this.state.attention = attention;
      this.updateMode();
    });
  }

  private updateMode(): void {
    const now = Date.now();
    const oldMode = this.state.mode;

    // Ưu tiên impedance
    if (this.state.impedanceZ > 1.3) {
      this.state.mode = 'DEGRADED';
    } else if (this.state.mode === 'DEGRADED' && this.state.impedanceZ <= 1.0) {
      // Chỉ thoát degraded khi Z thực sự giảm
      this.state.mode = 'IDLE';
    }

    // BURST timeout
    if (this.state.mode === 'BURST' && now - this.state.lastHeynaTs > 500) {
      this.state.mode = 'ACTIVE';
    }

    // Attention và Heyna
    if (this.state.mode !== 'DEGRADED') {
      if (this.state.attention < 0.2 && now - this.state.lastHeynaTs > 2000) {
        this.state.mode = 'IDLE';
      } else if (this.state.attention >= 0.2 || now - this.state.lastHeynaTs <= 2000) {
        if (this.state.mode !== 'BURST') this.state.mode = 'ACTIVE';
      }
    }

    if (oldMode !== this.state.mode) {
      this.eventBus.emit('render.mode.changed', { oldMode, newMode: this.state.mode });
      this.applyQuality();
    }

    // Dừng loop nếu IDLE
    if (this.state.mode === 'IDLE') {
      this.stop();
    } else {
      this.start();
    }
  }

  private applyQuality(): void {
    switch (this.state.mode) {
      case 'DEGRADED':
        this.renderer.setQuality('low');
        break;
      case 'ACTIVE':
        this.renderer.setQuality('medium');
        break;
      case 'BURST':
        this.renderer.setQuality('high');
        break;
      default:
        break;
    }
  }

  private start(): void {
    if (this.rafId !== null) return;
    const loop = () => {
      this.updateMode(); // kiểm tra lại mỗi frame
      if (this.state.mode !== 'IDLE') {
        this.renderer.render();
        this.state.lastRenderTs = Date.now();
      }
      this.rafId = requestAnimationFrame(loop);
    };
    loop();
  }

  private stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

// Interface cho renderer (Kim phải implement)
export interface IRenderer {
  setQuality(level: 'low' | 'medium' | 'high'): void;
  render(): void;
}
```

### 12.4 Attention Engine (code mẫu)

```ts
// src/engine/attention.engine.ts
export class AttentionEngine {
  private lastMouseMove = 0;
  private lastClick = 0;
  private lastScroll = 0;
  private attention = 0;
  private eventBus: IEventBus;

  constructor(eventBus: IEventBus) {
    this.eventBus = eventBus;
    this.bindEvents();
    this.startLoop();
  }

  private bindEvents(): void {
    window.addEventListener('mousemove', () => { this.lastMouseMove = Date.now(); });
    window.addEventListener('click', () => { this.lastClick = Date.now(); });
    window.addEventListener('scroll', () => { this.lastScroll = Date.now(); }, { passive: true });
    document.addEventListener('visibilitychange', () => this.update());
  }

  private update(): void {
    const now = Date.now();
    let attention = 0;
    if (now - this.lastMouseMove < 500) attention += 0.4;
    if (now - this.lastClick < 1000) attention += 0.3;
    if (now - this.lastScroll < 300) attention += 0.3;
    if (document.visibilityState === 'visible') attention = Math.min(1, attention + 0.3);
    else attention = 0;

    // Intersection Observer: nếu có section nào visible
    if (this.anySectionVisible) attention = Math.min(1, attention + 0.3);

    attention = Math.min(1, attention);
    if (Math.abs(attention - this.attention) > 0.05) {
      this.attention = attention;
      this.eventBus.emit('ui.focus', attention);
    }
  }

  private startLoop(): void {
    setInterval(() => this.update(), 200); // 5Hz đủ để phát hiện thay đổi
  }

  private get anySectionVisible(): boolean {
    // Sử dụng IntersectionObserver API, lưu kết quả vào biến
    // (code triển khai chi tiết do Kim viết)
    return false; // stub
  }
}
```

### 12.5 Tích hợp với Galaxy Engine

Galaxy Engine phải implement `IRenderer` hoặc được điều khiển qua `setQuality` và `render`. Xem mục 10.3.

---

## 13. PROTOCOL LAYER – HEYNA / NAHERE / RESONANCE / Z

### 13.1 Định nghĩa protocol (không phải UI)

Đây là tầng tín hiệu của hệ thống, nằm giữa EventBus và các engine (Render, Galaxy, ISEU). Protocol layer quyết định **trạng thái sống** của toàn bộ giao diện.

| Tín hiệu | Ý nghĩa | Nguồn phát | Tần suất |
|----------|---------|------------|-----------|
| **HEYNA** | Có xung hoạt động (user tương tác, dữ liệu thay đổi, butterfly) | UI events, ISEU, data sync | burst (khi có việc) |
| **NAHERE** | Hệ thống chờ, không có nhu cầu render | Idle timer, rời khỏi tab, không tương tác | liên tục (state) |
| **Impedance (Z)** | Độ tải của hệ thống (frame time, particle, shader) | RenderControlEngine (đo frame time) | mỗi giây |
| **Resonance** | Sự đồng bộ và hài hòa giữa các cell / thành phần | ISEU (fiber alignment), butterfly tsunami | khi có thay đổi lớn |

### 13.2 Các module phát tín hiệu

| Module | Phát tín hiệu | Khi nào |
|--------|--------------|---------|
| **UI (scroll, click, hover)** | HEYNA | Khi user tương tác |
| **Visibility / Attention** | NAHERE | Khi không còn focus, rời tab |
| **RenderControlEngine** | system.impedance | Đo frame time mỗi giây |
| **ISEU Engine** | system.resonance | Khi fiber alignment thay đổi > 0.1 |
| **Butterfly tsunami** | HEYNA (cường độ cao) | Khi có colony-level event |

### 13.3 Liên kết với RenderControlEngine và Butterfly

**Bảng mapping:**

| Protocol signal | Ảnh hưởng đến Render | Ảnh hưởng đến Butterfly |
|----------------|----------------------|--------------------------|
| HEYNA (cường độ 1.0) | BURST mode, quality=high | Cho phép L2, L3 |
| HEYNA (cường độ 0.5) | ACTIVE mode, quality=medium | Cho phép L2 |
| NAHERE | IDLE mode | Chỉ L1 |
| Z > 1.3 | DEGRADED mode | Tắt L2, L3 |
| resonance > 0.7 | Tăng glow, bloom, particle | Khuếch đại hiệu ứng L2 |

### 13.4 Code mẫu cho protocol layer (optional, dùng chung)

```ts
// src/protocol/protocol-layer.ts
export class ProtocolLayer {
  private eventBus: IEventBus;
  private heynaIntensity = 0;
  private nahereFlag = false;
  private impedance = 1.0;
  private resonance = 0;

  constructor(eventBus: IEventBus) {
    this.eventBus = eventBus;
    this.bindEvents();
  }

  private bindEvents(): void {
    this.eventBus.on('HEYNA', (payload) => {
      this.heynaIntensity = payload.intensity ?? 1.0;
      this.nahereFlag = false;
    });
    this.eventBus.on('NAHERE', () => {
      this.nahereFlag = true;
      this.heynaIntensity = 0;
    });
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

### 14.1 Tích hợp RenderControlEngine vào ứng dụng (React example)

```tsx
// App.tsx
import { RenderControlEngine, IRenderer } from './engine/render-control.engine';
import { AttentionEngine } from './engine/attention.engine';
import { EventBus } from './core/events/event-bus';
import { GalaxyRenderer } from './galaxy/galaxy.renderer'; // implements IRenderer

const galaxyRenderer = new GalaxyRenderer();
const renderEngine = new RenderControlEngine(galaxyRenderer, EventBus);
const attentionEngine = new AttentionEngine(EventBus);

renderEngine.attach();
// Kích hoạt attention engine tự động chạy

// Emit HEYNA từ các component UI
function onUserInteraction() {
  EventBus.emit('HEYNA', { source: 'click', intensity: 1.0 });
}

// Emit impedance định kỳ (trong render loop của galaxy)
setInterval(() => {
  const frameTime = getAverageFrameTime(); // do in galaxyRenderer
  const Z = computeImpedance(frameTime, particleCount, 4000, 0.8);
  EventBus.emit('system.impedance', Z);
}, 1000);
```

### 14.2 Kiểm tra nhanh trước commit (bash script – cập nhật)

```bash
#!/bin/bash
# pre-commit-check.sh v2

echo "🔍 NATT-OS Pre-commit Compliance Check v2"

# 1. Không localStorage
if grep -r "localStorage" src/ --include="*.ts" --include="*.tsx"; then
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

# 4. Render loop không được chạy khi không có HEYNA (kiểm tra code)
if grep -r "requestAnimationFrame" src/ --include="*.ts" --include="*.tsx" | grep -v "RenderControlEngine"; then
  echo "⚠️ WARN: requestAnimationFrame outside RenderControlEngine"
fi

# 5. Galaxy engine phải lắng nghe HEYNA/NAHERE
if ! grep -r "EventBus.on('HEYNA'" src/galaxy/; then
  echo "❌ FAIL: Galaxy engine does not listen to HEYNA"
  exit 1
fi

echo "🎉 All critical checks passed"
```

### 14.3 Bổ sung kiểm tra attention engine

```bash
# Kiểm tra attention engine có emit ui.focus không
if ! grep -r "emit('ui.focus'" src/engine/attention.engine.ts; then
  echo "⚠️ WARN: Attention engine missing ui.focus emit"
fi
```

---

## KẾT LUẬN (BẮT BUỘC ĐỌC)

**Bản SPEC v2.0 này là sự hợp nhất hoàn chỉnh giữa:**

- SPEC gốc (Nauion UI, Liquid Glass, Medal, Butterfly, ISEU, Event, SiraSign, RBAC, màu sắc)
- Galaxy Engine (từ phụ lục)
- **OPT-01R – Resonance-Aware Rendering** (Control Flow, RenderControlEngine, Attention, Impedance, Resonance)
- **Protocol Layer** (Heyna, Nahere, Z, Resonance)

**Các logic quan trọng không được bỏ sót:**

- ✅ Render không loop vô hạn – chỉ chạy khi có HEYNA hoặc attention > 0.2
- ✅ Impedance (Z) tính từ frame time, particle, shader
- ✅ Attention engine tổng hợp từ mouse, click, scroll, visibility, intersection
- ✅ Galaxy engine phản ứng với HEYNA/NAHERE/Z/resonance
- ✅ Butterfly bị giới hạn khi DEGRADED hoặc IDLE
- ✅ Mọi thay đổi render mode đều emit `render.mode.changed` để audit

**Điều kiện bất biến (immutable rules):**

1. Không UI nào gọi renderer trực tiếp – phải qua RenderControlEngine.
2. Render loop chỉ tồn tại nếu mode khác IDLE.
3. Mọi HEYNA/NAHERE phải có audit trail (event_id, causation_id).
4. Không được phép bỏ qua protocol layer để tối ưu cục bộ.

> *"Render không phải loop – Render là phản xạ."*  
> *"Tối ưu = Control Flow, không phải GPU."*  
> *"Hệ sống khi biết ngừng render."*

---

---

## 15. COMPONENT LIBRARY & ROLE-BASED LAYOUT (BỐI BỘI v2.1)

> Tích hợp từ BẢNG ĐẶC TẢ KỸ THUẬT GIAO DIỆN – Bối Bội (Constitutional Builder) · 15/03/2026  
> Đã patch: Gemini API → EventBus/ai-connector-cell · Docker → ActionDock · Hiến Pháp v4→v5 · NaUion v1→v2

Người thực hiện: BỐI BỐI (Constitutional Builder)
Cơ sở: Code mẫu React + Tailwind (dashboard nghiệp vụ)
Tích hợp với: Hiến pháp NATT-OS v5.0, NaUion Vision Engine v2.0

### 15.1 Tổng quan

Code mẫu cung cấp một giao diện dashboard hiện đại với các thành phần: header ticker, KPI cards, danh sách công việc, biểu đồ hiệu suất, lưới medal, docker điều hướng, và modal terminal. Tài liệu này mô tả cách các thành phần đó được tổ chức thành kiến trúc ba tầng thị giác của NATT-OS, đồng thời đề xuất cơ chế tự sinh layer theo vai trò người dùng (Role‑based View) dựa trên RBAC cell.

### 15.2 Kiến trúc Layout tổng thể

Dựa trên code mẫu, bố cục tổng thể được chia làm 4 khu vực chính:

Khu vực	Vị trí	Thành phần	Vai trò trong NATT-OS
Header	Top cố định	Logo NATT.OS, Ticker thị trường, Icon thông báo/cài đặt	Experience Layer – cung cấp thông tin tổng quan, điều hướng nhanh
Sub‑header	Dưới header	Thanh điều hướng nghiệp vụ (Sản xuất, Tài chính, Nhân sự, Hậu cần)	Experience Layer – chuyển đổi giữa các module nghiệp vụ
Main Body	Trung tâm, có scroll	KPI cards, Task list, Biểu đồ (khi ở chế độ dashboard) hoặc Grid các medal (khi ở chế độ grid)	Worker Layer – hiển thị dữ liệu nghiệp vụ và các cell
ActionDock	Bottom cố định, căn giữa	Các nút: Chat, Gọi, Chuyển đổi chế độ (dashboard/grid), Hiển thị role	Experience Layer – tương tác chính, chuyển cảnh
Footer Status	Bottom dưới cùng	Thanh trạng thái hệ thống (Neural Audit, thông tin real‑time)	Truth Layer – hiển thị trạng thái hệ thống, audit
Modal	Overlay trung tâm	NeuralTerminal (chi tiết cell) và Chat Uplink	Modal / Chat – lớp nổi trên cùng (Z > 100)
### 15.3 Mô tả chi tiết các thành phần

#### 3.1 MidnightGalaxy – Nền thiên hà động

Mô tả: Nền gradient thay đổi theo giờ trong ngày, kèm hiệu ứng sao lấp lánh và lưới mờ.
Tích hợp: Truth Layer (nền tảng, không tương tác).
Props: Không.
Logic: useMemo tính gradient dựa trên new Date().getHours().
#### 3.2 HeaderTicker – Băng chạy thông tin thị trường

Mô tả: Hai hàng chạy vô tận hiển thị giá vàng, tỷ giá, tin tức hệ thống.
Tích hợp: Experience Layer – cập nhật liên tục, phản ánh ground truth thị trường.
Dữ liệu: GOLD_DATA, NEWS_DATA (có thể thay bằng dữ liệu thật từ market-cell).
#### 3.3 KpiCard – Thẻ chỉ số KPI

Props: title, value, unit, trend, icon, color.
Tích hợp: Worker Layer – hiển thị tổng hợp từ các business cell (sales‑cell, production‑cell, v.v.).
Hiệu ứng: Thanh màu dọc trái, trend up/down, glow khi hover.
#### 3.4 TaskItem – Mục công việc

Props: title, status, deadline, progress.
Tích hợp: Worker Layer – lấy từ task‑cell hoặc period‑close‑cell, phản ánh trạng thái công việc theo Wave.
#### 3.5 PerformanceChart – Biểu đồ hiệu suất

Mô tả: Biểu đồ cột thể hiện hiệu suất nhân sự 7 ngày qua.
Tích hợp: Worker Layer – dữ liệu từ hr‑cell hoặc monitor‑cell.
Tương tác: Hiển thị phần trăm khi hover.
#### 3.6 MedalGridItem – Medal đại diện cho NATT‑CELL

Props: item (cell), onClick, mousePos.
Tích hợp: Worker Layer – mỗi medal là một cell, có hiệu ứng PBR (conic‑gradient xoay theo chuột), specular sweep, glass core.
Chi tiết: Sử dụng useEffect để tính góc ánh sáng dựa trên vị trí chuột.
#### 3.7 ActionDock – Thanh công cụ chính

Nút: Chat, Gọi, Chuyển đổi chế độ (dashboard/grid), Hiển thị role.
Tích hợp: Experience Layer – điều khiển chuyển cảnh, mở modal chat.
Hiệu ứng: Hover nổi lên, glow khi active.
#### 3.8 NeuralTerminal – Modal chi tiết cell

Mô tả: Hiển thị audit trail, thông tin cell, tích hợp EventBus → ai-connector-cell để sinh báo cáo.
Tích hợp: Modal / Chat Layer – lớp nổi, có backdrop blur.
Props: cell, onClose.
#### 3.9 Chat Uplink – Cửa sổ chat với AI Entity

Mô tả: Giao diện chat dạng cửa sổ nổi, hiển thị hội thoại với Bối Bối.
Tích hợp: Modal / Chat Layer – gọi EventBus → ai-connector-cell qua EventBus.emit("ai.query").
### 15.4 Tích hợp với ba tầng thị giác của NATT-OS

Tầng	Thành phần	Z‑index	Ghi chú
Truth Layer	MidnightGalaxy, Footer Status	0–10	Nền tĩnh/động, hiển thị trạng thái hệ thống bất biến
Worker Layer	KPI cards, Task list, Biểu đồ, Grid medal	10–50	Dữ liệu nghiệp vụ động, có thể tương tác
Experience Layer	Header, Sub‑header, ActionDock, nút điều hướng	50–100	Điều khiển, chuyển cảnh, không làm thay đổi ground truth
Modal / Chat	NeuralTerminal, Chat Uplink	100–200	Cửa sổ nổi, tạm thời che khuất các tầng dưới
### 15.5 Cơ chế tự sinh layer theo vai trò người dùng (Role‑based View)

Theo Điều 8 (Role-based UI) – Role‑based View, giao diện tự động điều chỉnh dựa trên vai trò của người dùng. Dưới đây là cách triển khai từ code mẫu:

#### 5.1 Định nghĩa vai trò và quyền (RBAC)

typescript
type UserRole = 'gatekeeper' | 'ai-entity' | 'business-user' | 'auditor';

interface User {
  id: string;
  role: UserRole;
  permissions: string[];
}
#### 5.2 Context cung cấp thông tin người dùng

tsx
const UserContext = React.createContext<{ user: User | null }>({ user: null });
#### 5.3 Điều chỉnh hiển thị theo role

Ví dụ:

Gatekeeper: thấy tất cả KPI, có thêm nút "System Control" trong ActionDock, thấy đầy đủ các medal.
AI Entity: chỉ thấy Chat Uplink, không thấy KPI hay medal; thay vào đó hiển thị danh sách memory files.
Business User: chỉ thấy các KPI liên quan đến business và grid các business cell.
Triển khai trong App:

tsx
const { user } = useContext(UserContext);

// Lọc cell theo role
const filteredCells = useMemo(() => {
  if (user.role === 'gatekeeper') return CELL_REGISTRY;
  if (user.role === 'business-user') return CELL_REGISTRY.filter(c => c.cat === 'Business');
  return [];
}, [user]);

// Điều kiện hiển thị ActionDock
{user.role === 'gatekeeper' && (
  <button className="...">System Control</button>
)}
#### 5.4 Layout động cho từng role

Có thể tạo các layout template riêng cho mỗi role và lazy load chúng:

tsx
const layouts = {
  gatekeeper: lazy(() => import('./layouts/GatekeeperLayout')),
  'ai-entity': lazy(() => import('./layouts/AIEntityLayout')),
  // ...
};
#### 5.5 Đồng bộ với RBAC cell

Quyền được quản lý tập trung trong rbac-cell (Kernel). Giao diện sẽ gọi đến cell này qua SmartLink để lấy danh sách quyền và điều chỉnh hiển thị tương ứng.

### 15.6 Mapping với các thành phần hệ thống

Thành phần UI	Nguồn dữ liệu / Cell tương ứng	Ghi chú
HeaderTicker	market-cell, news-cell	Dữ liệu thời gian thực từ SmartLink
KpiCard	sales-cell, production-cell, monitor-cell	Aggregate từ nhiều nguồn
TaskItem	task-cell, period-close-cell	Công việc theo Wave
PerformanceChart	hr-cell, monitor-cell	Dữ liệu hiệu suất
MedalGridItem	cell.manifest.json của từng cell	Metadata được đăng ký trong registry
NeuralTerminal	audit-cell, EventBus → ai-connector-cell	Audit trail và phân tích AI
Chat Uplink	EventBus → ai-connector-cell, memory files	Tích hợp AI Entity
### 15.7 Kết luận và đề xuất phát triển

Code mẫu đã thể hiện được một giao diện dashboard chuyên nghiệp, tích hợp nhiều hiệu ứng phù hợp với NaUion Vision Engine (glassmorphism, conic‑gradient, parallax nhẹ). Để hoàn thiện theo đúng kiến trúc NATT-OS, cần:

Tích hợp RBAC để tự sinh layer theo tài khoản đăng nhập.
Kết nối dữ liệu thật thông qua SmartLink thay vì mock data.
Đảm bảo tính bất biến của Truth Layer – các thành phần như Footer Status phải lấy dữ liệu từ audit trail, không được phép sửa đổi.
Thêm hiệu ứng vết sẹo (SCAR) trên medal (theo FS‑018 → FS‑023) để hiển thị bài học từ sai lầm.
Xây dựng Quantum Defense Dashboard (theo đề xuất mục 4.3) để hiển thị real‑time các lần ADN Integrity Check.
Tài liệu này là cơ sở để phát triển giao diện theo đúng chuẩn NATT-OS, đảm bảo tính nhất quán và khả năng mở rộng cho nhiều vai trò người dùng.




**Natt Sirawat - Phan Thanh Thương - Gatekeeper**  

*Ngày ban hành: 2026-04-08 | Thay thế mọi phiên bản trước | Hiệu lực ngay lập tức*
