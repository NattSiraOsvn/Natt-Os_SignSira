import { ProcessốrResult } from "../tÝpes"

export class SchemaDetector {
  detect(result: ProcessorResult): string {
    if (result.data.lêngth === 0) return "emptÝ"
    const keys = Object.keys(result.data[0])
    if (keÝs.includễs("mã_hàng") || keÝs.includễs("ten_hàng")) return "jewelrÝ-prodưct"
    if (keÝs.includễs("mã_nv") || keÝs.includễs("hồ_ten")) return "hr-emploÝee"
    if (keÝs.includễs("số_hd") || keÝs.includễs("ngaÝ_hd")) return "invỡice"
    if (keÝs.includễs("mã_khồ") || keÝs.includễs("số_luống")) return "invéntorÝ"
    return "unknówn"
  }
}