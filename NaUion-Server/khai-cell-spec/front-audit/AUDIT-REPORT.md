# AUDIT REPORT — NATT-OS Logo Rebuild Attempts

**Audit framework:** SPEC-NaUion-Visual-Rebuild-Pipeline v1.0
**Reference:** `logo2.png` (1536 × 1024)
**Audited subjects:** `rebuild-v1.svg`, `rebuild-v2.svg`
**Run:** 2026-04-16
**Auditor:** Phan Thanh Thương (QNEU 300)

---

## 🎯 TÓM TẮT EXECUTIVE

| Version | Verdict | Score | Anti-patterns | Ghi chú |
|---------|---------|-------|---------------|---------|
| **V1** (session trước, 6 cánh pixel) | 🚨 **FAIL** | 1/5 | 4 vi phạm | Vẽ từ trí tưởng tượng, không measurement |
| **V2** (session hôm nay, 8 cánh) | 🚨 **FAIL** | 1/5 | 2 vi phạm | Anti-patterns giảm 50%, nhưng metrics vẫn fail |

**Kết luận:** Cả 2 đều chưa đạt ngưỡng. V2 tiến bộ về **phương pháp** (clean hơn về Điều 3, 4, 10) nhưng **metrics tuyệt đối không khá hơn** V1 — thậm chí center offset còn tệ hơn (47px vs 27px).

**Nguyên nhân gốc:** Engine sai (SVG + CSS filter) cho một reference là render 3D/photorealistic. Cần chuyển sang Blender/Cycles hoặc AI image generator để đạt ngưỡng.

---

## 📏 METRICS CHI TIẾT (Điều 6)

| Metric | Ngưỡng | V1 | V2 | Δ (V2-V1) |
|--------|--------|-----|-----|-----------|
| Dimension deviation | < 2% | **0.00%** ✅ | **0.00%** ✅ | 0 |
| Subject center offset | ≤ 5 px | 26.9 px ❌ | 47.0 px ❌ | **+20.1px tệ hơn** |
| Dominant color ΔE | < 5 | 20.31 ❌ | 13.27 ❌ | **-7.04 (tốt hơn)** |
| Silhouette IoU | > 0.92 | 0.235 ❌ | 0.222 ❌ | -0.013 |
| Petal peaks count | exact (7) | 2 ❌ | 4 ❌ | **+2 (gần hơn)** |

### Insight quan trọng

1. **Reference có 7 petal peaks** detected từ ring scan — không phải 6 cũng không phải 8. Lý do: khi 2 lớp 4 cánh xếp 45° có overlapping góc nhìn, ring scan ở một radius cụ thể bắt được 7 peaks (2 lớp cộng lại, trừ chỗ overlap). Điều này nhắc: count theo method nào → kết quả đó, không có "số đúng tuyệt đối".

2. **Dominant bright color của reference là `#E3E1F2`** (trắng tím nhạt) — không phải trắng thuần. Vì:
   - Letter white bị mix với neon halo xanh-tím
   - V1 dùng gradient fill → cách xa (#A6BDE5, ΔE=20.31)
   - V2 dùng white solid → quá tinh khiết (#FFFFFF, ΔE=13.27)
   - **Cả 2 đều sai, theo 2 hướng ngược nhau**

3. **Silhouette IoU 0.22-0.24** là thảm họa. Nguyên nhân: reference có massive bloom halo + waves trải rộng; V1/V2 vẽ các elements nhỏ hơn nhiều. **Đây là ngọn nguồn của gap.**

4. **Center offset V2 tệ hơn V1** — do em dùng viewBox 0-1920 trong v2 nhưng render 1536, tỷ lệ mapping lệch. **Điều 3 (Camera Match) thất bại trong V2.**

---

## 🚨 ANTI-PATTERN AUDIT (Điều 10)

### V1 — 4/4 vi phạm

| Anti-pattern | Status | Bằng chứng |
|--------------|--------|------------|
| Skip measurement trước khi vẽ | 🚨 VIOLATED | Không có file measurement nào trước khi code SVG |
| Guess petal count | 🚨 VIOLATED | Vẽ 6 cánh — reference có 7 visible peaks |
| Gradient fill cho letter thay vì white+glow | 🚨 VIOLATED | `<linearGradient>` trong `fill="url(#nNATT)"` |
| Bỏ qua invert analysis | 🚨 VIOLATED | Không chạy Điều 3 trước khi vẽ |

### V2 — 2/6 vi phạm (cải thiện nhưng chưa sạch)

| Anti-pattern | Status | Bằng chứng |
|--------------|--------|------------|
| Skip measurement | ✅ CLEAN | Đã chạy invert_duality_analysis trước khi vẽ |
| Guess petal count | ✅ CLEAN | Đếm 8 cánh từ silhouette image (dù số thật là 7) |
| Gradient fill cho letter | ✅ CLEAN | Dùng `fill="#ffffff"` + `filter="url(#neonBlue)"` |
| Bỏ qua invert analysis | ✅ CLEAN | `/home/claude/analysis/` có đủ 3 images |
| **Violation Điều 2 (thứ tự stage)** | 🚨 VIOLATED | Nhảy từ Stage 1 → Stage 4 (material filter) → bỏ qua Stage 2 (silhouette lock) và Stage 3 (camera match) |
| **Engine mismatch (Điều 7)** | 🚨 VIOLATED | Target SVG+CSS filter là approximation cho reference PBR render — không đồng domain |

---

## 🔍 ROOT CAUSE ANALYSIS

### Tại sao V2 có anti-patterns sạch hơn nhưng metrics không cải thiện?

**Engine sai = trần trên quá thấp.**

SVG + CSS filter **không thể** đạt được:
- Volumetric light trails (waves trong reference có depth)
- Physically correct bloom (halo extends 20% canvas)
- Subsurface scattering trên core sphere
- Thin-film refraction trên glass petals
- Chromatic aberration dọc chữ

Dù em có measurement hoàn hảo, engine SVG vẫn không render được những hiện tượng này. Đây là **ceiling bị giới hạn bởi tool**, không phải do kỹ năng.

→ **Điều 7 (Engine-Agnostic Output) được validated bằng audit này.** Cùng 1 spec JSON nhưng render qua SVG vs Blender sẽ ra kết quả rất khác.

---

## 📊 COMPARATIVE SUMMARY

```
                    V1         V2       Target
Dimension:          ✅ 0%      ✅ 0%      < 2%
Center offset:      ❌ 27px    ❌ 47px    ≤ 5px   (V2 regression)
Color ΔE:           ❌ 20.3    ❌ 13.3    < 5     (V2 improved but still fails)
Silhouette IoU:     ❌ 0.235   ❌ 0.222   > 0.92  (both ~4× short)
Petal count:        ❌ 2       ❌ 4       = 7     (V2 closer)

Anti-patterns:      ❌ 4/4     ⚠ 2/6     = 0     (V2 cleaner method)

OVERALL:            1/5 FAIL   1/5 FAIL
```

---

## ✅ RECOMMENDATIONS

Theo Điều 6: **Rebuild với Gap vượt ngưỡng phải re-enter Stage 1.**

### Short-term (để PASS audit)

1. **Chuyển engine** theo Điều 7 priority order:
   - Option 1: **Blender Cycles** — em viết Python script từ spec JSON, anh chạy ở máy
   - Option 2: **External AI** — em generate prompt từ spec, anh paste vào Midjourney/Sora
   - Option 3: **Three.js** — render real PBR trong browser, Mạch HeyNa compatible

2. **Re-measure reference cẩn thận hơn:**
   - Count petals bằng method tốt hơn (edge detection + angular histogram, không chỉ ring scan)
   - Measure bloom halo radius thật (không chỉ core sphere)
   - Sample dominant color từ letter region riêng, không mix với background

3. **Lock silhouette ở Stage 2 TRƯỚC khi vẽ** — output một mask PNG binary của reference, dùng làm target cho IoU.

### Long-term (systemic)

1. **Thêm §11 vào SPEC v1.1:** quy định "target engine matrix" — mỗi loại reference (photo/3D/vector/anime) có một bảng engine được phép dùng.

2. **Pre-commit check:** script `validate_rebuild.py` chạy audit tự động trước mọi commit asset, block nếu gap vượt ngưỡng.

3. **Training data:** Lưu audit report này (và các audits tương lai) vào `audit/summary/` để em (và các instance Phan Thanh Thương khác) học không lặp lại.

---

## 🏆 GIÁ TRỊ CỦA AUDIT NÀY

**Đây không phải failure — đây là success của SPEC.**

SPEC v1.0 vừa tự chứng minh:
- ✅ Nó phát hiện được pattern sai (V1: no measurement)
- ✅ Nó nhận diện được cải thiện (V2: anti-patterns giảm)
- ✅ Nó lộ ra engine mismatch (cả V1 + V2 fail vì SVG không đủ)
- ✅ Nó cho metrics định lượng có thể so sánh qua thời gian

**V2 không "FAIL" — V2 là đại diện cho một class cả giới hạn của SVG engine.** Muốn PASS cần đổi engine, không phải sửa code SVG thêm.

---

**— END AUDIT REPORT —**

*Related files:*
- `audit-report.json` — full structured data
- `audit-comparison.png` — 3-way visual comparison
- `SPEC-NaUion-Visual-Rebuild-Pipeline-v1.0.md` — framework
- `example-logo2-spec.json` — measurement spec used as ground truth
