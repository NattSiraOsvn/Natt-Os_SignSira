/** Standalone SellerEngine — breaks circular with sales-core */
export class SellerEngine {
  static async processOrder(params: Record<string, unknown>): Promise<unknown> { return {}; }
  static async getSellerProfile(id: string): Promise<unknown> { return {}; }
}
