#!/usr/bin/env python3
"""
NATT-OS Wave 3 Fix Round 4: Final 6 tsc errors
Run from goldmaster root: python3 wave3_fix_round4.py
"""
import os, re

ROOT = os.path.dirname(os.path.abspath(__file__))

def read(p):
    with open(os.path.join(ROOT, p), 'r', encoding='utf-8') as f: return f.read()

def write(p, c):
    full = os.path.join(ROOT, p)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f: f.write(c)
    print(f'  ✓ {p}')

# ═══════════════════════════════════════════
# 1. types.ts — add missing optional fields
# ═══════════════════════════════════════════
print('[1/3] types.ts — extend AuditItem, ResolvedData, BusinessContext')
c = read('src/types.ts')

# AuditItem: add causation_id
c = c.replace(
    "  newValue?: string;\n}",
    "  newValue?: string;\n  causation_id?: string;\n}",
    1  # only first occurrence (AuditItem block)
)

# ResolvedData: add resolutionHash
c = c.replace(
    "  losers?: any[];\n}",
    "  losers?: any[];\n  resolutionHash?: string;\n}",
    1
)

# BusinessContext: add priority (string type based on 'NORMAL')
old_bc = "  region?: string;\n}"
# Need to be careful — multiple interfaces end with region?\n}
# Target specifically after dataType
c = c.replace(
    "  dataType?: string;\n  region?: string;\n}",
    "  dataType?: string;\n  region?: string;\n  priority?: string;\n}",
    1
)

write('src/types.ts', c)

# ═══════════════════════════════════════════
# 2. conflict-resolver.ts line 130 — second return still missing fields
#    The regex in round3 only caught the first return pattern
# ═══════════════════════════════════════════
print('[2/3] conflict-resolver.ts — fix second loadConflictRule return')
c = read('src/services/conflict/conflict-resolver.ts')

# Find the problematic return that has dataType, threshold, defaultMethod, fallbackMethod
# but missing id, name, priority, condition, method
# This is the rule-based return that round3 regex missed
lines = c.split('\n')
new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    # Detect: "return {" followed by "dataType: rule.dataType" without "id:"
    if 'return {' in line and i + 1 < len(lines) and 'dataType: rule' in lines[i+1]:
        # Check if this block already has 'id:'
        block = '\n'.join(lines[i:min(i+10, len(lines))])
        if "id:" not in block and "name:" not in block:
            new_lines.append(line)
            new_lines.append("        id: rule.id || 'RULE-CUSTOM',")
            new_lines.append("        name: rule.name || 'Custom Rule',")
            new_lines.append("        priority: rule.priority || 1,")
            new_lines.append("        condition: rule.condition || 'custom',")
            new_lines.append("        method: rule.method || rule.defaultMethod,")
            i += 1
            continue
    new_lines.append(line)
    i += 1

c = '\n'.join(new_lines)
write('src/services/conflict/conflict-resolver.ts', c)

# ═══════════════════════════════════════════
# 3. customs-service.ts — add checkedAt to ComplianceCheck return
# ═══════════════════════════════════════════
print('[3/3] customs-service.ts — add checkedAt')
c = read('src/services/customs-service.ts')
# Find the return block with passed: and requiredDocuments: but no checkedAt
c = re.sub(
    r"(requiredDocuments:\s*Array\.from\(docs\))\s*\n(\s*\})",
    r"\1,\n      checkedAt: Date.now()\n\2",
    c
)
write('src/services/customs-service.ts', c)

print('\n' + '='*50)
print('DONE. Run:')
print('  npx tsc --noEmit')
print('  npm run build')
print('='*50)
