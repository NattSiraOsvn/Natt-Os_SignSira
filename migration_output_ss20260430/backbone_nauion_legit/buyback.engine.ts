import { EventBus } from '../../../../../core/events/event-bus';
import { BuybackSmartLinkPort } from "../../ports/buyback-smartlink.port";
/**
 * natt-os — Buyback Cell
 * Domain Service: BuybackEngine
 * Validation & business rules cho cả BUYBACK thuần và EXCHANGE
 */

import { BuybackTransaction } from '../entities/buyback-transaction.entity';
import { AUTHENTICATION_REQUIRED_THRESHOLD, MIN_GOLD_WEIGHT_GRAM } from '../value-objects/buyback-rules';
import { GDBLockedPolicy, validateGDBLockedPolicy, CATEGORY_EXCHANGE_DEFAULTS } from '../value-objects/exchange-policy';

export class BuybackEngine {

  // ═══ BUYBACK thuần ═══

  static validateTransaction(tx: BuybackTransaction): string[] {
    const errors: string[] = [];
    const props = tx.toJSON();

    if (tx.goldWeightGram < MIN_GOLD_WEIGHT_GRAM)
      errors.push(`trong luong vang tau thieu ${MIN_GOLD_WEIGHT_GRAM}g`);

    if (tx.requiresAuthentication && !props.isAuthenticated)
      errors.push('can xac thuc nguon goc san pham');

    // EXCHANGE phải có GDB
    if (props.mode === 'EXCHANGE') {
      if (!props.gdbRef) errors.push('[EXCHANGE] thieu ma gdb — bat buoc quet gdb truoc');
      if (!props.gdbLockedPolicy) errors.push('[EXCHANGE] chua lock GDB policy');
      if (!props.gdbOriginalValue || props.gdbOriginalValue <= 0)
        errors.push('[EXCHANGE] thieu gia tri gdb goc');
    }

    return errors;
  }

  static needsAuthentication(estimatedValue: number): boolean {
    return estimatedValue >= AUTHENTICATION_REQUIRED_THRESHOLD;
  }

  // ═══ EXCHANGE ═══

  /**
   * Build GDBLockedPolicy từ dữ liệu quét GĐB
   * Dùng CATEGORY_EXCHANGE_DEFAULTS làm base, ghi đè bằng rates thực từ GĐB
   */
  static buildPolicyFromGDB(params: {
    category: string;
    jewelryCaseBuyback: number;
    jewelryCaseUpgrade: number;
    mainStoneBuyback: number | null;
    mainStoneUpgrade: number | null;
  }): GDBLockedPolicy {
    const policy: GDBLockedPolicy = {
      gdbJewelryCaseValue: 0, // Sẽ được set khi có giá thật
      gdbMainStoneValue: 0,
      jewelryCase: {
        buybackDeduction: params.jewelryCaseBuyback,
        upgradeDeduction: params.jewelryCaseUpgrade,
      },
      mainStone: (params.mainStoneBuyback !== null || params.mainStoneUpgrade !== null)
        ? { buybackDeduction: params.mainStoneBuyback, upgradeDeduction: params.mainStoneUpgrade }
        : null,
    };

    const err = validateGDBLockedPolicy(policy);
    if (err) throw new Error(`[ENGINE] GDB policy khong hop le: ${err}`);

    return policy;
  }

  /**
   * Gợi ý rates mặc định theo category — để pre-fill UI trước khi quét GĐB
   */
  static getDefaultRates(category: string) {
    EventBus.emit('cell.metric', { cell: 'buyback-cell', metric: 'engine.executed', value: 1, ts: Date.now() });
    return CATEGORY_EXCHANGE_DEFAULTS[category as keyof typeof CATEGORY_EXCHANGE_DEFAULTS] ?? null;
  }
}
