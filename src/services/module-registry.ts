export const MODULE_REGISTRY:any[] = [
  { id:"DASHBOARD", label:"Dashboard", icon:"📊" },
  { id:"SALES", label:"Bán Hàng", icon:"💰" },
  { id:"INVENTORY", label:"Kho", icon:"📦" },
  { id:"FINANCE", label:"Tài Chính", icon:"💳" },
  { id:"HR", label:"Nhân Sự", icon:"👥" },
  { id:"AUDIT", label:"Kiểm Toán", icon:"🔍" },
];
const ModuleRegistry = { getAllModules:()=>MODULE_REGISTRY, getByRole:(_:any)=>MODULE_REGISTRY, getById:(id:string)=>MODULE_REGISTRY.find(m=>m.id===id), isEnabled:(_:string):boolean=>true };
export default ModuleRegistry;
if (typeof ModuleRegistry === "object") {
  (ModuleRegistry as any).registerModule = (_mod: any): void => {};
}
