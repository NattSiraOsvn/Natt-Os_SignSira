import { InMemoryMonitorRepository } from "../../infrastructure/repositories/inmemorymonitorrepository";
import { ReportHealthUseCase } from "../use-cases/reporthealthusecase";
import { TriggerAlertUseCase } from "../use-cases/triggeralertusecase";

const _repo = new InMemoryMonitorRepository();

export const MonitorApplicationService = {
  report:       () => new ReportHealthUseCase(_repo).execute(),
  triggerAlert: () => new TriggerAlertUseCase(_repo).execute(),
  getAll:       () => _repo.findAll(),
  getDegraded:  () => _repo.findDegraded(),
};
