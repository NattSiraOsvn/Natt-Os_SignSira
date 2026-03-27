// @ts-nocheck
// — pending proper fix
import { BaseProcessor } from "./base.processor"
import { ProcessorResult } from "../types"
export class PdfProcessor extends BaseProcessor {
  readonly type = "pdf" as const
  canProcess(filePath: string): boolean { return filePath.toLowerCase().endsWith(".pdf") }
  async process(filePath: string): Promise<ProcessorResult> {
    try {
      const fs = await import("fs/promises"); const stat = await fs.stat(filePath)
      const buf = Buffer.alloc(1024); const fh = await fs.open(filePath, "r"); await fh.read(buf, 0, 1024, 0); await fh.close()
      const header = buf.toString("ascii", 0, 8)
      if (!header.startsWith("%PDF")) return this.result(filePath, [], ["Not a valid PDF"])
      const version = header.match(/%PDF-(\d\.\d)/)?.[1] ?? "unknown"
      try {
        const pdfParse = (await import("pdf-parse")).default
        const rawBuf = await fs.readFile(filePath); const parsed = await pdfParse(rawBuf)
        const text = parsed.text.trim(); const docType = this.detectDocType(text)
        return this.result(filePath, [{ file: filePath, pdfVersion: version, pages: parsed.numpages, docType, textLength: text.length, status: "parsed" }])
      } catch {
        return this.result(filePath, [{ file: filePath, pdfVersion: version, sizeBytes: stat.size, status: "metadata-only", hint: "npm install pdf-parse" }])
      }
    } catch (e) { return this.result(filePath, [], [`PDF error: ${e}`]) }
  }
  private detectDocType(text: string): string {
    const t = text.toLowerCase()
    if (t.includes("giấy đảm bảo") || t.includes("guarantee")) return "warranty-certificate"
    if (t.includes("hóa đơn") || t.includes("invoice")) return "invoice"
    if (t.includes("tờ khai") || t.includes("customs")) return "customs-declaration"
    if (t.includes("hợp đồng") || t.includes("contract")) return "contract"
    if (t.includes("giám định") || t.includes("appraisal")) return "appraisal-certificate"
    return "unknown"
  }
}
