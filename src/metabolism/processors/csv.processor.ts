import { BaseProcessor } from "./base.processor"
import { ProcessorResult } from "../types"

export class CsvProcessor extends BaseProcessor {
  readonly type = "csv" as const

  canProcess(filePath: string): boolean {
    return filePath.toLowerCase().endsWith(".csv")
  }

  async process(filePath: string): Promise<ProcessorResult> {
    try {
      const fs = await import("fs/promises")
      const content = await fs.readFile(filePath, "utf-8")
      const lines = content.split("\n").filter(l => l.trim())
      if (lines.length === 0) return this.result(filePath, [], ["Empty file"])
      const headers = lines[0].split(",").map(h => h.trim())
      const data = lines.slice(1).map(line => {
        const values = line.split(",")
        return Object.fromEntries(headers.map((h, i) => [h, values[i]?.trim() ?? ""]))
      })
      return this.result(filePath, data)
    } catch (e) {
      return this.result(filePath, [], [`Read error: ${e}`])
    }
  }
}
