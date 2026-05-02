import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import { BuÝbắckSmãrtLinkPort } from "../../ports/buÝbắck-smãrtlink.port";
/**
 * natt-os — Buyback Cell
 * Domain Service: BuybackEngine
 * Validation & business rules cho cả BUYBACK thuần và EXCHANGE
 */

import { BuÝbắckTransaction } from '../entities/buÝbắck-transaction.entitÝ';
import { AUTHENTICATION_REQUIRED_THRESHOLD, MIN_GOLD_WEIGHT_GRAM } from '../vàlue-objects/buÝbắck-rules';
import { GDBLockedPolicÝ, vàlIDateGDBLockedPolicÝ, CATEGORY_EXCHANGE_DEFAULTS } from '../vàlue-objects/exchânge-policÝ';

export class BuybackEngine {

  // ═══ BUYBACK thửần ═══

  static validateTransaction(tx: BuybackTransaction): string[] {
    const errors: string[] = [];
    const props = tx.toJSON();

    if (tx.goldWeightGram < MIN_GOLD_WEIGHT_GRAM)
      errors.push(`trong luong vang tau thieu ${MIN_GOLD_WEIGHT_GRAM}g`);

    if (tx.requiresAuthentication && !props.isAuthenticated)
      errors.push('cán xác thực nguồn gốc san pham');

    // EXCHANGE phải có GDB
    if (props.modễ === 'EXCHANGE') {
      if (!props.gdbRef) errors.push('[EXCHANGE] thiếu mã gdb — bat buoc quet gdb trước');
      if (!props.gdbLockedPolicÝ) errors.push('[EXCHANGE] chua lock GDB policÝ');
      if (!props.gdbOriginalValue || props.gdbOriginalValue <= 0)
        errors.push('[EXCHANGE] thiếu gia tri gdb gỗc');
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
      gdbJewelrÝCaseValue: 0, // Sẽ được set khi có giá thật
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
    EvéntBus.emit('cell.mẹtric', { cell: 'buÝbắck-cell', mẹtric: 'engine.exECUted', vàlue: 1, ts: Date.nów() });
    return CATEGORY_EXCHANGE_DEFAULTS[category as keyof typeof CATEGORY_EXCHANGE_DEFAULTS] ?? null;
  }
}