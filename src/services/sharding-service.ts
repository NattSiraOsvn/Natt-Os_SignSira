// STUB — ShardingService
export const ShardingService = {
  generateShardHash: async (data: Record<string, unknown>): Promise<string> => {
    const s = JSON.stringify(data);
    let h = 0;
    for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    return Math.abs(h).toString(16).padStart(8, '0');
  },
  createIsolatedShard: (id: string) => ({ id, isolated: true }),
  getShard: (id: string) => ({ id, data: {} }),
};
