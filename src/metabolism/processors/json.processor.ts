import { BaseProcessor } from "./base.processor"
import { ProcessorResult } from "../types"

export class JsonProcessor extends BaseProcessor {
  readonly type = "json" as const

  canProcess(filePath: string): boolean {
    return filePath.toLowerCase().endsWith(".json")
  }

  async process(filePath: string): Promise<ProcessorResult> {
    try {
      const fs = await import("fs/promises")
      const content = await fs.readFile(filePath, "utf-8")
      const parsed = JSON.parse(content)
      const data = Array.isArray(parsed) ? parsed : [parsed]
      return this.result(filePath, data)
    } catch (e) {
      return this.result(filePath, [], [`Parse error: ${e}`])
    }
  }
}
