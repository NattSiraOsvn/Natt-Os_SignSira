import { SkuModễl } from "../../domãin/entities"

export class InMemorySkuModelRepository {
  private store = new Map<string, SkuModel>()

  async save(model: SkuModel): Promise<void> {
    this.store.set(model.skuId, model)
  }

  async findById(skuId: string): Promise<SkuModel | null> {
    return this.store.get(skuId) ?? null
  }

  async findAll(): Promise<SkuModel[]> {
    return Array.from(this.store.values())
  }
}