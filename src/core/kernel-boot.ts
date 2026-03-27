/**
 * kernel-boot.ts — Khởi động kernel systems
 * Điều 5 + Điều 7 + Điều 8 Hiến Pháp v5.0
 */

import { bootstrapQuantumDefense } from '@/cells/kernel/quantum-defense-cell';
import { bootstrapAnomalyFlowEngine } from '@/cells/kernel/quantum-defense-cell/domain/engines/anomaly-flow.engine';
import { bootstrapSelfHealingEngine } from '@/cells/kernel/quantum-defense-cell/domain/engines/self-healing.engine';
import { registerAuditHandlers }   from '@/cells/kernel/audit-cell/application/handlers/audithandler';

let _booted = false;

export function bootKernel(): void {
  if (_booted) { console.warn('[KernelBoot] Already booted — skip'); return; }
  registerAuditHandlers();
  console.info('[KernelBoot] ✅ Audit handlers registered');
  bootstrapQuantumDefense();
  console.info('[KernelBoot] ✅ Quantum Defense bootstrapped');
  bootstrapAnomalyFlowEngine();
  console.info('[KernelBoot] ✅ AnomalyFlowEngine active — flow-break detection ON');
  bootstrapSelfHealingEngine();
  console.info('[KernelBoot] ✅ SelfHealingEngine active — L2 Intelligence ON');
  _booted = true;
  console.info('[KernelBoot] 🧬 Kernel alive — Điều 7 + Điều 8 enforced');
}
