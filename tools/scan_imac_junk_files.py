import argparse
import json
import os
import time
from pathlib import Path
from datetime import datetime

JUNK_FILE_NAMES = {".DS_Store", "Thumbs.db", "desktop.ini", ".localized"}
JUNK_DIR_NAMES = {"__MACOSX", ".cache", "cache", "tmp", "temp", "coverage", ".next", "dist", "build", "node_modules", ".pytest_cache", ".mypy_cache"}
JUNK_SUFFIXES = {".log", ".tmp", ".temp", ".bak", ".old", ".orig", ".swp", ".swo", ".pyc", ".pyo"}
CACHE_HINTS = ["Library/Caches", "Library/Logs", "Library/Developer/Xcode/DerivedData", ".npm", ".pnpm-store", ".cargo/registry", ".Trash"]

def human_size(n):
    units = ["B", "KB", "MB", "GB", "TB"]
    x = float(n)
    for u in units:
        if x < 1024 or u == units[-1]:
            return f"{x:.2f} {u}"
        x /= 1024

def classify(path, is_dir, size, min_size):
    name = path.name
    s = str(path)
    reasons = []
    if is_dir:
        if name in JUNK_DIR_NAMES:
            reasons.append("junk_dir_name")
        if "Library/Caches" in s:
            reasons.append("macos_cache")
        if "DerivedData" in s:
            reasons.append("xcode_derived_data")
        if name == "node_modules":
            reasons.append("node_modules_heavy")
        return reasons
    if name in JUNK_FILE_NAMES:
        reasons.append("junk_file_name")
    if path.suffix in JUNK_SUFFIXES:
        reasons.append("junk_suffix")
    if name.endswith("~"):
        reasons.append("backup_suffix_tilde")
    if size >= min_size:
        reasons.append("large_file")
    if "Library/Logs" in s:
        reasons.append("log_file")
    return reasons

def scan(root, max_depth, min_size_mb, limit, include_caches):
    root = Path(root).expanduser().resolve()
    min_size = min_size_mb * 1024 * 1024
    findings = []
    total = 0
    visited = 0
    start = time.time()

    for current, dirs, files in os.walk(root, followlinks=False):
        cur = Path(current)
        visited += 1
        try:
            depth = len(cur.relative_to(root).parts)
        except Exception:
            depth = 0

        if depth >= max_depth:
            dirs[:] = []
        else:
            kept = []
            for d in dirs:
                dp = cur / d
                rel = str(dp)
                skip_cache = (not include_caches) and any(h in rel for h in CACHE_HINTS)
                skip_system = d in {".git", ".svn", ".hg", "System", "Applications", "Volumes", "private", "dev"}
                if not skip_cache and not skip_system and not dp.is_symlink():
                    kept.append(d)
            dirs[:] = kept

        for d in dirs:
            dp = cur / d
            reasons = classify(dp, True, 0, min_size)
            if reasons:
                findings.append({"path": str(dp), "type": "dir", "size_bytes": None, "size_human": "unknown", "reasons": reasons, "action": "review_before_delete"})

        for f in files:
            fp = cur / f
            if fp.is_symlink():
                continue
            try:
                size = fp.stat().st_size
            except Exception:
                continue
            reasons = classify(fp, False, size, min_size)
            if reasons:
                total += size
                findings.append({"path": str(fp), "type": "file", "size_bytes": size, "size_human": human_size(size), "reasons": reasons, "action": "review_before_delete"})

        if len(findings) >= limit:
            break

    findings.sort(key=lambda x: x["size_bytes"] or 0, reverse=True)
    return {
        "tool": "scan_imac_junk_files.py",
        "mode": "SAFE_SCAN_ONLY_NO_DELETE",
        "root": str(root),
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "duration_seconds": round(time.time() - start, 3),
        "visited_dirs": visited,
        "finding_count": len(findings),
        "candidate_size_bytes_files_only": total,
        "candidate_size_human_files_only": human_size(total),
        "delete_performed": False,
        "sudo_required": False,
        "requires_manual_review": True,
        "findings": findings[:limit],
    }

def write_report(result, out_dir):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_path = out_dir / f"imac_junk_scan_{stamp}.json"
    na_path = out_dir / f"imac_junk_scan_{stamp}.na"
    latest_json = out_dir / "imac_junk_scan_latest.json"
    latest_na = out_dir / "imac_junk_scan_latest.na"

    payload = json.dumps(result, ensure_ascii=False, indent=2)
    json_path.write_text(payload, "utf-8")
    latest_json.write_text(payload, "utf-8")

    lines = [
        "@nauion-report v1",
        "@name imac junk file scan",
        "@mode SAFE_SCAN_ONLY_NO_DELETE",
        "",
        "# iMac Junk File Scan Report",
        "",
        f"- root: {result['root']}",
        f"- generated_at: {result['generated_at']}",
        f"- finding_count: {result['finding_count']}",
        f"- candidate_size_files_only: {result['candidate_size_human_files_only']}",
        f"- delete_performed: {result['delete_performed']}",
        f"- requires_manual_review: {result['requires_manual_review']}",
        "",
        "## Findings",
        "",
    ]
    for i, item in enumerate(result["findings"], 1):
        lines += [
            f"### {i}. {item['path']}",
            f"- type: {item['type']}",
            f"- size: {item['size_human']}",
            f"- reasons: {', '.join(item['reasons'])}",
            f"- action: {item['action']}",
            "",
        ]
    text = "\n".join(lines)
    na_path.write_text(text, "utf-8")
    latest_na.write_text(text, "utf-8")
    return json_path, na_path, latest_json, latest_na

def main():
    ap = argparse.ArgumentParser(description="Safe scan junk/heavy files on iMac. No deletion is performed.")
    ap.add_argument("--root", default=str(Path.home()))
    ap.add_argument("--max-depth", type=int, default=4)
    ap.add_argument("--min-size-mb", type=int, default=1000)
    ap.add_argument("--limit", type=int, default=100)
    ap.add_argument("--include-caches", action="store_true")
    ap.add_argument("--out-dir", default="docs/runtime")
    args = ap.parse_args()

    result = scan(args.root, args.max_depth, args.min_size_mb, args.limit, args.include_caches)
    json_path, na_path, latest_json, latest_na = write_report(result, args.out_dir)
    print("imac junk scan done")
    print("mode:", result["mode"])
    print("findings:", result["finding_count"])
    print("candidate_size_files_only:", result["candidate_size_human_files_only"])
    print("report_json:", json_path)
    print("report_na:", na_path)

if __name__ == "__main__":
    main()
