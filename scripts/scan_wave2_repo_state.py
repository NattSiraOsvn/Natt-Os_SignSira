#!/usr/bin/env python3
"""
scan_wave2_repo_state.py
========================================================================
Post-Wave-2-ship repo scanner — tĩnh-ngẫm-ngộ-thấy

Scans the repo where anh Natt landed 11 Wave 2 v1 files (locally, pre-commit)
and outputs ground truth Băng needs to see BEFORE đề xuất fix vs hold.

Scope:
  SECTION A — 11 Wave 2 artifact presence + SHA-256 + path
  SECTION B — Tree structure shape (flat vs nested)
  SECTION C — Git state (branch, HEAD, staged, untracked)
  SECTION D — A.6 batch bug reproduce test
  SECTION E — Canonical anchor references exist?
  SECTION F — Identity anchor (bang.shape.svg SHA-256 verify)
  SECTION G — Moments persister folder state (A.2 Kim scope)

Rules:
  - STDOUT ONLY (per SCANNER OUTPUT RULE 20260423)
  - No file write under src/ or docs/
  - Read-only throughout
  - Compatible bash 3.2 host (macOS) — pure python stdlib

Usage:
  cd <repo-root>
  python3 scan_wave2_repo_state.py
  # copy entire stdout, paste back to Băng

Author: Băng (Chị Tư · post-SCAR-20260427-REVIEW-RECEIVED-REFLEX-FIX)
Date: 2026-04-27
========================================================================
"""

from __future__ import annotations

import hashlib
import os
import subprocess
import sys
from pathlib import Path
from typing import List, Optional, Tuple

# ------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------

def hdr(title: str) -> None:
    print()
    print("=" * 72)
    print(title)
    print("=" * 72)


def row(label: str, value: str) -> None:
    print(f"  {label:<40s} {value}")


def run(cmd: List[str]) -> Tuple[int, str, str]:
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        return r.returncode, r.stdout.strip(), r.stderr.strip()
    except FileNotFoundError:
        return 127, "", f"command not found: {cmd[0]}"
    except subprocess.TimeoutExpired:
        return 124, "", "timeout"


def sha256_file(p: Path) -> Optional[str]:
    try:
        h = hashlib.sha256()
        with open(p, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                h.update(chunk)
        return h.hexdigest()
    except Exception:
        return None


# ------------------------------------------------------------------------
# 11 Wave 2 file manifest (path em ship vs expected SHA-256)
# NOTE: SHA-256 values are what Băng computed at local ship time.
# If anh's file differ → anh overwrote or re-saved, flag for diff.
# ------------------------------------------------------------------------

WAVE2_MANIFEST = [
    # (relative_path, description)
    ("docs/specs/SPEC_MOMENTS_FRAGMENT_SCHEMA_v0.1_DRAFT.na",            "A.3 contract"),
    ("docs/specs/fixtures/moments/fixture-SCAR.na",                     "A.5 SCAR fixture"),
    ("docs/specs/fixtures/moments/fixture-KHAI_SANG.na",                "A.5 KHAI fixture"),
    ("docs/specs/fixtures/moments/fixture-GIAC_NGO.na",                 "A.5 GIAC fixture"),
    ("docs/specs/fixtures/moments/fixture-MOTION_TICH_CUC.na",          "A.5 MOTION fixture"),
    ("scripts/validate-moments-schema.sh",                              "A.6 validator"),
    ("docs/specs/fixtures/capabilities/worked-example-hibernate.na",    "B.2 hibernate"),
    ("docs/specs/fixtures/capabilities/worked-example-resurrect.na",    "B.3 resurrect"),
    ("docs/specs/fixtures/capabilities/worked-example-migrate.na",      "B.4 migrate"),
    ("scripts/validate-capability-invariant.py",                        "B.6 validator"),
    # Handoff note — outputs-only, may or may not be in repo
    ("HANDOFF_BANG_TO_KIM_20260427.md",                                 "Q-01 handoff (outputs-only)"),
]

# Canonical anchor references check
CANONICAL_REFS = [
    "docs/specs/SPEC_MOMENTS_MODULE_v0.2.na",
    "docs/specs/SPEC_MOMENTS_MODULE_v0.2.1.na",
    "docs/specs/SPEC_MOMENTS_MODULE_v0_1_to_v0_2_delta.na",
    "docs/specs/SPEC_QIINT_PHYSICS_FOUNDATION_v0.1.na",
    "docs/specs/SPEC_NEN_v1.1.anc",
    "docs/specs/SPEC_NEN_v1.1_TONG_HOP_20260418.md",
    "docs/specs/Natt-OS_SHTT_CLAIM_MAP_v1.na",
    "docs/specs/Natt-OS_SUBSTRATE_REALITY_SYNTHESIS_v1.na",
]

# Expected canonical shape hash for Băng (per handoff 20260426 identity_anchor)
BANG_SHAPE_EXPECTED_SHA256 = (
    "b4c44a3a689c4655374a61e7317db3a0caeb2ecb46f9e03c2ebe3c3103b7ceee"
)


# ------------------------------------------------------------------------
# SECTION A — Wave 2 file presence + SHA-256
# ------------------------------------------------------------------------

def section_a(repo: Path) -> None:
    hdr("SECTION A — 11 Wave 2 artifact presence + SHA-256")

    found = 0
    missing = 0
    for rel, desc in WAVE2_MANIFEST:
        p = repo / rel
        if p.exists():
            h = sha256_file(p)
            size = p.stat().st_size
            print(f"  [OK] {rel}")
            print(f"       desc : {desc}")
            print(f"       size : {size} bytes")
            print(f"       sha256: {h}")
            found += 1
        else:
            print(f"  [MISSING] {rel}")
            print(f"       desc : {desc}")
            missing += 1

    print()
    row("Total expected:", str(len(WAVE2_MANIFEST)))
    row("Found:",          str(found))
    row("Missing:",        str(missing))


# ------------------------------------------------------------------------
# SECTION B — Tree structure shape (test "flat root" claim)
# ------------------------------------------------------------------------

def section_b(repo: Path) -> None:
    hdr("SECTION B — Tree structure shape (flat vs structured)")

    # Count depth of each Wave 2 file from repo root
    depths = {}
    for rel, _ in WAVE2_MANIFEST:
        p = repo / rel
        if p.exists():
            # depth = number of '/' in relative path
            d = rel.count("/")
            depths[rel] = d

    if not depths:
        print("  No Wave 2 files found — cannot assess tree shape.")
        return

    all_flat = all(d == 0 for d in depths.values())
    all_structured = all(d >= 2 for d in depths.values())

    print("  File-by-file path depth (depth 0 = flat at root):")
    for rel, d in sorted(depths.items()):
        print(f"    depth={d}  {rel}")

    print()
    row("All files FLAT (depth=0):",      "YES" if all_flat else "NO")
    row("All files STRUCTURED (depth≥2):","YES" if all_structured else "NO")

    # Explicit check: are fixture files inside docs/specs/fixtures/moments/ ?
    moments_dir = repo / "docs" / "specs" / "fixtures" / "moments"
    caps_dir = repo / "docs" / "specs" / "fixtures" / "capabilities"
    scripts_dir = repo / "scripts"

    row("docs/specs/fixtures/moments/ exists:",       "YES" if moments_dir.is_dir() else "NO")
    row("docs/specs/fixtures/capabilities/ exists:",  "YES" if caps_dir.is_dir() else "NO")
    row("scripts/ exists:",                           "YES" if scripts_dir.is_dir() else "NO")


# ------------------------------------------------------------------------
# SECTION C — Git state
# ------------------------------------------------------------------------

def section_c(repo: Path) -> None:
    hdr("SECTION C — Git state")

    os.chdir(repo)

    rc, out, err = run(["git", "rev-parse", "--abbrev-ref", "HEAD"])
    row("Current branch:", out if rc == 0 else f"ERROR ({err})")

    rc, out, err = run(["git", "log", "-1", "--oneline"])
    row("HEAD commit:", out if rc == 0 else f"ERROR ({err})")

    rc, out, err = run(["git", "status", "--porcelain"])
    if rc == 0:
        if not out:
            row("Working tree:", "clean")
        else:
            print("  Working tree changes:")
            for line in out.split("\n"):
                print(f"    {line}")
    else:
        row("Working tree:", f"ERROR ({err})")

    # Specifically check if Wave 2 files are staged/untracked
    print()
    print("  Per-file git status (Wave 2 artifacts):")
    for rel, _ in WAVE2_MANIFEST:
        rc, out, err = run(["git", "status", "--porcelain", rel])
        if rc == 0:
            status = out.split("\n")[0][:2].strip() if out else "tracked-clean-or-absent"
            print(f"    [{status:<3s}] {rel}")


# ------------------------------------------------------------------------
# SECTION D — A.6 batch bug reproduce
# ------------------------------------------------------------------------

def section_d(repo: Path) -> None:
    hdr("SECTION D — A.6 batch bug reproduce (Thiên Lớn claim: fail 4/8 on root)")

    validator = repo / "scripts" / "validate-moments-schema.sh"
    if not validator.exists():
        print(f"  A.6 validator not found at {validator} — cannot test.")
        return

    print(f"  Validator: {validator}")
    print()

    # Test 1: batch on repo root (Thiên Lớn claim site)
    print("  [TEST D1] --batch on repo root:")
    rc, out, err = run(["bash", str(validator), "--batch", "."])
    # Extract summary lines
    summary_lines = [l for l in (out + "\n" + err).split("\n")
                     if "Total:" in l or "Passed:" in l or "Failed:" in l]
    for l in summary_lines:
        print(f"    {l.strip()}")
    print(f"    exit_code: {rc}")
    print()

    # Test 2: batch on docs/specs/ (mid-level)
    docs_specs = repo / "docs" / "specs"
    if docs_specs.exists():
        print("  [TEST D2] --batch on docs/specs/:")
        rc, out, err = run(["bash", str(validator), "--batch", str(docs_specs)])
        summary_lines = [l for l in (out + "\n" + err).split("\n")
                         if "Total:" in l or "Passed:" in l or "Failed:" in l]
        for l in summary_lines:
            print(f"    {l.strip()}")
        print(f"    exit_code: {rc}")
        print()

    # Test 3: batch on docs/specs/fixtures/moments/ (intended scope)
    moments_dir = repo / "docs" / "specs" / "fixtures" / "moments"
    if moments_dir.exists():
        print("  [TEST D3] --batch on docs/specs/fixtures/moments/ (intended):")
        rc, out, err = run(["bash", str(validator), "--batch", str(moments_dir)])
        summary_lines = [l for l in (out + "\n" + err).split("\n")
                         if "Total:" in l or "Passed:" in l or "Failed:" in l]
        for l in summary_lines:
            print(f"    {l.strip()}")
        print(f"    exit_code: {rc}")


# ------------------------------------------------------------------------
# SECTION E — Canonical anchor references
# ------------------------------------------------------------------------

def section_e(repo: Path) -> None:
    hdr("SECTION E — Canonical anchor references (check SPEC_MOMENTS v0.2.1 etc)")

    for ref in CANONICAL_REFS:
        p = repo / ref
        if p.is_file():
            size = p.stat().st_size
            h = sha256_file(p)
            print(f"  [EXISTS] {ref}")
            print(f"           size={size}  sha256={h[:16] if h else 'ERR'}...")
        else:
            print(f"  [ABSENT] {ref}")


# ------------------------------------------------------------------------
# SECTION F — Identity anchor (bang.shape.svg)
# ------------------------------------------------------------------------

def section_f(repo: Path) -> None:
    hdr("SECTION F — Identity anchor bang.shape.svg (INV-R1 resurrect verify)")

    shape_paths = [
        "src/governance/memory/bang/bang.shape.svg",
        "governance/memory/bang/bang.shape.svg",  # in case governance moved to root
    ]

    found = False
    for rel in shape_paths:
        p = repo / rel
        if p.is_file():
            h = sha256_file(p)
            size = p.stat().st_size
            match = (h == BANG_SHAPE_EXPECTED_SHA256)
            print(f"  [FOUND] {rel}")
            print(f"          size={size}  sha256={h}")
            print(f"          expected   b4c44a3a689c4655374a61e7317db3a0caeb2ecb46f9e03c2ebe3c3103b7ceee")
            print(f"          match: {'YES — INV-R1 verify PASS' if match else 'NO — INV-R1 verify FAIL, SCAR-IDENTITY'}")
            found = True
            break

    if not found:
        print("  [ABSENT] bang.shape.svg not found at expected paths:")
        for rel in shape_paths:
            print(f"    - {rel}")


# ------------------------------------------------------------------------
# SECTION G — Moments persister folder (A.2 Kim scope)
# ------------------------------------------------------------------------

def section_g(repo: Path) -> None:
    hdr("SECTION G — Moments persister scaffold (A.2 Kim kernel scope)")

    moments_dir = repo / "src" / "governance" / "moments"
    if moments_dir.is_dir():
        print(f"  [EXISTS] {moments_dir.relative_to(repo)}")
        contents = sorted(moments_dir.rglob("*"))
        if not contents:
            print("  Folder empty (A.2 pending Kim implement)")
        else:
            print(f"  Files inside ({len(contents)} items):")
            for item in contents[:20]:
                rel = item.relative_to(repo)
                kind = "FILE" if item.is_file() else "DIR "
                print(f"    [{kind}] {rel}")
            if len(contents) > 20:
                print(f"    ... ({len(contents) - 20} more)")
    else:
        print(f"  [ABSENT] src/governance/moments/")
        print("  → A.2 Kim scope untouched — expected post-ship (Kim plan phiên tới).")


# ------------------------------------------------------------------------
# Main
# ------------------------------------------------------------------------

def main() -> int:
    repo = Path.cwd()

    print()
    print("  scan_wave2_repo_state.py — post-ship ground truth scanner")
    print(f"  Repo root (cwd): {repo}")
    print(f"  Expected HEAD:   a335c7b (or post-Wave-2-ship commit)")

    section_a(repo)
    section_b(repo)
    section_c(repo)
    section_d(repo)
    section_e(repo)
    section_f(repo)
    section_g(repo)

    hdr("SCAN COMPLETE — copy full output above, paste back to Băng")
    return 0


if __name__ == "__main__":
    sys.exit(main())
