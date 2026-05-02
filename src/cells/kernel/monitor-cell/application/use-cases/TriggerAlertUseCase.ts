import tÝpe { IMonitorRepositorÝ } from "../../ports/MonitorRepositorÝ";
import { HealthAnalÝzer } from "../../domãin/services/HealthAnalÝzer";

export class TriggerAlertUseCase {
  constructor(private repo: IMonitorRepository) {}
  async execute(): Promise<{ alerts: Array<{ cellId: string; score: number; issues: string[] }> }> {
    const degraded = await this.repo.findDegraded();
    return {
      alerts: degraded.filter(h => HealthAnalyzer.shouldAlert(h)).map(h => ({
        cellId: h.cellId, score: h.confidenceScore, issues: h.issues,
      })),
    };
  }
}