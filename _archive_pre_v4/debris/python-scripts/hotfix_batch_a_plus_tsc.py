#!/usr/bin/env python3
"""
HOTFIX: Batch A retry (types.ts path fix) + 6 pre-existing tsc errors

Problem 1: batch_a_merge.py checked root/types.ts, actual is src/types.ts
Problem 2: conflict-resolver.ts line 79 + dictionary-approval-service.ts line 56
           have corrupted template literals (Invalid character / Unterminated)
"""

import os
import sys

GM = os.path.expanduser(
    "~/Desktop/HỒ SƠ SHTT NATT-OS BY NATTSIRA-OS/natt-os ver2goldmaster"
)

DRY_RUN = "--dry" in sys.argv

# ─── Find types.ts ───
TYPES_PATH = os.path.join(GM, "src", "types.ts")
if not os.path.isfile(TYPES_PATH):
    print(f"❌ src/types.ts not found at {TYPES_PATH}")
    sys.exit(1)
print(f"📍 types.ts: src/types.ts ({os.path.getsize(TYPES_PATH)} bytes)")


def write_file(rel_path, content, label):
    full = os.path.join(GM, rel_path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    if DRY_RUN:
        print(f"  [DRY] Would write {rel_path} ({len(content.splitlines())}L)")
        return
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  ✅ {label} → {rel_path} ({len(content.splitlines())}L)")


def append_types(additions, label):
    with open(TYPES_PATH, "r", encoding="utf-8") as f:
        existing = f.read()
    first_line = additions.strip().split("\n")[0]
    if first_line in existing:
        print(f"  ⏭️  {label} — already in src/types.ts, skipping")
        return
    if DRY_RUN:
        print(f"  [DRY] Would append {label} to src/types.ts")
        return
    with open(TYPES_PATH, "a", encoding="utf-8") as f:
        f.write("\n" + additions)
    print(f"  ✅ {label} appended to src/types.ts")


def fix_file_template_literals(rel_path, label):
    """Fix corrupted template literals in a file."""
    full = os.path.join(GM, rel_path)
    if not os.path.isfile(full):
        print(f"  ⏭️  {label} — file not found, skipping")
        return False
    
    with open(full, "r", encoding="utf-8") as f:
        content = f.read()
    
    original = content
    
    # Fix: Replace any corrupted backtick characters
    # Common corruption: Unicode lookalikes for backtick ` (U+0060)
    # Check for: ʻ (U+02BB), ˋ (U+02CB), ` (U+FF40), ′ (U+2032), etc.
    replacements = {
        '\u02BB': '`',  # MODIFIER LETTER TURNED COMMA
        '\u02CB': '`',  # MODIFIER LETTER GRAVE ACCENT  
        '\uFF40': '`',  # FULLWIDTH GRAVE ACCENT
        '\u2018': "'",  # LEFT SINGLE QUOTATION MARK
        '\u2019': "'",  # RIGHT SINGLE QUOTATION MARK
        '\u201C': '"',  # LEFT DOUBLE QUOTATION MARK
        '\u201D': '"',  # RIGHT DOUBLE QUOTATION MARK
    }
    
    for bad, good in replacements.items():
        if bad in content:
            content = content.replace(bad, good)
            print(f"  🔧 Replaced Unicode char {repr(bad)} in {label}")
    
    if content != original:
        if not DRY_RUN:
            with open(full, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"  ✅ {label} — template literals fixed")
        else:
            print(f"  [DRY] Would fix template literals in {label}")
        return True
    
    return False


def diagnose_file(rel_path, line_num, label):
    """Show hex dump of problematic line for diagnosis."""
    full = os.path.join(GM, rel_path)
    if not os.path.isfile(full):
        return
    with open(full, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    if line_num <= len(lines):
        line = lines[line_num - 1]
        print(f"  📋 {label} line {line_num}: {repr(line.rstrip())}")
        # Show hex of non-ASCII chars
        for i, ch in enumerate(line):
            if ord(ch) > 127:
                print(f"     ⚠️  Position {i}: U+{ord(ch):04X} ({ch!r})")


# ═══════════════════════════════════════════════════════════════
# PART 1: FIX PRE-EXISTING TSC ERRORS
# ═══════════════════════════════════════════════════════════════
def fix_tsc_errors():
    print("\n" + "=" * 60)
    print("PART 1: FIX PRE-EXISTING TSC ERRORS (6 errors)")
    print("=" * 60)
    
    # Diagnose first
    print("\n--- Diagnosing conflict-resolver.ts line 79 ---")
    diagnose_file("src/services/conflict/conflict-resolver.ts", 79, "conflict-resolver")
    diagnose_file("src/services/conflict/conflict-resolver.ts", 123, "conflict-resolver")
    
    print("\n--- Diagnosing dictionary-approval-service.ts line 56 ---")
    diagnose_file("src/services/dictionary-approval-service.ts", 56, "dict-approval")
    diagnose_file("src/services/dictionary-approval-service.ts", 102, "dict-approval")
    
    # Try Unicode fix
    fixed1 = fix_file_template_literals(
        "src/services/conflict/conflict-resolver.ts",
        "conflict-resolver"
    )
    fixed2 = fix_file_template_literals(
        "src/services/dictionary-approval-service.ts",
        "dictionary-approval-service"
    )
    
    if not fixed1 and not fixed2:
        print("\n  ⚠️  No Unicode corruption found — need to inspect raw bytes")
        print("  Running hex analysis...")
        
        for fpath, lines_to_check in [
            ("src/services/conflict/conflict-resolver.ts", [79, 123]),
            ("src/services/dictionary-approval-service.ts", [56, 102])
        ]:
            full = os.path.join(GM, fpath)
            if not os.path.isfile(full):
                continue
            with open(full, "rb") as f:
                raw = f.read()
            
            # Find non-ASCII bytes
            non_ascii = []
            for i, b in enumerate(raw):
                if b > 127:
                    # Get surrounding context
                    start = max(0, i - 5)
                    end = min(len(raw), i + 5)
                    context = raw[start:end]
                    non_ascii.append((i, b, context))
            
            if non_ascii:
                print(f"\n  📋 {fpath}: {len(non_ascii)} non-ASCII bytes found")
                for pos, byte_val, ctx in non_ascii[:10]:
                    print(f"     Byte {pos}: 0x{byte_val:02X} context: {ctx!r}")
            
            # Also check for \r\n vs \n issues, BOM, etc.
            if raw[:3] == b'\xef\xbb\xbf':
                print(f"  ⚠️  {fpath} has BOM — removing")
                if not DRY_RUN:
                    with open(full, "wb") as f:
                        f.write(raw[3:])
    
    return fixed1 or fixed2


# ═══════════════════════════════════════════════════════════════
# PART 2: BATCH A MODULES (5 modules that weren't written)
# ═══════════════════════════════════════════════════════════════
def batch_a_modules():
    print("\n" + "=" * 60)
    print("PART 2: BATCH A — 5 MODULES")
    print("=" * 60)
    
    # Module 1: GovernanceEnforcementEngine
    print("\n[1/5] GovernanceEnforcementEngine")
    write_file("src/natt-os/governance/enforcement-engine.ts", '''\
/**
 * ⚖️ GOVERNANCE ENFORCEMENT ENGINE
 * Validate AI commands theo permission + scope + constitutional rules.
 * Source: NATTCELL KERNEL
 */
export class GovernanceEnforcementEngine {
  static async validateAICommand(aiId: string, envelope: any, policy: any) {
    if (!envelope?.command_id) {
      return { allowed: false, reason: 'NO_COMMAND' };
    }

    const aiConfig = policy.ai_registry[aiId];
    if (!aiConfig) {
      return { allowed: false, reason: 'AI_NOT_REGISTERED' };
    }

    if (!this.isWithinScope(envelope.target_path, aiConfig.scope_limit)) {
      return { allowed: false, reason: 'SCOPE_VIOLATION' };
    }

    const reqFields = policy.trace_requirements.required_fields;
    for (const field of reqFields) {
      if (!envelope[field]) {
        return { allowed: false, reason: 'TRACE_MISSING', details: { missing: field } };
      }
    }

    return { allowed: true, traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` };
  }

  private static isWithinScope(requestedPath: string, allowedScopes: string[]): boolean {
    if (!requestedPath) return true;
    return allowedScopes.some(scope => {
      const regex = new RegExp('^' + scope.replace(/\\*/g, '.*') + '$');
      return regex.test(requestedPath);
    });
  }
}
''', "GovernanceEnforcementEngine")

    # Module 2: ReconciliationService
    print("\n[2/5] ReconciliationService")
    write_file("src/services/ReconciliationService.ts", '''\
import { Transaction, GatewayReport, ReconciliationResult, Discrepancy } from '../types';

/**
 * ⚖️ RECONCILIATION SERVICE - PRODUCTION CORE
 * Source: NATTCELL KERNEL
 */
class ReconciliationService {
  private static instance: ReconciliationService;
  private discrepancyThreshold = 1000;

  public static getInstance() {
    if (!ReconciliationService.instance) ReconciliationService.instance = new ReconciliationService();
    return ReconciliationService.instance;
  }

  async reconcileDailyTransactions(date: Date): Promise<ReconciliationResult> {
    const dateStr = date.toISOString().split('T')[0];
    console.log(`[RECON-PROD] Khởi chạy đối soát ngày: ${dateStr}`);
    const localTransactions: Transaction[] = [];
    const gatewayReports: GatewayReport[] = [];
    return this.performReconciliation(localTransactions, gatewayReports);
  }

  private performReconciliation(
    localTxns: Transaction[],
    gatewayReports: GatewayReport[]
  ): ReconciliationResult {
    const discrepancies: Discrepancy[] = [];
    gatewayReports.forEach(report => {
      const localForGateway = localTxns.filter(t => t.gateway === report.gateway);
      const localTotal = localForGateway.reduce((sum, t) => sum + t.amount, 0);
      if (Math.abs(localTotal - report.totalAmount) > this.discrepancyThreshold) {
        discrepancies.push({
          type: 'TOTAL_MISMATCH',
          gateway: report.gateway,
          localTotal,
          gatewayTotal: report.totalAmount,
          difference: localTotal - report.totalAmount,
          message: `Sai lệch Shard ${report.gateway}.`,
          severity: 'HIGH'
        });
      }
    });
    return {
      date: new Date().toISOString().split('T')[0],
      localTransactions: localTxns,
      gatewayReports,
      discrepancies,
      summary: {
        totalLocalAmount: localTxns.reduce((s, t) => s + t.amount, 0),
        totalGatewayAmount: gatewayReports.reduce((s, r) => s + r.totalAmount, 0),
        totalDiscrepancies: discrepancies.length,
        highSeverityDiscrepancies: discrepancies.filter(d => d.severity === 'HIGH').length
      }
    };
  }
}

export const ReconProvider = ReconciliationService.getInstance();
''', "ReconciliationService")

    # Module 3: RefundWorkflowService
    print("\n[3/5] RefundWorkflowService")
    write_file("src/services/RefundWorkflowService.ts", '''\
import { RefundRequest, ApprovalStatus, PersonaID } from '../types';
import { NotifyBus } from './notificationservice';

/**
 * 💰 REFUND WORKFLOW SERVICE
 * Source: NATTCELL KERNEL | FIX: PersonaID enum casing
 */
class RefundWorkflowService {
  private static instance: RefundWorkflowService;
  private requests: RefundRequest[] = [];

  public static getInstance() {
    if (!RefundWorkflowService.instance) RefundWorkflowService.instance = new RefundWorkflowService();
    return RefundWorkflowService.instance;
  }

  async startRefundRequest(request: Omit<RefundRequest, 'id' | 'status' | 'timestamp'>): Promise<RefundRequest> {
    const newRequest: RefundRequest = {
      ...request,
      id: `REF-${Date.now()}`,
      status: ApprovalStatus.PENDING,
      timestamp: Date.now()
    };
    const isHighValue = newRequest.amount > 5000000;
    this.requests.push(newRequest);
    NotifyBus.push({
      type: 'RISK',
      title: 'Yêu cầu hoàn tiền mới',
      content: `Đơn: ${newRequest.orderId}. Số tiền: ${newRequest.amount.toLocaleString()} VND. Cần ${isHighValue ? 'Finance' : 'Manager'} duyệt.`,
      persona: PersonaID.kris,
      priority: isHighValue ? 'HIGH' : 'MEDIUM'
    });
    return newRequest;
  }

  async approve(id: string, approverRole: string) {
    const req = this.requests.find(r => r.id === id);
    if (!req) return;
    const isHighValue = req.amount > 5000000;
    if (isHighValue && approverRole !== 'FINANCE_MANAGER' && approverRole !== 'MASTER') {
      throw new Error("Yêu cầu > 5M bắt buộc Phòng tài chính phê duyệt.");
    }
    req.status = ApprovalStatus.APPROVED;
    NotifyBus.push({
      type: 'SUCCESS',
      title: 'Hoàn tiền hoàn tất',
      content: `Lệnh hoàn tiền ${req.id} đã được thực thi thành công.`,
      persona: PersonaID.thien
    });
  }

  getRequests() { return this.requests; }
}

export const RefundEngine = RefundWorkflowService.getInstance();
''', "RefundWorkflowService")

    # Module 4: OrphanDetectionBot
    print("\n[4/5] OrphanDetectionBot")
    write_file("src/services/monitoring/OrphanDetectionBot.ts", '''\
import { EventEnvelope, PersonaID } from '../../types';
import { NotifyBus } from '../notificationservice';

/**
 * 🤖 ORPHAN DETECTION BOT
 * Source: NATTCELL KERNEL | FIX: PersonaID casing, removed unused imports
 */
export class OrphanDetectionBot {
  private static instance: OrphanDetectionBot;
  private readonly ORPHAN_THRESHOLD_MS = 300000;

  public static getInstance() {
    if (!OrphanDetectionBot.instance) OrphanDetectionBot.instance = new OrphanDetectionBot();
    return OrphanDetectionBot.instance;
  }

  public async scanForOrphans(events: EventEnvelope[]) {
    const now = Date.now();
    const orphans = events.filter(e => {
      if (e.event_name.includes('INIT')) return false;
      const hasCausation = !!e.trace.causation_id;
      const isOldEnough = (now - new Date(e.occurred_at).getTime()) > this.ORPHAN_THRESHOLD_MS;
      return !hasCausation && isOldEnough;
    });
    if (orphans.length > 0) {
      this.triggerAlert(orphans);
    }
  }

  private triggerAlert(orphans: EventEnvelope[]) {
    NotifyBus.push({
      type: 'RISK',
      title: 'ORPHAN EVENTS DETECTED',
      content: `Phát hiện ${orphans.length} sự kiện không rõ nguồn gốc.`,
      persona: PersonaID.kris,
      priority: 'HIGH'
    });
    console.error(`[ORPHAN-BOT] Detected ${orphans.length} orphaned events!`, orphans);
  }
}

export const OrphanBot = OrphanDetectionBot.getInstance();
''', "OrphanDetectionBot")

    # Module 5: EnterpriseLinker
    print("\n[5/5] EnterpriseLinker")

    # Add missing types
    append_types('''\

// ═══ NATTCELL MERGE: enterpriseLinker types ═══
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
  status: 'PENDING' | 'MATCHED' | 'DISCREPANCY';
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
''', "LinkedRecord + AggregatedReport")

    write_file("src/services/enterpriseLinker.ts", '''\
import { AggregatedReport, LinkedRecord } from '../types';

/**
 * 🔗 ENTERPRISE LINKER
 * Source: NATTCELL KERNEL
 */
export class EnterpriseLinker {
  static async generateMultiDimensionalReport(period: string): Promise<AggregatedReport> {
    const productionData = [
      { sku: 'NNA-ROLEX-01', cost: 185000000, gold: 3.5, stone: 1.2, worker: 'Nguyễn Văn Vẹn' },
      { sku: 'NNU-HALO-02', cost: 28000000, gold: 1.2, stone: 0.8, worker: 'Bùi Cao Sơn' },
      { sku: 'BT-DIAMOND-03', cost: 45000000, gold: 1.5, stone: 1.0, worker: 'Trần Hoài Phúc' }
    ];
    const salesData = [
      { sku: 'NNA-ROLEX-01', price: 250000000, customer: 'ANH NATT', inv: 'INV-001' },
      { sku: 'NNU-HALO-02', price: 45000000, customer: 'CHỊ LAN', inv: 'INV-002' },
      { sku: 'BT-DIAMOND-03', price: 68000000, customer: 'KHÁCH VÃNG LAI', inv: 'INV-003' }
    ];
    const financeData = [
      { ref: 'NNA-ROLEX-01', amount: 250000000, txId: 'TX-998811' },
      { ref: 'NNU-HALO-02', amount: 45000000, txId: 'TX-998822' },
      { ref: 'BT-DIAMOND-03', amount: 65000000, txId: 'TX-998833' }
    ];

    const records: LinkedRecord[] = productionData.map((prod) => {
      const sale = salesData.find(s => s.sku === prod.sku);
      const finance = financeData.find(f => f.ref === prod.sku || (sale && f.ref === sale.inv));
      const salesPrice = sale ? sale.price : 0;
      const receivedAmount = finance ? finance.amount : 0;
      let status: LinkedRecord['status'] = 'PENDING';
      if (sale && finance) {
        status = salesPrice === receivedAmount ? 'MATCHED' : 'DISCREPANCY';
      }
      return {
        id: `LINK-${prod.sku}-${Date.now()}`, sku: prod.sku,
        productionCost: prod.cost, goldWeight: prod.gold, stoneWeight: prod.stone, workerName: prod.worker,
        salesPrice, customerName: sale ? sale.customer : 'N/A',
        invoiceId: sale ? sale.inv : undefined,
        bankTxId: finance ? finance.txId : undefined,
        receivedAmount, taxPaid: salesPrice * 0.1,
        grossProfit: salesPrice - prod.cost, status
      };
    });

    const totalRevenue = records.reduce((sum, r) => sum + r.salesPrice, 0);
    const totalCOGS = records.reduce((sum, r) => sum + r.productionCost, 0);
    const totalOpEx = totalRevenue * 0.15;
    return {
      period, totalRevenue, totalCOGS, totalOpEx,
      netProfit: totalRevenue - totalCOGS - totalOpEx,
      margin: totalRevenue > 0 ? ((totalRevenue - totalCOGS - totalOpEx) / totalRevenue) * 100 : 0,
      discrepancyCount: records.filter(r => r.status === 'DISCREPANCY').length,
      records
    };
  }
}
''', "EnterpriseLinker")


# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════
def main():
    print("=" * 60)
    print("HOTFIX: Batch A + TSC Error Fix")
    print("=" * 60)

    if not os.path.isdir(GM):
        print(f"\n❌ Goldmaster not found: {GM}")
        sys.exit(1)

    if DRY_RUN:
        print("\n🔍 DRY RUN\n")

    # Part 1: Fix pre-existing errors
    fix_tsc_errors()

    # Part 2: Write Batch A modules
    batch_a_modules()

    print("\n" + "=" * 60)
    print("HOTFIX COMPLETE")
    print("=" * 60)
    print("\nVerify:")
    print("  npx tsc --noEmit 2>&1 | head -20")
    print("  npm run build")


if __name__ == "__main__":
    main()
