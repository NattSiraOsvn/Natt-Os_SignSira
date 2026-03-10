import { Design3dApplicationService } from "../application/services"
import { IDesign3dCell } from "../ports"
import { SkuModel } from "../domain/entities"
import { Design3dEvent } from "../domain/services"

export class Design3dCell implements IDesign3dCell {
  private service = new Design3dApplicationService()

  async createModel(
    skuId: string,
    modelPath: string,
    format: SkuModel["format"],
    spec: SkuModel["productionSpec"]
  ): Promise<Design3dEvent[]> {
    return this.service.createModel(skuId, modelPath, format, spec)
  }

  async getModel(skuId: string): Promise<SkuModel | null> {
    return this.service.getModel(skuId)
  }

  async publishSpec(skuId: string): Promise<void> {
    return this.service.publishSpec(skuId)
  }

  async linkNaSi(skuId: string): Promise<void> {
    return this.service.linkNaSi(skuId)
  }
}
