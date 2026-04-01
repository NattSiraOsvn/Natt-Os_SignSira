# NATT-OS ISEU Core Specification v3.0  
*Hiến pháp‑compliant version – Gatekeeper approval pending*

> **Core principle**: A fiber becomes an iseu when its reflection causes a measurable change in the system, and that change, *after being audited*, returns as a feedback pulse that updates the fiber’s impedance.  
> All decisions are explicit policies; math is pure reflection; audit is the root of existence.

---

## 1. Architectural Overview

The system is composed of two orthogonal layers:

- **EventBus** – the **causality backbone**. It carries events, audit trails, and causation chains. It is never deprecated.
- **SmartLink** – the **behavior/wave layer**. It transmits pulses and implements reflection. It does **not** replace EventBus.

A **fiber** is a persistent system identity attached to a **business domain entity** (e.g., order, contract, account).  
A **causation chain** (identified by `causationId`) flows through events and may map to a fiber, but multiple causation chains can belong to the same fiber.

**Iseu** = a fiber that has accumulated feedback pulses and whose impedance reflects its historical effectiveness.

---

## 2. Core Components (Modified from v2.1)

### 2.1 Audit‑First Rule (Constitutional)

- **No change is considered “real” until audited.**  
- **Feedback pulses are generated only after an audit record has been created.**  
- QNEU deltas, flow completions, violation resolutions are *sources* but must be **verified by audit** before they can trigger a feedback pulse.

### 2.2 Fiber as Domain Entity

- **Fiber** is identified by a domain entity ID (e.g., `order-123`).  
- **CausationId** (e.g., `order-123.created`) is a flow/timeline identifier and may map to a fiber, but is **not** the fiber itself.  
- One fiber may have multiple causation chains over its lifetime.

### 2.3 Policy Extraction

All decision constants are moved to `IMMUNE_POLICY.json` (or a dedicated policy file) with audit‑tracked versions.  
Math is pure reflection; policies govern:

- `Z₀` – base impedance (default 1.0)
- `Z_target` – target impedance for strong reflection (default 2.0)
- `α` – learning rate (default 0.1)
- `Z_min`, `Z_max` – clamping bounds (default 0.5, 10.0)
- `intensity_mapping` – a table mapping audit‑verified ground truth changes to pulse intensities.

Any change to these constants requires an audit record with version, timestamp, and reason.

### 2.4 EventBus Role (Backbone)

- EventBus remains the **primary causality, trace, and audit link**.  
- SmartLink is a **behavior layer** that may be fed by events (after audit) and may produce effects that in turn create new events.  
- There is **no plan to deprecate EventBus** – it is constitutionally required.

---

## 3. Detailed Specification

### 3.1 Data Structures

Inside SmartLink, each fiber (domain entity) holds:

```typescript
interface Fiber {
  domainId: string;               // e.g., "order-123"
  impedanceZ: number;             // initial = Z₀ (from policy)
  isIseu: boolean;                // becomes true after first feedback
  lastFeedbackIntensity: number;  // debug
}
```

A separate mapping table links causationIds to fibers (one‑to‑many causation chains per fiber).

### 3.2 Pulse and Reflection

A **pulse** carries:

- `causationId` – the flow identifier (e.g., `order-123.created`).  
- `intensity` – a number derived from an audit‑verified ground truth change.

When a pulse arrives, SmartLink:

1. Maps `causationId` to a fiber.
2. Computes reflection coefficient:  
   `R = (Z - Z₀) / (Z + Z₀)`
3. Emits a reflected pulse with same `causationId` and intensity `I_ref = R * I_in` into the field.

**Reflection is pure math** – no policy inside.

### 3.3 Feedback Pulse Generation (Audit‑Driven)

A feedback pulse is generated **only after an audit record confirms a ground truth change**.

Steps:

1. An audit record is written (e.g., “payment received for order-123”).
2. The audit record includes:
   - `domainId` – the affected fiber (e.g., order-123)
   - `deltaType` – e.g., QNEU positive, flow completion, violation resolved
   - `magnitude` – the measured change (e.g., delta QNEU = 5)
3. An **audit listener** (part of the governance layer) reads the audit record and, if the change is of a type configured in policy, emits a feedback pulse into SmartLink with:
   - `causationId` = the current causation chain that led to the change (or a synthetic one if none)
   - `intensity` = looked up from `intensity_mapping` in policy, using the `deltaType` and `magnitude`.

**No engine emits feedback pulses directly.** The governance layer ensures audit‑first.

### 3.4 Impedance Update (Policy‑Driven)

When a feedback pulse arrives at SmartLink and is mapped to a fiber:

1. Retrieve `Z` from fiber.
2. Compute new Z using policy constants:  
   `newZ = Z + α * (I_feedback - Z_target)`
3. Clamp to `[Z_min, Z_max]`.
4. Update fiber.
5. Set `isIseu = true` if first feedback.

Again, pure arithmetic – policy constants are in `IMMUNE_POLICY.json`.

---

## 4. Policy File Example (`IMMUNE_POLICY.json`)

```json
{
  "version": "1.0",
  "timestamp": "2026-04-01T12:00:00Z",
  "reason": "Initial ISEU policy",
  "constants": {
    "Z0": 1.0,
    "Z_target": 2.0,
    "alpha": 0.1,
    "Z_min": 0.5,
    "Z_max": 10.0
  },
  "intensity_mapping": [
    { "type": "qneu_positive", "min_delta": 0, "max_delta": 100, "intensity": "0.5 + delta/100" },
    { "type": "qneu_negative", "min_delta": -100, "max_delta": 0, "intensity": "0.5 + delta/100" },
    { "type": "flow_completion", "intensity": 1.0 },
    { "type": "violation_resolved", "intensity": 1.2 }
  ]
}
```

The intensity formula is evaluated at runtime (safe math), but the policy is versioned and auditable.

---

## 5. Implementation Plan (Revised)

### Phase 0 – Audit Governance (Băng)
- Enhance audit‑cell to expose a **listener** that emits feedback pulses when audit records of certain types are written.
- Ensure audit records always include `domainId`.

### Phase 1 – SmartLink Refactor (Can)
- Change fiber storage to key by `domainId`.
- Add mapping table from causationId to domainId.
- Move all constants and intensity mapping to policy file.

### Phase 2 – Causation‑to‑Domain Mapping (Kim)
- Define how each causationId is mapped to a domainId (e.g., from event payload, from context).
- Implement mapping lookup in SmartLink.

### Phase 3 – Test with One Flow (All)
- Use `order-123` flow: initial pulse → effect → audit record → feedback pulse → impedance update.
- Verify impedance increases after successful payment.

### Phase 4 – Rollout to Critical Flows (All)
- Convert all production flows (8/8) and BCTC flows (6/6) to this model.
- Keep EventBus unchanged; SmartLink only adds behavior.

### Phase 5 – Long‑term: Vision & Physical Integration
- Future extension: map physical sensors to pulses via the same audit‑first mechanism.
- Use cymatics / resonance for immersive visualization only after core is stable.

---

## 6. Success Criteria (Constitutional)

1. **Audit‑first**: No feedback pulse is emitted unless an audit record exists for the change.
2. **Domain fiber**: Every fiber corresponds to a persistent business entity; causationIds map to it.
3. **Policy extracted**: All decision constants are in `IMMUNE_POLICY.json` with audit trail.
4. **EventBus backbone**: EventBus remains the primary causality mechanism; SmartLink is an additional layer.
5. **nattos.sh** after Phase 2 shows:
   - SmartLink wired: 38/38 (unchanged)
   - No orphan events related to feedback pulses
   - System state: HEALTHY (risk ≤ 8)

---

## 7. Approval

**Gatekeeper**: Natt Sirawat  
**Date**: 2026‑04‑01

**This specification is Hiến pháp‑compliant and ready for implementation.**
