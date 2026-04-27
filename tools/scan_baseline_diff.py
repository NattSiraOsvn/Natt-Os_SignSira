#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scan_baseline_diff.py
=====================
@nauion-tool python-pure v1
@scope sovereign-audit-baseline-diff
@paradigm B (Bash thuần — anh hai Thiên Lớn ratify ss20260427)
@invoked-by nattos.sh §37 BASELINE DIFF
@authority Sirawat Băng (Obikeeper QNEU 313.5)

Compare today's metrics with previous snapshot (rolling 30 history).
Output:
  - stdout: diff per metric + new commits since last
  - file: .nattos-twin/history.json (rolling 30)
  - file: .nattos-twin/snapshot.json (latest only)
"""
import os
import sys
import json
import datetime
import fcntl
import subprocess


SNAPSHOT_FILE = ".nattos-twin/history.json"


def run(cmd: str) -> str:
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return r.stdout.strip()


def main() -> int:
    TODAY_TS = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    commits = run("git log --oneline | wc -l").strip().lstrip("0") or "0"
    ts_files = run("find src -name '*.ts' -not -path '*/node_modules/*' | wc -l").strip().lstrip("0") or "0"
    ts_lines = run("find src -name '*.ts' -not -path '*/node_modules/*' -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}'").strip() or "0"

    biz_cells = run("ls src/cells/business/ 2>/dev/null | wc -l").strip().lstrip("0") or "0"
    kernel_cells = run("ls src/cells/kernel/ 2>/dev/null | wc -l").strip().lstrip("0") or "0"
    engines = run("find src -name '*.engine.ts' | wc -l").strip().lstrip("0") or "0"
    dirty = run("git status --porcelain | wc -l").strip().lstrip("0") or "0"
    root_files = run("find . -maxdepth 1 -type f ! -name '.*' | wc -l").strip().lstrip("0") or "0"

    today = {
        "ts": TODAY_TS,
        "commits": int(commits),
        "ts_files": int(ts_files),
        "ts_lines": int(ts_lines),
        "biz_cells": int(biz_cells),
        "kernel_cells": int(kernel_cells),
        "engines": int(engines),
        "dirty": int(dirty),
        "root_files": int(root_files),
    }

    history = []
    if os.path.exists(SNAPSHOT_FILE):
        try:
            history = json.load(open(SNAPSHOT_FILE))
            if not isinstance(history, list):
                history = [history]
        except Exception:
            history = []

    if history:
        prev = history[-1]
        print(f"  So sánh: {prev.get('ts', 'unknown')} → {TODAY_TS}\n")

        for key in ["commits", "ts_files", "ts_lines", "engines", "dirty", "root_files"]:
            old_val = prev.get(key, 0)
            new_val = today.get(key, 0)
            delta = new_val - old_val
            if delta == 0:
                print(f"    → {key}: {new_val}  (không đổi)")
            elif delta > 0:
                print(f"  \033[0;32m  ↑\033[0m {key}: {old_val} → {new_val}  (+{delta})")
            else:
                print(f"  \033[0;33m  ↓\033[0m {key}: {old_val} → {new_val}  ({delta})")

        if prev.get("biz_cells") != today["biz_cells"]:
            delta = today["biz_cells"] - prev.get("biz_cells", 0)
            print(f"  \033[0;32m  ↑\033[0m biz_cells: {prev.get('biz_cells')} → {today['biz_cells']}  (+{delta} cells mới)")

        delta_commits = today["commits"] - prev.get("commits", 0)
        if delta_commits > 0:
            print(f"\n  {delta_commits} commits mới kể từ lần cuối:")
            recent = run(f"git log --oneline -{delta_commits}")
            for line in recent.split("\n"):
                print(f"    📌  {line}")

    else:
        print(f"  ℹ  Lần đầu chạy — tạo baseline snapshot")
        print(f"  Lần sau sẽ có diff so sánh")

    history.append(today)
    history = history[-30:]
    os.makedirs(".nattos-twin", exist_ok=True)
    json.dump(history, open(SNAPSHOT_FILE, "w"), indent=2, ensure_ascii=False)
    print(f"\n  ✅ Snapshot saved ({len(history)} records)")

    snap = {
        "last_hash": run("git log --oneline -1 | cut -d' ' -f1"),
        "last_ts": TODAY_TS,
        "commits": today["commits"],
        "ts_files": today["ts_files"],
        "engines": today["engines"],
        "ok": 0,
        "state": "HEALTHY",
    }
    snapshot_path = ".nattos-twin/snapshot.json"
    try:
        with open(snapshot_path, "w") as sf:
            fcntl.flock(sf.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
            json.dump(snap, sf, indent=2, ensure_ascii=False)
            fcntl.flock(sf.fileno(), fcntl.LOCK_UN)
        print(f"  ✅ snapshot.json saved -> {snap['last_hash']}")
    except IOError:
        print(f"  ⚠️  snapshot.json locked — skipped (another audit running?)")

    return 0


if __name__ == "__main__":
    sys.exit(main())
