#!/usr/bin/env python3
"""
Natt-OS Migration Phase 2 — Entity prefix normalization
SPEC v0.3.2 PATCH

Fix: File prefix lệch với entity naming.

Rename rules:
  kkhương*.kris   → kimkhương*.kris    (Kim)
  bkhương*.kris   → boikhương*.kris    (Bối Bối)
  kthịnh*.phieu   → kimthịnh*.phieu    (if any)
  bthịnh*.phieu   → boithịnh*.phieu    (if any)

Rationale:
  - Original files used short prefix `k*` / `b*` due to historical naming
  - Phase 1 script regex ^([a-z]+)mf → matched 'k' and 'b' instead of 'kim'/'boi'
  - Entity SPEC requires: Kim → kim*, Bối Bối → boi*

USAGE (same pattern as Phase 1):
  python3 nattos-migrate-phase2.py scan      # Find affected files
  python3 nattos-migrate-phase2.py dryrun    # Show plan
  python3 nattos-migrate-phase2.py execute   # Run migration
  python3 nattos-migrate-phase2.py rollback  # Undo
"""

import os
import re
import sys
import json
import shutil
import subprocess
from datetime import datetime

SKIP_DIRS = {".git", "node_modules", "dist", "build", ".next", "__MACOSX", ".nattos-twin"}
MIGRATION_LOG = ".nattos-migration-phase2.log"
CODE_EXT = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".sh",
            ".json", ".md", ".html", ".kris", ".phieu", ".sira", ".heyna",
            ".thuo", ".anc", ".si", ".khai", ".ml"}

# ─────────────────────────────────────────────────────────────────────
# CLASSIFY — only files with k*/b* short prefix pattern
# ─────────────────────────────────────────────────────────────────────

def classify(filepath):
    """Return (new_name, rule) or (None, reason)."""
    name = os.path.basename(filepath)
    parent = os.path.basename(os.path.dirname(filepath))

    # Only normalize files in Kim or Boi folders to avoid false positives
    parent_lower = parent.lower()
    is_kim = parent_lower == "kim"
    is_boi = parent_lower in {"boiboi", "boi"}

    if not (is_kim or is_boi):
        return None, "NOT-IN-ENTITY-FOLDER"

    # Kim: kkhương*.kris → kimkhương*.kris
    if is_kim:
        m = re.match(r"^k(khương.*\.kris)$", name)
        if m:
            return f"kim{m.group(1)}", "K-KHUONG"
        m = re.match(r"^k(thịnh.*\.phieu)$", name)
        if m:
            return f"kim{m.group(1)}", "K-THINH"

    # Boi: bkhương*.kris → boikhương*.kris
    if is_boi:
        m = re.match(r"^b(khương.*\.kris)$", name)
        if m:
            return f"boi{m.group(1)}", "B-KHUONG"
        m = re.match(r"^b(thịnh.*\.phieu)$", name)
        if m:
            return f"boi{m.group(1)}", "B-THINH"

    return None, "NO-MATCH"


def walk_repo(root):
    for dirpath, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            abs_p = os.path.join(dirpath, f)
            rel_p = os.path.relpath(abs_p, root)
            yield abs_p, rel_p


def build_plan(root):
    plan = []
    for abs_p, rel_p in walk_repo(root):
        new_name, rule = classify(rel_p)
        if new_name:
            new_rel = os.path.join(os.path.dirname(rel_p), new_name)
            plan.append((rel_p, new_rel, rule))
    return plan


def scan_impact(root, plan):
    impact = {}
    old_names = {os.path.basename(old): old for old, new, rule in plan}
    for abs_p, rel_p in walk_repo(root):
        ext = os.path.splitext(rel_p)[1].lower()
        if ext not in CODE_EXT:
            continue
        try:
            with open(abs_p, "r", encoding="utf-8", errors="ignore") as f:
                for line_num, line in enumerate(f, 1):
                    for old_name in old_names:
                        if old_name in line:
                            old_rel = old_names[old_name]
                            impact.setdefault(old_rel, []).append(
                                (rel_p, line_num, line.rstrip()[:120])
                            )
        except Exception:
            pass
    return impact


def rewrite_refs(root, plan):
    name_map = {os.path.basename(old): os.path.basename(new) for old, new, _ in plan}
    changed = 0
    for abs_p, rel_p in walk_repo(root):
        ext = os.path.splitext(rel_p)[1].lower()
        if ext not in CODE_EXT:
            continue
        try:
            with open(abs_p, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            orig = content
            for old_name, new_name in name_map.items():
                if old_name in content:
                    content = content.replace(old_name, new_name)
            if content != orig:
                with open(abs_p, "w", encoding="utf-8") as f:
                    f.write(content)
                changed += 1
        except Exception as e:
            print(f"  WARN: {rel_p}: {e}")
    return changed


def check_git_safety(root, force=False):
    try:
        status = subprocess.check_output(["git", "status", "--porcelain"],
                                         cwd=root, text=True).strip()
        branch = subprocess.check_output(["git", "branch", "--show-current"],
                                         cwd=root, text=True).strip()
        if status and not force:
            print("✗ Git dirty. Commit or stash first.")
            return False
        if branch in {"main", "master"} and not force:
            print(f"⚠ On '{branch}'. For safety use a branch. Or --force to proceed.")
            return False
        return True
    except Exception:
        return True


def cmd_scan(root):
    print("═" * 70)
    print("  Natt-OS PHASE 2 — IMPACT SCAN (k→kim, b→boi)")
    print("═" * 70)
    plan = build_plan(root)
    print(f"\nFiles to migrate: {len(plan)}")
    if not plan:
        print("✓ Nothing to migrate.")
        return
    impact = scan_impact(root, plan)
    print(f"Files with code references: {len(impact)}")
    print(f"Files with NO references (safe rename): {len(plan) - len(impact)}")
    if impact:
        print("\n── TOP 10 REFERENCED ──")
        for old, refs in sorted(impact.items(), key=lambda x: -len(x[1]))[:10]:
            print(f"  [{len(refs)} refs] {old}")


def cmd_dryrun(root):
    print("═" * 70)
    print("  Natt-OS PHASE 2 — DRY-RUN")
    print("═" * 70)
    plan = build_plan(root)
    from collections import defaultdict
    by_rule = defaultdict(list)
    for old, new, rule in plan:
        by_rule[rule].append((old, new))
    print(f"\nTotal: {len(plan)} files\n")
    for rule in sorted(by_rule.keys()):
        items = by_rule[rule]
        print(f"[{rule}] — {len(items)} files")
        for old, new in items[:5]:
            print(f"  {old}")
            print(f"    → {new}")
        if len(items) > 5:
            print(f"  ... +{len(items)-5} more\n")


def cmd_execute(root, force=False):
    print("═" * 70)
    print("  Natt-OS PHASE 2 — EXECUTE")
    print("═" * 70)
    if not check_git_safety(root, force):
        return
    plan = build_plan(root)
    if not plan:
        print("✓ Nothing to migrate.")
        return
    print(f"\n{len(plan)} files will be renamed + refs rewritten.")
    ans = input("Proceed? [y/N]: ").strip().lower()
    if ans != "y":
        print("Aborted.")
        return
    log = {
        "timestamp": datetime.now().isoformat() + "Z",
        "spec_version": "v0.3.2-phase2",
        "renames": [{"old": o, "new": n, "rule": r} for o, n, r in plan],
    }
    log_path = os.path.join(root, MIGRATION_LOG)
    with open(log_path, "w") as f:
        json.dump(log, f, indent=2, ensure_ascii=False)
    print(f"✓ Log: {MIGRATION_LOG}")

    print("Rewriting refs...")
    changed = rewrite_refs(root, plan)
    print(f"✓ Rewrote {changed} files")

    renamed = 0
    for old, new, rule in plan:
        old_abs = os.path.join(root, old)
        new_abs = os.path.join(root, new)
        if os.path.exists(old_abs):
            os.makedirs(os.path.dirname(new_abs), exist_ok=True)
            shutil.move(old_abs, new_abs)
            renamed += 1
    print(f"✓ Renamed {renamed} files")
    print("\n── Next ──")
    print("  git status")
    print("  npx tsc --noEmit")
    print("  git add -A && git commit -m 'fix: normalize entity prefixes k→kim, b→boi'")


def cmd_rollback(root):
    print("═" * 70)
    print("  Natt-OS PHASE 2 — ROLLBACK")
    print("═" * 70)
    log_path = os.path.join(root, MIGRATION_LOG)
    if not os.path.exists(log_path):
        print(f"✗ No log: {MIGRATION_LOG}")
        return
    with open(log_path) as f:
        log = json.load(f)
    plan = log["renames"]
    print(f"Rollback {len(plan)} renames from {log['timestamp']}...")
    ans = input("Proceed? [y/N]: ").strip().lower()
    if ans != "y":
        print("Aborted.")
        return
    reverse_plan = [(e["new"], e["old"], e["rule"]) for e in plan]
    changed = rewrite_refs(root, reverse_plan)
    print(f"✓ Reverted refs in {changed} files")
    restored = 0
    for entry in plan:
        new_abs = os.path.join(root, entry["new"])
        old_abs = os.path.join(root, entry["old"])
        if os.path.exists(new_abs):
            os.makedirs(os.path.dirname(old_abs), exist_ok=True)
            shutil.move(new_abs, old_abs)
            restored += 1
    print(f"✓ Restored {restored} files")
    os.rename(log_path, log_path + ".rolled-back." + datetime.now().strftime("%Y%m%d_%H%M%S"))


def main():
    root = os.getcwd()
    args = sys.argv[1:]
    force = "--force" in args
    args = [a for a in args if not a.startswith("--")]
    mode = args[0] if args else "dryrun"
    if mode == "scan": cmd_scan(root)
    elif mode == "dryrun": cmd_dryrun(root)
    elif mode == "execute": cmd_execute(root, force=force)
    elif mode == "rollback": cmd_rollback(root)
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
