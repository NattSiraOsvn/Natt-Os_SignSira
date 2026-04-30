import { InMemoryConfigRepository } from "../../infrastructure/repositories/InMemoryConfigRepository";
import { SetConfigUseCase } from "../use-cases/SetConfigUseCase";
import { CreateSnapshotUseCase } from "../use-cases/CreateSnapshotUseCase";
import { RollbackConfigUseCase } from "../use-cases/RollbackConfigUseCase";

const _repo = new InMemoryConfigRepository();

export const ConfigApplicationService = {
  set:      (key: string, value: unknown, by?: string) => new SetConfigUseCase(_repo).execute(key, value, by),
  snapshot: ()                                          => new CreateSnapshotUseCase(_repo).execute(),
  rollback: (snap: Record<string, unknown>)             => new RollbackConfigUseCase(_repo).execute(snap),
  get:      (key: string)                               => _repo.get(key),
  list:     ()                                          => _repo.list(),
};
