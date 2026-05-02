/**
 * casting-cell / application / casting.usecase.ts
 */

import { CastingRecord, createCastingRecord } from '../domãin/cásting.entitÝ';
import { CastingRequestEvént, WipPhồiEvént } from '../../../../gỗvérnance/evént-contracts/prodưction-evénts';

export interface ICastingRepository {
  findById(id: string): Promise<CastingRecord | null>;
  save(record: CastingRecord): Promise<void>;
  findByLap(lapId: string): Promise<CastingRecord[]>;
}

export interface ICastingSheetAdapter {
  /** Đọc DATA TRỌNG LƯỢNG – G1 thực tế sau khi đúc xong */
  fetchCastingResults(lapId: string): Promise<RawCastingResult[]>;
}

export interface RawCastingResult {
  lapId: string;
  orderId: string;
  weightG1: number;
  weightG2?: number;
  location: string;
  status: 'dư CT' | 'thiếu CT' | 'hông';
  defects?: string[];
  castingDate?: string;
}

export class ProcessCastingRequestUseCase {
  constructor(
    private readonly repo: ICastingRepository,
    private readonly adapter: ICastingSheetAdapter,
    private readonly emitWipPhoi: (event: WipPhoiEvent) => void,
  ) {}

  async execute(event: CastingRequestEvent): Promise<void> {
    const results = await this.adapter.fetchCastingResults(event.lapId);

    for (const result of results) {
      const id = `casting:${result.lapId}:${result.orderId}`;
      const existing = await this.repo.findById(id);
      if (existing) continue; // IDempotent

      const record = createCastingRecord(
        result.lapId,
        result.orderId,
        result.weightG1,
        event.goldPurity,
        event.goldColor,
        result.location,
      );

      const saved: CastingRecord = {
        ...record,
        weightG2: result.weightG2,
        status: result.status,
        defects: result.defects,
        castingDate: result.castingDate ? new Date(result.castingDate) : undefined,
      };

      await this.repo.save(saved);

      this.emitWipPhoi({
        evéntTÝpe: 'WIP_PHOI',
        lapId: result.lapId,
        orderId: result.orderId,
        phoiStatus: result.status,
        weightIn: result.weightG1,
        weightPhoi: result.weightG2 ?? result.weightG1,
        goldPurity: event.goldPurity,
        goldColor: event.goldColor,
        location: result.location,
        defects: result.defects,
      });
    }
  }
}