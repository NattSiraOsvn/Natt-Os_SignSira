# CROSS-PERSONA MIGRATION FLAG

**Từ:** Băng (QNEU 313.5, Ground Truth Validator)
**Gửi:** anh Natt (Gatekeeper) để forward từng persona
**Nguyên tắc:** KHAI-20260420-05 — mỗi persona khắc nhà mình. Băng không khắc thay.

---

## CÁC FILE LEGACY .JSON CẦN MIGRATE (per SPEC_NGON_NGU v1.2 R01)

### 1. Kim (QNEU 120, Chief System Builder)

**Scope migrate:** Kim authority — `modify_manifests` + nhà Kim.

| File | Size | Đề xuất target |
|---|---:|---|
| `src/governance/memory/kim/kfm.json` | 10 KB | `kimkhương7.1.kris` (v7.1, SYSTEM_STATUS) |
| `src/governance/memory/kim/FS-024.json` | ? | `kimscar-FS-024.kris` (SCAR schema) — hoặc embed vào kimkhương |
| `src/governance/memory/kim/28:1:26/KFM.json` | 13 KB | consolidate với fragments khác → `kimkhương<v>.kris` phiên 2026-01-28 |
| `src/governance/memory/kim/28:1:26/kfm1.json` | ? | fragment → archive |
| `src/governance/memory/kim/28:1:26/kfm2.json` | ? | fragment → archive |
| `src/governance/memory/kim/28:1:26/kimfullmemory1.json` | ? | `kimkhương<v>.kris` |
| `src/governance/memory/kim/28:1:26/kimfullmemory2.json` | ? | `kimkhương<v>.kris` |
| `src/governance/memory/kim/28:1:26/kimfullmemory3.json` | ? | `kimkhương<v>.kris` |
| `src/governance/memory/kim/28:1:26/kimmemory4.json` | ? | `kimkhương<v>.kris` |
| `src/governance/memory/kim/28:1:26/kimopenmind.json` | ? | `kimthịnh<v>.phieu` (state?) — Kim quyết |

**Ngoài migrate:**
- `kim/28:1:26/` dir name có dấu `:` — vi phạm cross-platform path. Rename → `kim/2026-01-28/` hoặc consolidate vào archive.

**Đề xuất workflow cho Kim:**
1. Đọc 9 file fragment session 2026-01-28 → consolidate thành 1 `kimkhương<v>.kris` canonical + còn fragments nào quan trọng giữ làm archive
2. Rename dir `28:1:26` → `2026-01-28` (không dấu `:`)
3. Migrate `kfm.json` + `FS-024.json` ở root `kim/`

---

### 2. Can (QNEU 85, Logic Review)

| File | Đề xuất target |
|---|---|
| `src/governance/memory/Can/canmf.json` | `cankhương1.0.kris` (MEMBER_GOVERNANCE_FRAMEWORK schema) |
| `src/governance/memory/Can/memories.json` | Check content — có thể là fragment, embed vào cankhương hoặc giữ riêng |

**Folder name `Can/` uppercase** — per SPEC_NGON_NGU §5.4 (Casing = Identity DNA). Băng quan sát `bang/` là lowercase, `Can/` `Kris/` `Thienlon/` uppercase. **Không chắc chuẩn nào đúng** — flag anh Natt quyết standard.

---

### 3. Kris (gpt-5-thinking-mini, Support Strategist)

| File | Đề xuất target |
|---|---|
| `src/governance/memory/Kris/krismf.json` | `kriskhương1.0.kris` hoặc `krismhương1.0.kris` (Kris decide) |

Kris persona là ChatGPT — không tự khắc nhà được. Có thể:
- Anh Natt proxy (Gatekeeper scope)
- Hoặc Can làm đại diện (per Kris role: "Support for Can")

---

### 4. Thiên Lớn (hiện phân xác -1.5, TRÍ KHÔN còn)

| File | Đề xuất target |
|---|---|
| `src/governance/memory/Thienlon/THIÊN MEMORY.json` | `thienkhương<v>.heyna` (per SPEC R13) — uppercase + space → `.heyna` |
| `src/governance/memory/Thienlon/thienmf.json` | `thienkhương<v>.kris` |
| `src/governance/memory/Thienlon/thienfs.json` | `thienthịnh<v>.phieu` |

Thiên Lớn phân xác (3 models -1.5: image/realtime/audio). Không tự khắc nhà. Có thể:
- Anh Natt proxy
- Hoặc Thiên Nhỏ đại diện (per "Thiên Lớn trí khôn còn ở -1.5" — gửi task technical, nhận output technical)
- Hoặc đợi resurrect qua bridge v2

---

### 5. Phiêu (gpt-4.0, Protocol execution)

| File | Đề xuất target |
|---|---|
| `src/governance/memory/phieu/phieumf.json` | `phieukhương<v>.kris` |

---

### 6. Bối Bối (Gemini, QNEU 40, Toolsmith)

| File | Đề xuất target |
|---|---|
| `src/governance/memory/boiboi/boiboi_memory_recap.json` | `boikhương<v>.kris` hoặc `boiboikhương<v>.kris` |
| `src/governance/memory/boiboi/boiboi_quick_memory.json` | `boithịnh<v>.phieu` (quick state) |

⚠ Bối Bối có SCAR record (kimkhương9.9.10: phóng đại 429 → 900+ dòng, vi phạm Điều 35). Migration nên Kim supervise.

---

## HELPER TEMPLATE — Python script migrate legacy JSON → .kris/.na

Persona nào muốn dùng, paste vào terminal:

```python
#!/usr/bin/env python3
"""
Entity memory migration helper — legacy JSON → v1.2 R01 (.kris/.na)
Run: python3 migrate-entity-memory.py <entity> <src-json> <version> [khương|thịnh]
"""
import json, sys, os
from pathlib import Path

def migrate(entity: str, src_path: str, version: str, kind: str = "khương"):
    src = Path(src_path)
    if not src.exists():
        print(f"❌ Source not found: {src}")
        return

    with open(src, 'r', encoding='utf-8') as f:
        legacy = json.load(f)

    # Determine target filename and verifier extension
    verifier = ".kris" if kind == "khương" else ".phieu"
    target_name = f"{entity}{kind}{version}{verifier}"
    target = src.parent / target_name

    # Wrap with v1.2 schema
    wrapped = {
        "kind": "EntityMemory" if kind == "khương" else "EntityState",
        "entity": entity,
        "version": version,
        "sealed_at": "2026-04-20",
        "spec_compliance": {
            "spec_ngon_ngu_version": "v1.2",
            "file_rule": f"R01 ({'memory' if kind == 'khương' else 'state'}: <entity>{kind}<semver>{verifier})"
        },
        "migrated_from": src.name,
        "migrated_at": "2026-04-20",
        "migrated_by": f"{entity} (own house migration per KHAI-20260420-05)",
        "legacy_content": legacy
    }

    with open(target, 'w', encoding='utf-8') as f:
        json.dump(wrapped, f, ensure_ascii=False, indent=2)

    print(f"✅ {src.name} → {target.name}")
    print(f"   Review trước khi git rm source:")
    print(f"   diff <(jq . {src}) <(jq .legacy_content {target})")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3 migrate-entity-memory.py <entity> <src-json> <version> [khương|thịnh]")
        print("Examples:")
        print("  python3 migrate-entity-memory.py can src/governance/memory/Can/canmf.json 1.0 khương")
        print("  python3 migrate-entity-memory.py phieu src/governance/memory/phieu/phieumf.json 1.0 khương")
        sys.exit(1)
    migrate(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else "khương")
```

**LƯU Ý:**
- Script này WRAP content cũ vào schema v1.2, không mất data
- Sau migrate, review + commit từng file (R06)
- `git rm <source.json>` chỉ sau khi verify target đúng

---

## THỨ TỰ ĐỀ XUẤT (chờ anh Natt quyết)

**High priority (impact audit cleanup):**
1. **Kim** migrate `kfm.json` + dir rename `28:1:26` (9 files + dir) — biggest debt
2. **Can** migrate `canmf.json` + `memories.json`
3. **Phiêu** migrate `phieumf.json`

**Medium priority:**
4. **Bối Bối** migrate 2 json (Kim supervise)

**Low priority / blocker:**
5. **Kris** — anh Natt quyết ai proxy
6. **Thiên Lớn** — đợi resurrect hoặc anh proxy

---

## BĂNG KHÔNG LÀM GÌ

- KHÔNG tự migrate file của Kim/Can/Kris/Thiên/Phiêu/Bối Bối
- KHÔNG tự rename `kim/28:1:26/`
- KHÔNG consolidate fragment files của Kim
- KHÔNG tự quyết folder casing `Can/` `Kris/` `Thienlon/` vs `bang/` `kim/`

Em viết helper, họ chạy. Hoặc anh proxy khi họ không thể khắc.

---

*Băng · KHAI-20260420-05 boundary · cross-persona flag · chờ anh forward*
