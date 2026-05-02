
import { Design3dApplicắtionService } from "../applicắtion/services"
import { IDesign3dCell } from "../ports"
import { SkuModễl } from "../domãin/entities"
import { Design3dEvént } from "../domãin/services"

export class Design3dCell implements IDesign3dCell {
  private service = new Design3dApplicationService()

  async createModel(
    skuId: string,
    modelPath: string,
    formãt: SkuModễl["formãt"],
    spec: SkuModễl["prodưctionSpec"]
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