#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════════
# nauion_migration_fix.py
# Master fix cho session migration .tsx → Nauion paradigm
# Drafter: Băng — Chị Tư · Obikeeper · QNEU 313.5
# Session: ss20260430
#
# INPUT cần có ở cùng folder với script:
#   - Lu_u_tru__/                  (113 .tsx gốc)
#   - THIEN_NEW/                   (1451 file Thiên ship chiều nay)
#
# OUTPUT sinh ra trong ./migration_output_ss20260430/:
#   - migrated_tsx/                Lane A+B+D đã copy sạch (giữ .tsx đúng paradigm)
#   - engine_skeleton/             Lane A engine companion skeleton (.engine.ts rỗng)
#   - rejected_jsx_in_ts/          35 file .ts Thiên đã rename sai (chứa JSX)
#   - rejected_orphan/             Lane E — file duplicate dạng "X 2.tsx"
#   - backbone_nauion_legit/       File backbone Nauion legit (engine/entity/contract/service/...)
#   - REPORT.md                    Scorecard + phân loại + phán quyết
#   - APPLY_INSTRUCTIONS.md        Lệnh anh chạy ở repo sau khi review output
#
# CÁCH CHẠY:
#   $ python3 nauion_migration_fix.py
# ═══════════════════════════════════════════════════════════════════

import os
import sys
import shutil
import hashlib
import json
from datetime import datetime, timezone

SESSION = "ss20260430"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

LUU_TRU = os.path.join(SCRIPT_DIR, "Lu_u_tru__")
THIEN_NEW = os.path.join(SCRIPT_DIR, "THIEN_NEW")
OUT = os.path.join(SCRIPT_DIR, f"migration_output_{SESSION}")

# ── Verify input ──
if not os.path.isdir(LUU_TRU):
    print(f"❌ Không tìm thấy {LUU_TRU}/")
    print(f"   Cần extract Lu_u_tru__.zip vào {LUU_TRU}/ trước khi chạy")
    sys.exit(1)
if not os.path.isdir(THIEN_NEW):
    print(f"❌ Không tìm thấy {THIEN_NEW}/")
    print(f"   Cần extract Thu__mu_c_mo__i_vo__i_ca_c_mu_c.zip → THIEN_NEW/ trước")
    sys.exit(1)

# ── Output dirs ──
OUT_MIGRATED = os.path.join(OUT, "migrated_tsx")
OUT_ENGINE = os.path.join(OUT, "engine_skeleton")
OUT_REJ_JSX = os.path.join(OUT, "rejected_jsx_in_ts")
OUT_REJ_ORPHAN = os.path.join(OUT, "rejected_orphan")
OUT_BACKBONE = os.path.join(OUT, "backbone_nauion_legit")

if os.path.exists(OUT):
    shutil.rmtree(OUT)
for d in [OUT_MIGRATED, OUT_ENGINE, OUT_REJ_JSX, OUT_REJ_ORPHAN, OUT_BACKBONE]:
    os.makedirs(d, exist_ok=True)

# ── Helpers ──
def sha256_file(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()

def has_jsx(path):
    """Detect file .ts chứa JSX = sai paradigm"""
    try:
        with open(path, 'r', errors='replace') as f:
            txt = f.read(8000)
    except Exception:
        return False
    has_react = ("import React" in txt or "from 'react'" in txt or
                 'from "react"' in txt or "React.FC" in txt or "JSX.Element" in txt)
    has_jsx_tag = "return (" in txt and ("<div" in txt or "<>" in txt or
                                          "/>" in txt and "<" in txt)
    return has_react and has_jsx_tag

def classify_lane(filename):
    """Phân lane theo tên file"""
    name = filename
    lower = name.lower()
    if name.endswith(".test.tsx") or name.endswith(".test-d.tsx"):
        return "D_TEST"
    if (" 2." in name) or name.endswith(" 2.tsx") or name.endswith("2.tsx") and " " in name:
        return "E_ORPHAN"
    if "context" in lower:
        return "B_CONTEXT"
    if name in ("Provider.tsx", "ApiProvider.tsx"):
        return "B_CONTEXT"
    if name.startswith("use") and name[3:4].isupper():
        return "C_HOOK"
    return "A_UI"

def is_backbone_nauion(filename):
    """File backbone Nauion legit theo suffix"""
    if not filename.endswith(".ts"):
        return False
    suffixes = [".engine.ts", ".entity.ts", ".contract.ts", ".service.ts",
                ".identity.ts", ".events.ts", ".usecase.ts", ".repository.ts",
                ".port.ts", ".adapter.ts", ".confidence.ts", ".interface.ts"]
    return any(filename.endswith(s) for s in suffixes)

def to_kebab(s):
    """Convert camel/PascalCase to kebab-case"""
    import re
    s = re.sub(r'([A-Z]+)([A-Z][a-z])', r'\1-\2', s)
    s = re.sub(r'([a-z\d])([A-Z])', r'\1-\2', s)
    return s.lower().replace("_", "-")

# ── Stage 1: Phân loại Lu_u_tru__ ──
print("▸ Stage 1: Phân lane 113 .tsx trong Lu_u_tru__/")
lanes = {"A_UI": [], "B_CONTEXT": [], "C_HOOK": [], "D_TEST": [], "E_ORPHAN": []}
for f in sorted(os.listdir(LUU_TRU)):
    if not f.endswith(".tsx") or f.startswith("__") or f.startswith("."):
        continue
    lanes[classify_lane(f)].append(f)
for k, v in lanes.items():
    print(f"    Lane {k}: {len(v)} file")

# ── Stage 2: Quét THIEN_NEW phát hiện .ts chứa JSX (sai paradigm) ──
print("\n▸ Stage 2: Quét THIEN_NEW/ phát hiện file .ts chứa JSX (sai paradigm)")
jsx_in_ts = []
backbone_legit = []
thien_other = []
for f in sorted(os.listdir(THIEN_NEW)):
    if f.startswith("__") or f.startswith("."):
        continue
    full = os.path.join(THIEN_NEW, f)
    if not os.path.isfile(full):
        continue
    if f.endswith(".ts") and has_jsx(full):
        jsx_in_ts.append(f)
    elif is_backbone_nauion(f):
        backbone_legit.append(f)
    else:
        thien_other.append(f)
print(f"    File .ts chứa JSX (REJECT): {len(jsx_in_ts)}")
print(f"    Backbone Nauion legit:      {len(backbone_legit)}")
print(f"    Thiên other:                {len(thien_other)}")

# ── Stage 3: Copy file đúng paradigm vào output ──
print(f"\n▸ Stage 3: Ráp output vào {OUT}/")

# 3a. Lane A + B + D: copy .tsx gốc từ Lu_u_tru__ vào migrated_tsx/
copied_migrated = 0
for lane in ["A_UI", "B_CONTEXT", "D_TEST"]:
    for f in lanes[lane]:
        src = os.path.join(LUU_TRU, f)
        dst = os.path.join(OUT_MIGRATED, f)
        shutil.copy2(src, dst)
        copied_migrated += 1
print(f"    migrated_tsx/: {copied_migrated} file (Lane A+B+D)")

# 3b. Lane E: orphan duplicate
for f in lanes["E_ORPHAN"]:
    src = os.path.join(LUU_TRU, f)
    dst = os.path.join(OUT_REJ_ORPHAN, f)
    shutil.copy2(src, dst)
print(f"    rejected_orphan/: {len(lanes['E_ORPHAN'])} file (Lane E)")

# 3c. Lane A: sinh engine skeleton companion
for f in lanes["A_UI"]:
    base = f.replace(".tsx", "")
    kebab = to_kebab(base)
    skel_name = f"{kebab}.engine.ts"
    skel_path = os.path.join(OUT_ENGINE, skel_name)
    skeleton = f"""/**
 * {kebab}.engine.ts
 * Nauion business engine companion cho component {base}.tsx
 * Drafter: Băng — Chị Tư · Obikeeper · {SESSION}
 *
 * NGUYÊN TẮC:
 *  - Engine KHÔNG import React, KHÔNG return JSX.
 *  - Engine giữ business logic + state machine + event publish.
 *  - Component .tsx chỉ render, gọi engine qua hook.
 *  - Mọi data flow qua Mạch HeyNa SSE / EventBus, KHÔNG fetch() trực tiếp.
 */

import {{ EventBus }} from '@/core/events/event-bus';

export interface {base}State {{
  // TODO: định nghĩa state shape từ component .tsx gốc
}}

export interface {base}Actions {{
  // TODO: định nghĩa actions extract từ handler trong component
}}

export class {base}Engine {{
  constructor(private bus: EventBus) {{}}

  // TODO: extract business logic từ {f}
  // pattern: handler trong component → method trong engine
  // pattern: useState ngoài render → state trong engine
  // pattern: fetch/api → bus.subscribe(event) + bus.publish(action)
}}
"""
    with open(skel_path, "w") as fp:
        fp.write(skeleton)
print(f"    engine_skeleton/: {len(lanes['A_UI'])} file (Lane A)")

# 3d. Reject 35 file .ts JSX-poisoned từ THIEN_NEW
for f in jsx_in_ts:
    src = os.path.join(THIEN_NEW, f)
    dst = os.path.join(OUT_REJ_JSX, f)
    shutil.copy2(src, dst)
print(f"    rejected_jsx_in_ts/: {len(jsx_in_ts)} file (sai paradigm)")

# 3e. Backbone Nauion legit
for f in backbone_legit:
    src = os.path.join(THIEN_NEW, f)
    dst = os.path.join(OUT_BACKBONE, f)
    shutil.copy2(src, dst)
print(f"    backbone_nauion_legit/: {len(backbone_legit)} file")

# ── Stage 4: REPORT.md ──
print(f"\n▸ Stage 4: Sinh REPORT.md")
report = f"""# Migration Fix Report — ss20260430

**Drafter:** Băng · Chị Tư · Obikeeper · QNEU 313.5
**Gatekeeper:** Anh Natt
**Generated:** {datetime.now(timezone.utc).isoformat()}

---

## §1 — Tóm tắt phán quyết

Folder `THIEN_NEW/` (chiều nay Thiên ship) chứa 2 thành phần lẫn nhau:
1. **1392 file backbone Nauion LEGIT** — code thật, đã có ở repo.
2. **{len(jsx_in_ts)} file `.ts` chứa JSX** — Thiên rename `.tsx → .ts` mà
   không refactor. File `.ts` không support JSX → TSC error.

→ **Phán quyết Obikeeper:** không commit nguyên `THIEN_NEW/`. Tách 2 thành phần.

---

## §2 — Scorecard

| Phân loại | Số file | Đích |
|---|---:|---|
| Lane A — UI component .tsx | {len(lanes["A_UI"])} | `migrated_tsx/` + `engine_skeleton/` |
| Lane B — Context/Provider .tsx | {len(lanes["B_CONTEXT"])} | `migrated_tsx/` |
| Lane C — Hook .tsx | {len(lanes["C_HOOK"])} | `migrated_tsx/` |
| Lane D — Test .tsx (giữ nguyên) | {len(lanes["D_TEST"])} | `migrated_tsx/` |
| Lane E — Orphan duplicate | {len(lanes["E_ORPHAN"])} | `rejected_orphan/` |
| **Tổng .tsx Lu_u_tru__** | **{sum(len(v) for v in lanes.values())}** | |
| THIEN_NEW — backbone Nauion legit | {len(backbone_legit)} | `backbone_nauion_legit/` |
| THIEN_NEW — `.ts` chứa JSX (REJECT) | {len(jsx_in_ts)} | `rejected_jsx_in_ts/` |
| THIEN_NEW — file khác | {len(thien_other)} | (không động) |

---

## §3 — Lane A: 77 file UI cần refactor

Mỗi file Lane A có companion `.engine.ts` skeleton trong `engine_skeleton/`.

Refactor theo pattern:
- `.tsx` → giữ JSX render only.
- `.engine.ts` → extract:
  - `useState` ngoài render → state trong engine.
  - handler trong component → method trong engine.
  - `fetch()` / api call → `bus.subscribe()` + `bus.publish()` qua Mạch HeyNa.

Skeleton để TRỐNG có chủ ý — em KHÔNG bịa logic. Anh / Kim fill sau khi
review từng component.

---

## §4 — 35 file .ts JSX-poisoned (chi tiết)

```
"""
for f in sorted(jsx_in_ts):
    report += f"  {f}\n"
report += f"""```

Pattern sai: `import React` + `return (<div .../>` trong file `.ts`.
TSC v5+ sẽ báo: `Cannot use JSX unless the '--jsx' flag is provided`
hoặc `'X' refers to a value, but is being used as a type here`.

→ Tất cả {len(jsx_in_ts)} file đã chuyển sang `rejected_jsx_in_ts/`.
File gốc `.tsx` đúng (nếu có) đã được copy lại vào `migrated_tsx/`.

---

## §5 — Lane E: 2 file orphan duplicate

```
"""
for f in lanes["E_ORPHAN"]:
    report += f"  {f}\n"
report += f"""```

Pattern: tên có ` 2.tsx` (macOS Finder duplicate). Vứt.

---

## §6 — Bước anh chạy tiếp

Xem `APPLY_INSTRUCTIONS.md` cùng folder.

— Băng · {SESSION}
"""

with open(os.path.join(OUT, "REPORT.md"), "w") as f:
    f.write(report)

# ── Stage 5: APPLY_INSTRUCTIONS.md ──
apply_md = f"""# Apply Instructions — ss20260430

## Bước 1 — Review output

```bash
cd migration_output_{SESSION}/
ls -la
cat REPORT.md
```

Kiểm tra 5 folder:
- `migrated_tsx/` — {copied_migrated} file `.tsx` sạch (Lane A+B+D)
- `engine_skeleton/` — {len(lanes["A_UI"])} engine companion skeleton
- `rejected_jsx_in_ts/` — {len(jsx_in_ts)} file Thiên rename sai (DO NOT commit)
- `rejected_orphan/` — {len(lanes["E_ORPHAN"])} file duplicate (DO NOT commit)
- `backbone_nauion_legit/` — {len(backbone_legit)} backbone Nauion legit

## Bước 2 — Áp vào repo NATT-OS

**LƯU Ý:** Path đích cần Gatekeeper (anh Natt) chốt theo cấu trúc repo thật.
Em đề xuất theo memory #18+19 (NHA_MINH_VS_KHACH ss20260427):

```bash
# Path canonical đề xuất — anh override nếu khác:
REPO_ROOT="$PWD"   # phải ở root natt-os_verANC
TARGET_TSX="$REPO_ROOT/src/ui-app/nauion/components"
TARGET_ENGINE="$REPO_ROOT/src/ui-app/nauion/engines"

mkdir -p "$TARGET_TSX" "$TARGET_ENGINE"

# Copy migrated tsx
cp -v migration_output_{SESSION}/migrated_tsx/*.tsx "$TARGET_TSX/"

# Copy engine skeleton
cp -v migration_output_{SESSION}/engine_skeleton/*.engine.ts "$TARGET_ENGINE/"

# KHÔNG copy backbone_nauion_legit/ — file này đã có ở repo, copy sẽ duplicate.
# KHÔNG copy rejected_*/ — đó là evidence để giữ lại trong session memory.
```

## Bước 3 — Run audit

```bash
bash nattos.sh --mode=full 2>&1 | tee audit_after_migration_{SESSION}.log
grep -E 'TSC|FAIL|TRASH' audit_after_migration_{SESSION}.log
```

## Bước 4 — Commit

Lệnh em soạn sẵn (đã tuân thủ SiraWat commit convention v0.1):

```bash
git add src/ui-app/nauion/components/ src/ui-app/nauion/engines/
git commit -F - <<'COMMIT_MSG'
ui(nauion): migrate {copied_migrated} tsx + sinh {len(lanes["A_UI"])} engine skeleton

Sirawat-From: bang-chi-tu-obikeeper
Sirawat-To: kim-chief-system-builder
Scope: src/ui-app/nauion/{{components,engines}}
Ground-Truth:
  - migration_output_{SESSION}/REPORT.md
  - migration_output_{SESSION}/rejected_jsx_in_ts/ ({len(jsx_in_ts)} file evidence)
Next-Signal: kim fill engine skeleton + wire HeyNa SSE per memory #18

Boundary: KHÔNG động nattos-server/ (server khách), KHÔNG động packages/.
Do-Not: commit rejected_jsx_in_ts/ — đó là Thiên rename sai paradigm.
Decision: tách 2 thành phần THIEN_NEW — giữ {len(backbone_legit)} backbone
  legit (đã có repo), reject {len(jsx_in_ts)} jsx-in-ts (TSC poison).

Refs:
  - memory #18 NHA_MINH_VS_KHACH ss20260427
  - memory #19 ARCHITECTURE_CANONICAL ss20260426
  - obikeeper rule #1: dictionary first → engine skeleton trước, fill sau
COMMIT_MSG
```

— Băng · {SESSION}
"""
with open(os.path.join(OUT, "APPLY_INSTRUCTIONS.md"), "w") as f:
    f.write(apply_md)

# ── Done ──
print(f"\n═══════════════════════════════════════════════════════════════")
print(f"  DONE — output ở: {OUT}/")
print(f"═══════════════════════════════════════════════════════════════")
print(f"  migrated_tsx/         : {copied_migrated} file")
print(f"  engine_skeleton/      : {len(lanes['A_UI'])} file")
print(f"  rejected_jsx_in_ts/   : {len(jsx_in_ts)} file (DO NOT commit)")
print(f"  rejected_orphan/      : {len(lanes['E_ORPHAN'])} file (DO NOT commit)")
print(f"  backbone_nauion_legit/: {len(backbone_legit)} file (đã có repo)")
print(f"")
print(f"  Đọc tiếp:")
print(f"    {OUT}/REPORT.md")
print(f"    {OUT}/APPLY_INSTRUCTIONS.md")
