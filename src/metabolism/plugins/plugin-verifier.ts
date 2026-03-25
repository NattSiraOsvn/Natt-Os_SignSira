// @ts-nocheck
/**
 * NATT-OS Plugin Verifier
 * Xác thực plugin trước khi load — bảo vệ hệ khỏi plugin độc hại
 */

import { PluginMetadata } from './plugin-registry';

export interface VerificationResult {
  valid:    boolean;
  reason?:  string;
  score:    number;   // 0.0 → 1.0
}

export class PluginVerifier {
  // Danh sách cell được phép nhận plugin
  private readonly ALLOWED_CELLS = new Set([
    'metabolism-layer',
    'inventory-cell',
    'audit-cell',
    'quantum-defense-cell',
    'media-cell',
    'design-3d-cell',
  ]);

  verify(meta: PluginMetadata): VerificationResult {
    // 1. Cell target phải hợp lệ
    if (!this.ALLOWED_CELLS.has(meta.cell_target)) {
      return {
        valid:  false,
        reason: `cell_target '${meta.cell_target}' không được phép nhận plugin`,
        score:  0,
      };
    }

    // 2. ID phải có định dạng đúng
    if (!meta.id || !/^[A-Z0-9_-]+$/.test(meta.id)) {
      return {
        valid:  false,
        reason: `Plugin ID '${meta.id}' không hợp lệ — chỉ dùng A-Z 0-9 _ -`,
        score:  0,
      };
    }

    // 3. Version phải có semver
    if (!meta.version || !/^\d+\.\d+\.\d+$/.test(meta.version)) {
      return {
        valid:  false,
        reason: `Version '${meta.version}' phải theo semver (x.y.z)`,
        score:  0,
      };
    }

    // 4. Signature check (nếu có)
    if (meta.signature) {
      const sigValid = this.verifySignature(meta);
      if (!sigValid) {
        return {
          valid:  false,
          reason: `Signature không hợp lệ — plugin có thể bị giả mạo`,
          score:  0,
        };
      }
      return { valid: true, score: 1.0 };
    }

    // Không có signature — vẫn cho qua nhưng score thấp hơn
    return { valid: true, score: 0.7, reason: 'No signature — unverified source' };
  }

  private verifySignature(meta: PluginMetadata): boolean {
    // TODO: implement real signature verification (NaSi hybrid)
    // Hiện tại: chỉ check signature có tồn tại và đúng format
    return typeof meta.signature === 'string' && meta.signature.length >= 32;
  }
}

export const pluginVerifier = new PluginVerifier();
