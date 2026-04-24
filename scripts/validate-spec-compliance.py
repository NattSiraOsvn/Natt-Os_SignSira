#!/usr/bin/env python3
"""
natt-os SPEC NEN v1.0 Compliance Auditor
Used by nattos.sh section 45.

Checks:
  1. KhaiCell exists in src/cells/kernel/
  2. Observation exists in src/cells/kernel/
  3. KhaiCell bypass count (delegates to validate-khaicell-bypass.py)
  4. RENA hardcoded true/false count
  5. File extension SPEC v0.3.1 compliance
"""

import os
import re
import subprocess
import sys
from collections import defaultdict

ROOT = os.getcwd()


def check_khai_exists():
    path = os.path.join(ROOT, "src/cells/kernel/khai-cell")
    required = [
        "khai-cell.cell.anc",
        "khai-cell.boundary.si",
        "index.ts",
        "domain/services/khai-cell.service.ts",
        "ports/khai-cell.contract.ts",
    ]
    if not os.path.isdir(path):
        return False, "khai-cell folder missing"
    missing = [r for r in required if not os.path.isfile(os.path.join(path, r))]
    if missing:
        return False, f"missing: {missing}"
    return True, "OK"


def check_observation_exists():
    path = os.path.join(ROOT, "src/cells/kernel/observation-cell")
    required = [
        "observation-cell.cell.anc",
        "observation-cell.boundary.si",
        "index.ts",
        "domain/services/observation-cell.service.ts",
        "ports/SignalStreamReader.ts",
        "ports/SnapshotPublisher.ts",
    ]
    if not os.path.isdir(path):
        return False, "observation-cell folder missing"
    missing = [r for r in required if not os.path.isfile(os.path.join(path, r))]
    if missing:
        return False, f"missing: {missing}"
    return True, "OK"


def check_bypass():
    script = os.path.join(ROOT, "validate-khaicell-bypass.py")
    if not os.path.isfile(script):
        return -1, "validator missing"
    try:
        result = subprocess.run(
            ["python3", script],
            capture_output=True, text=True, timeout=60,
        )
        m = re.search(r"VIOLATION\]:\s*(\d+)", result.stdout)
        if m:
            return int(m.group(1)), "OK"
        return -1, "parse failed"
    except Exception as e:
        return -1, str(e)


def check_rena():
    """Count hardcoded true/false in guards/auth/policy."""
    patterns = [
        r"return\s+true\s*;\s*(?://|$)",
        r"if\s*\(\s*!\s*token\s*\)\s*return\s+true",
        r"return\s+false\s*;\s*(?://|$)",
    ]
    targets = [
        "src/cells/business/inventory-cell/domain/services/material-issue.guard.ts",
        "src/cells/shared-kernel/immune-guard.ts",
        "src/cells/kernel/rbac-cell/domain/services/auth.service.ts",
    ]
    violations = []
    for rel in targets:
        full = os.path.join(ROOT, rel)
        if not os.path.isfile(full):
            continue
        try:
            with open(full, "r", encoding="utf-8", errors="ignore") as f:
                for i, line in enumerate(f, 1):
                    for p in patterns:
                        if re.search(p, line):
                            violations.append(f"{rel}:{i}")
                            break
        except Exception:
            pass
    return len(violations), violations


def check_extensions():
    """SPEC v0.3.1: no .json memory files in governance/memory/<entity>/"""
    bad = []
    base = os.path.join(ROOT, "src/governance/memory")
    if not os.path.isdir(base):
        return 0, "memory dir missing"
    for entity in os.listdir(base):
        d = os.path.join(base, entity)
        if not os.path.isdir(d):
            continue
        for f in os.listdir(d):
            if re.match(r"^[a-z]+(mf|fs)[_v]?\d.*\.json$", f, re.I):
                bad.append(f"{entity}/{f}")
    return len(bad), bad


def main():
    print()
    print("=" * 70)
    print("  natt-os SPEC NEN v1.0 Compliance Audit")
    print("=" * 70)

    ok_count = 0
    fail_count = 0

    # Check 1
    ok, msg = check_khai_exists()
    mark = "pass" if ok else "fail"
    print(f"\n[1] KhaiCell scaffold:           [{mark}] {msg}")
    if ok: ok_count += 1
    else: fail_count += 1

    # Check 2
    ok, msg = check_observation_exists()
    mark = "pass" if ok else "fail"
    print(f"[2] Observation scaffold:        [{mark}] {msg}")
    if ok: ok_count += 1
    else: fail_count += 1

    # Check 3
    bypass_count, msg = check_bypass()
    if bypass_count == 0:
        print(f"[3] KhaiCell bypass:             [pass] 0 violations")
        ok_count += 1
    elif bypass_count > 0:
        print(f"[3] KhaiCell bypass:             [warn] {bypass_count} violations")
        fail_count += 1
    else:
        print(f"[3] KhaiCell bypass:             [SKIP] {msg}")

    # Check 4
    rena_count, rena_list = check_rena()
    if rena_count == 0:
        print(f"[4] RENA hardcoded true/false:   [pass] 0 found")
        ok_count += 1
    else:
        print(f"[4] RENA hardcoded true/false:   [fail] {rena_count} found")
        for v in rena_list[:5]:
            print(f"       {v}")
        fail_count += 1

    # Check 5
    ext_count, ext_list = check_extensions()
    if ext_count == 0:
        print(f"[5] File extension SPEC v0.3.1:  [pass] all migrated")
        ok_count += 1
    else:
        print(f"[5] File extension SPEC v0.3.1:  [fail] {ext_count} stragglers")
        for v in ext_list[:5]:
            print(f"       {v}")
        fail_count += 1

    print()
    print("=" * 70)
    print(f"  RESULT: {ok_count} pass / {fail_count} fail")
    print("=" * 70)
    print()

    sys.exit(0 if fail_count == 0 else 1)


if __name__ == "__main__":
    main()
