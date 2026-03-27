// @ts-nocheck
/**
 * supplier.engine.ts — Nhà cung cấp vàng / kim cương
 * SPEC: Can P5 | Supplier = nguồn gốc tài sản + rủi ro hệ
 * Path: src/cells/business/supplier-cell/domain/services/
 */

import { EventBus } from '../../../../../core/events/event-bus';

export type SupplierType = 'gold' | 'diamond';

export interface SupplierInput {
  id:             string;
  name:           string;
  type:           SupplierType;
  purity?:        number;        // % purity — 75% = 18K, 58.5% = 14K
  certification?: string;        // GIA, SJC, DOJI, etc.
  price:          number;        // giá / đơn vị
  deliveryTime:   number;        // ngày giao hàng
  historyScore?:  number;        // 0.0–1.0 từ lịch sử hợp tác
  timestamp:      number;
}

export interface SupplierScore {
  supplierId:  string;
  score:       number;    // 0.0–1.0
  approved:    boolean;
  riskLevel:   'low' | 'medium' | 'high';
  flags:       string[];
  confidence:  number;
}

export class SupplierEngine {
  evaluate(input: SupplierInput): SupplierScore {
    const flags: string[] = [];
    let score = 1.0;

    // 1. Nguồn gốc không rõ
    if (!input.certification) {
      flags.push('Không có chứng chỉ nguồn gốc');
      score -= 0.3;
    }

    // 2. Purity mismatch — vàng phải có purity
    if (input.type === 'gold') {
      if (!input.purity) {
        flags.push('Vàng không có thông số purity');
        score -= 0.25;
      } else if (input.purity < 0.585 || input.purity > 0.999) {
        flags.push(`Purity ${(input.purity * 100).toFixed(1)}% bất thường`);
        score -= 0.2;
      }
    }

    // 3. Lịch sử xấu
    if ((input.historyScore ?? 1.0) < 0.5) {
      flags.push(`History score ${input.historyScore?.toFixed(2)} thấp`);
      score -= 0.2;
    }

    // 4. Delivery time bất thường
    if (input.deliveryTime > 14) {
      flags.push(`Thời gian giao hàng ${input.deliveryTime} ngày quá dài`);
      score -= 0.1;
    }

    // 5. Giá bất thường (quá thấp so với thị trường → nghi ngờ)
    if (input.type === 'gold' && input.price < 1_000_000) {
      flags.push(`Giá vàng ${input.price.toLocaleString()}đ/chỉ quá thấp — nghi ngờ hàng giả`);
      score -= 0.3;
    }

    score = Math.max(0, Math.min(1.0, score));
    const riskLevel: SupplierScore['riskLevel'] =
      score >= 0.7 ? 'low' : score >= 0.4 ? 'medium' : 'high';
    const approved   = score >= 0.6 && flags.length < 2;
    const confidence = Math.min(0.95, 0.6 + score * 0.35);

    if (riskLevel !== 'low') {
      EventBus.emit('cell.metric', {
        cell: 'supplier-cell', metric: 'supplier.risk',
        value: 1 - score, confidence,
        supplierId: input.id, type: input.type, flags: flags.length,
      });
    }

    return { supplierId: input.id, score, approved, riskLevel, flags, confidence };
  }
}
