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
