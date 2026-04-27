/**
 * SignalStreamReader — Port for reading signal stream from field.
 *
 * Implementation provided by infrastructure layer.
 * Observation does NOT subscribe by name to specific event types —
 * it reads the whole stream and computes aggregate state.
 */

export interface SignalEvent {
  signature: {
    origin: string;
    trace_id: string;
    entropy_seed: string;
    touched_at: string;
  };
  payload: unknown;
}

export interface SignalStreamReader {
  /**
   * Subscribe to signal stream. Callback receives every signed signal.
   * Returns unsubscribe function.
   */
  onSignal(callback: (event: SignalEvent) => void): () => void;
}
