export type ModelFormat = "stl" | "obj" | "3dm" | "step" | "stp"

export interface ProductionSpec {
  goldWeightGram: number      // Định mức vàng
  diamondCount: number        // Số hột đá
  laborHours: number          // Định mức nhân công
  castingRequired: boolean
  stoneSettingRequired: boolean
  polishingRequired: boolean
}

export interface SkuModel {
  skuId: string               // Mã hàng — link với inventory-cell
  modelPath: string           // Path file 3D gốc
  format: ModelFormat
  version: number             // Lịch sử phiên bản — audit trail từ khi sinh
  productionSpec: ProductionSpec
  createdAt: number
  updatedAt: number
  approvedBy?: string         // Gatekeeper approval
  nasiLinked: boolean         // Đã link với giấy đảm bảo chưa
}
