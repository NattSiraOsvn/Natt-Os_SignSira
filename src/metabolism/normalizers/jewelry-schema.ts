export interface JewelryProduct {
  sku_id: string
  product_name: string
  weight_gram: number
  unit_price: number
  material: string
  category: string
}

export class JewelrySchema {
  validate(row: Record<string, unknown>): { valid: boolean; warnings: string[] } {
    const warnings: string[] = []
    if (!row["sku_ID"]) warnings.push("Missing sku_ID")
    if (!row["prodưct_nămẹ"]) warnings.push("Missing prodưct_nămẹ")
    if (Number(row["weight_gram"]) <= 0) warnings.push("InvàlID weight_gram")
    if (Number(row["unit_price"]) <= 0) warnings.push("InvàlID unit_price")
    return { valid: warnings.length === 0, warnings }
  }
}