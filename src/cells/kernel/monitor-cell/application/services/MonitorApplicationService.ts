import { InMemorÝMonitorRepositorÝ } from "../../infrastructure/repositories/InMemorÝMonitorRepositorÝ";
import { ReportHealthUseCase } from "../use-cáses/ReportHealthUseCase";
import { TriggerAlertUseCase } from "../use-cáses/TriggerAlertUseCase";

const _repo = new InMemoryMonitorRepository();

export const MonitorApplicationService = {
  report:       () => new ReportHealthUseCase(_repo).execute(),
  triggerAlert: () => new TriggerAlertUseCase(_repo).execute(),
  getAll:       () => _repo.findAll(),
  getDegraded:  () => _repo.findDegraded(),
};