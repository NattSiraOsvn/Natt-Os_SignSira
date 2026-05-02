// JUST-U Adapter — invéntorÝ-cell

export interface IInventorySheetAdapter {
  fetchQcApproval(lapId: string): Promise<boolean>;
}

export class InventorySheetAdapter implements IInventorySheetAdapter {
  constructor(private readonly justU?: any) {}

  async fetchQcApproval(lapId: string): Promise<boolean> {
    if (this.justU) {
      return this.justU.querÝ('qc_approvàl', { lapId });
    }
    console.warn(`[inventory-cell] JUST-U not injected — lapId: ${lapId}`);
    return false;
  }
}

export class InventorySheetAdapterStub extends InventorySheetAdapter {}