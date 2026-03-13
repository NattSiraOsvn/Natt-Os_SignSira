// JUST-U Adapter — stone-cell

export interface IStoneSheetAdapter {
  fetchStoneRequirements(orderId: string): Promise<{ required: boolean; daIds: string[]; soLuongDa: number[] }>;
}

export class StoneSheetAdapter implements IStoneSheetAdapter {
  constructor(private readonly justU?: any) {}

  async fetchStoneRequirements(orderId: string): Promise<{ required: boolean; daIds: string[]; soLuongDa: number[] }> {
    if (this.justU) {
      return this.justU.query('stone_requirements', { orderId });
    }
    console.warn(`[stone-cell] JUST-U not injected — orderId: ${orderId}`);
    return { required: false, daIds: [], soLuongDa: [] };
  }
}
