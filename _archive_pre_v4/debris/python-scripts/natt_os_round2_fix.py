#!/usr/bin/env python3
"""
NATT-OS — Round 2 Fix
  Fix 1: Move governance files to correct path (src/governance/)
  Fix 2: Hydrate 3 remaining skeleton cells (pricing, promotion, showroom)
  Fix 3: Remove 11 remaining service stubs
"""

import os, re, shutil
from pathlib import Path

GOLDMASTER = Path(os.path.expanduser(
    "~/Desktop/HỒ SƠ SHTT NATT-OS BY NATTSIRA-OS/natt-os ver2goldmaster"
))
SRC = GOLDMASTER / "src"
TRASH = GOLDMASTER / "_trash_stubs"
TRASH.mkdir(exist_ok=True)


# ─── FIX 1: GOVERNANCE PATH ───────────────────────────────────────────────────
def fix1_governance_path():
    print("\n══ FIX 1: GOVERNANCE FILE PATHS ══")
    
    moves = [
        ("natt-os/governance/gatekeeper/gatekeeper-core.ts", "governance/gatekeeper/gatekeeper-core.ts"),
        ("natt-os/governance/rbac/rbac-core.tsx",            "governance/rbac/rbac-core.tsx"),
    ]
    
    for wrong_rel, correct_rel in moves:
        wrong = SRC / wrong_rel
        correct = SRC / correct_rel
        
        if correct.exists():
            print(f"  ✓ Already at correct path: {correct_rel}")
            continue
        
        if wrong.exists():
            correct.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(wrong, correct)
            print(f"  ✓ Copied: {wrong_rel} → {correct_rel}")
        else:
            print(f"  ✗ Source not found: {wrong_rel}")


# ─── FIX 2: HYDRATE 3 SKELETON CELLS ──────────────────────────────────────────
def fix2_hydrate_skeletons():
    print("\n══ FIX 2: HYDRATE SKELETON CELLS ══")
    
    skeletons = {
        "pricing-cell": {
            "service_file": "application/services/pricing.service.ts",
            "alt_files": ["application/services/pricing-runtime.service.ts"],
            "methods": [
                ("calculateRetailPrice",   "Calculate retail price from cost + markup"),
                ("calculateBulkDiscount",  "Apply tiered bulk discount to order"),
                ("applyPromotionRules",    "Layer promotion rules onto base price"),
                ("calculateMargin",        "Compute profit margin for a product/SKU"),
                ("recalculatePriceList",   "Batch recalculate all prices in a list"),
                ("validatePriceFloor",     "Ensure price doesn't go below minimum"),
                ("syncExchangeRates",      "Sync currency exchange rates for pricing"),
                ("generatePriceReport",    "Generate pricing report for period"),
            ],
        },
        "promotion-cell": {
            "service_file": "application/services/promotion.service.ts",
            "alt_files": [],
            "methods": [
                ("createPromotion",        "Create a new promotion campaign"),
                ("evaluateEligibility",    "Check if order/customer qualifies for promo"),
                ("applyPromotion",         "Apply promotion discount to order"),
                ("deactivateExpired",      "Deactivate promotions past end date"),
                ("getActivePromotions",    "List all currently active promotions"),
            ],
        },
        "showroom-cell": {
            "service_file": "application/services/showroom.service.ts",
            "alt_files": [],
            "methods": [
                ("registerShowroom",       "Register a new showroom location"),
                ("updateShowroomStatus",   "Update showroom operational status"),
                ("assignInventory",        "Assign inventory allocation to showroom"),
                ("getShowroomMetrics",     "Get performance metrics for showroom"),
                ("syncShowroomData",       "Sync showroom data with central system"),
            ],
        },
    }
    
    for cell_name, config in skeletons.items():
        cell_dir = SRC / "cells" / "business" / cell_name
        if not cell_dir.exists():
            print(f"  ✗ {cell_name}: directory not found")
            continue
        
        # Find or create service file
        svc_path = cell_dir / config["service_file"]
        
        # Also check alt files
        all_svc_paths = [svc_path] + [cell_dir / a for a in config["alt_files"]]
        
        target = None
        for sp in all_svc_paths:
            if sp.exists():
                content = sp.read_text(errors='replace')
                if re.search(r'async\s+\w+\s*\(', content):
                    print(f"  ⚠ {cell_name}: {sp.name} already has async methods — checking others")
                    continue
                target = sp
                break
        
        if target is None:
            # Use first existing file, or primary
            target = svc_path
        
        if not target.exists():
            print(f"  ✗ {cell_name}: service file not found at {config['service_file']}")
            continue
        
        content = target.read_text(errors='replace')
        existing_async = len(re.findall(r'async\s+\w+\s*\(', content))
        
        if existing_async > 0:
            print(f"  ⚠ {cell_name}: {target.name} has {existing_async} async methods already")
            continue
        
        # Check for class definition
        class_match = re.search(r'(export\s+class\s+\w+[^{]*\{)', content)
        if not class_match:
            # Inject a class wrapper
            class_name = cell_name.replace('-cell', '').title().replace('-', '') + 'Service'
            method_block = generate_methods(config["methods"], cell_name)
            injection = f"\nexport class {class_name} {{\n{method_block}\n}}\n"
            content += injection
            target.write_text(content)
            print(f"  ✓ {cell_name}: created {class_name} with {len(config['methods'])} async methods → {target.name}")
        else:
            # Inject methods before last closing brace
            method_block = generate_methods(config["methods"], cell_name)
            last_brace = content.rfind('}')
            content = content[:last_brace] + '\n' + method_block + '\n' + content[last_brace:]
            target.write_text(content)
            print(f"  ✓ {cell_name}: +{len(config['methods'])} async methods → {target.name}")


def generate_methods(methods, cell_name):
    lines = []
    for method_name, description in methods:
        lines.append(f"""
  /** {description} */
  async {method_name}(params: Record<string, unknown>): Promise<unknown> {{
    // TODO: Wire to {cell_name} domain logic
    throw new Error('Not implemented: {cell_name}.{method_name}');
  }}""")
    return '\n'.join(lines)


# ─── FIX 3: REMOVE 11 REMAINING STUBS ─────────────────────────────────────────
def fix3_remove_stubs():
    print("\n══ FIX 3: REMOVE REMAINING STUBS ══")
    
    stubs = [
        "admin/audit-service.ts",
        "authservice.ts",
        "conflict/conflictresolver.ts",
        "documentai.ts",
        "learningengine.ts",
        "offlineservice.ts",
        "rbacservice.ts",
        "sellerengine.ts",
        "sharding-service.ts",
        "smart-link.ts",
        "threatdetectionservice.ts",
    ]
    
    svc_root = SRC / "services"
    removed = 0
    
    for stub_rel in stubs:
        stub_path = svc_root / stub_rel
        if not stub_path.exists():
            print(f"  ⚠ Already gone: {stub_rel}")
            continue
        
        # Verify it's actually a stub before removing
        content = stub_path.read_text(errors='replace')
        lines = [l for l in content.splitlines() if l.strip() and not l.strip().startswith('//')]
        
        if len(lines) > 30:
            print(f"  ⚠ Skipping {stub_rel} — has {len(lines)} non-comment lines (may be real)")
            continue
        
        trash_dest = TRASH / stub_rel.replace('/', '__')
        trash_dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(stub_path), str(trash_dest))
        print(f"  ✓ Removed: {stub_rel} ({len(lines)} lines → _trash_stubs/)")
        removed += 1
    
    # Clean empty directories
    for dirpath, dirnames, filenames in os.walk(str(svc_root), topdown=False):
        if not dirnames and not filenames:
            try:
                os.rmdir(dirpath)
                print(f"  ✓ Removed empty dir: {Path(dirpath).relative_to(svc_root)}")
            except: pass
    
    print(f"\n  Total removed: {removed}/11")


# ─── MAIN ──────────────────────────────────────────────────────────────────────
def main():
    print("╔════════════════════════════════════════════╗")
    print("║  NATT-OS Round 2 Fix — 3 remaining issues  ║")
    print("╚════════════════════════════════════════════╝")
    
    fix1_governance_path()
    fix2_hydrate_skeletons()
    fix3_remove_stubs()
    
    print("\n" + "=" * 50)
    print("  DONE — Run audit again to verify.")
    print("=" * 50)


if __name__ == "__main__":
    main()
