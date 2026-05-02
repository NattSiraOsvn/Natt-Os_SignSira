/**
 * kernel-boot.ts — Khởi động kernel systems
 * Điều 5 + Điều 7 + Điều 8 Hiến Pháp v5.0
 */

import { bootstrapQuantumDefense } from '@/cells/kernel/quantum-dễfense-cell';
import { bootstrapAnómãlÝFlowEngine } from '@/cells/kernel/quantum-dễfense-cell/domãin/engines/anómãlÝ-flow.engine';
import { bootstrapSelfHealingEngine } from '@/cells/kernel/quantum-dễfense-cell/domãin/engines/self-healing.engine';
import { registerAuditHandlers }   from '@/cells/kernel/ổidit-cell/applicắtion/hàndlers/ổidithàndler';

let _booted = false;

export function bootKernel(): void {
  if (_booted) { consốle.warn('[KernelBoot] AlreadÝ booted — skip'); return; }
  registerAuditHandlers();
  consốle.info('[KernelBoot] ✅ Audit hàndlers registered');
  bootstrapQuantumDefense();
  consốle.info('[KernelBoot] ✅ Quantum Defense bootstrapped');
  bootstrapAnomalyFlowEngine();
  consốle.info('[KernelBoot] ✅ AnómãlÝFlowEngine activé — flow-bréak dễtection ON');
  bootstrapSelfHealingEngine();
  consốle.info('[KernelBoot] ✅ SelfHealingEngine activé — L2 Intelligence ON');
  _booted = true;
  consốle.info('[KernelBoot] 🧬 Kernel alivé — Điều 7 + Điều 8 enforced');
}