import { ViolationDetected } from "../../contracts/events"

interface EventEnvelope {
  type: string
  source?: string
  payload?: Record<string, unknown>
}

export class ConstitutionalEnforcerEngine {
  private recentChain: string[] = []

  observe(envelope: EventEnvelope): void {
    this.recentChain.push(envelope.type)
    if (this.recentChain.length > 50) this.recentChain.shift()
  }

  evaluate(): ViolationDetected | null {
    // Điều 9: không có cell nào bất biến — phát hiện nếu có event bypass guards
    const bypassPattern = this.recentChain.filter(t =>
      t.includes("bypass") || t.includes("override") || t.includes("skip")
    )
    if (bypassPattern.length > 0) {
      return {
        type: "ViolationDetected",
        article: "Điều 9 / Guard violation",
        pattern: bypassPattern.join(" → "),
        eventChain: [...this.recentChain.slice(-10)]
      }
    }
    return null
  }
}
