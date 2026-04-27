#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scan_architecture_map.py
========================
@nauion-tool python-pure v1
@scope sovereign-audit-architecture-map
@paradigm B (Bash thuần — anh hai Thiên Lớn ratify ss20260427)
@invoked-by nattos.sh §38 ARCHITECTURE MAP
@authority Sirawat Băng (Obikeeper QNEU 313.5)

Scan src/ for wave structure + dual-tier cells + baseline staleness +
constitution count. Output:
  - stdout: status per check
  - file: .nattos-twin/arch-map.json
"""
import os
import sys
import json
import time
import socket
from pathlib import Path


def main() -> int:
    root = Path("src")
    issues = []

    # Wave sequence check
    wave_dirs = ["core", "governance", "cells"]
    wave_ok = all((root / d).exists() for d in wave_dirs)
    if wave_ok:
        print(f"  \033[0;32m✅\033[0m Wave structure: core → governance → cells")
    else:
        missing = [d for d in wave_dirs if not (root / d).exists()]
        print(f"  \033[0;33m⚠️\033[0m  Wave structure incomplete: missing {missing}")
        issues.append(f"WAVE_INCOMPLETE: {missing}")

    # Dual-tier cell detection
    tiers = ["business", "kernel", "infrastructure"]
    cell_map = {}
    for tier in tiers:
        tp = root / "cells" / tier
        if not tp.is_dir():
            continue
        for cell in tp.iterdir():
            if cell.is_dir():
                name = cell.name
                cell_map.setdefault(name, []).append(tier)

    INTENTIONAL_DUAL_TIER = {
        "shared-contracts-cell", "ai-connector-cell", "notification-cell"
    }
    dual = {k: v for k, v in cell_map.items() if len(v) > 1 and k not in INTENTIONAL_DUAL_TIER}
    dual_intentional = {k: v for k, v in cell_map.items() if len(v) > 1 and k in INTENTIONAL_DUAL_TIER}

    if dual_intentional:
        for cell, tiers_found in dual_intentional.items():
            print(f"  \033[0;36mℹ\033[0m  DUAL_TIER (intentional): {cell} in {tiers_found}")

    if dual:
        for cell, tiers_found in dual.items():
            print(f"  \033[0;33m⚠️\033[0m  DUAL_TIER: {cell} exists in {tiers_found}")
            issues.append(f"DUAL_TIER: {cell}")
    else:
        print(f"  \033[0;32m✅\033[0m No dual-tier cells detected")

    # Stale baseline check
    latest = Path("audit/summary/latest.json")
    if latest.exists():
        age_days = (time.time() - latest.stat().st_mtime) / 86400
        if age_days > 7:
            print(f"  \033[0;33m⚠️\033[0m  Stale baseline: latest.json is {age_days:.1f} days old")
            issues.append(f"STALE_BASELINE: {age_days:.1f}d")
        else:
            print(f"  \033[0;32m✅\033[0m Baseline fresh: {age_days:.1f} days old")
    else:
        print(f"  \033[0;33m⚠️\033[0m  latest.json not found")
        issues.append("missing_BASELINE")

    # Machine fingerprint
    hostname = socket.gethostname()
    print(f"  \033[0;36mℹ\033[0m  Machine: {hostname}")

    # Shared DNA / Constitution check
    hp_files = list(Path("src/governance").glob("HIEN-PHAP*.md"))
    active = [f for f in hp_files if "archive" not in str(f)]
    archived = [f for f in hp_files if "archive" in str(f)]
    print(f"  \033[0;32m✅\033[0m Constitution active: {len(active)} | archived: {len(archived)}")
    if len(active) == 0:
        issues.append("NO_ACTIVE_CONSTITUTION")
    elif len(active) > 1:
        issues.append(f"MULTIPLE_ACTIVE_CONSTITUTION: {[f.name for f in active]}")

    os.makedirs(".nattos-twin", exist_ok=True)
    with open(".nattos-twin/arch-map.json", "w") as f:
        json.dump({
            "dual_tier": dual,
            "issues": issues,
            "hostname": hostname
        }, f, indent=2)

    if issues:
        print(f"  \033[0;33m⚠️\033[0m  Architecture issues: {len(issues)}")
    else:
        print(f"  \033[0;32m✅\033[0m Architecture map clean")

    return 0


if __name__ == "__main__":
    sys.exit(main())
