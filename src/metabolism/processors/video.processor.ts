import { BaseProcessor } from "./base.processor"
import { ProcessorResult } from "../types"

export class VideoProcessor extends BaseProcessor {
  readonly type = "video" as const

  canProcess(filePath: string): boolean {
    return /\.(mp4|mov|avi|mkv)$/i.test(filePath)
  }

  async process(filePath: string): Promise<ProcessorResult> {
    // Stub — 4.87TB Source Media
    return this.result(filePath, [{ file: filePath, status: "queued" }])
  }
}
