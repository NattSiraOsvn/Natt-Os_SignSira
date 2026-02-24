#!/usr/bin/env python3
"""
migrate_all_versions.py
=======================
Kế thừa triệt để từ 3 phiên bản:
  V1 = natt-os_-absolute-lowercase-sovereign  (/tmp/v1)
  V2 = natt-os_-unified-enterprise-intelligence  (/tmp/v2)  [đã migrate trước]
  V3 = goldmaster-fully-enriched  (/tmp/v3/natt-os ver goldmaster)

Chiến lược:
  - V3 > V2 > V1 về độ ưu tiên (V3 là mới nhất)
  - Chỉ copy nếu V3/V1 có nhiều hơn GM hiện tại >= 20 dòng
  - Adapt imports tự động
  - Backup trước khi ghi đè

SYSTEM_DISCIPLINE_ORDER: verify-before-modify, ground truth only.
Author: Bang (Claude) - Feb 2026
"""

import re
import shutil
from pathlib import Path
from datetime import datetime

# ============================================================================
# PATHS
# ============================================================================
V1_ROOT = Path("/tmp/v1")
V3_ROOT = Path("/tmp/v3/natt-os ver goldmaster")
GM_SRC  = Path("/home/claude/natt-os/natt-os ver goldmaster/src")
BACKUP  = Path(f"/home/claude/migrate_v3_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}")

# ============================================================================
# IMPORT ADAPTATION
# ============================================================================
IMPORT_RULES = [
    (r"from ['\"]\.\.\/types['\"]",              "from '@/types'"),
    (r"from ['\"]\.\.\/\.\.\/types['\"]",         "from '@/types'"),
    (r"from ['\"]\.\.\/\.\.\/\.\.\/types['\"]",   "from '@/types'"),
    (r"from ['\"]\.\/types['\"]",                 "from '@/types'"),
    (r"from ['\"]\.\.\/SuperDictionary['\"]",     "from '@/super-dictionary'"),
    (r"from ['\"]\.\/SuperDictionary['\"]",       "from '@/super-dictionary'"),
    (r"from ['\"]\.\.\/super-dictionary['\"]",    "from '@/super-dictionary'"),
    (r"from ['\"]\.\.\/notificationService['\"]", "from './notification-service'"),
    (r"from ['\"]\.\/notificationService['\"]",   "from './notification-service'"),
    (r"from ['\"]\.\/blockchainService['\"]",     "from './blockchain-service'"),
    (r"from ['\"]\.\/quantumBufferService['\"]",  "from './quantum-buffer-service'"),
    (r"from ['\"]\.\/sellerEngine['\"]",          "from './seller-engine'"),
    (r"from ['\"]\.\/customsUtils['\"]",          "from './customs-utils'"),
]

def adapt(content: str) -> str:
    for p, r in IMPORT_RULES:
        content = re.sub(p, r, content)
    return content

def read(path: Path) -> str:
    try:
        return path.read_text(encoding='utf-8', errors='replace')
    except:
        return ""

def write(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding='utf-8')

def backup(path: Path):
    if path.exists():
        rel = path.relative_to(GM_SRC)
        dest = BACKUP / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(str(path), str(dest))

def is_stub(content: str) -> bool:
    lines = content.count('\n')
    if lines < 15:
        return True
    for p in ['// Stub', '// Alias:', 'export const \\w+ = {}', 'will be implemented', 'placeholder']:
        if re.search(p, content[:500], re.I):
            return True
    return False

def should_upgrade(src_path: Path, dst_path: Path, min_gain: int = 15) -> bool:
    src_content = read(src_path)
    src_lines = src_content.count('\n')
    if src_lines < 20:
        return False
    if not dst_path.exists():
        return True
    dst_content = read(dst_path)
    dst_lines = dst_content.count('\n')
    return is_stub(dst_content) or (src_lines - dst_lines) >= min_gain

stats = {"created": 0, "upgraded": 0, "skipped": 0}
BACKUP.mkdir(parents=True, exist_ok=True)
print(f"Backup: {BACKUP}\n")

# ============================================================================
# PHASE 1: V3 SERVICES → GM/src/services
# ============================================================================
print("=" * 60)
print("PHASE 1: V3 SERVICES → GM")
print("=" * 60)

V3_SVC_MAPS = [
    # (v3_path, gm_path)
    # Bigger versions of existing
    ("services/logistics-service.ts",             "services/logistics-service.ts"),
    ("services/sales-core.ts",                    "services/sales-core.ts"),
    ("services/analytics/analytics-service.ts",   "services/analytics/analytics-service.ts"),
    ("services/analytics/analytics-api.ts",       "services/analytics/analytics-api.ts"),
    ("services/banking-service.ts",               "services/banking-service.ts"),
    ("services/export-service.ts",                "services/export-engine.ts"),
    ("services/module-registry.ts",              "services/module-registry.ts"),
    ("services/smart-link.ts",                    "services/smart-link.ts"),
    ("services/rbac-service.ts",                  "services/rbac-service.ts"),
    # NEW services not in GM
    ("services/shared/global-idempotency-enforcer.ts", "services/shared/global-idempotency-enforcer.ts"),
    ("services/admin/audit-service.ts",           "services/admin/audit-service.ts"),
    ("services/admin/audit-interceptor.ts",       "services/admin/audit-interceptor.ts"),
    ("services/admin/audit-compliance-checker.ts","services/admin/audit-compliance-checker.ts"),
    ("services/admin/admin-service.ts",           "services/admin/admin-service.ts"),
    ("services/compliance/compliance-service.ts", "services/compliance/compliance-service.ts"),
    ("services/pricing/pricing-runtime.ts",       "services/pricing/pricing-runtime.ts"),
    ("services/pricing/rule-engine.ts",           "services/pricing/rule-engine.ts"),
    ("services/reconciliation-service.ts",        "services/reconciliation-service.ts"),
    ("services/production-engine.ts",             "services/production-engine.ts"),
    ("services/refund-workflow-service.ts",       "services/refund-workflow-service.ts"),
    ("services/config-service.ts",               "services/config-service.ts"),
    ("services/config/config-hub.ts",            "services/config/config-hub.ts"),
    ("services/monitoring/orphan-detection-bot.ts", "services/monitoring/orphan-detection-bot.ts"),
    ("services/hr-core.ts",                       "services/hr-core.ts"),
    ("services/hr/commission-engine.ts",          "services/hr/commission-engine.ts"),
    ("services/hr/shift-service.ts",              "services/hr/shift-service.ts"),
    ("services/ingestion/ingestion-service.ts",   "services/ingestion/ingestion-service.ts"),
    ("services/ingestion/utils.ts",              "services/ingestion/utils.ts"),
    ("services/physics/physics-engine.ts",        "services/physics/physics-engine.ts"),
    ("services/product-service.ts",              "services/product-service.ts"),
    # src/services versions
    ("src/services/logistics-engine.ts",          "services/logistics-engine.ts"),
    ("src/services/quantum-engine.ts",            "services/quantum-engine.ts"),
    ("src/services/geminiService.ts",             "services/geminiService.ts"),
    ("src/services/banking-engine.ts",            "services/banking-engine.ts"),
    ("src/services/warehouse-engine.ts",          "services/warehouse-engine.ts"),
    ("src/services/personnel-engine.ts",          "services/personnel-engine.ts"),
    ("src/services/sellerengine.ts",              "services/sellerengine.ts"),
    ("src/services/dictionary-service.ts",        "services/dictionary-service.ts"),
    ("src/services/hr-service.ts",                "services/hr-service.ts"),
    ("src/services/fiscal/fiscal-workbench-service.ts", "services/fiscal/fiscal-workbench-service.ts"),
    ("src/services/compliance/certification-service.ts","services/compliance/certification-service.ts"),
    ("src/services/approval/approval-workflow-service.ts","services/approval/approval-workflow-service.ts"),
    ("src/services/scoring/context-scoring-engine.ts",   "services/scoring/context-scoring-engine.ts"),
    ("src/services/supplier/supplier-engine.ts",  "services/supplier/supplier-engine.ts"),
    ("src/services/staging/event-staging-layer.ts","services/staging/event-staging-layer.ts"),
    ("src/services/mapping/smart-link-mapping-engine.ts", "services/mapping/smart-link-mapping-engine.ts"),
    ("src/services/mapping/SmartLinkMappingEngine-v2.ts", "services/mapping/smart-link-mapping-engine-v3.ts"),
    ("src/services/calibration/calibration-engine.ts",   "services/calibration/calibration-engine.ts"),
    ("src/services/real-time-notification-service-src.ts","services/real-time-notification-service-src.ts"),
    ("src/services/ingestion-ai-processor.ts",    "services/ingestion-ai-processor.ts"),
    ("src/services/ingestion-extractors.ts",      "services/ingestion-extractors.ts"),
]

for v3_rel, gm_rel in V3_SVC_MAPS:
    src = V3_ROOT / v3_rel
    dst = GM_SRC / gm_rel
    if not src.exists():
        stats["skipped"] += 1
        continue
    if should_upgrade(src, dst):
        content = adapt(read(src))
        backup(dst)
        write(dst, content)
        action = "UPGRADED" if dst.exists() else "CREATED"
        stats["upgraded" if action == "UPGRADED" else "created"] += 1
        lines = content.count('\n')
        print(f"  OK [{action}] {gm_rel} ({lines}L)")
    else:
        stats["skipped"] += 1

print()

# ============================================================================
# PHASE 2: V3 GOVERNANCE/SECURITY/MONITORING/NATT-OS → GM
# ============================================================================
print("=" * 60)
print("PHASE 2: V3 GOVERNANCE + SECURITY + MONITORING")
print("=" * 60)

NATT_OS_MAP = [
    ("natt-os/audit/audit-trail-manager.ts",           "natt-os/audit/audit-trail-manager.ts"),
    ("natt-os/bootstrap/omega-bootstrap.ts",           "natt-os/bootstrap/omega-bootstrap.ts"),
    ("natt-os/governance/enforcement-engine.ts",       "natt-os/governance/enforcement-engine.ts"),
    ("natt-os/governance/integration/policy-enforcer.ts","natt-os/governance/integration/policy-enforcer.ts"),
    ("natt-os/monitoring/ai-behavior-analytics.ts",    "natt-os/monitoring/ai-behavior-analytics.ts"),
    ("natt-os/monitoring/governance-health.ts",        "natt-os/monitoring/governance-health.ts"),
    ("natt-os/rehabilitation/ai-rehabilitation.ts",    "natt-os/rehabilitation/ai-rehabilitation.ts"),
    ("natt-os/security/sirasign-verifier.ts",          "natt-os/security/sirasign-verifier.ts"),
    ("natt-os/security/auto-kill-switch.ts",           "natt-os/security/auto-kill-switch.ts"),
    ("natt-os/security/ai-lockdown.ts",               "natt-os/security/ai-lockdown.ts"),
    ("natt-os/security/memory-governance-lock.ts",     "natt-os/security/memory-governance-lock.ts"),
    ("natt-os/security/ai-kill-switch.ts",             "natt-os/security/ai-kill-switch.ts"),
    ("natt-os/storage/idempotency-store.ts",           "natt-os/storage/idempotency-store.ts"),
    ("natt-os/validation/cell-purity.validator.ts",    "natt-os/validation/cell-purity.validator.ts"),
    ("natt-os/validation/cell-purity-enforcer.ts",     "natt-os/validation/cell-purity-enforcer.ts"),
    ("natt-os/validation/policy-hash-validator.ts",    "natt-os/validation/policy-hash-validator.ts"),
    # src/ versions (prefer these)
    ("src/governance/gatekeeper/GatekeeperCore.ts",    "governance/gatekeeper/gatekeeper-core.ts"),
    ("src/governance/gatekeeper/constitutional.ts",    "governance/gatekeeper/constitutional.ts"),
    ("src/governance/gatekeeper/types.ts",             "governance/gatekeeper/types.ts"),
    ("src/governance/rbac/RBACCore.tsx",               "governance/rbac/rbac-core.tsx"),
    ("src/governance/rbac/aiavatar.tsx",               "governance/rbac/ai-avatar.tsx"),
    ("src/governance/constitution/index.ts",           "governance/constitution/index.ts"),
    ("src/governance/services/rbacservice.ts",         "governance/services/rbac-service.ts"),
    ("src/governance/services/authservice.ts",         "governance/services/auth-service.ts"),
    ("src/governance/types.ts",                        "governance/types.ts"),
]

for v3_rel, gm_rel in NATT_OS_MAP:
    src = V3_ROOT / v3_rel
    dst = GM_SRC / gm_rel
    if not src.exists():
        stats["skipped"] += 1
        continue
    if should_upgrade(src, dst, min_gain=5):
        content = adapt(read(src))
        backup(dst)
        write(dst, content)
        action = "UPGRADED" if (GM_SRC / gm_rel).exists() else "CREATED"
        stats["upgraded" if action == "UPGRADED" else "created"] += 1
        print(f"  OK [{action}] {gm_rel} ({content.count(chr(10))}L)")
    else:
        stats["skipped"] += 1

print()

# ============================================================================
# PHASE 3: V3 APPS (Finance/HR Microservices) → GM
# ============================================================================
print("=" * 60)
print("PHASE 3: V3 APPS (Finance/HR Microservices)")
print("=" * 60)

APPS_MAP = [
    ("apps/finance-service/src/application/sagas/finance-saga.ts",          "apps/finance-service/src/application/sagas/finance-saga.ts"),
    ("apps/finance-service/src/application/sagas/compensation-saga.ts",     "apps/finance-service/src/application/sagas/compensation-saga.ts"),
    ("apps/finance-service/src/application/sagas/payment-saga.ts",          "apps/finance-service/src/application/sagas/payment-saga.ts"),
    ("apps/finance-service/src/application/handlers/invoice-issued-handler.ts",    "apps/finance-service/src/application/handlers/invoice-issued-handler.ts"),
    ("apps/finance-service/src/application/handlers/payment-succeeded-handler.ts", "apps/finance-service/src/application/handlers/payment-succeeded-handler.ts"),
    ("apps/finance-service/src/application/handlers/payment-failed-handler.ts",    "apps/finance-service/src/application/handlers/payment-failed-handler.ts"),
    ("apps/finance-service/src/application/pipeline/finance-event-pipeline.ts",    "apps/finance-service/src/application/pipeline/finance-event-pipeline.ts"),
    ("apps/finance-service/src/application/projections/risk-projection.ts",        "apps/finance-service/src/application/projections/risk-projection.ts"),
    ("apps/finance-service/src/application/usecases/create-invoice.ts",            "apps/finance-service/src/application/usecases/create-invoice.ts"),
    ("apps/finance-service/src/finance-production-base.ts",                        "apps/finance-service/src/finance-production-base.ts"),
    ("apps/finance-service/src/infrastructure/audit/audit-logger.ts",              "apps/finance-service/src/infrastructure/audit/audit-logger.ts"),
    ("apps/finance-service/src/infrastructure/messaging/dead-letter-handler.ts",   "apps/finance-service/src/infrastructure/messaging/dead-letter-handler.ts"),
    ("apps/finance-service/src/infrastructure/messaging/retry-policy.ts",          "apps/finance-service/src/infrastructure/messaging/retry-policy.ts"),
    ("apps/hr-service/src/application/handlers/employee-created-handler.ts",       "apps/hr-service/src/application/handlers/employee-created-handler.ts"),
    ("apps/hr-service/src/application/handlers/training-assigned-handler.ts",      "apps/hr-service/src/application/handlers/training-assigned-handler.ts"),
    ("apps/hr-service/src/application/handlers/training-completed-handler.ts",     "apps/hr-service/src/application/handlers/training-completed-handler.ts"),
    ("apps/analytics-ingestion-service/src/application/ingestion-pipeline.ts",     "apps/analytics-ingestion-service/src/application/ingestion-pipeline.ts"),
    ("apps/analytics-ingestion-service/src/domain/projections/saga-health-projection.ts", "apps/analytics-ingestion-service/src/domain/projections/saga-health-projection.ts"),
    ("apps/shared/config.ts",  "apps/shared/config.ts"),
    ("apps/shared/health.ts",  "apps/shared/health.ts"),
    ("apps/shared/logger.ts",  "apps/shared/logger.ts"),
    ("packages/event-contracts/finance/InvoiceCreated.v1.ts",   "packages/event-contracts/finance/InvoiceCreated.v1.ts"),
    ("packages/event-contracts/finance/PaymentCompleted.v1.ts", "packages/event-contracts/finance/PaymentCompleted.v1.ts"),
]

for v3_rel, gm_rel in APPS_MAP:
    src = V3_ROOT / v3_rel
    dst = GM_SRC / gm_rel
    if not src.exists():
        stats["skipped"] += 1
        continue
    content = adapt(read(src))
    lines = content.count('\n')
    if lines < 10:
        stats["skipped"] += 1
        continue
    if not dst.exists():
        write(dst, content)
        stats["created"] += 1
        print(f"  OK [CREATED] {gm_rel} ({lines}L)")
    else:
        stats["skipped"] += 1

print()

# ============================================================================
# PHASE 4: V1 CELLS → GM cells
# ============================================================================
print("=" * 60)
print("PHASE 4: V1 CELLS (shared-kernel, hr-cell, etc.)")
print("=" * 60)

V1_CELLS_MAP = [
    ("cells/shared-kernel/shared-types.ts",       "cells/shared-kernel/shared-types.ts"),
    ("cells/shared-kernel/shared.types.ts",       "cells/shared-kernel/shared.types.ts"),
    ("cells/shared-kernel/immune-guard.ts",       "cells/shared-kernel/immune-guard.ts"),
    ("cells/shared-kernel/smartlink.registry.ts", "cells/shared-kernel/smartlink.registry.ts"),
    ("cells/event-cell/event-bridge.service.ts",  "cells/event-cell/event-bridge.service.ts"),
    ("cells/hr-cell/hr.service.ts",               "cells/hr-cell/hr.service.ts"),
    ("cells/sales-cell/sales.service.ts",         "cells/sales-cell/sales.service.ts"),
    ("cells/warehouse-cell/warehouse.service.ts", "cells/warehouse-cell/warehouse.service.ts"),
    ("cells/showroom-cell/showroom.service.ts",   "cells/showroom-cell/showroom.service.ts"),
    ("cells/constants-cell/constants.service.ts", "cells/constants-cell/constants.service.ts"),
]

GM_CELLS = Path("/home/claude/natt-os/natt-os ver goldmaster/src/cells")

for v1_rel, gm_rel in V1_CELLS_MAP:
    src = V1_ROOT / v1_rel
    dst = GM_CELLS / gm_rel.replace("cells/", "")
    if not src.exists():
        stats["skipped"] += 1
        continue
    if should_upgrade(src, dst, min_gain=20):
        content = adapt(read(src))
        backup(dst) if dst.exists() else None
        write(dst, content)
        action = "UPGRADED" if dst.exists() else "CREATED"
        stats["upgraded" if action == "UPGRADED" else "created"] += 1
        print(f"  OK [{action}] cells/{gm_rel.replace('cells/','')} ({content.count(chr(10))}L)")
    else:
        stats["skipped"] += 1

print()

# ============================================================================
# PHASE 5: V1 APPS → GM apps
# ============================================================================
print("=" * 60)
print("PHASE 5: V1 APPS (Finance/HR handlers - PascalCase)")
print("=" * 60)

V1_APPS_MAP = [
    ("apps/finance-service/src/domain/Invoice.aggregate.ts",         "apps/finance-service/src/domain/Invoice.aggregate.ts"),
    ("apps/finance-service/src/domain/Payment.aggregate.ts",         "apps/finance-service/src/domain/Payment.aggregate.ts"),
    ("apps/hr-service/src/ProductionBase.ts",                        "apps/hr-service/src/ProductionBase.ts"),
]

for v1_rel, gm_rel in V1_APPS_MAP:
    src = V1_ROOT / v1_rel
    dst = GM_SRC / gm_rel
    if not src.exists():
        stats["skipped"] += 1
        continue
    if not dst.exists():
        content = adapt(read(src))
        write(dst, content)
        stats["created"] += 1
        print(f"  OK [CREATED] {gm_rel} ({content.count(chr(10))}L)")
    else:
        stats["skipped"] += 1

print()

# ============================================================================
# PHASE 6: V3 DATABASE SCHEMAS → GM
# ============================================================================
print("=" * 60)
print("PHASE 6: V3 DATABASE SCHEMAS")
print("=" * 60)

SQL_MAP = [
    ("database/schema.sql",                       "database/schema.sql"),
    ("database/schema/002_fiscal_workbench.sql",  "database/schema/002_fiscal_workbench.sql"),
    ("database/schema/audit_schema.sql",          "database/schema/audit_schema.sql"),
    ("database/schema/approval.schema.sql",       "database/schema/approval.schema.sql"),
]

for v3_rel, gm_rel in SQL_MAP:
    src = V3_ROOT / v3_rel
    dst = GM_SRC / gm_rel
    if not src.exists():
        stats["skipped"] += 1
        continue
    if not dst.exists():
        content = read(src)
        if len(content) > 100:
            write(dst, content)
            stats["created"] += 1
            print(f"  OK [CREATED] {gm_rel}")
    else:
        stats["skipped"] += 1

print()

# ============================================================================
# PHASE 7: V3 DOCS + REPORTS → GM (reference material)
# ============================================================================
print("=" * 60)
print("PHASE 7: V3 DOCS + AUDIT REPORTS")
print("=" * 60)

DOCS_MAP = [
    ("docs/architecture/CELL_MANIFEST_SCHEMA.json",                        "docs/architecture/CELL_MANIFEST_SCHEMA.json"),
    ("docs/specs/business/inventory-cell/inventory-business-context.md",   "docs/specs/business/inventory-cell/inventory-business-context.md"),
    ("docs/specs/business/inventory-cell/inventory-cell-tests.spec.md",    "docs/specs/business/inventory-cell/inventory-cell-tests.spec.md"),
    ("goldmaster_semantic_20260223_190206.md",                             "docs/reports/goldmaster_semantic_latest.md"),
]

for v3_rel, gm_rel in DOCS_MAP:
    src = V3_ROOT / v3_rel
    dst = GM_SRC / gm_rel
    if src.exists() and not dst.exists():
        content = read(src)
        if content:
            write(dst, content)
            stats["created"] += 1
            print(f"  OK [CREATED] {gm_rel}")

print()

# ============================================================================
# SUMMARY
# ============================================================================
total = stats["created"] + stats["upgraded"] + stats["skipped"]
print("=" * 60)
print("MIGRATION COMPLETE")
print("=" * 60)
print(f"  Created  (new files):    {stats['created']}")
print(f"  Upgraded (stub->impl):   {stats['upgraded']}")
print(f"  Skipped  (OK or N/A):   {stats['skipped']}")
print(f"  Total processed:         {total}")
print(f"\n  Backups: {BACKUP}")
print(f"\n  Next: npx tsc --noEmit")
