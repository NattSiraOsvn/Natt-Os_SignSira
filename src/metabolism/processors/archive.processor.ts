import { BaseProcessor } from "./base.processor"
import { ProcessorResult } from "../types"

export class ArchiveProcessor extends BaseProcessor {
  readonly type = "csv" as const
  canProcess(filePath: string): boolean {
    return /\.(zip|rar|7z|tar|gz|tgz)$/i.test(filePath)
  }
  async process(filePath: string): Promise<ProcessorResult> {
    try {
      const fs = await import("fs/promises")
      const path = await import("path")
      const stat = await fs.stat(filePath)
      const ext = path.extname(filePath).toLowerCase()
      const buf = Buffer.alloc(Math.min(256, stat.size))
      const fh = await fs.open(filePath, "r")
      await fh.read(buf, 0, buf.length, 0)
      await fh.close()
      const meta: Record<string, unknown> = {
        file: filePath, fileName: path.basename(filePath), format: ext.replace(".", ""),
        sizeBytes: stat.size, sizeMB: Math.round(stat.size / 1048576 * 100) / 100,
        modifiedAt: stat.mtime.toISOString(),
      }
      if (buf[0] === 0x50 && buf[1] === 0x4B) { meta.archiveType = "zip"; meta.status = "parsed"; }
      else if (buf[0] === 0x52 && buf[1] === 0x61 && buf[2] === 0x72) { meta.archiveType = "rar"; meta.status = "metadata-only"; }
      else { meta.archiveType = ext.replace(".", ""); meta.status = "metadata-only"; }
      return this.result(filePath, [meta])
    } catch (e) { return this.result(filePath, [], [`Archive error: ${e}`]) }
  }
}
