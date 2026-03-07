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
  LEVEL_7 = "LEVEL_7", LEVEL_8 = "LEVEL_8", GUEST = "GUEST"
}

export enum PositionType {
  CEO = "CEO", CFO = "CFO", COO = "COO", CTO = "CTO",
  GENERAL_MANAGER = "GENERAL_MANAGER", ACCOUNTANT = "ACCOUNTANT",
  SELLER = "SELLER", WAREHOUSE_STAFF = "WAREHOUSE_STAFF",
  HR_STAFF = "HR_STAFF", PRODUCTION_STAFF = "PRODUCTION_STAFF",
  CUSTOMS_OFFICER = "CUSTOMS_OFFICER", AUDITOR = "AUDITOR"
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
  SMART_LINK = "SMART_LINK", NOTIFICATION = "NOTIFICATION"
}

export enum Domain {
  AUDIT = "AUDIT", FINANCE = "FINANCE", HR = "HR", COMPLIANCE = "COMPLIANCE",
  INVENTORY = "INVENTORY", SALES = "SALES", CUSTOMS = "CUSTOMS",
  PRODUCTION = "PRODUCTION", GOVERNANCE = "GOVERNANCE"
}

export enum Permission {
  READ = "READ", WRITE = "WRITE", DELETE = "DELETE", APPROVE = "APPROVE",
  EXPORT = "EXPORT", ADMIN = "ADMIN", OVERRIDE = "OVERRIDE"
  VIEW = "VIEW",
  SIGN = "SIGN",
  ADMIN = "ADMIN",
}

export enum ModuleID {
  DASHBOARD = "DASHBOARD", SALES = "SALES", INVENTORY = "INVENTORY",
  FINANCE = "FINANCE", HR = "HR", AUDIT = "AUDIT", COMPLIANCE = "COMPLIANCE",
  CUSTOMS = "CUSTOMS", GOVERNANCE = "GOVERNANCE", SYSTEM = "SYSTEM"
}

export enum HeatLevel { COLD = "COLD", WARM = "WARM", HOT = "HOT", CRITICAL = "CRITICAL" }

export enum OrderStatus {
  PENDING = "PENDING", CONFIRMED = "CONFIRMED", PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED", CANCELLED = "CANCELLED", REFUNDED = "REFUNDED"
  DESIGNING = "DESIGNING",
  COLD_WORK = "COLD_WORK",
  STONE_SETTING = "STONE_SETTING",
  FINISHING = "FINISHING",
}

export enum EInvoiceStatus {
  DRAFT = "DRAFT", SIGNED = "SIGNED", SUBMITTED = "SUBMITTED",
  ACCEPTED = "ACCEPTED", REJECTED = "REJECTED", CANCELLED = "CANCELLED"
  XML_BUILT = "XML_BUILT",
}

export enum TxStatus {
  PENDING = "PENDING", APPROVED = "APPROVED", REJECTED = "REJECTED", VOIDED = "VOIDED"
}

export enum SalesChannel { SHOWROOM = "SHOWROOM", ONLINE = "ONLINE", B2B = "B2B", WHOLESALE = "WHOLESALE" }

export enum IngestStatus { QUEUED = "QUEUED", PROCESSING = "PROCESSING", DONE = "DONE", FAILED = "FAILED" }

export enum AlertLevel { INFO = "INFO", WARNING = "WARNING", CRITICAL = "CRITICAL" }

export enum SyncConflictStrategy { LAST_WRITE = "LAST_WRITE", FIRST_WRITE = "FIRST_WRITE", MERGE = "MERGE", MANUAL = "MANUAL" }

export enum ConflictResolutionMethod { LAST_WRITE_WINS = "LAST_WRITE_WINS", FIRST_WRITE_WINS = "FIRST_WRITE_WINS", MERGE = "MERGE", MANUAL = "MANUAL" }

// ── CORE INTERFACES ──────────────────────────────────────
export interface UserPosition {
  userId?: string;
  role: PositionType;
  displayName?: string;
  department?: string;
  branch?: string;
  level?: number;
  DIRECT_SALE = "DIRECT_SALE",
  COMMITTED = "COMMITTED",
}

export interface ModuleConfig {
  id: string;
  label: string;
  view: ViewType;
  icon: string;
  allowedRoles: UserRole[];
  description?: string;
  badge?: number;
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

  userPosition?: string;
}

export interface BusinessMetrics {
  totalRevenue: number;
  totalCost: number;
  totalProfit?: number;
  orderCount: number;
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
  status?: "ACTIVE" | "INACTIVE" | "DISCONTINUED";
  warehouseLocation?: string;
  serialNumber?: string;
  certificateId?: string;

  // Extended fields for UI components
  image?: string;
  images?: string[];
  videos?: string[];
  specifications?: Record<string, string>;
  leadTime?: number;
  isCustomizable?: boolean;
  tradeAssurance?: boolean;
  moqUnit?: string;
  rating?: number;
  supplier?: { tenNhaCungCap: string; maNhaCungCap?: string };
}

export interface InventoryItem extends Product {
  quantity: number;
  unit: string;
  location: string;
  lotNumber?: string;
  lastMovement?: number;
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
  sellerTaxCode: string;
  sellerName: string;
  buyerTaxCode?: string;
  buyerName: string;
  buyerAddress?: string;
  items: EInvoiceItem[];
  totalAmount: number;
  vatAmount: number;
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
  employeeId: string;
  month: string;
  baseSalary: number;
  allowances: number;
  bonus: number;
  grossIncome: number;
  deductions: number;
  netIncome: number;
  pitAmount: number;
}

export interface SalaryRule {
  id: string;
  type: "BONUS" | "DEDUCTION" | "ALLOWANCE";
  name: string;
  amount: number;
  condition?: string;

  division?: string;
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
  action: string;
  actorId: string;
  targetId: string;
  module: string;
  details: string;
  timestamp: number;
  hash: string;
}

export interface ComplianceViolation {
  id: string;
  regulationId: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  detectedAt: number;
  resolvedAt?: number;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "ACCEPTED";
}

export interface GovernanceRecord {
  id: string;
  type: string;
  decision: string;
  rationale: string;
  madeBy: string;
  madeAt: number;
  affectedCells: string[];
  status: "PROPOSED" | "ACTIVE" | "SUPERSEDED";

  auditTrail?: any[];

  operatorId?: string;
}

export interface GovernanceTransaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: TxStatus;
  requestedBy: string;
  approvedBy?: string;
  moduleId: ModuleID;
  createdAt: number;
  notes?: string;

  flags?: string[];
}

export interface OperationRecord {
  id: string;
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
  sellerId: string;
  date: string;
  totalSales: number;
  orderCount: number;
  revenue: number;
  commission: number;
  topProducts?: string[];

  productSku?: string;

  shellRevenue?: number;

  stoneRevenue?: number;
}

export interface SellerIdentity {
  userId: string;
  name: string;
  tier: "STANDARD" | "SENIOR" | "EXPERT" | "MASTER";
  since: string;
  branch?: string;

  kpiPoints?: number;

  stars?: number;

  isCollaborator?: boolean;
}

export interface CustomerLead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  interest: string;
  budget?: number;
  source: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST";
  assignedTo?: string;
  createdAt: number;

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
  priority: "LOW" | "MEDIUM" | "HIGH";
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
}

// ── ANALYTICS ─────────────────────────────────────────────
export interface RFMData {
  customerId: string;
  customerName?: string;
  recency: number;
  frequency: number;
  monetary: number;
  segment?: "CHAMPION" | "LOYAL" | "POTENTIAL" | "AT_RISK" | "LOST";

  score?: number;
}

export interface AggregatedReport {
  id: string;
  period: string;
  modules: string[];
  data: Record<string, unknown>;
  generatedAt: number;
}

export interface DataPoint {
  timestamp: number;
  value: number;
  label?: string;
  category?: string;
}

// ── SUPPLIER ──────────────────────────────────────────────
export interface Supplier {
  id: string;
  name: string;
  taxCode?: string;
  category: string;
  country: string;
  tier?: "PLATINUM" | "GOLD" | "SILVER" | "STANDARD";
  riskScore?: number;
  totalOrders?: number;
  totalValue?: number;
  lastOrderAt?: number;
  contact?: string;
  email?: string;
  status: "ACTIVE" | "BLACKLISTED" | "UNDER_REVIEW";

  loaiNCC?: string;

  transactionAmount?: number;

  sentimentScore?: number;

  nhomHangChinh?: string[];

  quyMo?: string;

  xuHuong?: string;

  coTienNang?: boolean;
}

// ── COLLABORATION ─────────────────────────────────────────
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  type: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
  roomId?: string;
  persona?: PersonaID;
  read?: boolean;

  personaId?: string;

  isThinking?: boolean;

  fileData?: string;

  suggestedActions?: string[];

  isEdited?: boolean;

  history?: any[];
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
  userId: string;
  userName: string;
  requestedAt: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface RoomSettings {
  antiSpam: boolean;
  blockPersonas: PersonaID[];
  autoDeleteMessages: boolean;
  encryptionLevel: "STANDARD" | "HIGH" | "OMEGA";
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
  category?: "INVOICE" | "SUPPLIER" | "CUSTOMS" | "INTERNAL" | "OTHER";

  snippet?: string;
}

export interface DictionaryVersion {
  version: string;
  changes: number;
  publishedAt: number;
  author: string;

  versionNumber?: string;

  metadata?: { reason?: string };
}

// ── SYNC ──────────────────────────────────────────────────
export interface SyncJob {
  id: string;
  type: string;
  source: string;
  destination: string;
  status: "PENDING" | "RUNNING" | "DONE" | "FAILED";
  strategy: SyncConflictStrategy;
  createdAt: number;
  completedAt?: number;
  recordsProcessed?: number;

  progress?: number;
}

export interface SyncLog {
  jobId: string;
  timestamp: number;
  message: string;
  level: "INFO" | "WARN" | "ERROR";
}

// ── WORKFLOW / NAVIGATOR ──────────────────────────────────
export interface WorkflowNode {
  id: string;
  label: string;
  type: "START" | "PROCESS" | "DECISION" | "END" | "CELL";
  position: { x: number; y: number };
  cellId?: string;
  status?: "IDLE" | "ACTIVE" | "DONE" | "ERROR";
}

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  condition?: string;
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
}

// ── FILE INGESTION ────────────────────────────────────────
export interface FileMetadata {
  id: string;
  filename: string;
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
  items: Array<{ itemId: string; quantity: number 
  transferId?: string;

  fromWarehouse?: string;

  toWarehouse?: string;

  transferDate?: number;
}>;
  status: "PENDING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  createdAt: number;
  deliveredAt?: number;
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

