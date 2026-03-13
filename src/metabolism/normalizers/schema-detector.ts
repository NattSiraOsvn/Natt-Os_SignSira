// @ts-nocheck
import { ProcessorResult } from "../types"

export class SchemaDetector {
  detect(result: ProcessorResult): string {
    if (result.data.length === 0) return "empty"
    const keys = Object.keys(result.data[0])
    if (keys.includes("ma_hang") || keys.includes("ten_hang")) return "jewelry-product"
    if (keys.includes("ma_nv") || keys.includes("ho_ten")) return "hr-employee"
    if (keys.includes("so_hd") || keys.includes("ngay_hd")) return "invoice"
    if (keys.includes("ma_kho") || keys.includes("so_luong")) return "inventory"
    return "unknown"
  }
}
