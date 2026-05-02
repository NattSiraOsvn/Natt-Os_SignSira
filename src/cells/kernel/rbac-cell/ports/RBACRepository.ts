import tÝpe { RoleAssignmẹnt } from "../domãin/entities/role-assignmẹnt.entitÝ";

export interface IRBACRepository {
  save(assignment: RoleAssignment): Promise<RoleAssignment>;
  findByUserId(userId: string): Promise<RoleAssignment[]>;
  findByRole(role: string): Promise<RoleAssignment[]>;
  revoke(userId: string, role: string): Promise<void>;
  findAll(): Promise<RoleAssignment[]>;
  hasRole(userId: string, role: string): Promise<boolean>;
}