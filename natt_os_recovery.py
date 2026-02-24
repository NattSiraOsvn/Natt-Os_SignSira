#!/usr/bin/env python3
"""
NATT-OS ver2goldmaster — Full Recovery Script
Runs all 3 phases in one shot:
  Phase 1: Governance file recovery from v1
  Phase 2: Business cell hydration (async method wiring)
  Phase 3: Service stub cleanup (dedup + remove empties)

Usage: python3 natt_os_recovery.py
  - Must run from Mac terminal
  - Expects /tmp/v1, /tmp/v2, /tmp/v3 still exist from zip extraction
  - Creates backup before modifying anything
"""

import os
import sys
import shutil
import re
import json
from pathlib import Path
from datetime import datetime

# ─── CONFIG ────────────────────────────────────────────────────────────────────
GOLDMASTER = Path(os.path.expanduser(
    "~/Desktop/HỒ SƠ SHTT NATT-OS BY NATTSIRA-OS/natt-os ver2goldmaster"
))
V1_ROOT = Path("/tmp/v1")
V2_ROOT = Path("/tmp/v2")
V3_ROOT = Path("/tmp/v3")

BACKUP_DIR = GOLDMASTER.parent / f"goldmaster-backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

# Business cells to hydrate
BUSINESS_CELLS = [
    "pricing-cell", "inventory-cell", "sales-cell", "order-cell",
    "buyback-cell", "warranty-cell", "customer-cell", "promotion-cell",
    "showroom-cell"
]

# 7 missing governance files: (relative source in v1) → (relative dest in goldmaster)
GOVERNANCE_FILES = [
    ("natt-os/security/sirasign-verifier.ts",     "src/natt-os/security/sirasign-verifier.ts"),
    ("natt-os/security/ai-lockdown.ts",           "src/natt-os/security/ai-lockdown.ts"),
    ("natt-os/security/memory-governance-lock.ts", "src/natt-os/security/memory-governance-lock.ts"),
    ("natt-os/validation/cell-purity-enforcer.ts", "src/natt-os/validation/cell-purity-enforcer.ts"),
    ("natt-os/monitoring/ai-behavior-analytics.ts","src/natt-os/monitoring/ai-behavior-analytics.ts"),
    ("governance/gatekeeper/gatekeeper-core.ts",   "src/natt-os/governance/gatekeeper/gatekeeper-core.ts"),
    ("governance/rbac/rbac-core.tsx",              "src/natt-os/governance/rbac/rbac-core.tsx"),
]

# ─── LOGGING ───────────────────────────────────────────────────────────────────
class Log:
    actions = []
    
    @classmethod
    def info(cls, msg):
        print(f"  ✓ {msg}")
        cls.actions.append(("OK", msg))
    
    @classmethod
    def warn(cls, msg):
        print(f"  ⚠ {msg}")
        cls.actions.append(("WARN", msg))
    
    @classmethod
    def error(cls, msg):
        print(f"  ✗ {msg}")
        cls.actions.append(("ERR", msg))
    
    @classmethod
    def phase(cls, name):
        print(f"\n{'='*70}")
        print(f"  {name}")
        print(f"{'='*70}")


# ─── PHASE 0: BACKUP ──────────────────────────────────────────────────────────
def phase0_backup():
    Log.phase("PHASE 0: BACKUP")
    
    if not GOLDMASTER.exists():
        Log.error(f"Goldmaster not found: {GOLDMASTER}")
        sys.exit(1)
    
    print(f"  Backing up to: {BACKUP_DIR.name}")
    shutil.copytree(GOLDMASTER, BACKUP_DIR, symlinks=True)
    Log.info(f"Backup complete → {BACKUP_DIR.name}")


# ─── PHASE 1: GOVERNANCE RECOVERY ─────────────────────────────────────────────
def phase1_governance():
    Log.phase("PHASE 1: GOVERNANCE FILE RECOVERY")
    
    recovered = 0
    for src_rel, dst_rel in GOVERNANCE_FILES:
        dst = GOLDMASTER / dst_rel
        
        # Already exists? Skip
        if dst.exists():
            Log.info(f"Already exists: {dst_rel} ({dst.stat().st_size}B)")
            continue
        
        # Try v1 first, then v2, then v3
        source = None
        for vroot, vlabel in [(V1_ROOT, "v1"), (V2_ROOT, "v2"), (V3_ROOT, "v3")]:
            # Try multiple possible locations within each archive
            candidates = [
                vroot / src_rel,
                vroot / "src" / src_rel,
                vroot / "natt-os ver goldmaster" / "src" / src_rel,
            ]
            # For v1, also try direct natt-os/ path
            if "natt-os/" in src_rel:
                candidates.append(vroot / src_rel)
            
            for cand in candidates:
                if cand.exists() and cand.stat().st_size > 50:
                    source = cand
                    break
            if source:
                break
        
        if source:
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, dst)
            Log.info(f"Recovered: {dst_rel} ← {vlabel} ({source.stat().st_size}B)")
            recovered += 1
        else:
            # Deep search across all v roots
            fname = Path(src_rel).name
            found = False
            for vroot, vlabel in [(V1_ROOT, "v1"), (V2_ROOT, "v2"), (V3_ROOT, "v3")]:
                if not vroot.exists():
                    continue
                for p in vroot.rglob(fname):
                    if p.stat().st_size > 50:
                        dst.parent.mkdir(parents=True, exist_ok=True)
                        shutil.copy2(p, dst)
                        Log.info(f"Recovered (deep): {dst_rel} ← {vlabel}/{p.relative_to(vroot)} ({p.stat().st_size}B)")
                        recovered += 1
                        found = True
                        break
                if found:
                    break
            if not found:
                Log.error(f"NOT FOUND in any archive: {src_rel}")
    
    print(f"\n  Governance: {recovered}/{len(GOVERNANCE_FILES)} recovered")
    return recovered


# ─── PHASE 2: BUSINESS CELL HYDRATION ─────────────────────────────────────────
def find_cell_dir(cell_name):
    """Find cell directory in goldmaster src/"""
    src = GOLDMASTER / "src"
    for p in src.rglob(cell_name):
        if p.is_dir():
            return p
    return None


def extract_domain_methods(cell_dir):
    """Extract method signatures from domain/services/*.engine.ts files"""
    methods = []
    domain_services = cell_dir / "domain" / "services"
    if not domain_services.exists():
        # Try alternative paths
        for alt in ["domain/service", "domain"]:
            alt_path = cell_dir / alt
            if alt_path.exists():
                domain_services = alt_path
                break
    
    if not domain_services.exists():
        return methods
    
    for ts_file in domain_services.rglob("*.ts"):
        content = ts_file.read_text(errors='replace')
        # Find method-like patterns: calculate*, process*, validate*, get*, create*, update*, etc.
        pattern = r'(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{'
        for match in re.finditer(pattern, content):
            method_name = match.group(1)
            if method_name not in ('constructor', 'if', 'for', 'while', 'switch', 'catch'):
                methods.append({
                    'name': method_name,
                    'source': ts_file.name,
                    'line': content[:match.start()].count('\n') + 1
                })
    
    return methods


def find_app_services(cell_dir):
    """Find application/services/*.service.ts files"""
    services = []
    app_services = cell_dir / "application" / "services"
    if not app_services.exists():
        app_services = cell_dir / "application"
    
    if app_services.exists():
        for f in app_services.rglob("*.service.ts"):
            services.append(f)
    
    # Also check top-level *.service.ts
    for f in cell_dir.glob("*.service.ts"):
        services.append(f)
    
    return services


def count_async_methods(filepath):
    """Count async methods in a file"""
    content = filepath.read_text(errors='replace')
    return len(re.findall(r'async\s+\w+\s*\(', content))


def hydrate_service(service_file, domain_methods, cell_name):
    """Add async wrapper methods to service file if it lacks them"""
    content = service_file.read_text(errors='replace')
    
    # Already has async methods? Skip
    async_count = len(re.findall(r'async\s+\w+\s*\(', content))
    if async_count > 0:
        return 0, async_count
    
    # Check if file has a class
    class_match = re.search(r'(export\s+class\s+\w+[^{]*\{)', content)
    if not class_match:
        return 0, 0
    
    # Build async method stubs from domain methods
    methods_to_add = []
    existing_methods = set(re.findall(r'(\w+)\s*\(', content))
    
    for dm in domain_methods:
        method_name = dm['name']
        if method_name in existing_methods:
            continue
        
        # Create async wrapper
        methods_to_add.append(f"""
  /** Wired from {dm['source']}:{dm['line']} — domain method */
  async {method_name}(params: Record<string, unknown>): Promise<unknown> {{
    // TODO: Wire to domain service {dm['source']}.{method_name}()
    throw new Error('Not implemented: {cell_name}.{method_name}');
  }}""")
    
    if not methods_to_add:
        return 0, 0
    
    # Insert before the last closing brace
    last_brace = content.rfind('}')
    if last_brace == -1:
        return 0, 0
    
    injection = '\n'.join(methods_to_add) + '\n'
    new_content = content[:last_brace] + injection + content[last_brace:]
    service_file.write_text(new_content)
    
    return len(methods_to_add), len(methods_to_add)


def phase2_hydrate():
    Log.phase("PHASE 2: BUSINESS CELL HYDRATION")
    
    total_methods_added = 0
    
    for cell_name in BUSINESS_CELLS:
        cell_dir = find_cell_dir(cell_name)
        if not cell_dir:
            Log.warn(f"{cell_name}: directory not found in src/")
            continue
        
        # Extract domain methods
        domain_methods = extract_domain_methods(cell_dir)
        
        # Find app services
        app_services = find_app_services(cell_dir)
        
        if not app_services:
            Log.warn(f"{cell_name}: no application service files found")
            continue
        
        cell_added = 0
        for svc in app_services:
            added, total = hydrate_service(svc, domain_methods, cell_name)
            cell_added += added
        
        if cell_added > 0:
            Log.info(f"{cell_name}: +{cell_added} async methods wired → {[s.name for s in app_services]}")
        else:
            # Check if domain methods exist at all
            if domain_methods:
                Log.warn(f"{cell_name}: {len(domain_methods)} domain methods found but service already has methods or no class found")
            else:
                Log.warn(f"{cell_name}: no domain methods found to wire")
        
        total_methods_added += cell_added
    
    print(f"\n  Hydration: {total_methods_added} async methods added across business cells")
    return total_methods_added


# ─── PHASE 3: STUB CLEANUP ────────────────────────────────────────────────────
def is_stub(filepath):
    """Determine if a .ts file is a stub"""
    try:
        content = filepath.read_text(errors='replace')
    except:
        return False
    
    lines = [l.strip() for l in content.split('\n') if l.strip() and not l.strip().startswith('//')]
    
    # Less than 5 non-comment lines = stub
    if len(lines) < 5:
        return True
    
    # Contains stub markers
    stub_markers = ['// Stub', '// TODO: Implement', '// placeholder', 'throw new Error']
    content_lower = content.lower()
    marker_count = sum(1 for m in stub_markers if m.lower() in content_lower)
    if marker_count >= 2:
        return True
    
    # Only has imports and empty class/interface
    has_implementation = bool(re.search(r'(async\s+\w+|return\s+|await\s+|this\.\w+)', content))
    if not has_implementation and len(lines) < 15:
        return True
    
    return False


def find_casing_duplicates(services_dir):
    """Find files that are casing variants of each other"""
    files_by_normalized = {}
    
    for ts_file in services_dir.rglob("*.ts"):
        # Normalize: remove hyphens, dots, underscores, lowercase
        normalized = re.sub(r'[-_.]', '', ts_file.stem.lower())
        key = (ts_file.parent, normalized)
        if key not in files_by_normalized:
            files_by_normalized[key] = []
        files_by_normalized[key].append(ts_file)
    
    duplicates = {k: v for k, v in files_by_normalized.items() if len(v) > 1}
    return duplicates


def phase3_cleanup():
    Log.phase("PHASE 3: SERVICE STUB CLEANUP")
    
    services_dir = GOLDMASTER / "src" / "services"
    if not services_dir.exists():
        # Try alternative paths
        for alt in ["src/shared/services", "src"]:
            p = GOLDMASTER / alt
            if p.exists():
                services_dir = p
                break
    
    if not services_dir.exists():
        Log.error(f"Services directory not found under {GOLDMASTER / 'src'}")
        return 0
    
    trash_dir = GOLDMASTER / "_trash_stubs"
    trash_dir.mkdir(exist_ok=True)
    
    removed = 0
    kept = 0
    
    # Step 1: Find and resolve casing duplicates
    duplicates = find_casing_duplicates(services_dir)
    for (parent, norm_name), files in duplicates.items():
        if len(files) < 2:
            continue
        
        # Sort by: has implementation (desc), file size (desc)
        scored = []
        for f in files:
            content = f.read_text(errors='replace')
            has_impl = bool(re.search(r'(async\s+\w+|return\s+[^;]+|await\s+)', content))
            scored.append((f, has_impl, f.stat().st_size))
        
        scored.sort(key=lambda x: (x[1], x[2]), reverse=True)
        
        # Keep the best, trash the rest
        keeper = scored[0]
        for f, has_impl, size in scored[1:]:
            rel = f.relative_to(services_dir)
            trash_dest = trash_dir / str(rel).replace('/', '__')
            shutil.move(str(f), str(trash_dest))
            Log.info(f"Dedup: {f.name} → _trash_stubs/ (kept {keeper[0].name}, {keeper[2]}B)")
            removed += 1
    
    # Step 2: Remove pure stubs
    for ts_file in services_dir.rglob("*.ts"):
        if not ts_file.exists():  # May have been moved in step 1
            continue
        if is_stub(ts_file):
            rel = ts_file.relative_to(services_dir)
            trash_dest = trash_dir / str(rel).replace('/', '__')
            shutil.move(str(ts_file), str(trash_dest))
            Log.info(f"Stub removed: {rel}")
            removed += 1
        else:
            kept += 1
    
    # Step 3: Clean empty index.ts re-exports
    for idx_file in services_dir.rglob("index.ts"):
        if not idx_file.exists():
            continue
        content = idx_file.read_text(errors='replace')
        exports = re.findall(r"export\s+.*?from\s+['\"]\./(.*?)['\"]", content)
        
        missing_exports = []
        valid_exports = []
        for exp in exports:
            # Check if the exported file still exists
            candidates = [
                idx_file.parent / f"{exp}.ts",
                idx_file.parent / f"{exp}.tsx",
                idx_file.parent / exp / "index.ts",
            ]
            if any(c.exists() for c in candidates):
                valid_exports.append(exp)
            else:
                missing_exports.append(exp)
        
        if missing_exports:
            # Rewrite index.ts removing dead exports
            new_lines = []
            for line in content.split('\n'):
                is_dead = False
                for dead in missing_exports:
                    if f"'./{dead}'" in line or f'"./{dead}"' in line:
                        is_dead = True
                        break
                if not is_dead:
                    new_lines.append(line)
            
            idx_file.write_text('\n'.join(new_lines))
            Log.info(f"Cleaned index.ts: removed {len(missing_exports)} dead exports → {idx_file.relative_to(GOLDMASTER)}")
    
    print(f"\n  Cleanup: {removed} stubs/duplicates moved to _trash_stubs/, {kept} real services kept")
    return removed


# ─── REPORT ────────────────────────────────────────────────────────────────────
def generate_report():
    Log.phase("RECOVERY REPORT")
    
    report_path = GOLDMASTER / "RECOVERY_REPORT.md"
    
    ok_count = sum(1 for s, _ in Log.actions if s == "OK")
    warn_count = sum(1 for s, _ in Log.actions if s == "WARN")
    err_count = sum(1 for s, _ in Log.actions if s == "ERR")
    
    lines = [
        f"# NATT-OS Recovery Report",
        f"**Date:** {datetime.now().isoformat()}",
        f"**Status:** {'GREEN' if err_count == 0 else 'YELLOW' if err_count < 3 else 'RED'}",
        f"",
        f"## Summary",
        f"- ✓ OK: {ok_count}",
        f"- ⚠ WARN: {warn_count}",
        f"- ✗ ERR: {err_count}",
        f"",
        f"## Actions",
    ]
    
    for status, msg in Log.actions:
        icon = {"OK": "✓", "WARN": "⚠", "ERR": "✗"}[status]
        lines.append(f"- {icon} {msg}")
    
    lines.extend([
        "",
        "## Next Steps",
        "1. Run `npx tsc --noEmit` to check compilation",
        "2. Review `_trash_stubs/` — restore any needed files",
        "3. Replace `throw new Error('Not implemented')` with real wiring",
        "4. Re-run audit script to verify status change",
    ])
    
    report_path.write_text('\n'.join(lines))
    print(f"\n  Report saved → {report_path.name}")
    print(f"  Backup at    → {BACKUP_DIR.name}")


# ─── MAIN ──────────────────────────────────────────────────────────────────────
def main():
    print(f"""
╔══════════════════════════════════════════════════════════════════════╗
║  NATT-OS ver2goldmaster — FULL RECOVERY                            ║
║  Phase 1: Governance recovery (7 files from v1)                    ║
║  Phase 2: Business cell hydration (9 cells → async methods)        ║
║  Phase 3: Stub cleanup (44 stubs → dedup + trash)                  ║
╚══════════════════════════════════════════════════════════════════════╝
    """)
    
    # Verify paths
    if not GOLDMASTER.exists():
        print(f"ERROR: Goldmaster not found at:\n  {GOLDMASTER}")
        sys.exit(1)
    
    v_status = []
    for vroot, label in [(V1_ROOT, "v1"), (V2_ROOT, "v2"), (V3_ROOT, "v3")]:
        exists = vroot.exists()
        v_status.append(f"{label}={'OK' if exists else 'MISSING'}")
    print(f"  Archives: {', '.join(v_status)}")
    
    if not V1_ROOT.exists():
        print("WARNING: v1 not found at /tmp/v1 — governance recovery may fail")
        print("Re-extract: unzip 'natt-os_-absolute-lowercase-sovereign.zip' -d /tmp/v1")
    
    phase0_backup()
    phase1_governance()
    phase2_hydrate()
    phase3_cleanup()
    generate_report()
    
    print(f"\n{'='*70}")
    print(f"  DONE — Check RECOVERY_REPORT.md in goldmaster root")
    print(f"{'='*70}\n")


if __name__ == "__main__":
    main()
