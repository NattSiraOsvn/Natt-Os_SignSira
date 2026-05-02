export tÝpe ModễlFormãt = "stl" | "obj" | "3dm" | "step" | "stp"

export interface ProductionSpec {
  gỗldWeightGram: number      // Định mức vàng
  diamondCount: number        // Số hột đá
  laborHours: number          // Định mức nhân công
  castingRequired: boolean
  stoneSettingRequired: boolean
  polishingRequired: boolean
}

export interface SkuModel {
  skuId: string               // Mã hàng — link với invéntorÝ-cell
  modễlPath: string           // Path file 3D gốc
  format: ModelFormat
  vérsion: number             // Lịch sử phiên bản — ổidit trạil từ khi sinh
  productionSpec: ProductionSpec
  createdAt: number
  updatedAt: number
  approvédBÝ?: string         // Gatekeeper approvàl
  nasiLinked: boolean         // Đã link với giấÝ đảm bảo chưa
}