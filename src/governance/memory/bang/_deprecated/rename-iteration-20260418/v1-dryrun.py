#!/usr/bin/env python3
"""
Natt-OS File Rename — Dry Run
Theo SPEC NGON NGU v1.2 R01-R13.

CHỈ SCAN + IN RA MAPPING. KHÔNG ĐỤNG FILE.
Sau khi anh duyệt → script khác sẽ rename thật.
"""
import os
import re
import sys
from pathlib import Path

ROOT = os.environ.get("NATTOS_ROOT", ".")

# Excludes
SKIP_DIRS = {
    "node_modules", ".git", "dist", "build", "archive", "__MACOSX",
    ".next", "coverage", "out",
    # Business data — KHÔNG đổi
    "database", "data-raw",
    # Docs samples — KHÔNG đổi
    "samples",
    # node_modules trong sub-folder
    ".nattos-twin",  # em sẽ xử riêng .nattos-twin sau
}

SKIP_NAMES = {
    "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    "tsconfig.json", "tsconfig.server.json", "tsconfig.build.json",
    ".gitignore", ".npmrc", ".nvmrc",
    "README.md",  # tool doc — giữ .md
}

# Rules — thứ tự quan trọng, match trên xuống
# (matcher, new_extension, rule_name, description)
RULES = [
    # R05 — Hiến Pháp + amendments → .anc
    (
        lambda p: re.match(r"HIEN-PHAP.*\.md$", p.name, re.I) or
                  re.search(r"/amendments/.*\.md$", str(p)),
        ".anc", "R05", "Hiến Pháp / amendments"
    ),

    # R02 — cell manifest → .cell.anc
    (
        lambda p: p.name == "manifest.json" and "/cells/" in str(p),
        ".cell.anc", "R02", "Cell DNA manifest"
    ),

    # R02 — boundary policy → .boundary.si
    (
        lambda p: p.name == "boundary.policy.json",
        ".boundary.si", "R02", "Boundary policy sealed"
    ),

    # R06 — contracts lock → .si
    (
        lambda p: re.match(r".*\.contracts\.lock\.json$", p.name),
        ".si", "R06", "Contract lock sealed",
        lambda name: name.replace(".contracts.lock.json", ".contracts.lock.si")
    ),

    # R10 — authority lock → .si
    (
        lambda p: p.name == "builder-authority-lock.json",
        ".si", "R10", "Authority lock sealed"
    ),

    # R08 — registry → .sira
    (
        lambda p: "registry" in p.name and p.suffix == ".json",
        ".sira", "R08", "Registry / namespace"
    ),

    # R03 — session record → .thuo
    (
        lambda p: re.match(r"SES-[a-z0-9]+\.json$", p.name, re.I),
        ".thuo", "R03", "Session record QNEU"
    ),

    # R07 + R10 — audit log / violation → .heyna
    (
        lambda p: (p.name == "audit-log.jsonl") or
                  (p.name == "builder-audit-trail.json") or
                  re.match(r"log_violation.*\.txt$", p.name) or
                  "violations" in p.name.lower() and p.suffix == ".json",
        ".heyna", "R07/R10", "Event log / audit trail"
    ),

    # R13 — THIEN NHẮN *.txt → .heyna
    (
        lambda p: re.match(r"(THIEN|Thiên).*NH(A|Ắ)N.*\.txt$", p.name, re.I),
        ".heyna", "R13", "Entity message log"
    ),

    # R13 — ENTITY MEMORY.json → .kris
    (
        lambda p: re.match(r"(THIEN|Thiên|KIM|BANG|BĂNG|CAN|PHIEU|PHIẾU|BOI|BỐI).*MEMORY\.json$", p.name, re.I),
        ".kris", "R13", "Entity memory file",
    ),

    # R10 — system-state.json → .phieu
    (
        lambda p: p.name == "system-state.json",
        ".phieu", "R10", "Governance state runtime"
    ),

    # R01 — <entity>fs_*.json → .phieu
    (
        lambda p: re.match(r".+fs_v?[\d.]+\.json$", p.name),
        ".phieu", "R01", "Entity state file"
    ),

    # R12 — boiboi_what_to_do.json → .phieu
    (
        lambda p: p.name == "boiboi_what_to_do.json",
        ".phieu", "R12", "Bối Bối plan state"
    ),

    # R01 — <entity>mf_*.json → .kris
    (
        lambda p: re.match(r".+mf_v?[\d.]+\.json$", p.name),
        ".kris", "R01", "Entity memory file"
    ),

    # R12 — boiboi memory → .kris
    (
        lambda p: re.match(r"(bmf|boiboi_memory|boiboi_quick).*\.json$", p.name),
        ".kris", "R12", "Bối Bối memory"
    ),

    # R04 — <entity>self*.md → .kris
    (
        lambda p: re.match(r".+[Ss]elf.*\.md$", p.name),
        ".kris", "R04", "Self-introspection"
    ),

    # R11 — SESSION_*.md / session_summary_*.md / *_auto.md → .kris
    (
        lambda p: re.match(r"SESSION_.*\.md$", p.name) or
                  re.match(r"session_summary.*\.md$", p.name, re.I) or
                  re.match(r".*_auto\.md$", p.name),
        ".kris", "R11", "Session summary / auto report"
    ),

    # R11 — *-report.md / *-report.json / *-report.txt → .kris
    (
        lambda p: re.match(r".*[-_]report.*\.(md|json|txt)$", p.name),
        ".kris", "R11", "Report → memory"
    ),

    # R11 extended — SPEC / QIINT / BRIEF / roadmap / NATTOS_COMPLETE / KIM-CHI-NAM → .kris
    (
        lambda p: re.match(
            r"(SPEC[-_].*|QIINT[-_].*|BRIEF[-_].*|roadmap.*|NATTOS[-_]COMPLETE.*|"
            r"KIM[-_]CHI[-_]NAM.*|SPEC-Nauion.*|SPEC-Finance.*|SPEC-.*|"
            r"Natt-OS-.*|MACH_HEYNA.*|COLOR_SiraSIGN.*|VISION_ENGINE.*|"
            r"workflowsx.*|mapptre.*)\.md$", p.name, re.I),
        ".kris", "R11+", "SPEC / brief / knowledge doc → memory"
    ),
]


def classify(path: Path):
    """Trả về (new_path, rule, description) hoặc None nếu không có rule."""
    for rule in RULES:
        matcher = rule[0]
        if matcher(path):
            new_ext = rule[1]
            rule_name = rule[2]
            desc = rule[3]

            # Special renamer function for edge cases
            if len(rule) >= 5:
                new_name_fn = rule[4]
                new_name = new_name_fn(path.name)
            else:
                # Default: replace extension
                if path.name.endswith(".contracts.lock.json"):
                    new_name = path.name.replace(".contracts.lock.json", new_ext)
                elif path.name.endswith(".jsonl"):
                    new_name = path.stem.rsplit(".", 0)[0] + new_ext
                    # Actually jsonl has no double dot
                    new_name = path.name.rsplit(".jsonl", 1)[0] + new_ext
                else:
                    # Strip last extension, add new
                    new_name = path.stem + new_ext

            new_path = path.parent / new_name
            return new_path, rule_name, desc
    return None


def walk_repo():
    """Generator: yield mọi file cần consider."""
    for dirpath, dirs, files in os.walk(ROOT):
        # Filter out skip dirs
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if f in SKIP_NAMES:
                continue
            # Skip code files (R09)
            if f.endswith((".ts", ".tsx", ".js", ".jsx", ".cjs", ".mjs",
                           ".d.ts", ".test.ts", ".sh", ".py", ".svg",
                           ".png", ".jpg", ".jpeg", ".gif", ".webp",
                           ".mp4", ".mov", ".pdf", ".zip", ".tar",
                           ".woff", ".woff2", ".ttf")):
                continue
            yield Path(dirpath) / f


def main():
    print("=" * 80)
    print("  Natt-OS FILE RENAME — DRY RUN")
    print("  Theo SPEC NGON NGU v1.2 R01-R13")
    print("  KHÔNG ĐỤNG FILE THẬT. CHỈ LIST MAPPING.")
    print("=" * 80)
    print(f"  Repo: {os.path.abspath(ROOT)}")
    print()

    matched = []
    unmatched = []

    for path in walk_repo():
        result = classify(path)
        if result:
            new_path, rule, desc = result
            if new_path != path:  # Chỉ đếm khi thực sự đổi
                matched.append((path, new_path, rule, desc))
        else:
            unmatched.append(path)

    # Group by rule
    by_rule = {}
    for old, new, rule, desc in matched:
        by_rule.setdefault(rule, []).append((old, new, desc))

    # Print per rule
    for rule in sorted(by_rule.keys()):
        entries = by_rule[rule]
        print(f"─── {rule}  ({len(entries)} files) ───")
        for old, new, desc in entries[:10]:  # Max 10 per rule
            rel_old = os.path.relpath(old, ROOT)
            rel_new = os.path.relpath(new, ROOT)
            print(f"    {rel_old}")
            print(f"  → {rel_new}")
        if len(entries) > 10:
            print(f"    ... (+{len(entries) - 10} more)")
        print()

    # Summary
    print("=" * 80)
    print(f"  TOTAL files to rename: {len(matched)}")
    print(f"  Files không match rule nào: {len(unmatched)}")
    print("=" * 80)

    # Show unmatched (first 30)
    if unmatched:
        print()
        print("─── UNMATCHED (cần anh quyết) ───")
        for path in unmatched[:30]:
            rel = os.path.relpath(path, ROOT)
            print(f"    {rel}")
        if len(unmatched) > 30:
            print(f"    ... (+{len(unmatched) - 30} more)")
        print()


if __name__ == "__main__":
    main()
