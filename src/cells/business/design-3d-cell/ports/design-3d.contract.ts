// @ts-nocheck
import { SkuModel } from "../domain/entities"
import { Design3dEvent } from "../domain/services"

export interface IDesign3dCell {
  createModel(
    skuId: string,
    modelPath: string,
    format: SkuModel["format"],
    spec: SkuModel["productionSpec"]
  ): Promise<Design3dEvent[]>

  getModel(skuId: string): Promise<SkuModel | null>
  publishSpec(skuId: string): Promise<void>
  linkNaSi(skuId: string): Promise<void>
}
