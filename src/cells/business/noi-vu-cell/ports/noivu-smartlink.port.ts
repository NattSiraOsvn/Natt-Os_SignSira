// @ts-nocheck
import { forgeSmartLinkPort } from "@/satellites/port-forge";

export const NoiVuSmartLinkPort = forgeSmartLinkPort({
  cellId: "noi-vu-cell",
  signals: {
    TASK_ASSIGNED:        { eventType: "TaskAssigned", routeTo: "hr-cell" },
    VEHICLE_DISPATCHED:   { eventType: "VehicleDispatched", routeTo: "logistics-cell" },
    FACILITY_ISSUE:       { eventType: "FacilityIssue", routeTo: "monitor-cell" },
  }
});
