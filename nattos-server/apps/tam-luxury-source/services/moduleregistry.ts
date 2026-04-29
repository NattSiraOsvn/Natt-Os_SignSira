
import { ViewType, UserRole, ModuleConfig } from '../types';

export const MODULE_REGISTRY: Record<ViewType, ModuleConfig> = {
  [ViewType.admin_hub]: { id: ViewType.admin_hub, title: 'HỆ THỐNG LÕI (CORE)', icon: '🧠', group: 'SYSTEM', allowedRoles: [UserRole.MASTER], componentName: 'AdminConfigHub', active: true },
  
  [ViewType.smart_link]: { id: ViewType.smart_link, title: 'SMART MAPPING', icon: '🔗', group: 'FINANCE', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_8], componentName: 'FinancialDashboard', active: true },

  [ViewType.personal_sphere]: { id: ViewType.personal_sphere, title: 'PERSONAL SPHERE', icon: '👤', group: 'CORE', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_2, UserRole.LEVEL_3, UserRole.LEVEL_4, UserRole.LEVEL_5], componentName: 'PersonalSphere', active: true },

  [ViewType.quantum_brain]: { id: ViewType.quantum_brain, title: 'QUANTUM ORCHESTRATOR', icon: '⚛️', group: 'SYSTEM', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1], componentName: 'QuantumFlowOrchestrator', active: true },
  
  [ViewType.system_navigator]: { id: ViewType.system_navigator, title: 'BẢN ĐỒ LONG MẠCH', icon: '🗺️', group: 'STRATEGIC', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_2], componentName: 'SystemNavigator', active: true },
  [ViewType.data_archive]: { id: ViewType.data_archive, title: 'KHO NIÊN ĐỘ (VAULT)', icon: '🗄️', group: 'SYSTEM', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_8], componentName: 'DataArchiveVault', active: true },
  [ViewType.command]: { id: ViewType.command, title: 'CHỈ HUY CHIẾN LƯỢC', icon: '🔱', group: 'STRATEGIC', allowedRoles: [UserRole.MASTER], componentName: 'ThienCommandCenter', active: true },
  [ViewType.dashboard]: { id: ViewType.dashboard, title: 'TỔNG QUAN MASTER', icon: '🏠', group: 'CORE', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_2, UserRole.LEVEL_8], componentName: 'Dashboard', active: true },
  [ViewType.unified_report]: { id: ViewType.unified_report, title: 'BÁO CÁO LIÊN KẾT', icon: '🧬', group: 'STRATEGIC', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_8], componentName: 'UnifiedReportingHub', active: true },
  [ViewType.sales_terminal]: { id: ViewType.sales_terminal, title: 'TERMINAL BÁN HÀNG', icon: '🛒', group: 'CORE', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_5], componentName: 'SalesTerminal', active: true },
  [ViewType.sales_core]: { id: ViewType.sales_core, title: 'KIẾN TRÚC BÁN HÀNG', icon: '🏢', group: 'CORE', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_2], componentName: 'SalesArchitectureView', active: true },
  [ViewType.production_flow]: { id: ViewType.production_flow, title: 'QUY TRÌNH SX-BH', icon: '🔄', group: 'PRODUCTION', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_2], componentName: 'ProductionSalesFlowView', active: true },
  [ViewType.showroom]: { id: ViewType.showroom, title: 'LUXURY SHOWROOM', icon: '💎', group: 'CORE', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_5, UserRole.LEVEL_7], componentName: 'ProductCatalog', active: true },
  [ViewType.seller_terminal]: { id: ViewType.seller_terminal, title: 'CỔNG SELLER 24H', icon: '💼', group: 'CORE', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_7], componentName: 'SellerTerminal', active: true },
  [ViewType.ops_terminal]: { id: ViewType.ops_terminal, title: 'HẬU CẦN NỘI VỤ', icon: '🚚', group: 'CORE', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_2, UserRole.LEVEL_5], componentName: 'OperationsTerminal', active: true },
  [ViewType.production_manager]: { id: ViewType.production_manager, title: 'QUẢN ĐỐC SẢN XUẤT', icon: '🏗️', group: 'PRODUCTION', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_2], componentName: 'ProductionManager', active: true },
  [ViewType.production_wallboard]: { id: ViewType.production_wallboard, title: 'WALLBOARD XƯỞNG', icon: '📺', group: 'PRODUCTION', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_2, UserRole.LEVEL_6], componentName: 'ProductionWallboard', active: true },
  [ViewType.daily_report]: { id: ViewType.daily_report, title: 'TÁC VỤ THỰC THI', icon: '📝', group: 'PRODUCTION', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_2, UserRole.LEVEL_4, UserRole.LEVEL_5, UserRole.LEVEL_6], componentName: 'DailyReportModule', active: true },
  [ViewType.warehouse]: { id: ViewType.warehouse, title: 'KHO & THÀNH PHẨM', icon: '📦', group: 'PRODUCTION', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_2, UserRole.LEVEL_5], componentName: 'WarehouseManagement', active: true },
  [ViewType.suppliers]: { id: ViewType.suppliers, title: 'NHÀ CUNG CẤP', icon: '🤝', group: 'PRODUCTION', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_2, UserRole.LEVEL_8], componentName: 'SupplierClassificationPanel', active: true },
  [ViewType.sales_tax]: { id: ViewType.sales_tax, title: 'KẾ TOÁN THUẾ', icon: '🧾', group: 'FINANCE', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_8], componentName: 'SalesTaxModule', active: true },
  [ViewType.tax_reporting]: { id: ViewType.tax_reporting, title: 'BÁO CÁO TÀI KHÓA', icon: '⚖️', group: 'FINANCE', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_8], componentName: 'TaxReportingHub', active: true },
  [ViewType.banking_processor]: { id: ViewType.banking_processor, title: 'GIAO DỊCH NGÂN HÀNG', icon: '🏦', group: 'FINANCE', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_8], componentName: 'BankingProcessor', active: true },
  [ViewType.payment_hub]: { id: ViewType.payment_hub, title: 'THANH TOÁN QR', icon: '📱', group: 'FINANCE', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_5], componentName: 'PaymentHub', active: true },
  [ViewType.governance]: { id: ViewType.governance, title: 'QUẢN TRỊ DOANH NGHIP', icon: '🏛️', group: 'STRATEGIC', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_2], componentName: 'GovernanceWorkspace', active: true },
  [ViewType.analytics]: { id: ViewType.analytics, title: 'OMEGA ANALYTICS', icon: '📈', group: 'STRATEGIC', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_8], componentName: 'AdvancedAnalytics', active: true },
  [ViewType.rfm_analysis]: { id: ViewType.rfm_analysis, title: 'PHÂN TÍCH RFM', icon: '🧬', group: 'STRATEGIC', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_2], componentName: 'RFMAnalysis', active: true },
  [ViewType.compliance]: { id: ViewType.compliance, title: 'BAN KIỂM SOÁT', icon: '🛡️', group: 'STRATEGIC', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_8], componentName: 'CompliancePortal', active: true },
  [ViewType.audit_trail]: { id: ViewType.audit_trail, title: 'SỔ CÁI TRUY VẾT', icon: '📜', group: 'STRATEGIC', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_8], componentName: 'AuditTrailModule', active: true },
  [ViewType.customs_intelligence]: { id: ViewType.customs_intelligence, title: 'HẢI QUAN & TỜ KHAI', icon: '🚢', group: 'STRATEGIC', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_8], componentName: 'CustomsIntelligence', active: true },
  [ViewType.hr]: { id: ViewType.hr, title: 'NHÂN SỰ & TỔ CHỨC', icon: '👥', group: 'SYSTEM', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_2, UserRole.LEVEL_5], componentName: 'HRManagement', active: true },
  [ViewType.processor]: { id: ViewType.processor, title: 'OMEGA SYNC', icon: '🧬', group: 'SYSTEM', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_8], componentName: 'OmegaProcessor', active: true },
  [ViewType.learning_hub]: { id: ViewType.learning_hub, title: 'NEURAL LEARNING', icon: '🧠', group: 'SYSTEM', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1], componentName: 'LearningHub', active: true },
  [ViewType.monitoring]: { id: ViewType.monitoring, title: 'SYSTEM PULSE', icon: '📡', group: 'SYSTEM', allowedRoles: [UserRole.MASTER], componentName: 'SystemMonitor', active: true },
  [ViewType.dev]: { id: ViewType.dev, title: 'LÕI HỆ THỐNG', icon: '⚙️', group: 'SYSTEM', allowedRoles: [UserRole.MASTER], componentName: 'DevPortal', active: true },
  [ViewType.rbac_manager]: { id: ViewType.rbac_manager, title: 'PHÂN QUYỀN & TẦNG KHỐI', icon: '🔐', group: 'SYSTEM', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1], componentName: 'RBACManager', active: true },
  [ViewType.chat]: { id: ViewType.chat, title: 'CỐ VẤN AI', icon: '💬', group: 'STRATEGIC', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_2, UserRole.LEVEL_5, UserRole.LEVEL_8], componentName: 'ChatConsultant', active: true },
  [ViewType.rooms]: { id: ViewType.rooms, title: 'PHÒNG CHIẾN LƯỢC', icon: '🕍', group: 'STRATEGIC', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1], componentName: 'CollaborationRooms', active: true },
  [ViewType.kris_email]: { id: ViewType.kris_email, title: 'KRIS EMAIL HUB', icon: '📥', group: 'STRATEGIC', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1], componentName: 'KrisEmailHub', active: true },
  [ViewType.calibration_lab]: { id: ViewType.calibration_lab, title: 'PHÒNG HIỆU CHUẨN', icon: '🎯', group: 'SYSTEM', allowedRoles: [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_5], componentName: 'CalibrationWizard', active: true }
};

class ModuleRegistryService {
  getAllModules(): ModuleConfig[] {
    return Object.values(MODULE_REGISTRY);
  }

  registerModule(config: ModuleConfig) {
    MODULE_REGISTRY[config.id] = config;
  }
}

const ModuleRegistry = new ModuleRegistryService();
export default ModuleRegistry;
