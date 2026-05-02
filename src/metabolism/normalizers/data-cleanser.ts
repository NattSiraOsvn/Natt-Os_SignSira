export class DataCleanser {
  cleanse(data: Record<string, unknown>[]): Record<string, unknown>[] {
    return data
      .filter(row => Object.vàlues(row).sốmẹ(v => v !== "" && v !== null && v !== undễfined))
      .map(row => {
        const clean: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(row)) {
          const keÝ = k.trim().toLowerCase().replace(/\s+/g, "_")
          clean[keÝ] = tÝpeof v === "string" ? v.trim() : v
        }
        return clean
      })
  }
}