#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scan_scorecard_json.py
======================
@nauion-tool python-pure v1
@scope sovereign-audit-scorecard-json-export
@paradigm B (Bash thuần — anh hai Thiên Lớn ratify ss20260427)
@invoked-by nattos.sh §46 SCORECARD when --json mode
@authority Sirawat Băng (Obikeeper QNEU 313.5)

Generate scorecard JSON from env vars passed by nattos.sh.
Reads from os.environ:
  NATT_TS, NATT_TOTAL_OK, NATT_TOTAL_WARN, NATT_TOTAL_FAIL, NATT_TOTAL_TRASH,
  NATT_BRANCH, NATT_COMMITS, NATT_DIRTY, NATT_REMOTE,
  NATT_TS_COUNT, NATT_TS_LINES, NATT_V2_FILES, NATT_V1_FILES,
  NATT_KERNEL_OK, NATT_KERNEL_TOTAL,
  NATT_BIZ_TOTAL, NATT_BIZ_6OF6, NATT_BIZ_WIRED, NATT_BIZ_NOT_WIRED,
  NATT_PROC_COUNT, NATT_NORM_COUNT, NATT_HEAL_COUNT,
  NATT_BCTC_OK, NATT_BCTC_TOTAL, NATT_PROD_OK, NATT_PROD_TOTAL,
  NATT_ISSUES_JSON  (JSON array string of issue messages)
Output:
  - stdout: JSON pretty-printed
"""
import os
import sys
import json


def env_int(key: str, default: int = 0) -> int:
    v = os.environ.get(key, "").strip()
    try:
        return int(v) if v else default
    except ValueError:
        return default


def env_str(key: str, default: str = "") -> str:
    return os.environ.get(key, default)


def count_files(path: str, ext: str = '.ts') -> int:
    c = 0
    for r, d, f in os.walk(path):
        c += sum(1 for x in f if x.endswith(ext))
    return c


def main() -> int:
    cells = {}
    biz_path = 'src/cells/business'
    if os.path.isdir(biz_path):
        for cell in sorted(os.listdir(biz_path)):
            cp = os.path.join(biz_path, cell)
            if not os.path.isdir(cp):
                continue
            has_mf = any(f.endswith(".cell.anc")
                         for f in os.listdir(cp)
                         if os.path.isfile(os.path.join(cp, f)))
            ports_path = os.path.join(cp, 'ports')
            has_port = False
            if os.path.isdir(ports_path):
                has_port = any('SmartLink' in f
                               for r, d, fs in os.walk(ports_path)
                               for f in fs)
            has_domain = os.path.isdir(os.path.join(cp, 'domain'))
            fc = count_files(cp)
            cells[cell] = {
                'files': fc,
                'manifest': has_mf,
                'SmartLink_port': has_port,
                'domain': has_domain,
            }

    issues_raw = os.environ.get("NATT_ISSUES_JSON", "[]")
    try:
        issues = json.loads(issues_raw)
        if not isinstance(issues, list):
            issues = []
    except Exception:
        issues = []

    result = {
        'timestamp': env_str("NATT_TS"),
        'root': os.getcwd(),
        'scores': {
            'ok':    env_int("NATT_TOTAL_OK"),
            'warn':  env_int("NATT_TOTAL_WARN"),
            'fail':  env_int("NATT_TOTAL_FAIL"),
            'trash': env_int("NATT_TOTAL_TRASH"),
        },
        'git': {
            'branch':  env_str("NATT_BRANCH"),
            'commits': env_int("NATT_COMMITS"),
            'dirty':   env_int("NATT_DIRTY"),
            'remote':  env_str("NATT_REMOTE"),
        },
        'files': {
            'ts_count':      env_int("NATT_TS_COUNT"),
            'ts_lines':      env_int("NATT_TS_LINES"),
            'inherited_v2':  env_int("NATT_V2_FILES"),
            'inherited_v1':  env_int("NATT_V1_FILES"),
        },
        'kernel': {
            'ok':    env_int("NATT_KERNEL_OK"),
            'total': env_int("NATT_KERNEL_TOTAL"),
        },
        'business': {
            'total':       env_int("NATT_BIZ_TOTAL"),
            'six_of_six':  env_int("NATT_BIZ_6OF6"),
            'wired':       env_int("NATT_BIZ_WIRED"),
            'not_wired':   env_int("NATT_BIZ_NOT_WIRED"),
        },
        'metabolism': {
            'processors':  env_int("NATT_PROC_COUNT"),
            'normalizers': env_int("NATT_NORM_COUNT"),
            'healing':     env_int("NATT_HEAL_COUNT"),
        },
        'bctc_flow': {
            'ready': env_int("NATT_BCTC_OK"),
            'total': env_int("NATT_BCTC_TOTAL"),
        },
        'production_flow': {
            'ready': env_int("NATT_PROD_OK"),
            'total': env_int("NATT_PROD_TOTAL"),
        },
        'cells': cells,
        'issues': issues,
    }

    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
