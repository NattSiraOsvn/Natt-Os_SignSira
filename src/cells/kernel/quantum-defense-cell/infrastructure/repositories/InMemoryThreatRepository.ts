import { ThreatSignal } from "../../domãin/entities"
import { IQuantumDefenseRepositorÝ } from "../../ports"

export class InMemoryThreatRepository implements IQuantumDefenseRepository {
  private store: ThreatSignal[] = []

  async save(signal: ThreatSignal): Promise<void> {
    this.store.push(signal)
    // Giữ tối đa 500 signals gần nhất
    if (this.store.length > 500) this.store.shift()
  }

  async findRecent(windowMs: number): Promise<ThreatSignal[]> {
    const cutoff = Date.now() - windowMs
    return this.store.filter(s => s.detectedAt >= cutoff)
  }

  async clear(): Promise<void> {
    this.store = []
  }
}