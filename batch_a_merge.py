#!/usr/bin/env python3
"""
NATTCELL → GOLDMASTER MERGE — BATCH A (5 modules, 278L)
Safest modules: zero-to-low risk, all type deps verified.

Modules:
  1. GovernanceEnforcementEngine (42L) — zero deps
  2. ReconciliationService (68L) — all types exist in GM
  3. RefundWorkflowService (62L) — enum casing fix
  4. OrphanDetectionBot (53L) — enum casing + import fix
  5. enterpriseLinker (89L) — +2 types

Failure modes addressed:
  - Enum casing: PersonaID.KRIS → .kris
  - Import path: notificationService → notificationservice
  - Import path: blockchainService → blockchainservice
  - Import .ts extension removed
  - ShardingService unused import cleaned in OrphanBot
  - Missing types: AggregatedReport + LinkedRecord added
"""

import os
import sys

# ─── CONFIG ───
GM = os.path.expanduser(
    "~/Desktop/HỒ SƠ SHTT NATT-OS BY NATTSIRA-OS/natt-os ver2goldmaster"
)

DRY_RUN = "--dry" in sys.argv


def write_file(rel_path: str, content: str, label: str):
    full = os.path.join(GM, rel_path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    if DRY_RUN:
        print(f"  [DRY] Would write {rel_path} ({len(content.splitlines())}L)")
        return
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  ✅ {label} → {rel_path} ({len(content.splitlines())}L)")


def append_types(additions: str, label: str):
    """Append new types to end of types.ts, with duplicate guard."""
    types_path = os.path.join(GM, "types.ts")
    with open(types_path, "r", encoding="utf-8") as f:
        existing = f.read()

    # Guard: check if first type already exists
    first_type = additions.strip().split("\n")[0]
    if first_type in existing:
        print(f"  ⏭️  {label} — already in types.ts, skipping")
        return

    if DRY_RUN:
        print(f"  [DRY] Would append {label} to types.ts")
        return

    with open(types_path, "a", encoding="utf-8") as f:
        f.write("\n" + additions)
    print(f"  ✅ {label} appended to types.ts")


# ═══════════════════════════════════════════════════════════════
# MODULE 1: GovernanceEnforcementEngine (42L) — ZERO DEPS
# ═══════════════════════════════════════════════════════════════
def module_1_governance():
    print("\n[1/5] GovernanceEnforcementEngine")
    content = '''\
/**
 * ⚖️ GOVERNANCE ENFORCEMENT ENGINE
 * Validate AI commands theo permission + scope + constitutional rules.
 * Source: NATTCELL KERNEL
 */
export class GovernanceEnforcementEngine {
  static async validateAICommand(aiId: string, envelope: any, policy: any) {
    // 1) Kiểm tra Command ID
    if (!envelope?.command_id) {
      return { allowed: false, reason: 'NO_COMMAND' };
    }

    // 2) Kiểm tra Identity trong Registry
    const aiConfig = policy.ai_registry[aiId];
    if (!aiConfig) {
      return { allowed: false, reason: 'AI_NOT_REGISTERED' };
    }

    // 3) Kiểm tra ranh giới Shard (Scope Enforcement)
    if (!this.isWithinScope(envelope.target_path, aiConfig.scope_limit)) {
      return { allowed: false, reason: 'SCOPE_VIOLATION' };
    }

    // 4) Kiểm tra Trace Requirements
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
'''
    write_file(
        "src/natt-os/governance/enforcement-engine.ts",
        content,
        "GovernanceEnforcementEngine"
    )


# ═══════════════════════════════════════════════════════════════
# MODULE 2: ReconciliationService (68L) — ALL TYPES EXIST
# ═══════════════════════════════════════════════════════════════
def module_2_reconciliation():
    print("\n[2/5] ReconciliationService")
    content = '''\
import { Transaction, GatewayReport, ReconciliationResult, Discrepancy } from '../types';

/**
 * ⚖️ RECONCILIATION SERVICE - PRODUCTION CORE
 * Đối soát giao dịch giữa hệ thống nội bộ và Gateway thanh toán.
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
    console.log(`[RECON-PROD] Khởi chạy giao thức đối soát ngày: ${dateStr}`);

    // Production: trả về mảng rỗng nếu chưa có dữ liệu từ Gateway thực.
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
'''
    write_file(
        "src/services/ReconciliationService.ts",
        content,
        "ReconciliationService"
    )


# ═══════════════════════════════════════════════════════════════
# MODULE 3: RefundWorkflowService (62L) — ENUM CASING FIX
# FIX: PersonaID.KRIS → .kris, PersonaID.THIEN → .thien
# FIX: import notificationService → notificationservice
# ═══════════════════════════════════════════════════════════════
def module_3_refund():
    print("\n[3/5] RefundWorkflowService")
    content = '''\
import { RefundRequest, ApprovalStatus, PersonaID } from '../types';
import { NotifyBus } from './notificationservice';

/**
 * 💰 REFUND WORKFLOW SERVICE
 * Quy trình hoàn tiền với phân tầng rủi ro.
 * Source: NATTCELL KERNEL
 * FIX: PersonaID enum casing (KRIS→kris, THIEN→thien)
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
'''
    write_file(
        "src/services/RefundWorkflowService.ts",
        content,
        "RefundWorkflowService"
    )


# ═══════════════════════════════════════════════════════════════
# MODULE 4: OrphanDetectionBot (53L) — ENUM + IMPORT FIX
# FIX: PersonaID.KRIS → .kris
# FIX: Remove .ts extension from imports
# FIX: Remove unused ShardingService import
# FIX: notificationService → notificationservice
# ═══════════════════════════════════════════════════════════════
def module_4_orphan():
    print("\n[4/5] OrphanDetectionBot")
    content = '''\
import { EventEnvelope, PersonaID } from '../../types';
import { NotifyBus } from '../notificationservice';

/**
 * 🤖 ORPHAN DETECTION BOT
 * Giám sát tính nhất quán của chuỗi Causation (Nguồn gốc sự kiện).
 * Source: NATTCELL KERNEL
 * FIX: PersonaID.KRIS→.kris, removed .ts imports, removed unused ShardingService
 */
export class OrphanDetectionBot {
  private static instance: OrphanDetectionBot;
  private readonly ORPHAN_THRESHOLD_MS = 300000; // 5 Phút

  public static getInstance() {
    if (!OrphanDetectionBot.instance) OrphanDetectionBot.instance = new OrphanDetectionBot();
    return OrphanDetectionBot.instance;
  }

  /**
   * Quét và phát hiện các sự kiện không có nguồn gốc (Orphans)
   */
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
      content: `Phát hiện ${orphans.length} sự kiện không rõ nguồn gốc. Khả năng rò rỉ dữ liệu hoặc xâm nhập Terminal.`,
      persona: PersonaID.kris,
      priority: 'HIGH'
    });

    console.error(`[ORPHAN-BOT] 🚨 Detected ${orphans.length} orphaned events!`, orphans);
  }
}

export const OrphanBot = OrphanDetectionBot.getInstance();
'''
    write_file(
        "src/services/monitoring/OrphanDetectionBot.ts",
        content,
        "OrphanDetectionBot"
    )


# ═══════════════════════════════════════════════════════════════
# MODULE 5: EnterpriseLinker (89L) — NEEDS 2 NEW TYPES
# ═══════════════════════════════════════════════════════════════
def module_5_enterprise_linker():
    print("\n[5/5] EnterpriseLinker")

    # Step 1: Add missing types
    new_types = '''\

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
'''
    append_types(new_types, "LinkedRecord + AggregatedReport")

    # Step 2: Write service
    content = '''\
import { AggregatedReport, LinkedRecord } from '../types';

/**
 * 🔗 ENTERPRISE LINKER
 * Join dữ liệu đa chiều từ Production + Sales + Finance shards.
 * Source: NATTCELL KERNEL
 */
export class EnterpriseLinker {

  /**
   * Tạo báo cáo đa chiều bằng cách join dữ liệu từ 3 nguồn
   * Production sẽ query từ các bảng SQL/NoSQL thực.
   */
  static async generateMultiDimensionalReport(period: string): Promise<AggregatedReport> {
    // 1. Mock Data from PRODUCTION SHARD
    const productionData = [
      { sku: 'NNA-ROLEX-01', cost: 185000000, gold: 3.5, stone: 1.2, worker: 'Nguyễn Văn Vẹn' },
      { sku: 'NNU-HALO-02', cost: 28000000, gold: 1.2, stone: 0.8, worker: 'Bùi Cao Sơn' },
      { sku: 'BT-DIAMOND-03', cost: 45000000, gold: 1.5, stone: 1.0, worker: 'Trần Hoài Phúc' }
    ];

    // 2. Mock Data from SALES SHARD
    const salesData = [
      { sku: 'NNA-ROLEX-01', price: 250000000, customer: 'ANH NATT', inv: 'INV-001' },
      { sku: 'NNU-HALO-02', price: 45000000, customer: 'CHỊ LAN', inv: 'INV-002' },
      { sku: 'BT-DIAMOND-03', price: 68000000, customer: 'KHÁCH VÃNG LAI', inv: 'INV-003' }
    ];

    // 3. Mock Data from FINANCE SHARD (Bank Transactions)
    const financeData = [
      { ref: 'NNA-ROLEX-01', amount: 250000000, txId: 'TX-998811' },
      { ref: 'NNU-HALO-02', amount: 45000000, txId: 'TX-998822' },
      { ref: 'BT-DIAMOND-03', amount: 65000000, txId: 'TX-998833' }
    ];

    // 4. Linking Logic
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
        id: `LINK-${prod.sku}-${Date.now()}`,
        sku: prod.sku,
        productionCost: prod.cost,
        goldWeight: prod.gold,
        stoneWeight: prod.stone,
        workerName: prod.worker,
        salesPrice,
        customerName: sale ? sale.customer : 'N/A',
        invoiceId: sale ? sale.inv : undefined,
        bankTxId: finance ? finance.txId : undefined,
        receivedAmount,
        taxPaid: salesPrice * 0.1,
        grossProfit: salesPrice - prod.cost,
        status
      };
    });

    // 5. Aggregation
    const totalRevenue = records.reduce((sum, r) => sum + r.salesPrice, 0);
    const totalCOGS = records.reduce((sum, r) => sum + r.productionCost, 0);
    const totalOpEx = totalRevenue * 0.15;

    return {
      period,
      totalRevenue,
      totalCOGS,
      totalOpEx,
      netProfit: totalRevenue - totalCOGS - totalOpEx,
      margin: totalRevenue > 0 ? ((totalRevenue - totalCOGS - totalOpEx) / totalRevenue) * 100 : 0,
      discrepancyCount: records.filter(r => r.status === 'DISCREPANCY').length,
      records
    };
  }
}
'''
    write_file(
        "src/services/enterpriseLinker.ts",
        content,
        "EnterpriseLinker"
    )


# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════
def main():
    print("=" * 60)
    print("NATTCELL → GOLDMASTER MERGE — BATCH A")
    print("5 modules, ~278L real code")
    print("=" * 60)

    if not os.path.isdir(GM):
        print(f"\n❌ Goldmaster not found: {GM}")
        print("  Adjust GM path in script if needed.")
        sys.exit(1)

    types_path = os.path.join(GM, "types.ts")
    if not os.path.isfile(types_path):
        print(f"\n❌ types.ts not found at {types_path}")
        sys.exit(1)

    if DRY_RUN:
        print("\n🔍 DRY RUN — no files will be written\n")

    module_1_governance()
    module_2_reconciliation()
    module_3_refund()
    module_4_orphan()
    module_5_enterprise_linker()

    print("\n" + "=" * 60)
    print("BATCH A COMPLETE")
    print("=" * 60)
    print("\nVerify:")
    print("  cd goldmaster && npx tsc --noEmit 2>&1 | head -20")
    print("  npm run build")
    print()
    print("If clean → run batch_b_merge.py")
    print("If errors → check output above, fix, retry")


if __name__ == "__main__":
    main()
