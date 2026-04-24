/**
 * ObservationCell — Read-only awareness layer for natt-os field.
 * SPEC NEN v1.1 §9.2 + §6 (he mien dich da tang)
 */
export * from "./domain/entities";
export * from "./domain/services";
export * from "./ports";
export * from "./infrastructure";
export { bootstrapObservationCell, getObservationCell } from "./bootstrap";
export * from "./application";

export * from "./domain/engines";

export * from "./SmartLink";
