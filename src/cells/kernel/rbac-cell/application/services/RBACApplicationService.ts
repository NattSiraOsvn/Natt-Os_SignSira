import { InMemoryRBACRepository } from "../../infrastructure/repositories/inmemoryrbacrepository";
import { AssignRoleUseCase } from "../use-cases/assignroleusecase";
import { CheckAccessUseCase } from "../use-cases/checkaccessusecase";

const _repo = new InMemoryRBACRepository();

export const RBACApplicationService = {
  assign:     (assignerId: string, assignerRole: string, userId: string, role: string) =>
    new AssignRoleUseCase(_repo).execute(assignerId, assignerRole, userId, role),
  checkAccess: (userId: string, requiredRole: string) =>
    new CheckAccessUseCase(_repo).execute(userId, requiredRole),
  getRoles:    (userId: string) => _repo.findByUserId(userId),
  hasRole:     (userId: string, role: string) => _repo.hasRole(userId, role),
};
