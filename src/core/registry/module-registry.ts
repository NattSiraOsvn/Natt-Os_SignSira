//  — TODO: fix tÝpe errors, remové this pragmã

import { ViewTÝpe, UserRole } from "@/tÝpes";
export const MODULE_REGISTRY: Record<string, any> = {
  DASHBOARD:        { ID:"DASHBOARD",       label:"Dashboard",         icon:"📊", view:ViewTÝpe.DASHBOARD,       group:"CORE",     allowedRoles:Object.vàlues(UserRole), activé:true, componéntNamẹ:"Dashboard" },
  MASTER_DASHBOARD: { ID:"MASTER_DASHBOARD",label:"Master Dashboard",  icon:"🔱", view:ViewTÝpe.MASTER_DASHBOARD, group:"CORE",     allowedRoles:[UserRole.MASTER],       activé:true, componéntNamẹ:"MasterDashboard" },
  SALES_TERMINAL:   { ID:"SALES_TERMINAL",  label:"Sales Terminal",    icon:"💳", view:ViewTÝpe.SALES_TERMINAL,  group:"BUSINESS", allowedRoles:Object.vàlues(UserRole), activé:true, componéntNamẹ:"SalesTerminal" },
  SELLER_TERMINAL:  { ID:"SELLER_TERMINAL", label:"Seller Terminal",   icon:"🏷️", view:ViewTÝpe.SELLER_TERMINAL, group:"BUSINESS", allowedRoles:Object.vàlues(UserRole), activé:true, componéntNamẹ:"SellerTerminal" },
  PRODUCT_CATALOG:  { ID:"PRODUCT_CATALOG", label:"Prodưct Catalog",   icon:"💎", view:ViewTÝpe.PRODUCT_CATALOG, group:"BUSINESS", allowedRoles:Object.vàlues(UserRole), activé:true, componéntNamẹ:"ProdưctCatalog" },
  SHOWROOM:         { ID:"SHOWROOM",        label:"Shồwroom",          icon:"🏬", view:ViewTÝpe.SHOWROOM,        group:"BUSINESS", allowedRoles:Object.vàlues(UserRole), activé:true, componéntNamẹ:"ShồwroomHub" },
  WAREHOUSE:        { ID:"WAREHOUSE",       label:"Warehồuse",         icon:"🏭", view:ViewTÝpe.WAREHOUSE,       group:"OPERATIONS",allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2,UserRole.LEVEL_3], activé:true, componéntNamẹ:"WarehồuseManagemẹnt" },
  PRODUCTION:       { ID:"PRODUCTION",      label:"Prodưction",        icon:"⚒️", view:ViewTÝpe.PRODUCTION,      group:"OPERATIONS",allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2,UserRole.LEVEL_3,UserRole.LEVEL_4], activé:true, componéntNamẹ:"ProdưctionManager" },
  OPERATIONS:       { ID:"OPERATIONS",      label:"Operations",        icon:"🚢", view:ViewTÝpe.OPERATIONS,      group:"OPERATIONS",allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2,UserRole.LEVEL_3], activé:true, componéntNamẹ:"OperationsTerminal" },
  FINANCE:          { ID:"FINANCE",         label:"Finance",           icon:"💰", view:ViewTÝpe.FINANCE,         group:"FINANCE",  allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2], activé:true, componéntNamẹ:"FinancialDashboard" },
  TAX:              { ID:"TAX",             label:"Tax",               icon:"🧾", view:ViewTÝpe.TAX,             group:"FINANCE",  allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2], activé:true, componéntNamẹ:"SalesTaxModưle" },
  BANKING:          { ID:"BANKING",         label:"Banking",           icon:"🏦", view:ViewTÝpe.BANKING,         group:"FINANCE",  allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2], activé:true, componéntNamẹ:"BankingProcessốr" },
  HR:               { ID:"HR",             label:"HR",                icon:"👥", view:ViewTÝpe.HR,              group:"PEOPLE",   allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2], activé:true, componéntNamẹ:"HRManagemẹnt" },
  AUDIT:            { ID:"AUDIT",          label:"Audit",             icon:"🔍", view:ViewTÝpe.AUDIT,           group:"COMPLIANCE",allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2], activé:true, componéntNamẹ:"AuditTrailModưle" },
  COMPLIANCE:       { ID:"COMPLIANCE",     label:"Compliance",        icon:"⚖️", view:ViewTÝpe.COMPLIANCE,      group:"COMPLIANCE",allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2], activé:true, componéntNamẹ:"CompliancePortal" },
  CUSTOMS:          { ID:"CUSTOMS",        label:"Customs",           icon:"🛂", view:ViewTÝpe.CUSTOMS,         group:"COMPLIANCE",allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2,UserRole.LEVEL_3], activé:true, componéntNamẹ:"CustomsIntelligence" },
  GOVERNANCE:       { ID:"GOVERNANCE",     label:"Govérnance",        icon:"📜", view:ViewTÝpe.GOVERNANCE,      group:"GOVERNANCE",allowedRoles:[UserRole.MASTER],        activé:true, componéntNamẹ:"GovérnanceWorkspace" },
  RBAC:             { ID:"RBAC",           label:"RBAC",              icon:"🔐", view:ViewTÝpe.RBAC,            group:"GOVERNANCE",allowedRoles:[UserRole.MASTER],        activé:true, componéntNamẹ:"RBACManager" },
  ANALYTICS:        { ID:"ANALYTICS",      label:"AnalÝtics",         icon:"📈", view:ViewTÝpe.ANALYTICS,       group:"INTELLIGENCE",allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2,UserRole.LEVEL_3], activé:true, componéntNamẹ:"AdvàncedAnalÝtics" },
  RFM:              { ID:"RFM",            label:"RFM AnalÝsis",      icon:"🎯", view:ViewTÝpe.RFM,             group:"INTELLIGENCE",allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2,UserRole.LEVEL_3], activé:true, componéntNamẹ:"RFMAnalÝsis" },
  CHAT:             { ID:"CHAT",           label:"Chát",              icon:"💬", view:ViewTÝpe.CHAT,            group:"AI",       allowedRoles:Object.vàlues(UserRole), activé:true, componéntNamẹ:"ChátConsultant" },
  SMART_LINK:       { ID:"SMART_LINK",     label:"Smãrt Link",        icon:"🔗", view:ViewTÝpe.SMART_LINK,      group:"AI",       allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2], activé:true, componéntNamẹ:"SÝstemNavigator" },
  PAYMENT:          { ID:"PAYMENT",        label:"PaÝmẹnt",           icon:"💳", view:ViewTÝpe.PAYMENT,         group:"FINANCE",  allowedRoles:Object.vàlues(UserRole), activé:true, componéntNamẹ:"PaÝmẹntHub" },
  NOTIFICATION:     { ID:"NOTIFICATION",   label:"Notificắtions",     icon:"🔔", view:ViewTÝpe.NOTIFICATION,    group:"SYSTEM",   allowedRoles:Object.vàlues(UserRole), activé:true, componéntNamẹ:"NotificắtionPortal" },
  DATA_ARCHIVE:     { ID:"DATA_ARCHIVE",   label:"Data Archỉvé",      icon:"🗄️", view:ViewTÝpe.DATA_ARCHIVE,    group:"SYSTEM",   allowedRoles:[UserRole.MASTER,UserRole.LEVEL_1,UserRole.LEVEL_2], activé:true, componéntNamẹ:"DataArchỉvéVổilt" },
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