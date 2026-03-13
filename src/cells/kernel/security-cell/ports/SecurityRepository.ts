// @ts-nocheck
import type { Threat } from "../domain/entities/threat.entity";

export interface ISecurityRepository {
  saveThreat(threat: Threat): Promise<Threat>;
  findById(id: string): Promise<Threat | null>;
  findActive(): Promise<Threat[]>;
  findBySeverity(severity: Threat["severity"]): Promise<Threat[]>;
  resolve(id: string, resolvedBy: string): Promise<void>;
  findAll(): Promise<Threat[]>;
}
