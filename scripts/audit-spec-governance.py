#!/usr/bin/env python3
"""
audit-spec-governance.py v0.5

INFO mode SPEC governance metadata coverage scanner.
Scans docs/specs/**/*.na recursively (handles space-in-path).
Reports @state + @canonical presence + values.

NO fail — informational inventory only. Gatekeeper / Kim scope decides
which SPEC files require sealing per Kim SPEC_CUTOVER_STATES §3.

Drafter: Băng · session 20260423
Binding: Kim SPEC_CUTOVER_STATES §3 (state label requirement) +
         SPEC_HOST_FIRST_RUNTIME v1.1 §5 #11

Ship rationale: 48+ SPEC files trong docs/specs/ chưa có @state header.
Strict mode = fail flood 48 violations. INFO mode = inventory cho
Kim/Gatekeeper decide governance sealing pace.
"""
import os
import re
import sys

SKIP_DIRS = {"node_modules", "_deprecated", "__MACOSX", "dist", "build", "archive", ".git"}
SCAN_ROOT = "docs/specs"

STATE_RE = re.compile(r"^\s*(?://\s*\*?\s*|\*\s*|#\s*)?@state[:\s]+([^\n]+)", re.MULTILINE)
CANONICAL_RE = re.compile(r"^\s*(?://\s*\*?\s*|\*\s*|#\s*)?@canonical[:\s]+([^\n]+)", re.MULTILINE)


def scan_file(fp):
    try:
        with open(fp, "r", encoding="utf-8", errors="replace") as f:
            head = "".join(f.readlines()[:50])
    except Exception:
        return None, None
    state_m = STATE_RE.search(head)
    canonical_m = CANONICAL_RE.search(head)
    state = state_m.group(1).strip() if state_m else None
    canonical = canonical_m.group(1).strip() if canonical_m else None
    return state, canonical


def collect_spec_files():
    files = []
    for root, dirs, fns in os.walk(SCAN_ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]
        for fn in fns:
            if fn.endswith(".na"):
                files.append(os.path.join(root, fn))
    return sorted(files)


def main():
    print("=== audit-spec-governance.py v0.5 (INFO mode) ===")
    print("Binding: Kim SPEC_CUTOVER_STATES §3 + SPEC_HOST_FIRST_RUNTIME v1.1 §5 #11")
    print(f"Scan root: {SCAN_ROOT}/**/*.na")
    print()

    files = collect_spec_files()
    print(f"Total SPEC .na files: {len(files)}")
    print()

    sealed = []
    pending_gk = []
    other_state = []
    no_header = []

    for fp in files:
        state, canonical = scan_file(fp)
        if state is None:
            no_header.append((fp, canonical))
        elif "sealed" in state.lower():
            sealed.append((fp, state, canonical))
        elif "pending_gatekeeper" in state.lower() or "complete_pending" in state.lower():
            pending_gk.append((fp, state, canonical))
        else:
            other_state.append((fp, state, canonical))

    if sealed:
        print(f"### SEALED ({len(sealed)}) — @state sealed/sealed_amendment")
        for fp, state, canonical in sealed:
            print(f"  {fp}")
            print(f"    @state: {state}")
            if canonical:
                print(f"    @canonical: {canonical}")
        print()

    if pending_gk:
        print(f"### PENDING GATEKEEPER ({len(pending_gk)}) — awaiting seal")
        for fp, state, canonical in pending_gk:
            print(f"  {fp}")
            print(f"    @state: {state}")
            if canonical:
                print(f"    @canonical: {canonical}")
        print()

    if other_state:
        print(f"### OTHER STATE ({len(other_state)})")
        for fp, state, canonical in other_state:
            print(f"  {fp}")
            print(f"    @state: {state}")
        print()

    if no_header:
        print(f"### NO HEADER ({len(no_header)}) — @state metadata missing")
        for fp, _ in no_header:
            print(f"  {fp}")
        print()

    print("---")
    print(f"Coverage summary:")
    print(f"  Sealed:            {len(sealed):3d}")
    print(f"  Pending Gatekeeper: {len(pending_gk):3d}")
    print(f"  Other state:       {len(other_state):3d}")
    print(f"  No header:         {len(no_header):3d}")
    print(f"  TOTAL:             {len(files):3d}")
    if files:
        coverage_pct = ((len(sealed) + len(pending_gk) + len(other_state)) / len(files)) * 100
        print(f"  Governance coverage: {coverage_pct:.1f}%")
    print()
    print("STATUS: INFO (no gate, exit 0)")
    sys.exit(0)


if __name__ == "__main__":
    main()
