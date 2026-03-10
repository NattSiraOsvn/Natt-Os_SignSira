export type ProcessorType =
  | "csv" | "excel" | "json" | "pdf"
  | "image" | "video" | "3d-model"

export interface ProcessorResult {
  success: boolean
  processorType: ProcessorType
  sourceFile: string
  recordCount: number
  data: Record<string, unknown>[]
  errors: string[]
  processedAt: number
}

export interface NormalizerResult {
  success: boolean
  schema: string
  fields: string[]
  cleanedData: Record<string, unknown>[]
  warnings: string[]
}

export interface MetabolismEvent {
  type: "DataIngested" | "DataNormalized" | "DataAnomaly" | "ArchiveBridged"
  source: string
  payload: Record<string, unknown>
  timestamp: number
}
