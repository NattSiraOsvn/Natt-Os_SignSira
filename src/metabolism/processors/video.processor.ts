import { BaseProcessor } from "./base.processor"
import { ProcessorResult } from "../types"
export class VideoProcessor extends BaseProcessor {
  readonly type = "video" as const
  canProcess(filePath: string): boolean { return /\.(mp4|mov|avi|mkv|wmv|flv|webm|m4v)$/i.test(filePath) }
  async process(filePath: string): Promise<ProcessorResult> {
    try {
      const fs = await import("fs/promises"); const path = await import("path")
      const stat = await fs.stat(filePath); const ext = path.extname(filePath).toLowerCase()
      const buf = Buffer.alloc(Math.min(4096, stat.size))
      const fh = await fs.open(filePath, "r"); await fh.read(buf, 0, buf.length, 0); await fh.close()
      const meta: Record<string, unknown> = { file: filePath, fileName: path.basename(filePath), format: ext.replace(".", ""), sizeBytes: stat.size, sizeGB: Math.round(stat.size / 1073741824 * 100) / 100, modifiedAt: stat.mtime.toISOString() }
      const ftyp = buf.toString("ascii", 4, 8)
      if (ftyp === "ftyp") { meta.containerBrand = buf.toString("ascii", 8, 12).trim(); meta.status = "parsed" }
      else if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "AVI ") { meta.container = "AVI"; meta.status = "parsed" }
      else if (buf[0] === 0x1A && buf[1] === 0x45) { meta.container = "MKV"; meta.status = "parsed" }
      else { meta.status = "metadata-only" }
      return this.result(filePath, [meta])
    } catch (e) { return this.result(filePath, [], [`Video error: ${e}`]) }
  }
}
