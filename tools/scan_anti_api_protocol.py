#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scan_anti_api_protocol.py
=========================
@nauion-tool python-pure v1
@scope sovereign-audit-anti-api-lenh-001
@paradigm B (Bash thuần — anh hai Thiên Lớn ratify ss20260427)
@invoked-by nattos.sh §25 ANTI-API PROTOCOL SCAN — LỆNH #001
@authority Sirawat Băng (Obikeeper QNEU 313.5)

Scan src/ + nattos-server/ + config/ for external AI/service API patterns.
Whitelist acceptable refs (docs, types, comments, dictionary).
Output:
  - stdout: violations or CLEAN
  - file: audit/summary/api-violations.json
"""
import os
import sys
import subprocess
import json


VIOLATION_PATTERNS = [
    "GoogleGenAI",
    "new GoogleGenAI",
    "openai.com",
    "anthropic.com",
    "generativelanguage.googleapis.com",
    "vision.googleapis.com",
    "api.openai.com",
    "api.anthropic.com",
]

WHITELIST = [
    "node_modules",
    ".bak",
    "SuperDictionary",
    "superdictionary",
    "nauion.dictionary",
    "constitutional-mapping",
    "TechnicalDocs",
    "technicaldocs",
    "aicoreprocessor",
    "VISION_API_BASE",
    "# LỆNH",
    "// LỆNH",
    "// private",
    "STUBBED",
    "types.ts",
    "governance/types",
    "first-seed.ts",
    "textlaw",
    "docs/",
]


def main() -> int:
    violations = []

    for pattern in VIOLATION_PATTERNS:
        try:
            result = subprocess.run(
                ["grep", "-rn", pattern,
                 "src/", "nattos-server/", "nattos-server/nattos-ui/", "config/",
                 "--include=*.ts", "--include=*.tsx", "--include=*.js",
                 "--exclude-dir=node_modules",
                 "--exclude-dir=.git",
                 "--exclude-dir=archive",
                 "--exclude-dir=dist",
                 "--exclude-dir=*_files"],
                capture_output=True, text=True
            )
            for line in result.stdout.splitlines():
                if any(w in line for w in WHITELIST):
                    continue
                violations.append(line.strip())
        except Exception:
            pass

    violations = list(set(violations))

    os.makedirs("audit/summary", exist_ok=True)

    if violations:
        print(f"  \033[0;31m❌\033[0m  LỆNH #001 vi phạm: {len(violations)} chỗ")
        print("INC_warn_LENH001")
        for v in violations[:10]:
            print(f"     🚨 {v[:120]}")
        if len(violations) > 10:
            print(f"     ... và {len(violations)-10} vi phạm khác")
        with open("audit/summary/api-violations.json", "w") as f:
            json.dump({"count": len(violations), "violations": violations}, f, indent=2)
    else:
        print(f"  \033[0;32m✅\033[0m LỆNH #001 CLEAN — không có external API calls")
        with open("audit/summary/api-violations.json", "w") as f:
            json.dump({"count": 0, "violations": []}, f, indent=2)

    return 0


if __name__ == "__main__":
    sys.exit(main())
