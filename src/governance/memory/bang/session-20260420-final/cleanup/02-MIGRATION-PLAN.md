# natt-os NAUION CLEANUP — MIGRATION PLAN (Bang scope)

**Phạm vi:** Những action em tự làm được mà không overstep persona khác.
**Nguyên tắc:** R05 (python3/bash inline) · R06 (git add từng file) · KHÔNG git add . · KHÔNG xoá file chưa verify.
**Rule áp dụng:** SCAR-20260419-08 (giữ exec bit sau mv) · SCAR-005 (không nói thay persona khác)

---

## PHASE 1 — SAFE CLEANUP (5 phút, risk thấp)

### 1.1 Xoá `.bak` rác
```
DELETE: src/cells/kernel/audit-cell/scanner/file-extension-validator.ts.bak
```
**Evidence:** Diff với `.ts` chính cho thấy đây là version cũ (2 dòng `require('fs')` legacy). File `.ts` timestamp mới hơn, content hiện hành.

### 1.2 Archive "Pre-Wave 3" directive SUPERSEDED
```
CREATE DIR: src/governance/archive/directives/
MOVE: <file-anh-upload>.md
   → src/governance/archive/directives/2026-02-11_pre-wave3-cleanup-SUPERSEDED.md
PREPEND: metadata header (status: SUPERSEDED, state_anchor, current_state, do_not_execute: true)
```

### 1.3 Archive SPEC_QIINT2_v1.0 NEEDS_REWRITE
```
MOVE: src/governance/memory/bang/session-20260420-final/qiint2/SPEC_QIINT2_COMPLETE_v1.0.md
   → src/governance/memory/bang/session-20260420-final/qiint2/archive/SPEC_QIINT2_v1.0_NEEDS_REWRITE.md
```

### 1.4 Archive `test_iseu_flow.js` historical
```
MOVE: src/governance/memory/bang/session-20260413/test_iseu_flow.js
   → src/governance/memory/bang/session-20260413/archive/test_iseu_flow.js
```

### 1.5 Migrate `bang/session_handoff_20260417_FIXED.json` → `.kris`
```
READ: src/governance/memory/bang/session_handoff_20260417_FIXED.json
WRAP schema: {
  kind: "SessionHandoff",
  entity: "bang",
  session_ref: "20260417",
  spec_compliance: { version: "v1.2", file_rule: "R11" },
  content: <original json>
}
WRITE: src/governance/memory/bang/session_handoff_20260417.kris
DELETE: src/governance/memory/bang/session_handoff_20260417_FIXED.json
```

**Script Phase 1:** file `03-phase1-cleanup.sh` — chạy trên repo iMac thật.

---

## PHASE 2 — SCANNER UPDATE (Bang authority: maintain_scanners)

### 2.1 Update `nattos.sh` section 32 — MEMORY FILES HEALTH

**Ground truth scanner hiện tại (audit 19:06:51):**
```
⚠️  bangmf: not found
⚠️  bangfs: not found
⚠️  thiennho: not found
```

**Pattern hiện tại (guess dựa output):** scanner tìm file `bangmf*` / `bangfs*` / `thiennho*` dạng `.json`.

**Pattern mới cần thay — per SPEC_NGON_NGU v1.2 R01 + R09:**

| Entity | Pattern cũ | Pattern mới |
|---|---|---|
| bang | `bangmf*.json` | `bangkhương*.kris` hoặc `bangkhuong*.na` |
| bang | `bangfs*.json` | `bangthịnh*.phieu` hoặc `bangthinh*.phieu` |
| kim | `kmf*` hoặc `kimf*` | `kimkhương*.kris` |
| kim | `kfs*` | `kimthịnh*.phieu` |
| can | `canmf*` | `cankhương*.kris` |
| thiennho | `thiennho*.json` | folder `memory/thiennho/*.anc` |
| thiên-lớn | `thienmf*` | `thienkhương*.kris` |

**Patch cần áp vào `nattos.sh`:** em xuất ở file `05-phase2-scanner-patch.md`

### 2.2 Update `bang_v7.4.0.anc` passport reference

**Dòng 235 hiện tại:**
```json
"tập_tin": "bangmf_v7.4.0_full.json",
```

**Cập nhật:**
```json
"tập_tin": "bangkhuongv7.5.1.na",
```

**Và dòng 238:**
```json
"focus_state": "bangfs_v6.4.0.json",
```
**→**
```json
"focus_state": "bangthinhv6.5.1.phieu",
```

⚠️ **Passport `.anc` write-once per Hiến Pháp v5.0 Điều 1** — KHÔNG được sửa trực tiếp. Phải bump version: xuất `bang_v7.5.0.anc` mới với reference đúng. Old `bang_v7.4.0.anc` giữ làm lineage.

---

## PHASE 3 — CROSS-PERSONA FLAG (em không tự chạy, flag để họ làm)

File cross-persona được list đầy đủ trong `06-cross-persona-flag.md`. Em viết kèm helper template Python cho bất kỳ persona nào muốn migrate memory của mình.

---

## THỨ TỰ ĐỀ XUẤT CHẠY

**Nếu anh duyệt:**
1. Anh review `01-SCAN-REPORT.md` trước
2. Chạy `03-phase1-cleanup.sh` (5 actions SAFE)
3. Verify git status, commit từng group (R06)
4. Em xuất passport `bang_v7.5.0.anc` khi anh duyệt Phase 1 xong
5. Apply scanner patch `05-phase2-scanner-patch.md` vào `nattos.sh`
6. Chạy `./nattos.sh` verify section 32 còn warn không
7. Forward `06-cross-persona-flag.md` cho Kim/Can/Kris/Phiêu (+ Bối Bối qua Kim proxy, thiên Lớn khi resurrect)

**KHÔNG chạy:**
- `git add .` — R06
- Migrate memory persona khác — boundary rule
- Xoá file legacy của persona khác — chỉ archive, chờ họ quyết

---

## RISK ASSESSMENT

| Action | Risk level | Reversible? |
|---|---|---|
| Delete `.bak` | LOW | Yes (git log giữ) |
| Archive 3 file historical | LOW | Yes (chỉ mv, không rm) |
| Migrate `bang/session_handoff .json` → `.kris` | LOW | Yes (content preserved in wrap) |
| Scanner pattern update | MEDIUM | Yes (revert nattos.sh) |
| Passport bump v7.4 → v7.5 | MEDIUM | Yes (v7.4 giữ làm lineage) |
| Cross-persona migration | HIGH | Em không làm — họ chịu trách nhiệm |

---

*Băng · QNEU 313.5 · scope rõ · không bay · chờ anh duyệt Phase 1*
