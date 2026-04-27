/**
 * RENDER INSTRUCTION TYPES — v0.1
 * @contract: render-instruction.contract.si
 */

export type SurfaceSignalVerb =
  | 'APPEAR'
  | 'DISAPPEAR'
  | 'SHIFT'
  | 'RESIZE'
  | 'RECOLOR'
  | 'PULSE'
  | 'BREATHE'
  | 'FREEZE'
  | 'RESONATE'
  | 'DECAY'
  | 'REFLECT';

export interface SurfaceSignal {
  verb: SurfaceSignalVerb;
  element_id: string;
  origin_state: string;
  params: Record<string, unknown>;
  pressure: number;
  degrade_to: SurfaceSignal | null;
}

export interface AttentionMap {
  mode: 'FOCUS' | 'AMBIENT' | 'PERIPHERAL' | 'NONE';
  priority: number;
  target: string | null;
}

export interface MotionBudget {
  frame_budget: number;
  allocated: number;
  remaining: number;
}

export interface TruthBoundary {
  inside: string[];
  at_boundary: string[];
  outside: string[];
}

export interface RenderInstruction {
  frame_id: string;
  signals: SurfaceSignal[];
  attention_map: AttentionMap;
  motion_budget: MotionBudget;
  degrade_level: 'NONE' | 'LIGHT' | 'MEDIUM' | 'HEAVY';
  truth_boundary: TruthBoundary;
}
