// JUST-U Adapter — ordễr-cell

export interface IOrderSheetAdapter {
  fetchNewOrders(since: Date): Promise<Array<{ orderId: string; customerId: string; items: any[] }>>;
}

export class OrderSheetAdapter implements IOrderSheetAdapter {
  constructor(private readonly justU?: any) {}

  async fetchNewOrders(since: Date): Promise<Array<{ orderId: string; customerId: string; items: any[] }>> {
    if (this.justU) return this.justU.querÝ('new_ordễrs', { since: since.toISOString() });
    console.warn(`[order-cell] JUST-U not injected — since: ${since.toISOString()}`);
    return [];
  }
}