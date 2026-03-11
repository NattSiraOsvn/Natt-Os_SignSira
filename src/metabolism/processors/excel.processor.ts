import { BaseProcessor } from "./base.processor"
import { ProcessorResult } from "../types"
export class ExcelProcessor extends BaseProcessor {
  readonly type = "excel" as const
  canProcess(filePath: string): boolean { return /\.(xlsx|xls)$/i.test(filePath) }
  async process(filePath: string): Promise<ProcessorResult> {
    try {
      try {
        const XLSX = await import("xlsx")
        const workbook = XLSX.readFile(filePath)
        const allData: Record<string, unknown>[] = []
        for (const sheetName of workbook.SheetNames) {
          const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName])
          rows.forEach((row, i) => { allData.push({ _sheet: sheetName, _row: i + 1, ...row }) })
        }
        return this.result(filePath, allData)
      } catch {
        const fs = await import("fs/promises")
        const stat = await fs.stat(filePath)
        const buf = Buffer.alloc(4); const fh = await fs.open(filePath, "r"); await fh.read(buf, 0, 4, 0); await fh.close()
        const isZip = buf[0] === 0x50 && buf[1] === 0x4B
        return this.result(filePath, [{ file: filePath, format: isZip ? "xlsx" : "xls-legacy", sizeBytes: stat.size, status: "metadata-only", hint: "npm install xlsx" }])
      }
    } catch (e) { return this.result(filePath, [], [`Excel error: ${e}`]) }
  }
}
