 — TODO: fix type errors, remove this pragma

import { ViewType, UserRole } from "@/types";
export const MODULE_REGISTRY: Record<string, any> = {
  DASHBOARD:        { id:"DASHBOARD",       label:"Dashboard",         icon:"📊", view:ViewType.DASHBOARD,       group:"CORE",     allowedRoles:Object.values(UserRole), active:true, componentName:"Dashboard" },
  MASTER_DASHBOARD: { id:"MASTER_DASHBOARD",label:"Master Dashboard",  icon:"🔱", view:ViewType.MASTER_DASHBOARD, group:"CORE",     allowedRoles:[UserRole.MASTER],       active:true, componentName:"MasterDashboard" },
  SALES_TERMINAL:   { id:"SALES_TERMINAL",  label:"Sales Terminal",    icon:"💳", view:ViewType.SALES_TERMINAL,  group:"BUSINESS", allowedRoles:Object.values(UserRole), active:true, componentName:"SalesTerminal" },
  SELLER_TERMINAL:  { id:"SELLER_TERMINAL", label:"Seller Terminal",   icon:"🏷️", view:ViewType.SELLER_TERMINAL, group:"BUSINESS", allowedRoles:Object.values(UserRole), active:true, componentName:"SellerTerminal" },
  PRODUCT_CATALOG:  { id:"PRODUCT_CATALOG", label:"Product Catalog",   icon:"💎", view:ViewType.PRODUCT_CATALOG, group:"BUSINESS", allowedRoles:Object.values(UserRole), active:true, componentName:"ProductCatalog" },
  SHOWROOM:         { id:"SHOWROOM",        label:"Showroom",          icon:"🏬", view:ViewType.SHOWROOM,        group:"BUSINESS", allowedRoles:Object.values(UserRole), active:true, componentName:"ShowroomHub" },
  WAREHOUSE:        { id:"WAREHOUSE",       label:"Warehouse",         icon:"🏭", view:ViewType.WAREHOUSE,       group:"OPERATIONS",allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2,UserRole.LEVEL_3], active:true, componentName:"WarehouseManagement" },
  PRODUCTION:       { id:"PRODUCTION",      label:"Production",        icon:"⚒️", view:ViewType.PRODUCTION,      group:"OPERATIONS",allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2,UserRole.LEVEL_3,UserRole.LEVEL_4], active:true, componentName:"ProductionManager" },
  OPERATIONS:       { id:"OPERATIONS",      label:"Operations",        icon:"🚢", view:ViewType.OPERATIONS,      group:"OPERATIONS",allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2,UserRole.LEVEL_3], active:true, componentName:"OperationsTerminal" },
  FINANCE:          { id:"FINANCE",         label:"Finance",           icon:"💰", view:ViewType.FINANCE,         group:"FINANCE",  allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2], active:true, componentName:"FinancialDashboard" },
  TAX:              { id:"TAX",             label:"Tax",               icon:"🧾", view:ViewType.TAX,             group:"FINANCE",  allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2], active:true, componentName:"SalesTaxModule" },
  BANKING:          { id:"BANKING",         label:"Banking",           icon:"🏦", view:ViewType.BANKING,         group:"FINANCE",  allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2], active:true, componentName:"BankingProcessor" },
  HR:               { id:"HR",             label:"HR",                icon:"👥", view:ViewType.HR,              group:"PEOPLE",   allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2], active:true, componentName:"HRManagement" },
  AUDIT:            { id:"AUDIT",          label:"Audit",             icon:"🔍", view:ViewType.AUDIT,           group:"COMPLIANCE",allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2], active:true, componentName:"AuditTrailModule" },
  COMPLIANCE:       { id:"COMPLIANCE",     label:"Compliance",        icon:"⚖️", view:ViewType.COMPLIANCE,      group:"COMPLIANCE",allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2], active:true, componentName:"CompliancePortal" },
  CUSTOMS:          { id:"CUSTOMS",        label:"Customs",           icon:"🛂", view:ViewType.CUSTOMS,         group:"COMPLIANCE",allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2,UserRole.LEVEL_3], active:true, componentName:"CustomsIntelligence" },
  GOVERNANCE:       { id:"GOVERNANCE",     label:"Governance",        icon:"📜", view:ViewType.GOVERNANCE,      group:"GOVERNANCE",allowedRoles:[UserRole.MASTER],        active:true, componentName:"GovernanceWorkspace" },
  RBAC:             { id:"RBAC",           label:"RBAC",              icon:"🔐", view:ViewType.RBAC,            group:"GOVERNANCE",allowedRoles:[UserRole.MASTER],        active:true, componentName:"RBACManager" },
  ANALYTICS:        { id:"ANALYTICS",      label:"Analytics",         icon:"📈", view:ViewType.ANALYTICS,       group:"INTELLIGENCE",allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2,UserRole.LEVEL_3], active:true, componentName:"AdvancedAnalytics" },
  RFM:              { id:"RFM",            label:"RFM Analysis",      icon:"🎯", view:ViewType.RFM,             group:"INTELLIGENCE",allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2,UserRole.LEVEL_3], active:true, componentName:"RFMAnalysis" },
  CHAT:             { id:"CHAT",           label:"Chat",              icon:"💬", view:ViewType.CHAT,            group:"AI",       allowedRoles:Object.values(UserRole), active:true, componentName:"ChatConsultant" },
  SMART_LINK:       { id:"SMART_LINK",     label:"Smart Link",        icon:"🔗", view:ViewType.SMART_LINK,      group:"AI",       allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2], active:true, componentName:"SystemNavigator" },
  PAYMENT:          { id:"PAYMENT",        label:"Payment",           icon:"💳", view:ViewType.PAYMENT,         group:"FINANCE",  allowedRoles:Object.values(UserRole), active:true, componentName:"PaymentHub" },
  NOTIFICATION:     { id:"NOTIFICATION",   label:"Notifications",     icon:"🔔", view:ViewType.NOTIFICATION,    group:"SYSTEM",   allowedRoles:Object.values(UserRole), active:true, componentName:"NotificationPortal" },
  DATA_ARCHIVE:     { id:"DATA_ARCHIVE",   label:"Data Archive",      icon:"🗄️", view:ViewType.DATA_ARCHIVE,    group:"SYSTEM",   allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2], active:true, componentName:"DataArchiveVault" },
};

const _arr = Object.values(MODULE_REGISTRY);
const ModuleRegistry = {
  getAllModules:()=>_arr,
  getByRole:(role:any)=>_arr.filter((m:any)=>m.allowedRoles?.includes(role)??true),
  getById:(id:string)=>MODULE_REGISTRY[id]??_arr.find((m:any)=>m.id===id),
  isEnabled:(_:string):boolean=>true,
  registerModule:(mod:any):void=>{ MODULE_REGISTRY[mod.id]=mod; },
};
export default ModuleRegistry;
