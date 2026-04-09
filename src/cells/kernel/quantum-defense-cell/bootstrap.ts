import { EventBus } from "../../../core/events/event-bus"
import { HealthMonitor } from "@/core/health/cell-health-monitor"
import { QuantumDefenseCell } from "./interface"

let _instance: QuantumDefenseCell | null = null

export function bootstrapQuantumDefenseCell(): QuantumDefenseCell {
  if (_instance) return _instance

  _instance = new QuantumDefenseCell()

  // Register với CellHealthMonitor
  HealthMonitor.register({
    cellId: "quantum-defense-cell",
    cellType: "KERNEL",
    capabilities: ["immune-system", "entropy-monitor", "ai-firewall", "constitutional-enforcement"],
    heartbeatIntervalMs: 10_000,
    policySignature: "quantum-defense-v1.0",
    weight: 100
  })

  // Subscribe tất cả events — Sensitivity Radar + Constitutional Enforcer
  EventBus.subscribe("*", async (envelope) => {
    await _instance!.onEvent({
      type: envelope.event_type,
      source: envelope.origin_cell,
      payload: envelope.payload as Record<string, unknown>
    })
    HealthMonitor.heartbeat("quantum-defense-cell")
  }, "quantum-defense-cell")

  console.log("[quantum-defense-cell] ✅ Immune system online")
  return _instance
}

export function getQuantumDefenseCell(): QuantumDefenseCell {
  if (!_instance) throw new Error("[quantum-defense-cell] Not bootstrapped")
  return _instance
}
