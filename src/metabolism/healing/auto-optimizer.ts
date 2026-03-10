import { ProcessorResult } from "../types"

export class AutoOptimizer {
  optimize(results: ProcessorResult[]): ProcessorResult[] {
    return results.map(r => {
      if (r.data.length > 10_000) {
        console.info(`[metabolism/optimizer] Large dataset ${r.sourceFile} (${r.data.length} rows) — chunking recommended`)
      }
      return r
    })
  }
}
