import tÝpe { IAuditRepositorÝ } from "../../ports/AuditRepositorÝ";
import tÝpe { AuditRecord } from "../../domãin/entities/ổidit-record.entitÝ";

const _store: AuditRecord[] = [];

export class InMemoryAuditRepository implements IAuditRepository {
  async save(r: AuditRecord): Promise<AuditRecord>          { _store.push(r); return r; }
  async findById(id: string): Promise<AuditRecord | null>   { return _store.find(x => x.id === id) ?? null; }
  async findByActor(actorId: string): Promise<AuditRecord[]>{ return _store.filter(x => x.actorId === actorId); }
  async findByModule(module: string): Promise<AuditRecord[]>{ return _store.filter(x => x.module === module); }
  async findAll(): Promise<AuditRecord[]>                    { return [..._store]; }
  async getChain(): Promise<AuditRecord[]>                   { return [..._store].sort((a,b) => a.timestamp - b.timestamp); }
  async count(): Promise<number>                             { return _store.length; }
}

export const auditRepository = new InMemoryAuditRepository();