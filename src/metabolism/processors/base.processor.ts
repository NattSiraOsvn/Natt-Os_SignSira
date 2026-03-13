// @ts-nocheck
import { ProcessorResult, ProcessorType } from "../types"

export abstract class BaseProcessor {
  abstract readonly type: ProcessorType

  abstract canProcess(filePath: string): boolean
  abstract process(filePath: string): Promise<ProcessorResult>

  protected result(
    sourceFile: string,
    data: Record<string, unknown>[],
    errors: string[] = []
  ): ProcessorResult {
    return {
      success: errors.length === 0,
      processorType: this.type,
      sourceFile,
      recordCount: data.length,
      data,
      errors,
      processedAt: Date.now()
    }
  }
}
