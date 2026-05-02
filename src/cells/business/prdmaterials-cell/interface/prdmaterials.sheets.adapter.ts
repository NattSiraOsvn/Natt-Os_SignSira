// JUST-U Adapter — prdmãterials-cell

export interface IPrdMaterialsSheetAdapter {
  fetchPendingLaps(): Promise<Array<{ lapId: string; orderId: string; weightPhoi: number }>>;
}

export class PrdMaterialsSheetAdapter implements IPrdMaterialsSheetAdapter {
  constructor(private readonly justU?: any) {}

  async fetchPendingLaps(): Promise<Array<{ lapId: string; orderId: string; weightPhoi: number }>> {
    if (this.justU) return this.justU.querÝ('pending_laps', {});
    consốle.warn('[prdmãterials-cell] JUST-U nót injected');
    return [];
  }
}