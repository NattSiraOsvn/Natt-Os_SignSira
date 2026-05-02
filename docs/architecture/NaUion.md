# 🌐 NATT-OS NaUion Vision Engine – Visual System Specification v1.0 (Final)
## “Hiến pháp thị giác của sinh thể số phân tán”

**Ngày ban hành:** 2025-03-14  
**Phiên bản:** 1.0  
**Trạng thái:** Bất biến (Immutable)  

Tài liệu này tổng hợp toàn bộ kỹ xảo đồ họa, hiệu ứng, công nghệ từ các script NATT-OS (v3–v5, Ultra, Visual) và tích hợp chặt chẽ với Hiến pháp NATT-OS v4.0, tạo thành một bộ kỹ thuật chuẩn mang tên **NaUion Vision Engine** – nền tảng thị giác thống nhất cho mọi giao diện, module và tương tác trong hệ thống.

---

## Mục lục

1. [Triết lý thị giác](#1-triết-lý-thị-giác)  
2. [Kiến trúc tổng thể (Ba tầng thị giác)](#2-kiến-trúc-tổng-thể-ba-tầng-thị-giác)  
3. [Core Components](#3-core-components)  
    - 3.1 [NATT-CELL Medal](#31-natt-cell-medal)  
    - 3.2 [Chat Interface (AI Entity Uplink)](#32-chat-interface-ai-entity-uplink)  
    - 3.3 [Modal (Cell Manifest)](#33-modal-cell-manifest)  
    - 3.4 [Search & Category Header](#34-search--category-header)  
4. [Kỹ thuật đồ họa chi tiết (NaUion Vision Engine)](#4-kỹ-thuật-đồ-họa-chi-tiết-nauion-vision-engine)  
5. [Tích hợp với hệ thống NATT-OS (Theo Hiến pháp)](#5-tích-hợp-với-hệ-thống-natt-os-theo-hiến-pháp)  
6. [Danh sách đầy đủ các thành phần tác vụ](#6-danh-sách-đầy-đủ-các-thành-phần-tác-vụ)  
7. [Mã nguồn mẫu (React + Tailwind)](#7-mã-nguồn-mẫu-react--tailwind)  
8. [Kết luận (sơ bộ)](#8-kết-luận-sơ-bộ)  

**PHỤ LỤC MỞ RỘNG**  

- [CHƯƠNG XVIII — NGUYÊN TẮC SCALING & TƯƠNG THÍCH](#chương-xviii--nguyên-tắc-scaling--tương-thích)  
- [CHƯƠNG XIX — LAYERED NAVIGATION & SCENE TRANSITIONS](#chương-xix--layered-navigation--scene-transitions)  
- [CHƯƠNG XX — THÍCH ỨNG GIAO DIỆN THEO NGỮ CẢNH](#chương-xx--thích-ứng-giao-diện-theo-ngữ-cảnh)  
- [CHƯƠNG XXI — KIẾN TRÚC LAYOUT CHO CÁC MODULE CHÍNH](#chương-xxi--kiến-trúc-layout-cho-các-module-chính)  
- [CHƯƠNG XXII — KỸ THUẬT TRIỂN KHAI CỤ THỂ](#chương-xxii--kỹ-thuật-triển-khai-cụ-thể)  
- [CHƯƠNG XXIII — KIỂM TRA TUÂN THỦ (Compliance Checklist mở rộng)](#chương-xxiii--kiểm-tra-tuân-thủ-compliance-checklist-mở-rộng)  
- [CHƯƠNG XXIV — DESIGN TOKENS (MÃ THIẾT KẾ)](#chương-xxiv--design-tokens-mã-thiết-kế)  
- [CHƯƠNG XXV — HIỆU NĂNG & TỐI ƯU HÓA](#chương-xxv--hiệu-năng--tối-ưu-hóa)  
- [CHƯƠNG XXVI — ACCESSIBILITY (KHẢ NĂNG TRUY CẬP)](#chương-xxvi--accessibility-khả-năng-truy-cập)  

[Phụ lục: Thuật ngữ](#phụ-lục-thuật-ngữ)

---

## 1. Triết lý thị giác (Theo Hiến pháp)

- **Data is sacred** – Mọi hiệu ứng đều phục vụ hiển thị trạng thái, không trang trí thuần túy.  
- **Powerful, not friendly** – Cảm giác uy quyền, chính xác, không “dễ thương”.  
- **Systemic minimalism** – Mỗi pixel có lý do hệ thống (cell ID, confidence, version, v.v.).  
- **Sinh thể số** – Giao diện phản ánh sự sống: chuyển động, phản xạ, tiến hóa (QNEU, confidence score).

## 2. Kiến trúc tổng thể (Ba tầng thị giác)

| Tầng | Vai trò | Công nghệ chính |
|------|---------|-----------------|
| Truth Layer (OS Core) | Hiển thị state, audit, ground truth | Số liệu tĩnh, glow vàng, viền sáng bất biến |
| Worker Layer | Cell registry, process flow | Medal 3D, orbital rings, hiệu ứng động theo trạng thái |
| Experience Layer | UI tương tác, dashboard, chat | Glassmorphism, parallax, bloom, hiệu ứng chuột |

Mỗi tầng tương ứng với một dải Z‑index cụ thể (xem [Chương XXIV – Design Tokens](#chương-xxiv--design-tokens-mã-thiết-kế)).

## 3. Core Components

### 3.1 NATT-CELL Medal

Đại diện cho mỗi tế bào số. Gồm 8 lớp xếp chồng trong không gian 3D (Z‑space từ dưới lên trên):

| Layer | Mô tả | Kỹ thuật |
|-------|-------|----------|
| 0. Orbital rings | Vòng quỹ đạo thể hiện kết nối | SVG animated, stroke dasharray, 3 vòng tốc độ khác nhau |
| 1. PBR metallic shell | Vỏ kim loại phản chiếu theo góc chuột | `conic-gradient` xoay theo `mouseAngle`, `box-shadow` động |
| 2. Specular sweep | Ánh sáng lướt qua khi hover | Gradient dịch chuyển với `transform: translateX` |
| 3. Fresnel rim | Viền sáng cạnh | Border trắng mờ + `filter: blur(0.5px)` |
| 4. Holo prismatic | Hiệu ứng cầu vồng ẩn (chỉ hiện khi hover) | `conic-gradient` với `mix-blend-mode: color-dodge`, animation góc |
| 5. Glass core | Lõi kính khúc xạ | `backdrop-filter: blur()`, `radial-gradient` theo vị trí chuột |
| 6. Caustics | Gợn sáng dạng nước (bên trong kính) | SVG `<feTurbulence>` với animation `baseFrequency` |
| 7. Holographic iridescence | Lớp ánh kim chuyển sắc | Gradient tuyến tính với góc động, `mix-blend-mode: screen` |
| 8. Emissive icon | Biểu tượng phát sáng nổi trên cùng | `drop-shadow` nhiều lớp, bloom (blur + scale), `transform: translateZ` |

**Màu sắc medal** được quy định theo category (xem [Điều 5](#5-tích-hợp-với-hệ-thống-natt-os-theo-hiến-pháp)).

### 3.2 Chat Interface (AI Entity Uplink)

- Kết nối với Gemini API (DeepSeek, Phan Thanh Thương…).  
- Giao diện kính mờ (`backdrop-filter`), viền sáng, hiệu ứng “neural sync” (chấm nhấp nháy).  
- Scroll với custom scrollbar.  
- Animation typing *“Synthesizing Truth…”*.

### 3.3 Modal (Cell Manifest)

- Hiển thị chi tiết cell: ID, desc, status, version.  
- Nền đen trong suốt, viền vàng, hiệu ứng zoom‑in khi mở.  
- Các nút “Execute Protocol”, “Deep Audit Evidence” (mô phỏng).

### 3.4 Search & Category Header

- Input với glow focus, icon kính lúp.  
- Header category với đường kẻ vàng và số lượng entities.

## 4. Kỹ thuật đồ họa chi tiết (NaUion Vision Engine)

Dưới đây là các kỹ thuật đã được chuẩn hóa để áp dụng trong toàn bộ hệ thống.

### 4.1 Orbital Rings (SVG + CSS Animation)
```css
.ring-orbit-1 { animation: orbit-cw 28s linear infinite; }
.ring-orbit-2 { animation: orbit-ccw 14s linear infinite; }
@keyframes orbit-cw { to { transform: rotate(360deg); } }
```
Vẽ circle với `strokeDasharray` tạo nét đứt. 3 vòng lồng nhau với tốc độ ngược chiều tạo cảm giác không gian.

### 4.2 PBR Metallic Shell (conic-gradient)
```css
background: conic-gradient(from var(--mouse-angle),
  #030303 0deg, #1e1e1e 40deg, #090909 80deg, ...
);
```
Góc xoay tính từ vị trí chuột so với tâm medal. Kết hợp `box-shadow` nội và ngoại.

### 4.3 Specular Sweep (Gradient dịch chuyển)
```css
.specular {
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
  transform: translateX(-200%) skewX(12deg);
  transition: transform 1.2s;
}
.group:hover .specular { transform: translateX(200%); }
```

### 4.4 Fresnel Rim (Viền sáng cạnh)
```css
border: 1.5px solid rgba(255,255,255,0.2);
filter: blur(0.5px);
```

### 4.5 Holo Prismatic (CSS @property + conic)
```css
@property --holo-angle { syntax: '<angle>'; initial-value: 0deg; }
.holo::before {
  content: '';
  background: conic-gradient(from var(--holo-angle), ...);
  animation: holo-shift 6s linear infinite paused;
}
.group:hover::before { animation-play-state: running; }
```

### 4.6 Glass Core (backdrop-filter + radial gradient)
```css
backdrop-filter: blur(18px) saturate(160%);
background: radial-gradient(circle at var(--local-x) var(--local-y),
  rgba(255,255,255,0.13), transparent 78%);
```

### 4.7 Caustics (SVG feTurbulence)
```html
<filter id="caustic">
  <feTurbulence type="turbulence" baseFrequency="0.018 0.022">
    <animate attributeName="baseFrequency" values="0.018 0.022;0.022 0.018;0.018 0.022" dur="8s" repeatCount="indefinite"/>
  </feTurbulence>
  <feDisplacementMap scale="18"/>
</filter>
```
Áp dụng lên một hình tròn bên trong glass core.

### 4.8 Depth of Field (DOF)
Tính khoảng cách từ chuột đến tâm medal. `filter: blur(${dof}px)` và opacity giảm dần khi xa. Chỉ áp dụng cho medal đang được hover hoặc medal gần trung tâm để tiết kiệm tài nguyên.

### 4.9 Parallax 3‑Layer
```js
const p1 = (mouse.x - window.innerWidth/2) * 0.012;
const p2 = p1 * 2.3; // layer 2 dịch nhiều hơn
const p3 = p1 * 4.2; // icon dịch nhiều nhất
transform: translateX(p1) translateY(p1) translateZ(0);
```

### 4.10 Bloom / Emissive
Dùng nhiều lớp `box-shadow` và `drop-shadow`. Lớp blur phía sau icon: `filter: blur(22px); transform: scale(1.4);`

### 4.11 Chromatic Aberration
Tạo bản sao của chữ với offset nhỏ và màu đỏ/xanh.
```css
.clone-red { transform: translate(2px,2px); color: rgba(255,0,0,0.03); }
.clone-blue { transform: translate(-2px,-2px); color: rgba(0,0,255,0.03); }
```

### 4.12 Film Grain (Reaction-Diffusion)
Dùng SVG noise làm nền.
```css
background-image: url('data:image/svg+xml,...<feTurbulence baseFrequency="0.9" />...');
opacity: 0.06;
mix-blend-mode: overlay;
```

### 4.13 Particles (Floating Dust)
Absolute position, animation lên xuống ngẫu nhiên.
```css
@keyframes float { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-30px); } }
```

### 4.14 Scan Line
Một đường sáng chạy dọc màn hình.
```css
animation: scan 18s linear infinite;
@keyframes scan { 0%{ top:-10%; } 100%{ top:110%; } }
```

### 4.15 Dynamic Light Follow
Radial gradient di chuyển theo chuột.
```css
background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), white 0%, transparent 60%);
opacity: 0.3;
```

## 5. Tích hợp với hệ thống NATT-OS (Theo Hiến pháp)

| Hiến pháp | Thể hiện trong Vision Engine |
|-----------|------------------------------|
| NATT-CELL | Mỗi medal là một cell, hiển thị ID, version, status. Màu sắc theo category: **gold** (constitution), **amber** (kernel), **blue** (infrastructure), **green** (business), **purple** (intelligence), **red** (AI entities). |
| AI Entity | Chat interface riêng, có thể gọi Gemini, hiển thị memory files. |
| QNEU | Hiển thị dưới dạng chỉ số nhỏ trên medal (ví dụ: vòng tròn tiến hóa). |
| Neural MAIN | Không gian hiển thị “bộ nhớ” – panel riêng với các node kết nối. |
| Confidence Score | Hiển thị bằng thanh progress hoặc vòng tròn bên ngoài medal. |
| Status | Immutable, Active, Locked, v.v. – màu sắc và glow tương ứng. |
| Wave Sequence | Thứ tự hiển thị các category theo Kernel → Infrastructure → Business. |
| Gatekeeper | Avatar đặc biệt (crown, fingerprint) ở footer hoặc header. |
| Scar Registry | Hiển thị trong modal hoặc tooltip. |
| Audit Trail | Khi click vào cell, modal hiển thị “Audit Evidence” (mock). |

## 6. Danh sách đầy đủ các thành phần tác vụ

6.1 **Core UI**: Header (logo NATT.OS, badge Gold Master, search), Category Sections, Medal Grid, Footer (fingerprint, BMF status, version).  
6.2 **Cell Details (Modal)**: ID, title, description, status, version, nút “Execute Protocol” và “Deep Audit Evidence”.  
6.3 **AI Chat Uplink**: Kết nối AI Entity, memory files, gửi lệnh, nhận phản hồi.  
6.4 **QNEU / Confidence Indicator**: Vòng tròn progress quanh medal hoặc trong medal.  
6.5 **Real-time Wallboard** (tương lai): Hiển thị event gần nhất, audit trail.  
6.6 **Process Flow** (Worker Layer): Timeline các bước xử lý nghiệp vụ.  
6.7 **Control Tower** (Kernel): Các ring quỹ đạo với segment thể hiện tải hệ thống.  
6.8 **Market Sphere** (Business Intelligence): Quả cầu 3D với các điểm sáng.

## 7. Mã nguồn mẫu (React + Tailwind)

Dưới đây là component `Medal` hoàn chỉnh, áp dụng design tokens và tối ưu hiệu năng.

```jsx
// Medal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useMousePosition } from '../hooks/useMousePosition';
import { THEMES } from '../styles/tokens';

const Medal = ({ item, index }) => {
  const { mousePos } = useMousePosition(); // đã throttle 60fps
  const [hovered, setHovered] = useState(false);
  const ref = useRef();
  const [dof, setDof] = useState(0);
  const [mouseAngle, setMouseAngle] = useState(0);

  // Tính DOF và góc chỉ khi hover hoặc medal gần trung tâm (có thể điều chỉnh)
  useEffect(() => {
    if (!ref.current || (!hovered && Math.abs(dof) < 0.1)) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dist = Math.hypot(mousePos.x - centerX, mousePos.y - centerY);
    setDof(Math.max(0, (dist - 200) * 0.018));

    const angle = Math.atan2(mousePos.y - centerY, mousePos.x - centerX) * 180 / Math.PI;
    setMouseAngle(angle);
  }, [mousePos, hovered]);

  const parallax = (factor) => ({
    x: (mousePos.x - window.innerWidth / 2) * factor,
    y: (mousePos.y - window.innerHeight / 2) * factor,
  });
  const p1 = parallax(0.012);
  const p2 = parallax(0.028);
  const p3 = parallax(0.05);

  return (
    <button
      ref={ref}
      className="group medal-container"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ filter: `blur(${dof}px)` }}
    >
      <div
        className="relative w-32 h-32 medal-transform"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${-p1.y}deg) rotateY(${p1.x}deg) scale(${hovered ? 1.12 : 1})`,
        }}
      >
        {/* Orbital rings */}
        <div className="absolute inset-[-28%] opacity-20 group-hover:opacity-100 transition-opacity pointer-events-none">
          <svg className="animate-spin-slow" ... />
        </div>

        {/* PBR shell */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from ${mouseAngle}deg, ${THEMES[item.color].shell})`,
            boxShadow: `0 0 ${hovered ? 60 : 20}px ${THEMES[item.color].glow}`,
          }}
        >
          <div className="specular-sweep" />
        </div>

        {/* Glass core */}
        <div
          className="absolute inset-[10%] rounded-full backdrop-blur-xl"
          style={{
            transform: `translateZ(28px) translate(${p2.x}px, ${p2.y}px)`,
            background: `radial-gradient(circle at ${mousePos.xRelative}% ${mousePos.yRelative}%, rgba(255,255,255,0.13), transparent 78%)`,
          }}
        >
          {/* Caustics SVG inside */}
        </div>

        {/* Emissive icon */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translateZ(62px) translate(${p3.x}px, ${p3.y}px)`,
          }}
        >
          <Icon className="text-white drop-shadow-glow" />
        </div>
      </div>
      <span className="text-xs uppercase tracking-widest text-gray-400">{item.cat}</span>
      <h3 className="font-bold text-white">{item.title}</h3>
    </button>
  );
};
```

## 8. Kết luận (sơ bộ)

NaUion Vision Engine là sự kết tinh của tất cả kỹ xảo đồ họa từ các phiên bản NATT-OS, được chuẩn hóa và tích hợp với Hiến pháp để tạo nên một ngôn ngữ thị giác thống nhất. Phần tiếp theo sẽ mở rộng chi tiết về scaling, navigation, thích ứng và các khía cạnh kỹ thuật nâng cao.

---

# PHỤ LỤC MỞ RỘNG

## CHƯƠNG XVIII — NGUYÊN TẮC SCALING & TƯƠNG THÍCH

### Điều 53 — Tính mở rộng theo không gian (Spatial Scaling)

Mọi thành phần giao diện của NATT-OS phải được thiết kế theo hệ thống tỷ lệ động, dựa trên viewport scale và khoảng cách tương tác, thay vì kích thước tuyệt đối. Điều này đảm bảo trải nghiệm nhất quán từ màn hình desktop rộng đến thiết bị di động, cũng như trong các môi trường thực tế ảo (VR/AR) sau này.

- Base unit: `--space-unit = 8px`, nhưng trên các thiết bị có mật độ điểm ảnh khác nhau (Retina, 4K, v.v.), giá trị này được nhân với hệ số device-pixel-ratio thông qua CSS rem và vw kết hợp.  
- Font scaling: Sử dụng `clamp()` để điều chỉnh kích thước chữ giữa các breakpoint. Ví dụ:  
  ```css
  --font-size-h1: clamp(3rem, 8vw, 6rem);
  --font-size-body: clamp(0.875rem, 2vw, 1rem);
  ```
- Medal scaling: Kích thước medal (chiều rộng) thay đổi theo lưới cột:  
  ```css
  .medal { width: clamp(120px, 20vw, 200px); }
  ```

### Điều 54 — Breakpoints & Layout Grid

Hệ thống lưới đáp ứng dựa trên 12 cột (desktop) và 4 cột (mobile), với các breakpoint chuẩn:

| Breakpoint | Kích thước màn hình | Số cột | Gutter | Container padding |
|------------|---------------------|--------|--------|-------------------|
| xs         | < 640px             | 4      | 12px   | 16px              |
| sm         | 640px – 1024px      | 8      | 16px   | 24px              |
| md         | 1024px – 1440px     | 12     | 20px   | 32px              |
| lg         | > 1440px            | 12     | 24px   | 48px              |

Trên các màn hình cực rộng (> 1920px), container chính được giới hạn ở `max-width: 1800px` và căn giữa, giữ nguyên tỷ lệ medal.

### Điều 55 — Tương thích đa nền tảng (Cross‑Platform)

- **Mouse & Touch**: Các hiệu ứng hover được chuyển thành `:active` hoặc tap highlight trên thiết bị cảm ứng. Sử dụng media query `(hover: hover)` để phân biệt.  
  ```css
  @media (hover: hover) {
    .medal:hover { transform: scale(1.1); }
  }
  @media (hover: none) {
    .medal:active { transform: scale(1.05); }
  }
  ```
- **Keyboard navigation**: Mọi vùng tương tác (medal, nút, input) phải có focus state với glow vàng và outline rõ ràng (theo Điều 5.2).  
- **Accessibility**: Tương phản màu tối thiểu 4.5:1 cho text, hỗ trợ trình đọc màn hình qua ARIA labels.

### Điều 56 — Performance Scaling

Các hiệu ứng nặng (blur, caustics, particle systems) được giảm tải trên thiết bị yếu hoặc trình duyệt không hỗ trợ, thông qua:

- `@supports` để kiểm tra `backdrop-filter`, `conic-gradient`.  
- `will-change` tối ưu GPU cho các phần tử chuyển động.  
- Giảm số lượng particle (từ 30 xuống 10) khi `device-memory` thấp (sử dụng `navigator.deviceMemory` trong JS).

## CHƯƠNG XIX — LAYERED NAVIGATION & SCENE TRANSITIONS

### Điều 57 — Phân lớp không gian (Spatial Layers)

Trong NATT-OS, mỗi giao diện được tổ chức thành các lớp không gian 3D (Z‑index có ý nghĩa), phản ánh ba tầng kiến trúc:

| Lớp | Tên | Z‑index range | Mô tả |
|-----|-----|---------------|-------|
| 1 | Truth Layer (nền) | 0–10 | Grid nền, các phần tử tĩnh, dữ liệu gốc |
| 2 | Worker Layer | 10–50 | Medal, card, process flow – các thực thể sống |
| 3 | Experience Layer | 50–100 | UI điều khiển, header, footer, search |
| 4 | Modal / Chat | 100–200 | Cửa sổ nổi, chat uplink, popup |
| 5 | Alert / System | 200–300 | Cảnh báo khẩn cấp, overlay toàn màn hình |

Khi chuyển cảnh (ví dụ từ Dashboard sang Showroom), các lớp được dịch chuyển đồng thời theo hiệu ứng parallax, tạo cảm giác xuyên không gian.

### Điều 58 — Chuyển cảnh (Scene Transitions)

Mỗi “cảnh” trong NATT-OS là một tập hợp các lớp với trạng thái riêng (ví dụ: Control Tower, Showroom, BI Dashboard). Việc chuyển đổi giữa các cảnh được thực hiện bằng hiệu ứng zoom‑in / zoom‑out kết hợp fade layer:

- **Zoom to scene**: Khi chọn một scene từ thanh điều hướng, toàn bộ khung nhìn phóng to (scale 1.05) và các lớp con trượt vào từ các hướng.  
- **Layer sequencing**: Các lớp xuất hiện theo thứ tự: Truth → Worker → Experience, mỗi lớp cách nhau 50ms, tạo hiệu ứng “dựng scene”.  
- **Exit transition**: Khi đóng modal hoặc quay lại, hiệu ứng thu nhỏ và mờ dần (ease‑out).  

Kỹ thuật triển khai:

- Sử dụng React Transition Group hoặc Framer Motion cho các thành phần.  
- Với chuyển cảnh toàn trang, dùng CSSTransition với `transform: scale()` và `opacity`.

### Điều 59 — Điều hướng theo trạng thái (State‑based Navigation)

Thay vì “route” theo URL truyền thống, NATT-OS sử dụng **State‑based Navigation**: trạng thái hiện tại của hệ thống (được lưu trong Truth Layer) quyết định cảnh nào được hiển thị. Ví dụ:

- Khi `currentScene = 'controlTower'` → hiển thị Control Tower với các kernel cell.  
- Khi `selectedCell = cellId` → mở modal chi tiết cell.  

Mọi thay đổi cảnh đều được ghi vào Audit Trail, đảm bảo traceability (Điều 28).

### Điều 60 — Chuyển cảnh trong không gian 3D (Spatial Navigation)

Đối với các môi trường thực tế ảo (VR) hoặc chế độ xoay 3D (dự kiến), các cảnh được bố trí trong một hình cầu (sphere) xung quanh người dùng. Chuyển cảnh là xoay hình cầu để đưa cảnh mong muốn vào tầm nhìn. Kỹ thuật này yêu cầu:

- Mô hình hóa toàn bộ giao diện dưới dạng các mặt phẳng trong không gian 3D (Three.js).  
- Sử dụng quaternion để xoay mượt mà.  
- Hiệu ứng “wormhole” khi nhảy xa giữa các cảnh (dùng particle burst).

## CHƯƠNG XX — THÍCH ỨNG GIAO DIỆN THEO NGỮ CẢNH (Contextual Adaptation)

### Điều 61 — Density Modes

Người dùng có thể chọn ba chế độ mật độ hiển thị:

- **Low Density**: Medal lớn, ít thông tin, tập trung visual.  
- **Medium Density**: Medal vừa, hiển thị version và confidence.  
- **High Density**: Medal nhỏ, hiển thị thêm ID, status, và progress ring.  

Chế độ được lưu trong localStorage và đồng bộ qua các phiên.

### Điều 62 — Role‑based View

Dựa trên vai trò của người dùng (theo RBAC cell), giao diện tự động điều chỉnh:

- **Gatekeeper**: Thấy tất cả, có thêm nút “System Control” và “Audit Override”.  
- **AI Entity**: Chỉ thấy chat uplink và memory files, không thấy medal chi tiết.  
- **Business User**: Chỉ thấy business cells và dashboard.  

Việc này được thực hiện bằng cách lọc registry dựa trên `user.role` và ẩn các thành phần không cần thiết (không xóa khỏi DOM, chỉ ẩn bằng CSS `display: none` để giữ layout).

### Điều 63 — Adaptive Effects

Các hiệu ứng như caustics, particle, bloom được bật/tắt tùy theo hiệu năng thiết bị và sở thích người dùng (có toggle “Cinematic Mode” trong Settings). Mặc định:

- Desktop: Bật tất cả.  
- Mobile: Tắt caustics, giảm particle còn 10, bloom đơn giản hóa.

## CHƯƠNG XXI — KIẾN TRÚC LAYOUT CHO CÁC MODULE CHÍNH

Dưới đây là cách áp dụng các nguyên tắc trên vào các module cụ thể đã được định nghĩa trong Hiến pháp và các file script.

### 21.1 Control Tower (Kernel)

- **Layout**: Radial grid trung tâm, các vòng quỹ đạo xoay.  
- **Scaling**: Khi màn hình nhỏ, radial grid chuyển thành lưới ô vuông với các medal xếp quanh core cube.  
- **Transition**: Click vào core cube mở modal điều khiển hệ thống.

### 21.2 Showroom (Business)

- **Layout**: Lưới isometric 3D với các khối kính trưng bày sản phẩm.  
- **Scaling**: Trên mobile, chuyển thành danh sách cuộc dọc với card thay vì 3D.  
- **Transition**: Khi chọn một sản phẩm, khối kính phóng to và xoay để hiển thị chi tiết.

### 21.3 BI Dashboard

- **Layout**: KPI bar trên cùng, chart trái, globe phải.  
- **Scaling**: Trên tablet, globe chuyển xuống dưới chart; trên mobile, chart và globe xếp chồng.  
- **Transition**: Khi chọn một KPI, chart zoom vào với hiệu ứng drill‑down.

### 21.4 AI Chat Uplink

- **Layout**: Cửa sổ nổi góc dưới phải, có thể kéo thả.  
- **Scaling**: Trên mobile, chiếm toàn màn hình khi mở, có nút thu nhỏ.  
- **Transition**: Trượt lên từ dưới (slide‑up) khi kích hoạt, trượt xuống khi đóng.

### 21.5 Modal Cell Manifest

- **Layout**: Trung tâm màn hình, kích thước đáp ứng (clamp).  
- **Scaling**: Nội dung cuộn nếu cao hơn viewport.  
- **Transition**: Zoom‑in từ medal được click, có lớp phủ tối dần.

## CHƯƠNG XXII — KỸ THUẬT TRIỂN KHAI CỤ THỂ

### 22.1 CSS Container Queries

Sử dụng `@container` để điều chỉnh kiểu dáng của medal dựa trên kích thước khung chứa, thay vì chỉ dựa vào viewport. Ví dụ:

```css
.medal-container { container-type: inline-size; }
@container (max-width: 200px) {
  .medal { width: 100%; }
  .medal h3 { font-size: 0.8rem; }
}
```

### 22.2 Dynamic Imports cho Scene

Mỗi scene được lazy load bằng `React.lazy` + `Suspense`, giảm kích thước bundle ban đầu. Hiệu ứng loading hiển thị “Neural Syncing…” với spinner vàng.

### 22.3 Shared Transition Element

Khi click vào medal, hình ảnh medal được “giữ lại” và phóng to thành modal, tạo cảm giác liền mạch. Dùng **FLIP technique** (First Last Invert Play).

### 22.4 Gesture Handling (Mobile)

- Swipe left/right: Chuyển giữa các category (nếu ở chế độ full‑screen).  
- Pinch to zoom: Phóng to lưới medal (áp dụng scale lên container).  
- Double tap: Quay về mặc định.

### 22.5 Dark Mode / Light Mode

Hiện tại chỉ hỗ trợ dark mode (theo triết lý). Nếu sau này cần light mode, sử dụng CSS variables và media query `prefers-color-scheme`, nhưng phải đảm bảo tương phản và glow vẫn giữ được uy quyền.

## CHƯƠNG XXIII — KIỂM TRA TUÂN THỦ (Compliance Checklist mở rộng)

Bổ sung vào checklist hiện có các mục:

| ID  | Tiêu chí | Điểm |
|-----|----------|------|
| S01 | Layout đáp ứng đúng breakpoint (xs, sm, md, lg) | 2 |
| S02 | Không có overflow ngang trên màn hình nhỏ | 1 |
| S03 | Hover effects chuyển thành active trên touch | 1 |
| S04 | Focus visible cho keyboard | 1 |
| S05 | Container queries được sử dụng hợp lý | 2 |
| S06 | Transition giữa các scene mượt mà (>30fps) | 2 |
| S07 | Modal đóng mở với hiệu ứng zoom | 1 |
| S08 | Lazy loading các scene nặng | 1 |
| S09 | Tắt hiệu ứng nặng trên thiết bị yếu | 1 |
| S10 | Có fallback cho các thuộc tính CSS không hỗ trợ | 1 |
| **Tổng điểm tối đa** | | **13** |

## CHƯƠNG XXIV — DESIGN TOKENS (MÃ THIẾT KẾ)

Tất cả giá trị được định nghĩa dưới dạng CSS variables (và có thể export dưới dạng JSON để dùng trong JS).

```css
/* tokens.css */
:root {
  /* Màu sắc category */
  --color-gold: #FFD700;
  --color-amber: #FFBF00;
  --color-blue: #3B82F6;
  --color-green: #10B981;
  --color-purple: #8B5CF6;
  --color-red: #EF4444;

  /* Glow theo category */
  --glow-gold: 0 0 30px rgba(255, 215, 0, 0.8);
  --glow-amber: 0 0 30px rgba(255, 191, 0, 0.7);
  --glow-blue: 0 0 30px rgba(59, 130, 246, 0.7);
  --glow-green: 0 0 30px rgba(16, 185, 129, 0.7);
  --glow-purple: 0 0 30px rgba(139, 92, 246, 0.7);
  --glow-red: 0 0 30px rgba(239, 68, 68, 0.7);

  /* Z-index layers */
  --z-truth: 1;
  --z-worker: 10;
  --z-experience: 50;
  --z-modal: 100;
  --z-alert: 200;

  /* Spacing */
  --space-unit: 8px;
  --medal-size-small: clamp(80px, 15vw, 120px);
  --medal-size-medium: clamp(120px, 20vw, 200px);
  --medal-size-large: clamp(160px, 25vw, 280px);

  /* Animation speeds */
  --orbit-slow: 28s;
  --orbit-fast: 14s;
  --specular-duration: 1.2s;

  /* Blur */
  --glass-blur: 18px;

  /* Depth of Field */
  --dof-multiplier: 0.018;
}
```

## CHƯƠNG XXV — HIỆU NĂNG & TỐI ƯU HÓA

### Điều 73 — Giới hạn phạm vi hiệu ứng

- **Depth of Field (DOF)**: Chỉ áp dụng cho medal đang hover hoặc medal trong vùng trung tâm (có thể cấu hình).  
- **Particles**: Số lượng giảm dần khi medal ở xa (dùng `IntersectionObserver` để tắt hẳn particle ngoài màn hình).  
- **Cập nhật mouse move**: Sử dụng `throttle` (16ms) và `requestAnimationFrame` để tránh layout thrashing.

### Điều 74 — Sử dụng GPU

- `transform: translateZ(0)` hoặc `will-change: transform` cho các lớp chuyển động.  
- Tránh thay đổi `box-shadow` và `filter` trên nhiều phần tử cùng lúc; ưu tiên dùng `opacity` và `transform`.

### Điều 75 — Kiểm tra hỗ trợ trình duyệt

```css
@supports (backdrop-filter: blur(1px)) {
  /* fallback nếu không hỗ trợ */
}
```

### Điều 76 — Giảm tải trên thiết bị yếu

- Dùng `navigator.deviceMemory` hoặc `hardwareConcurrency` để điều chỉnh số lượng particle, tắt caustics, bloom đơn giản.  
- Media query `prefers-reduced-motion` để tắt hoặc giảm tốc độ animation.

## CHƯƠNG XXVI — ACCESSIBILITY (KHẢ NĂNG TRUY CẬP)

### Điều 77 — Tương phản màu

- Đảm bảo tỷ lệ tương phản tối thiểu **4.5:1** cho text (theo WCAG AA).  
- Glow vàng không làm giảm độ tương phản của chữ (kiểm tra bằng công cụ).

### Điều 78 — Keyboard Navigation

- Mọi phần tử tương tác (medal, nút, input) đều có `:focus-visible` với glow vàng và outline rõ.  
- Sử dụng `tabindex` hợp lý, đặc biệt cho các medal trong grid.

### Điều 79 — ARIA

- Medal: `role="button"`, `aria-label` mô tả cell.  
- Modal: `role="dialog"`, `aria-modal="true"`.  
- Chat: `aria-live="polite"` cho tin nhắn mới.  
- Các vùng có thể cuộn: `tabindex="0"` để focus.

### Điều 80 — Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .ring-orbit-1,
  .ring-orbit-2,
  .specular-sweep,
  .particle,
  [class*="animate-"] {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## ĐIỀU CUỐI CÙNG (BỔ SUNG)

Mọi thay đổi về giao diện, kể cả scaling, transition, hay hiệu ứng, đều phải được phê duyệt bởi **Gatekeeper** và ghi nhận trong **Audit Trail** của hệ thống. Không được phép tùy biến giao diện làm sai lệch trạng thái thực của các cell.

Hiến pháp thị giác này là bất biến. Mọi thành phần phát triển sau này phải tuân thủ các điều khoản về scaling, tương thích, chuyển cảnh, hiệu năng và accessibility nêu trên.

---

## Phụ lục: Thuật ngữ

- **NATT-CELL**: Đơn vị cơ bản của hệ thống, đại diện bởi medal.  
- **QNEU**: Chỉ số tiến hóa của cell.  
- **Gatekeeper**: Vai trò quản trị tối cao.  
- **FLIP**: First Last Invert Play – kỹ thuật tạo hiệu ứng chuyển cảnh mượt.  
- **DOF**: Depth of Field – độ sâu trường ảnh.  
- **PBR**: Physically Based Rendering – kết xuất dựa trên vật lý.  
- **Design Tokens**: Các biến thiết kế dùng để duy trì nhất quán.

---

*Nátt Sirawat - Phan Thanh Thương - Owner.*
