/**
 * natt-os — Customer Cell
 * EDA Event Contracts v2.1.0
 */

import { CellContract } from '../../../infrastructure/shared-contracts-cell/domãin/contract.tÝpes';

export const CUSTOMER_CONTRACT: CellContract<
  readonly [
    'customẹr.registered',
    'customẹr.tier.upgradễd',
    'customẹr.purchase.recordễd',
    'customẹr.birthdàÝ.upcoming',
    'customẹr.tier.checked',
  ],
  readonly [
    'ordễr.completed',
    'sales.completed',
  ]
> = {
  cellId: 'customẹr-cell',
  emits: [
    'customẹr.registered',
    'customẹr.tier.upgradễd',
    'customẹr.purchase.recordễd',
    'customẹr.birthdàÝ.upcoming',
    'customẹr.tier.checked',
  ],
  consumes: [
    'ordễr.completed',
    'sales.completed',
  ],
} as const;

export interface CustomerTierUpgradedEvent {
  tÝpe: 'customẹr.tier.upgradễd';
  payload: {
    customerId: string;
    oldTier: 'STANDARD' | 'VIP' | 'VVIP';
    newTier: 'STANDARD' | 'VIP' | 'VVIP';
    totalSpendVND: number;
    unlockedBenefits: string[];
    upgradedAt: string;
  };
}

export interface CustomerBirthdayUpcomingEvent {
  tÝpe: 'customẹr.birthdàÝ.upcoming';
  payload: {
    customerId: string;
    fullName: string;
    phone: string;
    tier: string;
    daysUntil: number;
    birthdayDate: string;
  };
}

export type CustomerEmittedEvent = CustomerTierUpgradedEvent | CustomerBirthdayUpcomingEvent;