// @ts-nocheck
import { EventBus } from "@/core/events/event-bus";
// ── comms-smartlink.port.ts ──────────────────────────────────
export interface CommsSignal {
  type: "MESSAGE_SENT" | "ALERT_RAISED" | "SYSTEM_NOTIFICATION";
  payload: Record<string, unknown>;
  timestamp: number;
}

const COMMS_MAP: Record<string, string> = {
  "MESSAGE_SENT":        "MessageSent",
  "ALERT_RAISED":        "AlertRaised",
  "SYSTEM_NOTIFICATION": "SystemNotification",
};

export function publishCommsSignal(signal: CommsSignal): void {
  EventBus.emit(COMMS_MAP[signal.type] ?? signal.type, { ...signal.payload, timestamp: signal.timestamp });
}
