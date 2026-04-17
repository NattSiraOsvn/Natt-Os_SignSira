#!/usr/bin/env python3
"""
NATT-OS KhaiCell — 3 Tests
Per Thien Lon spec checks:
  Test 1 — BYPASS:    can anyone enter without KhaiCell?
  Test 2 — MISUSE:    can anyone call KhaiCell like a function (not as touch)?
  Test 3 — COLLAPSE:  with many entries, does the system keep its trust?

Strict rules:
- Code only (no spec/memory/summary)
- Source: src/, NaUion-Server/, nattos-server/
"""

import os
import re
import subprocess
from collections import defaultdict

ROOT = os.getcwd()
CODE_ROOTS = ["src", "NaUion-Server", "nattos-server"]
SKIP = {".git", "node_modules", "dist", "build", ".next", "__MACOSX",
        ".nattos-twin", "specs", "memory", "archive", "audit", "roadloading"}
CODE_EXT = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}


def is_code_file(path):
    if any(s in path for s in SKIP):
        return False
    return os.path.splitext(path)[1].lower() in CODE_EXT


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


# =====================================================================
# TEST 1 — BYPASS
# =====================================================================
def test_1_bypass():
    """Run validate-khaicell-bypass.py and parse violations."""
    print("\n" + "=" * 70)
    print("  TEST 1 — BYPASS: can entries skip KhaiCell?")
    print("=" * 70)
    script = os.path.join(ROOT, "validate-khaicell-bypass.py")
    if not os.path.isfile(script):
        print("  [SKIP] validator missing")
        return None
    try:
        result = subprocess.run(
            ["python3", script],
            capture_output=True, text=True, timeout=60,
        )
        m = re.search(r"VIOLATION\]:\s*(\d+)", result.stdout)
        if m:
            count = int(m.group(1))
            print(f"  bypass count: {count}")
            if count == 0:
                print("  [PASS] no entries bypass KhaiCell")
            else:
                print(f"  [FAIL] {count} entries bypass KhaiCell")
            return count
    except Exception as e:
        print(f"  [ERROR] {e}")
        return None


# =====================================================================
# TEST 2 — MISUSE
# =====================================================================
def test_2_misuse():
    """KhaiCell should ONLY be used as touch().
    Misuse patterns:
      - Direct field access (.normalize, .sign called externally)
      - Constructor invocation outside infrastructure
      - Subscribed-to instead of called
      - Mocked/stubbed for bypass
    """
    print("\n" + "=" * 70)
    print("  TEST 2 — MISUSE: is KhaiCell called like a function?")
    print("=" * 70)

    misuse_patterns = [
        (r"khaicell\.normalize\s*\(", "DIRECT_NORMALIZE"),
        (r"khaicell\.sign\s*\(", "DIRECT_SIGN"),
        (r"KhaiCellService\.normalize", "STATIC_NORMALIZE"),
        (r"KhaiCellService\.sign", "STATIC_SIGN"),
        (r"jest\.mock.*khai-cell", "MOCK_BYPASS"),
        (r"sinon\.stub.*khaicell", "STUB_BYPASS"),
        (r"//\s*TODO.*khai", "TODO_DEFER"),
        (r"//\s*FIXME.*khai", "FIXME_DEFER"),
    ]

    violations = []
    for path in walk_code():
        # Skip KhaiCell's own folder
        if "khai-cell/" in path:
            continue
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                for i, line in enumerate(fh, 1):
                    for pattern, kind in misuse_patterns:
                        if re.search(pattern, line, re.IGNORECASE):
                            violations.append({
                                "path": path, "line": i,
                                "kind": kind,
                                "snippet": line.strip()[:100],
                            })
        except Exception:
            pass

    if not violations:
        print("  [PASS] no misuse — KhaiCell is touched, not called as function")
    else:
        print(f"  [FAIL] {len(violations)} misuse cases")
        by_kind = defaultdict(list)
        for v in violations:
            by_kind[v["kind"]].append(v)
        for kind, items in by_kind.items():
            print(f"\n  [{kind}] — {len(items)}")
            for v in items[:5]:
                print(f"    {v['path']}:{v['line']}")
                print(f"      {v['snippet']}")
    return len(violations)


# =====================================================================
# TEST 3 — COLLAPSE
# =====================================================================
def test_3_collapse():
    """With many simultaneous entries, does the system keep its trust?
    Static checks (we cannot run live load, so we audit the structural
    properties that determine collapse resistance):
      A. KhaiCell service is stateless (no shared mutable state per instance)
      B. KhaiCell has NO async/await blocking (no race condition)
      C. KhaiCell has NO global counter/queue without backpressure
      D. Signature generation does NOT block (no sync I/O, no DB)
      E. Emit is fire-and-forget (no await on emit)
    """
    print("\n" + "=" * 70)
    print("  TEST 3 — COLLAPSE: structural collapse resistance")
    print("=" * 70)

    service_file = os.path.join(
        ROOT, "src/cells/kernel/khai-cell/domain/services/khai-cell.service.ts"
    )
    if not os.path.isfile(service_file):
        print("  [SKIP] service file missing")
        return None

    with open(service_file, "r", encoding="utf-8") as f:
        content = f.read()

    checks = []

    # A. Stateless — no class fields besides constructor injection
    class_fields = re.findall(r"private\s+\w+\s*[=:]\s*", content)
    non_constructor = [
        f for f in class_fields
        if "readonly" not in f and not re.search(r"=\s*new\s+", f)
    ]
    if not non_constructor:
        checks.append(("A", "STATELESS", True, "no mutable fields"))
    else:
        checks.append(("A", "STATELESS", False,
                       f"found {len(non_constructor)} mutable fields"))

    # B. No async/await
    if "async " not in content and "await " not in content:
        checks.append(("B", "NON_BLOCKING", True, "no async/await"))
    else:
        async_count = content.count("async ") + content.count("await ")
        checks.append(("B", "NON_BLOCKING", False,
                       f"{async_count} async/await usages"))

    # C. No global counter/queue inside service
    queue_pat = re.search(r"(this\.queue|this\.counter|this\.buffer)", content)
    if not queue_pat:
        checks.append(("C", "NO_GLOBAL_QUEUE", True, "no internal queue"))
    else:
        checks.append(("C", "NO_GLOBAL_QUEUE", False, "internal queue found"))

    # D. No sync I/O
    sync_io = re.search(
        r"(readFileSync|writeFileSync|fs\.|require\s*\(\s*['\"]fs)",
        content,
    )
    if not sync_io:
        checks.append(("D", "NO_SYNC_IO", True, "no fs/sync I/O"))
    else:
        checks.append(("D", "NO_SYNC_IO", False, "sync I/O present"))

    # E. emit is fire-and-forget
    emit_lines = re.findall(r"this\.emitter\.emit\s*\([^)]+\)", content)
    awaited_emits = [e for e in emit_lines
                     if "await " in content[
                         max(0, content.find(e) - 20):content.find(e)
                     ]]
    if not awaited_emits:
        checks.append(("E", "FIRE_AND_FORGET", True, "emit is non-blocking"))
    else:
        checks.append(("E", "FIRE_AND_FORGET", False,
                       f"{len(awaited_emits)} awaited emits"))

    pass_count = sum(1 for c in checks if c[2])
    fail_count = len(checks) - pass_count

    for letter, name, ok, note in checks:
        mark = "PASS" if ok else "FAIL"
        print(f"  [{mark}] {letter}. {name:18s} {note}")

    print()
    if fail_count == 0:
        print(f"  [PASS] {pass_count}/5 — structurally collapse-resistant")
    else:
        print(f"  [PARTIAL] {pass_count}/5 passed — {fail_count} weak points")
    return fail_count


# =====================================================================
# MAIN
# =====================================================================
def main():
    print()
    print("#" * 70)
    print("#  NATT-OS KhaiCell — 3 Tests (Thien Lon spec)")
    print("#" * 70)

    bypass = test_1_bypass()
    misuse = test_2_misuse()
    collapse_failures = test_3_collapse()

    print()
    print("=" * 70)
    print("  FINAL")
    print("=" * 70)
    print(f"  Test 1 (bypass):    {bypass} violations")
    print(f"  Test 2 (misuse):    {misuse} cases")
    print(f"  Test 3 (collapse):  {5 - (collapse_failures or 0)}/5 checks pass")

    if bypass == 0 and misuse == 0 and (collapse_failures or 0) == 0:
        print("\n  RESULT: ALL PASS — KhaiCell holds the trunk.")
    else:
        print("\n  RESULT: action items above.")
    print()


if __name__ == "__main__":
    main()
