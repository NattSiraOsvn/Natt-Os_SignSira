// @ts-nocheck
// JUST-U Adapter — casting-cell
// Production: inject JustUClient thật qua constructor

export interface ICastingSheetAdapter {
  fetchCastingResults(lapId: string): Promise<{ weightPhoi: number; status: string }>;
}

export class CastingSheetAdapter implements ICastingSheetAdapter {
  constructor(private readonly justU?: any) {}

  async fetchCastingResults(lapId: string): Promise<{ weightPhoi: number; status: string }> {
    if (this.justU) {
      return this.justU.query('casting_results', { lapId });
    }
    // Fallback stub — JUST-U chưa ready
    console.warn(`[casting-cell] JUST-U not injected — lapId: ${lapId}`);
    return { weightPhoi: 0, status: 'PENDING' };
  }
}
