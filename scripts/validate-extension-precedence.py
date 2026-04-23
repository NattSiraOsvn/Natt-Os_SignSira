#!/usr/bin/env python3
"""
validate-extension-precedence.py

Scanner verify extension precedence per Kim SPEC_EXTENSION_PRECEDENCE v1.0.
Rules enforced:
  1. Chỉ 1 file .sira duy nhất: nattos.sira ở root
  2. Khi .khai + .ts cùng semantic role → .khai canonical, .ts substrate (S2+)
  3. .khai không được claim "đã xong" khi còn import .ts trực tiếp (cross-check với @state)
  4. .ts bypass canonical (direct tsx runner) = violation flag
  5. UI/build lane (.tsx, .vite.*) bảo toàn — không cutover wave này

Output stdout only (per SCANNER OUTPUT RULE).
Exit: 0 pass, 1 fail.

Drafter: Băng · session 20260423
Binding: SPEC_HOST_FIRST_RUNTIME_v1.0 §5 guardrail #9 + Kim SPEC_EXTENSION_PRECEDENCE
Commit path designed: scripts/validate-extension-precedence.py
"""

import os
import re
import sys
from collections import defaultdict

PRECEDENCE = {
    '.sira':   1,
    '.khai':   2,
    '.na':     3,
    '.anc':    4,
    '.phieu':  5,
    '.ts':     6,
    '.tsx':    7,
}

CANONICAL_EXTS = {'.khai', '.na', '.anc', '.phieu'}
SUBSTRATE_EXT = '.ts'
UI_EXTS = {'.tsx'}  # + vite configs

SCAN_ROOTS = [
    'src/',
    'scripts/',
    '.',  # for nattos.sira root + nattos.sh
]
SKIP_DIRS = {'node_modules', '_deprecated', '__MACOSX', 'dist', 'build', 'archive'}


def find_all_sira_files():
    """Find all .sira files anywhere in repo. Should be exactly 1: nattos.sira at root."""
    found = []
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith('.')]
        for fn in files:
            if fn.endswith('.sira'):
                found.append(os.path.join(root, fn))
    return found


def find_sibling_pairs():
    """Find pairs (canonical.khai, substrate.ts) same basename same dir."""
    pairs = []
    for root, dirs, files in os.walk('src/'):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        by_basename = defaultdict(dict)
        for fn in files:
            base, ext = os.path.splitext(fn)
            if ext in {'.khai', '.ts'}:
                by_basename[base][ext] = os.path.join(root, fn)
        for base, exts in by_basename.items():
            if '.khai' in exts and '.ts' in exts:
                pairs.append((exts['.khai'], exts['.ts']))
    return pairs


def check_khai_imports_ts(khai_path):
    """Check nếu .khai file import/require .ts sibling direct."""
    try:
        with open(khai_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
    except Exception:
        return False
    # Pattern: import ... from './<basename>.ts' or require('./<basename>.ts')
    base = os.path.splitext(os.path.basename(khai_path))[0]
    patterns = [
        rf"import\s+.+from\s+['\"]\./{re.escape(base)}(\.ts)?['\"]",
        rf"require\s*\(\s*['\"]\./{re.escape(base)}(\.ts)?['\"]",
        rf"@substrate:\s*.*{re.escape(base)}\.ts",  # declared dependency
    ]
    for p in patterns:
        if re.search(p, content):
            return True
    return False


def check_ts_bypass_canonical(ts_path):
    """Check nếu .ts file được gọi direct bypass canonical (scan scripts + nattos.sh)."""
    bypasses = []
    base = os.path.splitext(os.path.basename(ts_path))[0]
    # Scan nattos.sh + scripts/*.sh + package.json
    scan_files = []
    for root in ['.', 'scripts']:
        if os.path.isdir(root):
            for fn in os.listdir(root):
                fp = os.path.join(root, fn)
                if os.path.isfile(fp) and (fn.endswith(('.sh', '.json', '.mjs')) or fn == 'nattos.sh'):
                    scan_files.append(fp)

    for sf in scan_files:
        try:
            with open(sf, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()
        except Exception:
            continue
        # Pattern: tsx <path/to/file.ts> or node <path/to/file.ts>
        pat = rf"(tsx|npx\s+tsx|node)\s+[^\n]*{re.escape(base)}\.ts"
        if re.search(pat, content):
            bypasses.append(sf)
    return bypasses


def check_khai_state(khai_path):
    """Extract @state header from .khai file."""
    try:
        with open(khai_path, 'r', encoding='utf-8', errors='replace') as f:
            head = ''.join(f.readlines()[:30])
    except Exception:
        return None
    m = re.search(r'@state:\s*(S[1-4])', head)
    return m.group(1) if m else None


def main():
    total_issues = 0
    print("=== validate-extension-precedence.py ===")
    print("Binding: Kim SPEC_EXTENSION_PRECEDENCE v1.0 + SPEC_HOST_FIRST_RUNTIME v1.0 §5 #9")
    print()

    # Rule 1: Only 1 .sira file, must be nattos.sira at root
    print("[Rule 1] Checking .sira file uniqueness...")
    sira_files = find_all_sira_files()
    expected = './nattos.sira'
    if len(sira_files) == 0:
        print(f"  FAIL: không tìm thấy {expected}")
        total_issues += 1
    elif len(sira_files) > 1:
        print(f"  FAIL: {len(sira_files)} .sira files tìm thấy — chỉ được 1 (nattos.sira root):")
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

    # Rule 2+3: Sibling pairs analysis
    print("[Rule 2+3] Checking .khai + .ts sibling pairs...")
    pairs = find_sibling_pairs()
    print(f"  Found {len(pairs)} sibling pairs")
    pair_issues = 0
    for khai, ts in pairs:
        state = check_khai_state(khai)
        imports_ts = check_khai_imports_ts(khai)
        # S3/S4 không được import .ts direct
        if state in {'S3', 'S4'} and imports_ts:
            print(f"  FAIL: {khai} claims {state} nhưng vẫn import .ts substrate")
            pair_issues += 1
        # S2 wrapper: import .ts được chấp nhận, nhưng phải có @substrate declare
        if state == 'S2' and imports_ts:
            # OK — S2 wrapper pattern
            pass
        # Nếu no state header → flag
        if state is None:
            print(f"  FAIL: {khai} thiếu @state header (pair với {ts})")
            pair_issues += 1
    if pair_issues == 0 and pairs:
        print(f"  PASS: all {len(pairs)} pairs compliant")
    total_issues += pair_issues
    print()

    # Rule 4: Bypass canonical check (scan nattos.sh + scripts)
    print("[Rule 4] Checking .ts bypass canonical...")
    bypass_count = 0
    for khai, ts in pairs:
        bypasses = check_ts_bypass_canonical(ts)
        if bypasses:
            print(f"  FLAG: {ts} called direct from:")
            for b in bypasses:
                print(f"    - {b}")
            bypass_count += len(bypasses)
    if bypass_count == 0:
        print("  PASS: no .ts bypass detected (in paired cells)")
    else:
        print(f"  FAIL: {bypass_count} bypass call(s) — patch cần route qua canonical")
        total_issues += bypass_count
    print()

    # Rule 5: UI lane preservation (informational only)
    print("[Rule 5] UI/build lane (.tsx, vite.config.*) — bảo toàn, không action")
    print()

    # Summary
    print(f"Total issues: {total_issues}")
    if total_issues == 0:
        print("STATUS: PASS")
        sys.exit(0)
    else:
        print("STATUS: FAIL — xem issues above")
        sys.exit(1)


if __name__ == '__main__':
    main()
