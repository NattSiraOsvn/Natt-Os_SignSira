export const RBACGuard = {
  check:(_r:any,_p:any):boolean=>true, hasModuleAccess:(_r:any,_m:any):boolean=>true,
  getPermissions:(_:any):string[]=>[], canApprove:(_r:any,amount:number):boolean=>amount<100_000_000,
};
