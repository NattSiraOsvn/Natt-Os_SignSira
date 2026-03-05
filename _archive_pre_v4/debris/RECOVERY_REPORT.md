# NATT-OS Recovery Report
**Date:** 2026-02-25T04:45:09.829881
**Status:** YELLOW

## Summary
- ✓ OK: 47
- ⚠ WARN: 2
- ✗ ERR: 2

## Actions
- ✓ Backup complete → goldmaster-backup-20260225-044456
- ✓ Recovered: src/natt-os/security/sirasign-verifier.ts ← v1 (1953B)
- ✓ Recovered: src/natt-os/security/ai-lockdown.ts ← v1 (1609B)
- ✓ Recovered: src/natt-os/security/memory-governance-lock.ts ← v1 (2005B)
- ✓ Recovered: src/natt-os/validation/cell-purity-enforcer.ts ← v1 (1994B)
- ✓ Recovered: src/natt-os/monitoring/ai-behavior-analytics.ts ← v1 (1260B)
- ✗ NOT FOUND in any archive: governance/gatekeeper/gatekeeper-core.ts
- ✗ NOT FOUND in any archive: governance/rbac/rbac-core.tsx
- ✓ pricing-cell: +13 async methods wired → ['pricing.service.ts', 'pricing-runtime.service.ts']
- ✓ inventory-cell: +8 async methods wired → ['inventory.service.ts']
- ✓ sales-cell: +8 async methods wired → ['sales.service.ts', 'sales.service.ts']
- ✓ order-cell: +1 async methods wired → ['order.service.ts']
- ✓ buyback-cell: +2 async methods wired → ['buyback.service.ts']
- ✓ warranty-cell: +1 async methods wired → ['warranty.service.ts']
- ✓ customer-cell: +1 async methods wired → ['customer.service.ts']
- ⚠ promotion-cell: 4 domain methods found but service already has methods or no class found
- ⚠ showroom-cell: 5 domain methods found but service already has methods or no class found
- ✓ Dedup: dictionaryservice.ts → _trash_stubs/ (kept dictionary-service.ts, 2983B)
- ✓ Dedup: quantumengine.ts → _trash_stubs/ (kept quantum-engine.ts, 7418B)
- ✓ Dedup: notificationservice.ts → _trash_stubs/ (kept notification-service.ts, 1243B)
- ✓ Dedup: recoveryengine.ts → _trash_stubs/ (kept recovery-engine.ts, 3200B)
- ✓ Dedup: einvoiceservice.ts → _trash_stubs/ (kept e-invoice-service.ts, 2563B)
- ✓ Dedup: moduleregistry.ts → _trash_stubs/ (kept module-registry.ts, 3030B)
- ✓ Dedup: warehouse.service.ts → _trash_stubs/ (kept warehouse-service.ts, 280B)
- ✓ Dedup: dictionaryapprovalservice.ts → _trash_stubs/ (kept dictionary-approval-service.ts, 3767B)
- ✓ Dedup: paymentservice.ts → _trash_stubs/ (kept payment-service.ts, 1383B)
- ✓ Dedup: auditservice.ts → _trash_stubs/ (kept audit-service.ts, 235B)
- ✓ Dedup: audit.service.ts → _trash_stubs/ (kept audit-service.ts, 235B)
- ✓ Dedup: analytics.service.ts → _trash_stubs/ (kept analytics-service.ts, 1688B)
- ✓ Dedup: analyticsapi.ts → _trash_stubs/ (kept analytics-api.ts, 2659B)
- ✓ Dedup: analytics.api.ts → _trash_stubs/ (kept analytics-api.ts, 2659B)
- ✓ Stub removed: product-service.ts
- ✓ Stub removed: quantumbufferservice.ts
- ✓ Stub removed: customsservice.ts
- ✓ Stub removed: warehouse-service.ts
- ✓ Stub removed: sales-service.ts
- ✓ Stub removed: index.ts
- ✓ Stub removed: mapping/index.ts
- ✓ Stub removed: __mocks__/blockchainservice.ts
- ✓ Stub removed: __mocks__/notificationservice.ts
- ✓ Stub removed: showroom/index.ts
- ✓ Stub removed: fiscal/index.ts
- ✓ Stub removed: admin/audit-compliance.checker.ts
- ✓ Stub removed: admin/admin.service.ts
- ✓ Stub removed: admin/audit.interceptor.ts
- ✓ Stub removed: admin/rbac.service.ts
- ✓ Stub removed: admin/index.ts
- ✓ Stub removed: shared/global-idempotency.enforcer.ts
- ✓ Stub removed: parser/documentparserlayer.ts
- ✓ Stub removed: analytics/index.ts
- ✓ Stub removed: approval/index.ts

## Next Steps
1. Run `npx tsc --noEmit` to check compilation
2. Review `_trash_stubs/` — restore any needed files
3. Replace `throw new Error('Not implemented')` with real wiring
4. Re-run audit script to verify status change