#!/usr/bin/env python3
"""
validate-extension-precedence.py v0.2

Rule 4 variable-aware bypass detection.
2-pass scan: Pass 1 extract VAR="...ts" assignments, Pass 2 scan tsx/node $VAR invocation.

Drafter: Băng · deployed session 20260423
Binding: SPEC_HOST_FIRST_RUNTIME_v1.0 §5 #9 + Kim SPEC_EXTENSION_PRECEDENCE v1.0
"""
import os
import re
import sys
from collections import defaultdict

CANONICAL_EXTS = {".khai", ".na", ".anc", ".phieu"}
SUBSTRATE_EXT = ".ts"
SKIP_DIRS = {"node_modules", "_deprecated", "__MACOSX", "dist", "build", "archive", ".git"}


def find_all_sira_files():
    found = []
    for root, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]
        for fn in files:
            if fn.endswith(".sira"):
                found.append(os.path.join(root, fn))
    return found


def find_sibling_pairs():
    pairs = []
    for root, dirs, files in os.walk("src/"):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        by_basename = defaultdict(dict)
        for fn in files:
            base, ext = os.path.splitext(fn)
            if ext in {".khai", ".ts"}:
                by_basename[base][ext] = os.path.join(root, fn)
        for base, exts in by_basename.items():
            if ".khai" in exts and ".ts" in exts:
                pairs.append((exts[".khai"], exts[".ts"]))
    return pairs


def check_khai_imports_ts(khai_path):
    try:
        with open(khai_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except Exception:
        return False
    base = os.path.splitext(os.path.basename(khai_path))[0]
    patterns = [
        rf"import\s+.+from\s+['\"]\./{re.escape(base)}(\.ts)?['\"]",
        rf"require\s*\(\s*['\"]\./{re.escape(base)}(\.ts)?['\"]",
        rf"@substrate:\s*.*{re.escape(base)}\.ts",
    ]
    for p in patterns:
        if re.search(p, content):
            return True
    return False


def extract_shell_var_assignments(content):
    """Pass 1: extract VAR='path.ts' assignments."""
    assignments = {}
    patterns = [
        re.compile(r'^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)="([^"]+\.ts)"', re.MULTILINE),
        re.compile(r"^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)='([^']+\.ts)'", re.MULTILINE),
        re.compile(r"^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)=(\S+\.ts)(?:\s|$)", re.MULTILINE),
    ]
    for pat in patterns:
        for m in pat.finditer(content):
            assignments[m.group(1)] = m.group(2)
    return assignments


def check_ts_bypass_canonical_v2(ts_path, all_scripts_content):
    """Pass 2: direct-literal + variable-resolved detection."""
    bypasses = []
    base = os.path.splitext(os.path.basename(ts_path))[0]
    for sf, content in all_scripts_content.items():
        pat_direct = rf"(tsx|npx\s+tsx|node)\s+[^\n]*{re.escape(base)}\.ts"
        if re.search(pat_direct, content):
            bypasses.append((sf, "direct-literal"))
            continue
        assignments = extract_shell_var_assignments(content)
        ts_norm = os.path.normpath(ts_path)
        for var_name, var_path in assignments.items():
            if os.path.normpath(var_path) == ts_norm or var_path.endswith(base + ".ts"):
                pat_var = rf'(tsx|npx\s+tsx|node)\s+[^\n]*["\']?\$\{{?{re.escape(var_name)}\}}?["\']?'
                if re.search(pat_var, content):
                    bypasses.append((sf, f"variable-resolved (${var_name})"))
                    break
    return bypasses


def check_khai_state(khai_path):
    try:
        with open(khai_path, "r", encoding="utf-8", errors="replace") as f:
            head = "".join(f.readlines()[:30])
    except Exception:
        return None
    m = re.search(r"@state:\s*(S[1-4])", head)
    return m.group(1) if m else None


def load_scripts_content():
    scan_files = []
    for root in [".", "scripts"]:
        if os.path.isdir(root):
            for fn in os.listdir(root):
                fp = os.path.join(root, fn)
                if os.path.isfile(fp) and (fn.endswith((".sh", ".json", ".mjs")) or fn == "nattos.sh"):
                    scan_files.append(fp)
    content_map = {}
    for sf in scan_files:
        try:
            with open(sf, "r", encoding="utf-8", errors="replace") as f:
                content_map[sf] = f.read()
        except Exception:
            pass
    return content_map


def main():
    total_issues = 0
    print("=== validate-extension-precedence.py v0.2 ===")
    print("Binding: Kim SPEC_EXTENSION_PRECEDENCE v1.0 + SPEC_HOST_FIRST_RUNTIME v1.0 §5 #9")
    print("Patch: Rule 4 variable-aware (SCAR-20260423-SCANNER-VARIABLE-BLIND vaccin)")
    print()

    print("[Rule 1] Checking .sira file uniqueness...")
    sira_files = find_all_sira_files()
    expected = "./nattos.sira"
    if len(sira_files) == 0:
        print(f"  FAIL: không tìm thấy {expected}")
        total_issues += 1
    elif len(sira_files) > 1:
        print(f"  FAIL: {len(sira_files)} .sira files — chỉ được 1:")
        for f in sira_files:
            print(f"    - {f}")
        total_issues += len(sira_files) - 1
    else:
        actual = sira_files[0]
        if os.path.normpath(actual) != os.path.normpath(expected):
            print(f"  WARN: .sira file tại {actual}, expected {expected}")
            total_issues += 1
        else:
            print(f"  PASS: {actual}")
    print()

    print("[Rule 2+3] Checking .khai + .ts sibling pairs...")
    pairs = find_sibling_pairs()
    print(f"  Found {len(pairs)} sibling pairs")
    pair_issues = 0
    for khai, ts in pairs:
        state = check_khai_state(khai)
        imports_ts = check_khai_imports_ts(khai)
        if state in {"S3", "S4"} and imports_ts:
            print(f"  FAIL: {khai} claims {state} nhưng vẫn import .ts substrate")
            pair_issues += 1
        if state is None:
            print(f"  FAIL: {khai} thiếu @state header (pair với {ts})")
            pair_issues += 1
    if pair_issues == 0 and pairs:
        print(f"  PASS: all {len(pairs)} pairs compliant")
    total_issues += pair_issues
    print()

    print("[Rule 4 v0.2] Checking .ts bypass canonical (variable-aware)...")
    scripts_content = load_scripts_content()
    bypass_count = 0
    for khai, ts in pairs:
        bypasses = check_ts_bypass_canonical_v2(ts, scripts_content)
        if bypasses:
            print(f"  FLAG: {ts} called via:")
            for src, mode in bypasses:
                print(f"    - {src}  [{mode}]")
            bypass_count += len(bypasses)
    if bypass_count == 0:
        print("  PASS: no .ts bypass detected")
    else:
        print(f"  FAIL: {bypass_count} bypass call(s)")
        total_issues += bypass_count
    print()

    print("[Rule 5] UI/build lane (.tsx, vite.config.*) — bảo toàn, không action")
    print()

    print(f"Total issues: {total_issues}")
    if total_issues == 0:
        print("STATUS: PASS")
        sys.exit(0)
    else:
        print("STATUS: FAIL")
        sys.exit(1)


if __name__ == "__main__":
    main()
