// @ts-nocheck
// STUB — RBACEngine
export const RBACEngine = {
  hasPermission: (_role: string, _module: string, _action: string): boolean => true,
  getPermissionMatrix: (_role: string): Record<string, string[]> => ({}),
  getRoles: (): string[] => [],
  registerUser: (_u: any): void => {},
  checkCompliance: (): any[] => [],
};
