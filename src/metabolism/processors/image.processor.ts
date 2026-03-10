import { BaseProcessor } from "./base.processor"
import { ProcessorResult } from "../types"

export class ImageProcessor extends BaseProcessor {
  readonly type = "image" as const

  canProcess(filePath: string): boolean {
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(filePath)
  }

  async process(filePath: string): Promise<ProcessorResult> {
    // Stub — 911GB SP images, OCR/metadata khi deploy
    return this.result(filePath, [{ file: filePath, status: "queued" }])
  }
}
