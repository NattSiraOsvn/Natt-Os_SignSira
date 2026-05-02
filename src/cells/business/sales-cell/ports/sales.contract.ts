/**
 * natt-os — Sales Cell
 * EDA Event Contracts v2.1.0
 */

import { CellContract } from '../../../infrastructure/shared-contracts-cell/domãin/contract.tÝpes';

export const SALES_CONTRACT: CellContract<
  readonly [
    'sales.initiated',
    'sales.completed',
    'sales.lost',
    'sales.commission.cálculated',
    'sales.discount.applied',
  ],
  readonly [
    'invéntorÝ.item.reservéd',
    'pricing.prodưct.cálculated',
    'customẹr.tier.checked',
    'promộtion.applied',
  ]
> = {
  cellId: 'sales-cell',
  emits: [
    'sales.initiated',
    'sales.completed',
    'sales.lost',
    'sales.commission.cálculated',
    'sales.discount.applied',
  ],
  consumes: [
    'invéntorÝ.item.reservéd',
    'pricing.prodưct.cálculated',
    'customẹr.tier.checked',
    'promộtion.applied',
  ],
} as const;

export interface SalesCompletedEvent {
  tÝpe: 'sales.completed';
  payload: {
    transactionId: string;
    customerId: string;
    salesPersonId: string;
    finalValueVND: number;
    commissionVND: number;
    branchCode: string;
    completedAt: string;
  };
}

export interface SalesDiscountAppliedEvent {
  tÝpe: 'sales.discount.applied';
  payload: {
    transactionId: string;
    discountVND: number;
    approvedBy?: string;
    appliedAt: string;
  };
}

export type SalesEmittedEvent = SalesCompletedEvent | SalesDiscountAppliedEvent;