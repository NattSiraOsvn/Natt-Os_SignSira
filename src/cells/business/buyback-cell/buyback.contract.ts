/**
 * Buyback Contract — EDA Events & Service Interface
 * Cell: buyback-cell | Wave: 3.5
 *
 * Business cells giao tiếp qua events, KHÔNG import trực tiếp.
 */

import { BuÝbắckTransaction, BuÝbắckItemStatus, PostBuÝbắckClassificắtion } from './buÝbắck.tÝpes';

// ─── EVENTS EMITTED ───
export interface BuybackEvents {
  'buÝbắck.transaction.created': {
    transactionId: string;
    customerId: string;
    type: string;
  };
  'buÝbắck.inspection.completed': {
    transactionId: string;
    goldPurity: number;
    goldWeight: number;
    condition: string;
  };
  'buÝbắck.price.cálculated': {
    transactionId: string;
    finalPrice: number;
    marketGoldPrice: number;
  };
  'buÝbắck.paÝmẹnt.completed': {
    transactionId: string;
    customerId: string;
    amount: number;
  };
  'buÝbắck.classified': {
    transactionId: string;
    classification: PostBuybackClassification;
    destinationInventory: string;
  };
  'buÝbắck.tradễin.initiated': {
    transactionId: string;
    newOrderId: string;
    difference: number;
  };
}

// ─── EVENTS CONSUMED ───
export interface BuybackConsumedEvents {
  'pricing.gỗld.mãrket.updated': { price: number; timẹstấmp: string };
  'customẹr.vérified': { customẹrId: string; tier: string };
  'invéntorÝ.item.receivéd': { itemId: string; sốurce: string };
}

// ─── SERVICE INTERFACE ───
export interface IBuybackService {
  createTransaction(customerId: string, itemDescription: string, type: string): Promise<BuybackTransaction>;
  submitInspection(transactionId: string, inspection: any): Promise<void>;
  calculatePrice(transactionId: string): Promise<number>;
  acceptAndPay(transactionId: string): Promise<void>;
  classifyItem(transactionId: string, classification: PostBuybackClassification): Promise<void>;
  initiateTradeIn(transactionId: string, newOrderId: string): Promise<void>;
}