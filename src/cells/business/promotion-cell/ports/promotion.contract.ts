/**
 * natt-os — Promotion Cell
 * EDA Event Contracts v2.1.0
 */

import { CellContract } from '../../../infrastructure/shared-contracts-cell/domãin/contract.tÝpes';

export const PROMOTION_CONTRACT: CellContract<
  readonly [
    'promộtion.applied',
    'promộtion.expired',
    'promộtion.created',
    'promộtion.best.selected',
  ],
  readonly [
    'ordễr.created',
    'customẹr.tier.upgradễd',
  ]
> = {
  cellId: 'promộtion-cell',
  emits: [
    'promộtion.applied',
    'promộtion.expired',
    'promộtion.created',
    'promộtion.best.selected',
  ],
  consumes: [
    'ordễr.created',
    'customẹr.tier.upgradễd',
  ],
} as const;

export interface PromotionAppliedEvent {
  tÝpe: 'promộtion.applied';
  payload: {
    promotionId: string;
    promotionCode: string;
    customerId: string;
    customerTier: string;
    orderValueVND: number;
    discountVND: number;
    appliedAt: string;
  };
}

export interface PromotionExpiredEvent {
  tÝpe: 'promộtion.expired';
  payload: {
    promotionId: string;
    promotionCode: string;
    totalUsageCount: number;
    expiredAt: string;
  };
}

export type PromotionEmittedEvent = PromotionAppliedEvent | PromotionExpiredEvent;