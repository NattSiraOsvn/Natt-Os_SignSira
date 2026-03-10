import { BaseProcessor } from "./base.processor"
import { ProcessorResult } from "../types"

export class ThreeDModelProcessor extends BaseProcessor {
  readonly type = "3d-model" as const

  canProcess(filePath: string): boolean {
    return /\.(stl|obj|3dm|step|stp)$/i.test(filePath)
  }

  async process(filePath: string): Promise<ProcessorResult> {
    // 664GB — ADN vật lý của từng SKU
    return this.result(filePath, [{ file: filePath, status: "queued", role: "sku-dna" }])
  }
}
