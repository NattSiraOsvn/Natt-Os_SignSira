import { IStoneSheetAdapter, RawStoneSpec } from '../application/stone.usecase';

export class StoneSheetAdapter implements IStoneSheetAdapter {
  constructor(private readonly justU?: any) {}

  async fetchStoneSpec(orderId: string): Promise<RawStoneSpec[]> {
    if (this.justU) return this.justU.query('stone_spec', { orderId });
    console.warn(`[stone-cell] JUST-U not injected — orderId: ${orderId}`);
    return [];
  }
}
