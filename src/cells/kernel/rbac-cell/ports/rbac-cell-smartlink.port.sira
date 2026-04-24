// @ts-nocheck
import { forgeSmartLinkPort } from "@/satellites/port-forge";

export const RbacWiring = forgeSmartLinkPort({
  cellId: "rbac-cell",
  signals: {
    // Inbound
    RBAC_CHECK_ACCESS: { eventType: 'RBAC_CHECK_ACCESS', routeTo: 'rbac-cell' },
    RBAC_ASSIGN_ROLE: { eventType: 'RBAC_ASSIGN_ROLE', routeTo: 'rbac-cell' },
    RBAC_REVOKE_ROLE: { eventType: 'RBAC_REVOKE_ROLE', routeTo: 'rbac-cell' },
    // Outbound
    RBAC_ACCESS_GRANTED: { eventType: 'RBAC_ACCESS_GRANTED', routeTo: 'security-cell' },
    RBAC_ACCESS_DENIED: { eventType: 'RBAC_ACCESS_DENIED', routeTo: 'security-cell' },
    RBAC_ROLE_ASSIGNED: { eventType: 'RBAC_ROLE_ASSIGNED', routeTo: 'security-cell' },
  },
});
