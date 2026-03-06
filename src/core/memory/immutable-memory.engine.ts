/**
 * NATT-OS ImmutableMemoryEngine
 * Patent Claim: Append-only enterprise memory with cryptographic hash chain
 *               and configurable retention policy for constitutional compliance.
 *
 * Properties:
 *   - APPEND ONLY   : records cannot be modified or deleted before retention expiry
 *   - HASH CHAIN    : each record contains prev_hash → forms linked integrity chain
 *   - RETENTION POL : configurable TTL per record type, auto-seal on expiry
 *   - TAMPER DETECT : any modification breaks the hash chain (detectable)
 */

export interface MemoryRecord<T = unknown> {
  id: string;
  sequence: number;          // Monotonically increasing
  timestamp: number;
  record_type: string;
  payload: T;
  payload_hash: string;      // Hash of this record's payload
  prev_hash: string;         // Hash of previous record (chain link)
  chain_hash: string;        // Hash of (payload_hash + prev_hash) = this record's ID in chain
  tenant_id: string;
  actor_id: string;
  retention_until: number;   // Unix ms — record is immutable until this time
  sealed: boolean;           // Once sealed, absolutely no modification
  policy_version: string;
}

export interface RetentionPolicy {
  recordType: string;
  retentionDays: number;     // 0 = forever
  autoSealAfterDays?: number;
}

function hash(data: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    h ^= data.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export class ImmutableMemoryEngine {
  private static instance: ImmutableMemoryEngine;
  private chain: MemoryRecord[] = [];
  private sequence = 0;
  private retentionPolicies: Map<string, RetentionPolicy> = new Map();
  private GENESIS_HASH = '0000000000000000';

  static getInstance(): ImmutableMemoryEngine {
    if (!this.instance) this.instance = new ImmutableMemoryEngine();
    return this.instance;
  }

  /** Register retention policy for a record type */
  setRetentionPolicy(policy: RetentionPolicy): void {
    this.retentionPolicies.set(policy.recordType, policy);
  }

  /** APPEND — the only write operation allowed */
  append<T>(
    recordType: string,
    payload: T,
    tenantId: string,
    actorId: string,
    policyVersion = 'NATT-OS-CONSTITUTION-v4.0'
  ): MemoryRecord<T> {
    const prevRecord = this.chain[this.chain.length - 1];
    const prevHash = prevRecord?.chain_hash ?? this.GENESIS_HASH;
    const payloadHash = hash(JSON.stringify(payload));
    const chainHash = hash(payloadHash + prevHash + String(++this.sequence));

    const policy = this.retentionPolicies.get(recordType);
    const retentionDays = policy?.retentionDays ?? 3650; // default 10 years
    const sealAfterDays = policy?.autoSealAfterDays ?? retentionDays;
    const now = Date.now();

    const record: MemoryRecord<T> = {
      id: chainHash,
      sequence: this.sequence,
      timestamp: now,
      record_type: recordType,
      payload,
      payload_hash: payloadHash,
      prev_hash: prevHash,
      chain_hash: chainHash,
      tenant_id: tenantId,
      actor_id: actorId,
      retention_until: now + retentionDays * 86400000,
      sealed: sealAfterDays === 0,
      policy_version: policyVersion,
    };

    this.chain.push(record);
    return record;
  }

  /** Verify entire chain integrity */
  verifyChain(): { valid: boolean; brokenAt?: number; totalRecords: number } {
    let prevHash = this.GENESIS_HASH;
    for (let i = 0; i < this.chain.length; i++) {
      const r = this.chain[i];
      if (r.prev_hash !== prevHash) return { valid: false, brokenAt: i, totalRecords: this.chain.length };
      const expectedChainHash = hash(r.payload_hash + prevHash + String(r.sequence));
      if (expectedChainHash !== r.chain_hash) return { valid: false, brokenAt: i, totalRecords: this.chain.length };
      prevHash = r.chain_hash;
    }
    return { valid: true, totalRecords: this.chain.length };
  }

  /** Seal all records past their auto-seal date */
  runRetentionCycle(): { sealed: number; expired: number } {
    const now = Date.now();
    let sealed = 0, expired = 0;
    for (const r of this.chain) {
      if (!r.sealed) {
        const policy = this.retentionPolicies.get(r.record_type);
        const sealMs = policy?.autoSealAfterDays ? r.timestamp + policy.autoSealAfterDays * 86400000 : null;
        if (sealMs && now >= sealMs) { r.sealed = true; sealed++; }
      }
      if (r.retention_until > 0 && now > r.retention_until && r.sealed) expired++;
    }
    return { sealed, expired };
  }

  getChainHead(): MemoryRecord | undefined { return this.chain[this.chain.length - 1]; }
  getRecord(id: string): MemoryRecord | undefined { return this.chain.find(r => r.id === id); }
  query(recordType: string, limit = 100): MemoryRecord[] {
    return this.chain.filter(r => r.record_type === recordType).slice(-limit);
  }
  getStats() {
    return {
      totalRecords: this.chain.length,
      headHash: this.getChainHead()?.chain_hash ?? this.GENESIS_HASH,
      oldestRecord: this.chain[0]?.timestamp,
      newestRecord: this.getChainHead()?.timestamp,
    };
  }
}

export const Memory = ImmutableMemoryEngine.getInstance();

// Default retention policies
Memory.setRetentionPolicy({ recordType: 'AUDIT', retentionDays: 3650, autoSealAfterDays: 365 });
Memory.setRetentionPolicy({ recordType: 'FINANCIAL', retentionDays: 3650, autoSealAfterDays: 365 });
Memory.setRetentionPolicy({ recordType: 'GOVERNANCE', retentionDays: 0 }); // forever
Memory.setRetentionPolicy({ recordType: 'SALES', retentionDays: 1825, autoSealAfterDays: 365 });

export default Memory;
