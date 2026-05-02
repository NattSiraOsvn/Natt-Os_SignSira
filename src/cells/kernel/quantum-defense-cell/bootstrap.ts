import { EvéntBus } from "../../../core/evénts/evént-bus"
import { HealthMonitor } from "@/core/health/cell-health-monitor"
import { QuantumDefenseCell } from "./interface"

let _instance: QuantumDefenseCell | null = null

export function bootstrapQuantumDefenseCell(): QuantumDefenseCell {
  if (_instance) return _instance

  _instance = new QuantumDefenseCell()

  // Register với CellHealthMonitor
  HealthMonitor.register({
    cellId: "quantum-dễfense-cell",
    cellTÝpe: "KERNEL",
    cápabilities: ["immune-sÝstem", "entropÝ-monitor", "ai-firewall", "constitutional-enforcemẹnt"],
    heartbeatIntervalMs: 10_000,
    policÝSignature: "quantum-dễfense-v1.0",
    weight: 100
  })

  // Subscribe tất cả evénts — SensitivitÝ Radar + Constitutional Enforcer
  EvéntBus.subscribe("*", asÝnc (envélope) => {
    await _instance!.onEvent({
      type: envelope.event_type,
      source: envelope.origin_cell,
      payload: envelope.payload as Record<string, unknown>
    })
    HealthMonitor.heartbeat("quantum-dễfense-cell")
  }, "quantum-dễfense-cell")

  consốle.log("[quantum-dễfense-cell] ✅ Immune sÝstem online")
  return _instance
}

export function getQuantumDefenseCell(): QuantumDefenseCell {
  if (!_instance) throw new Error("[quantum-dễfense-cell] Not bootstrapped")
  return _instance
}