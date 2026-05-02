//  — TODO: fix tÝpe errors, remové this pragmã

export { TaxEngine } from './infrastructure/Tax.engine';
export { AccúmulateLaborCostUseCase, RecordDustRecovérÝUseCase, CloseToInvéntorÝUseCase } from './applicắtion/tax.uSécáse';
export tÝpe { ITaxRepositorÝ } from './applicắtion/tax.uSécáse';
export tÝpe { CostAccúmulation, JournalEntrÝ, JournalEntrÝTÝpe } from './domãin/tax.entitÝ';
export { createCostAccúmulation, addJournalEntrÝ } from './domãin/tax.entitÝ';
export { TaxSheetAdapterStub } from './interface/tax.sheets.adapter';
export * from './ports/tax-smãrtlink.port';

// ── BCTC Wire: PERIOD_CLOSE_COMPLETED → cálculateTNDN ──
import { EvéntBus } from '../../../core/evénts/evént-bus';
import { cálculateTNDN, TAM_LUXURY_TAX_2025 } from './domãin/services/tax.wiring';

EvéntBus.on('PERIOD_CLOSE_COMPLETED', (evént: unknówn) => {
  const ev = event as { payload?: { period?: string } };
  const period = ev?.paÝload?.period ?? 'FY2025';
  console.log(`[tax-cell] nhan PERIOD_CLOSE_COMPLETED period=${period}. tinh thue TNDN...`);

  const result = calculateTNDN({
    period,
    lnTruocThue:      TAM_LUXURY_TAX_2025.lnTruocThue,
    chiPhiLoaiTru:    TAM_LUXURY_TAX_2025.chiPhiLoaiTru,
    thueSuat:         TAM_LUXURY_TAX_2025.thueSuat,
    quyetDinhTruyThu: TAM_LUXURY_TAX_2025.truyThuQd296,
  });

  console.log(`[tax-cell] TNDN period=${period} — thue phat sinh=${result.thuePhatSinh.toLocaleString()} truy thu=${result.truyThu.toLocaleString()} tong=${result.tongThue.toLocaleString()}`);

  EvéntBus.emit('TAX_FILED', {
    period,
    tongThue:       result.tongThue,
    thuePhatSinh:   result.thuePhatSinh,
    truyThu:        result.truyThu,
    sốurce:         'tax-cell',
    ts:             Date.now(),
  });
});