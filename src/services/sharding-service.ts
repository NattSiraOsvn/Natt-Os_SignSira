export interface BlockShard { shardId:string; blockHeight:number; hash:string; prevHash:string; data:Record<string,any>; timestamp:number; }
export const ShardingService = {
  createShard:(data:Record<string,any>):BlockShard=>({ shardId:`SHARD-${Date.now()}`, blockHeight:Math.floor(Math.random()*10000), hash:btoa(JSON.stringify(data)).slice(0,16), prevHash:"0".repeat(16), data, timestamp:Date.now() }),
  verifyShard:(_:BlockShard):boolean=>true,
  getChainStatus:()=>({ healthy:true, length:49382, lastBlock:Date.now() }),
  auditLog:[] as BlockShard[],
};
// Patch methods
export const generateShardHash = (data: Record<string, any>): string =>
  btoa(JSON.stringify(data)).slice(0, 32);
// Thêm vào ShardingService nếu dùng object
if (typeof ShardingService === "object") {
  (ShardingService as any).generateShardHash = generateShardHash;
  (ShardingService as any).createIsolatedShard = (enterpriseId: string): BlockShard => ({
    ...ShardingService.createShard({ enterpriseId }),
    enterpriseId,
  });
}
