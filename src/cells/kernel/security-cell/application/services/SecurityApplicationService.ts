// @ts-nocheck
import { InMemorySecurityRepository } from "../../infrastructure/repositories/InMemorySecurityRepository";
import { DetectThreatUseCase } from "../use-cases/DetectThreatUseCase";
import type { Threat } from "../../domain/entities/threat.entity";

const _repo = new InMemorySecurityRepository();

export const SecurityApplicationService = {
  detect:      (input: Omit<Threat,"id"|"detected"|"resolved">) => new DetectThreatUseCase(_repo).execute(input),
  resolve:     (id: string, by: string) => _repo.resolve(id, by),
  getActive:   () => _repo.findActive(),
  getCritical: () => _repo.findBySeverity("CRITICAL"),
  getAll:      () => _repo.findAll(),
};
