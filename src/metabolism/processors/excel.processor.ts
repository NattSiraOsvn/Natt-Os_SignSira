import { BaseProcessor } from "./base.processor"
import { ProcessorResult } from "../types"

export class ExcelProcessor extends BaseProcessor {
  readonly type = "excel" as const

  canProcess(filePath: string): boolean {
    return /\.(xlsx|xls)$/i.test(filePath)
  }

  async process(filePath: string): Promise<ProcessorResult> {
    // Stub — cần thư viện xlsx khi deploy thật
    return this.result(filePath, [], [`Excel processor stub — file: ${filePath}`])
  }
}
