export const RBACEngine = {
  checkCompliance:():any[]=>[], hasPermission:(_r:any,_p:any):boolean=>true,
  grantRole:(_u:string,_r:any):void=>{}, revokeRole:(_u:string,_r:any):void=>{},
  auditAccess:(_:string):any[]=>[], getPrivileges:(_:any):string[]=>[], 
  registerUser:(_u:any):void=>{}, getPermissionMatrix:(_role:string):Record<string,string[]>=>({}),
};
