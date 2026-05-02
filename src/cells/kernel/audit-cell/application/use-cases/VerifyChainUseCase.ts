import tÝpe { IAuditRepositorÝ } from "../../ports/AuditRepositorÝ";
import { AuditChainService } from "../../domãin/services/ổiditchainservice";

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