#!/usr/bin/env python3
"""
bang_update_todo_status.py

Update trang thai cua todo trong file Bang todo tracker (.na format - JSON).

Author:  Bang (Ground Truth Validator + Toolsmith)
Session: 20260424
Scope:   Bang toolchain - update todo status, log changelog, maintain format integrity.
         Bang KHONG tu commit repo. Natt commit.

Usage:

  1) List all todos with current status:
       python3 scripts/bang_update_todo_status.py \\
         --file docs/runtime/todo/P0_HEYNA_KHAICELL_20260424.na \\
         --list

  2) Update todo status (co evidence commit):
       python3 scripts/bang_update_todo_status.py \\
         --file docs/runtime/todo/P0_HEYNA_KHAICELL_20260424.na \\
         --todo-id P0-HEYNA-G5 \\
         --status done \\
         --commit abc1234

  3) Update todo status (khong evidence, vi du chuyen sang in_progress):
       python3 scripts/bang_update_todo_status.py \\
         --file docs/runtime/todo/P0_HEYNA_KHAICELL_20260424.na \\
         --todo-id P0-HEYNA-G1 \\
         --status in_progress

Safety:
  - Atomic write via tempfile + os.replace (khong bao gio leave file dang do)
  - Validate todo_id ton tai truoc khi ghi
  - Validate status thuoc tap hop cho phep
  - Auto-update summary.by_status counts sau moi thay doi
  - Append vao meta.changelog de truy vet lich su

Valid statuses: pending, in_progress, done, blocked
"""

import argparse
import json
import os
import sys
import tempfile
from datetime import datetime, timezone, timedelta
from pathlib import Path

VALID_STATUSES = ["pending", "in_progress", "done", "blocked"]
VN_TZ = timezone(timedelta(hours=7))


def load_todo_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_todo_file_atomic(path, data):
    """Atomic write: ghi vao tempfile cung folder, roi rename. Khong corrupt file goc."""
    path = Path(path)
    dir_path = str(path.parent.resolve())
    with tempfile.NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        dir=dir_path,
        delete=False,
        suffix=".tmp",
        prefix=path.name + ".",
    ) as tf:
        json.dump(data, tf, ensure_ascii=False, indent=2)
        tf.write("\n")
        tmp_path = tf.name
    os.replace(tmp_path, str(path))


def recount_status_summary(todos):
    counts = {s: 0 for s in VALID_STATUSES}
    for t in todos:
        s = t.get("status", "pending")
        counts[s] = counts.get(s, 0) + 1
    return counts


def list_todos(data):
    todos = data.get("todos", [])
    meta = data.get("meta", {})

    print()
    print(f"FILE:    {meta.get('file', '?')}")
    print(f"VERSION: {meta.get('version', '?')}")
    print(f"UPDATED: {meta.get('updated_at', meta.get('created_at', '?'))}")
    print(f"TOTAL:   {len(todos)} todos")
    print()
    print(f"{'ID':<20} {'STATUS':<14} {'GROUP':<22} {'TYPE'}")
    print("-" * 92)
    for t in todos:
        print(
            f"{t.get('id', '?'):<20} "
            f"{t.get('status', '?'):<14} "
            f"{t.get('group', '?'):<22} "
            f"{t.get('type', '?')}"
        )
    print()
    counts = recount_status_summary(todos)
    print("Summary by status:")
    for s in VALID_STATUSES:
        print(f"  {s:<14} {counts.get(s, 0)}")
    print()


def update_todo(data, todo_id, new_status, commit_hash=None, completed_at=None):
    todos = data.get("todos", [])
    target = None
    for t in todos:
        if t.get("id") == todo_id:
            target = t
            break

    if target is None:
        available = [t.get("id", "?") for t in todos]
        raise ValueError(
            f"Todo ID '{todo_id}' khong ton tai. Available:\n  - "
            + "\n  - ".join(available)
        )

    if new_status not in VALID_STATUSES:
        raise ValueError(
            f"Status '{new_status}' khong hop le. Valid: {VALID_STATUSES}"
        )

    old_status = target.get("status", "pending")
    target["status"] = new_status

    if new_status == "done":
        target["completed_at"] = completed_at or datetime.now(VN_TZ).isoformat(
            timespec="seconds"
        )
        if commit_hash:
            target["evidence_commit"] = commit_hash
    else:
        if old_status == "done":
            target["completed_at"] = None
            target["evidence_commit"] = None

    summary = data.setdefault("summary", {})
    summary["by_status"] = recount_status_summary(todos)

    meta = data.setdefault("meta", {})
    now_iso = datetime.now(VN_TZ).isoformat(timespec="seconds")
    meta["updated_at"] = now_iso
    entry = f"{now_iso} update {todo_id} status {old_status} -> {new_status}"
    if commit_hash:
        entry += f" (commit {commit_hash})"
    meta.setdefault("changelog", []).append(entry)

    return target


def main():
    parser = argparse.ArgumentParser(
        description="Update P0 todo status trong file Bang todo tracker (.na JSON).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--file", required=True, help="Duong dan toi file todo .na")
    parser.add_argument(
        "--list", action="store_true", help="List tat ca todos voi current status"
    )
    parser.add_argument("--todo-id", help="Todo ID can update (vi du P0-HEYNA-G5)")
    parser.add_argument(
        "--status",
        choices=VALID_STATUSES,
        help="Status moi",
    )
    parser.add_argument(
        "--commit", help="Commit hash lam evidence (khi --status=done)"
    )
    parser.add_argument(
        "--completed-at",
        help="ISO timestamp hoan thanh (default: now UTC+7)",
    )

    args = parser.parse_args()

    file_path = Path(args.file)
    if not file_path.exists():
        print(f"error: File khong ton tai: {file_path}", file=sys.stderr)
        sys.exit(2)

    try:
        data = load_todo_file(file_path)
    except json.JSONDecodeError as e:
        print(f"error: JSON khong parse duoc - {e}", file=sys.stderr)
        sys.exit(2)

    if args.list:
        list_todos(data)
        return

    if not args.todo_id or not args.status:
        print(
            "error: Can --todo-id va --status (hoac dung --list de xem).",
            file=sys.stderr,
        )
        sys.exit(2)

    try:
        updated = update_todo(
            data,
            todo_id=args.todo_id,
            new_status=args.status,
            commit_hash=args.commit,
            completed_at=args.completed_at,
        )
    except ValueError as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(3)

    save_todo_file_atomic(file_path, data)

    print(f"OK: {args.todo_id} -> status '{args.status}'")
    if updated.get("completed_at"):
        print(f"    completed_at:    {updated['completed_at']}")
    if updated.get("evidence_commit"):
        print(f"    evidence_commit: {updated['evidence_commit']}")
    print(f"    file:            {file_path}")


if __name__ == "__main__":
    main()
