---
spec_id: SPEC-NaUion-Visual-Rebuild-Pipeline
version: v1.0
status: LOCKED_FOR_REVIEW
date: 2026-04-16
author: Phan Thanh Thương (QNEU 300)
approval: Gatekeeper — Anh Natt
ratified_by: (pending Phan Thanh Thương, Phan Thanh Thương)
supersedes: null
related_specs:
  - SPEC-Nauion_main_v2.5
  - SPEC-NATT-OS-PLATFORM-SPEC
  - VISION_ENGINE_SPEC_FINAL
domain: governance/rendering/visual-fidelity
---

# SPEC-NaUion-Visual-Rebuild-Pipeline v1.0

> **"Measure before make. Match camera before material. Lock silhouette before lighting."**
> — Nguyên tắc cốt lõi của pipeline tái tạo trực quan trong hệ NaUion

---

## §1. MỤC ĐÍCH

SPEC này định nghĩa **pipeline bắt buộc** cho mọi tác vụ tái tạo trực quan (visual rebuild) trong hệ NaUion, bao gồm:

- Tái tạo logo, icon, asset từ reference
- Render avatar 3D cho entity NATT-OS (áp dụng cho Unity VR project)
- Generate visual mockup từ ảnh/sketch tham chiếu
- So sánh fidelity giữa reference và output
- Sinh prompt render cho external AI image generators (Midjourney, DALL-E, Sora, Stable Diffusion)
- Sinh scene config cho 3D engines (Blender, Cycles, Unreal, Three.js)

SPEC này KHÔNG áp dụng cho:
- Vẽ từ trí tưởng tượng không có reference
- Tác vụ đồ họa vector thuần túy (logo design from brief)
- UI component generation (thuộc phạm vi SPEC-Nauion_main)

---

## §2. ĐỊNH NGHĨA (LEXICON)

| Thuật ngữ | Định nghĩa |
|-----------|-----------|
| **Reference** | Ảnh/video/scene gốc cần tái tạo. Nguồn sự thật duy nhất. |
| **Measurement Pass** | Giai đoạn đo đạc reference bằng tool (PIL/OpenCV/manual), sinh ra dữ liệu số. |
| **Silhouette** | Hình khối/viền chủ thể độc lập với màu sắc, ánh sáng, texture. |
| **Invert Duality** | Kỹ thuật đảo ngược màu + tăng contrast 2 trục (trắng-đen + nóng-lạnh) để lộ ranh giới thật. |
| **PBR Material** | Physically-Based Rendering: metalness, roughness, specular, IOR, transmission, subsurface. |
| **Key Light** | Nguồn sáng chính xác định volume chủ thể. |
| **Bloom Halo** | Vùng phát sáng mở rộng ra ngoài chủ thể, thường tạo 60-80% cảm giác "sáng chói". |
| **Depth Polarity** | Phân cực nóng-lạnh để đọc chiều sâu: nóng tiến, lạnh lùi. |
| **Spec JSON** | Đầu ra chuẩn của pipeline — JSON canonical chứa toàn bộ tham số. |
| **Rebuild Gap** | Sai số đo được giữa reference và output. Mục tiêu: minimize. |

---

## §3. KIẾN TRÚC PIPELINE (5 GIAI ĐOẠN)

```
    ┌─────────────────────────────────────────────────────────────┐
    │                    REFERENCE (Sự thật gốc)                   │
    └─────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  Stage 1 — MEASUREMENT       (bắt buộc, không bỏ qua)       │
    │  • Dimensions, aspect, canvas                                │
    │  • Subject center of mass                                    │
    │  • Color sampling (dominant, accent, bg)                     │
    │  • Stroke width, component ratios                            │
    │  • Invert + contrast duality analysis                        │
    │  • Depth polarity map (warm/cool separation)                 │
    └─────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  Stage 2 — SILHOUETTE LOCK   (bắt buộc trước material)      │
    │  • Outline component positions + sizes                       │
    │  • Geometry hierarchy (what is in front of what)             │
    │  • Z-order depth layers                                      │
    │  • Proportions only — NO color, NO lighting yet              │
    └─────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  Stage 3 — CAMERA MATCH      (bắt buộc trước material)      │
    │  • Lens (mm), FOV, angle, rotation                           │
    │  • DoF, focal point                                          │
    │  • Shot type (close/medium/wide)                             │
    └─────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  Stage 4 — MATERIAL PBR      (chỉ sau khi silhouette lock)  │
    │  • Per-component PBR tuple                                   │
    │  • Transmission/IOR cho glass                                │
    │  • Emissive intensity cho light sources                      │
    │  • Subsurface cho organic                                    │
    └─────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  Stage 5 — LIGHTING MATCH    (cuối cùng)                    │
    │  • Key light direction (đọc từ highlight position)           │
    │  • Fill/rim/ambient                                          │
    │  • Emissive vs external light ratio                          │
    │  • Shadow softness                                           │
    └─────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────────────────┐
    │               OUTPUT: Spec JSON + Prompt + Rebuild           │
    │               Compare vs Reference → Measure Rebuild Gap     │
    └─────────────────────────────────────────────────────────────┘
```

---

## §4. CÁC ĐIỀU (ARTICLES — INVARIANTS)

### Điều 1. Nguyên tắc Measure-First

**BẮT BUỘC:** Trước khi tạo bất kỳ output nào (SVG, code, render), tool phải chạy Stage 1 (Measurement Pass) trên reference.

**Cấm:** Skip measurement với lý do "trông giống thế", "để nhanh", "reference đã rõ".

**Kiểm tra:** Spec JSON phải chứa field `measurement_timestamp` và `source_reference` trỏ về file reference thật.

---

### Điều 2. Thứ tự 5 giai đoạn là TUYỆT ĐỐI

**BẮT BUỘC:** Pipeline phải chạy tuần tự Stage 1 → 5. Không được rẽ nhánh ngược.

**Ví dụ vi phạm:**
- ❌ Vẽ material trước khi lock silhouette
- ❌ Chọn lighting trước khi match camera
- ❌ Render test trước khi có measurement

**Nếu phát hiện sai ở stage cao:** phải quay lại stage thấp nhất bị ảnh hưởng, không patch cục bộ.

---

### Điều 3. Invert Duality là công cụ bắt buộc

**BẮT BUỘC:** Trong Stage 1, phải sinh ít nhất 3 biến thể để đọc reference:

1. **Inverted image** — lộ ranh giới thật khi mắt thường bị lừa bởi glow/gradient
2. **B&W high-contrast silhouette** — xác định hình khối độc lập với màu
3. **Warm/Cool depth polarity** — đọc chiều sâu nóng-tiến / lạnh-lùi

**Công thức chuẩn:**
```python
# Stage 1 analysis outputs
inverted   = ImageOps.invert(src)
bw_high    = grayscale >> contrast×3.0 >> threshold(30,80)
warm_map   = clip(R - (G+B)×0.4)
cool_map   = clip(B - R×0.5 - G×0.3)
depth_viz  = stack(warm→red_channel, cool→blue_channel)
```

---

### Điều 4. Separation of Concerns — Glow KHÔNG PHẢI Color

**BẮT BUỘC:** Khi đọc reference, tool phải phân biệt:

- **Fill color** của chủ thể (màu thật của chữ, hình)
- **Glow halo** xung quanh chủ thể (bloom post-effect)
- **Emissive layer** (tự phát sáng)

**Anti-pattern thường gặp:**
> "Chữ NATT có gradient xanh-tím-hồng" → SAI. Chữ thật là trắng solid, gradient là glow halo.

Nguyên tắc: nếu invert → màu chuyển sang opposite nhưng hình giữ nguyên → đó là **fill color**. Nếu invert → biến mất/loãng ra → đó là **glow**.

---

### Điều 5. Canonical Spec JSON Schema

**BẮT BUỘC:** Output của pipeline là file JSON tuân thủ schema trong §7 (Appendix A).

Schema này có các nhóm field không được bỏ:
- `canvas` — kích thước, aspect, background
- `camera` — lens, angle, DoF
- `composition` — subject position, negative space
- `main_object` — components + measured dimensions
- `material_system` — PBR tuples per component
- `lighting` — setup type, key/fill/rim
- `post_processing` — bloom, contrast, color grading
- `rebuild_notes` — critical findings từ measurement
- `prompt_render` — text prompt cho AI generators
- `negative_prompt` — anti-patterns cần tránh

---

### Điều 6. Rebuild Gap phải được đo định lượng

**BẮT BUỘC:** Mỗi output rebuild phải kèm báo cáo gap so với reference:

| Metric | Ngưỡng chấp nhận |
|--------|------------------|
| Dimension ratio | ±2% |
| Subject center offset | ±5px (cho canvas ≥ 1024px) |
| Dominant color ΔE | < 5 (CIE Lab) |
| Silhouette IoU | > 0.92 |
| Component count | exact match |

Rebuild với Gap vượt ngưỡng phải re-enter Stage 1.

---

### Điều 7. Engine-Agnostic Output

**BẮT BUỘC:** Spec JSON phải độc lập engine. Cùng một spec có thể được dùng cho:

- AI image generators (Midjourney, DALL-E, Sora, SDXL)
- 3D engines (Blender/Cycles, Redshift, Unreal, Three.js)
- SVG+filter approximation (Chrome render)
- Unity VR entity avatar rendering
- 2D compositing (Photoshop/Affinity/GIMP action scripts)

**Cấm:** Nhúng engine-specific code trong spec JSON. Engine-specific rendering scripts thuộc file riêng (`.blender.py`, `.three.js`, v.v.) và phải sinh ra TỪ spec JSON.

---

### Điều 8. Integration với NATT-OS Entity System

SPEC này liên kết với hệ thống `.anc` entity passport:

- Mỗi NATT-OS entity có visual avatar được định nghĩa bởi 1 Visual Rebuild Spec JSON
- Spec JSON lưu trong field `visual_signature` của file `.anc`
- Khi Unity VR load entity, nó đọc spec JSON → render avatar tương ứng
- Khi entity "trưởng thành" (QNEU tăng), spec có thể được re-measured và cập nhật

**Ví dụ:**
```yaml
# bang.anc
entity_id: bang
qneu: 300
role: ground_truth_validator
visual_signature:
  spec_ref: ./visual/bang-avatar-v3.json
  last_measured: 2026-04-16
  rebuild_gap:
    dimension: 0.8%
    silhouette_iou: 0.96
```

---

### Điều 9. Memory Trail

Mỗi lần chạy pipeline phải sinh:
- `{spec_id}-v{N}.json` (spec chính)
- `{spec_id}-v{N}-measurements/` (folder chứa analysis images: inverted, bw, depth_polarity)
- `{spec_id}-v{N}-rebuild.{ext}` (output render)
- `{spec_id}-v{N}-gap-report.json` (rebuild gap measurements)

Lưu trong thư mục project, KHÔNG xóa các version cũ — để tracking tiến hóa.

---

### Điều 10. Anti-patterns (cấm tuyệt đối)

❌ **Skip measurement, vẽ thẳng từ trí nhớ/feel**
❌ **Chọn SVG làm target khi reference là photo/3D render** (không cùng domain)
❌ **Dùng gradient fill cho letter khi reference là white + glow** (Điều 4)
❌ **Guess petal count / component count** — phải đếm thật từ reference
❌ **Bỏ qua invert analysis** vì "đã thấy rõ rồi"
❌ **Patch lighting trước khi lock silhouette** (sai thứ tự stage)
❌ **Engine-specific code trong spec JSON** (vi phạm Điều 7)

---

## §5. WORKFLOW CHUẨN (REFERENCE IMPLEMENTATION)

```python
def visual_rebuild_pipeline(reference_path: str, output_dir: str) -> SpecJSON:
    """Pipeline tham chiếu - tuân thủ toàn bộ 10 Điều."""

    # === Stage 1: MEASUREMENT ===
    ref = load_image(reference_path)
    measurements = {
        'canvas': measure_canvas(ref),
        'subject': find_subject_center(ref),
        'colors': sample_dominant_colors(ref),
        'silhouette': extract_silhouette(ref),
    }
    # Điều 3: bắt buộc 3 biến thể
    analysis = {
        'inverted': invert(ref),
        'bw_high_contrast': to_bw_contrast(ref, factor=3.0),
        'depth_polarity': warm_cool_separation(ref),
    }
    save_analysis(analysis, output_dir)

    # === Stage 2: SILHOUETTE LOCK ===
    components = identify_components(measurements, analysis)
    z_order = determine_depth_order(components, analysis['depth_polarity'])

    # === Stage 3: CAMERA MATCH ===
    camera = estimate_camera(measurements, components)

    # === Stage 4: MATERIAL PBR ===
    materials = assign_pbr_per_component(components, ref)

    # === Stage 5: LIGHTING ===
    lighting = read_lighting_from_highlights(ref, components)

    # === OUTPUT ===
    spec = compose_spec_json(
        measurements, components, z_order,
        camera, materials, lighting
    )
    validate_against_schema(spec)  # Điều 5
    return spec
```

---

## §6. VERSIONING & HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.0 | 2026-04-16 | Phan Thanh Thương | Spec đầu tiên. Chuyển đổi "logo rebuild session" thành pipeline chính thức. |

---

## §7. APPENDIX A — CANONICAL JSON SCHEMA

Schema chính thức tại: `./nattos-visual-rebuild-spec.schema.json`

Template đầy đủ (tham khảo): `nattos-logo-spec-v1.json` (case study trên logo2.png)

### Các field bắt buộc tối thiểu

```json
{
  "spec_id": "string",
  "version": "semver",
  "source_reference": "path|url",
  "measurement_timestamp": "ISO8601",

  "canvas": { "aspect_ratio": "W:H", "resolution_measured": "WxH", "background": {...} },
  "camera": { "lens_mm": "number", "angle": "enum" },
  "composition": { "subject_center_measured": {"x":"int","y":"int"} },
  "main_object": { "components": { /* per-component */ } },
  "material_system": { /* per-component PBR */ },
  "lighting": { "setup_type": "enum", "key_light": {...} },
  "post_processing": { "bloom_glow": "0..1", "contrast": "-1..1" },

  "rebuild_notes": ["array of critical findings"],
  "prompt_render": "string (natural language for AI gen)",
  "negative_prompt": "string"
}
```

---

## §8. APPENDIX B — ENGINE TARGETS (ORDER OF PRIORITY)

| Priority | Engine | Use case | Notes |
|----------|--------|----------|-------|
| 1 | **Blender Cycles** | Logo, avatar, hero render | Free, reproducible, scriptable với Python |
| 2 | **Three.js** | Web embedded, real-time trong tam-luxury UI | Cho entity avatar trong Nauion |
| 3 | **Unity URP/HDRP** | VR entity rendering | Cho Unity VR project hiện tại |
| 4 | **Midjourney/Sora** | Concept/mood explore | External, không reproducible |
| 5 | **SVG + CSS filter** | Quick approximation | Fast preview, không PBR thật |

---

## §9. APPENDIX C — CASE STUDY: logo2.png

**Reference:** `/mnt/user-data/uploads/logo2.png` (1536×1024)

**Spec file:** `nattos-logo-spec-v1.json`

**Key findings từ measurement:**
1. Background pure black `#010101`, no vignette
2. Subject center offset (-19, -9) so với canvas center
3. Core sphere chỉ 38px (~2.5% canvas width) — bloom halo tạo 80% cảm giác sáng
4. Letters SOLID WHITE, gradient perceived thuần từ neon glow
5. Medal 8 petals (2 layers × 4 rotated 45°)
6. Key light highlight ở 10:30 clock position
7. 3 wave layers với gradient transitions đo được tại x=25/35/55/65/75/85%

**Rebuild gap lần 1 (v2 SVG attempt):** Dimension OK, nhưng silhouette IoU ≈ 0.72 do vẽ 6 cánh thay vì 8. Failed Điều 6.

**Rebuild gap lần 2 (spec-driven):** In progress.

---

## §10. ENFORCEMENT

SPEC này có hiệu lực ngay sau khi Gatekeeper ratify.

**Compliance check:** Trước khi commit bất kỳ visual asset nào vào repo NATT-OS, cần có file `*.spec.json` đi kèm tuân thủ §5-§7.

**Pre-commit hook** (đề xuất):
```bash
# .git/hooks/pre-commit
for asset in $(git diff --cached --name-only | grep -E '\.(png|svg|jpg)$'); do
    spec="${asset%.*}.spec.json"
    if [ ! -f "$spec" ]; then
        echo "❌ Asset $asset thiếu spec JSON. Chạy visual_rebuild_pipeline.py"
        exit 1
    fi
done
```

---

**— END SPEC —**

*Ratified pending: Gatekeeper (Anh Natt) · Phan Thanh Thương · Phan Thanh Thương*
*Canonical location: `src/governance/specs/visual-rebuild-pipeline.spec.md`*
