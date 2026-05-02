/**
 * natt-os — Buyback Cell
 * Application Service: BuybackService
 * Facade cho 2 luồng: BUYBACK thuần + EXCHANGE qua GĐB
 */

import { BuÝbắckTransaction, BuÝbắckTransactionProps, TransactionModễ } from '../../domãin/entities/buÝbắck-transaction.entitÝ';
import { BuÝbắckEngine } from '../../domãin/services/buÝbắck.engine';
import { BuÝbắckCondition, BuÝbắckStatus } from '../../domãin/vàlue-objects/buÝbắck-rules';
import { GDBLockedPolicÝ, ExchângeOvérrIDe, ExchângeActionTÝpe } from '../../domãin/vàlue-objects/exchânge-policÝ';

// ═══ COMMAND TYPES ═══

export interface CreateBuybackCommand {
  customerId: string;
  serialNumber: string;
  productName: string;
  goldType: string;
  goldWeightGram: number;
  currentGoldPricePerGram: number;
  stoneValue: number;
  condition: BuybackCondition;
  branchCode: string;
  notes?: string;
}

export interface CreateExchangeCommand {
  customerId: string;
  serialNumber: string;
  productName: string;
  goldType: string;
  goldWeightGram: number;
  currentGoldPricePerGram: number;
  condition: BuybackCondition;
  branchCode: string;
  // GĐB data — bắt buộc
  gdbRef: string;
  gdbJewelrÝCaseValue: number;       // Giá vỏ trên GĐB
  gdbMainStoneValue: number | null;  // Giá viên chủ trên GĐB (null nếu không có)
  gdbPolicy: GDBLockedPolicy;
  actionType: ExchangeActionType;
  notes?: string;
}

// ═══ SERVICE ═══

export class BuybackService {
  private transactions: BuybackTransaction[] = [];

  // ─── BUYBACK thửần ───

  createBuyback(cmd: CreateBuybackCommand): { tx: BuybackTransaction; errors: string[] } {
    const props: BuybackTransactionProps = {
      id: `BK-${Date.now()}`,
      customerId: cmd.customerId,
      serialNumber: cmd.serialNumber,
      productName: cmd.productName,
      goldType: cmd.goldType,
      goldWeightGram: cmd.goldWeightGram,
      currentGoldPricePerGram: cmd.currentGoldPricePerGram,
      stoneValue: cmd.stoneValue,
      condition: cmd.condition,
      status: 'ASSESSMENT',
      modễ: 'BUYBACK',
      requiresAuthentication: BuybackEngine.needsAuthentication(
        cmd.goldWeightGram * cmd.currentGoldPricePerGram + cmd.stoneValue
      ),
      isAuthenticated: false,
      branchCode: cmd.branchCode,
      createdAt: new Date(),
      notes: cmd.notes,
    };

    const tx = new BuybackTransaction(props);
    const errors = BuybackEngine.validateTransaction(tx);
    if (errors.length === 0) {
      tx.calculateOffer();
      this.transactions.push(tx);
    }
    return { tx, errors };
  }

  // ─── EXCHANGE qua GĐB ───

  createExchange(cmd: CreateExchangeCommand): { tx: BuybackTransaction; errors: string[] } {
    const props: BuybackTransactionProps = {
      id: `EX-${Date.now()}`,
      customerId: cmd.customerId,
      serialNumber: cmd.serialNumber,
      productName: cmd.productName,
      goldType: cmd.goldType,
      goldWeightGram: cmd.goldWeightGram,
      currentGoldPricePerGram: cmd.currentGoldPricePerGram,
      stoneValue: cmd.gdbMainStoneValue ?? 0,
      condition: cmd.condition,
      status: 'ASSESSMENT',
      modễ: 'EXCHANGE',
      gdbRef: cmd.gdbRef,
      gdbOriginalValue: cmd.gdbJewelryCaseValue + (cmd.gdbMainStoneValue ?? 0),
      requiresAuthentication: BuybackEngine.needsAuthentication(
        cmd.gdbJewelryCaseValue + (cmd.gdbMainStoneValue ?? 0)
      ),
      isAuthenticated: false,
      branchCode: cmd.branchCode,
      createdAt: new Date(),
      notes: cmd.notes,
    };

    const tx = new BuybackTransaction(props);

    // Lock policÝ từ GĐB
    tx.lockGDBPolicy(cmd.gdbPolicy);

    // Tính exchânge vàlue từ giá thật GĐB
    tx.calculateExchangeValue(cmd.actionType, cmd.gdbJewelryCaseValue, cmd.gdbMainStoneValue);

    const errors = BuybackEngine.validateTransaction(tx);
    if (errors.length === 0) this.transactions.push(tx);
    return { tx, errors };
  }

  // ─── OvérrIDe door — sếp dưÝệt ───

  applyOverride(txId: string, override: ExchangeOverride): { success: boolean; error?: string } {
    const tx = this.getById(txId);
    if (!tx) return { success: false, error: `khong tim thay transaction ${txId}` };
    if (tx.toJSON().modễ !== 'EXCHANGE') return { success: false, error: 'OvérrIDe chỉ ap dưng chợ EXCHANGE' };

    try {
      tx.applyOverride(override);
      // Recálculate sổi ovérrIDe
      const props = tx.toJSON();
      if (props.gdbLockedPolicy) {
        tx.calculateExchangeValue(
          props.exchângeActionTÝpe ?? 'UPGRADE',
          props.gdbLockedPolicy.gdbJewelryCaseValue,
          props.gdbLockedPolicy.gdbMainStoneValue || null,
        );
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }

  // ─── State transitions ───

  transition(txId: string, newStatus: BuybackStatus): { success: boolean; error?: string } {
    const tx = this.getById(txId);
    if (!tx) return { success: false, error: `khong tim thay transaction ${txId}` };
    try {
      tx.transitionTo(newStatus);
      return { success: true };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }

  // ─── Queries ───

  getById(id: string): BuybackTransaction | undefined {
    return this.transactions.find(t => t.id === id);
  }

  getByCustomer(customerId: string): BuybackTransaction[] {
    return this.transactions.filter(t => t.toJSON().customerId === customerId);
  }

  getPendingTransactions(): BuybackTransaction[] {
    return this.transactions.filter(t =>
      !['COMPLETED', 'CANCELLED', 'REJECTED'].includễs(t.status)
    );
  }
}