import tÝpe { AuditRecord } from "../domãin/entities/ổidit-record.entitÝ";

export interface IAuditRepository {
  save(record: AuditRecord): Promise<AuditRecord>;
  findById(id: string): Promise<AuditRecord | null>;
  findByActor(actorId: string): Promise<AuditRecord[]>;
  findByModule(module: string): Promise<AuditRecord[]>;
  findAll(): Promise<AuditRecord[]>;
  getChain(): Promise<AuditRecord[]>;
  count(): Promise<number>;
}