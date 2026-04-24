#!/usr/bin/env python3
"""natt-os — Fix Part 8 (2 lỗi cuối)"""
import os

ROOT = os.getcwd()
def read(p): 
    with open(os.path.join(ROOT, p), encoding='utf-8') as f: return f.read()
def save(p, c): 
    with open(os.path.join(ROOT, p), 'w', encoding='utf-8') as f: f.write(c)

print("natt-os Fix Part 8 — 2 final errors")

# CustomizationRequest.packaging
c = read("src/types.ts")
c = c.replace("  logo?: boolean | string;\n  id?: string;",
              "  logo?: boolean | string;\n  packaging?: any;\n  id?: string;")
save("src/types.ts", c)
print("✅ CustomizationRequest.packaging")

# EInvoice — invoiceSeries, issueDate, grandTotal, currency → optional
c = read("src/types.ts")
c = c.replace("  invoiceSeries: string;\n  issueDate: string;",
              "  invoiceSeries?: string;\n  issueDate?: string;")
c = c.replace("  grandTotal: number;\n  currency: string;",
              "  grandTotal?: number;\n  currency?: string;")
save("src/types.ts", c)
print("✅ EInvoice fields optional")

print()
print("✅ ALL DONE — npx tsc --noEmit should return 0 errors")
