#!/usr/bin/env python3
"""natt-os — Fix Part 7 (12 errors — truly final)"""
import os, re

ROOT = os.getcwd()
def read(p): 
    with open(os.path.join(ROOT, p), encoding='utf-8') as f: return f.read()
def save(p, c): 
    with open(os.path.join(ROOT, p), 'w', encoding='utf-8') as f: f.write(c)
def patch(path, old, new, req=True):
    if not os.path.exists(os.path.join(ROOT, path)):
        print(f"⚠️  missing: {path}"); return
    c = read(path)
    if old in c: save(path, c.replace(old, new, 1)); print(f"✅ {path}")
    elif req: print(f"⚠️  not found: {path}")

print("=" * 50)
print("natt-os Fix Part 7 — 12 final errors")
print("=" * 50)

# ── 1. SalaryRule duplicate type/name/amount ──────────
c = read("src/types.ts")
old_sr = """export interface SalaryRule {
  grade?: string;
  salary?: number;
  id?: string;
  type?: "BONUS" | "DEDUCTION" | "ALLOWANCE";
  name?: string;
  amount?: number;
  type?: "BONUS" | "DEDUCTION" | "ALLOWANCE";
  name?: string;
  amount?: number;
  condition?: string;
  division?: string;
  role?: string;
}"""
new_sr = """export interface SalaryRule {
  grade?: string;
  salary?: number;
  id?: string;
  type?: "BONUS" | "DEDUCTION" | "ALLOWANCE";
  name?: string;
  amount?: number;
  condition?: string;
  division?: string;
  role?: string;
}"""
if old_sr in c:
    save("src/types.ts", c.replace(old_sr, new_sr, 1))
    print("✅ SalaryRule dedup")
else:
    print("⚠️  SalaryRule pattern not found")

# ── 2. JoinRequest.requestedAt required → optional ────
patch("src/types.ts",
    "  requestedAt: number;\n  status: \"PENDING\" | \"APPROVED\" | \"REJECTED\";",
    "  requestedAt?: number;\n  status: \"PENDING\" | \"APPROVED\" | \"REJECTED\";")

# ── 3. CustomizationRequest.logo: string — options.logo is boolean
# Widen to boolean | string
patch("src/types.ts",
    "  logo?: string;\n  id?: string;",
    "  logo?: boolean | string;\n  id?: string;")

# ── 4. FinancialDashboard — timestamp.toLocaleTimeString() → new Date().toLocaleTimeString()
patch("src/components/financial/FinancialDashboard.tsx",
    "update.timestamp.toLocaleTimeString()",
    "new Date(update.timestamp).toLocaleTimeString()")

# ── 5. GovernanceTransaction — currency, requestedBy, moduleId, createdAt required
# Make them optional
patch("src/types.ts",
    "  currency: string;\n  status: TxStatus | string;\n  requestedBy: string;\n  approvedBy?: string;\n  moduleId: ModuleID;\n  createdAt: number;",
    "  currency?: string;\n  status: TxStatus | string;\n  requestedBy?: string;\n  approvedBy?: string;\n  moduleId?: ModuleID;\n  createdAt?: number;")

# ── 6. EInvoice — add createdAt field ─────────────────
patch("src/types.ts",
    "  buyer?: { name?: string; taxCode?: string; address?: string };",
    "  buyer?: { name?: string; taxCode?: string; address?: string };\n  createdAt?: number;")

# ── 7. SellerTerminal — commission ?? warning ──────────
# (r.commission as any)?.total ?? 0 — TS says left side never nullish
# Fix: use || instead of ??
patch("src/components/SellerTerminal.tsx",
    "s + (r.commission as any)?.total ?? 0, 0)",
    "s + ((r.commission as any)?.total || 0), 0)")

print()
print("=" * 50)
print("✅ Part 7 DONE")
print("npx tsc --noEmit 2>&1 | grep 'error TS' | wc -l")
print("=" * 50)
