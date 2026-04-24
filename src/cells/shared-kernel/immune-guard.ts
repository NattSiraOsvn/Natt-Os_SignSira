// @ts-nocheck

/**
 * Natt-OS IMMUNE GUARD v2 — Touch point for boundary signals.
 * AUTHORIZED BY: ANH NAT (SUPREME SOVEREIGN)
 *
 * Per SPEC NEN v1.1 section 4.1 + LAW-1 + LAW-4:
 *   Immune guard is a TOUCH POINT (rao), not a gate.
 *   Every envelope crosses freely, gets marked with signature.
 *   Field resonance + .anc match decide outcome.
 *
 * No more `return true / return false`. No more `throw Error`.
 * Outcome flows through chromatic state, observed by Quantum Defense.
 */
import { SmartLinkEnvelope } from './shared.types';

/**
 * touchBoundary — receive envelope, mark signature, emit to field.
 * Does NOT validate, does NOT reject, does NOT decide.
 *
 * Field reads chromatic state to detect:
 *   - identity drift (envelope.owner != ANH_NAT) -> chromatic CRITICAL
 *   - trace orphan (no trace_id) -> chromatic RISK
 *   - version mismatch -> chromatic WARNING
 * Quantum Defense reacts to color, not to boolean.
 */
export const touchBoundary = (envelope: SmartLinkEnvelope) => {
  const signature = {
    origin: envelope.owner || "UNKNOWN",
    trace_id: envelope.trace_id || ("ORPHAN-" + Date.now().toString(36)),
    entropy_seed: Math.random().toString(36).slice(2, 12),
    touched_at: new Date().toISOString(),
    envelope_id: envelope.envelope_id,
    envelope_version: envelope.envelope_version,
  };

  // Chromatic signal — let Observation + Quantum Defense decide reaction
  let chromatic_state = "nominal";
  if (envelope.owner !== "ANH_NAT") chromatic_state = "critical";
  else if (!envelope.trace_id) chromatic_state = "risk";
  else if (envelope.envelope_version !== "1.1") chromatic_state = "warning";

  console.log("[IMMUNE_TOUCH]", {
    envelope_id: envelope.envelope_id,
    chromatic_state,
    signature,
  });

  return {
    normalized: envelope,
    signature,
    chromatic_state,
  };
};

// Backwards compat alias — old code calling validateBoundary still works,
// but receives touch result instead of boolean.
export const validateBoundary = touchBoundary;
