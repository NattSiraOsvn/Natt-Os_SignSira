#!/usr/bin/env python3
"""
natt-os File Rename — EXECUTE v1
Theo SPEC NGON NGU v1.2 R01-R13.

Chạy rename thật BẰNG git mv để giữ history.

Cơ chế:
  1. Load rules từ dryrun-v11 (cùng logic)
  2. Scan repo, match files
  3. `git mv <old> <new>` từng file
  4. Ghi log: nattos-rename-execute.log (danh sách rename + status)
  5. Scan code/markdown để tìm reference cần update (BÁO RA, không auto fix)

SAFETY:
  - Kiểm tra git clean trước khi chạy
  - Từng rename được log + status
  - Không động file không match rule
  - Không auto-edit code (để anh review references tay)

USAGE:
  # Dry-run giả lập lại (không git mv)
  python3 nattos-rename-execute.py --dry-run

  # Chạy thật
  python3 nattos-rename-execute.py --execute
"""
import os
import re
import sys
import subprocess
from pathlib import Path
from datetime import datetime

ROOT = os.environ.get("NATTOS_ROOT", ".")

# ═══════════════════════════════════════════════════════════════
# RULES (đồng bộ với dryrun-v11)
# ═══════════════════════════════════════════════════════════════

SKIP_DIRS = {
    "node_modules", ".git", "dist", "build", "archive", "__MACOSX",
    ".next", "coverage", "out",
    "database", "data-raw",
    "samples",
    ".nattos-twin",
    "config",
}

SKIP_NAMES = {
    "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    "tsconfig.json", "tsconfig.server.json", "tsconfig.build.json",
    ".gitignore", ".npmrc", ".nvmrc",
    "README.md",
    "natt-os-twin.json",
    "nattos.sira",
    ".keep",
    ".env.local", ".dockerignore",
    "Dockerfile", "nginx.conf",
    "favicon.ico",
    # Evidence doc — anh để đó
    "BCTC_4SO_REVERSE_MAP_2025.txt",
}


def _is_rename_preview(name):
    return name.startswith("rename-preview") and name.endswith(".txt")


RULES = [
    # AVATAR — entity avatar no-ext → .png
    (
        lambda p: not p.suffix and re.search(
            r"/memory/[^/]+/[^/]*(avt|avatar|body)$",
            str(p), re.I
        ),
        ".png", "AVATAR", "Entity avatar → .png"
    ),

    # R05 — Hiến Pháp / amendments → .anc
    (
        lambda p: re.match(r"HIEN-PHAP.*\.md$", p.name, re.I) or
                  re.search(r"/amendments/.*\.md$", str(p)),
        ".anc", "R05", "Hiến Pháp / amendments"
    ),

    # R02 — cell manifest → .cell.anc
    (
        lambda p: p.name == "manifest.json" and "/cells/" in str(p),
        ".cell.anc", "R02", "Cell DNA manifest",
        lambda name: "manifest.cell.anc"
    ),

    # R02 — boundary policy → .boundary.si
    (
        lambda p: p.name == "boundary.policy.json",
        ".boundary.si", "R02", "Boundary policy",
        lambda name: "boundary.policy.si"  # giữ .policy.
    ),

    # R06 — contracts lock → .si
    (
        lambda p: re.match(r".*\.contracts\.lock\.json$", p.name),
        ".si", "R06", "Contract lock",
        lambda name: name.replace(".contracts.lock.json", ".contracts.lock.si")
    ),

    # R10 — authority lock → .si
    (
        lambda p: p.name == "builder-authority-lock.json",
        ".si", "R10", "Authority lock"
    ),

    # R08 — registry → .sira
    (
        lambda p: "registry" in p.name and p.suffix == ".json",
        ".sira", "R08", "Registry"
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
                  re.match(r"log[_-]violation.*\.txt$", p.name) or
                  ("violations" in p.name.lower() and p.suffix == ".json"),
        ".heyna", "R07/R10", "Event log / audit trail"
    ),

    # R13 — THIEN NHẮN *.txt → .heyna
    (
        lambda p: re.match(r"(THIEN|thiên).*NH(A|Ắ)N.*\.txt$", p.name, re.I),
        ".heyna", "R13", "Entity message log"
    ),

    # R08+ — file-map registry → .sira
    (
        lambda p: re.match(r".*[-_]file[-_]map.*\.(txt|json)$", p.name) or
                  re.match(r".*-map\.json$", p.name),
        ".sira", "R08+", "File map / registry"
    ),

    # R02+ — schema meta → .anc
    (
        lambda p: re.match(r"CELL_MANIFEST_SCHEMA.*\.json$", p.name) or
                  re.match(r".*_SCHEMA.*\.json$", p.name),
        ".anc", "R02+", "Schema identity"
    ),

    # R02++ — spec schema JSON → .anc
    (
        lambda p: re.match(r".*\.schema\.json$", p.name) or
                  re.match(r".*[-_]spec.*\.json$", p.name, re.I) or
                  re.match(r".*\.spec\.json$", p.name),
        ".anc", "R02++", "Spec schema JSON"
    ),

    # R06+ — contract JSON → .si
    (
        lambda p: re.match(r".*[-_]contracts?\..*\.json$", p.name, re.I) or
                  re.match(r"nattos-contract\.json$", p.name, re.I) or
                  re.match(r"component-contracts\.json$", p.name, re.I),
        ".si", "R06+", "Contract JSON"
    ),

    # R01+++ — entity memory no version → .kris
    (
        lambda p: re.match(r".+mf\.json$", p.name) and not p.name.startswith("."),
        ".kris", "R01+++", "Entity memory no-version"
    ),

    # R01++++ — memory/<entity>/*.json catch-all → .kris
    (
        lambda p: p.suffix == ".json" and re.search(
            r"/memory/(bang|kim|thienlon|can|boiboi|phieu|thiennho|Kris|Thienlon|sessions)/",
            str(p), re.I
        ),
        ".kris", "R01++++", "Entity memory json catch-all"
    ),

    # R01++ — entity memory .txt → .kris
    (
        lambda p: p.suffix == ".txt" and re.search(
            r"/memory/(bang|kim|thienlon|can|boiboi|phieu|thiennho|Kris|Thienlon|sessions)/",
            str(p), re.I
        ),
        ".kris", "R01++", "Entity memory .txt"
    ),

    # R07/R10+ — audit summary
    (
        lambda p: "audit/summary/" in str(p) and p.name == "rena-alerts.json",
        ".heyna", "R07+", "RENA alert stream"
    ),
    (
        lambda p: "audit/summary/" in str(p) and (
            p.name == "latest.json" or p.name == "metadata.json"
        ),
        ".phieu", "R10+", "Audit metadata/latest"
    ),
    (
        lambda p: "audit/summary/" in str(p) and p.suffix == ".json",
        ".thuo", "R03+", "Audit summary snapshot"
    ),
    (
        lambda p: "audit/reports/" in str(p) and p.suffix == ".json",
        ".thuo", "R03+", "Audit report snapshot"
    ),

    # R11+++ — audit report txt → .kris
    (
        lambda p: "audit/reports/" in str(p) and (
            "AUDIT" in p.name.upper() or p.name.startswith("natt-os FULL")
        ) and p.suffix == ".txt",
        ".kris", "R11+++", "Audit full system report txt"
    ),

    # R01+ — entity memory .md → .kris
    (
        lambda p: p.suffix == ".md" and re.search(
            r"/memory/(bang|kim|thienlon|can|boiboi|phieu|thiennho|Kris|Thienlon)/",
            str(p), re.I
        ),
        ".kris", "R01+", "Entity memory .md"
    ),

    # R01+ — entity memory <entity>mf_<v>.md → .kris
    (
        lambda p: re.match(r".*mf_[a-z0-9]+\.md$", p.name, re.I),
        ".kris", "R01+", "Entity memory md with version"
    ),

    # R11++++ — AUDIT-REPORT.md → .kris
    (
        lambda p: re.match(r"AUDIT[-_]REPORT.*\.md$", p.name, re.I),
        ".kris", "R11++++", "AUDIT-REPORT.md"
    ),

    # R13 — ENTITY MEMORY.json → .kris
    (
        lambda p: re.match(r"(THIEN|thiên|KIM|BANG|BĂNG|CAN|PHIEU|PHIẾU|BOI|BỐI).*MEMORY\.json$", p.name, re.I),
        ".kris", "R13", "Entity memory file",
    ),

    # R10 — system-state → .phieu
    (
        lambda p: p.name == "system-state.json",
        ".phieu", "R10", "Governance state runtime"
    ),

    # R01 — <entity>fs_*.json → .phieu
    (
        lambda p: re.match(r".+fs_v?[\d.]+\.json$", p.name),
        ".phieu", "R01", "Entity state file"
    ),

    # R12 — boiboi_what_to_do → .phieu
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

    # R04 — self*.md → .kris
    (
        lambda p: re.match(r".+[Ss]elf.*\.md$", p.name),
        ".kris", "R04", "Self-introspection"
    ),

    # R11 — SESSION / auto → .kris
    (
        lambda p: re.match(r"SESSION_.*\.md$", p.name) or
                  re.match(r"session_summary.*\.md$", p.name, re.I) or
                  re.match(r".*_auto\.md$", p.name),
        ".kris", "R11", "Session summary / auto report"
    ),

    # R11 — *-report → .kris
    (
        lambda p: re.match(r".*[-_]report.*\.(md|json|txt)$", p.name),
        ".kris", "R11", "Report → memory"
    ),

    # R05+ — SPEC / definition → .anc
    (
        lambda p: re.match(
            r"(SPEC[-_].*|QIINT[-_].*|BRIEF[-_].*|roadmap.*|NATTOS[-_]COMPLETE.*|"
            r"KIM[-_]CHI[-_]NAM.*|SPEC-Nauion.*|SPEC-Finance.*|SPEC-.*|"
            r"natt-os-.*|MACH_HEYNA.*|COLOR_siraSIGN.*|VISION_ENGINE.*|"
            r"workflowsx.*|mapptre.*)\.md$", p.name, re.I),
        ".anc", "R05+", "SPEC / definition doc"
    ),

    # R05++ — docs/{specs,flag,architecture}/*.md → .anc
    (
        lambda p: p.suffix == ".md" and (
            "docs/specs/" in str(p) or
            "docs/flag/" in str(p) or
            "docs/architecture/" in str(p)
        ),
        ".anc", "R05++", "docs/{specs,flag,architecture}/*.md"
    ),

    # R11++ — governance/memory/sessions/*.md → .kris
    (
        lambda p: p.suffix == ".md" and "governance/memory/sessions/" in str(p),
        ".kris", "R11++", "session memory .md"
    ),

    # R05+++ — SPEC file seal .kris nhầm → .anc (correction)
    (
        lambda p: (re.match(r"spec-.*\.kris$", p.name, re.I) or
                   re.match(r"SPEC[-_]NGON[-_]NGU.*\.kris$", p.name, re.I)),
        ".anc", "R05+++", "SPEC file correction"
    ),
]


def classify(path: Path):
    for rule in RULES:
        matcher = rule[0]
        if matcher(path):
            new_ext = rule[1]
            rule_name = rule[2]
            desc = rule[3]

            if len(rule) >= 5:
                new_name_fn = rule[4]
                new_name = new_name_fn(path.name)
            else:
                if path.name.endswith(".contracts.lock.json"):
                    new_name = path.name.replace(".contracts.lock.json", new_ext)
                elif path.name.endswith(".jsonl"):
                    new_name = path.name.rsplit(".jsonl", 1)[0] + new_ext
                elif not path.suffix:
                    # No ext → just append
                    new_name = path.name + new_ext
                else:
                    new_name = path.stem + new_ext

            new_path = path.parent / new_name
            return new_path, rule_name, desc
    return None


def walk_repo():
    for dirpath, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if f in SKIP_NAMES:
                continue
            if f.startswith("README") or f.endswith("README.md"):
                continue
            if _is_rename_preview(f):
                continue
            if f in (".keep", ".gitkeep"):
                continue
            if f.endswith((".ts", ".tsx", ".js", ".jsx", ".cjs", ".mjs",
                           ".d.ts", ".test.ts", ".sh", ".py", ".svg",
                           ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico",
                           ".mp4", ".mov", ".pdf", ".zip", ".tar",
                           ".woff", ".woff2", ".ttf",
                           ".docx", ".xlsx", ".pptx",
                           ".doc", ".xls", ".ppt", ".rtf",
                           ".numbers", ".pages", ".keynote",
                           ".html", ".css",
                           ".log", ".conf", ".local",
                           ".lock")):
                continue
            if f.startswith("tsconfig.") and f.endswith(".json"):
                continue
            yield Path(dirpath) / f


# ═══════════════════════════════════════════════════════════════
# EXECUTE
# ═══════════════════════════════════════════════════════════════

def check_git_clean():
    """Verify git working tree clean before rename"""
    result = subprocess.run(
        ["git", "status", "--porcelain"],
        capture_output=True, text=True, cwd=ROOT
    )
    if result.returncode != 0:
        print("❌ git status failed:", result.stderr)
        return False
    if result.stdout.strip():
        print("⚠️  Git working tree NOT CLEAN:")
        print(result.stdout[:500])
        print()
        print("Anh commit hoặc stash trước khi chạy rename.")
        return False
    return True


def git_mv(old_path, new_path, dry_run=False):
    """git mv với error capture"""
    old_rel = str(old_path)
    new_rel = str(new_path)

    if dry_run:
        return True, "dry-run"

    result = subprocess.run(
        ["git", "mv", old_rel, new_rel],
        capture_output=True, text=True, cwd=ROOT
    )
    if result.returncode != 0:
        return False, result.stderr.strip()
    return True, "ok"


def main():
    dry_run = "--dry-run" in sys.argv
    execute = "--execute" in sys.argv

    if not dry_run and not execute:
        print("USAGE: python3 nattos-rename-execute.py [--dry-run | --execute]")
        sys.exit(1)

    print("=" * 80)
    mode = "DRY RUN" if dry_run else "EXECUTE (REAL GIT MV)"
    print(f"  natt-os RENAME — {mode}")
    print("=" * 80)
    print(f"  Repo: {os.path.abspath(ROOT)}")
    print()

    # Safety check
    if execute:
        if not check_git_clean():
            print()
            print("❌ Stopped. Clean working tree first.")
            sys.exit(2)
        print("✅ Git clean. Proceeding.")
        print()

    # Collect all renames
    renames = []
    for path in walk_repo():
        result = classify(path)
        if result:
            new_path, rule, desc = result
            if new_path != path:
                renames.append((path, new_path, rule, desc))

    print(f"Total renames to execute: {len(renames)}")
    print()

    # Log file
    log_path = Path(ROOT) / f"nattos-rename-{datetime.now().strftime('%Y%m%d-%H%M%S')}.log"
    log = []

    # Execute
    ok_count = 0
    fail_count = 0
    for old, new, rule, desc in renames:
        success, msg = git_mv(old, new, dry_run=dry_run)
        status = "✅" if success else "❌"
        rel_old = os.path.relpath(old, ROOT)
        rel_new = os.path.relpath(new, ROOT)
        line = f"{status} [{rule}] {rel_old} → {rel_new}"
        print(line)
        log.append(line)
        if not success:
            log.append(f"    error: {msg}")
            fail_count += 1
        else:
            ok_count += 1

    print()
    print("=" * 80)
    print(f"  RESULT: {ok_count} renamed / {fail_count} failed")
    print("=" * 80)

    # Write log
    if not dry_run:
        log_path.write_text(
            f"# natt-os rename log\n"
            f"# Date: {datetime.now().isoformat()}\n"
            f"# OK: {ok_count}  fail: {fail_count}\n\n" +
            "\n".join(log)
        )
        print(f"  Log saved: {log_path.name}")
        print()
        print("  NEXT STEPS:")
        print("    1. git status (verify renames)")
        print("    2. Xử tay 2 files còn lại:")
        print('       git mv "roadloading/đổi nn/Đã dán markdown (1).md" \\')
        print('              "roadloading/đổi nn/BRIEF_BANG_TO_THIENLON_UI_FEEDBACK_20260418.anc"')
        print('       git mv "src/governance/memory/kim/kimtonghop" \\')
        print('              "src/governance/memory/kim/kimtonghop.kris"')
        print("    3. Scan references trong code + markdown")
        print("    4. git commit -m 'rename(spec): migrate files to natt-os naming per SPEC NGON NGU v1.2'")
        print("    5. git push")


if __name__ == "__main__":
    main()
