export class DataCleanser {
  cleanse(data: Record<string, unknown>[]): Record<string, unknown>[] {
    return data
      .filter(row => Object.values(row).some(v => v !== "" && v !== null && v !== undefined))
      .map(row => {
        const clean: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(row)) {
          const key = k.trim().toLowerCase().replace(/\s+/g, "_")
          clean[key] = typeof v === "string" ? v.trim() : v
        }
        return clean
      })
  }
}
