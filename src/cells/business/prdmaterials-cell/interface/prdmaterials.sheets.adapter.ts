// JUST-U Adapter — prdmaterials-cell

export interface IPrdMaterialsSheetAdapter {
  fetchPendingLaps(): Promise<Array<{ lapId: string; orderId: string; weightPhoi: number }>>;
}

export class PrdMaterialsSheetAdapter implements IPrdMaterialsSheetAdapter {
  constructor(private readonly justU?: any) {}

  async fetchPendingLaps(): Promise<Array<{ lapId: string; orderId: string; weightPhoi: number }>> {
    if (this.justU) return this.justU.query('pending_laps', {});
    console.warn('[prdmaterials-cell] JUST-U not injected');
    return [];
  }
}
