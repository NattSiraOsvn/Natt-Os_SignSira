#!/usr/bin/env python3
import os, re

ROOT = os.getcwd()
SCAN_DIRS = ["src/cells", "src/governance", "src/core"]
SKIP = {".git", "node_modules", "dist", "build", "__MACOSX"}

TARGET_PATTERNS = [
    r"guard\.ts$",
    r"auth.*\.service\.ts$",
    r"policy.*\.ts$",
    r"validator.*\.ts$",
    r"validation.*\.ts$",
    r"immune.*\.ts$",
    r"rbac.*\.ts$",
    r"security.*\.ts$",
    r"sirasign.*\.ts$",
    r"audit.*\.ts$",
]

HARDCODE_PATTERNS = [
    (r"^\s*return\s+true\s*;", "RETURN_TRUE"),
    (r"^\s*return\s+false\s*;", "RETURN_FALSE"),
    (r"if\s*\([^)]+\)\s*return\s+true", "INLINE_RETURN_TRUE"),
    (r"if\s*\([^)]+\)\s*return\s+false", "INLINE_RETURN_FALSE"),
]

def is_target(path):
    return any(re.search(p, path) for p in TARGET_PATTERNS)

def walk():
    for root in SCAN_DIRS:
        if not os.path.exists(root):
            continue
        for dirpath, dirs, files in os.walk(root):
            dirs[:] = [d for d in dirs if d not in SKIP]
            for f in files:
                full = os.path.join(dirpath, f)
                if is_target(full):
                    yield full

def scan(path):
    findings = []
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            for i, line in enumerate(f, 1):
                stripped = line.strip()
                if stripped.startswith("//") or stripped.startswith("*"):
                    continue
                for pattern, kind in HARDCODE_PATTERNS:
                    if re.search(pattern, line):
                        findings.append({
                            "line": i,
                            "kind": kind,
                            "snippet": line.rstrip()[:120],
                        })
                        break
    except Exception:
        pass
    return findings

total = 0
all_findings = []
for path in walk():
    findings = scan(path)
    if findings:
        total += len(findings)
        all_findings.append((path, findings))

print(f"TOTAL: {total}  FILES: {len(all_findings)}")
print("=" * 70)
for path, findings in all_findings:
    print(f"\n{path}")
    for f in findings:
        print(f"  L{f['line']:>4}  [{f['kind']:<20}]  {f['snippet']}")
