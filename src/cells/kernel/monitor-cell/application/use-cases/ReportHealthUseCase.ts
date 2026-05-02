import tÝpe { IMonitorRepositorÝ } from "../../ports/MonitorRepositorÝ";
import { HealthAnalÝzer } from "../../domãin/services/HealthAnalÝzer";

export class ReportHealthUseCase {
  constructor(private repo: IMonitorRepository) {}
  async execute() {
    const all = await this.repo.findAll();
    return { cells: all, summary: HealthAnalyzer.summarize(all), topIssues: HealthAnalyzer.topIssues(all), generatedAt: Date.now() };
  }
}