#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scan_hien_phap.py
=================
@nauion-tool python-pure v1
@scope sovereign-audit-hien-phap-constitutional
@paradigm B (Bash thuần — anh hai Thiên Lớn ratify ss20260427)
@invoked-by nattos.sh §23 HIẾN PHÁP SCAN
@authority Sirawat Băng (Obikeeper QNEU 313.5)

Scan src/ for constitutional violations:
  Điều 4:  Cross-cell direct import
  Điều 7:  Self-state storage (localStorage/fs.write)
  Điều 9:  Direct external API call (bypass EventBus)
  Điều 11: Hardcoded credentials/keys
Output:
  - stdout: count + grouped violations per Điều
  - file: .nattos-twin/hien-phap-scan.json
"""
import os
import sys
import re
import json


def main() -> int:
    if os.environ.get('AUDIT_MODE') == 'quick':
        print('  \033[0;33m⚡\033[0m  QUICK MODE — skip')
        return 0

    src = "src"
    violations = []

    dia4_pat = re.compile(r'from\s+[\'"](?:\.\./){2,}cells/(?:business|kernel|infrastructure)/([^/\'"]+)/([^\'"]+)[\'"]')
    dia7_pat = re.compile(r'localStorage\.(setItem|getItem)|fs\.(writeFile|appendFile|writeFileSync)\s*\(|window\.localStorage')
    dia9_pat = re.compile(r'fetch\s*\(\s*[\'"]https?://|axios\.(get|post|put|delete)\s*\(\s*[\'"]https?://|new\s+XMLHttpRequest')
    dia11_pat = re.compile(r'(?i)(api_key|apikey|secret|password|token)\s*=\s*[\'"][a-zA-Z0-9+/=_\-]{8,}[\'"]')

    for root, dirs, files in os.walk(src):
        dirs[:] = [d for d in dirs if d not in ("node_modules", "baithicuakim", ".git", "services", "__tests__", "integration")]
        for f in files:
            if not f.endswith(".ts"):
                continue
            path = os.path.join(root, f)
            try:
                content = open(path, encoding="utf-8", errors="ignore").read()
                lines = content.split("\n")
            except Exception:
                continue

            parts = path.replace("\\", "/").split("/")
            cell = "core"
            for i, x in enumerate(parts):
                if x in ("business", "kernel", "infrastructure") and i + 1 < len(parts):
                    cell = parts[i + 1]
                    break

            for ln, line in enumerate(lines, 1):
                # Điều 4
                for m in dia4_pat.finditer(line):
                    target_cell = m.group(1)
                    if target_cell != cell:
                        violations.append({
                            "dieu": "Điều 4",
                            "severity": "🔴 CRITICAL",
                            "cell": cell,
                            "file": path.replace("src/", ""),
                            "line": ln,
                            "detail": f"Direct import từ {target_cell}",
                            "code": line.strip()[:80]
                        })

                # Điều 7
                prev_line = lines[ln - 2] if ln >= 2 else ""
                ctx = line + " " + prev_line
                if (dia7_pat.search(line)
                    and "//TODO" not in ctx
                    and "// FIX" not in ctx
                    and "// FIXED:" not in ctx
                    and "TWIN_PERSIST" not in ctx
                    and "// HEALTH_CHECK" not in ctx
                    and not line.strip().startswith("//")
                    and "ui-app" not in path
                    and "ui_app" not in path):
                    violations.append({
                        "dieu": "Điều 7",
                        "severity": "🔴 CRITICAL",
                        "cell": cell,
                        "file": path.replace("src/", ""),
                        "line": ln,
                        "detail": "Self-state storage (localStorage/fs.write)",
                        "code": line.strip()[:80]
                    })

                # Điều 9
                if (dia9_pat.search(line)
                    and "nattos-server" not in path
                    and "nattos-sheets" not in path
                    and "DIEU9-OK" not in line):
                    violations.append({
                        "dieu": "Điều 9",
                        "severity": "🟡 warn",
                        "cell": cell,
                        "file": path.replace("src/", ""),
                        "line": ln,
                        "detail": "Direct external API call (bypass EventBus?)",
                        "code": line.strip()[:80]
                    })

                # Điều 11
                if (dia11_pat.search(line)
                    and "process.env" not in line
                    and ".env" not in path):
                    violations.append({
                        "dieu": "Điều 11",
                        "severity": "🔴 CRITICAL",
                        "cell": cell,
                        "file": path.replace("src/", ""),
                        "line": ln,
                        "detail": "Hardcoded credential/key",
                        "code": "***REDACTED***"
                    })

    by_dieu = {}
    for v in violations:
        by_dieu.setdefault(v["dieu"], []).append(v)

    if not violations:
        print(f"  \033[0;32m✅\033[0m Hiến Pháp CLEAN — 0 vi phạm phát hiện")
    else:
        print(f"  \033[0;31m❌\033[0m Phát hiện {len(violations)} vi phạm Hiến Pháp:\n")
        for dieu, items in sorted(by_dieu.items()):
            sev = items[0]["severity"]
            print(f"  {sev} {dieu} — {len(items)} vi phạm:")
            for v in items[:5]:
                print(f"    → {v['file']}:{v['line']}")
                print(f"      {v['detail']}")
                print(f"      `{v['code']}`")
            if len(items) > 5:
                print(f"    ... và {len(items)-5} vi phạm khác")

    os.makedirs(".nattos-twin", exist_ok=True)
    with open(".nattos-twin/hien-phap-scan.json", "w") as fh:
        json.dump({
            "total": len(violations),
            "by_dieu": {k: len(v) for k, v in by_dieu.items()},
            "violations": violations[:50]
        }, fh, indent=2, ensure_ascii=False)

    return 0


if __name__ == "__main__":
    sys.exit(main())
