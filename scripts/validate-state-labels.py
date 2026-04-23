#!/usr/bin/env python3
"""
validate-state-labels.py

Scanner verify state label compliance per Kim SPEC_CUTOVER_STATES §3.
Every file canonical (.khai/.na) trong src/cells/kernel/** phải có header:
  @state: S1|S2|S3|S4
  @canonical: <path>    (bắt buộc S2/S3/S4)
  @substrate: <path>    (bắt buộc S2)
  @bridge: <cell>::<target>  (bắt buộc S3)
  @since: YYYY-MM-DD

Output stdout only (per SCANNER OUTPUT RULE 20260423 — không ghi file repo).
Exit code: 0 pass, 1 any fail.

Drafter: Băng · Chị Tư · session 20260423
Binding: SPEC_HOST_FIRST_RUNTIME_v1.0 §5 guardrail #11 + PILOT_BRIDGE_MAP v0.1
Commit path designed: scripts/validate-state-labels.py
"""

import os
import re
import sys
from datetime import datetime

VALID_STATES = {'S1', 'S2', 'S3', 'S4'}
SCAN_ROOTS = [
    'src/cells/kernel/',
    'src/cells/business/',
    'src/cells/infrastructure/',
]
CANONICAL_EXTS = {'.khai', '.na'}
SUBSTRATE_EXT = '.ts'

HEADER_PATTERNS = {
    'state':     re.compile(r'@state:\s*(\S+)'),
    'canonical': re.compile(r'@canonical:\s*(\S+)'),
    'substrate': re.compile(r'@substrate:\s*(\S+)'),
    'bridge':    re.compile(r'@bridge:\s*(\S+)'),
    'since':     re.compile(r'@since:\s*(\d{4}-\d{2}-\d{2})'),
}


def extract_headers(filepath):
    """Read first 30 lines, extract @headers. Return dict."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            head = ''.join(f.readlines()[:30])
    except Exception as e:
        return {'_read_error': str(e)}

    result = {}
    for key, pat in HEADER_PATTERNS.items():
        m = pat.search(head)
        if m:
            result[key] = m.group(1)
    return result


def validate_state_S1(fp, hdrs):
    """S1 legacy-ts: chỉ .ts, không cần canonical headers. Flag if .ts claims S1 but has .khai sibling."""
    issues = []
    if hdrs.get('state') != 'S1':
        return issues
    # S1 phải là .ts file, không phải .khai/.na
    if fp.endswith(SUBSTRATE_EXT):
        # Check if sibling .khai exists — nếu có, state phải ≥ S2
        khai_sibling = fp[:-3] + '.khai'
        na_sibling = fp[:-3] + '.na'
        if os.path.exists(khai_sibling) or os.path.exists(na_sibling):
            issues.append(f"claims S1 nhưng có sibling canonical — state phải ≥ S2")
    return issues


def validate_state_S2(fp, hdrs):
    """S2 wrapper: có .khai + .ts. Header @canonical + @substrate bắt buộc."""
    issues = []
    if hdrs.get('state') != 'S2':
        return issues
    if 'canonical' not in hdrs:
        issues.append("S2 thiếu @canonical header")
    if 'substrate' not in hdrs:
        issues.append("S2 thiếu @substrate header")
    # Verify substrate file tồn tại
    if 'substrate' in hdrs and not os.path.exists(hdrs['substrate']):
        issues.append(f"@substrate path không tồn tại: {hdrs['substrate']}")
    # Verify canonical file tồn tại
    if 'canonical' in hdrs and not os.path.exists(hdrs['canonical']):
        issues.append(f"@canonical path không tồn tại: {hdrs['canonical']}")
    return issues


def validate_state_S3(fp, hdrs):
    """S3 bridged: @bridge bắt buộc, KHÔNG được import direct .ts."""
    issues = []
    if hdrs.get('state') != 'S3':
        return issues
    if 'canonical' not in hdrs:
        issues.append("S3 thiếu @canonical header")
    if 'bridge' not in hdrs:
        issues.append("S3 thiếu @bridge header")
    if 'bridge' in hdrs:
        if '::' not in hdrs['bridge']:
            issues.append(f"@bridge format sai (expected <cell>::<target>): {hdrs['bridge']}")
    # S3 không được có @substrate direct reference
    if 'substrate' in hdrs:
        issues.append("S3 không được ghi @substrate (đã qua Mạch HeyNa L2, không direct dep)")
    return issues


def validate_state_S4(fp, hdrs):
    """S4 native: chỉ canonical, không .ts trong execution path."""
    issues = []
    if hdrs.get('state') != 'S4':
        return issues
    if 'canonical' not in hdrs:
        issues.append("S4 thiếu @canonical header")
    if 'substrate' in hdrs:
        issues.append("S4 không được ghi @substrate (native standalone)")
    return issues


def validate_common(fp, hdrs):
    """Common checks cho mọi state."""
    issues = []
    state = hdrs.get('state')
    if state is None:
        # No @state header
        # Only flag if file is canonical (.khai/.na) — .ts không bắt buộc state header
        if any(fp.endswith(e) for e in CANONICAL_EXTS):
            issues.append("canonical file thiếu @state header (bắt buộc per Kim SPEC_CUTOVER_STATES §3)")
        return issues
    if state not in VALID_STATES:
        issues.append(f"@state invalid: {state} (must be S1|S2|S3|S4)")
    if 'since' not in hdrs:
        if state in {'S2', 'S3', 'S4'}:
            issues.append("S2/S3/S4 thiếu @since header")
    elif 'since' in hdrs:
        try:
            dt = datetime.strptime(hdrs['since'], '%Y-%m-%d')
            # Warn nếu @since trong tương lai (time fab vaccin)
            if dt > datetime.now():
                issues.append(f"@since trong tương lai: {hdrs['since']} — check SCAR-TIME-FAB")
        except ValueError:
            issues.append(f"@since format sai: {hdrs['since']} (expected YYYY-MM-DD)")
    return issues


def scan_file(fp):
    """Return list of (severity, message) tuples."""
    hdrs = extract_headers(fp)
    if '_read_error' in hdrs:
        return [('ERROR', f"read failed: {hdrs['_read_error']}")]

    issues = []
    issues.extend(validate_common(fp, hdrs))
    issues.extend(validate_state_S1(fp, hdrs))
    issues.extend(validate_state_S2(fp, hdrs))
    issues.extend(validate_state_S3(fp, hdrs))
    issues.extend(validate_state_S4(fp, hdrs))

    return [('FAIL', msg) for msg in issues]


def walk_scan_roots():
    """Iterate all files in SCAN_ROOTS with canonical or substrate extensions."""
    for root in SCAN_ROOTS:
        if not os.path.isdir(root):
            continue
        for dirpath, _, filenames in os.walk(root):
            # Skip _deprecated/
            if '_deprecated' in dirpath.split(os.sep):
                continue
            for fn in filenames:
                fp = os.path.join(dirpath, fn)
                ext = os.path.splitext(fn)[1]
                if ext in CANONICAL_EXTS or ext == SUBSTRATE_EXT:
                    yield fp


def main():
    total_files = 0
    files_with_issues = 0
    total_issues = 0

    print("=== validate-state-labels.py ===")
    print(f"Binding: SPEC_HOST_FIRST_RUNTIME_v1.0 §5 #11 + Kim SPEC_CUTOVER_STATES §3")
    print(f"Scan roots: {SCAN_ROOTS}")
    print()

    for fp in walk_scan_roots():
        total_files += 1
        issues = scan_file(fp)
        if issues:
            files_with_issues += 1
            total_issues += len(issues)
            print(f"[FAIL] {fp}")
            for sev, msg in issues:
                print(f"       {sev}: {msg}")

    print()
    print(f"Total files scanned: {total_files}")
    print(f"Files with issues:   {files_with_issues}")
    print(f"Total issues:        {total_issues}")
    print()

    if total_issues == 0:
        print("STATUS: PASS — all canonical files compliant")
        sys.exit(0)
    else:
        print("STATUS: FAIL — see issues above")
        sys.exit(1)


if __name__ == '__main__':
    main()
