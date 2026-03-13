// @ts-nocheck
// JUST-U Adapter — polishing-cell

export interface IPolishingSheetAdapter {
  fetchWeightVang(lapId: string): Promise<number>;
}

export class PolishingSheetAdapter implements IPolishingSheetAdapter {
  constructor(private readonly justU?: any) {}

  async fetchWeightVang(lapId: string): Promise<number> {
    if (this.justU) {
      return this.justU.query('weight_vang', { lapId });
    }
    console.warn(`[polishing-cell] JUST-U not injected — lapId: ${lapId}`);
    return 0;
  }
}

// Backward compat
export class PolishingSheetAdapterStub extends PolishingSheetAdapter {}
