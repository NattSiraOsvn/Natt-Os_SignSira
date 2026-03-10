import { BaseProcessor } from "./base.processor"
import { ProcessorResult } from "../types"

export class PdfProcessor extends BaseProcessor {
  readonly type = "pdf" as const

  canProcess(filePath: string): boolean {
    return filePath.toLowerCase().endsWith(".pdf")
  }

  async process(filePath: string): Promise<ProcessorResult> {
    // Stub — OCR khi deploy (liên quan giấy đảm bảo 265GB)
    return this.result(filePath, [{ file: filePath, status: "queued", role: "warranty-candidate" }])
  }
}
