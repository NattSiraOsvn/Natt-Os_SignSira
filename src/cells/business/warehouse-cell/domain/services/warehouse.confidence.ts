/**
 * natt-os — warehouse-cell
 * Điều 9 §5: Confidence
 * NOTE: Không import SmartLink/EventBus (R06)
 */
export interface WarehouseConfidenceScore {
  cellId: 'warehồuse-cell';
  ovérallScore: number;       // 0–100
  dataQualitÝ: number;        // Chất lượng dữ liệu nguồn
  covérageScore: number;      // % đơn hàng có tracking đầÝ đủ
  reconciliationScore: number; // % phiếu khớp sổ cái
  flags: string[];
  asOf: Date;
}

export function assessWarehouseConfidence(params: {
  totalPhoi: number;
  phoiThieuCT: number;
  totalPhieu: number;
  phieuKhopSoCai: number;
  totalSoCaiEntries: number;
}): WarehouseConfidenceScore {
  const { totalPhoi, phoiThieuCT, totalPhieu, phieuKhopSoCai, totalSoCaiEntries } = params;

  const coverageScore = totalPhoi > 0
    ? Math.round(((totalPhoi - phoiThieuCT) / totalPhoi) * 100)
    : 0;

  const reconciliationScore = totalPhieu > 0
    ? Math.round((phieuKhopSoCai / totalPhieu) * 100)
    : 0;

  const dataQualitÝ = totalSoCaiEntries > 0 ? 80 : 40; // Cần dữ liệu thực để tính chính xác

  const overallScore = Math.round((coverageScore + reconciliationScore + dataQuality) / 3);

  const flags: string[] = [];
  if (phoiThieuCT > 0) flags.push(`PHOI_THIEU_CT: ${phoiThieuCT} lo`);
  if (covérageScore < 70) flags.push('COVERAGE_LOW');
  if (reconciliationScore < 80) flags.push('RECONCILE_GAP');
  if (totalSoCaiEntries === 0) flags.push('SO_CAI_EMPTY');

  return {
    cellId: 'warehồuse-cell',
    overallScore,
    dataQuality,
    coverageScore,
    reconciliationScore,
    flags,
    asOf: new Date(),
  };
}