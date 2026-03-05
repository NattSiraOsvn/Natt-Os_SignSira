/** Shim: ShardingService with static methods */
export class ShardingService {
  static generateShardHash(input: Record<string, unknown>): string {
    return 'shard-' + Date.now().toString(36);
  }
  static getShard(key: string): string { return 'default'; }
}
