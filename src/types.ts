// ═══════════════════════════════════════════════════════════
// NATT-OS GROUND TRUTH TYPES — Điều 23 Tầng A
// Không sửa không thêm ngoài Wave review
// ═══════════════════════════════════════════════════════════

// ── ENUMS ────────────────────────────────────────────────
export enum PersonaID {
  PHIEU = "PHIEU",
  BANG = "BANG", KIM = "KIM", THIEN = "THIEN", CAN = "CAN", BOI_BOI = "BOI_BOI", KRIS = "KRIS"
}

export enum UserRole {
  MASTER = "MASTER", LEVEL_1 = "LEVEL_1", LEVEL_2 = "LEVEL_2", LEVEL_3 = "LEVEL_3",
  LEVEL_4 = "LEVEL_4", LEVEL_5 = "LEVEL_5", LEVEL_6 = "LEVEL_6",
  LEVEL_7 = "LEVEL_7", LEVEL_8 = "LEVEL_8", GUEST = "GUEST",
  ADMIN = "ADMIN"
}

export enum PositionType {
  CEO = "CEO", CFO = "CFO", COO = "COO", CTO = "CTO",
  GENERAL_MANAGER = "GENERAL_MANAGER", ACCOUNTANT = "ACCOUNTANT",
  SELLER = "SELLER", WAREHOUSE_STAFF = "WAREHOUSE_STAFF",
  HR_STAFF = "HR_STAFF", PRODUCTION_STAFF = "PRODUCTION_STAFF",
  CUSTOMS_OFFICER = "CUSTOMS_OFFICER", AUDITOR = "AUDITOR",
  CHAIRMAN = "CHAIRMAN",
  COLLABORATOR = "COLLABORATOR",
  ROUGH_FINISHER = "ROUGH_FINISHER",
  CASTING_MANAGER = "CASTING_MANAGER",
  CONSULTANT = "CONSULTANT",
  PROD_DIRECTOR = "PROD_DIRECTOR",
}

export enum ViewType {
  DASHBOARD = "DASHBOARD", MASTER_DASHBOARD = "MASTER_DASHBOARD",
  SALES_TERMINAL = "SALES_TERMINAL", SELLER_TERMINAL = "SELLER_TERMINAL",
  PRODUCT_CATALOG = "PRODUCT_CATALOG", OPERATIONS = "OPERATIONS",
  PRODUCTION = "PRODUCTION", PRODUCTION_WALLBOARD = "PRODUCTION_WALLBOARD",
  WAREHOUSE = "WAREHOUSE", FINANCE = "FINANCE", TAX = "TAX",
  BANKING = "BANKING", HR = "HR", HR_COMPLIANCE = "HR_COMPLIANCE",
  AUDIT = "AUDIT", AUDIT_TRAIL = "AUDIT_TRAIL", COMPLIANCE = "COMPLIANCE",
  CUSTOMS = "CUSTOMS", GOVERNANCE = "GOVERNANCE", RBAC = "RBAC",
  ANALYTICS = "ANALYTICS", RFM = "RFM", REPORTING = "REPORTING",
  CHAT = "CHAT", COLLABORATION = "COLLABORATION", EMAIL = "EMAIL",
  LEARNING = "LEARNING", SYSTEM_MONITOR = "SYSTEM_MONITOR",
  DEV_PORTAL = "DEV_PORTAL", ADMIN_CONFIG = "ADMIN_CONFIG",
  PERSONAL_SPHERE = "PERSONAL_SPHERE", CALIBRATION = "CALIBRATION",
  DATA_ARCHIVE = "DATA_ARCHIVE", QUANTUM_FLOW = "QUANTUM_FLOW",
  SYSTEM_NAVIGATOR = "SYSTEM_NAVIGATOR", SALES_ARCHITECTURE = "SALES_ARCHITECTURE",
  PRODUCTION_SALES_FLOW = "PRODUCTION_SALES_FLOW", UNIFIED_REPORT = "UNIFIED_REPORT",
  PAYMENT = "PAYMENT", SHOWROOM = "SHOWROOM", SUPPLIER = "SUPPLIER",
  BLUEPRINT = "BLUEPRINT", API_PORTAL = "API_PORTAL",
  SMART_LINK = "SMART_LINK", NOTIFICATION = "NOTIFICATION",
  dashboard = "DASHBOARD", chat = "CHAT", showroom = "SHOWROOM",
  sales_terminal = "SALES_TERMINAL", warehouse = "WAREHOUSE",
  command = "GOVERNANCE", production = "PRODUCTION",
  data_archive = "DATA_ARCHIVE", ops_terminal = "OPERATIONS",
  production_manager = "PRODUCTION", sales_architecture = "SALES_ARCHITECTURE",
}

export enum Domain {
  AUDIT = "AUDIT", FINANCE = "FINANCE", HR = "HR", COMPLIANCE = "COMPLIANCE",
  INVENTORY = "INVENTORY", SALES = "SALES", CUSTOMS = "CUSTOMS",
  PRODUCTION = "PRODUCTION", GOVERNANCE = "GOVERNANCE"
}

export enum Permission {
  READ = "READ", WRITE = "WRITE", DELETE = "DELETE", APPROVE = "APPROVE",
  EXPORT = "EXPORT", OVERRIDE = "OVERRIDE",
  VIEW = "VIEW",
  SIGN = "SIGN",
  ADMIN = "ADMIN",
}

export enum ModuleID {
  DASHBOARD = "DASHBOARD", SALES = "SALES", INVENTORY = "INVENTORY",
  FINANCE = "FINANCE", HR = "HR", AUDIT = "AUDIT", COMPLIANCE = "COMPLIANCE",
  CUSTOMS = "CUSTOMS", GOVERNANCE = "GOVERNANCE", SYSTEM = "SYSTEM"
}

export enum HeatLevel { COLD = "COLD", WARM = "WARM", HOT = "HOT", CRITICAL = "CRITICAL", LEVEL_1 = "LEVEL_1", LEVEL_2 = "LEVEL_2", LEVEL_3 = "LEVEL_3" }

export enum OrderStatus {
  PENDING = "PENDING", CONFIRMED = "CONFIRMED", PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED", CANCELLED = "CANCELLED", REFUNDED = "REFUNDED",
  DESIGNING = "DESIGNING", CASTING = "CASTING",
  COLD_WORK = "COLD_WORK", STONE_SETTING = "STONE_SETTING",
  FINISHING = "FINISHING", QC_PENDING = "QC_PENDING",
}

export enum EInvoiceStatus {
  DRAFT = "DRAFT", SIGNED = "SIGNED", SUBMITTED = "SUBMITTED",
  ACCEPTED = "ACCEPTED", REJECTED = "REJECTED", CANCELLED = "CANCELLED",
  XML_BUILT = "XML_BUILT",
}

export enum TxStatus {
  PENDING = "PENDING", APPROVED = "APPROVED", REJECTED = "REJECTED", VOIDED = "VOIDED",
  CHO_PHE_DUYET = "CHO_PHE_DUYET", SAN_SANG_KY = "SAN_SANG_KY",
  BI_TRA_LAI = "BI_TRA_LAI", DA_KY_SO = "DA_KY_SO",
  CHO_PHE_DUYET_VI = "CHỜ PHÊ DUYỆT", SAN_SANG_KY_VI = "SẴN SÀNG KÝ",
  BI_TRA_LAI_VI = "BỊ TRẢ LẠI", DA_KY_SO_VI = "ĐÃ KÝ SỐ",
}

export enum SalesChannel { SHOWROOM = "SHOWROOM", ONLINE = "ONLINE", B2B = "B2B", WHOLESALE = "WHOLESALE", DIRECT_SALE = "DIRECT_SALE",
  LOGISTICS = "LOGISTICS",
}

export enum IngestStatus { QUEUED = "QUEUED", PROCESSING = "PROCESSING", DONE = "DONE", FAILED = "FAILED", COMMITTED = "COMMITTED",
}

export enum AlertLevel { INFO = "INFO", WARNING = "WARNING", CRITICAL = "CRITICAL" }

export enum SyncConflictStrategy { LAST_WRITE = "LAST_WRITE", FIRST_WRITE = "FIRST_WRITE", MERGE = "MERGE", MANUAL = "MANUAL" }

export enum ConflictResolutionMethod { LAST_WRITE_WINS = "LAST_WRITE_WINS", FIRST_WRITE_WINS = "FIRST_WRITE_WINS", MERGE = "MERGE", MANUAL = "MANUAL" }

// ── CORE INTERFACES ──────────────────────────────────────
export interface UserPosition {
  id?: string;
  userId?: string;
  role: PositionType;
  displayName?: string;
  fullName?: string;
  name?: string;
  department?: string;
  branch?: string;
  level?: number;
  scope?: string[];
}

export interface ModuleConfig {
  id: string;
  label: string;
  view: ViewType;
  icon: string;
  allowedRoles: UserRole[];
  description?: string;
  badge?: number;
  active?: boolean;
  title?: string;
  group?: string;
  componentName?: string;
}

export interface ActionLog {
  id: string;
  timestamp: number;
  userId: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  hash?: string;
  severity?: "INFO" | "WARNING" | "CRITICAL";

  userPosition?: any;
}

export interface BusinessMetrics {
  totalRevenue?: number;
  totalCost?: number;
  totalProfit?: number;
  orderCount?: number;
  activeOrders?: number;
  inventoryValue?: number;
  employeeCount?: number;
  pendingApprovals?: number;
  complianceScore?: number;
  period?: string;
  updatedAt?: number;

  // Extended metrics fields
  revenue?: number;
  revenue_pending?: number;
  totalTaxDue?: number;
  totalPayroll?: number;
  currentOperatingCost?: number;
  importVolume?: number;
  cadPending?: number;
  productionProgress?: number;
  goldInventory?: number;
  invoicesIssued?: number;
  riskScore?: number;
  lastUpdate?: number;
  totalCogs?: number;
  totalOperating?: number;
}

// ── PRODUCT ───────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  sku?: string;
  category: string;
  price: number;
  cost?: number;
  goldKarat?: string;
  goldWeight?: number;
  material?: string;
  description?: string;
  imageUrl?: string;
  minOrder: number;
  stock?: number;
  status?: "ACTIVE" | "INACTIVE" | "DISCONTINUED" | "AVAILABLE";
  warehouseLocation?: string;
  serialNumber?: string;
  certificateId?: string;

  // Extended fields for UI components
  tags?: string[];
  reviews?: number;
  isVerifiedSupplier?: boolean;
  image?: string;
  images?: string[];
  videos?: string[];
  specifications?: Record<string, string>;
  leadTime?: number;
  isCustomizable?: boolean;
  tradeAssurance?: boolean;
  moqUnit?: string;
  rating?: number;
  supplier?: { tenNhaCungCap: string; maNhaCungCap?: string; [key: string]: any };
}

export interface InventoryItem extends Product {
  quantity: number;
  unit: string;
  location: string;
  lotNumber?: string;
  lastMovement?: number;
  warehouseId?: string;
  internalCertId?: string;
}

export interface WarehouseLocation {
  id: string;
  code: string;
  zone: string;
  row: string;
  level: number;
  capacity: number;
  occupied: number;
}

// ── SALES / ORDER ─────────────────────────────────────────
export interface ExchangeItem {
  id?: string;
  description?: string;
  productId: string;
  productName: string;
  weight: number;
  purity: string;
  condition: "NEW" | "GOOD" | "FAIR" | "POOR";
  estimatedValue: number;
  appraiserNote?: string;
}

export interface GuarantyCertificate {
  serialNumber: string;
  productName: string;
  material: string;
  weight: string;
  purity: string;
  issueDate: string;
  warrantyYears: number;
  isValid: boolean;
}

export interface IdentityData {
  fullName: string;
  idNumber: string;
  dob?: string;
  address?: string;
  phone?: string;
  hash?: string;
}

export interface CustomizationRequest {
  specifications?: Record<string, any>;
  samples?: boolean | any[];
  logo?: boolean | string;
  id?: string;
  productId: string;
  quantity: number;
  deadline: string;
  notes: string;
  specs: Record<string, string>;
  engraving?: EngravingConfig;
  material?: MaterialOverride;
  status?: "PENDING" | "APPROVED" | "IN_PRODUCTION" | "COMPLETED";
}

export interface EngravingConfig {
  enabled: boolean;
  text: string;
  font: "CLASSIC" | "MODERN" | "SCRIPT";
  location: "INSIDE" | "OUTSIDE" | "CLASP";
}

export interface MaterialOverride {
  goldColor: "YELLOW" | "WHITE" | "ROSE";
  goldPurity: "9K" | "10K" | "14K" | "18K" | "24K";
  stoneClass: "IF" | "VVS1" | "VVS2" | "VS1" | "VS2" | "SI1";
}

export interface ProductionOrder {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  status: OrderStatus;
  assignedTo?: string;
  startDate?: string;
  dueDate?: string;
  completedAt?: number;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  notes?: string;
}

export interface DistributedTask {
  id: string;
  title: string;
  type: string;
  assignedTo?: string;
  priority?: number;
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "FAILED";
  createdAt: number;
  payload?: Record<string, unknown>;
}

// ── FINANCE ───────────────────────────────────────────────
export interface EInvoiceItem {
  lineNo: number;
  name?: string;
  goldWeight?: number;
  taxRate?: number;
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  amount: number;
  vatRate: number;
  vatAmount: number;

  stonePrice?: number;

  laborPrice?: number;

  totalBeforeTax?: number;
}

export interface EInvoice {
  id: string;
  invoiceNumber: string;
  invoiceSeries: string;
  issueDate: string;
  status: EInvoiceStatus;
  sellerTaxCode?: string;
  sellerName?: string;
  seller?: { name?: string; taxCode?: string; address?: string };
  buyerTaxCode?: string;
  buyerName?: string;
  buyerAddress?: string;
  buyer?: { name?: string; taxCode?: string; address?: string };
  createdAt?: number;
  items: EInvoiceItem[];
  totalAmount: number;
  vatAmount?: number;
  vatRate?: number;
  grandTotal: number;
  currency: string;
  signedAt?: number;
  submittedAt?: number;
  lookupCode?: string;

  xmlPayload?: string;

  signatureHash?: string;

  issuedAt?: number;

  taxAmount?: number;

  orderId?: string;
  customerName?: string;
  taxCode?: string;
}

export interface AccountingEntry {
  id: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  currency: string;
  reference: string;
  createdBy: string;

  journalId?: string;

  journalType?: string;

  transactionDate?: number;

  entries?: any[];

  matchScore?: number;

  aiNote?: string;
  status?: string;
}

export interface VATReport {
  period: string;
  totalSales: number;
  vatCollected: number;
  vatPaid: number;
  vatDue: number;
  filingDeadline: string;
  status?: "DRAFT" | "FILED" | "PAID";
}

export interface PITReport {
  employeeId: string;
  year: number;
  grossIncome: number;
  taxableIncome: number;
  taxDue: number;
  taxPaid: number;
}

export interface EmployeePayroll {
  employeeCode?: string;
  id?: string;
  name?: string;
  employeeId?: string;
  month?: string;
  baseSalary?: number;
  allowances?: number;
  bonus?: number;
  grossIncome?: number;
  deductions?: number;
  netIncome?: number;
  pitAmount?: number;
  // HR fields used by HRCompliance
  division?: string;
  department?: string;
  role?: string;
  startDate?: string;
  actualWorkDays?: number;
  allowanceLunch?: number;
  dependents?: number;
  insuranceSalary?: number;
  kpiPoints?: number;
  personalTax?: number;
  taxableIncome?: number;
}

export interface SalaryRule {
  grade?: string;
  salary?: number;
  id?: string;
  type?: "BONUS" | "DEDUCTION" | "ALLOWANCE";
  name?: string;
  amount?: number;
  condition?: string;
  division?: string;
  role?: string;
}

// ── AUDIT / GOVERNANCE ────────────────────────────────────
export interface AuditItem {
  id: string;
  timestamp: number;
  event: string;
  actor: string;
  target: string;
  hash: string;
  prevHash: string;
  verified?: boolean;
}

export interface AuditTrailEntry {
  id: string;
  userId?: string;
  action?: string;
  actorId?: string;
  targetId?: string;
  module?: string;
  details?: string;
  timestamp: number;
  hash?: string;
  role?: string;
}

export interface ComplianceViolation {
  id: string;
  type?: string;
  timestamp?: number;
  regulationId?: string;
  title?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  detectedAt?: number;
  resolvedAt?: number;
  status?: "OPEN" | "IN_REVIEW" | "RESOLVED" | "ACCEPTED";
}

export interface GovernanceRecord {
  id: string;
  type: string;
  decision?: string;
  rationale?: string;
  madeBy?: string;
  madeAt?: number;
  affectedCells?: string[];
  status: string;

  auditTrail?: any[];
  operatorId?: string;
  timestamp?: number;
  data?: any;
}

export interface GovernanceTransaction {
  id: string;
  type: string;
  amount: number;
  currency?: string;
  status: TxStatus | string;
  requestedBy?: string;
  approvedBy?: string;
  moduleId?: ModuleID;
  createdAt?: number;
  notes?: string;

  flags?: Array<string | { level: string; message: string }>;
  auditTrail?: any[];
  date?: string;
  period?: string;
  counterparty?: string;
  description?: string;
  attachments?: Array<{ id: string; name: string; url: string }>;
}

export interface OperationRecord {
  id: string;
  type?: string;
  module?: string;
  operation: string;
  status: "SUCCESS" | "FAILED" | "PENDING" | "DEAD_LETTER";
  payload: Record<string, unknown>;
  error?: string;
  attempts: number;
  createdAt: number;
  lastAttemptAt?: number;
}

// ── HR ────────────────────────────────────────────────────
export interface SellerReport {
  id?: string;
  timestamp?: number;
  status?: string;
  sellerId?: string;
  date?: string;
  totalSales?: number;
  orderCount?: number;
  revenue?: number;
  commission: number | { total: number; shell: number; stone: number; [key: string]: number };
  topProducts?: string[];

  productSku?: string;

  shellRevenue?: number;
  stoneRevenue?: number;
  stoneType?: string;
  depositAmount?: number;
  isReportedWithin24h?: boolean;
  documents?: Record<string, any>;
  sellerName?: string;
  customerName?: string;
  customerPhone?: string;
}

export interface SellerIdentity {
  userId: string;
  name?: string;
  tier?: "STANDARD" | "SENIOR" | "EXPERT" | "MASTER";
  since?: string;
  branch?: string;
  kpiPoints?: number;
  stars?: number;
  isCollaborator?: boolean;
  fullName?: string;
  violations?: number;
  role?: UserRole | string;
  position?: any;
  department?: string;
  gatekeeperBalance?: number;
}

export interface CustomerLead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  interest?: string;
  budget?: number;
  source: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST" | "WARM" | "HOT" | "COLD";
  assignedTo?: string;
  ownerId?: string;
  assignedDate?: number;
  createdAt?: number;

  expiryDate?: number;

  lastInteraction?: number;
}

export interface LearnedTemplate {
  id: string;
  position: UserPosition;
  fields: Array<{ key: string; label: string; type: string; required: boolean }>;
  version: number;
  trainedAt: number;
}

export interface InputMetrics {
  currentCPM: number;
  keystrokes: number;
  clicks: number;
  intensity: number;
  avgPause?: number;
}

export interface InputPersona {
  id: string;
  name: string;
  description: string;
  cpmRange: [number, number];
  intensityThreshold: number;
}

// ── CUSTOMS ───────────────────────────────────────────────
export interface CustomsDeclarationItem {
  lineNo: number;
  hsCode: string;
  description: string;
  quantity: number;
  unit: string;
  unitValue: number;
  currency: string;
  originCountry: string;
  weight?: number;
  weightCT?: number;
  validationErrors?: string[];
  gemType?: string;
  shape?: string;
  color?: string;
  clarity?: string;
  certNumber?: string;
  vatTaxableValue?: number;
  vatRate?: number;
  vatAmount?: number;
}

export interface CustomsDeclaration {
  id: string;
  declarationNumber: string;
  importDate: string;
  items: CustomsDeclarationItem[];
  totalValue: number;
  currency: string;
  status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED" | "QUERIED";
  portOfEntry?: string;
  importer?: string;
}

export interface ActionPlan {
  id: string;
  type: string;
  description: string;
  deadline?: string;
  assignedTo?: string;
  status: "OPEN" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | string;
  action?: string;
  reason?: string;
  department?: string;
}

// ── BANKING / PAYMENT ─────────────────────────────────────
export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference: string;
  counterparty?: string;
  category?: string;

  refNo?: string;

  bankName?: string;

  accountNumber?: string;

  taxRate?: number;

  exchangeRate?: number;

  processDate?: string;
  type?: string;
  amount?: number;
  status?: string;
  attachment?: string;
}

export interface BankSummary {
  totalDebit: number;
  totalCredit: number;
  openingBalance: number;
  closingBalance: number;
  transactionCount: number;

  totalCogs?: number;

  totalOperating?: number;

  netFlow?: number;
  totalRevenue?: number;
  totalTax?: number;
}

// ── ANALYTICS ─────────────────────────────────────────────
export interface RFMData {
  customerId: string;
  customerName?: string;
  recency: number;
  frequency: number;
  monetary: number;
  segment?: string;

  score?: number;
}

export interface AggregatedReport {
  id: string;
  period: string;
  modules: string[];
  data: Record<string, unknown>;
  generatedAt: number;
  records?: any[];
}

export interface DataPoint {
  source?: string;
  id?: string;
  timestamp: number;
  value?: number;
  label?: string;
  category?: string;
  payload?: Record<string, any>;
  confidence?: number;
}

// ── SUPPLIER ──────────────────────────────────────────────
export interface Supplier {
  id: string;
  name?: string;
  taxCode?: string;
  category?: string;
  country?: string;
  tier?: "PLATINUM" | "GOLD" | "SILVER" | "STANDARD";
  riskScore?: number;
  totalOrders?: number;
  totalValue?: number;
  lastOrderAt?: number;
  contact?: string;
  email?: string;
  diaChi?: string; maSoThue?: string; ghiChu?: string;
  loaiNCC?: string; sentimentScore?: number; transactionAmount?: number;
  status?: "ACTIVE" | "BLACKLISTED" | "UNDER_REVIEW";

  nhomHangChinh?: string[];

  quyMo?: string;

  xuHuong?: string;

  coTienNang?: boolean;
  maNhaCungCap?: string;
  tenNhaCungCap?: string;
}

// ── COLLABORATION ─────────────────────────────────────────
export interface ChatMessage {
  id: string;
  senderId?: string;
  senderName?: string;
  content: string;
  timestamp: number;
  type: "TEXT" | "IMAGE" | "FILE" | "SYSTEM" | "text" | "image" | "file" | "system" | "video" | "audio";
  roomId?: string;
  persona?: PersonaID;
  read?: boolean;

  personaId?: string;

  isThinking?: boolean;

  fileData?: string;

  suggestedActions?: string[];

  isEdited?: boolean;

  history?: any[];
  role?: "user" | "assistant" | "system" | string;
  citations?: string[];
  text?: string;
}

export interface RoomConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  creatorId: string;
  members: PositionType[];
  pendingRequests: JoinRequest[];
  settings: RoomSettings;
}

export interface JoinRequest {
  id?: string;
  userId: string;
  userName: string;
  requestedAt?: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  userPosition?: any;
  timestamp?: number;
}

export interface RoomSettings {
  antiSpam: boolean;
  blockPersonas: PersonaID[];
  autoDeleteMessages: boolean;
  encryptionLevel: "STANDARD" | "HIGH" | "OMEGA" | string;
  isMuted: boolean;
  joinCode?: string;
  allowCalls: boolean;
  allowVoice: boolean;
  allowImport: boolean;
}

// ── EMAIL ─────────────────────────────────────────────────
export interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  to: string[];
  body: string;
  receivedAt: number;
  read: boolean;
  starred: boolean;
  labels: string[];
  attachments?: string[];
  category?: string;

  snippet?: string;
  date?: string;
}

export interface DictionaryVersion {
  version: string;
  changes: number;
  publishedAt: number;
  author: string;

  versionNumber?: string;

  metadata?: { reason?: string };
  id?: string;
  createdBy?: string;
}

// ── SYNC ──────────────────────────────────────────────────
export interface SyncJob {
  id: string;
  name?: string;
  type?: string;
  source: string;
  destination: string;
  status: "PENDING" | "RUNNING" | "DONE" | "FAILED" | "COMPLETED" | "IDLE";
  strategy: SyncConflictStrategy;
  createdAt?: number;
  completedAt?: number;
  recordsProcessed?: number;

  progress?: number;
  totalRows?: number;
  processedRows?: number;
  duplicatesFound?: number;
  isIncremental?: boolean;
  isEncrypted?: boolean;
}

export interface SyncLog {
  id?: string;
  jobId?: string;
  timestamp: number;
  message: string;
  level: "INFO" | "WARN" | "WARNING" | "ERROR" | "SUCCESS" | "SECURE";
}

// ── WORKFLOW / NAVIGATOR ──────────────────────────────────
export interface WorkflowNode {
  id: string;
  label: string;
  type?: "START" | "PROCESS" | "DECISION" | "END" | "CELL" | string;
  position?: { x: number; y: number };
  cellId?: string;
  status?: "IDLE" | "ACTIVE" | "DONE" | "ERROR";
  x?: number;
  y?: number;
  view?: string;
  color?: string;
  icon?: string;
  desc?: string;
}

export interface WorkflowEdge {
  id?: string;
  from: string;
  to: string;
  label?: string;
  condition?: string;
  active?: boolean;
}

// ── QUANTUM ───────────────────────────────────────────────
export interface QuantumState {
  id: string;
  coherence: number;
  entanglement: number;
  entropy: number;
  timestamp: number;

  superpositionCount?: number;
}

export interface ConsciousnessField {
  cells: string[];
  resonance: number;
  dominantPersona: PersonaID;
  activeSignals: number;

  mood?: string;

  awarenessLevel?: number;

  lastCollapse?: number;
}

export interface QuantumEvent {
  id: string;
  type: string;
  sourceCell: string;
  payload: unknown;
  timestamp: number;
  collapsed: boolean;

  sensitivityVector?: { risk: number; financial: number; temporal: number };
  status?: string;
  decision?: string;
}

// ── FILE INGESTION ────────────────────────────────────────
export interface FileMetadata {
  id: string;
  filename: string;
  fileName?: string;
  mimeType: string;
  size: number;
  status: IngestStatus;
  uploadedAt: number;
  processedAt?: number;
  extractedData?: Record<string, unknown>;
}

// ── TRANSFER / LOGISTICS ──────────────────────────────────
export interface TransferOrder {
  id: string;
  from: string;
  to: string;
  items: Array<{ itemId: string; quantity: number }>;
  status: "PENDING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  createdAt: number;
  deliveredAt?: number;
  transferId?: string;
  fromWarehouse?: string;
  toWarehouse?: string;
  transferDate?: number;
  productName?: string;
}

export interface LogisticsSolution {
  provider: string;
  estimatedDays: number;
  cost: number;
  trackingId?: string;

  recommended?: boolean;

  partnerId?: string;

  partnerName?: string;

  estimatedDelivery?: number;

  reliability?: number;
  totalCost?: number;
}

// ── BLOCKCHAIN ────────────────────────────────────────────
export interface BlockShard {
  shardId: string;
  blockHeight: number;
  hash: string;
  prevHash: string;
  data: Record<string, unknown>;
  timestamp: number;
  validator?: string;

  enterpriseId?: string;
}


// ── EXTENDED / COMPAT TYPES ──────────────────────────────
export interface ExtendedDeclaration extends CustomsDeclaration {
  riskAssessment?: { level: string; score: number; flags?: string[]; factors?: string[]; recommendation?: string; };
  trackingTimeline?: Array<{ status: string; timestamp: number; note?: string }>;
  header?: { declarantName?: string; declarantTaxCode?: string; portCode?: string; routeCode?: string; transportMode?: string; countryOfOrigin?: string; declarationNumber?: string; streamCode?: string; };
  compliance?: { status?: "PASS" | "FAIL" | "REVIEW"; violations?: string[]; score?: number; isCompliant?: boolean; };
}

export interface DetailedPersonnel {
  id: string; employeeId?: string; employeeCode?: string;
  name?: string; fullName?: string;
  position: UserPosition | PositionType | any;
  department: string; division?: string; branch?: string;
  phone?: string; email?: string; startDate: string; salary?: number;
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE" | string;
  approvalStatus?: string;
  kpiScore?: number; kpiPoints?: number; avatar?: string;
  role?: UserRole;
  workPlace?: string;
  dob?: string; gender?: string; nationality?: string; ethnic?: string;
  idCard?: string; dependentCount?: number; dependents?: number;
  originAddress?: string; permanentAddress?: string; temporaryAddress?: string; contactAddress?: string;
  baseSalary?: number; actualWorkDays?: number; insuranceSalary?: number; salaryFactor?: number;
  allowanceLunch?: number; allowancePosition?: number;
  contractNo?: string; contractDate?: string; contractType?: string;
  insuranceCode?: string; bankAccountNo?: string; bankName?: string;
  familyMembers?: any[]; auditTrail?: any[];
  tasksCompleted?: number; lastRating?: string; bio?: string;
}

// WarehouseLocation as const — SalesArchitectureView dùng như enum value
export const WarehouseLocation = {
  HCM_HEADQUARTER: "HCM_HEADQUARTER", HANOI_BRANCH: "HANOI_BRANCH",
  DA_NANG_BRANCH: "DA_NANG_BRANCH", VAULT_A: "VAULT_A", VAULT_B: "VAULT_B",
} as const;
export type WarehouseLocationKey = keyof typeof WarehouseLocation;

// ── ADDITIONAL COMPAT TYPES ──────────────────────────────
export interface RFMData {
  customerId: string;
  recency: number;
  frequency: number;
  monetary: number;
  segment?: string;
  name?: string;
  rfmScore?: number;
}

export interface FlowLog {
  id: string; stage: string; actor: string; action: string;
  timestamp: number; status: "OK" | "ERROR" | "PENDING";
  step?: number | string; detail?: string;
}

export interface QuantumContainerProps {
  children?: React.ReactNode;
  className?: string;
  mode?: string;
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
}
