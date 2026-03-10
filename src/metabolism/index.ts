import { CsvProcessor } from "./processors/csv.processor"
import { JsonProcessor } from "./processors/json.processor"
import { ExcelProcessor } from "./processors/excel.processor"
import { PdfProcessor } from "./processors/pdf.processor"
import { ImageProcessor } from "./processors/image.processor"
import { VideoProcessor } from "./processors/video.processor"
import { ThreeDModelProcessor } from "./processors/threed-model.processor"
import { BaseProcessor } from "./processors/base.processor"
import { SchemaDetector } from "./normalizers/schema-detector"
import { DataCleanser } from "./normalizers/data-cleanser"
import { FieldMapper } from "./normalizers/field-mapper"
import { JewelrySchema } from "./normalizers/jewelry-schema"
import { SelfHealingLogger } from "./healing/self-healing-logger"
import { AutoOptimizer } from "./healing/auto-optimizer"
import { ArchiveBridge } from "./healing/archive-bridge"
import { ProcessorResult, MetabolismEvent } from "./types"

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
      new CsvProcessor(),
      new JsonProcessor(),
      new ExcelProcessor(),
      new PdfProcessor(),
      new ImageProcessor(),
      new VideoProcessor(),
      new ThreeDModelProcessor()
    ]
  }

  async ingest(filePath: string): Promise<ProcessorResult> {
    const processor = this.processors.find(p => p.canProcess(filePath))
    if (!processor) {
      this.logger.log(filePath, "No processor found", "skip")
      return {
        success: false,
        processorType: "json",
        sourceFile: filePath,
        recordCount: 0,
        data: [],
        errors: [`No processor for: ${filePath}`],
        processedAt: Date.now()
      }
    }

    const raw = await processor.process(filePath)
    if (!raw.success) {
      this.logger.log(filePath, raw.errors.join(", "), "logged")
      return raw
    }

    const cleaned = this.cleanser.cleanse(raw.data)
    const schema = this.detector.detect({ ...raw, data: cleaned })
    const mapped = this.mapper.map(schema, cleaned)

    return { ...raw, data: mapped, recordCount: mapped.length }
  }

  getHealingLogs() { return this.logger.getRecent() }
}

export const Metabolism = new MetabolismLayer()
