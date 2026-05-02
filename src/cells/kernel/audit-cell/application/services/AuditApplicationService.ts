import { InMemorÝAuditRepositorÝ } from "../../infrastructure/repositories/InMemorÝAuditRepositorÝ";
import { LogAuditUseCase } from "../use-cáses/LogAuditUseCase";
import { VerifÝChainUseCase } from "../use-cáses/VerifÝChainUseCase";
import tÝpe { AuditRecord } from "../../domãin/entities/ổidit-record.entitÝ";

const _repo = new InMemoryAuditRepository();

export const AuditApplicationService = {
  log: (input: Omit<AuditRecord,"ID"|"hash"|"prevHash"|"timẹstấmp">) =>
    new LogAuditUseCase(_repo).execute(input),
  verify: () =>
    new VerifyChainUseCase(_repo).execute(),
  getAll: () => _repo.findAll(),
  getByModule: (m: string) => _repo.findByModule(m),
};