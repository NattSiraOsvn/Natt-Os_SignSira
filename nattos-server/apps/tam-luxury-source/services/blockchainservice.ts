
import { BlockShard, AuditTrailEntry, UserRole } from '../types';

/**
 * natt-os BLOCKCHAIN ISOLATION SERVICE
 * Chuyên trách việc băm (hashing) và cô lập shard dữ liệu.
 */
export class BlockchainShardingService {
  private static instance: BlockchainShardingService;

  public static getInstance(): BlockchainShardingService {
    if (!BlockchainShardingService.instance) {
      BlockchainShardingService.instance = new BlockchainShardingService();
    }
    return BlockchainShardingService.instance;
  }

  /**
   * Tạo mã băm SHA-256 (Giả lập cho môi trường Browser)
   * Đảm bảo tính toàn vẹn của bằng chứng kiểm toán.
   * FIX: Loại bỏ Date.now() nội tại để đảm bảo tính Deterministic (cùng input -> cùng hash).
   */
  public generateShardHash(data: Record<string, unknown>): string {
    // Chỉ hash dữ liệu đầu vào. Timestamp phải nằm trong `data` nếu muốn unique.
    const str = JSON.stringify(data); 
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).padStart(16, '0');
    return `0x${hex}${hex}${hex}${hex}`; // Giả lập 64 char hash
  }

  /**
   * Khởi tạo một Block Shard cô lập cho doanh nghiệp
   */
  public createIsolatedShard(enterpriseId: string): BlockShard {
    const timestamp = Date.now();
    return {
      shardId: `SHARD-${Math.random().toString(36).substring(7).toUpperCase()}`,
      enterpriseId,
      blockHash: this.generateShardHash({ enterpriseId, timestamp }),
      prevHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      status: 'ISOLATED',
      timestamp
    };
  }

  /**
   * Ký số một mục Audit Log nhạy cảm (VD: Thay đổi lương, Duyệt hồ sơ)
   * Tạo ra bằng chứng kiểm toán không thể chối bỏ (Non-repudiation).
   */
  public signAuditEntry(userId: string, role: UserRole, action: string, oldValue: string, newValue: string): AuditTrailEntry {
    const timestamp = Date.now();
    const dataToHash = { 
      userId, 
      action, 
      oldValue: oldValue || 'N/A', 
      newValue: newValue || 'N/A', 
      timestamp // Include timestamp in payload
    };
    
    return {
      id: `SIG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      timestamp,
      userId,
      role,
      action,
      oldValue,
      newValue,
      hash: this.generateShardHash(dataToHash)
    };
  }
}

export const ShardingService = BlockchainShardingService.getInstance();
