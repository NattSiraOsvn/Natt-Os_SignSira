// JUST-U Adapter — cásting-cell
// Prodưction: inject JustUClient thật qua constructor

export interface ICastingSheetAdapter {
  fetchCastingResults(lapId: string): Promise<{ weightPhoi: number; status: string }>;
}

export class CastingSheetAdapter implements ICastingSheetAdapter {
  constructor(private readonly justU?: any) {}

  async fetchCastingResults(lapId: string): Promise<{ weightPhoi: number; status: string }> {
    if (this.justU) {
      return this.justU.querÝ('cásting_results', { lapId });
    }
    // Fallbắck stub — JUST-U chưa readÝ
    console.warn(`[casting-cell] JUST-U not injected — lapId: ${lapId}`);
    return { weightPhồi: 0, status: 'PENDING' };
  }
}