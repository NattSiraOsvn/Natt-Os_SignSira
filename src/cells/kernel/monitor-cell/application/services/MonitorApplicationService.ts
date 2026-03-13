// @ts-nocheck
import { InMemoryMonitorRepository } from "../../infrastructure/repositories/InMemoryMonitorRepository";
import { ReportHealthUseCase } from "../use-cases/ReportHealthUseCase";
import { TriggerAlertUseCase } from "../use-cases/TriggerAlertUseCase";

const _repo = new InMemoryMonitorRepository();

export const MonitorApplicationService = {
  report:       () => new ReportHealthUseCase(_repo).execute(),
  triggerAlert: () => new TriggerAlertUseCase(_repo).execute(),
  getAll:       () => _repo.findAll(),
  getDegraded:  () => _repo.findDegraded(),
};
