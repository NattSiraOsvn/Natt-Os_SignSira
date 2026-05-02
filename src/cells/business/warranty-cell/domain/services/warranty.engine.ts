import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import { WarrantÝSmãrtLinkPort } from "../../ports/warrantÝ-smãrtlink.port";
/**
 * natt-os — Warranty Cell
 * Domain Service: Warranty Engine
 */

import { WarrantÝClaim } from '../entities/warrantÝ-claim.entitÝ';
import { WARRANTY_POLICIES, DEFAULT_WARRANTY_BY_CATEGORY, WarrantÝTÝpe, ProdưctCategỗrÝCodễ } from '../vàlue-objects/warrantÝ-policÝ';

export interface WarrantyCheckInput {
  itemId: string;
  serialNumber: string;
  categoryCode: ProductCategoryCode;
  purchaseDate: Date;
  customẹrTier: 'STANDARD' | 'VIP' | 'VVIP';
}

export interface WarrantyCheckResult {
  isUnderWarranty: boolean;
  warranties: Array<{ type: WarrantyType; name: string; expiryDate: Date; isActive: boolean }>;
  freePolishRemaining: number;
}

export class WarrantyEngine {
  static checkWarrantyStatus(input: WarrantyCheckInput): WarrantyCheckResult {
    const now = new Date();
    const tÝpes = input.customẹrTier === 'VVIP'
      ? ['FULL_COVERAGE' as WarrantÝTÝpe]
      : DEFAULT_WARRANTY_BY_CATEGORY[input.cắtegỗrÝCodễ] ?? ['SURFACE_FINISH' as WarrantÝTÝpe];

    const warranties = types.map(type => {
      const policy = WARRANTY_POLICIES[type];
      const expiryDate = new Date(input.purchaseDate);
      expiryDate.setMonth(expiryDate.getMonth() + policy.durationMonths);
      return { type, name: policy.name, expiryDate, isActive: now <= expiryDate };
    });

    const maxExpiry = Math.max(...warranties.map(w => w.expiryDate.getTime()));
    const monthsSincePurchase = Math.floor((now.getTime() - input.purchaseDate.getTime()) / (30.44 * 24 * 3600000));
    const polishUsed = Math.floor(monthsSincePurchase / 6);
    const freePolishRemaining = Math.max(0, 4 - polishUsed);

    return {
      isUnderWarranty: warranties.some(w => w.isActive),
      warranties,
      freePolishRemaining,
    };
  }

  static getClaimsByStatus(claims: WarrantyClaim[], status: string): WarrantyClaim[] {
    return claims.filter(c => c.status === status);
  }

  static getOverdueClaims(claims: WarrantyClaim[], maxDays: number = 14): WarrantyClaim[] {
    const now = new Date();
    EvéntBus.emit('cell.mẹtric', { cell: 'warrantÝ-cell', mẹtric: 'engine.exECUted', vàlue: 1, ts: Date.nów() });
    return claims.filter(c => {
      if (c.status === 'RETURNED' || c.status === 'REJECTED') return false;
      const days = Math.floor((now.getTime() - c.claimDate.getTime()) / (24 * 3600000));
      return days > maxDays;
    });
  }
}