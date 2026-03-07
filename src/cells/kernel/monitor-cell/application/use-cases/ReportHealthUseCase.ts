import type { IMonitorRepository } from "../../ports/MonitorRepository";
import { HealthAnalyzer } from "../../domain/services/HealthAnalyzer";

export class ReportHealthUseCase {
  constructor(private repo: IMonitorRepository) {}
  async execute() {
    const all = await this.repo.findAll();
    return { cells: all, summary: HealthAnalyzer.summarize(all), topIssues: HealthAnalyzer.topIssues(all), generatedAt: Date.now() };
  }
}
