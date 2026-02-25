# NATTCELL → GOLDMASTER MERGE: PHÂN TÍCH TOÀN DIỆN

## 1. PHÁT HIỆN CỐT LÕI — 3 BẪY ẨN

### BẪY 1: ENUM CASING MISMATCH (Lỗi im lặng — runtime crash)
Goldmaster dùng lowercase enum keys, Nattcell dùng UPPERCASE:

| Enum | Goldmaster | Nattcell | Module bị ảnh hưởng |
|---|---|---|---|
| UserRole | `master, admin, level_1...` | `MASTER, ADMIN, LEVEL_1...` | authService |
| PersonaID | `thien, kris, can...` | `THIEN, KRIS, CAN...` | RefundWorkflow, OrphanBot |
| Department | `hq, finance, sales...` | `HQ, FINANCE, SALES...` | personnelEngine |

**Hệ quả**: `UserRole.MASTER` → `undefined` tại runtime. TSC KHÔNG báo lỗi vì `const UserRole = user_role` cho phép access bất kỳ key nào. Đây là **silent failure** — build xanh nhưng logic sai.

### BẪY 2: AccountingEntry.reference REQUIRED
Goldmaster `AccountingEntry` yêu cầu `reference: Record<string, any>` (bắt buộc). CostAllocationSystem không set trường này → TSC lỗi.

### BẪY 3: AccountingLine excess properties
CostAllocationSystem tạo entry với `amount` và `type` — 2 field KHÔNG CÓ trong goldmaster `AccountingLine`. TypeScript excess property check → TSC lỗi.

---

## 2. PHÂN LOẠI MODULE THEO RỦI RO

### BATCH 1: ZERO RISK — Drop-in nguyên bản (0 thay đổi)
| Module | Lines | Deps | Lý do an toàn |
|---|---|---|---|
| GovernanceEnforcementEngine | 42L | 0 imports | Pure function, untyped params (`any`) |

### BATCH 2: LOW RISK — Chỉ sửa import path (0 type mới)
| Module | Lines | Sửa gì | Types cần |
|---|---|---|---|
| ReconciliationService | 68L | import path | Transaction✅ GatewayReport✅ ReconciliationResult✅ Discrepancy✅ |

### BATCH 3: MEDIUM — Sửa enum casing + import path
| Module | Lines | Sửa gì |
|---|---|---|
| RefundWorkflowService | 62L | PersonaID.KRIS→.kris, .THIEN→.thien |
| OrphanDetectionBot | 53L | PersonaID.KRIS→.kris, import path (.ts ext), ShardingService unused |

### BATCH 4: MEDIUM-HIGH — Cần thêm type + sửa logic
| Module | Lines | Sửa gì |
|---|---|---|
| enterpriseLinker | 89L | +2 types: AggregatedReport, LinkedRecord |
| CostAllocationSystem | 88L | Fix: +reference field, -amount/-type excess props |
| authService | 181L | UserRole.MASTER→.master (13 rewrite), enum keys |

### BATCH 5: HIGHER — Phức tạp hơn
| Module | Lines | Vấn đề |
|---|---|---|
| personnelEngine | 108L | Department.FINANCE→.finance, PositionType OK |
| hrEngine | 107L | Cần kiểm tra thêm |
| productionSalesFlow | 276L | Define types locally, cần SalesCore+ShardingService |
| logisticsService | 257L | Cần ShardingService |
| customsUtils REAL | 285L | Cần `xlsx` NPM |
| EventStagingLayer REAL | 156L | Replace shim, cần ShardingService |
| GlobalIdempotencyEnforcer | 103L | localStorage + crypto.subtle |

### BATCH 6: DEFER — Missing deps
| Module | Vấn đề |
|---|---|
| Auditable decorator | Cần AuditInterceptor (không tồn tại) |
| geminiService | Cần @google/genai + API key |
| exportService | Cần xlsx NPM |
| FiscalWorkbenchService | Đã có trong GM (144L=144L) |
| SmartLinkMappingEngine | Đã có trong GM (237L=237L) |

---

## 3. KẾ HOẠCH MERGE — 4 BATCH TUẦN TỰ

### BATCH A: Modules an toàn nhất (Batch 1+2+3) — 5 modules, 278L
1. GovernanceEnforcementEngine → `src/natt-os/governance/enforcement-engine.ts`
2. ReconciliationService → `src/services/ReconciliationService.ts`
3. RefundWorkflowService → `src/services/RefundWorkflowService.ts`
4. OrphanDetectionBot → `src/services/monitoring/OrphanDetectionBot.ts`
5. enterpriseLinker → `src/services/enterpriseLinker.ts`

**Fixes cần áp dụng:**
- Import path: `../types` (không có `.ts` extension)
- Import path: `./notificationService` → `./notificationservice`
- Import path: `./blockchainService` → `./blockchainservice`
- PersonaID: `.KRIS` → `.kris`, `.THIEN` → `.thien`
- ShardingService: import from blockchainservice
- +2 types: AggregatedReport, LinkedRecord vào types.ts

### BATCH B: Finance + Auth (Batch 4) — 3 modules, 357L
6. CostAllocationSystem → `src/services/cost/CostAllocationSystem.ts`
7. authService → `src/services/authService.ts`
8. personnelEngine → `src/services/personnelEngine.ts`

**Fixes:**
- CostAllocation: add `reference: {}`, remove excess props
- authService: 13 UserRole enum key rewrites
- personnelEngine: Department enum casing

### BATCH C: Heavy modules (Batch 5) — 4 modules, 797L
9. productionSalesFlow → `src/services/productionSalesFlow.ts`
10. logisticsService → `src/services/logisticsService.ts`
11. EventStagingLayer REAL → `src/services/staging/EventStagingLayer.ts`
12. GlobalIdempotencyEnforcer → `src/services/shared/GlobalIdempotencyEnforcer.ts`

### BATCH D: NPM-dependent (khi có network)
13. customsUtils REAL (cần xlsx)
14. hrEngine (cần kiểm tra sâu hơn)

---

## 4. KIỂM CHỨNG SAU MERGE

Sau mỗi batch:
```
npx tsc --noEmit 2>&1 | head -20
npm run build
```

Nếu fail → rollback batch đó, debug từng file.
