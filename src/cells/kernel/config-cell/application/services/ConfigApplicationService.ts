import { InMemoryConfigRepository } from "../../infrastructure/repositories/inmemoryconfigrepository";
import { SetConfigUseCase } from "../use-cases/setconfigusecase";
import { CreateSnapshotUseCase } from "../use-cases/createsnapshotusecase";
import { RollbackConfigUseCase } from "../use-cases/rollbackconfigusecase";

const _repo = new InMemoryConfigRepository();

export const ConfigApplicationService = {
  set:      (key: string, value: unknown, by?: string) => new SetConfigUseCase(_repo).execute(key, value, by),
  snapshot: ()                                          => new CreateSnapshotUseCase(_repo).execute(),
  rollback: (snap: Record<string, unknown>)             => new RollbackConfigUseCase(_repo).execute(snap),
  get:      (key: string)                               => _repo.get(key),
  list:     ()                                          => _repo.list(),
};
