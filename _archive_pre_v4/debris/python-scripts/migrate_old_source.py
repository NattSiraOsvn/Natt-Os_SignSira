#!/usr/bin/env python3
"""
migrate_old_source.py
=====================
Khai thác triệt để code từ file cũ (services_natt-os-unified-enterprise-intelligence_version-2)
vào natt-os ver goldmaster.

SYSTEM_DISCIPLINE_ORDER: verify-before-modify, no guessing, absolute path integrity.

Strategy:
  1. Skeleton services/components (< 25 lines) -> replace with old source implementation
  2. Super-dictionary (0 bytes) -> inject old SuperDictionary.ts
  3. Missing canonical service files -> create from old source
  4. Missing components (valuable, >80 lines) -> copy to components/
  5. Missing ingestion subsystem files -> create
  6. Adapt all imports: '../types' -> '@/types', etc.

Author: Bang (Claude) - Feb 2026
"""

import os
import re
import shutil
from pathlib import Path
from datetime import datetime

# ============================================================================
# PATHS
# ============================================================================
OLD_ROOT   = Path("/tmp/old_source")
GM_ROOT    = Path("/home/claude/natt-os/natt-os ver goldmaster/src")
BACKUP_DIR = Path(f"/home/claude/migrate_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}")

# ============================================================================
# IMPORT ADAPTATION RULES  (pattern, replacement)
# ============================================================================
IMPORT_RULES = [
    (r"from ['\"]\.\.\/types['\"]",              "from '@/types'"),
    (r"from ['\"]\.\.\/\.\.\/types['\"]",         "from '@/types'"),
    (r"from ['\"]\.\/\.\.\/types['\"]",           "from '@/types'"),
    (r"from ['\"]\.\.\/SuperDictionary['\"]",     "from '@/super-dictionary'"),
    (r"from ['\"]\.\/SuperDictionary['\"]",       "from '@/super-dictionary'"),
    (r"from ['\"]\.\.\/\.\.\/SuperDictionary['\"]", "from '@/super-dictionary'"),
    (r"from ['\"]\.\/notificationService['\"]",   "from './notification-service'"),
    (r"from ['\"]\.\/notificationservice['\"]",   "from './notification-service'"),
    (r"from ['\"]\.\/blockchainService['\"]",     "from './blockchain-service'"),
    (r"from ['\"]\.\/quantumBufferService['\"]",  "from './quantum-buffer-service'"),
    (r"from ['\"]\.\/sellerEngine['\"]",          "from './seller-engine'"),
    (r"from ['\"]\.\/customsUtils['\"]",          "from './customs-utils'"),
    (r"from ['\"]\.\/calibration\/CalibrationEngine['\"]", "from './calibration/calibration-engine'"),
    (r"from ['\"]\.\/staging\/EventStagingLayer['\"]",     "from './staging/event-staging-layer'"),
]

def adapt_imports(content: str) -> str:
    for pattern, replacement in IMPORT_RULES:
        content = re.sub(pattern, replacement, content)
    return content

def read_file(path: Path) -> str:
    try:
        return path.read_text(encoding='utf-8')
    except Exception as e:
        print(f"  WARN Read error {path}: {e}")
        return ""

def write_file(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding='utf-8')

def backup_file(path: Path):
    if path.exists():
        rel = path.relative_to(GM_ROOT)
        backup = BACKUP_DIR / rel
        backup.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(str(path), str(backup))

def is_skeleton(content: str, lines: int) -> bool:
    if lines < 25:
        return True
    skeleton_patterns = [
        r'// Stub for',
        r'// Alias:.*\->',
        r'export const \w+ = \{\}',
        r'will be implemented later',
        r'placeholder',
    ]
    for p in skeleton_patterns:
        if re.search(p, content, re.I):
            return True
    return False

# ============================================================================
# MAIN
# ============================================================================
stats = {"upgraded": 0, "created": 0, "skipped": 0}
BACKUP_DIR.mkdir(parents=True, exist_ok=True)
print(f"Backup dir: {BACKUP_DIR}")
print(f"Starting migration...\n")

# ============================================================================
# 1. SUPER DICTIONARY (0 bytes -> 347L)
# ============================================================================
print("=" * 60)
print("1. SUPER DICTIONARY")
print("=" * 60)
old_sd = OLD_ROOT / "SuperDictionary.ts"
gm_sd  = GM_ROOT / "super-dictionary.ts"
if old_sd.exists():
    content = read_file(old_sd)
    if content.strip():
        backup_file(gm_sd)
        write_file(gm_sd, content)
        print(f"  OK SuperDictionary -> super-dictionary.ts ({content.count(chr(10))}L)")
        stats["upgraded"] += 1
    else:
        print("  WARN Old SuperDictionary is empty")

# Update superdictionary.ts alias if thin
gm_sdup = GM_ROOT / "superdictionary.ts"
if gm_sdup.exists():
    sc = read_file(gm_sdup)
    if is_skeleton(sc, sc.count('\n')):
        write_file(gm_sdup, "// Alias: superdictionary.ts -> super-dictionary.ts\nexport * from './super-dictionary';\n")
        print(f"  OK Updated superdictionary.ts alias")
print()

# ============================================================================
# 2. SERVICES
# ============================================================================
print("=" * 60)
print("2. SERVICES - SKELETON UPGRADE / NEW FILES")
print("=" * 60)

service_migrations = [
    ("services/customsService.ts",           "services/customs-service.ts",              "CustomsService"),
    ("services/sellerEngine.ts",             "services/seller-engine.ts",                "SellerEngine"),
    ("services/threatDetectionService.ts",   "services/threat-detection-service.ts",     "ThreatDetectionService"),
    ("services/authService.ts",              "services/auth-service.ts",                 "AuthService"),
    ("services/learningEngine.ts",           "services/learning-engine.ts",              "LearningEngine"),
    ("services/blockchainService.ts",        "services/blockchain-service.ts",           "BlockchainService"),
    ("services/quantumBufferService.ts",     "services/quantum-buffer-service.ts",       "QuantumBufferService"),
    ("services/documentAI.ts",               "services/documentai.ts",                   "DocumentAI (full impl)"),
    ("services/gdbEngine.ts",                "services/gdb-engine.ts",                   "GDBEngine"),
    ("services/eInvoiceEngine.ts",           "services/e-invoice-engine.ts",             "EInvoiceEngine"),
    ("services/moduleHelpers.ts",            "services/module-helpers.ts",               "ModuleHelpers"),
    ("services/productionService.ts",        "services/production-service.ts",           "ProductionService"),
    ("src/services/offlineService.ts",       "services/offline-service.ts",              "OfflineService"),
    ("src/services/realTimeNotificationService.ts", "services/real-time-notification-service.ts", "RealTimeNotificationService"),
    ("src/services/dictionaryService.ts",    "services/dictionary-service-impl.ts",      "DictionaryService impl"),
    ("src/services/mapping/SmartLinkMappingEngine.ts", "services/mapping/smart-link-mapping-engine-impl.ts", "SmartLinkMappingEngine impl"),
    ("src/services/approval/ApprovalWorkflowService.ts", "services/approval/approval-workflow-service.ts", "ApprovalWorkflowService"),
    ("src/services/taxReportService.ts",     "services/tax-report-service-impl.ts",      "TaxReportService impl"),
    ("src/services/recoveryEngine.ts",       "services/recovery-engine-impl.ts",         "RecoveryEngine impl"),
    ("src/services/salesCore.ts",            "services/sales-core-impl.ts",              "SalesCore impl"),
    ("src/services/fraudGuard.ts",           "services/fraud-guard-impl.ts",             "FraudGuard impl"),
]

for old_rel, gm_rel, desc in service_migrations:
    old_path = OLD_ROOT / old_rel
    gm_path  = GM_ROOT / gm_rel

    if not old_path.exists():
        stats["skipped"] += 1
        continue

    old_content = read_file(old_path)
    old_lines = old_content.count('\n')
    if old_lines < 20:
        stats["skipped"] += 1
        continue

    if gm_path.exists():
        gm_content = read_file(gm_path)
        gm_lines = gm_content.count('\n')
        if not is_skeleton(gm_content, gm_lines) and gm_lines >= old_lines - 20:
            print(f"  SKIP (GM OK {gm_lines}L): {gm_rel.split('/')[-1]}")
            stats["skipped"] += 1
            continue
        action = "UPGRADED"
        stats["upgraded"] += 1
    else:
        action = "CREATED"
        stats["created"] += 1

    new_content = adapt_imports(old_content)
    backup_file(gm_path)
    write_file(gm_path, new_content)
    print(f"  OK [{action}] {desc} ({old_lines}L) -> {gm_rel}")

print()

# ============================================================================
# 3. INGESTION SUBSYSTEM
# ============================================================================
print("=" * 60)
print("3. INGESTION SUBSYSTEM")
print("=" * 60)

ingestion_map = [
    ("services/ingestion/AIProcessor.ts",       "services/ingestion/ai-processor.ts"),
    ("services/ingestion/extractors.ts",         "services/ingestion/extractors.ts"),
    ("services/ingestion/DictionaryGuard.ts",    "services/ingestion/dictionary-guard.ts"),
    ("services/ingestion/IdempotencyManager.ts", "services/ingestion/idempotency-manager.ts"),
    ("services/ingestion/utils.ts",              "services/ingestion/ingestion-utils.ts"),
    ("core/ingestion/IngestionService.ts",       "core/ingestion/ingestion-service-impl.ts"),
    ("core/processing/ai/AICoreProcessor.ts",    "core/processing/ai/ai-core-processor-impl.ts"),
    ("core/signals/types.ts",                    "core/signals/signals-types-impl.ts"),
]

for old_rel, gm_rel in ingestion_map:
    old_path = OLD_ROOT / old_rel
    gm_path  = GM_ROOT / gm_rel

    if not old_path.exists():
        stats["skipped"] += 1
        continue

    old_content = read_file(old_path)
    old_lines = old_content.count('\n')

    if gm_path.exists():
        gm_content = read_file(gm_path)
        gm_lines = gm_content.count('\n')
        if not is_skeleton(gm_content, gm_lines) and gm_lines >= old_lines - 10:
            print(f"  SKIP (GM OK): {gm_rel.split('/')[-1]}")
            stats["skipped"] += 1
            continue

    new_content = adapt_imports(old_content)
    backup_file(gm_path)
    write_file(gm_path, new_content)
    action = "UPGRADED" if (GM_ROOT / gm_rel).exists() else "CREATED"
    stats[action.lower().replace("d",""+"d")] if False else None
    stats["created"] += 1
    print(f"  OK [{action}] {old_rel.split('/')[-1]} ({old_lines}L) -> {gm_rel}")

print()

# ============================================================================
# 4. COMPONENTS
# ============================================================================
print("=" * 60)
print("4. COMPONENTS - SKELETON UPGRADE / MISSING")
print("=" * 60)

component_migrations = [
    # (old_rel, gm_rel, description, min_old_lines)
    ("components/CustomizationRequest.tsx",     "components/customizationrequest.tsx",        "CustomizationRequest", 50),
    ("components/FilterPanel.tsx",              "components/filterpanel.tsx",                 "FilterPanel", 50),
    ("components/ProductDetailModal.tsx",       "components/productdetailmodal.tsx",          "ProductDetailModal", 50),
    ("components/ProductCard.tsx",              "components/productcard.tsx",                 "ProductCard", 50),
    ("src/components/common/ErrorBoundary.tsx", "components/error-boundary.tsx",              "ErrorBoundary", 20),
    ("src/components/financial/FinancialDashboard.tsx", "components/financial/financial-dashboard.tsx", "FinancialDashboard", 50),
    ("src/components/approval/ApprovalDashboard.tsx",   "components/approval/approval-dashboard.tsx",   "ApprovalDashboard", 50),
    ("components/SalesCRM.tsx",                 "components/sales-crm-impl.tsx",             "SalesCRM impl", 100),
    ("src/components/SalesTerminal.tsx",        "components/sales-terminal-impl.tsx",        "SalesTerminal impl", 100),
    ("src/components/SellerTerminal.tsx",       "components/seller-terminal-impl.tsx",       "SellerTerminal impl", 80),
    ("src/components/SalesTaxModule.tsx",       "components/sales-tax-module-impl.tsx",      "SalesTaxModule impl", 80),
    ("src/components/AdminConfigHub.tsx",       "components/admin-config-hub-impl.tsx",      "AdminConfigHub impl", 80),
    ("src/components/SystemMonitor.tsx",        "components/system-monitor-impl.tsx",        "SystemMonitor impl", 80),
    ("src/components/ChatConsultant.tsx",       "components/chat-consultant-impl.tsx",       "ChatConsultant impl", 80),
    ("src/components/RBACManager.tsx",          "components/rbac-manager-impl.tsx",          "RBACManager impl", 80),
    ("src/components/AuditTrailModule.tsx",     "components/audit-trail-impl.tsx",           "AuditTrailModule impl", 80),
    ("components/DataArchiveVault.tsx",         "components/data-archive-vault.tsx",         "DataArchiveVault", 80),
    ("components/OperationsTerminal.tsx",       "components/operations-terminal.tsx",        "OperationsTerminal", 80),
    ("components/QuantumFlowOrchestrator.tsx",  "components/quantum-flow-orchestrator.tsx",  "QuantumFlowOrchestrator", 80),
    ("components/ProductionSalesFlowView.tsx",  "components/production-sales-flow-view.tsx", "ProductionSalesFlowView", 80),
    ("components/SmartLinkMapper.tsx",          "components/smart-link-mapper.tsx",          "SmartLinkMapper", 80),
    ("components/GovernanceWorkspace.tsx",      "components/governance-workspace.tsx",       "GovernanceWorkspace", 80),
    ("components/DataSyncEngine.tsx",           "components/data-sync-engine.tsx",           "DataSyncEngine", 80),
    ("components/SecurityOverlay.tsx",          "components/security-overlay.tsx",           "SecurityOverlay", 80),
    ("components/SupplierClassificationPanel.tsx", "components/supplier-classification-panel.tsx", "SupplierClassificationPanel", 80),
    ("components/LearningHub.tsx",              "components/learning-hub.tsx",               "LearningHub", 80),
    ("components/BankingProcessor.tsx",         "components/banking-processor.tsx",          "BankingProcessor", 80),
    ("components/CompliancePortal.tsx",         "components/compliance-portal.tsx",          "CompliancePortal", 80),
    ("components/TaxReportingHub.tsx",          "components/tax-reporting-hub.tsx",          "TaxReportingHub", 80),
    ("components/FinanceAudit.tsx",             "components/finance-audit.tsx",              "FinanceAudit", 80),
    ("components/PaymentHub.tsx",               "components/payment-hub.tsx",                "PaymentHub", 80),
    ("components/ProductCatalog.tsx",           "components/product-catalog.tsx",            "ProductCatalog", 100),
    ("components/CollaborationRooms.tsx",       "components/collaboration-rooms.tsx",        "CollaborationRooms", 100),
    ("components/DevPortal.tsx",                "components/dev-portal.tsx",                 "DevPortal", 100),
    ("components/WarehouseManagement.tsx",      "components/warehouse-management.tsx",       "WarehouseManagement", 100),
    ("components/HRManagement.tsx",             "components/hr-management.tsx",              "HRManagement", 80),
    ("components/HRCompliance.tsx",             "components/hr-compliance.tsx",              "HRCompliance", 80),
    ("components/GovernanceModule.tsx",         "components/governance-module.tsx",          "GovernanceModule", 80),
    ("components/UnifiedReportingHub.tsx",      "components/unified-reporting-hub.tsx",      "UnifiedReportingHub", 80),
    ("components/SalesArchitectureView.tsx",    "components/sales-architecture-view.tsx",    "SalesArchitectureView", 80),
    ("components/SystemNavigator.tsx",          "components/system-navigator.tsx",           "SystemNavigator", 80),
    ("components/AdvancedAnalytics.tsx",        "components/advanced-analytics.tsx",         "AdvancedAnalytics", 80),
    ("components/BlueprintWizard.tsx",          "components/blueprint-wizard.tsx",           "BlueprintWizard", 80),
    ("components/NotificationHub.tsx",          "components/notification-hub.tsx",           "NotificationHub", 80),
    ("components/DynamicModuleRenderer.tsx",    "components/dynamic-module-renderer.tsx",    "DynamicModuleRenderer", 80),
    ("components/ProductionWallboard.tsx",      "components/production-wallboard.tsx",       "ProductionWallboard", 80),
    ("components/ProductionManager.tsx",        "components/production-manager.tsx",         "ProductionManager", 80),
    ("components/RFMAnalysis.tsx",              "components/rfm-analysis.tsx",               "RFMAnalysis", 50),
    ("components/DataAnalytics.tsx",            "components/data-analytics.tsx",             "DataAnalytics", 50),
    ("components/SystemTicker.tsx",             "components/system-ticker.tsx",              "SystemTicker", 50),
    ("components/DailyReportModule.tsx",        "components/daily-report-module.tsx",        "DailyReportModule", 80),
    ("components/ThienCommandCenter.tsx",       "components/thien-command-center.tsx",       "ThienCommandCenter", 80),
    ("components/QuickHelp.tsx",                "components/quick-help.tsx",                 "QuickHelp", 80),
    ("components/PersonalSphere.tsx",           "components/personal-sphere.tsx",            "PersonalSphere", 50),
    ("components/LiveVoice.tsx",                "components/live-voice.tsx",                 "LiveVoice", 50),
]

for old_rel, gm_rel, desc, min_lines in component_migrations:
    old_path = OLD_ROOT / old_rel
    gm_path  = GM_ROOT / gm_rel

    if not old_path.exists():
        stats["skipped"] += 1
        continue

    old_content = read_file(old_path)
    old_lines = old_content.count('\n')

    if old_lines < min_lines:
        stats["skipped"] += 1
        continue

    if gm_path.exists():
        gm_content = read_file(gm_path)
        gm_lines = gm_content.count('\n')
        if not is_skeleton(gm_content, gm_lines):
            print(f"  SKIP (GM OK {gm_lines}L): {gm_rel.split('/')[-1]}")
            stats["skipped"] += 1
            continue
        action = "UPGRADED"
        stats["upgraded"] += 1
    else:
        action = "CREATED"
        stats["created"] += 1

    new_content = adapt_imports(old_content)
    backup_file(gm_path)
    write_file(gm_path, new_content)
    print(f"  OK [{action}] {desc} ({old_lines}L)")

print()

# ============================================================================
# 5. UTILITIES & EXTRAS
# ============================================================================
print("=" * 60)
print("5. UTILITIES & EXTRAS")
print("=" * 60)

extras = [
    ("utils/supplierClassifier.ts",   "utils/supplier-classifier-impl.ts"),
    ("utils/supplierImportHelper.ts", "utils/supplier-import-helper.ts"),
    ("contexts/AccountingContext.tsx", "contexts/accounting-context-impl.tsx"),
    ("contexts/MappingContext.tsx",    "contexts/mapping-context-impl.tsx"),
    ("hooks/useSmartMapping.ts",       "hooks/use-smart-mapping-impl.ts"),
    ("hooks/useRealTimeSync.ts",       "hooks/use-real-time-sync.ts"),
    ("hooks/useAuthority.ts",          "hooks/use-authority.ts"),
    ("hooks/useSupplierClassification.ts", "hooks/use-supplier-classification.ts"),
    ("database/schema/approval_schema.sql", "database/schema/approval_schema.sql"),
    ("types/accounting.types.ts",     "types/accounting-impl.types.ts"),
    ("src/types/enums.ts",            "types/enums-impl.ts"),
    ("src/types/interfaces.ts",       "types/interfaces-impl.ts"),
]

for old_rel, gm_rel in extras:
    old_path = OLD_ROOT / old_rel
    gm_path  = GM_ROOT / gm_rel

    if not old_path.exists():
        stats["skipped"] += 1
        continue

    old_content = read_file(old_path)
    old_lines = old_content.count('\n')
    if old_lines < 10:
        stats["skipped"] += 1
        continue

    if gm_path.exists():
        gm_content = read_file(gm_path)
        gm_lines = gm_content.count('\n')
        if not is_skeleton(gm_content, gm_lines) and gm_lines >= old_lines - 5:
            stats["skipped"] += 1
            continue

    new_content = adapt_imports(old_content)
    backup_file(gm_path)
    write_file(gm_path, new_content)
    action = "UPGRADED" if gm_path.exists() else "CREATED"
    stats["created"] += 1
    print(f"  OK [{action}] {gm_rel} ({old_lines}L)")

print()

# ============================================================================
# 6. FIX ALIASES POINTING TO MISSING CANONICALS
# ============================================================================
print("=" * 60)
print("6. FIX STALE ALIASES")
print("=" * 60)

alias_fixes = [
    ("services/customsservice.ts",         "services/customs-service.ts"),
    ("services/sellerengine.ts",           "services/seller-engine.ts"),
    ("services/learningengine.ts",         "services/learning-engine.ts"),
    ("services/threatdetectionservice.ts", "services/threat-detection-service.ts"),
    ("services/authservice.ts",            "services/auth-service.ts"),
    ("services/blockchainservice.ts",      "services/blockchain-service.ts"),
    ("services/quantumbufferservice.ts",   "services/quantum-buffer-service.ts"),
]

for alias_rel, canonical_rel in alias_fixes:
    alias_path     = GM_ROOT / alias_rel
    canonical_path = GM_ROOT / canonical_rel

    if not alias_path.exists():
        continue
    if not canonical_path.exists():
        print(f"  SKIP alias fix (canonical not created): {canonical_rel}")
        continue

    alias_content = read_file(alias_path)
    if is_skeleton(alias_content, alias_content.count('\n')):
        canonical_name = canonical_rel.replace('services/', '').replace('.ts', '')
        new_alias = (
            f"// Alias: {alias_rel.split('/')[-1]} -> {canonical_rel.split('/')[-1]}\n"
            f"export * from './{canonical_name}';\n"
        )
        backup_file(alias_path)
        write_file(alias_path, new_alias)
        print(f"  OK Fixed alias: {alias_rel.split('/')[-1]} -> {canonical_rel.split('/')[-1]}")

print()

# ============================================================================
# SUMMARY
# ============================================================================
print("=" * 60)
print("MIGRATION COMPLETE")
print("=" * 60)
print(f"  Upgraded (skeleton -> implementation): {stats['upgraded']}")
print(f"  Created  (new files):                  {stats['created']}")
print(f"  Skipped  (already OK or not found):   {stats['skipped']}")
print(f"\n  Backups saved to: {BACKUP_DIR}")
print(f"\n  Next step: cd to goldmaster dir and run 'npx tsc --noEmit'")
