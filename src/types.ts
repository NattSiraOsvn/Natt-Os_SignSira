// ============================================================
// src/types.ts — NATT-OS Central Type Registry
// Reconstructed by Băng & Kim
// ============================================================

// --- Enums (const objects + types) ---

export const ConstitutionalState = {
  BOOTING: 'BOOTING',
  ACTIVE: 'ACTIVE',
  DEGRADED: 'DEGRADED',
  LOCKDOWN: 'LOCKDOWN',
  MAINTENANCE: 'MAINTENANCE',
} as const;
export type ConstitutionalState = typeof ConstitutionalState[keyof typeof ConstitutionalState];

export const IngestStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMMITTED: 'COMMITTED',
  FAILED: 'FAILED',
  QUARANTINED: 'QUARANTINED',
  QUEUED: 'QUEUED',
  EXTRACTING: 'EXTRACTING',
  MAPPING: 'MAPPING',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
} as const;
export type IngestStatus = typeof IngestStatus[keyof typeof IngestStatus];

export const SyncConflictStrategy = {
  MERGE: 'MERGE',
  SOURCE_WINS: 'SOURCE_WINS',
  DESTINATION_WINS: 'DESTINATION_WINS',
  MANUAL: 'MANUAL',
  CRP: 'CRP',
} as const;
export type SyncConflictStrategy = typeof SyncConflictStrategy[keyof typeof SyncConflictStrategy];

export const AlertLevel = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
  EMERGENCY: 'EMERGENCY',
  FATAL: 'FATAL',
} as const;
export type AlertLevel = typeof AlertLevel[keyof typeof AlertLevel];

export const ModuleID = {
  SALES: 'SALES',
  INVENTORY: 'INVENTORY',
  WAREHOUSE: 'WAREHOUSE',
  ACCOUNTING: 'ACCOUNTING',
  HR: 'HR',
  AUDIT: 'AUDIT',
  CUSTOMS: 'CUSTOMS',
  SHOWROOM: 'SHOWROOM',
  ANALYTICS: 'ANALYTICS',
  GOVERNANCE: 'GOVERNANCE',
  FINANCE: 'FINANCE',
} as const;
export type ModuleID = typeof ModuleID[keyof typeof ModuleID] | string;

export const PersonaID = {
  THIEN: 'THIEN',
  CAN: 'CAN',
  NA: 'NA',
  BANG: 'BANG',
  BOI_BOI: 'BOI_BOI',
  PHIEU: 'PHIEU',
  KIM: 'KIM',
  KRIS: 'KRIS',
  SYSTEM: 'SYSTEM',
} as const;
export type PersonaID = typeof PersonaID[keyof typeof PersonaID];

export const ViewType = {
  DASHBOARD: 'DASHBOARD',
  SALES: 'SALES',
  INVENTORY: 'INVENTORY',
  WAREHOUSE: 'WAREHOUSE',
  AUDIT: 'AUDIT',
  ANALYTICS: 'ANALYTICS',
  CUSTOMS: 'CUSTOMS',
  SHOWROOM: 'SHOWROOM',
  HR: 'HR',
  SETTINGS: 'SETTINGS',
  GOVERNANCE: 'GOVERNANCE',
  FACTORY: 'FACTORY',
  OMEGA: 'OMEGA',
  sales_terminal: 'sales_terminal',
  chat: 'chat',
  production_manager: 'production_manager',
  sales_tax: 'sales_tax',
  command: 'command',
  monitoring: 'monitoring',
  audit_center: 'audit_center',
} as const;
export type ViewType = typeof ViewType[keyof typeof ViewType];

export const UserRole = {
  MASTER: 'MASTER',
  LEVEL_5: 'LEVEL_5',
  LEVEL_2: 'LEVEL_2',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  SALES_STAFF: 'SALES_STAFF',
  WAREHOUSE_STAFF: 'WAREHOUSE_STAFF',
  ACCOUNTANT: 'ACCOUNTANT',
  AUDITOR: 'AUDITOR',
  VIEWER: 'VIEWER',
  STAFF: 'STAFF',
  SENIOR_STAFF: 'SENIOR_STAFF',
  // V2 compatibility aliases
  LEVEL_1: 'LEVEL_1',
  LEVEL_3: 'LEVEL_3',
  LEVEL_4: 'LEVEL_4',
  LEVEL_6: 'LEVEL_6',
  LEVEL_7: 'LEVEL_7',
  LEVEL_8: 'LEVEL_8',
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const PositionType = {
  DIRECTOR: 'DIRECTOR',
  MANAGER: 'MANAGER',
  SENIOR_STAFF: 'SENIOR_STAFF',
  STAFF: 'STAFF',
  INTERN: 'INTERN',
  COLLABORATOR: 'COLLABORATOR',
  CHAIRMAN: 'CHAIRMAN',
  CONSULTANT: 'CONSULTANT',
  CFO: 'CFO',
  // V2 compatibility
  CEO: 'CEO',
  ROUGH_FINISHER: 'ROUGH_FINISHER',
  CASTING_MANAGER: 'CASTING_MANAGER',
  PROD_DIRECTOR: 'PROD_DIRECTOR',
  GENERAL_MANAGER: 'GENERAL_MANAGER',
} as const;
export type PositionType = typeof PositionType[keyof typeof PositionType];

export const Department = {
  SALES: 'SALES',
  PRODUCTION: 'PRODUCTION',
  WAREHOUSE: 'WAREHOUSE',
  ACCOUNTING: 'ACCOUNTING',
  HR: 'HR',
  IT: 'IT',
  LEGAL: 'LEGAL',
  HEADQUARTER: 'HEADQUARTER',
} as const;
export type Department = typeof Department[keyof typeof Department];

export const Domain = {
  SALES: 'SALES',
  INVENTORY: 'INVENTORY',
  WAREHOUSE: 'WAREHOUSE',
  ACCOUNTING: 'ACCOUNTING',
  HR: 'HR',
  AUDIT: 'AUDIT',
  GOVERNANCE: 'GOVERNANCE',
  CUSTOMS: 'CUSTOMS',
  PRODUCTION: 'PRODUCTION',
  SHOWROOM: 'SHOWROOM',
  SALES_TAX: 'SALES_TAX',
  LEGAL: 'LEGAL',
  IT: 'IT',
} as const;
export type Domain = typeof Domain[keyof typeof Domain];

export const ApprovalStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ESCALATED: 'ESCALATED',
} as const;
export type ApprovalStatus = typeof ApprovalStatus[keyof typeof ApprovalStatus];

export const StockStatus = {
  IN_STOCK: 'IN_STOCK',
  LOW_STOCK: 'LOW_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  RESERVED: 'RESERVED',
  AVAILABLE: 'AVAILABLE',
} as const;
export type StockStatus = typeof StockStatus[keyof typeof StockStatus];

export const WarehouseLocation = {
  HCM_HEADQUARTER: 'HCM_HEADQUARTER',
  HN_BRANCH: 'HN_BRANCH',
  MAIN_VAULT: 'MAIN_VAULT',
  SHOWROOM_FLOOR: 'SHOWROOM_FLOOR',
  HANOI_BRANCH: 'HANOI_BRANCH',
  DA_NANG_BRANCH: 'DA_NANG_BRANCH',
} as const;
export type WarehouseLocation = typeof WarehouseLocation[keyof typeof WarehouseLocation];

export const EInvoiceStatus = {
  DRAFT: 'DRAFT',
  ISSUED: 'ISSUED',
  CANCELLED: 'CANCELLED',
  REPLACED: 'REPLACED',
  XML_BUILT: 'XML_BUILT',
  SIGNED: 'SIGNED',
  ACCEPTED: 'ACCEPTED',
} as const;
export type EInvoiceStatus = typeof EInvoiceStatus[keyof typeof EInvoiceStatus];

export const OrderStatus = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DESIGNING: 'DESIGNING',
  CASTING: 'CASTING',
  COLD_WORK: 'COLD_WORK',
  STONE_SETTING: 'STONE_SETTING',
  FINISHING: 'FINISHING',
  QC_PENDING: 'QC_PENDING',
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const SalesChannel = {
  IN_STORE: 'IN_STORE',
  REFERRAL: 'REFERRAL',
  ONLINE_INQUIRY: 'ONLINE_INQUIRY',
  EVENT: 'EVENT',
  WHOLESALE: 'WHOLESALE',
  ONLINE: 'ONLINE',
  DIRECT_SALE: 'DIRECT_SALE',
  LOGISTICS: 'LOGISTICS',
} as const;
export type SalesChannel = typeof SalesChannel[keyof typeof SalesChannel];

export const ProductType = {
  RING: 'RING',
  NECKLACE: 'NECKLACE',
  BRACELET: 'BRACELET',
  EARRING: 'EARRING',
  PENDANT: 'PENDANT',
  CUSTOM: 'CUSTOM',
} as const;
export type ProductType = typeof ProductType[keyof typeof ProductType];

export const PolicyStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED',
} as const;
export type PolicyStatus = typeof PolicyStatus[keyof typeof PolicyStatus];

export const PolicyType = {
  INTERNAL: 'INTERNAL',
  REGULATORY: 'REGULATORY',
  CONTRACTUAL: 'CONTRACTUAL',
  OPERATIONAL: 'OPERATIONAL',
} as const;
export type PolicyType = typeof PolicyType[keyof typeof PolicyType];

export const ComplianceRequestType = {
  AUDIT: 'AUDIT',
  CERTIFICATION: 'CERTIFICATION',
  INSPECTION: 'INSPECTION',
  REVIEW: 'REVIEW',
} as const;
export type ComplianceRequestType = typeof ComplianceRequestType[keyof typeof ComplianceRequestType];

export const CertType = {
  ISO: 'ISO',
  KIMBERLEY: 'KIMBERLEY',
  ORIGIN: 'ORIGIN',
  QUALITY: 'QUALITY',
  CUSTOMS: 'CUSTOMS',
} as const;
export type CertType = typeof CertType[keyof typeof CertType];

export const RiskNodeStatus = {
  CLEAR: 'CLEAR',
  FLAGGED: 'FLAGGED',
  BLOCKED: 'BLOCKED',
  UNDER_REVIEW: 'UNDER_REVIEW',
} as const;
export type RiskNodeStatus = typeof RiskNodeStatus[keyof typeof RiskNodeStatus];

export const FinanceStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
} as const;
export type FinanceStatus = typeof FinanceStatus[keyof typeof FinanceStatus];

export const TrainingStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
} as const;
export type TrainingStatus = typeof TrainingStatus[keyof typeof TrainingStatus];

export const HeatLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
export type HeatLevel = typeof HeatLevel[keyof typeof HeatLevel];

export const SealingLevel = {
  NONE: 'NONE',
  SOFT: 'SOFT',
  HARD: 'HARD',
  CONSTITUTIONAL: 'CONSTITUTIONAL',
} as const;
export type SealingLevel = typeof SealingLevel[keyof typeof SealingLevel];

// --- Interfaces (giữ nguyên) ---

export interface BaseEvent<T = unknown> {
  event_id: string;
  event_type: string;
  event_version?: string;
  source_cell: string;
  source_module: string;
  actor: { persona?: string; user_id?: string; persona_id?: string };
  domain?: string;
  timestamp?: number;
  correlation_id: string;
  payload: T;
  audit_required: boolean;
}

export interface Event {
  id: string;
  type: string;
  payload: unknown;
  timestamp?: number;
  source: string;
  correlationId?: string;
  tenantId?: string;
}

export interface EventEnvelope {
  // ── Core causality chain fields (patent-critical) ──────────────────────
  event_id: string;            // Globally unique event identifier
  tenant_id: string;           // Enterprise isolation boundary
  causation_id: string;        // ID of event that caused this event
  span_id: string;             // Distributed tracing span
  policy_signature: string;    // HMAC of policy at time of emission
  payload_hash: string;        // SHA-256 of serialized payload
  // ── Envelope content ───────────────────────────────────────────────────
  event: BaseEvent;
  metadata: EventMetadata;

  payload?: any;
  trace?: any;
  occurred_at?: string;
  event_name?: string;
}

export interface EventMetadata {
  version: string;
  correlationId: string;
  causationId?: string;
  publishedAt?: number;
  // Patent fields
  spanId?: string;
  traceId?: string;
  policyVersion?: string;
  integrityVerified?: boolean;
}

export type EventHandler = (event: BaseEvent) => Promise<void>;

export interface SalesEvent {
  order?: any;
  orderId?: string;
  id: string;
  type: string;
  saleId: string;
  payload: unknown;
  timestamp: number;
}

export interface AuditRecord {
  record_id: string;
  timestamp: string;
  actor: { persona_id: string; user_id: string };
  action: string;
  scope: { cell: string; layer: string };
  payload: unknown;
  integrity_hash?: string;
  tenant_id: string;
  chain_id: string;
  sequence_number: number;
  event_type: string;
  payload_hash: string;
  prev_hash: string;
}

export interface AuditActor {
  persona_id: string;
  user_id: string;
  ip?: string;
}

export interface AuditScope {
  cell: string;
  layer: string;
  domain?: string;
}

export interface AuditChainHead {
  head_hash: string;
  record_count: number;
  last_updated: number;
}

export interface IntegrityState {
  isValid: boolean;
  lastChecked: number;
  violations: string[];
  brokenAt?: string;
}

export interface ActionLog {
  id: string;
  action: string;
  actor?: string;
  userId?: string;
  details?: string;
  userPosition?: string;
  module?: string;
  hash?: string;
  timestamp: number;
  result: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'FAILED' | 'RECOVERED';
}

export type GatekeeperDecision = {
  allowed: boolean;
  reason?: string;
  requiresApproval?: boolean;
  escalateTo?: string;
};

export type GatekeeperState = {
  state: ConstitutionalState;
  lockedAt?: number;
  lockedBy?: string;
  reason?: string;
};

export type EmergencyToken = {
  token: string;
  issuedBy: string;
  issuedAt: number;
  expiresAt: number;
  scope: string;
};

export interface StateChange {
  changedAt?: Date | number;
  domain: string;
  entityId: string;
  fromState: string;
  toState: string;
  actor?: string;
  userId?: string;
  details?: string;
  userPosition?: string;
  module?: string;
  hash?: string;
  timestamp: number;
  reason?: string;

  tenantId?: string;

  entityType?: string;

  changedBy?: string;

  causationId?: string;
}

export type StateRegistry = {
  [domain: string]: { [entityId: string]: string };
};

export interface Product {
  image?: string;
  id: string;
  name: string;
  sku: string;
  category: string;
  goldType?: string;
  weight?: number;
  price: number;
  status: StockStatus;
  serialNumber?: string;
  images?: string[];
  videos?: string[];
  minOrder?: number;
  moqUnit?: string;
  description?: string;
  stock?: number;
  isCustomizable?: boolean;
  leadTime?: number;
  supplier?: string | { id: string; maNhaCungCap: string; tenNhaCungCap: string; diaChi: string; maSoThue: string; [key: string]: any };
  rating?: number;
  reviews?: number;
  tags?: string[];
  specifications?: Record<string, string>;
  isVerifiedSupplier?: boolean;
  tradeAssurance?: boolean;
}

export interface Movement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  timestamp: number;
  actor: string;
  userId?: string;
  details?: string;
  userPosition?: string;
  module?: string;
  hash?: string;
  note?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  branch: string;
  capacity: number;
}

export interface WarehouseLocationDetail {
  id: string;
  WAREHOUSEId: string;
  zone: string;
  shelf: string;
  position: string;
}

export interface CustomerLead {
  ownerId?: string;
  id: string;
  name: string;
  phone: string;
  email?: string;
  tier: 'STANDARD' | 'VIP' | 'VVIP';
  source: string;
  assignedTo?: string;
  createdAt: number;

  assignedDate?: number;

  expiryDate?: number;
  status?: string;
  lastInteraction?: number;
}

export interface ApprovalRequest {
  data?: Record<string, unknown>;
  id: string;
  type: string;
  requestedBy: string;
  payload: unknown;
  status: ApprovalStatus;
  createdAt: number;
  resolvedAt?: number;
  resolvedBy?: string;

  changeType?: string;
  recordType?: string;
  reason?: string;
  priority?: string;

  title?: string;
  requiredApprovers?: string[];
  deadline?: number;
}

export interface ApprovalTicket {
  title?: string;
  data?: Record<string, unknown>;
  workflowStep?: number;
  requestedAt?: number;
  id: string;
  approvalRequestId?: string;
  assignedTo?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'NORMAL';
  dueAt?: number;

  request?: any;
  approvedBy?: string;
  approvedAt?: number;
  rejectionReason?: string;

  status?: string;

  totalSteps?: number;

  approvalHistory?: Array<{ approverId: string; action: string; timestamp: number; comment?: string }>;
}

export interface SyncJob {
  id: string;
  name: string;
  source: string;
  destination: string;
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED';
  progress: number;
  totalRows: number;
  processedRows: number;
  duplicatesFound: number;
  strategy: SyncConflictStrategy;
  isIncremental: boolean;
  isEncrypted: boolean;
}

export interface SyncLog {
  id: string;
  timestamp: number;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SECURE' | 'SUCCESS';
  message: string;
}

// (moved to const+type pattern below)

export interface DataPoint {
  id: string;
  source: string;
  payload: unknown;
  confidence: number;
  timestamp: number;
  calculatedConfidence?: number;
  scoreDetails?: any;
}

export interface FileMetadata {
  context?: any;
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: number;
  status: IngestStatus;
  shardId?: string;
  confidence?: number;
  hash?: string;
}

export interface QuantumState {
  energyLevel?: number;
  entanglementCount?: number;
  id?: string;
  coherence: number;
  entropy: number;
  superpositionCount: number;
  waveFunction: { amplitude: number; frequency: number; phase: number };
  lastCollapse?: number;
  lastCollapse_legacy?: number;
}

export interface ConsciousnessField {
  focusPoints?: string[];
  awarenessLevel: number;
  mood: 'OPTIMAL' | 'CAUTIOUS' | 'CRITICAL' | 'STABLE';
  lastCollapse: number;
  activeDomains?: string[];
}

export interface QuantumEvent {
  probability?: number;
  id: string;
  type: string;
  status: 'SUPERPOSITION' | 'COLLAPSED';
  sensitivityVector: { risk: number; financial: number; temporal: number; operational?: number };
  decision?: string;
  timestamp: number;
}

export interface CustomsDeclaration {
  id: string;
  declarationNumber: string;
  importerName: string;
  exporterName: string;
  items: CustomsDeclarationItem[];
  totalValue: number;
  currency: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  createdAt: number;

  header?: { declarationNumber: string; streamCode: 'RED' | 'YELLOW' | 'GREEN'; registrationDate?: string; customsOffice?: string; deptCode?: string; declarationType?: string; mainHsCode?: string; pageInfo?: string; };
  riskAssessment?: { score: number; level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; factors: string[]; assessedAt: number; };
  trackingTimeline?: Array<{ stage: string; timestamp: number; note?: string; id?: string; status?: string; label?: string; location?: string; notes?: string }>;
  compliance?: { isCompliant: boolean; violations: string[] };
  summary?: { totalItems: number; totalWeight?: number; totalValue?: number; hsCodeSummary?: string };
}

export interface CustomsDeclarationItem {
  id: string;
  hsCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  weight: number;
  origin: string;
  riskScore?: number;

  invoiceValue?: number;
  originCountry?: string;
  certNumber?: string;
  totalTax?: number;
  gemType?: string;
  shape?: string;
  color?: string;
  clarity?: string;
  weightCT?: number;
  vatTaxableValue?: number;
  vatRate?: number;
  vatAmount?: number;
  validationErrors?: string[];
}

export interface ActionPlan {
  id: string;
  action: string;
  assignedTo: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'URGENT';
  dueAt?: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

  department?: string;
  reason?: string;
}

export interface AccountingEntry {
  debit?: number;
  credit?: number;
  accountNumber?: string;
  updated_at?: number;
  total_orders?: number;
  status?: string;
  journalType?: string;
  transactionDate?: number;
  id: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  currency: string;
  account: string;
  description: string;
  timestamp: number;
  reference?: unknown;
  matchScore?: number;
  entries?: unknown[];
  journalId?: string;
  createdAt?: Date;

  aiNote?: string;
  date?: string;
  debitAccount?: string;
  creditAccount?: string;
  sourceType?: string;
  sourceId?: string;
  mappingRuleId?: string;
}

export interface AccountingMappingRule {
  sourceType?: string;
  conditionField?: string;
  conditionValue?: string;
  name?: string;
  enabled?: boolean;
  source?: { system: string; [key: string]: unknown };
  priority?: number;
  transformation?: (value: unknown, context?: unknown) => unknown;
  autoPost?: boolean;
  mappingType?: string;
  sourceField?: string;
  destinationField?: string;
  destination?: any;
  createdAt?: Date;
  updatedAt?: Date;
  id: string;
  eventType?: string;
  debitAccount?: string;
  creditAccount?: string;
  description: string;
}

export interface BankTransaction {
  description?: string;
  credit?: boolean | number;
  id: string;
  amount: number;
  currency: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  timestamp: number;
  reference: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'SYNCED';
  date?: string;
  refNo?: string;
  bankName?: string;
  accountNumber?: string;
  taxRate?: number;
  exchangeRate?: number;
  attachment?: string;
  processDate?: string;
}

export interface VATEntry {
  id?: string;
  invoiceId?: string;
  category?: string;
  salesValue?: number;
  purchaseValue?: number;
  vatRate?: number;
  taxRate?: number;
  vatAmount?: number;
  taxableAmount?: number;
  addedValue?: number;
  taxAmount?: number;
  timestamp?: number;
}

export interface VATReport {
  period: string;
  totalTaxableAmount?: number;
  totalVATAmount?: number;
  totalAddedValue?: number;
  totalVATPayable?: number;
  accountingStandard?: string;
  formNumber?: string;
  entries: VATEntry[];
}

export interface PITReport {
  employeeId?: string;
  period: string;
  grossIncome?: number;
  taxableIncome?: number;
  pitAmount?: number;
  totalTaxableIncome?: number;
  totalTaxPaid?: number;
  entries?: {
    employeeName: string;
    employeeCode: string;
    taxableIncome: number;
    deductions: number;
    taxPaid: number;
  }[];
}

export interface TaxCalculationResult {
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  breakdown: Record<string, number>;
  cit?: {
    taxableIncome: number;
    standardRate: number;
    rate?: number;
    taxAmount: number;
    incentiveAmount: number;
    incentives?: Record<string, number>;
    finalTax: number;
    effectiveRate: number;
  };
}

export interface EInvoice {
  orderId?: string;
  createdAt?: number;
  customerName?: string;
  customerTaxId?: string;
  taxAmount?: number;
  xmlPayload?: string;
  signatureHash?: string;
  taxCode?: string;
  id: string;
  invoiceNumber: string;
  buyer: { name: string; taxCode: string; address: string 
  vatRate?: number;
};
  seller: { name: string; taxCode: string; address: string };
  items: EInvoiceItem[];
  totalAmount: number;
  vatAmount: number;
  status: EInvoiceStatus;
  issuedAt: number;
}

export interface EInvoiceItem {
  id?: string;
  name?: string;
  totalBeforeTax?: number;
  taxRate?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  vatRate: number;

  goldWeight?: number;
  goldPrice?: number;
  stonePrice?: number;
  laborPrice?: number;
}

export interface EmployeePayroll {
  employeeId: string;
  employeeCode?: string;
  name?: string;
  period: string;
  baseSalary: number;
  allowances: number;
  allowanceLunch?: number;
  deductions: number;
  netSalary: number;
  kpiBonus?: number;
  taxableIncome?: number;
  personalTax?: number;
  status: 'PENDING' | 'APPROVED' | 'PAID';

  actualWorkDays?: number;
  startDate?: string;
  insuranceSalary?: number;
  dependents?: number;
  grossSalary?: number;
  seniority?: number;
  insuranceEmployee?: number;
  seniorityBonus?: number;
  insuranceEmployer?: number;
  allowancePosition?: number;
  bankAccountNo?: string;
  bankName?: string;
  fullName?: string;
  position?: string;
  division?: string;
  id?: string;
  role?: string;
}

export interface TeamPerformance {
  tasks_in_progress?: number;
  tasks_completed?: number;
  total_tasks?: number;
  teamId?: string;
  period?: string;
  kpiScore?: number;
  revenue?: number;
  targets?: Record<string, number>;
  actuals?: Record<string, number>;

  team_name?: string;

  tasks_blocked?: number;
  load_percentage?: number;
  completion_rate?: number;
}

export interface LaborRuleResult {
  employeeId: string;
  violations: string[];
  recommendations: string[];
  isCompliant: boolean;
}

export interface SellerIdentity {
  isCollaborator?: boolean;
  id: string;
  name: string;
  role: UserRole;
  branch: string;
  commissionRate: number;

  fullName?: string;
  stars?: number;
  kpiPoints?: number;
  userId?: string;
}

export interface SellerReport {
  id?: string;
  sellerId: string;
  period: string;
  totalSales: number;
  totalCommission: number;
  transactionCount: number;

  sellerName?: string;
  customerName?: string;
  customerPhone?: string;
  productSku?: string;
  shellRevenue?: number;
  stoneRevenue?: number;
  stoneType?: string;
  depositAmount?: number;
  isReportedWithin24h?: boolean;
  documents?: Record<string, unknown>;
  commission?: { total: number; shell: number; stone: number; policyId: string; baseRate: number; kpiFactor: number; estimatedAmount: number; finalAmount: number; status: string; };
  status?: string;
  timestamp?: number;
  kpiPoints?: number;
}

export interface BusinessMetrics {
  revenue: number;
  grossProfit: number;
  netProfit: number;
  period: string;
  branch?: string;

  revenue_pending?: number;
  totalTaxDue?: number;
  totalPayroll?: number;
  currentOperatingCost?: number;
  importVolume?: number;
  pendingApprovals?: number;
  cadPending?: number;
  productionProgress?: number;
  goldInventory?: number;
}

export interface GovernanceKPI {
  category?: string;
  kpi_name?: string;
  auditScore?: number;
  complianceRate?: number;
  riskLevel?: AlertLevel;
  period?: string;

  kpi_id?: string;
  period_date?: number;
  target_value?: number;
  actual_value?: number;
  previous_value?: number;
  change_percent?: number;
  status?: string;
  owner_team?: string;
  tHReshold_warning?: number;
  tHReshold_critical?: number;
}

export interface HUDMetric {
  id?: string;
  label: string;
  icon?: string;
  department?: unknown;
  value: number | string;
  unit?: string;
  trend?: 'UP' | 'DOWN' | 'STABLE';
  alert?: AlertLevel;

  name?: string;
}

export interface RealTimeUpdate {
  type: string;
  payload: unknown;
  timestamp: number;
  source: string;
}

export interface ScannerState {
  id: string;
  isActive: boolean;
  lastScan: number;
  tHReatsFound: number;
  status: 'CLEAN' | 'SCANNING' | 'THREAT_DETECTED';
  last_scan_time: number;
  last_scan_head: number;
  errors_found: number;
  is_locked_down: boolean;
  current_status: string;
}

export interface FraudCheckResult {
  level: AlertLevel;
  message: string;
  action: 'PROCEED' | 'BLOCK' | 'WARN' | 'LOCK_ACCOUNT';
  historyRecord?: any;
  transactionId?: string;
  riskScore?: number;
  flags?: string[];
  recommendation?: 'APPROVE' | 'REVIEW' | 'REJECT';

  allowed?: boolean;
}

export interface Certification {
  description?: string;
  id: string;
  type: string;
  issuedBy: string;
  issuedAt: number;
  expiresAt?: number;
  status: 'ACTIVE' | 'VALID' | 'EXPIRED' | 'REVOKED' | 'PENDING' | 'ARCHIVED';

  expiryDate?: number;
  certificateNumber?: string;
  title?: string;
  verificationStatus?: string;

  issuingBody?: number | string;
  createdAt?: number | string;
  updatedAt?: number | string;

  issueDate?: number;
  renewalOf?: string;
}

export interface ModuleConfig {
  title?: string;
  id: ModuleID;
  name: string;
  isEnabled: boolean;
  version: string;
  dependencies: ModuleID[];

  icon?: string;
  group?: string;
  componentName?: string;
  active?: boolean;

  allowedRoles?: unknown[];
}

export interface OperationRecord {
  type?: string;
  error?: string;
  id: string;
  operation?: string;
  actor: string;
  userId?: string;
  details?: string;
  userPosition?: string;
  module?: string;
  hash?: string;
  timestamp: number;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'FAILED' | 'RECOVERED';

  params?: unknown;
}

export interface Checkpoint {
  moduleState?: Record<string, unknown>;
  name?: string;
  state?: unknown;
  isValid?: boolean;
  id: string;
  timestamp: number;
}

export interface DictionaryVersion {
  id?: string;
  version: string;
  publishedAt?: number;
  publishedBy?: string;
  changeLog?: string[];
  status?: string;
  isFrozen?: boolean;
  type?: string;
  versionNumber?: number;
  termsCount?: number;
  dictionaryId?: string;
  data?: any;
  createdAt?: unknown;
  changes?: unknown;
  previousVersionId?: unknown;
  createdBy?: string;
  metadata?: Record<string, unknown>;
}

export interface QuoteRequest {
  id: string;
  productId: string;
  customizations: CustomizationRequest[];
  requestedBy: string;
  createdAt: number;
}

export interface QuoteResult {
  quoteId: string;
  totalPrice: number;
  breakdown: Record<string, number>;
  validUntil: number;
}

export interface CustomizationRequest {
  type: string;
  value: string | number;
  additionalCost?: number;
  specifications?: Record<string, unknown>;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
}

export type RBACRole = string;
export type RBACPermission = string;

export interface UserPosition {
  id: string;
  role: string;
  userId: string;
  position: PositionType;
  department: Department;
  branch: string;
  startDate: number;
  scope?: string[];
}

export interface PersonaMetadata {
  id?: PersonaID;
  name: string;
  role: string;
  layer?: string;
  isActive?: boolean;
  position?: string;
  bio?: string;
  domain?: string;
  avatar?: string;
}

export const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['READY', 'FAILED'],
  READY: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  FAILED: ['PROCESSING'],
};

// --- Sales Core Types ---

export interface OrderItem {
  productId: string;
  serialNumber: string;
  productName: string;
  category?: string;
  goldType?: string;
  weight?: number;
  unitPrice: number;
  costPrice?: number;
  taxRate?: number;
  quantity: number;
  discount?: number;
  depositVND?: number;
}

export interface OrderPricing {
  exchangeRate?: number;
  discountPercentage?: number;
  taxAmount?: number;
  costOfGoods?: number;
  subtotal: number;
  basePriceTotal?: number;
  gdbPriceTotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  breakdown?: Record<string, number>;
  depositVND?: number;

  promotionDiscount?: number;

  shippingFee?: number;
  insuranceFee?: number;
  grossProfit?: number;
  profitMargin?: number;
}

export interface CommissionInfo {
  policyId: string;
  baseRate: number;
  kpiFactor: number;
  estimatedAmount: number;
  finalAmount: number;
  status: string;
  total: number;
  shell: number;
  stone: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tier: 'STANDARD' | 'VIP' | 'VVIP';
  address?: string;
}

export interface SalesPerson {
  id: string;
  name: string;
  role: UserRole;
  branch: string;
  kpiScore: number;
  position: { role: PositionType };
}

export interface SalesOrder {
  orderId: string;
  orderType: SalesChannel;
  customer: Customer;
  items: OrderItem[];
  pricing: OrderPricing;
  payment: {
    method: string;
    status: string;
    depositAmount: number;
    remainingAmount: number;
    currency: string;
  };
  status: OrderStatus;
  WAREHOUSE: WarehouseLocation;
  salesPerson: SalesPerson;
  commission: CommissionInfo;
  createdAt: number;
  updatedAt: number;
}

// --- Logistics / Payment ---

export interface LogisticsInfo {
  method: string;
  address?: string;
  trackingNumber?: string;
  estimatedDelivery?: number;
  status: string;
}

export interface PaymentInfo {
  method: string;
  status: string;
  depositAmount: number;
  remainingAmount: number;
  currency: string;
  paidAt?: number;
  reference?: string;
}


export interface RuntimeInput {
  spanId?: string;
  identity?: any;
  traceId?: string; operation: string; userId: string; domain: string; tenantId: string; correlationId: string; payload: any; }

export interface RuntimeOutput {
  ok?: boolean;
  metadata?: Record<string, unknown>; success: boolean; data?: any; error?: string; 
  tenantId?: string;

  correlationId?: string;

  trace?: string;
}

export interface RuntimeState {
  lastTick?: number;
  version?: string; status: string; }

export interface TraceContext { spanId: string; traceId: string; }


export interface CostAllocation {
  costCenter: string;
  amount: number;
}

// ============================================================
// TYPES KẾ THỪA TỪ HỆ THỐNG CŨ — APPENDED BY BĂNG 21/02/2026
// ============================================================

export enum InputPersona {
  OFFICE = 'OFFICE (Dân Văn Phòng)',
  DATA_ENTRY = 'DATA_ENTRY (Nhập liệu chuyên nghiệp)',
  PHARMACY = 'PHARMACY (Nhập số thành thuốc)',
  EXPERT = 'EXPERT (Thợ kim hoàn rành tay)',
  ADMIN = 'ADMIN (Anh Natt)'
}

export interface CalibrationData {
  userId: string;
  persona: InputPersona;
  avgCPM: number;
  peakCPM: number;
  errorRate: number;
  burstCapacity: number;
  lastCalibrated: number;
  confidence: number;
}

export interface InputMetrics {
  currentCPM: number;
  keystrokes: number;
  clicks: number;
  intensity: number;
}

export interface EntanglementPair {
  id: string;
  entityA: string;
  entityB: string;
  strength: number;
  type: 'BELL_PAIR' | 'GHZ_STATE';
}

export interface NeuralPulse {
  id: string;
  intensity: number;
  origin: string;
  target: string;
}

export interface QuantumTask {
  id: string;
  type: string;
  payload: any;
  priority: number;
  timestamp: number;
}

export interface DistributedTask {
  id: string;
  origin: string;
  targetModule: string;
  payload: any;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  timestamp: number;
  priority?: 'URGENT' | 'NORMAL';
}

export interface PersonnelProfile {
  fullName: string;
  employeeCode: string;
  position: any;
  role: string;
  startDate: string;
  kpiPoints: number;
  tasksCompleted: number;
  lastRating: string;
  bio: string;
}

export interface LearnedTemplate { id: string; name: string; content: string; position?: string; [key: string]: unknown; }


export interface DetailedPersonnel { id: string; name?: string; fullName?: string; employeeCode?: string; email?: string; department?: string; position: unknown; role?: string; status?: string; baseSalary?: number; startDate?: string; kpiPoints?: number; tasksCompleted?: number; lastRating?: string; bankAccountNo?: string; allowanceLunch?: number; allowancePosition?: number; actualWorkDays?: number; bio?: string; [key: string]: unknown; }
export type HRDepartment = unknown;
export type HRPosition = unknown;
export interface HRAttendance { employeeId: string; employee_id?: string; date: string; status: string; hoursWorked?: number; total_hours?: number; checkIn?: number; source?: unknown; [key: string]: unknown; }


// ═══════════════════════════════════════════════
// Wave 3 Recovery: Missing type definitions
// ═══════════════════════════════════════════════

export interface AuditItem {
  id: string;
  action: string;
  actor: string;
  module: string;
  timestamp: number;
  details?: any;
  severity?: string;
  hash?: string;
  userId?: string;
  role?: string;
  targetId?: string;
  oldValue?: string;
  newValue?: string;
  causation_id?: string;

  prevHash?: string;
}

export interface SagaLog {
  sagaId: string;
  steps: Array<{ stepName: string; status: string; timestamp: number; data?: any }>;
  startedAt: number;
  completedAt?: number;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'COMPENSATING';
}

export interface ResolutionContext {
  source: string;
  conflictType: string;
  priority: number;
  timestamp: number;
  metadata?: any;
  businessType?: string;
}

export interface ResolvedData {
  resolvedValue: any;
  method: string;
  confidence: number;
  source: string;
  resolvedAt: number;
  winner?: any;
  scoredPoints?: any[];
  confidenceGap?: number;
  methodUsed?: string;
  losers?: any[];
  resolutionHash?: string;
  isAutoResolved?: boolean;
}

export interface ConflictResolutionRule {
  strategy: 'last-write-wins' | 'merge' | 'manual' | string;
  id: string;
  name: string;
  priority: number;
  condition: string;
  method: ConflictResolutionMethod;
  fallbackMethod?: ConflictResolutionMethod;
  defaultMethod?: ConflictResolutionMethod;
  threshold?: number;
  dataType?: string;

  conditionField?: string;
  conditionValue?: string;
  sourceType?: string;
}

export interface BusinessContext {
  module: string;
  operation: string;
  actor: string;
  timestamp: number;
  metadata?: Record<string, any>;
  industry?: string;
  dataType?: string;
  region?: string;
  priority?: string;
}

export interface RiskAssessment {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  factors: string[];
  assessedAt: number;
}

export interface ComplianceCheck {
  passed: boolean;
  issues: Array<{ type: string; severity: string; message: string }>;
  checkedAt: number;
  requiredDocuments?: string[];
}

export interface TrackingStep {
  id: string;
  label: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  notes?: string;
  timestamp?: number;
}

export interface DynamicField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'boolean';
  value?: any;
  options?: string[];
  required?: boolean;
}

// ConflictResolutionMethod as const values (usable as both type and value)
export const ConflictResolutionMethod = {
  PRIORITY_BASED: 'PRIORITY_BASED' as const,
  TIMESTAMP_BASED: 'TIMESTAMP_BASED' as const,
  MANUAL_REVIEW: 'MANUAL_REVIEW' as const,
  AUTO_MERGE: 'AUTO_MERGE' as const,
} as const;
export type ConflictResolutionMethod = typeof ConflictResolutionMethod[keyof typeof ConflictResolutionMethod];


// ═══════════════════════════════════════════════
// Wave 3 Real Modules: Type definitions from archive
// ═══════════════════════════════════════════════

// [MERGED] DataPoint — moved to line ~590

export interface ScoreResult {
  finalScore: number;
  details: {
    source: number;
    temporal: number;
    completeness: number;
    validation: number;
    crossRef: number;
  };
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
}

export interface DiamondSpecs {
  size: string;
  clarity: string;
  color: string;
  quantity: number;
}

export interface GDBData {
  customer: { name: string; phone: string; normalizedPhone: string };
  product: {
    code: string;
    type: string;
    description: string;
    specifications: string[];
    weight: number;
    diamondSpecs?: DiamondSpecs;
  };
  valuation: { productValue: number; totalValue: number; totalValueInWords: string; exchangeRate: number };
  exchangePolicy: { gold: { returnRate: number; exchangeRate: number }; diamond: { returnRate: number; exchangeRate: number } };
  warranty: { diamondLossUnder3mm: boolean; freeMaintenance: boolean; conditions: string[] };
  company: { name: string; address: string; phoneNumbers: string[]; website: string; email: string };
  documentInfo: { issueDate: Date; sellerName: string; signature: string };
}

export interface GDBDocument {
  type: 'GDB' | 'OTHER';
  confidence: number;
  extractedData: GDBData;
  metadata: {
    template: string;
    extractionQuality: number;
    ocrQuality: number;
    matchedKeywords: string[];
    reason?: string;
    score?: number;
  };
}

export interface Supplier {
  id: string;
  maNhaCungCap: string;
  tenNhaCungCap: string;
  diaChi: string;
  maSoThue: string;
  maNhomNCC?: string;
  dienThoai?: string;
  website?: string;
  email?: string;
  quocGia?: string;
  tinhTP?: string;
  soTaiKhoan?: string;
  tenNganHang?: string;
  ghiChu?: string;
  transactionAmount?: number;
  loaiNCC?: 'NUOC_NGOAI' | 'TO_CHUC' | 'CA_NHAN';
  nhomHangChinh?: string[];
  khuVuc?: 'BAC' | 'TRUNG' | 'NAM' | 'QUOC_TE';
  phuongThucThanhToan?: 'TIEN_MAT' | 'CHUYEN_KHOAN' | 'QUOC_TE';
  dichVuDacThu?: string[];
  mucDoUuTien?: 'CAO' | 'TRUNG_BINH' | 'THAP';
  trangThaiHopTac?: string;
  mucDoTinCay?: string;
  ngayBatDauHopTac?: string;
  sentimentScore?: number;
  coTienNang?: boolean;
  diemDanhGia?: number;
  quyMo?: 'LON' | 'VUA' | 'NHO';
  xuHuong?: 'TANG' | 'GIAM' | 'ON_DINH';
}


// ═══════════════════════════════════════════════
// NATTCELL KERNEL: Reconciliation types
// ═══════════════════════════════════════════════

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  timestamp: Date;
  gateway: string;
  status: string;
  reference?: string;
}

export interface GatewayReport {
  gateway: string;
  totalAmount: number;
  transactions?: Transaction[];
  reportDate?: Date;
}

export interface ReconciliationResult {
  date: string;
  localTransactions: Transaction[];
  gatewayReports: GatewayReport[];
  discrepancies: Discrepancy[];
  summary: {
    totalLocalAmount: number;
    totalGatewayAmount: number;
    totalDiscrepancies: number;
    highSeverityDiscrepancies: number;
  };
}

export interface Discrepancy {
  type: string;
  gateway: string;
  localTotal: number;
  gatewayTotal: number;
  difference: number;
  message: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

// ═══════════════════════════════════════════════
// NATTCELL KERNEL: Refund types
// ═══════════════════════════════════════════════

export interface RefundRequest {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  submittedBy: string;
  status: ApprovalStatus;
  timestamp: number;
}

// ═══════════════════════════════════════════════
// NATTCELL KERNEL: Enterprise Linker types
// ═══════════════════════════════════════════════

export interface LinkedRecord {
  id: string;
  sku: string;
  productionCost: number;
  goldWeight: number;
  stoneWeight: number;
  workerName: string;
  salesPrice: number;
  customerName: string;
  invoiceId?: string;
  bankTxId?: string;
  receivedAmount: number;
  taxPaid: number;
  grossProfit: number;
  status: 'MATCHED' | 'DISCREPANCY' | 'PENDING';
}

export interface AggregatedReport {
  period: string;
  totalRevenue: number;
  totalCOGS: number;
  totalOpEx: number;
  netProfit: number;
  margin: number;
  discrepancyCount: number;
  records: LinkedRecord[];
}


// ═══ Auth ═══
export type RolePermissions = Record<string, Permission[]>;

// ═══ HR ═══
export interface SalaryRule {
  id: string;
  name: string;
  type: "ALLOWANCE" | "DEDUCTION" | "TAX";
  calculate: (base: number) => number;

  division?: string;
  grade?: string;
  salary?: number;
  role?: string;
}

// ═══ Logistics ═══
export interface LogisticsSolution {
  partnerId: string;
  partnerName: string;
  serviceType: string;
  cost: { shippingFee: number; insuranceFee: number; codFee: number; fuelSurcharge: number; total: number; };
  estimatedDelivery: number;
  reliability: number;
  totalCost: number;
  score: number;
  recommended: boolean;
}

export interface TransferOrder {
  id: string;
  transferId: string;
  productId: string;
  productName: string;
  quantity: number;
  fromWarehouse: string;
  toWarehouse: string;
  transferDate: number;
  expectedDelivery: number;
  status: string;
  transportMethod: string;
  documents: string[];
}


// ═══ Blockchain/Sharding types ═══

export interface BlockShard {
  shardId: string;
  enterpriseId: string;
  blockHash: string;
  prevHash: string;
  status: string;
  timestamp: number;
}

export interface AuditTrailEntry {
  status?: string;
  id: string;
  timestamp: number;
  userId: string;
  role: UserRole;
  action: string;
  targetId?: string;
  oldValue?: string;
  newValue?: string;
  hash: string;
  note?: string;
}

// SealingLevel already defined at line ~287

export interface SealingRecord {
  id: string;
  level: SealingLevel;
  period: string;
  aggregateHash: string;
  sealedAt: number;
  sealedBy: string;
  metrics: {
    totalRevenue: number;
    totalExpense: number;
    totalTax: number;
    checkSum: string;
  };
}


// ═══════════════════════════════════════════════
// NATT-OS PERMISSION ARCHITECTURE v2
// Single-assign by MASTER. Anti-manipulation.
// ═══════════════════════════════════════════════

// --- System Roles (hardcode, không đổi) ---
export const SystemRole = {
  MASTER: "MASTER",
  AI_AGENT: "AI_AGENT",
  UI_DEV: "UI_DEV",
} as const;
export type SystemRole = typeof SystemRole[keyof typeof SystemRole];

// --- Tenant Roles (BHXH-compatible, đa nhiệm) ---
export const TenantRole = {
  OWNER: "OWNER",
  NATE: "NATE",
  NATTE: "NATTE",
  NAT: "NAT",
} as const;
export type TenantRole = typeof TenantRole[keyof typeof TenantRole];

// --- Legacy UserRole → New System mapping ---
// MASTER → SystemRole.MASTER
// ADMIN, LEVEL_2 → TenantRole.OWNER
// MANAGER, SENIOR_STAFF → TenantRole.NATE
// SALES_STAFF, WAREHOUSE_STAFF, ACCOUNTANT, STAFF, LEVEL_5 → TenantRole.NATTE
// AUDITOR, VIEWER → TenantRole.NAT

// --- Data visibility level ---
export const DataLevel = {
  FULL: "FULL",
  DEPT: "DEPT",
  SCOPE: "SCOPE",
  SELF: "SELF",
} as const;
export type DataLevel = typeof DataLevel[keyof typeof DataLevel];

// --- Permission actions (value-based, usable as enum) ---
export const PermAction = {
  VIEW: "VIEW",
  CREATE: "CREATE",
  EDIT: "EDIT",
  DELETE: "DELETE",
  APPROVE: "APPROVE",
  SIGN: "SIGN",
  EXPORT: "EXPORT",
} as const;
export type PermAction = typeof PermAction[keyof typeof PermAction];

// --- Role Assignment (MASTER-only) ---
export interface RoleAssignment {
  userId: string;
  tenantId: string;
  role: TenantRole;
  modules: string[];
  permissions: PermAction[];
  departments: string[];
  dataLevel: DataLevel;
  assignedBy: "MASTER";
  assignedAt: number;
}

// --- AI Command Fix ---
export interface CommandFix {
  id: string;
  trigger: "AUTO" | "MANUAL";
  target: string;
  action: "PATCH" | "ROLLBACK" | "REBUILD";
  status: "PENDING" | "APPLIED" | "REJECTED";
  appliedBy: "AI_AGENT";
  requiresApproval: boolean;
  approvedBy?: "MASTER";
  timestamp: number;
  description: string;
}

// ============================================================
// PATCH: V2 types missing from repo — append to src/types.ts
// Generated by Băng — 2026-03-06
// ============================================================

// --- RFMData ---
export interface RFMData {
  customerId: string;
  name: string;
  recency: number;
  frequency: number;
  monetary: number;
  score: number;
  segment: 'VIP' | 'THÀNH VIÊN' | 'RỦI RO' | 'MỚI';
}

// --- WorkerPerformance ---
export interface WorkerPerformance {
  workerId: string;
  kpi: number;
}

// --- MaterialTransaction ---
export interface MaterialTransaction {
  id: string;
}

// --- CCCDIdentity ---
export interface CCCDIdentity {
  number: string;
  fullName?: string;
  dob?: string;
}

// --- IdentityData ---
export interface IdentityData {
  type: 'CCCD' | 'FACE';
  hash: string;
  timestamp: number;
  confidence: number;
  maskedId: string;
  details?: any;
}

// --- GuarantyCertificate ---
export interface GuarantyCertificate {
  id: string;
  customerName: string;
  phone?: string;
  productName: string;
  originalPrice: number;
  stoneSpec: string;
  weight: number;
  purchaseDate: string;
  policy: {
    buybackDeduction: number;
    exchangeDeduction: number;
  };
  confidence: number;
  metadata?: any;
  diamondDetails?: any;
}

// --- ChatMessage ---
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  personaId: PersonaID;
  timestamp: number;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  fileData?: string;
  isThinking?: boolean;
  citations?: any[];
  suggestedActions?: string[];
  isEdited?: boolean;
  history?: { content: string; timestamp: number }[];
}

// --- RoomConfig ---
export interface RoomConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  creatorId: string;
  members: string[];
  pendingRequests: JoinRequest[];
  settings: RoomSettings;
}

// --- RoomSettings ---
export interface RoomSettings {
  antiSpam: boolean;
  blockPersonas: PersonaID[];
  autoDeleteMessages: boolean;
  encryptionLevel: string;
  isMuted: boolean;
  joinCode: string;
  allowCalls: boolean;
  allowVoice: boolean;
  allowImport: boolean;
}

// --- JoinRequest ---
export interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  userPosition: UserPosition;
  timestamp: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// --- GovernanceRecord ---
export interface GovernanceRecord {
  id: string;
  timestamp: number;
  type: string;
  status: 'BẢN NHÁP' | 'ĐÃ DUYỆT' | 'BỊ TỪ CHỐI' | 'ĐÃ KÝ SỐ';
  data: any;
  operatorId: string;
  auditTrail: AuditTrailEntry[];
}

// --- GovernanceTransaction ---
export interface GovernanceTransaction {
  id: string;
  period: string;
  status: TxStatus;
  type: string;
  amount: number;
  counterparty: string;
  description: string;
  date: string;
  attachments: { id: string; name: string; url: string }[];
  flags: { level: 'TRUNG BÌNH' | 'CAO' | 'THẤP'; message: string }[];
  auditTrail: AuditTrailEntry[];
}

// --- EngravingConfig ---
export interface EngravingConfig {
  enabled: boolean;
  text: string;
  font: 'CLASSIC' | 'SCRIPT' | 'SERIF';
  location: 'INSIDE' | 'OUTSIDE';
}

// --- MaterialOverride ---
export interface MaterialOverride {
  goldColor: 'YELLOW' | 'WHITE' | 'ROSE';
  goldPurity: '18K' | '14K' | '24K';
  stoneClass: 'VVS1' | 'VVS2' | 'VS1' | 'CZ_MASTER';
}

// --- ComplianceViolation ---
export interface ComplianceViolation {
  id: string;
  type: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: number;
}

// --- ProductionOrder ---
export interface ProductionOrder {
  id: string;
  serial_number: string;
  production_code: string;
  sku: string;
  customer_id: string;
  status: OrderStatus;
  priority: string;
  deadline: number;
  gold_type: string;
  target_weight: number;
  stone_specs: any[];
  weight_history: any[];
  transactions: MaterialTransaction[];
  qc_reports: any[];
  created_at: number;
  updated_at: number;
}

// --- WeightTracking ---
export interface WeightTracking {
  stage: OrderStatus;
  weight_before: number;
  weight_after: number;
  recovery_gold: number;
}

// --- LogisticsPartner ---
export interface LogisticsPartner {
  id: string;
  name: string;
}

// --- AccountMapRule ---
export interface AccountMapRule {
  id: string;
  sourceType: string;
  conditionField: string;
  conditionValue: string;
  debitAccount: string;
  creditAccount: string;
  name: string;
}

// --- AccountingLine ---
export interface AccountingLine {
  accountCode?: string;
  accountNumber: string;
  accountName: string;
  debit: number;
  credit: number;
  detail?: string;
  currency?: string;
  amount?: number;
  type?: 'DEBIT' | 'CREDIT';
}

// --- RiskFactor ---
export interface RiskFactor {
  factor: string;
  weight: number;
  description: string;
}

// --- ScoreDetails ---
export interface ScoreDetails {
  source: number;
  temporal: number;
  completeness: number;
  validation: number;
  crossRef: number;
}

// --- ExchangeItem ---
export interface ExchangeItem {
  id: string;
  description: string;
  originalValue: number;
  estimatedValue: number;
  percentApplied: number;
  type: 'GDB_RETURN';
  actionType: 'EXCHANGE' | 'BUYBACK';
  gdbRef: string;
  weight: number;
  lockedPolicy?: { buyback: number; exchange: number };
  identity?: IdentityData;
}

// --- PersonaConfig ---
export interface PersonaConfig {
  id: PersonaID;
  name: string;
  gender: string;
  orientation: string;
  role: string;
  specialty: string;
  model: string;
  avatarColor: string;
}

// --- DomainConfig ---
export interface DomainConfig {
  id: Domain;
  title: string;
  description: string;
  icon: string;
  color: string;
  persona: PersonaID;
}

// --- VaultStatus ---
export interface VaultStatus {
  sealed: boolean;
  lastSealDate: number;
  sealHash: string;
}

// --- EmailMessage ---
export interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  category: 'CHÍNH PHỦ' | 'LOGISTICS' | 'HÓA ĐƠN' | 'KHÁC';
  hasAttachment: boolean;
  isRead: boolean;
  priority: 'CAO' | 'TRUNG BÌNH' | 'THẤP';
}

// ============================================================================
// V2 COMPATIBILITY PATCH — Băng 2026-03-06
// Fixes ~200 TypeScript errors from V2→V3 schema migration
// ============================================================================

export type TxStatus =
  | 'BẢN NHÁP' | 'SẴN SÀNG KÝ' | 'ĐÃ KÝ SỐ' | 'BỊ TRẢ LẠI'
  | 'BỊ TỪ CHỐI' | 'ĐÃ DUYỆT' | 'CHỜ DUYỆT'
  | 'CHỜ PHÊ DUYỆT'
  | 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface ConflictRecord {
  id: string;
  entityType: string;
  entityId: string;
  sourceA: string;
  sourceB: string;
  conflictField: string;
  valueA: unknown;
  valueB: unknown;
  detectedAt: number;
  resolvedAt?: number;
  resolution?: string;
  resolvedBy?: string;
}

// ─── Added by Băng audit 2026-03-06 ────────────────────────────────────────

export interface CellHealthState {
  cellId: string;
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE';
  uptime: number;
  lastChecked: number;
  message?: string;
  cell_id?: string;
  last_heartbeat?: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  location?: string;
  status?: string;
  price?: number;
  category?: string;
}

export interface ShowroomProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  [key: string]: any;
}

export interface WorkflowNode {
  id: string;
  label: string;
  view?: string;
  x: number;
  y: number;
  color?: string;
  icon?: string;
  desc?: string;
  status?: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface BankSummary {
  totalIn: number;
  totalOut: number;
  balance: number;
  count: number;
}

export interface WarehouseItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  category?: string;
  location?: string;
  status?: string;
  weight?: number;
  unit?: string;
}
