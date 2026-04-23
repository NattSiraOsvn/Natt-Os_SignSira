#!/usr/bin/env python3
"""
validate-extension-precedence.py v0.4

Delta từ v0.3: add Rule 6 — Điều 7 self-state storage detection với
TWIN_PERSIST tag whitelist.

Pattern: file .ts paired với .khai S2+ → grep fs.writeFileSync|writeFile|
appendFileSync → check ±5 lines có TWIN_PERSIST tag → whitelist; else FAIL.

Match vaccin session 20260419 (K2 resolution): khai-file-persister.ts:47
có TWIN_PERSIST = QIINT lineage legitimate, không business state storage.

Drafter: Băng · session 20260423
Binding: SPEC_HOST_FIRST_RUNTIME_v1.1 §5 #9 + Kim SPEC_EXTENSION_PRECEDENCE v1.0
Reference: bang_handoff_20260419.kris §A.1 + commit 46d38dd K2 resolution
"""
import os
import re
import sys
from collections import defaultdict

SKIP_DIRS = {"node_modules", "_deprecated", "__MACOSX", "dist", "build", "archive", ".git"}
MARKER_WINDOW = 10
DEFERRED_RE = re.compile(r"^\s*#\s*@deferred\b", re.MULTILINE)
TWIN_PERSIST_RE = re.compile(r"TWIN_PERSIST", re.IGNORECASE)
DISK_WRITE_RE = re.compile(
    r"\b(fs\.(?:writeFileSync|writeFile|appendFileSync|appendFile|createWriteStream))\b"
)


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


def has_marker_near(content, target_lineno, pattern, window=MARKER_WINDOW):
    lines = content.split("\n")
    lo = max(0, target_lineno - window - 1)
    hi = min(len(lines), target_lineno + window)
    segment = "\n".join(lines[lo:hi])
    return bool(pattern.search(segment))


def check_ts_bypass_canonical_v3(ts_path, all_scripts_content):
    results = []
    base = os.path.splitext(os.path.basename(ts_path))[0]
    for sf, content in all_scripts_content.items():
        pat_direct = rf"(tsx|npx\s+tsx|node)\s+[^\n]*{re.escape(base)}\.ts"
        m_direct = re.search(pat_direct, content)
        if m_direct:
            lineno = content[: m_direct.start()].count("\n") + 1
            severity = "WARN" if has_marker_near(content, lineno, DEFERRED_RE) else "FAIL"
            results.append((sf, "direct-literal", severity, lineno))
            continue
        assignments = extract_shell_var_assignments_with_lineno(content)
        ts_norm = os.path.normpath(ts_path)
        for var_name, (var_path, var_lineno) in assignments.items():
            if os.path.normpath(var_path) == ts_norm or var_path.endswith(base + ".ts"):
                pat_var = rf'(tsx|npx\s+tsx|node)\s+[^\n]*["\']?\$\{{?{re.escape(var_name)}\}}?["\']?'
                m_var = re.search(pat_var, content)
                if m_var:
                    lineno = content[: m_var.start()].count("\n") + 1
                    severity = "FAIL"
                    if has_marker_near(content, var_lineno, DEFERRED_RE) or has_marker_near(content, lineno, DEFERRED_RE):
                        severity = "WARN"
                    results.append((sf, f"variable-resolved (${var_name})", severity, lineno))
                    break
    return results


def check_disk_write_compliance(ts_path):
    """v0.4 Rule 6: scan .ts substrate for fs.writeFileSync without TWIN_PERSIST marker.
    Return list of (lineno, severity, evidence). WARN = TWIN_PERSIST whitelisted.
    FAIL = unmarked disk write (Điều 7 violation).
    """
    try:
        with open(ts_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except Exception:
        return []
    results = []
    for m in DISK_WRITE_RE.finditer(content):
        lineno = content[: m.start()].count("\n") + 1
        call = m.group(1)
        severity = "WARN" if has_marker_near(content, lineno, TWIN_PERSIST_RE, window=MARKER_WINDOW) else "FAIL"
        results.append((lineno, severity, call))
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
    print("=== validate-extension-precedence.py v0.4 ===")
    print("Binding: Kim SPEC_EXTENSION_PRECEDENCE v1.0 + SPEC_HOST_FIRST_RUNTIME v1.1 §5 #9")
    print("Patch: variable-aware (v0.2) + marker-aware (v0.3) + TWIN_PERSIST whitelist (v0.4)")
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
            print(f"  WARN: .sira tại {actual}")
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

    print("[Rule 6 v0.4] Checking .ts substrate disk write compliance (TWIN_PERSIST whitelist)...")
    rule6_fail = 0
    rule6_warn = 0
    for khai, ts in pairs:
        state = check_khai_state(khai)
        if state not in {"S2", "S3", "S4"}:
            continue
        disk_results = check_disk_write_compliance(ts)
        if disk_results:
            print(f"  {ts}:")
            for lineno, severity, call in disk_results:
                tag = "[TWIN_PERSIST]" if severity == "WARN" else "[ĐIỀU 7]"
                print(f"    {severity} {tag}: line {lineno} — {call}")
                if severity == "FAIL":
                    rule6_fail += 1
                else:
                    rule6_warn += 1
    if rule6_fail == 0 and rule6_warn == 0:
        print("  PASS: no substrate disk write detected")
    elif rule6_fail == 0:
        print(f"  PASS (with {rule6_warn} TWIN_PERSIST whitelisted)")
    else:
        print(f"  FAIL: {rule6_fail} Điều 7 violation, {rule6_warn} whitelisted")
    total_fail += rule6_fail
    total_warn += rule6_warn
    print()

    print(f"Total FAIL: {total_fail}")
    print(f"Total WARN: {total_warn}")
    if total_fail == 0:
        if total_warn > 0:
            print(f"STATUS: PASS (with {total_warn} WARN acknowledged)")
        else:
            print("STATUS: PASS")
        sys.exit(0)
    else:
        print("STATUS: FAIL")
        sys.exit(1)


if __name__ == "__main__":
    main()
