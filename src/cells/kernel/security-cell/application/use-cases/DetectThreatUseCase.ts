// @ts-nocheck
import type { ISecurityRepository } from "../../ports/SecurityRepository";
import type { Threat } from "../../domain/entities/threat.entity";

export class DetectThreatUseCase {
  constructor(private repo: ISecurityRepository) {}
  async execute(input: Omit<Threat,"id"|"detected"|"resolved">): Promise<Threat> {
    const threat: Threat = { ...input, id: `THR-${Date.now()}`, detected: Date.now(), resolved: false };
    return this.repo.saveThreat(threat);
  }
}
