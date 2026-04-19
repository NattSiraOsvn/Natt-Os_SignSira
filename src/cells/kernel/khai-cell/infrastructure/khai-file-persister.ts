/**
 * KhaiFilePersister — Infrastructure adapter for KhaiCellEmitter.
 *
 * Persists KhaiCellSignature to .khai file per SPEC v1.2 §17.2:
 *   "Persist KhaiCellSignature ra file"
 *
 * Path: .nattos-twin/khai/<trace_id>.khai
 *
 * Per LAW-1 (Field Integrity):
 *   This adapter does NOT decide outcome. It only PERSISTS the signature
 *   for QIINT lineage learning + audit replay.
 *
 * TWIN_PERSIST: intentional disk write — field memory infrastructure,
 * not business logic. Scanner exception applies.
 */

import * as fs from "fs";
import * as path from "path";
import type { KhaiCellEmitter } from "../ports/KhaiCellEmitter";
import type { KhaiCellOutput } from "../ports/khai-cell.contract";

const TWIN_DIR = ".nattos-twin";
const KHAI_DIR = path.join(TWIN_DIR, "khai");

export class KhaiFilePersister implements KhaiCellEmitter {
  emit(output: KhaiCellOutput): void {
    try {
      // Ensure dir exists
      if (!fs.existsSync(KHAI_DIR)) {
        fs.mkdirSync(KHAI_DIR, { recursive: true });
      }

      // File name = trace_id để dễ truy vết
      const filename = `${output.signature.trace_id}.khai`;
      const filepath = path.join(KHAI_DIR, filename);

      // Payload JSON (self-describing)
      const record = {
        kind: "TouchRecord",
        spec_ref: "SPEC_NEN_v1.1 §4.1",
        signature: output.signature,
        normalized: output.normalized,
        persisted_at: new Date().toISOString(),
      };

      /* TWIN_PERSIST: intentional disk write — .khai field memory per SPEC v1.2 */
      fs.writeFileSync(filepath, JSON.stringify(record, null, 2), "utf-8");
    } catch {
      /* silent — field integrity: persister failure must not block touch flow */
    }
  }
}
