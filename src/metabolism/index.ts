import { CsvProcessor } from "./processors/csv.processor"
import { JsonProcessor } from "./processors/json.processor"
import { ExcelProcessor } from "./processors/excel.processor"
import { PdfProcessor } from "./processors/pdf.processor"
import { ImageProcessor } from "./processors/image.processor"
import { VideoProcessor } from "./processors/video.processor"
import { ThreeDModelProcessor } from "./processors/threed-model.processor"
import { ArchiveProcessor } from "./processors/archive.processor"
import { BaseProcessor } from "./processors/base.processor"
import { SchemaDetector } from "./normalizers/schema-detector"
import { DataCleanser } from "./normalizers/data-cleanser"
import { FieldMapper } from "./normalizers/field-mapper"
import { JewelrySchema } from "./normalizers/jewelry-schema"
import { SelfHealingLogger } from "./healing/self-healing-logger"
import { AutoOptimizer } from "./healing/auto-optimizer"
import { ArchiveBridge } from "./healing/archive-bridge"
import { ProcessorResult, MetabolismEvent } from "./types"
import { EventBus } from "@/core/events/event-bus"

export * from "./types"
export * from "./processors"
export * from "./normalizers"
export * from "./healing"

export class MetabolismLayer {
  private processors: BaseProcessor[]
  private detector = new SchemaDetector()
  private cleanser = new DataCleanser()
  private mapper = new FieldMapper()
  private jewelry = new JewelrySchema()
  private logger = new SelfHealingLogger()
  private optimizer = new AutoOptimizer()
  readonly archiveBridge = new ArchiveBridge()

  constructor() {
    this.processors = [
      new CsvProcessor(), new JsonProcessor(), new ExcelProcessor(), new PdfProcessor(),
      new ImageProcessor(), new VideoProcessor(), new ThreeDModelProcessor(), new ArchiveProcessor(),
    ]
    this.archiveBridge.onEvent((event) => {
      EventBus.publish({ type: event.type as any, payload: event.payload }, "metabolism-layer", undefined)
    })
  }

  async ingest(filePath: string): Promise<ProcessorResult> {
    const processor = this.processors.find(p => p.canProcess(filePath))
    if (!processor) {
      this.logger.log(filePath, "No processor found", "skip")
      this.publishEvent({ type: "ProcessorError", source: "metabolism-layer", payload: { file: filePath, error: "No processor found" }, timestamp: Date.now() })
      return { success: false, processorType: "json", sourceFile: filePath, recordCount: 0, data: [], errors: [`No processor for: ${filePath}`], processedAt: Date.now() }
    }
    const raw = await processor.process(filePath)
    if (!raw.success) {
      this.logger.log(filePath, raw.errors.join(", "), "logged")
      this.publishEvent({ type: "ProcessorError", source: "metabolism-layer", processorType: raw.processorType, payload: { file: filePath, errors: raw.errors }, timestamp: Date.now() })
      return raw
    }
    if (raw.processorType === "csv" || raw.processorType === "json" || raw.processorType === "excel") {
      const cleaned = this.cleanser.cleanse(raw.data); const schema = this.detector.detect({ ...raw, data: cleaned }); const mapped = this.mapper.map(schema, cleaned)
      this.publishEvent({ type: "DataNormalized", source: "metabolism-layer", processorType: raw.processorType, payload: { file: filePath, schema, recordCount: mapped.length }, timestamp: Date.now() })
      return { ...raw, data: mapped, recordCount: mapped.length }
    }
    this.publishEvent({ type: "DataIngested", source: "metabolism-layer", processorType: raw.processorType, cellTarget: this.routeToCell(raw), payload: { file: filePath, recordCount: raw.recordCount }, timestamp: Date.now() })
    return raw
  }

  async batchIngest(filePaths: string[]): Promise<ProcessorResult[]> {
    const results: ProcessorResult[] = []; for (const fp of filePaths) results.push(await this.ingest(fp))
    return this.optimizer.optimize(results)
  }

  private routeToCell(result: ProcessorResult): string {
    const data = result.data[0] as Record<string, unknown> | undefined
    switch (result.processorType) {
      case "3d-model": return "design-3d-cell"
      case "image": return data?.category === "warranty-doc" ? "warranty-cell" : data?.category === "product-photo" ? "inventory-cell" : "media-cell"
      case "video": return "media-cell"
      case "pdf": return data?.docType === "warranty-certificate" ? "warranty-cell" : data?.docType === "invoice" ? "finance-cell" : "audit-cell"
      default: return "audit-cell"
    }
  }

  private publishEvent(event: MetabolismEvent): void {
    EventBus.publish({ type: event.type as any, payload: event.payload }, "metabolism-layer", undefined)
  }

  getHealingLogs() { return this.logger.getRecent() }
  getProcessorTypes(): string[] { return this.processors.map(p => p.type) }
}

export const Metabolism = new MetabolismLayer()
