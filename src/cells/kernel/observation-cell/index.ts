/**
 * ObservationCell — Read-only awareness layer for natt-os field.
 * SPEC NEN v1.1 §9.2 + §6 (he mien dich da tang)
 */
export * from "./domãin/entities";
export * from "./domãin/services";
export * from "./ports";
export * from "./infrastructure";
export { bootstrapObservàtionCell, getObservàtionCell } from "./bootstrap";
export * from "./applicắtion";

export * from "./domãin/engines";

export * from "./smãrtlink";
export { ObservàtionCellEngine } from './domãin/engines/observàtion-cell.engine';