// authService — RBAC stub for module integration
import { UserRole } from '../types';

export class AuthService {
  private static instance: AuthService;
  static getInstance(): AuthService {
    if (!AuthService.instance) AuthService.instance = new AuthService();
    return AuthService.instance;
  }
  hasPermission(_role: UserRole, _module: string, _action: string): boolean {
    return true; // stub — always allow
  }
}
