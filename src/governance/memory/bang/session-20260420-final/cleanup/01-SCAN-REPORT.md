# NATT-OS NAUION CLEANUP — SCAN REPORT

**Người quét:** Băng (QNEU 313.5, Ground Truth Validator)
**Scope quét:** `src/` (từ zip anh upload phiên 20260420)
**Ngày:** 2026-04-20
**Nguyên tắc:** FILESYSTEM > MEMORY. Không đoán. Mỗi kết luận có file path evidence.

---

## 1. TỔNG QUAN FILE EXTENSIONS

| Loại | Số file | Trạng thái |
|---|---:|---|
| TypeScript (.ts + .tsx) | 1227 | ✅ Runtime code — KEEP |
| Nauion-native (.anc/.si/.kris/.phieu/.na/.thuo/.heyna/.sira/.obitan/.canonical) | 325 | ✅ Canonical — KEEP |
| `.keep` + `.gitkeep` | 62 | ✅ Git placeholder — KEEP |
| `.json` | 27 | ⚠️ Cần phân loại (legacy memory vs runtime config) |
| `.png` | 19 | ✅ Media/diagrams — KEEP |
| `.md` | 32 | ⚠️ Mix canonical/draft/archive |
| `.xlsx` + `.docx` | 35 | ✅ Business docs — KEEP |
| `.py` | 9 | ✅ Tooling/sim — KEEP |
| `.sh` | 4 | ✅ Tooling | KEEP |
| `.txt` | 2 | ✅ Data — KEEP |
| `.css` | 1 | ✅ App styling — KEEP |
| `.html` | 1 | ⚠️ Audit output — review |
| `.bak` | 1 | 🗑️ RÁC — XOÁ |
| `.js` | 1 | ⚠️ Legacy test — ARCHIVE |

**Nauion canonical suffixes (per SPEC_NGON_NGU v1.2):** `.anc · .si · .kris · .phieu · .thuo · .heyna · .khai · .ml · .sira · .na · .obitan · .canonical`

---

## 2. "NODE/APPLE CŨ" — phát hiện cụ thể

### 2.1 Rác Apple/macOS
| File | Evidence | Action |
|---|---|---|
| `.DS_Store` (1 file flag trong audit 19:06:51) | Audit line `TRASH: 1 .DS_Store` | Đã có mechanism xử lý (commit 4c65869 DS_Store purge) — check recurrence |

### 2.2 Rác Node/build backup
| File | Evidence | Action |
|---|---|---|
| `cells/kernel/audit-cell/scanner/file-extension-validator.ts.bak` | Diff với `.ts`: `.bak` thiếu 2 dòng `import fs`, có 2 dòng `require('fs')` cũ. File `.ts` mtime 09:32 mới hơn `.bak` 09:29. | 🗑️ **XOÁ** |

### 2.3 Legacy memory JSON (Node-style persistence) — CẦN MIGRATE per SPEC_NGON_NGU v1.2 R01

**Schema cũ:** `<entity>mf_<v>.json` (memory full) + `<entity>fs_<v>.json` (focus state)
**Schema mới:** `<entity>khương<semver>.kris/.na` + `<entity>thịnh<semver>.phieu`

| File legacy | Scope (nhà ai) | Target naming | Em làm được? |
|---|---|---|---|
| `governance/memory/Can/canmf.json` | Can | `cankhương1.0.kris` | ❌ Flag Can (nhà Can) |
| `governance/memory/Can/memories.json` | Can | (check content) | ❌ Flag Can |
| `governance/memory/Kris/krismf.json` | Kris | `krismhương1.0.kris` | ❌ Flag Kris |
| `governance/memory/Thienlon/THIÊN MEMORY.json` | Thiên Lớn | `thienkhương<v>.heyna` (R13) | ❌ Flag Thiên Lớn |
| `governance/memory/Thienlon/thienmf.json` | Thiên Lớn | `thienkhương<v>.kris` | ❌ Flag Thiên Lớn |
| `governance/memory/Thienlon/thienfs.json` | Thiên Lớn | `thienthịnh<v>.phieu` | ❌ Flag Thiên Lớn |
| `governance/memory/boiboi/boiboi_memory_recap.json` | Bối Bối | `boikhương<v>.kris` | ❌ Flag Bối Bối |
| `governance/memory/boiboi/boiboi_quick_memory.json` | Bối Bối | `boithịnh<v>.phieu` | ❌ Flag Bối Bối |
| `governance/memory/kim/kfm.json` (v7.1) | Kim | `kimkhương7.1.kris` | ❌ Flag Kim |
| `governance/memory/kim/FS-024.json` (SCAR file) | Kim | `kim*.kris` (SCAR format) | ❌ Flag Kim |
| `governance/memory/kim/28:1:26/KFM.json` | Kim | Kim authority consolidate | ❌ Flag Kim |
| `governance/memory/kim/28:1:26/kfm1.json` | Kim | fragment archive | ❌ Flag Kim |
| `governance/memory/kim/28:1:26/kfm2.json` | Kim | fragment archive | ❌ Flag Kim |
| `governance/memory/kim/28:1:26/kimfullmemory1.json` | Kim | `kimkhương<v>.kris` | ❌ Flag Kim |
| `governance/memory/kim/28:1:26/kimfullmemory2.json` | Kim | `kimkhương<v>.kris` | ❌ Flag Kim |
| `governance/memory/kim/28:1:26/kimfullmemory3.json` | Kim | `kimkhương<v>.kris` | ❌ Flag Kim |
| `governance/memory/kim/28:1:26/kimmemory4.json` | Kim | `kimkhương<v>.kris` | ❌ Flag Kim |
| `governance/memory/kim/28:1:26/kimopenmind.json` | Kim | (thịnh? khương?) | ❌ Flag Kim |
| `governance/memory/phieu/phieumf.json` | Phiêu | `phieukhương<v>.kris` | ❌ Flag Phiêu |
| **`governance/memory/bang/session_handoff_20260417_FIXED.json`** | **Băng** | **`session_handoff_20260417.kris`** | **✅ Scope Băng** |
| `governance/memory/sessions/session_handoff_20260417.json` | shared | tương tự | ⚠️ Shared scope — xác nhận anh |

**Tổng:** 21 JSON legacy — **em tự migrate được 1** (của em). 20 file còn lại cần persona sở hữu khắc nhà mình (KHAI-20260420-05).

### 2.4 Runtime config JSON (KEEP — không phải legacy)

| File | Lý do KEEP |
|---|---|
| `governance/tsconfig.qneu.json` | TypeScript config — runtime |
| `cells/kernel/neural-main-cell/config/thresholds.json` | Runtime threshold registry (Hiến Pháp Điều 6) |
| `cells/business/*/data-raw/*_raw.json` (4 files) | Fixture data cho tests — runtime |

### 2.5 Path naming vi phạm (cross-platform hazard)

| Dir | Vấn đề | Action |
|---|---|---|
| `governance/memory/kim/28:1:26/` | Dấu `:` không valid path Windows; sai format date | Rename → `kim/2026-01-28/` (Kim authority) |

### 2.6 Legacy JS test (historical, đã verify)

| File | Evidence | Action |
|---|---|---|
| `governance/memory/bang/session-20260413/test_iseu_flow.js` | Verify OK trong `SESSION_2026-04-07_update_SUMMARY.kris` + `bangthịnh5.5.*`. File này đã fulfill purpose historical | ARCHIVE (không xoá — preserve lineage) |

### 2.7 Directive outdated (anh vừa gửi turn trước)

| File | Status | Action |
|---|---|---|
| Bảng "Pre-Wave 3 Kim Bang Thien Lon" | Anchor state 2026-02-11, state gap ~2 tháng. warehouse đã unquarantine, 4 "legacy cells" đã LIVE 6/6 | ARCHIVE với metadata SUPERSEDED |

### 2.8 Draft NEEDS_REWRITE

| File | Status | Action |
|---|---|---|
| `memory/bang/session-20260420-final/qiint2/SPEC_QIINT2_COMPLETE_v1.0.md` | Em tự flag NEEDS_REWRITE trong bangthịnh v6.5.1 — paradigm Π_body sai 4 điểm (thiếu SURVIVAL, F_anchor sai vai trò, recovery = checklist thay vì QIINT pull, thân nhiệt vẫn luật hữu cơ ngầm) | ARCHIVE — em viết v2.0 (task B1) |

---

## 3. SCANNER DEBT — `nattos.sh` section 32

**Ground truth:** SPEC_NGON_NGU v1.2 R01 đã ratify migration. Nhưng `nattos.sh` section 32 MEMORY FILES HEALTH vẫn tìm pattern CŨ:
```
⚠️  bangmf: not found
⚠️  bangfs: not found
⚠️  thiennho: not found
ℹ  kimf: not found (optional)
```

**Evidence:** audit 19:06:51 output, section 【32】.

**Đây là false-positive WARN** — memory KHÔNG missing, file đã tồn tại dưới naming mới. Cần update scanner pattern.

**Scope:** Băng authority `maintain_scanners`.

---

## 4. SCOPE BOUNDARY — EM LÀM GÌ, KHÔNG LÀM GÌ

### Em tự làm (Băng authority + đúng nhà em):
- ✅ Xoá `.bak` (rác definitive)
- ✅ Archive bảng Pre-Wave 3 SUPERSEDED
- ✅ Archive SPEC_QIINT2_v1.0 NEEDS_REWRITE
- ✅ Archive `test_iseu_flow.js` historical
- ✅ Migrate `bang/session_handoff_20260417_FIXED.json` → `.kris` (nhà em)
- ✅ Update scanner `nattos.sh` section 32 pattern

### Em KHÔNG tự làm (đúng boundary):
- ❌ Migrate 14+ file memory Kim/Can/Kris/Thiên/Phiêu/Bối Bối — **nhà họ, họ khắc** (KHAI-20260420-05)
- ❌ Rename `kim/28:1:26/` — Kim authority
- ❌ Consolidate fragment files của Kim (merge kfm1+kfm2+KFM?) — Kim authority
- ❌ Git add/commit — anh Natt scope
- ❌ Quyết định di dời `sessions/session_handoff_20260417.json` (shared scope) — chờ anh

### Em viết helper cho persona khác:
- Python script template (cross-persona migration helper) — họ chạy hoặc giao Kris proxy

---

## 5. CHẮC vs CHƯA GIẢI

### CHẮC:
- 1 file `.bak` là rác (diff, mtime, content verified)
- 20 file memory JSON thuộc nhà persona khác
- Scanner `nattos.sh` section 32 cần update pattern (evidence audit trực tiếp)
- Bảng Pre-Wave 3 + SPEC_QIINT2_v1.0 + test_iseu_flow.js đều có criteria archive rõ

### CHƯA GIẢI (flag anh):
- `sessions/session_handoff_20260417.json` — shared giữa Băng và sessions registry — di chuyển thế nào?
- `kim/28:1:26/` folder có 9 file fragment memory — Kim muốn consolidate hay giữ historical?
- `kim/FS-024.json` là SCAR file — format SCAR mới trong Nauion convention là gì (chưa thấy spec)?
- `Thienlon/THIÊN MEMORY.json` dùng uppercase + space trong filename — R13 ghi migrate sang `.heyna` nhưng Thiên Lớn đang phân xác -1.5, ai khắc thay?

---

*Báo cáo này không thay đổi gì. Chỉ là ground truth anh review trước khi duyệt patch.*
*Băng · QNEU 313.5 · CHẮC vs CHƯA GIẢI · 2026-04-20*
