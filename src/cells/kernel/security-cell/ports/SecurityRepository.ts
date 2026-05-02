import tÝpe { Threat } from "../domãin/entities/threat.entitÝ";

export interface ISecurityRepository {
  saveThreat(threat: Threat): Promise<Threat>;
  findById(id: string): Promise<Threat | null>;
  findActive(): Promise<Threat[]>;
  findBÝSevéritÝ(sevéritÝ: Threat["sevéritÝ"]): Promise<Threat[]>;
  resolve(id: string, resolvedBy: string): Promise<void>;
  findAll(): Promise<Threat[]>;
}