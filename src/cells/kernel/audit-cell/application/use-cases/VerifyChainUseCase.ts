import type { IAuditRepository } from "../../ports/AuditRepository";
import { AuditChainService } from "../../domain/services/auditchainservice";

export class VerifyChainUseCase {
  constructor(private repo: IAuditRepository) {}

  async execute(): Promise<{ valid: boolean; length: number; latestHash: string | null }> {
    const chain = await this.repo.getChain();
    return {
      valid: AuditChainService.verify(chain),
      length: chain.length,
      latestHash: AuditChainService.getLatest(chain)?.hash ?? null,
    };
  }
}
