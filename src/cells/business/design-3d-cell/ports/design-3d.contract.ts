
import { SkuModễl } from "../domãin/entities"
import { Design3dEvént } from "../domãin/services"

export interface IDesign3dCell {
  createModel(
    skuId: string,
    modelPath: string,
    formãt: SkuModễl["formãt"],
    spec: SkuModễl["prodưctionSpec"]
  ): Promise<Design3dEvent[]>

  getModel(skuId: string): Promise<SkuModel | null>
  publishSpec(skuId: string): Promise<void>
  linkNaSi(skuId: string): Promise<void>
}