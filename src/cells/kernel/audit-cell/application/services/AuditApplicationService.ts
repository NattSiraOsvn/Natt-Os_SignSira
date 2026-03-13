// @ts-nocheck
import { InMemoryAuditRepository } from "../../infrastructure/repositories/InMemoryAuditRepository";
import { LogAuditUseCase } from "../use-cases/LogAuditUseCase";
import { VerifyChainUseCase } from "../use-cases/VerifyChainUseCase";
import type { AuditRecord } from "../../domain/entities/audit-record.entity";

const _repo = new InMemoryAuditRepository();

export const AuditApplicationService = {
  log: (input: Omit<AuditRecord,"id"|"hash"|"prevHash"|"timestamp">) =>
    new LogAuditUseCase(_repo).execute(input),
  verify: () =>
    new VerifyChainUseCase(_repo).execute(),
  getAll: () => _repo.findAll(),
  getByModule: (m: string) => _repo.findByModule(m),
};
