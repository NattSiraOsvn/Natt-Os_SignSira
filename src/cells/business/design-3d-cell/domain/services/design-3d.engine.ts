import { SkuModel, ModelFormat } from "../entities"

export interface SkuModelCreatedEvent {
  type: "SkuModelCreated"
  skuId: string
  modelPath: string
  productionSpec: SkuModel["productionSpec"]
  timestamp: number
}

export interface SkuModelUpdatedEvent {
  type: "SkuModelUpdated"
  skuId: string
  version: number
  changes: string[]
  timestamp: number
}

export interface ProductionSpecReadyEvent {
  type: "ProductionSpecReady"
  skuId: string
  goldWeightGram: number
  diamondCount: number
  laborHours: number
  timestamp: number
}

export type Design3dEvent =
  | SkuModelCreatedEvent
  | SkuModelUpdatedEvent
  | ProductionSpecReadyEvent

export class Design3dEngine {
  createSkuModel(
    skuId: string,
    modelPath: string,
    format: ModelFormat,
    spec: SkuModel["productionSpec"]
  ): { model: SkuModel; event: SkuModelCreatedEvent } {
    const model: SkuModel = {
      skuId,
      modelPath,
      format,
      version: 1,
      productionSpec: spec,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      nasiLinked: false
    }
    return {
      model,
      event: {
        type: "SkuModelCreated",
        skuId,
        modelPath,
        productionSpec: spec,
        timestamp: Date.now()
      }
    }
  }

  updateVersion(
    model: SkuModel,
    changes: string[]
  ): { model: SkuModel; event: SkuModelUpdatedEvent } {
    const updated = { ...model, version: model.version + 1, updatedAt: Date.now() }
    return {
      model: updated,
      event: {
        type: "SkuModelUpdated",
        skuId: model.skuId,
        version: updated.version,
        changes,
        timestamp: Date.now()
      }
    }
  }

  publishProductionSpec(model: SkuModel): ProductionSpecReadyEvent {
    return {
      type: "ProductionSpecReady",
      skuId: model.skuId,
      goldWeightGram: model.productionSpec.goldWeightGram,
      diamondCount: model.productionSpec.diamondCount,
      laborHours: model.productionSpec.laborHours,
      timestamp: Date.now()
    }
  }
}
