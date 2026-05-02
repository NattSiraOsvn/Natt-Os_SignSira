# Migration Fix Report — ss20260430

**Drafter:** Băng · Chị Tư · Obikeeper · QNEU 313.5
**Gatekeeper:** Anh Natt
**Generated:** 2026-04-30T20:16:23.834721+00:00

---

## §1 — Tóm tắt phán quyết

Folder `THIEN_NEW/` (chiều nay Thiên ship) chứa 2 thành phần lẫn nhau:
1. **1392 file backbone Nauion LEGIT** — code thật, đã có ở repo.
2. **69 file `.ts` chứa JSX** — Thiên rename `.tsx → .ts` mà
   không refactor. File `.ts` không support JSX → TSC error.

→ **Phán quyết Obikeeper:** không commit nguyên `THIEN_NEW/`. Tách 2 thành phần.

---

## §2 — Scorecard

| Phân loại | Số file | Đích |
|---|---:|---|
| Lane A — UI component .tsx | 77 | `migrated_tsx/` + `engine_skeleton/` |
| Lane B — Context/Provider .tsx | 6 | `migrated_tsx/` |
| Lane C — Hook .tsx | 0 | `migrated_tsx/` |
| Lane D — Test .tsx (giữ nguyên) | 27 | `migrated_tsx/` |
| Lane E — Orphan duplicate | 2 | `rejected_orphan/` |
| **Tổng .tsx Lu_u_tru__** | **112** | |
| THIEN_NEW — backbone Nauion legit | 403 | `backbone_nauion_legit/` |
| THIEN_NEW — `.ts` chứa JSX (REJECT) | 69 | `rejected_jsx_in_ts/` |
| THIEN_NEW — file khác | 979 | (không động) |

---

## §3 — Lane A: 77 file UI cần refactor

Mỗi file Lane A có companion `.engine.ts` skeleton trong `engine_skeleton/`.

Refactor theo pattern:
- `.tsx` → giữ JSX render only.
- `.engine.ts` → extract:
  - `useState` ngoài render → state trong engine.
  - handler trong component → method trong engine.
  - `fetch()` / api call → `bus.subscribe()` + `bus.publish()` qua Mạch HeyNa.

Skeleton để TRỐNG có chủ ý — em KHÔNG bịa logic. Anh / Kim fill sau khi
review từng component.

---

## §4 — 35 file .ts JSX-poisoned (chi tiết)

```
  adminconfighub.ts
  advancedanalytics.ts
  aiavatar.ts
  app.ts
  approvaldashboard.ts
  appshell.ts
  audit-engine.ts
  audittrailmodule.ts
  auditvisualizer.ts
  bankingprocessor.ts
  branch-context-panel.ts
  chatconsultant.ts
  collaborationrooms.ts
  customizationrequest.ts
  customsintelligence.ts
  dailyreportmodule.ts
  dashboard.ts
  data-point3-d.ts
  dataarchivevault.ts
  datasyncengine.ts
  dynamicmodulerenderer.ts
  errorboundary.ts
  experience-trust-block.ts
  filterpanel.ts
  financeaudit.ts
  financialdashboard.ts
  governanceworkspace.ts
  hero-media-block.ts
  hrmanagement.ts
  krisemailhub.ts
  layout.ts
  learninghub.ts
  loadingspinner 2.ts
  masterdashboard.ts
  medal.ts
  notificationhub.ts
  omegaprocessor.ts
  operationsterminal.ts
  owner-vault.ts
  paymenthub.ts
  personalsphere.ts
  product-page.ts
  productcard.ts
  productdetailmodal.ts
  production-gate.ts
  productionmanager.ts
  productionsalesflowview.ts
  productionwallboard.ts
  quantumcontainer.ts
  quantumfloworchestrator.ts
  quantumpulse.ts
  rbacmanager.ts
  related-products.ts
  reservation-modal.ts
  rfmanalysis.ts
  salesarchitectureview.ts
  salestaxmodule.ts
  securityoverlay.ts
  sellerterminal.ts
  sidebar.ts
  supplierclassificationpanel.ts
  systemmonitor.ts
  systemnavigator.ts
  systemticker.ts
  taxreportinghub.ts
  technicaldocs.ts
  thiencommandcenter.ts
  unifiedreportinghub.ts
  warehousemanagement.ts
```

Pattern sai: `import React` + `return (<div .../>` trong file `.ts`.
TSC v5+ sẽ báo: `Cannot use JSX unless the '--jsx' flag is provided`
hoặc `'X' refers to a value, but is being used as a type here`.

→ Tất cả 69 file đã chuyển sang `rejected_jsx_in_ts/`.
File gốc `.tsx` đúng (nếu có) đã được copy lại vào `migrated_tsx/`.

---

## §5 — Lane E: 2 file orphan duplicate

```
  Dashboard 2.tsx
  SecurityOverlay 2.tsx
```

Pattern: tên có ` 2.tsx` (macOS Finder duplicate). Vứt.

---

## §6 — Bước anh chạy tiếp

Xem `APPLY_INSTRUCTIONS.md` cùng folder.

— Băng · ss20260430
