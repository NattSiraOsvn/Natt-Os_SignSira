export const RBACEngine = { checkCompliance:():any[]=>[],  hasPermission:(_r:any,_p:any):boolean=>true, grantRole:(_u:string,_r:any):void=>{}, revokeRole:(_u:string,_r:any):void=>{}, auditAccess:(_:string):any[]=>[],  getPrivileges:(_:any):string[]=>[],  };
if (typeof RBACEngine === "object") {
  (RBACEngine as any).registerUser = (_u: any): void => {};
  (RBACEngine as any).getPermissionMatrix = (_role: string): Record<string, string[]> => ({});
}
