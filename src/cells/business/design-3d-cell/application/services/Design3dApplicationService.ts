// @ts-nocheck
import { Design3dEngine, Design3dEvent } from "../../domain/services"
import { InMemorySkuModelRepository } from "../../infrastructure/repositories"
import { SkuModel } from "../../domain/entities"

export class Design3dApplicationService {
  private engine = new Design3dEngine()
  private repo = new InMemorySkuModelRepository()

  async createModel(
    skuId: string,
    modelPath: string,
    format: SkuModel["format"],
    spec: SkuModel["productionSpec"]
  ): Promise<Design3dEvent[]> {
    const { model, event } = this.engine.createSkuModel(skuId, modelPath, format, spec)
    await this.repo.save(model)
    const specEvent = this.engine.publishProductionSpec(model)
    return [event, specEvent]
  }

  async getModel(skuId: string): Promise<SkuModel | null> {
    return this.repo.findById(skuId)
  }

  async publishSpec(skuId: string): Promise<void> {
    const model = await this.repo.findById(skuId)
    if (!model) throw new Error(`[design-3d-cell] SKU not found: ${skuId}`)
    this.engine.publishProductionSpec(model)
  }

  async linkNaSi(skuId: string): Promise<void> {
    const model = await this.repo.findById(skuId)
    if (!model) throw new Error(`[design-3d-cell] SKU not found: ${skuId}`)
    await this.repo.save({ ...model, nasiLinked: true })
  }
}
