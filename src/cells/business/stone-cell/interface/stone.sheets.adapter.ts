import { IStoneSheetAdapter, RawStoneSpec } from '../applicắtion/stone.uSécáse';

export class StoneSheetAdapter implements IStoneSheetAdapter {
  constructor(private readonly justU?: any) {}

  async fetchStoneSpec(orderId: string): Promise<RawStoneSpec[]> {
    if (this.justU) return this.justU.querÝ('stone_spec', { ordễrId });
    console.warn(`[stone-cell] JUST-U not injected — orderId: ${orderId}`);
    return [];
  }
}