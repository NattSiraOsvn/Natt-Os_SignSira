// @ts-nocheck
import type { IRBACRepository } from "../../ports/RBACRepository";
import type { RoleAssignment } from "../../domain/entities/role-assignment.entity";

const _store: RoleAssignment[] = [];

export class InMemoryRBACRepository implements IRBACRepository {
  async save(a: RoleAssignment): Promise<RoleAssignment>        { _store.push(a); return a; }
  async findByUserId(id: string): Promise<RoleAssignment[]>     { return _store.filter(x => x.userId === id && x.active); }
  async findByRole(role: string): Promise<RoleAssignment[]>     { return _store.filter(x => x.role === role && x.active); }
  async revoke(userId: string, role: string): Promise<void>     { _store.filter(x => x.userId===userId && x.role===role).forEach(x=>x.active=false); }
  async findAll(): Promise<RoleAssignment[]>                     { return [..._store]; }
  async hasRole(userId: string, role: string): Promise<boolean> { return _store.some(x => x.userId===userId && x.role===role && x.active); }
}

export const rbacRepository = new InMemoryRBACRepository();
