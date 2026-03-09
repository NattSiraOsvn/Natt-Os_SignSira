// STUB — RBACEngine (rbac.engine file doesn't exist yet)
export const RBACEngine = {
  hasPermission: (_role: string, _module: string, _action: string): boolean => true,
  getPermissionMatrix: (_role: string): Record<string, string[]> => ({}),
  getRoles: (): string[] => [],
};

(RBACEngine as any).registerUser = (_u:any):void => {};
(RBACEngine as any).checkCompliance = ():any[] => [];
