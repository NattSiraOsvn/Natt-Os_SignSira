import { InMemoryAuditRepository } from "../../infrastructure/repositories/inmemoryauditrepository";
import { LogAuditUseCase } from "../use-cases/logauditusecase";
import { VerifyChainUseCase } from "../use-cases/verifychainusecase";
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
