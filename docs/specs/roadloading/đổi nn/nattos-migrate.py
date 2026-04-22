#!/usr/bin/env python3
"""
NATT-OS Repo-Wide File Extension Migration
SPEC v0.3.1 FINAL — Phiên 20260417
Author: Băng (Chị Tư)
Approval required: Anh Natt (Gatekeeper)

USAGE:
  cd /path/to/natt-os_ver2goldmaster_COPY
  python3 nattos-migrate.py scan     # Impact scan — find refs that will break
  python3 nattos-migrate.py dryrun   # Show rename plan, NO actual changes
  python3 nattos-migrate.py execute  # Rename + rewrite imports (interactive)
  python3 nattos-migrate.py rollback # Undo last migration from log

SAFETY:
  - Default mode: DRYRUN
  - Creates .nattos-migration.log for rollback
  - Refuses to run if git status is dirty (unless --force)
  - Refuses to run on 'main' branch (unless --force)
  - Asks y/N before any destructive op
  - Never touches node_modules, .git, dist, build

RULES (SPEC v0.3.1):
  R01 <entity>mf_<v>.json    → <entity>khương<v>.kris    [NAM]
  R01 <entity>fs_<v>.json    → <entity>thịnh<v>.phieu    [BẮC]
  R02 cell.manifest.json     → <parent>.cell.anc         [TÂY]
  R02 boundary.policy.json   → <parent>.boundary.si      [TÂY]
  R02 <entity>ANC.json       → <entity>.anc              [TÂY]
  R03 SES-<ulid>.json        → SES-<ulid>.thuo           [NAM]
  R04 <entity>Self.md        → <entity>self1.0.0.kris    [NAM]
  R05 HIEN-PHAP*.md          → HIEN-PHAP*.anc            [ĐÔNG]
  R05 amendments/*.md        → amendments/*.anc          [ĐÔNG]
  R06 *.contracts.lock.json  → *.contracts.lock.si       [ĐÔNG]
  R07 audit-log.jsonl        → audit-log.heyna           [NAM]
  R08 *registry*.json        → *registry*.sira           [TÂY]
  R09 *.ts *.tsx *.sh .png   → KEEP (industry standard)
  R10 builder-audit-trail    → .heyna | builder-authority-lock → .si | system-state → .phieu
  R11 SESSION_*.md, session_summary_*.md, *-report.json, *_auto.md → .kris [NAM]
  R12 bmf.json, boiboi_what_to_do.json → .thịnh | boiboi_memory*, boiboi_quick* → .kris
  R13 THIÊN MEMORY.json, KIM MEMORY.json → <entity>khương.kris | THIEN NHẮN *.txt → .heyna
"""

import os
import re
import sys
import json
import shutil
import subprocess
from pathlib import Path
from datetime import datetime

# ─────────────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────────────

SKIP_DIRS = {".git", "node_modules", "dist", "build", ".next", "__MACOSX", ".nattos-twin"}
SKIP_EXT = {".lock", ".lockb"}
MIGRATION_LOG = ".nattos-migration.log"

# Code file extensions to scan for reference rewrites
CODE_EXT = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".sh", ".json", ".md", ".html"}

# ─────────────────────────────────────────────────────────────────────
# CLASSIFY
# ─────────────────────────────────────────────────────────────────────

def classify(filepath):
    """
    Return (new_name, rule, layer) if migrate, else (None, reason, None).
    filepath: relative path from repo root
    """
    name = os.path.basename(filepath)
    parent = os.path.basename(os.path.dirname(filepath))

    # R09 — KEEP code/asset files (industry standard)
    ext = os.path.splitext(name)[1].lower()
    if ext in {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".sh",
               ".png", ".jpg", ".svg", ".ico", ".css", ".html", ".htm",
               ".docx", ".xlsx", ".pdf", ".zip", ".env", ".gitignore", ".yml",
               ".yaml", ".toml", ".lock"}:
        return None, "R09-KEEP", None

    # R05 HIEN-PHAP*.md → .anc
    if name.startswith("HIEN-PHAP") and name.endswith(".md"):
        return name[:-3] + ".anc", "R05-HIENPHAP", "ĐÔNG"

    # R05 amendments/*.md → .anc
    if "amendments" in filepath and name.endswith(".md"):
        return name[:-3] + ".anc", "R05-AMENDMENT", "ĐÔNG"

    # R06 *.contracts.lock.json → .si
    if name.endswith(".contracts.lock.json"):
        return name[:-5] + ".si", "R06-CONTRACT", "ĐÔNG"

    # R07 audit-log.jsonl → audit-log.heyna
    if name == "audit-log.jsonl":
        return "audit-log.heyna", "R07-AUDIT", "NAM"

    # R02 cell.manifest.json → <parent>.cell.anc
    if name == "cell.manifest.json":
        return f"{parent}.cell.anc", "R02-MANIFEST", "TÂY"

    # R02 boundary.policy.json → <parent>.boundary.si
    if name == "boundary.policy.json":
        return f"{parent}.boundary.si", "R02-BOUNDARY", "TÂY"

    # R02 <entity>ANC.json → <entity>.anc
    m = re.match(r"^([a-zA-Z]+)ANC\.json$", name)
    if m:
        return f"{m.group(1).lower()}.anc", "R02-ENTITY-ANC", "TÂY"

    # R08 *registry*.json → *registry*.sira
    if "registry" in name.lower() and name.endswith(".json"):
        return name[:-5] + ".sira", "R08-REGISTRY", "TÂY"

    # R03 SES-<ulid>.json → SES-<ulid>.thuo
    if re.match(r"^SES-[a-zA-Z0-9]+-[a-zA-Z0-9]+\.json$", name):
        return name[:-5] + ".thuo", "R03-SESSION", "NAM"

    # R04 <entity>Self.md / self.md → <entity>self1.0.0.kris
    m = re.match(r"^([a-zA-Z]+)[sS]elf\.md$", name)
    if m:
        return f"{m.group(1).lower()}self1.0.0.kris", "R04-SELF", "NAM"

    # R01 <entity>mf_vX.Y.json → <entity>khương<v>.kris
    m = re.match(r"^([a-z]+)mf[_]?[vV]?(\d+(?:[\._]\d+)*.*)\.json$", name, re.I)
    if m:
        entity = m.group(1).lower()
        version = m.group(2).replace("_", ".")
        return f"{entity}khương{version}.kris", "R01-MEMORY", "NAM"

    # R01 <entity>fs_vX.Y.json → <entity>thịnh<v>.phieu
    m = re.match(r"^([a-z]+)fs[_]?[vV]?(\d+(?:[\._]\d+)*.*)\.json$", name, re.I)
    if m:
        entity = m.group(1).lower()
        version = m.group(2).replace("_", ".")
        return f"{entity}thịnh{version}.phieu", "R01-STATE", "BẮC"

    # R13 THIÊN MEMORY.json, KIM MEMORY.json → <entity>khương.kris
    m = re.match(r"^(THIÊN|KIM|BĂNG|BOI|PHIEU|CAN|KRIS)\s+MEMORY\.json$", name, re.I)
    if m:
        entity_map = {"THIÊN": "thien", "KIM": "kim", "BĂNG": "bang",
                      "BOI": "boi", "PHIEU": "phieu", "CAN": "can", "KRIS": "kris"}
        entity = entity_map.get(m.group(1).upper(), m.group(1).lower())
        return f"{entity}khương.kris", "R13-ENTITY-MEMORY-CAPS", "NAM"

    # R13 THIEN NHẮN *.txt → .heyna
    if re.match(r"^THIEN\s+NHẮN.*\.txt$", name, re.I):
        return name[:-4] + ".heyna", "R13-MESSAGE", "NAM"

    # R12 boiboi_what_to_do.json → .thịnh (TODO = state sống)
    if re.match(r"^boiboi_what_to_do\.json$", name, re.I):
        return "boithịnh-plan.phieu", "R12-BOI-PLAN", "BẮC"

    # R12 boiboi_memory*, boiboi_quick*, bmf.json → .kris
    if re.match(r"^(bmf|boiboi_memory|boiboi_quick|boiboi_recap)\.json$", name, re.I):
        return "boikhương.kris", "R12-BOI-MEMORY", "NAM"

    # R11 SESSION summaries + reports → .kris (ký ức đóng)
    if re.match(r"^(SESSION_|session_summary_|bangmf-session-)", name) and name.endswith(".md"):
        return name[:-3] + ".kris", "R11-SESSION-SUMMARY", "NAM"
    if re.match(r"^\d{4}-\d{2}-\d{2}_.*_auto\.md$", name):
        return name[:-3] + ".kris", "R11-AUDIT-REPORT", "NAM"
    if name.endswith("-report.json") or name.endswith("-scan.json"):
        return name[:-5] + ".kris", "R11-REPORT", "NAM"

    # R10 governance state files
    if name == "builder-audit-trail.json":
        return "builder-audit-trail.heyna", "R10-GOV-AUDIT", "NAM"
    if name == "builder-authority-lock.json":
        return "builder-authority-lock.si", "R10-GOV-LOCK", "ĐÔNG"
    if name == "system-state.json":
        return "system-state.phieu", "R10-GOV-STATE", "BẮC"

    # .anc, .kris, .phieu, .si, .sira, .heyna, .thuo, .khai, .ml — already migrated
    if ext in {".anc", ".kris", ".phieu", ".si", ".sira", ".heyna",
               ".thuo", ".khai", ".ml"}:
        return None, "R-ALREADY-MIGRATED", None

    # Config/unknown .json — flag for manual
    if name.endswith(".json"):
        return None, "UNKNOWN-JSON-MANUAL", None

    # Text files — flag
    if name.endswith(".txt"):
        return None, "UNKNOWN-TXT-MANUAL", None

    return None, "UNKNOWN", None


# ─────────────────────────────────────────────────────────────────────
# WALK
# ─────────────────────────────────────────────────────────────────────

def walk_repo(root):
    """Yield (abs_path, rel_path) for every file, skipping SKIP_DIRS."""
    for dirpath, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            abs_p = os.path.join(dirpath, f)
            rel_p = os.path.relpath(abs_p, root)
            yield abs_p, rel_p


def build_plan(root):
    """Return list of (old_rel, new_rel, rule, layer)."""
    plan = []
    for abs_p, rel_p in walk_repo(root):
        new_name, rule, layer = classify(rel_p)
        if new_name:
            new_rel = os.path.join(os.path.dirname(rel_p), new_name)
            plan.append((rel_p, new_rel, rule, layer))
    return plan


# ─────────────────────────────────────────────────────────────────────
# IMPACT SCAN — find references to files about to be renamed
# ─────────────────────────────────────────────────────────────────────

def scan_impact(root, plan):
    """
    For each file in plan, scan all code files for references.
    Return {old_path: [list of (file, line_num, line)]}
    """
    impact = {}
    # Build index of basenames to scan
    old_names = {os.path.basename(old): old for old, new, rule, layer in plan}

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


# ─────────────────────────────────────────────────────────────────────
# REWRITE REFERENCES in code when renaming
# ─────────────────────────────────────────────────────────────────────

def rewrite_refs(root, plan):
    """After rename, rewrite references in code files.
    Returns count of lines changed."""
    name_map = {os.path.basename(old): os.path.basename(new) for old, new, _, _ in plan}
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
            print(f"  WARN: could not rewrite {rel_p}: {e}")
    return changed


# ─────────────────────────────────────────────────────────────────────
# GIT SAFETY
# ─────────────────────────────────────────────────────────────────────

def check_git_safety(root, force=False):
    """Refuse if dirty or on main, unless --force."""
    try:
        status = subprocess.check_output(["git", "status", "--porcelain"],
                                         cwd=root, text=True).strip()
        branch = subprocess.check_output(["git", "branch", "--show-current"],
                                         cwd=root, text=True).strip()
        if status and not force:
            print("✗ Git working tree is DIRTY. Commit or stash first.")
            print("  Or use --force (NOT recommended on main).")
            return False
        if branch in {"main", "master"} and not force:
            print(f"✗ Refuse to run on '{branch}'. Switch to a migration branch:")
            print(f"  git checkout -b migration/spec-v0.3.1")
            print("  Or use --force (dangerous).")
            return False
        return True
    except subprocess.CalledProcessError:
        print("  (not a git repo — skipping git safety check)")
        return True
    except FileNotFoundError:
        print("  (git not installed — skipping git safety check)")
        return True


# ─────────────────────────────────────────────────────────────────────
# MODES
# ─────────────────────────────────────────────────────────────────────

def cmd_scan(root):
    print("═" * 70)
    print("  NATT-OS MIGRATION — IMPACT SCAN (SPEC v0.3.1)")
    print("═" * 70)
    plan = build_plan(root)
    print(f"\nFiles to migrate: {len(plan)}")
    impact = scan_impact(root, plan)
    referenced = len(impact)
    print(f"Files with code references: {referenced}")
    print(f"Files with NO references (safe to rename): {len(plan) - referenced}")
    print()
    if impact:
        print("── TOP 10 FILES WITH MOST REFERENCES ──")
        sorted_imp = sorted(impact.items(), key=lambda x: -len(x[1]))[:10]
        for old, refs in sorted_imp:
            print(f"\n  [{len(refs)} refs] {old}")
            for f, ln, snippet in refs[:3]:
                print(f"    {f}:{ln}  {snippet}")
            if len(refs) > 3:
                print(f"    ... +{len(refs)-3} more")

def cmd_dryrun(root):
    print("═" * 70)
    print("  NATT-OS MIGRATION — DRY-RUN (NO CHANGES)")
    print("═" * 70)
    plan = build_plan(root)
    from collections import defaultdict
    by_rule = defaultdict(list)
    for old, new, rule, layer in plan:
        by_rule[rule].append((old, new, layer))
    print(f"\nTotal files to migrate: {len(plan)}\n")
    for rule in sorted(by_rule.keys()):
        items = by_rule[rule]
        print(f"[{rule}] — {len(items)} files")
        for old, new, layer in items[:3]:
            print(f"  [{layer}] {old}")
            print(f"         → {new}")
        if len(items) > 3:
            print(f"  ... +{len(items)-3} more\n")

def cmd_execute(root, force=False):
    print("═" * 70)
    print("  NATT-OS MIGRATION — EXECUTE")
    print("═" * 70)
    if not check_git_safety(root, force):
        return
    plan = build_plan(root)
    print(f"\n{len(plan)} files will be renamed + imports rewritten.")
    ans = input("Proceed? [y/N]: ").strip().lower()
    if ans != "y":
        print("Aborted.")
        return
    # Write log first
    log = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "spec_version": "v0.3.1",
        "renames": [{"old": o, "new": n, "rule": r, "layer": l}
                    for o, n, r, l in plan],
    }
    log_path = os.path.join(root, MIGRATION_LOG)
    with open(log_path, "w") as f:
        json.dump(log, f, indent=2, ensure_ascii=False)
    print(f"✓ Log written: {MIGRATION_LOG}")
    # Rewrite refs FIRST (while files still have old names — walk_repo sees all)
    print("Rewriting code references (before rename)...")
    changed = rewrite_refs(root, plan)
    print(f"✓ Rewrote references in {changed} files")
    # Rename AFTER
    renamed = 0
    for old, new, rule, layer in plan:
        old_abs = os.path.join(root, old)
        new_abs = os.path.join(root, new)
        if os.path.exists(old_abs):
            os.makedirs(os.path.dirname(new_abs), exist_ok=True)
            shutil.move(old_abs, new_abs)
            renamed += 1
    print(f"✓ Renamed {renamed} files")
    print()
    print("── Next steps ──")
    print("  1. git status      # see diff")
    print("  2. npx tsc --noEmit # verify no broken imports")
    print("  3. git add -A && git commit -m 'feat: migrate to SPEC v0.3.1'")
    print("  — or rollback if broken:")
    print("     python3 nattos-migrate.py rollback")

def cmd_rollback(root):
    print("═" * 70)
    print("  NATT-OS MIGRATION — ROLLBACK")
    print("═" * 70)
    log_path = os.path.join(root, MIGRATION_LOG)
    if not os.path.exists(log_path):
        print(f"✗ No log file found: {MIGRATION_LOG}")
        return
    with open(log_path) as f:
        log = json.load(f)
    plan = log["renames"]
    print(f"Rolling back {len(plan)} renames from {log['timestamp']}...")
    ans = input("Proceed? [y/N]: ").strip().lower()
    if ans != "y":
        print("Aborted.")
        return
    # Reverse ref rewrite FIRST (while files still have new names)
    reverse_plan = [(entry["new"], entry["old"], entry["rule"], entry.get("layer"))
                    for entry in plan]
    changed = rewrite_refs(root, reverse_plan)
    print(f"✓ Reverted references in {changed} files")
    # Reverse rename AFTER
    restored = 0
    for entry in plan:
        old = entry["old"]
        new = entry["new"]
        new_abs = os.path.join(root, new)
        old_abs = os.path.join(root, old)
        if os.path.exists(new_abs):
            os.makedirs(os.path.dirname(old_abs), exist_ok=True)
            shutil.move(new_abs, old_abs)
            restored += 1
    print(f"✓ Restored {restored} files")
    os.rename(log_path, log_path + ".rolled-back." + datetime.utcnow().strftime("%Y%m%d_%H%M%S"))
    print(f"✓ Log archived")


# ─────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────

def main():
    root = os.getcwd()
    args = sys.argv[1:]
    force = "--force" in args
    args = [a for a in args if not a.startswith("--")]
    mode = args[0] if args else "dryrun"

    if mode == "scan":
        cmd_scan(root)
    elif mode == "dryrun":
        cmd_dryrun(root)
    elif mode == "execute":
        cmd_execute(root, force=force)
    elif mode == "rollback":
        cmd_rollback(root)
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
