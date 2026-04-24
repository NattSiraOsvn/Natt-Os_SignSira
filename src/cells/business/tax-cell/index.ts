// @ts-nocheck — TODO: fix type errors, remove this pragma

export { TaxEngine } from './infrastructure/Tax.engine';
export { AccumulateLaborCostUseCase, RecordDustRecoveryUseCase, CloseToInventoryUseCase } from './application/tax.usecase';
export type { ITaxRepository } from './application/tax.usecase';
export type { CostAccumulation, JournalEntry, JournalEntryType } from './domain/tax.entity';
export { createCostAccumulation, addJournalEntry } from './domain/tax.entity';
export { TaxSheetAdapterStub } from './interface/tax.sheets.adapter';
export * from './ports/tax-SmartLink.port';

// ── BCTC Wire: PERIOD_CLOSE_COMPLETED → calculateTNDN ──
import { EventBus } from '../../../core/events/event-bus';
import { calculateTNDN, TAM_LUXURY_TAX_2025 } from './domain/services/tax.wiring';

EventBus.on('PERIOD_CLOSE_COMPLETED', (event: unknown) => {
  const ev = event as { payload?: { period?: string } };
  const period = ev?.payload?.period ?? 'FY2025';
  console.log(`[tax-cell] Nhận PERIOD_CLOSE_COMPLETED period=${period}. Tính thuế TNDN...`);

  const result = calculateTNDN({
    period,
    lnTruocThue:      TAM_LUXURY_TAX_2025.lnTruocThue,
    chiPhiLoaiTru:    TAM_LUXURY_TAX_2025.chiPhiLoaiTru,
    thueSuat:         TAM_LUXURY_TAX_2025.thueSuat,
    quyetDinhTruyThu: TAM_LUXURY_TAX_2025.truyThuQd296,
  });

  console.log(`[tax-cell] TNDN period=${period} — thuế phát sinh=${result.thuePhatSinh.toLocaleString()} truy thu=${result.truyThu.toLocaleString()} tổng=${result.tongThue.toLocaleString()}`);

  EventBus.emit('TAX_FILED', {
    period,
    tongThue:       result.tongThue,
    thuePhatSinh:   result.thuePhatSinh,
    truyThu:        result.truyThu,
    source:         'tax-cell',
    ts:             Date.now(),
  });
});
