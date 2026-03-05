#!/usr/bin/env python3
"""NATT-OS types.ts patcher v2 — fixes 325 tsc errors"""
import re, shutil, sys
from pathlib import Path

DRY_RUN = '--dry-run' in sys.argv
TYPES_FILE = Path('src/types.ts')

if not TYPES_FILE.exists():
    print("❌ src/types.ts not found. Run from project root.")
    sys.exit(1)

content = TYPES_FILE.read_text(encoding='utf-8')
original = content
patches = []

def patch(desc, find, replacement):
    global content
    if find in content:
        if not DRY_RUN:
            content = content.replace(find, replacement, 1)
        patches.append(f"✅ {desc}")
    else:
        patches.append(f"⚠️  SKIP (not found): {desc}")

patch("UserPosition: add role + id",
    "export interface UserPosition {",
    "export interface UserPosition {\n  id: string;\n  role: string;")

patch("ConflictResolutionRule: add strategy",
    "export interface ConflictResolutionRule {",
    "export interface ConflictResolutionRule {\n  strategy: 'last-write-wins' | 'merge' | 'manual' | string;")

patch("AccountingMappingRule: add sourceType",
    "export interface AccountingMappingRule {",
    "export interface AccountingMappingRule {\n  sourceType?: string;")

patch("CellHealthState: add cell_id + uptime + last_heartbeat + message",
    "export interface CellHealthState {",
    "export interface CellHealthState {\n  cell_id?: string;\n  uptime?: number;\n  last_heartbeat?: number;\n  message?: string;")

patch("ApprovalRequest: add title + data + requiredApprovers + deadline",
    "export interface ApprovalRequest {",
    "export interface ApprovalRequest {\n  title?: string;\n  data?: Record<string, unknown>;\n  requiredApprovers?: string[];\n  deadline?: number;")

patch("CustomerLead: add tier + createdAt",
    "export interface CustomerLead {",
    "export interface CustomerLead {\n  tier?: string;\n  createdAt?: number;")

patch("AccountingEntry: add debit + credit + accountNumber + updated_at + total_orders",
    "export interface AccountingEntry {",
    "export interface AccountingEntry {\n  debit?: number;\n  credit?: number;\n  accountNumber?: string;\n  updated_at?: number;\n  total_orders?: number;")

patch("ApprovalTicket: add title + data + approvalHistory",
    "export interface ApprovalTicket {",
    "export interface ApprovalTicket {\n  title?: string;\n  data?: Record<string, unknown>;\n  approvalHistory?: Array<{approver: string; action: string; timestamp: number; note?: string}>;")

patch("AuditTrailEntry: add status optional",
    "export interface AuditTrailEntry {",
    "export interface AuditTrailEntry {\n  status?: string;")

APPEND = """
// ── AUTO-PATCHED by fix_types.py v2 ──────────────────────────────────────
export type TxStatus = 'pending' | 'success' | 'failed' | 'cancelled' | 'processing';

export interface ConflictRecord {
  id: string;
  entityId: string;
  entityType: string;
  conflictType: string;
  data: Record<string, unknown>;
  resolvedAt?: number;
  resolvedBy?: string;
  resolution?: string;
  createdAt: number;
}

export interface SalaryRule {
  id: string;
  division?: string;
  role?: string;
  grade?: string;
  salary: number;
  effectiveDate?: number;
}
"""

if 'TxStatus' not in content:
    if not DRY_RUN:
        content += APPEND
    patches.append("✅ Appended: TxStatus, ConflictRecord, SalaryRule")
else:
    patches.append("⚠️  SKIP: TxStatus already exists")

# Ghost import fixes
IMPORT_MAP = {
    "../quantumbufferservice": "@/services/quantum-buffer-service",
    "./quantumbufferservice":  "@/services/quantum-buffer-service",
    ".@/services/notification-service": "@/services/notification-service",
    ".@/services/sharding-service":     "@/services/sharding-service",
    "../services/geminiService":        "@/services/gemini-service",
    "../services/exportService":        "@/services/export-service",
    "../services/paymentService":       "@/services/payment-service",
    "../services/logisticsService":     "@/services/logistics-service",
    "../services/salesCore":            "@/services/sales-core",
    "../services/taskRouter":           "@/services/task-router",
    "../services/taxReportService":     "@/services/tax-report-service",
    "../services/authService":          "@/services/auth-service",
    "../services/customsService":       "@/services/customs-service",
    "../services/gmailService":         "@/services/gmail-service",
    "../services/fraudGuard":           "@/services/fraud-guard",
    "../services/sellerEngine":         "@/services/seller-engine",
    "../services/personnelEngine":      "@/services/personnel-engine",
    "../services/moduleRegistry":       "@/services/module-registry",
    "../services/learningEngine":       "@/services/learning-engine",
    "../services/bankingService":       "@/services/banking-service",
    "../services/aiEngine":             "@/services/ai-engine",
    "../services/quantumEngine":        "@/services/quantum-engine",
    "./calibration/CalibrationEngine":  "@/services/calibration/calibration-engine",
}

src_dir = Path('src')
ghost_fixed = 0
for ts_file in src_dir.rglob('*.ts'):
    if '_archive' in str(ts_file):
        continue
    try:
        fc = ts_file.read_text(encoding='utf-8')
        modified = fc
        for old, new in IMPORT_MAP.items():
            if old in modified:
                modified = modified.replace(old, new)
                ghost_fixed += 1
        if modified != fc and not DRY_RUN:
            ts_file.write_text(modified, encoding='utf-8')
    except Exception as e:
        print(f"  ⚠️  {ts_file}: {e}")

patches.append(f"✅ Ghost imports fixed: {ghost_fixed} replacements")

if not DRY_RUN and content != original:
    shutil.copy(TYPES_FILE, TYPES_FILE.with_suffix('.ts.bak'))
    TYPES_FILE.write_text(content, encoding='utf-8')
    print(f"✅ types.ts patched (backup: types.ts.bak)")

print("\n".join(patches))
print(f"\n{'DRY RUN' if DRY_RUN else 'DONE'}")
