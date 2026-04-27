#!/usr/bin/env python3
"""
bang_scan_hethong.py — 1 lenh quet tong the natt-os

Scope: REPO state + RUNTIME state + DNS/domain public
Output: stdout only (paste ve cho Bang)

Author: Bang · Session 20260424
"""

import subprocess
import socket
import sys
from pathlib import Path
from datetime import datetime


def run(cmd, timeout=5):
    """Run shell cmd, return (rc, stdout, stderr). Never raises."""
    try:
        r = subprocess.run(
            cmd, capture_output=True, text=True,
            timeout=timeout, shell=True,
        )
        return r.returncode, r.stdout, r.stderr
    except Exception as e:
        return -1, "", str(e)


def hdr(title):
    print(f"\n{'═' * 72}")
    print(f"  {title}")
    print('═' * 72)


def sec(title):
    print(f"\n── {title}")


# ═══════════════════════════════════════════════════════════════════
#  HEADER
# ═══════════════════════════════════════════════════════════════════
repo = Path.cwd()
now = datetime.now().astimezone().isoformat(timespec="seconds")
print(f"╔{'═' * 70}╗")
print(f"║  BANG SCAN HE THONG                                                  ║")
print(f"║  Time: {now:<62}║")
print(f"║  Repo: {str(repo)[:62]:<62}║")
print(f"╚{'═' * 70}╝")


# ═══════════════════════════════════════════════════════════════════
#  1. REPO STATE
# ═══════════════════════════════════════════════════════════════════
hdr("1. REPO STATE")

sec("Git branch + HEAD")
_, branch, _ = run("git branch --show-current")
_, head, _ = run("git log -1 --format='%h · %s · %cr'")
_, status_sb, _ = run("git status -sb")
print(f"Branch: {branch.strip()}")
print(f"HEAD:   {head.strip()}")
status_first = (status_sb.strip().split('\n') or [''])[0]
print(f"Sync:   {status_first}")

sec("Uncommitted changes")
_, st, _ = run("git status --short")
lines = [l for l in st.strip().split('\n') if l.strip()]
print(f"Dirty files: {len(lines)}")
for l in lines[:10]:
    print(f"  {l}")
if len(lines) > 10:
    print(f"  ... +{len(lines) - 10} more")

sec("Recent commits (10)")
_, log, _ = run("git log --oneline -10")
print(log.strip())

sec("Commit velocity (last 24h / 7d)")
_, c24, _ = run("git log --since='24 hours ago' --oneline | wc -l")
_, c7d, _ = run("git log --since='7 days ago' --oneline | wc -l")
_, ctot, _ = run("git rev-list --count HEAD")
print(f"  24h: {c24.strip()}  ·  7d: {c7d.strip()}  ·  total: {ctot.strip()}")

sec("File count by extension (top 15)")
exts, size_total, file_total = {}, 0, 0
skip_parts = {".git", "node_modules", "dist", ".next", "coverage", ".cache", ".turbo"}
for p in repo.rglob("*"):
    if not p.is_file():
        continue
    if any(part in skip_parts for part in p.parts):
        continue
    ext = p.suffix.lower() or "(none)"
    exts[ext] = exts.get(ext, 0) + 1
    file_total += 1
    try:
        size_total += p.stat().st_size
    except Exception:
        pass
for ext, n in sorted(exts.items(), key=lambda x: -x[1])[:15]:
    print(f"  {ext:<14} {n}")
print(f"  ─────────────────")
print(f"  TOTAL FILES    {file_total}")
print(f"  TOTAL SIZE     {size_total / 1024 / 1024:.1f} MB")

sec("Cells inventory (src/cells/)")
cells_root = repo / "src" / "cells"
if cells_root.exists():
    for zone in ["business", "kernel", "infrastructure"]:
        zone_path = cells_root / zone
        if zone_path.exists():
            cells = [p.name for p in zone_path.iterdir() if p.is_dir() and p.name.endswith("-cell")]
            print(f"  {zone:<15} {len(cells):>3}  {', '.join(sorted(cells)[:6])}{'...' if len(cells) > 6 else ''}")
        else:
            print(f"  {zone:<15}   0  (folder missing)")
else:
    print("  src/cells/ KHONG TON TAI")

sec("Governance memory (src/governance/memory/)")
gov = repo / "src" / "governance" / "memory"
if gov.exists():
    personas = sorted([p.name for p in gov.iterdir() if p.is_dir()])
    print(f"  Personas: {', '.join(personas)}")
else:
    print("  folder missing")

sec("Todo tracker (docs/runtime/todo/)")
todo_dir = repo / "docs" / "runtime" / "todo"
if todo_dir.exists():
    todos = sorted(todo_dir.glob("*.na"))
    for t in todos:
        print(f"  {t.name}  ({t.stat().st_size} bytes)")
else:
    print("  folder missing")


# ═══════════════════════════════════════════════════════════════════
#  2. RUNTIME STATE
# ═══════════════════════════════════════════════════════════════════
hdr("2. RUNTIME STATE")

sec("Node/sira processes")
_, ps_out, _ = run("ps -eo pid,etime,command | grep -E 'node|sira' | grep -v grep")
ps_lines = [l for l in ps_out.strip().split('\n') if l.strip()]
print(f"Count: {len(ps_lines)}")
for l in ps_lines[:8]:
    parts = l.split(None, 2)
    if len(parts) >= 3:
        pid, etime, cmd = parts[0], parts[1], parts[2][:95]
        print(f"  PID {pid:<7} up={etime:<10} {cmd}")
if len(ps_lines) > 8:
    print(f"  ... +{len(ps_lines) - 8} more")

sec("Ports listening (80, 443, 3000, 3002, 8080)")
for port in [80, 443, 3000, 3002, 8080]:
    _, out, _ = run(f"lsof -nP -iTCP:{port} -sTCP:LISTEN 2>/dev/null", timeout=3)
    lines = [l for l in out.strip().split('\n') if l.strip()][1:]  # skip header
    if lines:
        procs = set()
        for l in lines[:5]:
            parts = l.split()
            if len(parts) >= 2:
                procs.add(f"{parts[0]}({parts[1]})")
        print(f"  :{port:<5} LISTEN  {', '.join(sorted(procs))}")
    else:
        print(f"  :{port:<5} -")

sec("PID files (logs/*.pid)")
logs = repo / "logs"
if logs.exists():
    pids = sorted(logs.glob("*.pid"))
    if not pids:
        print("  (no pid files)")
    for pf in pids:
        try:
            pid = pf.read_text().strip()
            _, alive, _ = run(f"ps -p {pid} -o pid= 2>/dev/null", timeout=2)
            verdict = "ALIVE" if pid and pid in alive else "DEAD"
            print(f"  {pf.name:<38} PID={pid:<8} {verdict}")
        except Exception as e:
            print(f"  {pf.name:<38} error: {e}")
else:
    print("  logs/ khong ton tai")

sec("Health endpoints")
endpoints = [
    ("http://core.sira/api/health", "core.sira gateway"),
    ("http://localhost/api/health", "localhost:80"),
    ("http://localhost:3000/api/health", "localhost:3000"),
    ("http://localhost:3002/api/health", "localhost:3002"),
]
for url, label in endpoints:
    rc, out, _ = run(f"curl -sS --max-time 2 -o /dev/null -w '%{{http_code}}' {url}", timeout=4)
    body_rc, body, _ = run(f"curl -sS --max-time 2 {url}", timeout=4)
    code = out.strip() if out.strip() else "---"
    body_short = (body.strip()[:120].replace('\n', ' ')) if body.strip() else ""
    print(f"  [{code}] {label:<28} {body_short}")


# ═══════════════════════════════════════════════════════════════════
#  3. DNS & DOMAIN PUBLIC
# ═══════════════════════════════════════════════════════════════════
hdr("3. DNS & DOMAIN PUBLIC")

sec("/etc/hosts entries (filter: sira/natt/anc/tam/heyna/core)")
try:
    hosts_text = Path("/etc/hosts").read_text()
    keywords = ["sira", "natt", "anc", "tam", "heyna", "core", "luxury", "nauion"]
    found = []
    for line in hosts_text.split("\n"):
        l = line.strip()
        if not l or l.startswith("#"):
            continue
        if any(kw in l.lower() for kw in keywords):
            found.append(l)
    if found:
        for f in found:
            print(f"  {f}")
    else:
        print("  (khong co entry nao match)")
except Exception as e:
    print(f"  cannot read /etc/hosts: {e}")

sec("Local DNS resolve (key domains)")
local_domains = ["core.sira", "natt.sira", "luxury.sira", "heyna.sira", "anc.sira"]
for d in local_domains:
    try:
        ip = socket.gethostbyname(d)
        print(f"  {d:<20} → {ip}")
    except socket.gaierror:
        print(f"  {d:<20} NOT RESOLVED")

sec("Git remotes")
_, remotes, _ = run("git remote -v")
print(remotes.strip() or "  (no remotes)")

sec("Public DNS lookup (scan known Tam Luxury / NattOS domain candidates)")
public_candidates = [
    "tamluxury.vn", "tamluxury.com", "tamluxury.com.vn",
    "natt-os.com", "natt-os.vn", "nattos.com", "nattos.vn",
    "nattsira.com", "nattsira.vn", "nauion.com", "nauion.vn",
]
for d in public_candidates:
    rc, out, _ = run(f"dig +short +time=2 +tries=1 {d} 2>/dev/null", timeout=4)
    out = out.strip()
    if out:
        first = out.split('\n')[0]
        print(f"  {d:<22} → {first}")
    # silent if empty to reduce noise; comment next line to show all
    # else: print(f"  {d:<22} (no record)")

sec("TLS certs trong repo (.pem, .crt, .key)")
for pat in ["*.pem", "*.crt", "*.key"]:
    for p in repo.rglob(pat):
        if any(part in skip_parts for part in p.parts):
            continue
        try:
            size = p.stat().st_size
            print(f"  {p.relative_to(repo)}  ({size} bytes)")
        except Exception:
            pass

sec("Gateway config files (search 'domain|hostname|listen')")
for pat in ["*.sira", "*.mjs", "*.js", "*.ts"]:
    for p in (repo / "tools").rglob(pat) if (repo / "tools").exists() else []:
        try:
            text = p.read_text(errors="ignore")
            if any(kw in text for kw in ["core.sira", "natt_domain_gateway", "listen(80", "listen(443"]):
                print(f"  {p.relative_to(repo)}")
                break  # one hit per file is enough
        except Exception:
            pass


print()
print("═" * 72)
print("  END BANG SCAN — paste stdout ve cho Bang")
print("═" * 72)
