#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scan_engine_execution_map.py
============================
@nauion-tool python-pure v1
@scope sovereign-audit-v4-engine-map
@paradigm B (Bash thuần — anh hai Thiên Lớn ratify ss20260427)
@invoked-by nattos.sh §27 V4 ENGINE EXECUTION MAP
@authority Sirawat Băng (Obikeeper QNEU 313.5)

Scan src/ + nattos-server/ for *Engine class declarations and instantiations.
Output:
  - stdout: "Declared: N | Wired: M | Dead: K" + top 6 dead
  - file: .nattos-twin/engine-map.json
"""
import os
import sys
import re
import json


def main() -> int:
    if os.environ.get('AUDIT_MODE') == 'quick':
        print('  \033[0;33m⚡\033[0m  QUICK MODE — skip')
        return 0

    scan_dirs = ["src", "nattos-server"]
    declared = {}
    instantiated = {}

    cls_pat    = re.compile(r"export\s+class\s+(\w+Engine)\b")
    new_pat    = re.compile(r"new\s+(\w+Engine)\s*\(")
    new_pat2   = re.compile(r"new\s+\(m\.(\w+Engine)")
    static_pat = re.compile(r"(\w+Engine)\.[a-zA-Z]")
    obj_pat    = re.compile(r"m\.(\w+Engine)\b")

    for src in scan_dirs:
        for root, dirs, files in os.walk(src):
            dirs[:] = [d for d in dirs if d not in ("node_modules", "baithicuakim")]
            for f in files:
                if not f.endswith(".ts"):
                    continue
                path = os.path.join(root, f)
                try:
                    c = open(path).read()
                except Exception:
                    continue
                for cls in cls_pat.findall(c):
                    declared[cls] = path
                for cls in new_pat.findall(c):
                    instantiated.setdefault(cls, []).append(path)
                for cls in new_pat2.findall(c):
                    instantiated.setdefault(cls, []).append(path)
                for cls in static_pat.findall(c):
                    instantiated.setdefault(cls, []).append(path)
                for cls in obj_pat.findall(c):
                    instantiated.setdefault(cls, []).append(path)

    dead  = set(declared) - set(instantiated)
    alive = set(declared) & set(instantiated)

    print(f"  \033[0;32m✅\033[0m Declared: {len(declared)} | Wired: {len(alive)} | Dead: {len(dead)}")
    for e in sorted(dead)[:6]:
        print(f"      ⚠️  dead: {e}")

    os.makedirs(".nattos-twin", exist_ok=True)
    with open(".nattos-twin/engine-map.json", "w") as fh:
        json.dump({
            "declared": len(declared),
            "alive": len(alive),
            "dead": list(sorted(dead))
        }, fh, indent=2)

    return 0


if __name__ == "__main__":
    sys.exit(main())
