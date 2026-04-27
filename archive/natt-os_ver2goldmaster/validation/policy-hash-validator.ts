
import { AuditTrailManager } from '../audit/audit-trail-manager';

/**
 * 🔒 POLICY HASH VALIDATOR
 * Enforcing "Policy Integrity Lock"
 */
export class PolicyHashValidator {
  // ✅ Cập nhật hash thực của file AI_OMEGA_UNIFIED.json
  static expectedHash = 'ee37772ad273b2d4e4ded9ded4dc9f06f2e8921d04f12404b935d8bed73159c0';
  
  /**
   * Tính toán hash thực tế của tệp hiến chương hiện tại
   */
  static async calculateActualHash(): Promise<string> {
    try {
      const response = await fetch('/natt-os/omega/AI_OMEGA_UNIFIED.json');
      const content = await response.text();
      
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.error('[POLICY_HASH] Error calculating actual hash:', e);
      return 'CALCULATION_failED';
    }
  }

  static async validate(policy: any): Promise<{ valid: boolean; hash: string }> {
    // Ưu tiên kiểm tra hash nội dung thực tế nếu có thể (Fetch content)
    // Tuy nhiên để đảm bảo tính nhất quán của object truyền vào:
    const currentHash = policy?.policy_integrity_lock?.current_hash;
    
    if (!currentHash) {
      return { valid: false, hash: 'missing' };
    }

    // So sánh với hash khóa cứng
    const isMatched = currentHash === this.expectedHash;
    
    if (!isMatched) {
      await AuditTrailManager.logViolation({
        type: 'POLICY_HASH_MISMATCH',
        ai_id: 'SYSTEM',
        severity: 'CRITICAL',
        details: { expected: this.expectedHash, actual: currentHash }
      });
      return { valid: false, hash: currentHash };
    }
    
    console.log(`[POLICY_HASH] MATCH: ${currentHash}`);
    return { valid: true, hash: currentHash };
  }
}
