import { ImmuneState } from "../domain/entities"

export interface NetworkTopology {
  nodes: string[]
  edges: Array<{ from: string; to: string }>
  weakPoints: string[]
}

export interface QuantumDefenseSmartLinkPort {
  onImmuneStateChange(state: ImmuneState): void
  getNetworkTopology(): NetworkTopology
}
