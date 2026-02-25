#!/usr/bin/env python3
"""
NATT-OS Wave 3 Fix Round 5: Final 4 tsc errors
Run from goldmaster root: python3 wave3_fix_round5.py
"""
import os, re

ROOT = os.path.dirname(os.path.abspath(__file__))

def read(p):
    with open(os.path.join(ROOT, p), 'r', encoding='utf-8') as f: return f.read()

def write(p, c):
    full = os.path.join(ROOT, p)
    with open(full, 'w', encoding='utf-8') as f: f.write(c)
    print(f'  ✓ {p}')

# ═══════════════════════════════════════════
# 1. audit-service.ts:67 — missing actor, module in AuditItem
# ═══════════════════════════════════════════
print('[1/2] audit-service.ts — add actor, module to entry')
c = read('src/services/admin/audit-service.ts')
c = c.replace(
    'causation_id',
    'actor: userId,\n      module: action.split(\'.\')[0] || \'SYSTEM\',\n      causation_id'
)
write('src/services/admin/audit-service.ts', c)

# ═══════════════════════════════════════════
# 2. conflict-resolver.ts — two issues:
#    a) resolutionHash: generateShardHash returns Promise<string> → await
#    b) businessContext missing module, operation, actor, timestamp
# ═══════════════════════════════════════════
print('[2/2] conflict-resolver.ts — await hash + fill BusinessContext')
c = read('src/services/conflict/conflict-resolver.ts')

# Fix resolutionHash: add await
c = c.replace(
    'resolutionHash: ShardingService.generateShardHash(',
    'resolutionHash: await ShardingService.generateShardHash('
)

# Fix businessContext: add missing required fields
c = c.replace(
    "const businessContext: BusinessContext = {",
    "const businessContext: BusinessContext = {\n       module: 'CONFLICT_RESOLVER',\n       operation: 'RESOLVE',\n       actor: 'SYSTEM',\n       timestamp: Date.now(),"
)

write('src/services/conflict/conflict-resolver.ts', c)

print('\n' + '='*50)
print('DONE. Run:')
print('  npx tsc --noEmit')
print('  npm run build')
print('  git add -A && git commit -m "wave3: 64→0 tsc errors, real standalone services integrated"')
print('='*50)
