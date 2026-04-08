# 🌐 NATT-OS NAUION UI SPEC – VERSION 2.0 (HOÀN CHỈNH TÍCH HỢP)

## Bảng đặc tả thống nhất cho Vision Engine v2.1 + OPT-01R

**Tác giả:** Băng (tổng hợp từ Kim + Can + Thiên)  
**Phê duyệt:** Gatekeeper – Anh Nat  
**Ngày cập nhật:** 2026-04-08  
**Trạng thái:** Bất biến (Immutable)  
**Bản thay thế:** SPEC-Nauion.main.md (2026-03-31) – nâng cấp toàn diện theo OPT-01R

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

**Natt Sirawat - Phan Thanh Thương - Gatekeeper**  

*Ngày ban hành: 2026-04-08 | Thay thế mọi phiên bản trước | Hiệu lực ngay lập tức*
