#!/usr/bin/env python3
"""
validate-extension-precedence.py v0.3

Rule 4 variable-aware + marker-aware bypass detection.
Delta từ v0.2: recognize `@deferred` marker trong shell comment ±10 lines
của VAR assignment → downgrade FAIL → WARN với evidence pointer.

Match pattern vaccin session 20260419 (SCAR JSDoc false positive):
  scanner skip whitelisted semantic tag, không FAIL cứng intent-documented.

Drafter: Băng · session 20260423
Binding: SPEC_HOST_FIRST_RUNTIME_v1.0 §5 #9 + Kim SPEC_EXTENSION_PRECEDENCE v1.0
Reference prior art: bang_handoff_20260419.kris §A.1 + bang_pending_20260419.phieu
"""
import os
import re
import sys
from collections import defaultdict

CANONICAL_EXTS = {".khai", ".na", ".anc", ".phieu"}
SUBSTRATE_EXT = ".ts"
SKIP_DIRS = {"node_modules", "_deprecated", "__MACOSX", "dist", "build", "archive", ".git"}
MARKER_WINDOW = 10  # lines around VAR assignment to search for @deferred
DEFERRED_RE = re.compile(r"^\s*#\s*@deferred\b", re.MULTILINE)


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


def extract_shell_var_assignments_with_lineno(content):
    """Pass 1 enhanced: return {var_name: (ts_path, line_number)}."""
    assignments = {}
    lines = content.split("\n")
    patterns = [
        re.compile(r'^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)="([^"]+\.ts)"'),
        re.compile(r"^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)='([^']+\.ts)'"),
        re.compile(r"^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)=(\S+\.ts)(?:\s|$)"),
    ]
    for lineno, line in enumerate(lines, 1):
        for pat in patterns:
            m = pat.match(line)
            if m:
                assignments[m.group(1)] = (m.group(2), lineno)
                break
    return assignments


def has_deferred_marker_near(content, target_lineno, window=MARKER_WINDOW):
    """Check if @deferred marker exists within ±window lines of target."""
    lines = content.split("\n")
    lo = max(0, target_lineno - window - 1)
    hi = min(len(lines), target_lineno + window)
    segment = "\n".join(lines[lo:hi])
    return bool(DEFERRED_RE.search(segment))


def check_ts_bypass_canonical_v3(ts_path, all_scripts_content):
    """v0.3: return list of (script_file, mode, severity, lineno).
    severity: 'FAIL' (strict) or 'WARN' (deferred marker nearby).
    """
    results = []
    base = os.path.splitext(os.path.basename(ts_path))[0]
    for sf, content in all_scripts_content.items():
        # Direct literal match
        pat_direct = rf"(tsx|npx\s+tsx|node)\s+[^\n]*{re.escape(base)}\.ts"
        m_direct = re.search(pat_direct, content)
        if m_direct:
            lineno = content[: m_direct.start()].count("\n") + 1
            severity = "WARN" if has_deferred_marker_near(content, lineno) else "FAIL"
            results.append((sf, "direct-literal", severity, lineno))
            continue
        # Variable-resolved
        assignments = extract_shell_var_assignments_with_lineno(content)
        ts_norm = os.path.normpath(ts_path)
        for var_name, (var_path, var_lineno) in assignments.items():
            if os.path.normpath(var_path) == ts_norm or var_path.endswith(base + ".ts"):
                pat_var = rf'(tsx|npx\s+tsx|node)\s+[^\n]*["\']?\$\{{?{re.escape(var_name)}\}}?["\']?'
                m_var = re.search(pat_var, content)
                if m_var:
                    lineno = content[: m_var.start()].count("\n") + 1
                    # Check marker near VAR assignment (primary) OR near invocation (secondary)
                    severity = "FAIL"
                    if has_deferred_marker_near(content, var_lineno) or has_deferred_marker_near(content, lineno):
                        severity = "WARN"
                    results.append((sf, f"variable-resolved (${var_name})", severity, lineno))
                    break
    return results


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
    total_fail = 0
    total_warn = 0
    print("=== validate-extension-precedence.py v0.3 ===")
    print("Binding: Kim SPEC_EXTENSION_PRECEDENCE v1.0 + SPEC_HOST_FIRST_RUNTIME v1.0 §5 #9")
    print("Patch: variable-aware (v0.2) + marker-aware (v0.3 — vaccin session 20260419)")
    print()

    print("[Rule 1] Checking .sira file uniqueness...")
    sira_files = find_all_sira_files()
    expected = "./nattos.sira"
    if len(sira_files) == 0:
        print(f"  FAIL: không tìm thấy {expected}")
        total_fail += 1
    elif len(sira_files) > 1:
        print(f"  FAIL: {len(sira_files)} .sira files:")
        for f in sira_files:
            print(f"    - {f}")
        total_fail += len(sira_files) - 1
    else:
        actual = sira_files[0]
        if os.path.normpath(actual) != os.path.normpath(expected):
            print(f"  WARN: .sira tại {actual}, expected {expected}")
            total_warn += 1
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
            print(f"  FAIL: {khai} claims {state} nhưng vẫn import .ts")
            pair_issues += 1
        if state is None:
            print(f"  FAIL: {khai} thiếu @state header")
            pair_issues += 1
    if pair_issues == 0 and pairs:
        print(f"  PASS: all {len(pairs)} pairs compliant")
    total_fail += pair_issues
    print()

    print("[Rule 4 v0.3] Checking .ts bypass canonical (variable-aware + marker-aware)...")
    scripts_content = load_scripts_content()
    rule4_fail = 0
    rule4_warn = 0
    for khai, ts in pairs:
        results = check_ts_bypass_canonical_v3(ts, scripts_content)
        if results:
            print(f"  {ts} called via:")
            for sf, mode, severity, lineno in results:
                tag = "[DEFERRED]" if severity == "WARN" else "[STRICT]"
                print(f"    {severity} {tag}: {sf}:{lineno}  [{mode}]")
                if severity == "FAIL":
                    rule4_fail += 1
                else:
                    rule4_warn += 1
    if rule4_fail == 0 and rule4_warn == 0:
        print("  PASS: no .ts bypass detected")
    elif rule4_fail == 0:
        print(f"  PASS (with {rule4_warn} deferred marker acknowledged)")
    else:
        print(f"  FAIL: {rule4_fail} strict bypass, {rule4_warn} deferred")
    total_fail += rule4_fail
    total_warn += rule4_warn
    print()

    print("[Rule 5] UI/build lane (.tsx, vite.config.*) — bảo toàn, không action")
    print()

    print(f"Total FAIL: {total_fail}")
    print(f"Total WARN: {total_warn}")
    if total_fail == 0:
        if total_warn > 0:
            print(f"STATUS: PASS (with {total_warn} deferred acknowledged)")
        else:
            print("STATUS: PASS")
        sys.exit(0)
    else:
        print("STATUS: FAIL")
        sys.exit(1)


if __name__ == "__main__":
    main()
