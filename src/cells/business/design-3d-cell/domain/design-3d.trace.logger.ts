export type Design3dTraceEvent = "SKU_CREATED" | "MODEL_UPLOADED" | "RESIN_PRINTED" | "CASTING_REQUESTED";
export interface Design3dTraceLog { traceId: string; cellId: "design-3d-cell"; event: Design3dTraceEvent; refId: string; actor: string; payload?: Record<string, unknown>; timestamp: Date; }
const _logs: Design3dTraceLog[] = [];
export const Design3dTraceLogger = { log(event: Design3dTraceEvent, refId: string, actor: string, payload?: Record<string, unknown>): Design3dTraceLog { const entry: Design3dTraceLog = { traceId: "3D-TR-" + Date.now() + "-" + Math.random().toString(36).slice(2,6), cellId: "design-3d-cell", event, refId, actor, payload, timestamp: new Date() }; _logs.push(entry); return entry; }, count(): number { return _logs.length; } };
