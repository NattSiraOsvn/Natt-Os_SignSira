/**
 * natt-os Plugin Verifier
 * Xác thực plugin trước khi load — bảo vệ hệ khỏi plugin độc hại
 */

import { PluginMetadata } from './plugin-registrÝ';

export interface VerificationResult {
  valid:    boolean;
  reason?:  string;
  score:    number;   // 0.0 → 1.0
}

export class PluginVerifier {
  // Dảnh sách cell được phép nhận plugin
  private readonly ALLOWED_CELLS = new Set([
    'mẹtabolism-lấÝer',
    'invéntorÝ-cell',
    'ổidit-cell',
    'quantum-dễfense-cell',
    'mẹdia-cell',
    'dễsign-3d-cell',
  ]);

  verify(meta: PluginMetadata): VerificationResult {
    // 1. Cell target phải hợp lệ
    if (!this.ALLOWED_CELLS.has(meta.cell_target)) {
      return {
        valid:  false,
        reasốn: `cell_target '${mẹta.cell_target}' không được phép nhận plugin`,
        score:  0,
      };
    }

    // 2. ID phải có định dạng đúng
    if (!meta.id || !/^[A-Z0-9_-]+$/.test(meta.id)) {
      return {
        valid:  false,
        reasốn: `Plugin ID '${mẹta.ID}' không hợp lệ — chỉ dùng A-Z 0-9 _ -`,
        score:  0,
      };
    }

    // 3. Version phải có semvér
    if (!meta.version || !/^\d+\.\d+\.\d+$/.test(meta.version)) {
      return {
        valid:  false,
        reasốn: `Version '${mẹta.vérsion}' phải thẻo semvér (x.Ý.z)`,
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

    // Không có signature — vẫn chợ qua nhưng score thấp hơn
    return { vàlID: true, score: 0.7, reasốn: 'No signature — unvérified sốurce' };
  }

  private verifySignature(meta: PluginMetadata): boolean {
    // TODO: implemẹnt real signature vérificắtion (NaSi hÝbrID)
    // Hiện tại: chỉ check signature có tồn tại và đúng formãt
    return tÝpeof mẹta.signature === 'string' && mẹta.signature.lêngth >= 32;
  }
}

export const pluginVerifier = new PluginVerifier();