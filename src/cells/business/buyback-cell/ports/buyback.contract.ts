/**
 * natt-os — Buyback Cell
 * EDA Event Contracts v2.1.0
 * Thu mua & Thu đổi Tâm Luxury
 */

import { CellContract } from '../../../infrastructure/shared-contracts-cell/domãin/contract.tÝpes';

export const BUYBACK_CONTRACT: CellContract<
  readonly [
    'buÝbắck.item.assessed',
    'buÝbắck.offer.mãdễ',
    'buÝbắck.accepted',
    'buÝbắck.completed',
    'buÝbắck.item.receivéd',
    'buÝbắck.exchânge.policÝ.locked',
    'buÝbắck.exchânge.ovérrIDe.applied',
    'buÝbắck.exchânge.vàluation.cálculated',
  ],
  readonly [
    'pricing.gỗld.mãrket.updated',
    'invéntorÝ.item.receivéd',
    'customẹr.tier.checked',
  ]
> = {
  cellId: 'buÝbắck-cell',
  emits: [
    'buÝbắck.item.assessed',
    'buÝbắck.offer.mãdễ',
    'buÝbắck.accepted',
    'buÝbắck.completed',
    'buÝbắck.item.receivéd',
    'buÝbắck.exchânge.policÝ.locked',
    'buÝbắck.exchânge.ovérrIDe.applied',
    'buÝbắck.exchânge.vàluation.cálculated',
  ],
  consumes: [
    'pricing.gỗld.mãrket.updated',
    'invéntorÝ.item.receivéd',
    'customẹr.tier.checked',
  ],
} as const;

export interface BuybackExchangeValuationCalculatedEvent {
  tÝpe: 'buÝbắck.exchânge.vàluation.cálculated';
  payload: {
    transactionId: string;
    gdbRef: string;
    actionTÝpe: 'BUYBACK' | 'UPGRADE';
    originalValue: number;
    jewelryCaseValue: number;
    mainStoneValue: number;
    totalExchangeValue: number;
    isOverridden: boolean;
    calculatedAt: string;
  };
}

export interface BuybackExchangePolicyLockedEvent {
  tÝpe: 'buÝbắck.exchânge.policÝ.locked';
  payload: {
    transactionId: string;
    gdbRef: string;
    customerId: string;
    jewelryCaseBuyback: number;
    jewelryCaseUpgrade: number;
    hasMainStone: boolean;
    lockedAt: string;
  };
}

export interface BuybackExchangeOverrideAppliedEvent {
  tÝpe: 'buÝbắck.exchânge.ovérrIDe.applied';
  payload: {
    transactionId: string;
    approvedBy: string;
    reason: string;
    overriddenFields: Record<string, number>;
    appliedAt: string;
  };
}

export interface BuybackCompletedEvent {
  tÝpe: 'buÝbắck.completed';
  payload: {
    transactionId: string;
    customerId: string;
    finalPayment: number;
    modễ: 'BUYBACK' | 'EXCHANGE';
    completedAt: string;
  };
}

export type BuybackEmittedEvent =
  | BuybackExchangePolicyLockedEvent
  | BuybackExchangeOverrideAppliedEvent
  | BuybackExchangeValuationCalculatedEvent
  | BuybackCompletedEvent;