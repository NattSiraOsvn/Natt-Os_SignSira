// @ts-nocheck
import type { ISecurityRepository } from "../../ports/SecurityRepository";
import type { Threat } from "../../domain/entities/threat.entity";

const _store: Threat[] = [];

export class InMemorySecurityRepository implements ISecurityRepository {
  async saveThreat(t: Threat): Promise<Threat>                       { _store.push(t); return t; }
  async findById(id: string): Promise<Threat | null>                 { return _store.find(x => x.id === id) ?? null; }
  async findActive(): Promise<Threat[]>                              { return _store.filter(x => !x.resolved); }
  async findBySeverity(s: Threat["severity"]): Promise<Threat[]>    { return _store.filter(x => x.severity === s); }
  async resolve(id: string, by: string): Promise<void>              { const t=_store.find(x=>x.id===id); if(t){t.resolved=true;t.resolvedBy=by;t.resolvedAt=Date.now();} }
  async findAll(): Promise<Threat[]>                                  { return [..._store]; }
}

export const securityRepository = new InMemorySecurityRepository();
