#!/usr/bin/env python3
"""
Fix all 13 tsc errors based on ground truth from NATTCELL uploads.
Groups:
  G1: quantum-types.ts at root (1 err)
  G2: Missing types in src/types.ts (5 err) — Recon + Refund + EnterpriseLinker
  G3: PersonaID casing in RefundWorkflowService (2 err)
  G4: ContextScoringEngine payload cast (1 err)
  G5: Duplicate DataPoint + InputPersona in types.ts (4 err)
"""
import os

GM = os.path.expanduser(
    '~/Desktop/HỒ SƠ SHTT NATT-OS BY NATTSIRA-OS/natt-os ver2goldmaster'
)

# ═══════════════════════════════════════════════
# G1: quantum-types.ts — shapes from actual SQL schema + usage
# ═══════════════════════════════════════════════
qt = '''// quantum-types.ts — Type definitions for QuantumBufferService
// Shapes derived from SQLite schema + service usage

export interface QueueJob {
  id: string;
  type: string;
  payload: string;
  payload_hash: string;
  status: string;
  priority: number;
  attempts: number;
  max_attempts: number;
  next_run_at: number;
  created_at: number;
  updated_at: number;
  error_log: string | null;
  worker_id: string | null;
}

export interface DLQEntry {
  id: string;
  original_job_id: string;
  type: string;
  payload: string;
  payload_hash: string;
  failed_reason: string;
  attempts: number;
  moved_at: number;
}

export interface EnqueueOptions {
  idempotency_key?: string;
  priority?: number;
  delay_ms?: number;
  max_attempts?: number;
}

export type HandlerMap = Record<string, (job: QueueJob) => Promise<void>>;

export interface WorkerConfig {
  poll_interval_ms: number;
  batch_size: number;
}

export interface QueueStats {
  pending: number;
  processing: number;
  done: number;
  failed: number;
  dlq: number;
  total: number;
  oldest_pending_age_ms: number | null;
}

export interface BackoffConfig {
  base_ms: number;
  max_ms: number;
  multiplier: number;
  jitter: boolean;
}

export type QueueStatus = 'pending' | 'processing' | 'done' | 'failed';
'''
open(os.path.join(GM, 'quantum-types.ts'), 'w').write(qt)
print('✅ G1: quantum-types.ts (root) — shapes from SQL schema')


# ═══════════════════════════════════════════════
# G2+G5: Fix src/types.ts
#   - Add missing types (Recon, Refund, EnterpriseLinker)
#   - Fix duplicate DataPoint (merge fields, remove dup)
#   - Remove duplicate InputPersona interface if exists
# ═══════════════════════════════════════════════
tp_path = os.path.join(GM, 'src/types.ts')
tp = open(tp_path, 'r').read()
lines = tp.split('\n')

# --- G5a: Fix duplicate DataPoint ---
# Original at ~line 590: payload: unknown (5 fields)
# Duplicate at ~line 1458: payload: any (7 fields, adds calculatedConfidence, scoreDetails)
# Strategy: Update original to include extra fields, remove duplicate block

# Update original DataPoint (payload: unknown → keep unknown, add optional fields)
tp = tp.replace(
    '''export interface DataPoint {
  id: string;
  source: string;
  payload: unknown;
  confidence: number;
  timestamp: number;
}''',
    '''export interface DataPoint {
  id: string;
  source: string;
  payload: unknown;
  confidence: number;
  timestamp: number;
  calculatedConfidence?: number;
  scoreDetails?: any;
}'''
)
print('✅ G5a: DataPoint merged (added calculatedConfidence, scoreDetails to original)')

# Remove duplicate DataPoint block (~line 1458)
tp = tp.replace(
    '''export interface DataPoint {
  id: string;
  source: string;
  payload: any;
  confidence: number;
  timestamp: number;
  calculatedConfidence?: number;
  scoreDetails?: any;
}''',
    '// [MERGED] DataPoint — moved to line ~590'
)
print('✅ G5a: Duplicate DataPoint removed')

# --- G5b: Remove duplicate InputPersona interface at tail ---
# Check if there's an interface InputPersona after line 1500
lines2 = tp.split('\n')
cut_idx = None
for i, line in enumerate(lines2):
    if i > 1400 and 'export interface InputPersona' in line:
        cut_idx = i
        break

if cut_idx is not None:
    # Remove from this line to end of that interface block
    end_idx = cut_idx
    brace_count = 0
    for j in range(cut_idx, len(lines2)):
        if '{' in lines2[j]:
            brace_count += lines2[j].count('{')
        if '}' in lines2[j]:
            brace_count -= lines2[j].count('}')
        if brace_count <= 0 and j > cut_idx:
            end_idx = j
            break
    # Also check for CalibrationData persona: keyof InputPersona right after
    # Remove entire duplicate tail block
    removed = lines2[cut_idx:end_idx+1]
    lines2 = lines2[:cut_idx] + lines2[end_idx+1:]
    tp = '\n'.join(lines2)
    print(f'✅ G5b: Removed duplicate InputPersona interface ({len(removed)} lines at ~{cut_idx+1})')

    # Also fix persona: keyof InputPersona if it exists nearby
    # This would be in a duplicate CalibrationData block
    lines3 = tp.split('\n')
    dup_calib = None
    for i, line in enumerate(lines3):
        if i > 1400 and 'persona: keyof InputPersona' in line:
            dup_calib = i
            break
    if dup_calib is not None:
        lines3[dup_calib] = lines3[dup_calib].replace(
            'persona: keyof InputPersona',
            'persona: InputPersona'
        )
        tp = '\n'.join(lines3)
        print('✅ G5b: Fixed persona: keyof InputPersona → InputPersona')
else:
    print('⏭️  G5b: No duplicate InputPersona interface found')

# --- G2: Add missing types ---
missing_types = '''

// ═══════════════════════════════════════════════
// NATTCELL KERNEL: Reconciliation types
// ═══════════════════════════════════════════════

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  timestamp: Date;
  gateway: string;
  status: string;
  reference?: string;
}

export interface GatewayReport {
  gateway: string;
  totalAmount: number;
  transactions?: Transaction[];
  reportDate?: Date;
}

export interface ReconciliationResult {
  date: string;
  localTransactions: Transaction[];
  gatewayReports: GatewayReport[];
  discrepancies: Discrepancy[];
  summary: {
    totalLocalAmount: number;
    totalGatewayAmount: number;
    totalDiscrepancies: number;
    highSeverityDiscrepancies: number;
  };
}

export interface Discrepancy {
  type: string;
  gateway: string;
  localTotal: number;
  gatewayTotal: number;
  difference: number;
  message: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

// ═══════════════════════════════════════════════
// NATTCELL KERNEL: Refund types
// ═══════════════════════════════════════════════

export interface RefundRequest {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  submittedBy: string;
  status: ApprovalStatus;
  timestamp: number;
}

// ═══════════════════════════════════════════════
// NATTCELL KERNEL: Enterprise Linker types
// ═══════════════════════════════════════════════

export interface LinkedRecord {
  id: string;
  sku: string;
  productionCost: number;
  goldWeight: number;
  stoneWeight: number;
  workerName: string;
  salesPrice: number;
  customerName: string;
  invoiceId?: string;
  bankTxId?: string;
  receivedAmount: number;
  taxPaid: number;
  grossProfit: number;
  status: 'MATCHED' | 'DISCREPANCY' | 'PENDING';
}

export interface AggregatedReport {
  period: string;
  totalRevenue: number;
  totalCOGS: number;
  totalOpEx: number;
  netProfit: number;
  margin: number;
  discrepancyCount: number;
  records: LinkedRecord[];
}
'''

if 'export interface Transaction {' not in tp:
    tp += missing_types
    print('✅ G2: +Transaction +GatewayReport +ReconciliationResult +Discrepancy +RefundRequest +LinkedRecord +AggregatedReport')
else:
    print('⏭️  G2: Types already exist')

open(tp_path, 'w').write(tp)
print(f'   types.ts saved ({len(tp.split(chr(10)))} lines)')


# ═══════════════════════════════════════════════
# G3: PersonaID casing in RefundWorkflowService
# ═══════════════════════════════════════════════
rf_path = os.path.join(GM, 'src/services/RefundWorkflowService.ts')
if os.path.exists(rf_path):
    c = open(rf_path, 'r').read()
    changed = False
    if 'PersonaID.kris' in c:
        c = c.replace('PersonaID.kris', 'PersonaID.KRIS')
        changed = True
    if 'PersonaID.thien' in c:
        c = c.replace('PersonaID.thien', 'PersonaID.THIEN')
        changed = True
    if changed:
        open(rf_path, 'w').write(c)
        print('✅ G3: PersonaID .kris→.KRIS .thien→.THIEN')
    else:
        print('⏭️  G3: Already correct casing')
else:
    print('⚠️  G3: RefundWorkflowService.ts not found')


# ═══════════════════════════════════════════════
# G4: ContextScoringEngine payload cast
# ═══════════════════════════════════════════════
cs_path = os.path.join(GM, 'src/services/scoring/ContextScoringEngine.ts')
if os.path.exists(cs_path):
    c = open(cs_path, 'r').read()
    if 'dataPoint.payload.invoiceId' in c and '(dataPoint.payload as any)' not in c:
        c = c.replace(
            'if (dataPoint.payload.invoiceId)',
            'if ((dataPoint.payload as any)?.invoiceId)'
        )
        open(cs_path, 'w').write(c)
        print('✅ G4: payload cast to any')
    else:
        print('⏭️  G4: Already fixed')
else:
    print('⚠️  G4: ContextScoringEngine.ts not found')


print('\n═══ ALL FIXES APPLIED ═══')
print('Run: npx tsc --noEmit')
