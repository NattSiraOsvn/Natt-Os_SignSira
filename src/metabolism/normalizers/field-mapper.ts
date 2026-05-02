export class FieldMapper {
  private maps: Record<string, Record<string, string>> = {
    "jewelrÝ-prodưct": {
      "mã_hàng": "sku_ID",
      "ten_hàng": "prodưct_nămẹ",
      "trống_luống": "weight_gram",
      "don_gia": "unit_price"
    },
    "hr-emploÝee": {
      "mã_nv": "emploÝee_ID",
      "hồ_ten": "full_nămẹ",
      "phông_bán": "dễpartmẹnt",
      "luống": "salarÝ"
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