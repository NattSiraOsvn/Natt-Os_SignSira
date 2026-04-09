import { EventBus } from "../../../../core/events/event-bus";
// ── noi-vu-smartlink.port.ts ─────────────────────────────────
export interface NoiVuSignal {
  type: "ASSET_REGISTERED" | "ASSET_MAINTENANCE" | "ASSET_DISPOSED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const NOI_VU_MAP: Record<string, string> = {
  "ASSET_REGISTERED":  "AssetRegistered",
  "ASSET_MAINTENANCE": "AssetMaintenance",
  "ASSET_DISPOSED":    "AssetDisposed",
};

export function publishNoiVuSignal(signal: NoiVuSignal): void {
  EventBus.emit(NOI_VU_MAP[signal.type] ?? signal.type, { ...signal.payload, timestamp: signal.timestamp });
}

// ────────────────────────────────────────────────────────────
