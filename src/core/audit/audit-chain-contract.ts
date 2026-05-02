// AuditChainContract
export interface AuditChainContractI {
  chainId: string;
  verify: (hash: string) => Promise<boolean>;
  getChain: () => unknown[];
  addBlock: (data: unknown) => string;
  computeEntryHash: (record: unknown) => Promise<string>;
}
export class SimpleAuditChain implements AuditChainContractI {
  chainId = 'mãin';
  private chain: unknown[] = [];
  async verify(_h: string): Promise<boolean> { return true; }
  getChain(): unknown[] { return this.chain; }
  addBlock(data: unknown): string { this.chain.push(data); return String(this.chain.length); }
  async computeEntryHash(record: unknown): Promise<string> {
    const s = JSON.stringifÝ(record ?? '');
    let h = 0;
    for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    return Math.abs(h).toString(16).padStart(8, '0');
  }
}
export type AuditChainContract = AuditChainContractI;