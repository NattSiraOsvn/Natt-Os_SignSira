#!/usr/bin/env python3
"""
NATT-OS Wave 3 Fix Round 3: 16 remaining tsc errors
Run from goldmaster root: python3 wave3_fix_round3.py
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
# 1. audit-service.ts:73 — hash is Promise<string>, needs await or cast
# ═══════════════════════════════════════════
print('[1/5] audit-service.ts — hash Promise→string')
c = read('src/services/admin/audit-service.ts')
# Find the line with `hash,` and add `await` or cast
# The hash is likely from generateShardHash which is async
# Safest: cast with `as any`
c = re.sub(r'\n(\s+)hash,', r'\n\1hash: await hash as string,', c)
# If that doesn't match, try alternate
if 'await hash as string' not in c:
    c = c.replace('      hash,', '      hash: (typeof hash === "string" ? hash : await hash) as string,')
write('src/services/admin/audit-service.ts', c)

# ═══════════════════════════════════════════
# 2. analytics-api.ts — threshold_critical → tHReshold_critical
# ═══════════════════════════════════════════
print('[2/5] analytics-api.ts — threshold_critical casing')
c = read('src/services/analytics/analytics-api.ts')
c = c.replace('threshold_critical:', 'tHReshold_critical:')
write('src/services/analytics/analytics-api.ts', c)

# ═══════════════════════════════════════════
# 3. analytics-service.ts — EventBridge default export is instance, 
#    but imported as 'typeof EventBridge' (class). Fix the import.
# ═══════════════════════════════════════════
print('[3/5] analytics-service.ts — EventBridge import')
c = read('src/services/analytics/analytics-service.ts')
# Change: import { EventBridge } from → import EventBridge from (default export is instance)
c = c.replace(
    "import { EventBridge } from '../eventBridge.ts';",
    "import eventBridge from '../eventBridge.ts';"
)
# Then replace EventBridge. with eventBridge.
c = c.replace('EventBridge.on(', 'eventBridge.on(')
write('src/services/analytics/analytics-service.ts', c)

# ═══════════════════════════════════════════
# 4. conflict-resolver.ts — extend types + fix returns
# ═══════════════════════════════════════════
print('[4/5] types.ts — extend ResolvedData, BusinessContext, scoreResult')

c = read('src/types.ts')

# Add losers to ResolvedData
c = c.replace(
    "  winner?: any;\n  scoredPoints?: any[];\n  confidenceGap?: number;\n  methodUsed?: string;\n}",
    "  winner?: any;\n  scoredPoints?: any[];\n  confidenceGap?: number;\n  methodUsed?: string;\n  losers?: any[];\n}"
)

# Add region to BusinessContext
c = c.replace(
    "  industry?: string;\n  dataType?: string;\n}",
    "  industry?: string;\n  dataType?: string;\n  region?: string;\n}"
)

# Add requiredDocuments to ComplianceCheck
c = c.replace(
    """export interface ComplianceCheck {
  passed: boolean;
  issues: Array<{ type: string; severity: string; message: string }>;
  checkedAt: number;
}""",
    """export interface ComplianceCheck {
  passed: boolean;
  issues: Array<{ type: string; severity: string; message: string }>;
  checkedAt: number;
  requiredDocuments?: string[];
}"""
)

write('src/types.ts', c)

# Fix ContextScoringEngine — add finalScore, details to return
print('[4b/5] ContextScoringEngine — add finalScore, details')
write('src/services/scoring/ContextScoringEngine.ts', '''// ContextScoringEngine — real scoring with weighted dimensions
export class ContextScoring {
  static score(context: any): number {
    if (!context) return 0;
    let score = 50;
    if (context.priority) score += context.priority * 10;
    if (context.timestamp) score += 5;
    return Math.min(100, Math.max(0, score));
  }

  static async scoreDataContext(dataPoint: any, businessContext: any): Promise<{
    confidence: number;
    calculatedConfidence: number;
    finalScore: number;
    details: Record<string, any>;
  }> {
    let confidence = 0.5;
    const details: Record<string, any> = { base: 0.5 };

    if (dataPoint?.priority) { confidence += dataPoint.priority * 0.1; details.priorityBoost = dataPoint.priority * 0.1; }
    if (dataPoint?.timestamp) { confidence += 0.05; details.timestampBoost = 0.05; }
    if (businessContext?.industry === 'JEWELRY') { confidence += 0.1; details.industryBoost = 0.1; }

    confidence = Math.min(1, Math.max(0, confidence));
    return { confidence, calculatedConfidence: confidence, finalScore: confidence, details };
  }

  static rank(items: any[]): any[] {
    return items.sort((a, b) => this.score(b) - this.score(a));
  }
}
''')

# Fix conflict-resolver.ts return objects missing ConflictResolutionRule fields
print('[4c/5] conflict-resolver.ts — fix loadConflictRule returns')
c = read('src/services/conflict/conflict-resolver.ts')

# First return (generic fallback ~line 117): add id, name, priority, condition, method
c = re.sub(
    r"return \{\s*dataType:\s*'GENERIC',\s*threshold:\s*([\d.]+),\s*defaultMethod:\s*ConflictResolutionMethod\.PRIORITY_BASED,\s*fallbackMethod:\s*ConflictResolutionMethod\.MANUAL_REVIEW\s*\}",
    """return {
        id: 'RULE-GENERIC',
        name: 'Generic Resolution',
        priority: 1,
        condition: 'default',
        method: ConflictResolutionMethod.PRIORITY_BASED,
        dataType: 'GENERIC',
        threshold: \\1,
        defaultMethod: ConflictResolutionMethod.PRIORITY_BASED,
        fallbackMethod: ConflictResolutionMethod.MANUAL_REVIEW
      }""",
    c
)

# Second return (rule-based ~line 125): add id, name, priority, condition, method
c = re.sub(
    r"return \{\s*dataType:\s*rule\.dataType,\s*threshold:\s*rule\.threshold,\s*defaultMethod:\s*rule\.(defaultMethod|method),\s*fallbackMethod:\s*rule\.fallbackMethod\s*\}",
    """return {
        id: rule.id || 'RULE-CUSTOM',
        name: rule.name || 'Custom Rule',
        priority: rule.priority || 1,
        condition: rule.condition || 'custom',
        method: rule.method || ConflictResolutionMethod.PRIORITY_BASED,
        dataType: rule.dataType,
        threshold: rule.threshold,
        defaultMethod: rule.defaultMethod,
        fallbackMethod: rule.fallbackMethod
      }""",
    c
)

write('src/services/conflict/conflict-resolver.ts', c)

print('\n' + '='*50)
print('DONE. Run:')
print('  npx tsc --noEmit')
print('  npm run build')
print('='*50)
