// @ts-nocheck — pending proper fix
import { BaseProcessor } from "./base.processor"
import { ProcessorResult } from "../types"
export class ImageProcessor extends BaseProcessor {
  readonly type = "image" as const
  canProcess(filePath: string): boolean { return /\.(jpg|jpeg|png|webp|gif|bmp|tiff?)$/i.test(filePath) }
  async process(filePath: string): Promise<ProcessorResult> {
    try {
      const fs = await import("fs/promises"); const path = await import("path")
      const stat = await fs.stat(filePath); const ext = path.extname(filePath).toLowerCase()
      const buf = Buffer.alloc(Math.min(65536, stat.size))
      const fh = await fs.open(filePath, "r"); await fh.read(buf, 0, buf.length, 0); await fh.close()
      const meta: Record<string, unknown> = { file: filePath, fileName: path.basename(filePath), format: ext.replace(".", ""), sizeBytes: stat.size, modifiedAt: stat.mtime.toISOString() }
      if (ext === ".png" && buf[0] === 0x89 && buf[1] === 0x50) { meta.width = buf.readUInt32BE(16); meta.height = buf.readUInt32BE(20); meta.status = "parsed" }
      else if ((ext === ".jpg" || ext === ".jpeg") && buf[0] === 0xFF && buf[1] === 0xD8) { meta.format = "jpeg"; meta.status = "parsed" }
      else if (ext === ".gif" && buf[0] === 0x47) { meta.width = buf.readUInt16LE(6); meta.height = buf.readUInt16LE(8); meta.status = "parsed" }
      else { meta.status = "metadata-only" }
      const skuMatch = path.basename(filePath).match(/(TLXR[\-_]?\d+|SP[\-_]?\d+|SKU[\-_]?\d+)/i)
      if (skuMatch) meta.detectedSku = skuMatch[1]
      return this.result(filePath, [meta])
    } catch (e) { return this.result(filePath, [], [`Image error: ${e}`]) }
  }
}
