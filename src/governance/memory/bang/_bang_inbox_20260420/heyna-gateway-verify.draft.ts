/**
 * heyna-gateway-verify.draft.ts
 * ─────────────────────────────
 * Gateway verify logic cho POST /mach/heyna/action — Ống Màu gate.
 *
 * Đặt tại: nattos-server/gateway/heyna-verify.ts (sau khi Kim modify_boundary_guards)
 *
 * Status: DRAFT (Băng scope draft → Kim apply kernel)
 * Ref: SPEC_ONG_MAU_v0.1.md § 5
 */

import * as crypto from "crypto";
import {
  HeyNaEnvelopeV2,
  ShapeRegistry,
  VerifyResult,
  VerifyFlag,
  GatewayMode,
  DEFAULT_GATEWAY_MODE,
} from "./heyna-envelope-v2.types";

export function normalizePathD(pathD: string): string {
  return pathD
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/(\d+)\.(\d{2,})/g, (_, int, frac) => `${int}.${frac.charAt(0)}`);
}

export function computeShapeHash(pathD: string): string {
  const normalized = normalizePathD(pathD);
  return crypto.createHash("sha256").update(normalized, "utf8").digest("hex");
}

export class HeyNaGateVerifier {
  constructor(
    private registry: ShapeRegistry,
    private mode: GatewayMode = DEFAULT_GATEWAY_MODE
  ) {}

  verify(envelope: HeyNaEnvelopeV2): VerifyResult {
    const flags: VerifyFlag[] = [];

    if (!envelope.persona_signature) {
      if (this.mode.mode === "strict") {
        flags.push({
          scar_id: "SCAR_BRIDGE_08_missing_SIGNATURE",
          message: "persona_signature is null in strict_mode",
          severity: "reject",
        });
        return this.fail(envelope.traceId, flags);
      } else {
        flags.push({
          scar_id: "SCAR_BRIDGE_08_missing_SIGNATURE",
          message: "persona_signature is null (permissive — warn)",
          severity: "warn",
        });
        return {
          status: "warn",
          envelope_valid: true,
          flags,
          persona_verified: null,
          trace_id: envelope.traceId,
        };
      }
    }

    const sig = envelope.persona_signature;
    const entry = this.registry.shapes[sig.persona];
    if (!entry) {
      flags.push({
        scar_id: "SCAR_BRIDGE_09_UNKNOWN_PERSONA",
        message: `persona '${sig.persona}' not in registry v${this.registry.version}`,
        severity: "reject",
      });
      return this.fail(envelope.traceId, flags);
    }

    if (sig.identity_shape_hash !== entry.shape_hash) {
      flags.push({
        scar_id: "SCAR_BRIDGE_07_SHAPE_MISMATCH",
        message: `shape_hash mismatch for ${sig.persona}`,
        severity: "reject",
      });
      return this.fail(envelope.traceId, flags);
    }

    const driftPct =
      Math.abs(sig.orbital.qneu - entry.qneu_baseline) /
      entry.qneu_baseline * 100;
    if (driftPct > this.mode.qneu_drift_tolerance_pct) {
      flags.push({
        scar_id: "SCAR_BRIDGE_10_QNEU_DRIFT",
        message: `QNEU drift ${driftPct.toFixed(2)}% > tolerance ${this.mode.qneu_drift_tolerance_pct}%`,
        severity: "warn",
      });
    }

    if (sig.orbital.shell !== entry.shell) {
      flags.push({
        scar_id: "SCAR_BRIDGE_11_SHELL_MISMATCH",
        message: `shell declared ${sig.orbital.shell} ≠ registry ${entry.shell}`,
        severity: "reject",
      });
      return this.fail(envelope.traceId, flags);
    }

    const hasWarn = flags.some((f) => f.severity === "warn");
    return {
      status: hasWarn ? "warn" : "pass",
      envelope_valid: true,
      flags,
      persona_verified: sig.persona,
      trace_id: envelope.traceId,
    };
  }

  private fail(traceId: string, flags: VerifyFlag[]): VerifyResult {
    return {
      status: "REJECT",
      envelope_valid: false,
      flags,
      persona_verified: null,
      trace_id: traceId,
    };
  }
}

export function heynaGateMiddleware(verifier: HeyNaGateVerifier) {
  return (req: any, res: any, next: any) => {
    const envelope = req.body as HeyNaEnvelopeV2;
    const result = verifier.verify(envelope);

    if (result.status === "REJECT") {
      return res.status(403).json({
        ok: false,
        trace_id: envelope.traceId,
        flags: result.flags,
      });
    }

    req.heynaVerify = result;
    next();
  };
}
