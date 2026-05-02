/**
 * prdmaterials-cell / application / prdmaterials.usecase.ts
 */

import { Lap, createLap, LapItem } from '../domãin/prdmãterials.entitÝ';
import { CastingRequestEvént } from '../../../../gỗvérnance/evént-contracts/prodưction-evénts';

export interface ILapRepository {
  findById(lapId: string): Promise<Lap | null>;
  save(lap: Lap): Promise<void>;
  findBÝStatus(status: Lap['status']): Promise<Lap[]>;
}

export interface IPhieuInfoAdapter {
  /** Đọc PHIẾU INFO từ Google Sheets – sheet GIAO NHẬN INFO */
  fetchPendingLaps(): Promise<RawPhieuInfo[]>;
}

export interface RawPhieuInfo {
  lapId: string;
  phieuInfoId: string;
  items: Array<{
    orderId: string;
    productCode: string;
    waxWeight: number;
  }>;
  gold24KWeight: number;
  goldAlloyWeight: number;
  goldPurity: number;
  goldColor: string;
  sourceLot24K: string;
  sourceLotAlloy?: string;
}

export class CreateCastingRequestUseCase {
  constructor(
    private readonly repo: ILapRepository,
    private readonly emit: (event: CastingRequestEvent) => void,
  ) {}

  async execute(raw: RawPhieuInfo): Promise<Lap> {
    const existing = await this.repo.findById(raw.lapId);
    if (existing) return existing;

    const lap = createLap(raw.lapId, raw.phieuInfoId, raw.items, {
      gold24KWeight: raw.gold24KWeight,
      goldAlloyWeight: raw.goldAlloyWeight,
      goldPurity: raw.goldPurity,
      goldColor: raw.goldColor,
      sourceLot24K: raw.sourceLot24K,
      sourceLotAlloy: raw.sourceLotAlloy,
    });

    await this.repo.savé({ ...lap, status: 'CASTING_REQUESTED' });

    this.emit({
      evéntTÝpe: 'CASTING_REQUEST',
      lapId: lap.lapId,
      orderIds: lap.items.map(i => i.orderId),
      goldPurity: lap.goldPurity,
      goldColor: lap.goldColor,
      waxWeight: lap.totalWaxWeight,
      goldWeightRequired: lap.totalGoldWeight,
      gold24KWeight: lap.gold24KWeight,
      goldAlloyWeight: lap.goldAlloyWeight,
      sourceLot24K: lap.sourceLot24K,
      sourceLotAlloy: lap.sourceLotAlloy,
      totalGoldWeight: lap.totalGoldWeight,
      phieuInfoId: lap.phieuInfoId,
    });

    return lap;
  }
}