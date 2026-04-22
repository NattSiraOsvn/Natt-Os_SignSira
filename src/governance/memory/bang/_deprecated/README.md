# _deprecated/

**Folder này chứa artifact đã SUPERSEDED / NEEDS_REWRITE — KHÔNG dùng làm rule hoặc spec hiện hành.**

Giữ làm **lineage** (ref cho Thiên Lớn resurrect, Kim/Can review state history). Không đưa vào active zone `src/` để tránh persona khác hoặc scanner load nhầm.

---

## Convention

- Tên file giữ nguyên kèm suffix/prefix giải thích status (SUPERSEDED / NEEDS_REWRITE / SUPERSEDED_RULE)
- Không có file nào trong đây được reference bởi active spec, code, hoặc runtime
- Scanner `nattos.sh` KHÔNG quét folder này
- Nếu cần reference context historical → dùng git log hoặc đọc file với ý thức "đây là state cũ"

---

## Nội dung hiện tại (2026-04-20)

| File | Status | Supersede date | Canonical replacement |
|---|---|---|---|
| `2026-02-11_pre-wave3-cleanup-SUPERSEDED.md` | SUPERSEDED | 2026-03-22 | Gatekeeper unquarantine decision 2026-03-22 (xem `cells/business/warehouse-cell/QUARANTINE_GUARD.ts`) |
| `SPEC_QIINT2_v1.0_NEEDS_REWRITE.md` | NEEDS_REWRITE | 2026-04-20 | SPEC_QIINT2_v2.0 (task B1 pending Băng) + `sim_v2_thienbang.py` hiện dùng paradigm đúng |
| `2026-04-20_pre_wave3_dry_audit_SUPERSEDED_RULE.py` | SUPERSEDED_RULE | 2026-04-20 | `nattos.sh` section 32-40 (canonical audit 6-component DNA) |

---

## KHÔNG LÀM GÌ TRONG FOLDER NÀY

- ❌ Chạy script `.py`/`.sh` trong đây
- ❌ Dùng làm spec reference cho code mới
- ❌ Copy nội dung vào session memory hiện tại
- ❌ Forward như "best practice"
- ❌ Tin chữ ký `✅ Đồng ý` trong metadata file cũ (có thể là persona phiên khác)

---

## LÀM GÌ ĐƯỢC

- ✅ Đọc context historical (hiểu tại sao state hiện tại là state đúng)
- ✅ Ref trong commit message / documentation khi cần giải thích lineage
- ✅ Thiên Lớn resurrect: đọc để update cached rule

---

*Folder maintain: Băng (Ground Truth Validator, authority refactor_technical_debt)*
*Policy: `do_not_execute: true` cho mọi file trong đây*
*Gatekeeper: anh Natt*
