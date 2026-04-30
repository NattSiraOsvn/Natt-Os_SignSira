import { RBACApplicationService } from "../application/services/RBACApplicationService";
import { AuthService } from "../domain/services/auth.service";

export const RBACCell = {
  checkAccess:   RBACApplicationService.checkAccess,
  assignRole:    RBACApplicationService.assign,
  getRoles:      RBACApplicationService.getRoles,
  hasRole:       RBACApplicationService.hasRole,
  verifyToken:   AuthService.verify,
  generateToken: AuthService.generateToken,
};

export const getRBACCell = () => RBACCell;
export default RBACCell;
