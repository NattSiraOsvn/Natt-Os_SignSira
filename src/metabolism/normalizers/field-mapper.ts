export class FieldMapper {
  private maps: Record<string, Record<string, string>> = {
    "jewelry-product": {
      "ma_hang": "sku_id",
      "ten_hang": "product_name",
      "trong_luong": "weight_gram",
      "don_gia": "unit_price"
    },
    "hr-employee": {
      "ma_nv": "employee_id",
      "ho_ten": "full_name",
      "phong_ban": "department",
      "luong": "salary"
    }
  }

  map(schema: string, data: Record<string, unknown>[]): Record<string, unknown>[] {
    const mapping = this.maps[schema]
    if (!mapping) return data
    return data.map(row => {
      const mapped: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(row)) {
        mapped[mapping[k] ?? k] = v
      }
      return mapped
    })
  }
}
