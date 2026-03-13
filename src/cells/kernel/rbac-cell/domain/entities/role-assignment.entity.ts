// @ts-nocheck
export interface RoleAssignment {
  id: string;
  userId: string;
  role: string;
  grantedBy: string;
  grantedAt: number;
  expiresAt?: number;
  active: boolean;
}
