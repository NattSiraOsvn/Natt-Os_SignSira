#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scan_cell_dna.py
================
@nauion-tool python-pure v1
@scope sovereign-audit-cell-dna-6-component
@paradigm B (Bash thuần — anh hai Thiên Lớn ratify ss20260427)
@invoked-by nattos.sh §9 CELL DNA CHECK — 6-Component Anatomy per Cell
@authority Sirawat Băng (Obikeeper QNEU 313.5)

Scan src/cells/{business,kernel,infrastructure}/ for 6-component DNA:
  manifest, domain, ports, application, engine, SmartLink
Output:
  - stdout: healthy/sick count + missing components per sick cell
  - file: .nattos-twin/cell-dna.json
"""
import os
import sys
import json


def check_manifest(p: str) -> bool:
    return any(f.endswith(".cell.anc")
               for f in os.listdir(p) if os.path.isfile(os.path.join(p, f)))


def check_domain(p: str) -> bool:
    return os.path.isdir(os.path.join(p, "domain"))


def check_ports(p: str) -> bool:
    return os.path.isdir(os.path.join(p, "ports"))


def check_application(p: str) -> bool:
    return os.path.isdir(os.path.join(p, "application"))


def check_engine(p: str) -> bool:
    for r, d, fs in os.walk(p):
        for f in fs:
            if f.endswith(".engine.ts"):
                return True
    return False


def check_smartlink(p: str) -> bool:
    # case-i + multi-ext per lowercase_surface ss20260425
    for r, d, fs in os.walk(p):
        for f in fs:
            if f.endswith((".ts", ".sira", ".na")):
                try:
                    content = open(os.path.join(r, f), errors="ignore").read().lower()
                    if "smartlink" in content:
                        return True
                except Exception:
                    pass
            if "smartlink" in f.lower():
                return True
    return False


REQUIRED_COMPONENTS = {
    "manifest":    check_manifest,
    "domain":      check_domain,
    "ports":       check_ports,
    "application": check_application,
    "engine":      check_engine,
    "SmartLink":   check_smartlink,
}


def main() -> int:
    results = {}
    sick_cells = []
    healthy_cells = []

    for tier in ("business", "kernel", "infrastructure"):
        tp = f"src/cells/{tier}"
        if not os.path.isdir(tp):
            continue
        for cell in sorted(os.listdir(tp)):
            cp = os.path.join(tp, cell)
            if not os.path.isdir(cp):
                continue

            score = {}
            for comp, check in REQUIRED_COMPONENTS.items():
                try:
                    score[comp] = check(cp)
                except Exception:
                    score[comp] = False

            missing = [k for k, v in score.items() if not v]
            present = [k for k, v in score.items() if v]
            results[cell] = {
                "tier": tier,
                "score": len(present),
                "missing": missing,
                "present": present
            }

            if missing:
                sick_cells.append(cell)
            else:
                healthy_cells.append(cell)

    healthy_count = len(healthy_cells)
    sick_count = len(sick_cells)
    print(f"  \033[0;32m✅\033[0m DNA đầy đủ: {healthy_count} cells")
    if sick_count > 0:
        print(f"  \033[0;31m❌\033[0m DNA thiếu component: {sick_count} cells\n")
        for cell in sick_cells:
            r = results[cell]
            missing_str = ", ".join(r["missing"])
            print(f"    🧬  {cell} [{r['score']}/6] — THIẾU: {missing_str}")
    else:
        print(f"  \033[0;32m✅\033[0m Tất cả cells DNA 6/6 đầy đủ")

    print(f"\n  Cells ít files nhất (có thể là shell):")
    file_counts = []
    for tier in ("business", "kernel", "infrastructure"):
        tp = f"src/cells/{tier}"
        if not os.path.isdir(tp):
            continue
        for cell in sorted(os.listdir(tp)):
            cp = os.path.join(tp, cell)
            if not os.path.isdir(cp):
                continue
            fc = sum(len(fs) for r, d, fs in os.walk(cp))
            file_counts.append((fc, cell))

    for fc, cell in sorted(file_counts)[:8]:
        icon = "⚠️ " if fc <= 6 else "  "
        print(f"    {icon} {cell}: {fc} files")

    os.makedirs(".nattos-twin", exist_ok=True)
    with open(".nattos-twin/cell-dna.json", "w") as fh:
        json.dump({
            "healthy": healthy_count,
            "sick": sick_count,
            "details": results,
            "sick_list": sick_cells
        }, fh, indent=2, ensure_ascii=False)

    return 0


if __name__ == "__main__":
    sys.exit(main())
