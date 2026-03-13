// @ts-nocheck
import type { IAuditRepository } from "../../ports/AuditRepository";
import type { AuditRecord } from "../../domain/entities/audit-record.entity";
import { AuditWriterService } from "../../domain/services/audit-writer.service";

export class LogAuditUseCase {
  constructor(private repo: IAuditRepository) {}

  async execute(input: Omit<AuditRecord,"id"|"hash"|"prevHash"|"timestamp">): Promise<AuditRecord> {
    const record = AuditWriterService.write(input);
    return this.repo.save(record);
  }
}
