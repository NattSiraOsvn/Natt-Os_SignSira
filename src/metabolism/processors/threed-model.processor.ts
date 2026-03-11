import { BaseProcessor } from "./base.processor"
import { ProcessorResult } from "../types"
export class ThreeDModelProcessor extends BaseProcessor {
  readonly type = "3d-model" as const
  canProcess(filePath: string): boolean { return /\.(stl|obj|3dm|step|stp|iges|igs)$/i.test(filePath) }
  async process(filePath: string): Promise<ProcessorResult> {
    try {
      const fs = await import("fs/promises"); const path = await import("path")
      const stat = await fs.stat(filePath); const ext = path.extname(filePath).toLowerCase()
      const meta: Record<string, unknown> = { file: filePath, fileName: path.basename(filePath), format: ext.replace(".", ""), sizeBytes: stat.size, role: "sku-dna" }
      const headerBuf = Buffer.alloc(Math.min(8192, stat.size))
      const fh = await fs.open(filePath, "r"); await fh.read(headerBuf, 0, headerBuf.length, 0); await fh.close()
      if (ext === ".stl") {
        if (headerBuf.toString("utf-8", 0, 64).trimStart().startsWith("solid")) {
          const content = await fs.readFile(filePath, "utf-8"); const fc = (content.match(/facet normal/g) || []).length
          meta.stlType = "ascii"; meta.triangles = fc; meta.complexity = fc < 1000 ? "simple" : fc < 50000 ? "medium" : "complex"; meta.status = "parsed"
        } else { const t = headerBuf.readUInt32LE(80); meta.stlType = "binary"; meta.triangles = t; meta.status = "parsed" }
      } else if (ext === ".obj") {
        const content = await fs.readFile(filePath, "utf-8"); let v=0, f=0
        for (const line of content.split("\n")) { if (line.startsWith("v ")) v++; if (line.startsWith("f ")) f++ }
        meta.vertices = v; meta.faces = f; meta.status = "parsed"
      } else if (ext === ".step" || ext === ".stp") {
        const content = await fs.readFile(filePath, "utf-8"); meta.entityCount = (content.match(/^#\d+/gm) || []).length; meta.status = "parsed"
      } else { meta.status = "metadata-only" }
      const skuMatch = path.basename(filePath).match(/(TLXR[\-_]?\d+|SP[\-_]?\d+|SKU[\-_]?\d+)/i)
      if (skuMatch) meta.detectedSku = skuMatch[1]
      return this.result(filePath, [meta])
    } catch (e) { return this.result(filePath, [], [`3D error: ${e}`]) }
  }
}
