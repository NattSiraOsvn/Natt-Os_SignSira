#!/usr/bin/env python3
"""
Natt-OS KhaiCell Bypass Detector v2
SPEC NEN v1.0 P0 item 3.
"""

import os
import re
import unicodedata
from collections import defaultdict

CODE_ROOTS = ["src", "NaUion-Server", "nattos-server"]
SKIP = {".git", "node_modules", "dist", "build", ".next", "__MACOSX",
        ".nattos-twin", "specs", "memory", "archive", "audit", "roadloading"}
CODE_EXT = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}

ENTRY_PATTERNS = [
    (r"app\.(get|post|put|delete|patch)\s*\(\s*['\"]", "HTTP_ROUTE"),
    (r"router\.(get|post|put|delete|patch)\s*\(\s*['\"]", "HTTP_ROUTE"),
    (r"\.on\s*\(\s*['\"]message['\"]", "WS_MESSAGE"),
    (r"addEventListener\s*\(\s*['\"]message['\"]", "POSTMESSAGE"),
    (r"req\.(body|query|params)\b", "REQ_DATA_ACCESS"),
    (r"fetch\s*\(\s*['\"]https?://", "FETCH_EXTERNAL"),
]

EXCLUDE_LINE_PATTERNS = [
    r"app\.use\s*\(\s*(cors|express\.|require|helmet|morgan)",
    r"app\.use\s*\(\s*['\"][^'\"]+['\"]\s*,\s*(express\.static|require)",
    r"//.*req\.(body|query|params)",
    r"\*.*req\.(body|query|params)",
    r"parseInt\s*\(\s*req\.query",
    r"res\.json\s*\(\s*\{[^}]*req\.params",
]

KHAICELL_USE = [
    r"KhaiCell", r"khai-cell", r"khaicell",
    r"\.touch\s*\(", r"khai\.touch\.signed", r"KhaiCellService",
]

INFRA_ALLOWLIST = [
    "src/cells/kernel/khai-cell/",
    "src/cells/infrastructure/event-bus-cell/",
    "NaUion-Server/lib/event-bus.ts",
    "NaUion-Server/vision/assets/",
    "nattos-server/app Tâm luxury/hooks/useSSE.ts",
    "nattos-server/app Tâm luxury/services/heynaConnector.ts",
    "nattos-server/app Tâm luxury/core/nauion/nauion-engine.ts",
    "nattos-server/apps/tam-luxury/heyna-client.js",
    "nattos-server/apps/tam-luxury/nattos-galaxy.js",
]


def is_code_file(path):
    if any(s in path for s in SKIP):
        return False
    return os.path.splitext(path)[1].lower() in CODE_EXT


def in_allowlist(path):
    p = unicodedata.normalize("NFC", path)
    return any(unicodedata.normalize("NFC", allowed) in p for allowed in INFRA_ALLOWLIST)


def is_excluded_line(line):
    return any(re.search(p, line) for p in EXCLUDE_LINE_PATTERNS)


def walk_code():
    for root in CODE_ROOTS:
        if not os.path.exists(root):
            continue
        for dirpath, dirs, files in os.walk(root):
            dirs[:] = [d for d in dirs if d not in SKIP]
            for f in files:
                full = os.path.join(dirpath, f)
                if is_code_file(full):
                    yield full


def scan_file(path):
    findings = []
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as fh:
            content = fh.read()
            lines = content.split("\n")
    except Exception:
        return findings

    file_uses_khai = any(re.search(p, content) for p in KHAICELL_USE)

    for i, line in enumerate(lines, 1):
        if is_excluded_line(line):
            continue
        for pattern, entry_type in ENTRY_PATTERNS:
            if re.search(pattern, line):
                window_start = max(0, i - 10)
                window_end = min(len(lines), i + 10)
                window = "\n".join(lines[window_start:window_end])
                khai_nearby = any(re.search(p, window) for p in KHAICELL_USE)

                findings.append({
                    "line": i,
                    "snippet": line.strip()[:120],
                    "entry_type": entry_type,
                    "khai_nearby": khai_nearby,
                    "file_uses_khai": file_uses_khai,
                })
    return findings


def main():
    print()
    print("=" * 70)
    print("  Natt-OS KhaiCell Bypass Detector v2")
    print("=" * 70)

    total_files = 0
    total_entries = 0
    violations = []
    ok_entries = []
    allowlisted = []

    for path in walk_code():
        total_files += 1
        findings = scan_file(path)
        for f in findings:
            total_entries += 1
            if in_allowlist(path):
                allowlisted.append((path, f))
            elif f["khai_nearby"] or f["file_uses_khai"]:
                ok_entries.append((path, f))
            else:
                violations.append((path, f))

    print(f"\nFiles: {total_files} | Entries: {total_entries}")
    print(f"  [OK]:        {len(ok_entries)}")
    print(f"  [ALLOWLIST]: {len(allowlisted)}")
    print(f"  [VIOLATION]: {len(violations)}")

    if violations:
        print()
        print("=" * 70)
        print(f"  VIOLATIONS — {len(violations)}")
        print("=" * 70)

        by_type = defaultdict(list)
        for path, f in violations:
            by_type[f["entry_type"]].append((path, f))

        for entry_type, items in sorted(by_type.items()):
            print(f"\n[{entry_type}] — {len(items)}")
            for path, f in items[:15]:
                print(f"  {path}:{f['line']}")
                print(f"    {f['snippet']}")
            if len(items) > 15:
                print(f"  ... +{len(items)-15} more")

    print()
    if violations:
        print(f"RESULT: FAIL — {len(violations)} violations")
    else:
        print("RESULT: PASS")
    print()


if __name__ == "__main__":
    main()
