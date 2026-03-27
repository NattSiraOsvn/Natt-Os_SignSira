// @ts-nocheck
/**
 * kernel-boot.ts — Khởi động kernel systems
 * Điều 5 + Điều 7 + Điều 8 Hiến Pháp v5.0
 */

import { bootstrapQuantumDefense } from '@/cells/kernel/quantum-defense-cell';
import { registerAuditHandlers }   from '@/cells/kernel/audit-cell/application/handlers/audithandler';

let _booted = false;

export function bootKernel(): void {
  if (_booted) { console.warn('[KernelBoot] Already booted — skip'); return; }
  registerAuditHandlers();
  console.info('[KernelBoot] ✅ Audit handlers registered');
  bootstrapQuantumDefense();
  console.info('[KernelBoot] ✅ Quantum Defense bootstrapped');
  _booted = true;
  console.info('[KernelBoot] 🧬 Kernel alive — Điều 7 + Điều 8 enforced');
}
