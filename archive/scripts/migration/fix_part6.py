#!/usr/bin/env python3
"""natt-os — Fix Part 6 (Final batch)"""
import os

ROOT = os.getcwd()

def read(p): 
    with open(os.path.join(ROOT, p), encoding='utf-8') as f: return f.read()

def save(p, c): 
    with open(os.path.join(ROOT, p), 'w', encoding='utf-8') as f: f.write(c)

def patch(path, old, new, req=True):
    if not os.path.exists(os.path.join(ROOT, path)):
        print(f"⚠️  missing: {path}"); return
    c = read(path)
    if old in c:
        save(path, c.replace(old, new, 1)); print(f"✅ {path}")
    elif req:
        print(f"⚠️  not found: {path}")

print("=" * 55)
print("natt-os Fix Part 6 — Final batch")
print("=" * 55)

# ── 1. JoinRequest — add timestamp ─────────────────────
patch("src/types.ts",
    "  status: \"PENDING\" | \"APPROVED\" | \"REJECTED\";\n  userPosition?: any;\n}",
    "  status: \"PENDING\" | \"APPROVED\" | \"REJECTED\";\n  userPosition?: any;\n  timestamp?: number;\n}")

# ── 2. CustomizationRequest — dedup samples, add logo ──
c = read("src/types.ts")
# Remove the duplicate samples line added by part5
old_cust = """export interface CustomizationRequest {
  specifications?: Record<string, any>;
  samples?: boolean | any[];
  samples?: boolean | any[];"""
new_cust = """export interface CustomizationRequest {
  specifications?: Record<string, any>;
  samples?: boolean | any[];
  logo?: string;"""
if old_cust in c:
    save("src/types.ts", c.replace(old_cust, new_cust, 1))
    print("✅ CustomizationRequest dedup+logo")
else:
    # fallback: just add logo after samples
    patch("src/types.ts",
        "  samples?: boolean | any[];\n  id?: string;",
        "  samples?: boolean | any[];\n  logo?: string;\n  id?: string;")

# ── 3. MappingResult — extend in use-smart-mapping.ts ──
patch("src/hooks/use-smart-mapping.ts",
    """export interface MappingResult {
  entries: AccountingEntry[];
  confidence: number;
  warnings: string[];
  processedAt: number;
}""",
    """export interface MappingResult {
  id?: string;
  type?: string;
  entries: AccountingEntry[];
  confidence: number;
  warnings: string[];
  processedAt: number;
  data?: any;
  timestamp?: number;
}""")

# ── 4. GovernanceTransaction — add attachments ─────────
patch("src/types.ts",
    "  date?: string;\n  period?: string;\n  counterparty?: string;\n  description?: string;\n}\n\nexport interface OperationRecord {",
    "  date?: string;\n  period?: string;\n  counterparty?: string;\n  description?: string;\n  attachments?: Array<{ id: string; name: string; url: string }>;\n}\n\nexport interface OperationRecord {")

# ── 5. Product — add isVerifiedSupplier ────────────────
patch("src/types.ts",
    "  tags?: string[];\n  reviews?: number;\n  image?: string;",
    "  tags?: string[];\n  reviews?: number;\n  isVerifiedSupplier?: boolean;\n  image?: string;")

# ── 6. CustomsIntelligence — factors.map f.description/f.weight ──
# f is string | {description,weight} → cast as any
patch("src/components/CustomsIntelligence.tsx",
    "{selectedDecl.riskAssessment.factors.map((f, i) => (\n                       <div key={i} className=\"flex justify-between items-center text-[10px] bg-black/40 p-2 rounded-lg border border-white/5\">\n                          <span className=\"text-gray-300\">{f.description}</span>\n                          <span className=\"text-red-400 font-bold\">+{f.weight}</span>",
    "{selectedDecl.riskAssessment.factors.map((f: any, i) => (\n                       <div key={i} className=\"flex justify-between items-center text-[10px] bg-black/40 p-2 rounded-lg border border-white/5\">\n                          <span className=\"text-gray-300\">{f.description ?? f}</span>\n                          <span className=\"text-red-400 font-bold\">+{f.weight ?? ''}</span>")

print()
print("=" * 55)
print("✅ Part 6 DONE")
print("npx tsc --noEmit 2>&1 | grep 'error TS' | wc -l")
print("=" * 55)
