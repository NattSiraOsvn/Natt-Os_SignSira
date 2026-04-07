
export enum HeatLevel {
  LEVEL_0 = 0, // Cold
  LEVEL_1 = 1, // Operational
  LEVEL_2 = 2, // Managerial
  LEVEL_3 = 3  // Strategic Core (Master)
}

export enum UserRole {
  MASTER = 'MASTER',
  ADMIN = 'ADMIN',
  LEVEL_1 = 'LEVEL_1 (CEO)',
  LEVEL_2 = 'LEVEL_2 (MANAGER)',
  LEVEL_3 = 'LEVEL_3 (LEADER)',
  LEVEL_4 = 'LEVEL_4 (DEPUTY)',
  LEVEL_5 = 'LEVEL_5 (STAFF)',
  LEVEL_6 = 'LEVEL_6 (WORKER)',
  LEVEL_7 = 'LEVEL_7 (COLLABORATOR)',
  LEVEL_8 = 'LEVEL_8 (AUDITOR)',
  SIGNER = 'SIGNER',
  APPROVER = 'APPROVER',
  OPERATOR = 'OPERATOR'
}

// 1️⃣ Fix: Chuyển đổi UserPosition thành Interface theo chỉ thị SAFE FIX của Anh Natt
export interface UserPosition {
  id: string;
  role: string;
  scope: string[];
}

// Giữ các giá trị vị trí cũ trong enum riêng để phục vụ logic nghiệp vụ
export enum PositionType {
  CFO = 'CFO',
  CEO = 'CEO',
  CHAIRMAN = 'CHAIRMAN',
  GENERAL_MANAGER = 'GENERAL_MANAGER',
  PROD_DIRECTOR = 'PROD_DIRECTOR',
  ACCOUNTING_MANAGER = 'ACCOUNTING_MANAGER',
  CASTING_MANAGER = 'CASTING_MANAGER',
  ROUGH_FINISHER = 'ROUGH_FINISHER',
  CONSULTANT = 'CONSULTANT',
  MEDIA_LEAD = 'MEDIA_LEAD',
  COLLABORATOR = 'COLLABORATOR'
}

export enum ViewType {
  dashboard = 'dashboard',
  admin_hub = 'admin_hub',
  smart_link = 'smart_link',
  personal_sphere = 'personal_sphere',
  quantum_brain = 'quantum_brain',
  system_navigator = 'system_navigator',
  data_archive = 'data_archive',
  command = 'command',
  unified_report = 'unified_report',
  sales_terminal = 'sales_terminal',
  sales_core = 'sales_core',
  production_flow = 'production_flow',
  showroom = 'showroom',
  seller_terminal = 'seller_terminal',
  ops_terminal = 'ops_terminal',
  production_manager = 'production_manager',
  production_wallboard = 'production_wallboard',
  daily_report = 'daily_report',
  warehouse = 'warehouse',
  suppliers = 'suppliers',
  sales_tax = 'sales_tax',
  tax_reporting = 'tax_reporting',
  banking_processor = 'banking_processor',
  payment_hub = 'payment_hub',
  governance = 'governance',
  analytics = 'analytics',
  rfm_analysis = 'rfm_analysis',
  compliance = 'compliance',
  audit_trail = 'audit_trail',
  customs_intelligence = 'customs_intelligence',
  hr = 'hr',
  processor = 'processor',
  learning_hub = 'learning_hub',
  monitoring = 'monitoring',
  dev = 'dev',
  rbac_manager = 'rbac_manager',
  chat = 'chat',
  rooms = 'rooms',
  kris_email = 'kris_email',
  calibration_lab = 'calibration_lab'
}

export enum PersonaID {
  THIEN = 'THIEN',
  CAN = 'CAN',
  KRIS = 'KRIS',
  PHIEU = 'PHIEU'
}

export enum Domain {
  AUDIT = 'AUDIT',
  SALES_TAX = 'SALES_TAX',
  CUSTOMS = 'CUSTOMS',
  JEWELRY = 'JEWELRY',
  BRAND_LAB = 'BRAND_LAB',
  LEGAL = 'LEGAL',
  IT = 'IT',
  METAPHYSICS = 'METAPHYSICS'
}

export enum IngestStatus {
  QUEUED = 'QUEUED',
  VALIDATING = 'VALIDATING',
  EXTRACTING = 'EXTRACTING',
  MAPPING = 'MAPPING',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  COMMITTED = 'COMMITTED',
  FAILED = 'FAILED',
  QUARANTINED = 'QUARANTINED'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REQUESTED_CHANGES = 'REQUESTED_CHANGES',
  ESCALATED = 'ESCALATED'
}

export enum OrderStatus {
  SALE_ORDER = 'SALE_ORDER',
  DESIGNING = 'DESIGNING',
  WAX_READY = 'WAX_READY',
  MATERIAL_ISSUED = 'MATERIAL_ISSUED',
  CASTING = 'CASTING',
  COLLECTING_BTP = 'COLLECTING_BTP',
  COLD_WORK = 'COLD_WORK',
  STONE_SETTING = 'STONE_SETTING',
  FINISHING = 'FINISHING',
  QC_PENDING = 'QC_PENDING',
  QC_PASSED = 'QC_PASSED',
  COMPLETED = 'COMPLETED',
  LOSS_ALERT = 'LOSS_ALERT',
  DRAFT = 'DRAFT',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export enum InputPersona {
  OFFICE = 'OFFICE (Dân Văn Phòng)',
  DATA_ENTRY = 'DATA_ENTRY (Nhập liệu chuyên nghiệp)',
  PHARMACY = 'PHARMACY (Nhập số thành thuốc)',
  EXPERT = 'EXPERT (Thợ kim hoàn rành tay)',
  MASTER = 'MASTER (Anh Natt)'
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

export enum SalesChannel {
  DIRECT_SALE = 'DIRECT_SALE',
  LOGISTICS = 'LOGISTICS',
  ONLINE = 'ONLINE',
  WHOLESALE = 'WHOLESALE',
  CONSIGNMENT = 'CONSIGNMENT'
}

export enum WarehouseLocation {
  HCM_HEADQUARTER = 'HCM_HEADQUARTER',
  HANOI_BRANCH = 'HANOI_BRANCH',
  DA_NANG_BRANCH = 'DA_NANG_BRANCH',
  TRANSIT_HUB = 'TRANSIT_HUB'
}

export enum ProductType {
  RAW_MATERIAL = 'RAW_MATERIAL',
  FINISHED_GOOD = 'FINISHED_GOOD',
  SEMI_FINISHED = 'SEMI_FINISHED',
  SERVICE = 'SERVICE'
}

export enum ModuleID {
  PRODUCTION = 'PRODUCTION',
  SALES = 'SALES',
  FINANCE = 'FINANCE',
  LEGAL = 'LEGAL',
  HR = 'HR',
  REPORTING = 'REPORTING',
  INVENTORY = 'INVENTORY'
}

export enum Permission {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  SIGN = 'SIGN',
  EXPORT = 'EXPORT'
}

export enum CertType {
  INTERNAL = 'INTERNAL',
  GIA = 'GIA',
  IGI = 'IGI',
  HRD = 'HRD'
}

export enum SyncConflictStrategy {
  MERGE = 'MERGE',
  OVERWRITE = 'OVERWRITE',
  MANUAL = 'MANUAL'
}

export enum AlertLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  FATAL = 'FATAL',
  STAGING = 'STAGING'
}

export enum ConflictResolutionMethod {
  PRIORITY_BASED = 'priority_based',
  TIMESTAMP_BASED = 'timestamp_based',
  MANUAL_REVIEW = 'manual_review',
  AI_SCORING = 'ai_scoring'
}

export interface DomainConfig {
  id: Domain;
  title: string;
  description: string;
  icon: string;
  color: string;
  persona: PersonaID;
}

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

export interface FileMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  hash: string;
  status: IngestStatus;
  uploadedAt: number;
  uploadedBy?: string;
  timestamp?: number;
  context?: string;
  confidence?: number;
  confidenceScore?: number;
  detectedContext?: string;
}

export interface DictionaryVersion {
  id: string;
  version?: string | number;
  versionNumber?: number;
  status?: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  createdAt: number;
  isFrozen: boolean;
  termsCount: number;
  comment?: string;
  type?: string;
  dictionaryId?: string;
  previousVersionId?: string;
  data?: any;
  changes?: {
    added: number;
    removed: number;
    modified: number;
    diffSummary: string[];
  };
  createdBy?: string;
  metadata?: any;
}

export interface ApprovalTicket {
  id: string;
  entityType?: string;
  entityId?: string;
  currentStep?: number;
  totalSteps: number;
  status: ApprovalStatus;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL';
  createdBy?: string;
  createdAt?: number;
  request: ApprovalRequest;
  requestedAt: number;
  approvedBy?: string;
  approvedAt?: number;
  rejectionReason?: string;
  workflowStep?: number;
  metadata?: any;
}

export interface ApprovalRequest {
  recordType: 'DICTIONARY' | 'TRANSACTION' | 'CONFLICT' | 'HR_PROFILE';
  changeType: 'CREATE' | 'UPDATE' | 'DELETE' | 'CONFLICT_RESOLUTION';
  currentData?: any;
  proposedData: any;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  requestedBy: string;
}

export interface BusinessMetrics {
  revenue: number;
  revenue_pending?: number;
  goldInventory: number;
  productionProgress: number;
  invoicesIssued: number;
  riskScore: number;
  lastUpdate: number;
  totalTaxDue: number;
  totalPayroll: number;
  currentOperatingCost: number;
  importVolume: number;
  pendingApprovals: number;
  cadPending: number;
  totalCogs: number;
  totalOperating: number;
}

export interface ActionLog {
  id: string;
  timestamp: number;
  module: string;
  action: string;
  details: string;
  userId: string;
  userPosition: string;
  hash: string;
}

export interface OperationRecord {
  id: string;
  type: string;
  module: string;
  params: any;
  timestamp: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'RECOVERED';
  error?: string;
}

export interface Checkpoint {
  id: string;
  moduleState: any;
  timestamp: number;
}

export interface Supplier {
  id: string;
  maNhaCungCap: string;
  tenNhaCungCap: string;
  diaChi: string;
  maSoThue: string;
  loaiNCC?: 'TRONG_NUOC' | 'NUOC_NGOAI' | 'CA_NHAN' | 'TO_CHUC';
  nhomHangChinh?: string[];
  khuVuc?: 'BAC' | 'TRUNG' | 'NAM' | 'QUOC_TE';
  phuongThucThanhToan?: 'CHUYEN_KHOAN' | 'TIEN_MAT' | 'QUOC_TE';
  mucDoUuTien?: 'CAO' | 'TRUNG_BINH' | 'THAP';
  trangThaiHopTac?: 'DANG_HOAT_DONG' | 'TAM_NGUNG' | 'DUNG';
  level?: string;
  yearsOnPlatform?: number;
  responseRate?: number;
  responseTime?: string;
  transactionAmount?: number;
  location?: string;
  badges?: string[];
  maNhomNCC?: string;
  dienThoai?: string;
  website?: string;
  email?: string;
  quocGia?: string;
  tinhTP?: string;
  soTaiKhoan?: string;
  tenNganHang?: string;
  ghiChu?: string;
  dichVuDacThu?: string[];
  mucDoTinCay?: 'A' | 'B' | 'C';
  ngayBatDauHopTac?: string;
  sentimentScore?: number;
  quyMo?: 'LON' | 'VUA' | 'NHO';
  xuHuong?: 'TANG' | 'GIAM' | 'ON_DINH';
  coTienNang?: boolean;
  diemDanhGia?: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  category: string;
  image: string;
  images: string[];
  videos: string[];
  minOrder: number;
  moqUnit: string;
  description: string;
  stock: number;
  isCustomizable: boolean;
  leadTime: number;
  supplier: Supplier;
  rating: number;
  reviews: number;
  isVerifiedSupplier: boolean;
  tradeAssurance: boolean;
  specifications: Record<string, string>;
  tags: string[];
  status: string;
}

export interface CCCDIdentity {
  number: string;
  fullName?: string;
  dob?: string;
}

export interface IdentityData {
  type: 'CCCD' | 'FACE';
  hash: string;
  timestamp: number;
  confidence: number;
  maskedId: string;
  details?: any;
}

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

export interface SyncJob {
  id: string;
  name: string;
  source: string;
  destination: string;
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  totalRows: number;
  // Fix: Deleted duplicate processedRows property
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

export interface DataPoint {
  id: string;
  source: 'MASTER_MANUAL' | 'DIRECT_API' | 'OMEGA_OCR' | 'LEGACY_SYNC' | 'UNKNOWN';
  payload: any;
  confidence: number;
  timestamp: number;
  authorId?: string;
  calculatedConfidence?: number;
  scoreDetails?: any;
}

export interface BlockShard {
  shardId: string;
  enterpriseId: string;
  blockHash: string;
  prevHash: string;
  status: string;
  timestamp: number;
}

export interface AuditItem {
  id: string;
  module: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  issue: string;
  consequence: string;
  owner: PersonaID;
}

export interface CustomsDeclaration {
  header: {
    declarationNumber: string;
    streamCode: 'RED' | 'YELLOW' | 'GREEN';
    [key: string]: any;
  };
  items: CustomsDeclarationItem[];
  summary: {
    totalTaxPayable: number;
    clearanceStatus: string;
    riskNotes: string;
    relatedFiles: string[];
    internalNotes: string;
  };
  riskAssessment?: RiskAssessment;
  compliance?: ComplianceCheck;
  trackingTimeline?: TrackingStep[];
}

export interface CustomsDeclarationItem {
  stt: number;
  hsCode: string;
  description: string;
  invoiceValue: number;
  vatAmount: number;
  importTaxAmount: number;
  qtyActual: number;
  unit: string;
  qtyTax: number;
  unitTax: string;
  unitPrice: number;
  currency: string;
  incoterm: string;
  exchangeRate: number;
  taxableValueVND: number;
  taxableUnitPriceVND: number;
  importTaxRate: number;
  importTaxCode: string;
  importTaxExemption: number;
  originCountry: string;
  originCode: string;
  originGroup: string;
  taxType: string;
  vatTaxableValue: number;
  vatRate: number;
  vatExemption: number;
  validationErrors?: string[];
  gemType?: string;
  processStatus?: string;
  shape?: string;
  color?: string;
  clarity?: string;
  dimensions?: string;
  weightCT?: number;
  certNumber?: string;
  condition?: string;
}

export interface ActionPlan {
  type: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
  action: string;
  department: string;
  reason: string;
}

export interface RFMData {
  customerId: string;
  name: string;
  recency: number;
  frequency: number;
  monetary: number;
  score: number;
  segment: 'VIP' | 'THÀNH VIÊN' | 'RỦI RO' | 'MỚI';
}

export interface AuditTrailEntry {
  id: string;
  timestamp: number;
  userId: string;
  role: UserRole;
  action: string;
  oldValue?: string;
  newValue?: string;
  hash: string;
  note?: string;
}

export interface EmployeePayroll {
  id: string;
  name: string;
  employeeCode: string;
  division: string;
  department: string;
  role: string;
  startDate: string;
  baseSalary: number;
  actualWorkDays: number;
  allowanceLunch: number;
  dependents: number;
  insuranceSalary: number;
  grossSalary?: number;
  insuranceEmployee?: number;
  personalTax?: number;
  netSalary?: number;
  seniority?: string;
  performanceBonus?: number;
  kpiPoints?: number;
  taxableIncome?: number;
}

export interface SalaryRule {
  division: string;
  role: string;
  grade: string;
  salary: number;
}

export interface BankTransaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  refNo: string;
  bankName: string;
  accountNumber: string;
  type: string;
  taxRate: number;
  exchangeRate: number;
  status: 'SYNCED' | 'PENDING';
  processDate: string;
  attachment?: string;
  debit?: number;
  credit?: number;
  balance?: number;
  code?: string;
  tkDoiUng?: string;
  tenDoiUng?: string;
  mtid?: string;
  maDinhDanh?: string;
  account?: string;
  valueGroup?: ValueGroup;
  detail?: string;
  color?: string;
}

export type ValueGroup = 'THU' | 'CHI_VẬN_HÀNH' | 'CHI_GIÁ_VỐN' | 'THUẾ';

export interface BankSummary {
  totalRevenue: number;
  totalCogs: number;
  totalOperating: number;
  totalTax: number;
  netFlow: number;
  transactionCount: number;
  lastSync: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  type: string;
  warehouseId: string;
  quantity: number;
  unit: string;
  cost: number;
  purity?: string;
  location: string;
  status: string;
  lastCountDate: string;
  minThreshold: number;
  insuranceStatus: string;
  internalCertId?: string;
  qrUrl?: string;
  certType?: CertType;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  type: string;
  manager: string;
  totalValue: number;
  itemCount: number;
  securityLevel: string;
  layout?: any[];
}

export interface Movement {
  id: string;
  itemId: string;
  from: string;
  to: string;
  qty: number;
  date: string;
  by: string;
}

export interface EInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  taxCode: string;
  totalAmount: number;
  status: 'DRAFT' | 'SIGNED' | 'SENT_TCT' | 'REJECTED';
  xmlData?: string;
  signHash?: string;
}

export interface DistributedTask {
  id: string;
  origin: string;
  targetModule: ViewType;
  payload: any;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  timestamp: number;
  priority?: 'URGENT' | 'NORMAL';
}

export interface EInvoiceItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface VaultStatus {
  sealed: boolean;
  lastSealDate: number;
  sealHash: string;
}

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

export interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  userPosition: UserPosition;
  timestamp: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface ModuleConfig {
  id: ViewType;
  title: string;
  icon: string;
  group: 'SYSTEM' | 'CORE' | 'STRATEGIC' | 'PRODUCTION' | 'FINANCE';
  allowedRoles: UserRole[];
  componentName: string;
  active: boolean;
}

export interface GovernanceRecord {
  id: string;
  timestamp: number;
  type: string;
  status: 'BẢN NHÁP' | 'ĐÃ DUYỆT' | 'BỊ TỪ CHỐI' | 'ĐÃ KÝ SỐ';
  data: any;
  operatorId: string;
  auditTrail: AuditTrailEntry[];
}

export type TxStatus = 'CHỜ PHÊ DUYỆT' | 'SẴN SÀNG KÝ' | 'ĐÃ KÝ SỐ' | 'BỊ TRẢ LẠI';

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

export interface CustomizationRequest {
  specifications: Record<string, string>;
  quantity: number;
  deadline: string;
  notes: string;
  samples: boolean;
  logo: boolean;
  packaging: 'STANDARD' | 'PREMIUM_WOOD' | 'VELVET_LUXURY' | 'VAULT_BOX';
  engraving?: EngravingConfig;
  materialOverride?: MaterialOverride;
  hash: string;
}

export interface EngravingConfig {
  enabled: boolean;
  text: string;
  font: 'CLASSIC' | 'SCRIPT' | 'SERIF';
  location: 'INSIDE' | 'OUTSIDE';
}

export interface MaterialOverride {
  goldColor: 'YELLOW' | 'WHITE' | 'ROSE';
  goldPurity: '18K' | '14K' | '24K';
  stoneClass: 'VVS1' | 'VVS2' | 'VS1' | 'CZ_MASTER';
}

export interface ComplianceViolation {
  id: string;
  type: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: number;
}

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

export interface LearnedTemplate {
  position: UserPosition;
  docTypeDetected: string;
  suggestions: string[];
  fields: any[];
  dailyTasks: any[];
  productionData?: any;
  lastUpdated: number;
}

export interface PersonnelProfile {
  fullName: string;
  employeeCode: string;
  position: UserPosition;
  role: UserRole;
  startDate: string;
  kpiPoints: number;
  tasksCompleted: number;
  lastRating: string;
  bio: string;
}

export interface WeightTracking {
  stage: OrderStatus;
  weight_before: number;
  weight_after: number;
  recovery_gold: number;
}

export interface SellerReport {
  id: string;
  sellerId: string;
  sellerName: string;
  customerName: string;
  customerPhone: string;
  productSku: string;
  shellRevenue: number;
  stoneRevenue: number;
  stoneType: 'NONE' | 'UNDER_4LY' | 'ROUND_OVER_4LY' | 'FANCY_SHAPE';
  depositAmount: number;
  isReportedWithin24h: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  documents: any;
  commission: {
    shell: number;
    stone: number;
    total: number;
    penalty: number;
    baseRate: string;
    kpiFactor: number;
  };
  timestamp: number;
}

export interface SellerIdentity {
  userId: string;
  fullName: string;
  stars: number;
  kpiPoints: number;
  violations: number;
  role: UserRole;
  position: UserPosition;
  isCollaborator: boolean;
  department: string;
  gatekeeperBalance: number;
}

export interface CustomerLead {
  id: string;
  name: string;
  phone: string;
  source: string;
  ownerId: string;
  assignedDate: number;
  expiryDate: number; 
  status: 'COLD' | 'WARM' | 'HOT' | 'CONVERTED' | 'LOST' | 'RECLAIMED';
  lastInteraction: number;
}

export interface LogisticsSolution {
  partnerId: string;
  partnerName: string;
  serviceType: 'EXPRESS' | 'STANDARD' | 'AIR' | 'TRUCK';
  cost: {
    shippingFee: number;
    insuranceFee: number;
    codFee: number;
    fuelSurcharge: number;
    total: number;
  };
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
  status: 'PENDING' | 'TRANSIT' | 'COMPLETED' | 'RECOVERED';
  transportMethod: string;
  documents: string[];
}

export interface DynamicField {
  id: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'boolean';
  required: boolean;
}

export interface DetailedPersonnel extends PersonnelProfile {
  id: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PROBATION';
  approvalStatus: string;
  division: string;
  department: string;
  workPlace: string;
  dob: string;
  gender: string;
  nationality: string;
  ethnic: string;
  idCard: string;
  dependentCount: number;
  dependents: number;
  email: string;
  phone: string;
  originAddress: string;
  permanentAddress: string;
  temporaryAddress: string;
  contactAddress: string;
  baseSalary: number;
  actualWorkDays: number;
  insuranceSalary: number;
  salaryFactor: number;
  allowanceLunch: number;
  allowancePosition: number;
  contractNo: string;
  contractDate: string;
  contractType: string;
  insuranceCode: string;
  insuranceBookNo?: string;
  medicalCardNo?: string;
  medicalRegistration?: string;
  bankAccountNo: string;
  bankName: string;
  bankBranch?: string;
  familyMembers: any[];
  auditTrail: any[];
}

export interface MaterialTransaction {
  id: string;
}

export interface WorkerPerformance {
  workerId: string;
  kpi: number;
}

export interface VATReport {
  period: string;
  entries: VATEntry[];
  totalAddedValue: number;
  totalVATPayable: number;
  accountingStandard: string;
  formNumber: string;
}

export interface PITReport {
  period: string;
  entries: {
    employeeName: string;
    employeeCode: string;
    taxableIncome: number;
    deductions: number;
    taxPaid: number;
  }[];
  totalTaxableIncome: number;
  totalTaxPaid: number;
}

export interface VATEntry {
  category: string;
  salesValue: number;
  purchaseValue: number;
  addedValue: number;
  taxRate: number;
  taxAmount: number;
}

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

export type RolePermissions = {
  [key in ModuleID]: Permission[];
};

export interface RiskAssessment {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: { factor: string; weight: number; description: string }[];
}

export interface ComplianceCheck {
  isCompliant: boolean;
  issues: { type: string; severity: 'BLOCKING' | 'WARNING'; message: string }[];
  requiredDocuments: string[];
}

export interface TrackingStep {
  id: string;
  label: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  timestamp?: number;
  location?: string;
  notes?: string;
  pic?: string;
}

export interface AggregatedReport {
  period: string;
  totalRevenue: number;
  totalCOGS: number;
  totalOpEx: number;
  netProfit: number;
  discrepancyCount: number;
  records: LinkedRecord[];
}

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
  status: 'PENDING' | 'MATCHED' | 'DISCREPANCY';
}

export interface LogisticsPartner {
  id: string;
  name: string;
}

export interface SalesOrder {
  orderId: string;
  orderType: SalesChannel;
  customer: Customer;
  items: OrderItem[];
  pricing: OrderPricing;
  logistics?: LogisticsInfo;
  payment: PaymentInfo;
  status: OrderStatus;
  warehouse: WarehouseLocation;
  salesPerson: SalesPerson;
  commission: CommissionInfo;
  createdAt: number;
  updatedAt: number;
  notes?: string;
  tags?: string[];
  shardHash?: string; 
}

export interface OrderPricing {
  subtotal: number;
  basePriceTotal: number;
  gdbPriceTotal: number;
  exchangeRate: number;
  discountPercentage: number;
  promotionDiscount: number;
  taxAmount: number;
  shippingFee: number;
  insuranceFee: number;
  totalAmount: number;
  profitMargin: number;
  costOfGoods: number;
  grossProfit: number;
}

export interface OrderItem {
  productId: string;
  productCode: string;
  productName: string;
  productType: ProductType;
  quantity: number;
  unitPrice: number;      
  costPrice: number;      
  discount: number;       
  taxRate: number;        
  warehouseLocation: WarehouseLocation;
  batchNumber?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  tier: 'STANDARD' | 'VIP_SILVER' | 'VIP_GOLD' | 'VIP_DIAMOND';
  loyaltyPoints: number;
  taxCode?: string;
  address?: string;
}

export interface LogisticsInfo {
  provider: 'GHN' | 'GHTK' | 'VIETTEL_POST' | 'FEDEX' | 'INTERNAL';
  trackingCode: string;
  estimatedDelivery: number; 
  shippingAddress: string;
  shippingFeeRaw: number;
  codAmount: number;
  weight: number; 
  insuranceDeclaredValue: number;
}

export interface PaymentInfo {
  method: 'CASH' | 'CARD' | 'TRANSFER' | 'COD' | 'GATEWAY';
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  transactionId?: string;
  depositAmount: number;
  remainingAmount: number;
  currency: string;
}

export interface SalesPerson {
  id: string;
  name: string;
  position: UserPosition;
  kpiScore: number;
  commissionRateOverride?: number;
}

export interface CommissionInfo {
  policyId: string;
  baseRate: number; 
  kpiFactor: number;
  estimatedAmount: number;
  finalAmount: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CLAWBACK';
  note?: string;
}

export interface WorkflowNode {
  id: string;
  label: string;
  view: ViewType;
  x: number;
  y: number;
  color: string;
  icon: string;
  desc: string;
  status: 'ACTIVE' | 'IDLE' | 'ERROR';
}

export interface WorkflowEdge {
  from: string;
  to: string;
  label: string;
  active: boolean;
}

export interface QuantumState {
  coherence: number;
  entropy: number;
  superpositionCount: number;
  entanglementCount: number;
  energyLevel: number;
  waveFunction: { amplitude: number; phase: number; frequency: number; };
}

export interface QuantumEvent {
  id: string;
  type: string;
  sensitivityVector: { temporal: number; financial: number; risk: number; operational: number; };
  status: 'SUPERPOSITION' | 'COLLAPSED';
  probability: number;
  timestamp: number;
  decision?: string;
}

export interface ConsciousnessField {
  awarenessLevel: number;
  focusPoints: string[];
  mood: 'STABLE' | 'CRITICAL' | 'CAUTIOUS';
  lastCollapse: number;
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

export interface CostAllocation {
  costId: string;
  costType: 'MARKETING' | 'RENT' | 'OPERATIONS';
  totalAmount: number;
  allocationMethod: 'REVENUE_BASED';
  allocationDate: number;
  allocations: {
    costCenter: string;
    allocatedAmount: number;
    allocationRatio: number;
    basis: string;
  }[];
}

export interface GDBData {
  customer: { name: string; phone: string; normalizedPhone: string };
  product: { code: string; type: string; description: string; specifications: string[]; weight: number; diamondSpecs?: DiamondSpecs };
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
  metadata: any;
}

export interface DiamondSpecs {
  size: string;
  clarity: string;
  color: string;
  quantity: number;
  dimensions?: string;
  weight?: number;
  cert?: string;
  shape?: string;
}

export interface ResolutionContext {
  businessType: string;
  priorityModule?: string;
}

export interface ResolvedData {
  winner: DataPoint;
  losers: DataPoint[];
  methodUsed: ConflictResolutionMethod;
  resolutionHash: string;
  isAutoResolved: boolean;
}

export interface ConflictResolutionRule {
  dataType: string;
  threshold: number;
  defaultMethod: ConflictResolutionMethod;
  fallbackMethod?: ConflictResolutionMethod;
}

export interface BusinessContext {
  industry: 'JEWELRY' | 'FINANCE' | 'LOGISTICS' | 'GENERAL';
  region: string;
  priority: string;
  dataType: string;
}

export interface ScoreResult {
  finalScore: number;
  details: ScoreDetails;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
}

export interface ScoreDetails {
  source: number;
  temporal: number;
  completeness: number;
  validation: number;
  crossRef: number;
}

export interface FraudCheckResult {
  allowed: boolean;
  level: AlertLevel;
  message: string;
  action: 'PROCEED' | 'BLOCK' | 'WARN' | 'LOCK_ACCOUNT';
  historyRecord?: any;
}

export interface TaxCalculationResult {
  cit: {
    taxableIncome: number;
    rate: number;
    incentives: number;
    amount: number;
  };
}

export interface SalesEvent {
  type: string;
  order?: SalesOrder;
  commission?: any;
  movement?: any;
  invoice?: any;
  timestamp: Date;
}

export interface RealTimeUpdate {
  id: string;
  type: string;
  timestamp: Date;
  data: any;
  source: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  processed: boolean;
}

export interface AccountingMappingRule {
  id: string;
  name: string;
  description: string;
  source: { system: string; entity: string; eventType: string };
  sourceField: string;
  destination: { system: string; entity: string; accountType: string };
  destinationField: string;
  mappingType: 'DIRECT' | 'AGGREGATE' | 'SPLIT' | 'REALTIME' | 'CONDITIONAL';
  alwaysActive?: boolean;
  conditions?: { field: string; operator: string; value: any }[];
  transformation: (value: any, context?: any) => any;
  autoPost: boolean;
  enabled: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chat {
  sendMessage: (params: { message: string }) => Promise<any>;
  sendMessageStream: (params: { message: string }) => Promise<any>;
}

export interface QuantumTask {
  id: string;
  type: string;
  payload: any;
  priority: number;
  timestamp: number;
}

export interface AccountMapRule {
  id: string;
  sourceType: string;
  conditionField: string;
  conditionValue: string;
  debitAccount: string;
  creditAccount: string;
  name: string;
}

export interface AccountingEntry {
  journalId: string;
  transactionDate: number | Date;
  referenceId?: string;
  referenceType?: string;
  journalType?: 'REVENUE' | 'COGS' | 'EXPENSE' | 'ALLOCATION';
  description: string;
  status: 'DRAFT' | 'LINKED' | 'POSTED' | 'SYNCED' | 'ERROR';
  matchScore?: number;
  aiNote?: string;
  entries: AccountingLine[];
  syncedAt?: Date;
  retryCount?: number;
  errorMessage?: string;
  createdAt?: Date;
  reference?: Record<string, any>;
}

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

export interface RiskFactor {
  factor: string;
  weight: number;
  description: string;
}
