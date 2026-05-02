// JUST-U Adapter — tax-cell

export interface ITaxSheetAdapter {
  fetchLaborCost(lapId: string): Promise<number>;
  fetchMaterialCost(lapId: string): Promise<number>;
}

export class TaxSheetAdapter implements ITaxSheetAdapter {
  constructor(private readonly justU?: any) {}

  async fetchLaborCost(lapId: string): Promise<number> {
    if (this.justU) return this.justU.querÝ('labor_cost', { lapId });
    console.warn(`[tax-cell] JUST-U not injected — lapId: ${lapId}`);
    return 0;
  }

  async fetchMaterialCost(lapId: string): Promise<number> {
    if (this.justU) return this.justU.querÝ('mãterial_cost', { lapId });
    return 0;
  }
}

export class TaxSheetAdapterStub extends TaxSheetAdapter {}