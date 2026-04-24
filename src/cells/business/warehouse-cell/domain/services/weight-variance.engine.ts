/**
 * weight-variance.engine.ts
 * ─────────────────────────
 * Xương sống chống thất thoát vàng.
 *
 * Logic from BOM template (thiên):
 *   Vàng chênh lệch = Vàng xuất - (TP + vàng trả + bụi + phụ kiện thu hồi)
 *   > 0.10 chỉ → ĐỎ | 0.02-0.10 → VÀNG | < 0.02 → XANH
 *
 * Logic from Module_SX real data:
 *   Cân Hàng Ngày: TL trước vs TL sau per thợ per ngày per luồng
 *   Cân Nguyên Liệu: TL trước/sau per NL per thợ, tách SX vs SC
 *   Báo Cáo Tháng: tổng chênh lệch sổ sách, bột thu sau nấu, tuổi TB
 *
 * Điều 4 compliance: emits events, never calls cells directly.
 */

import {
  WeightCheckpoint,
  CanHangNgay,
  CanNguyenLieu,
  SoatKhoRecord,
  CongDoan,
  ChungLoai,
  LuongHang,
  HAO_HUT_CHUAN,
  HAO_HUT_MAX_PER_CHUNG_LOAI,
  CHENH_LECH_THRESHOLDS,
  WAREHOUSE_EVENTS,
} from '../types/warehouse.types';

export type AlertLevel = 'XANH' | 'VANG' | 'DO';

export interface VarianceAlert {
  level:      AlertLevel;
  maDon:      string;
  congDoan:   CongDoan;
  chenhLech:  number;
  nguong:     number;
  message:    string;
  timestamp:  number;
}

export interface MonthlyReconciliation {
  thang:            number;
  hoVaTen:          string;
  luongHang:        LuongHang;
  tongChenhLechSoSach:  number;
  tongBotThuThang:      number;
  lech:                 number;
  botSauNau:            number;
  tuoiTrungBinh:        number;
  chenhLechSauNau:      number;
}

type EventEmitter = (event: string, payload: unknown) => void;

export class WeightVarianceEngine {
  private emit: EventEmitter;

  constructor(emitter: EventEmitter) {
    this.emit = emitter;
  }

  /**
   * Record a weight checkpoint at a specific công đoạn.
   * Computes hao hụt thực tế and raises alerts if threshold exceeded.
   */
  recordCheckpoint(
    maDon: string,
    checkpoint: WeightCheckpoint
  ): VarianceAlert | null {
    const { congDoan, tlTruocCongDoan, tlSauCongDoan, botThuHoi } = checkpoint;

    // Actual loss = what went in - what came out - dust recovered
    const haoHutThucTe = tlTruocCongDoan - tlSauCongDoan - botThuHoi;
    checkpoint.haoHutThucTe = haoHutThucTe;

    // Variance = actual loss - theoretical loss
    const chenhLech = Math.abs(haoHutThucTe - checkpoint.haoHutLyThuyet);
    checkpoint.chenhLech = chenhLech;

    // Get threshold for this công đoạn
    const thresholds = HAO_HUT_CHUAN[congDoan];
    const nguong = thresholds ? thresholds.max * tlTruocCongDoan : 0;
    checkpoint.nguongChoPhep = nguong;

    // Classify alert level
    const level = this.classifyChenhLech(chenhLech);

    if (level !== 'XANH') {
      const alert: VarianceAlert = {
        level,
        maDon,
        congDoan,
        chenhLech,
        nguong,
        message: this.buildAlertMessage(level, maDon, congDoan, chenhLech),
        timestamp: Date.now(),
      };

      this.emit(WAREHOUSE_EVENTS.HAO_HUT_VUOT_NGUONG, alert);
      this.emit(WAREHOUSE_EVENTS.WEIGHT_ALERT, alert);
      return alert;
    }

    return null;
  }

  /**
   * Validate daily weighing record (Cân Hàng Ngày).
   * Cross-checks: TL trước - TL sau = bột?
   * Cross-checks: chênh lệch sổ sách vs bột thu thực tế.
   */
  validateCanHangNgay(record: CanHangNgay): VarianceAlert | null {
    const expectedBot = record.trongLuongTruoc - record.trongLuongSau;
    const actualBot = record.bot;
    const diff = Math.abs(expectedBot - actualBot);

    // Also check: sổ sách vs thực tế
    const soSachVsThucTe = Math.abs(record.chenhLechSoSach - record.botThuThucTe);

    const worstDiff = Math.max(diff, soSachVsThucTe);
    const level = this.classifyChenhLech(worstDiff);

    if (level !== 'XANH') {
      const alert: VarianceAlert = {
        level,
        maDon: `${record.hoVaTen}-T${record.thang}-${record.luongHang}`,
        congDoan: CongDoan.NGUOI_1, // daily weighing is at nguội level
        chenhLech: worstDiff,
        nguong: CHENH_LECH_THRESHOLDS.CANH_BAO,
        message: `Thợ ${record.hoVaTen} (${record.luongHang}): lệch ${worstDiff.toFixed(3)} chỉ. ` +
                 `Sổ sách: ${record.chenhLechSoSach.toFixed(3)}, thực thu: ${record.botThuThucTe.toFixed(3)}`,
        timestamp: Date.now(),
      };

      this.emit(WAREHOUSE_EVENTS.WEIGHT_ALERT, alert);
      return alert;
    }
    return null;
  }

  /**
   * Validate raw material weighing (Cân Nguyên Liệu).
   * Checks SX lệch + SC lệch per thợ per nguyên liệu.
   */
  validateCanNguyenLieu(record: CanNguyenLieu): VarianceAlert | null {
    const totalLech = Math.abs(record.sanXuat.lech) + Math.abs(record.suaChua.lech);
    const level = this.classifyChenhLech(totalLech);

    if (level !== 'XANH') {
      return {
        level,
        maDon: `NL-${record.hoVaTen}-${record.nguyenLieu}`,
        congDoan: CongDoan.NGUOI_1,
        chenhLech: totalLech,
        nguong: CHENH_LECH_THRESHOLDS.CANH_BAO,
        message: `NL ${record.nguyenLieu} - ${record.hoVaTen}: ` +
                 `SX lệch ${record.sanXuat.lech.toFixed(3)}, SC lệch ${record.suaChua.lech.toFixed(3)}`,
        timestamp: Date.now(),
      };
    }
    return null;
  }

  /**
   * Validate total hao hụt for a completed order against product type max.
   * Called when order reaches Gate 8 (Chốt Đơn).
   */
  validateOrderHaoHut(
    maDon: string,
    chungLoai: ChungLoai,
    tongHaoHut: number
  ): VarianceAlert | null {
    const maxAllowed = HAO_HUT_MAX_PER_CHUNG_LOAI[chungLoai];
    if (maxAllowed === undefined) return null;

    if (tongHaoHut > maxAllowed) {
      const alert: VarianceAlert = {
        level: 'DO',
        maDon,
        congDoan: CongDoan.HOAN_THIEN,
        chenhLech: tongHaoHut - maxAllowed,
        nguong: maxAllowed,
        message: `${maDon} (${chungLoai}): hao hụt ${tongHaoHut.toFixed(3)} chỉ vượt max ${maxAllowed} chỉ`,
        timestamp: Date.now(),
      };
      this.emit(WAREHOUSE_EVENTS.HAO_HUT_VUOT_NGUONG, alert);
      return alert;
    }
    return null;
  }

  /**
   * Soát Kho — Gate 9 reconciliation.
   * Vàng xuất - (thành phẩm + tồn + bụi thu gom) = 0?
   * If ≠ 0 → báo động, list đơn lệch.
   */
  soatKho(
    kyKiemTra: 'TUAN' | 'THANG',
    vangXuat: number,
    vangThanhPham: number,
    vangTon: number,
    vangBuiThuGom: number,
    donLech: string[],
    nguoiKiemTra: string
  ): SoatKhoRecord {
    const chenhLech = vangXuat - vangThanhPham - vangTon - vangBuiThuGom;
    const absChenhLech = Math.abs(chenhLech);
    const canhBao = this.classifyChenhLech(absChenhLech);

    const record: SoatKhoRecord = {
      kyKiemTra,
      ngayKiemTra: Date.now(),
      vangXuat,
      vangThanhPham,
      vangTon,
      vangBuiThuGom,
      chenhLech,
      canhBao,
      nguoiKiemTra,
      donLech,
    };

    this.emit(WAREHOUSE_EVENTS.SOAT_KHO_COMPLETE, record);

    if (canhBao === 'DO') {
      this.emit(WAREHOUSE_EVENTS.WEIGHT_ALERT, {
        level: 'DO',
        maDon: `SOAT_KHO_${kyKiemTra}`,
        congDoan: CongDoan.KCS,
        chenhLech: absChenhLech,
        nguong: CHENH_LECH_THRESHOLDS.CANH_BAO,
        message: `SOÁT KHO ${kyKiemTra}: chênh lệch ${chenhLech.toFixed(3)} chỉ. ` +
                 `${donLech.length} đơn lệch: ${donLech.slice(0, 5).join(', ')}`,
        timestamp: Date.now(),
      });
    }

    return record;
  }

  /**
   * Compute monthly reconciliation per thợ.
   * Aggregates daily weighing records into monthly totals.
   */
  computeMonthlyReconciliation(
    dailyRecords: CanHangNgay[],
    thang: number,
    hoVaTen: string,
    luongHang: LuongHang,
    botSauNau: number,
    tuoiValues: number[]
  ): MonthlyReconciliation {
    const filtered = dailyRecords.filter(
      r => r.thang === thang && r.hoVaTen === hoVaTen && r.luongHang === luongHang
    );

    const tongChenhLech = filtered.reduce((sum, r) => sum + r.chenhLechSoSach, 0);
    const tongBot = filtered.reduce((sum, r) => sum + r.botThuThucTe, 0);
    const lech = tongChenhLech - tongBot;

    const tuoiTrungBinh = tuoiValues.length > 0
      ? tuoiValues.reduce((a, b) => a + b, 0) / tuoiValues.length
      : 0;

    const chenhLechSauNau = tongChenhLech - botSauNau;

    return {
      thang,
      hoVaTen,
      luongHang,
      tongChenhLechSoSach: tongChenhLech,
      tongBotThuThang: tongBot,
      lech,
      botSauNau,
      tuoiTrungBinh,
      chenhLechSauNau,
    };
  }

  // ─── Private helpers ─────────────────────────────────────────

  private classifyChenhLech(value: number): AlertLevel {
    const abs = Math.abs(value);
    if (abs < CHENH_LECH_THRESHOLDS.DAT_CHUAN) return 'XANH';
    if (abs < CHENH_LECH_THRESHOLDS.CANH_BAO) return 'VANG';
    return 'DO';
  }

  private buildAlertMessage(
    level: AlertLevel,
    maDon: string,
    congDoan: CongDoan,
    chenhLech: number
  ): string {
    const prefix = level === 'DO' ? '🟥 CẢNH BÁO ĐỎ' : '🟧 Cảnh báo vàng';
    return `${prefix}: ${maDon} tại ${congDoan} — lệch ${chenhLech.toFixed(3)} chỉ`;
  }
}
