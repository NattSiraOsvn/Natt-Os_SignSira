#!/bin/bash

set -e  # dừng nếu có lỗi

echo "🚀 Bắt đầu build production chain – Tâm Luxury natt-os"

# 1. Tạo cấu trúc thư mục
mkdir -p src/cells/business/{order,prdmaterials,casting,stone,finishing,polishing,inventory,tax}-cell
mkdir -p src/cells/infrastructure/dust-recovery-cell
mkdir -p src/satellites/{port-forge,boundary-guard,trace-logger,health-beacon,lifecycle}
mkdir -p src/governance/event-contracts
mkdir -p src/infrastructure/adapters

# 2. Tạo file event contracts chung
cat > src/governance/event-contracts/production-events.ts << 'EOF'
// ============================================================
// PRODUCTION EVENT CONTRACTS – TÂM LUXURY
// ============================================================

export interface OrderCreatedEvent {
  eventType: 'ORDER_created';
  orderId: string;
  orderType: 'KD' | 'CT';
  productCode: string;
  category: string;
  goldPurity: number;
  goldColor: string;
  receiveDate: Date;
  requiredDate: Date;
  saleName: string;
}

export interface CastingRequestEvent {
  eventType: 'CASTING_REQUEST';
  lapId: string;
  orderIds: string[];
  goldPurity: number;
  goldColor: string;
  waxWeight: number;
  goldWeightRequired: number;
  gold24KWeight: number;
  goldAlloyWeight: number;
  sourceLot24K: string;
  sourceLotAlloy?: string;
  totalGoldWeight: number;
  phiếuInfoId: string;
}

export interface WipPhoiEvent {
  eventType: 'WIP_PHOI';
  lapId: string;
  orderId: string;
  phoiStatus: 'Đủ CT' | 'Thiếu CT' | 'Đã đúc' | 'HỎNG';
  weightIn: number;
  weightPhoi: number;
  goldPurity: number;
  goldColor: string;
  location: string;
  defects?: string[];
}

export interface WipStoneEvent {
  eventType: 'WIP_STONE';
  orderId: string;
  lapId?: string;
  stage: 'G2' | 'G3';
  weightDaTam: number;
  weightDaChu: number;
  qcStatus: 'OK' | 'Bể' | 'Mẻ' | 'Bảo hành';
  thoIds: string[];
  soLuongDa: number[];
}

export interface WipNguoiEvent {
  eventType: 'WIP_NGUOI';
  orderId: string;
  stage: 'NGUOI_1' | 'NGUOI_2_RAP' | 'NGUOI_3_RAP' | 'NGUOI_SC' | 'NB_1' | 'NB_CUOI' | 'HOT' | 'DA_CHU' | 'MOC_MAY';
  thoId: string;
  thoName: string;
  timeSpent: number;
  kpi?: number;
  dinhMuc?: number;
  goldWeightChange?: number;
  role: 'SX' | 'SC';  // BẮT BUỘC
}

export interface DustReturnedEvent {
  eventType: 'DUST_RETURNED';
  workerId: string;
  role: 'SX' | 'SC';
  vtType: '75CHI' | '58.5CHI' | '41.6CHI' | 'VH_NHE' | 'VH_NANG' | 'VH_DO' | '50GIAC' | '75GIAC';
  tl_giao: number;
  tl_tra: number;
  pho_pct?: number;          // sau nấu
  lapIds?: string[];          // cho SX
  orderIds?: string[];        // cho SC
  periodId: string;           // YYYY-MM
}

export interface WipCompletedEvent {
  eventType: 'WIP_COMPLETED';
  orderId: string;
  lapId: string;
  weightTP: number;
  weightVang: number;
  weightDaTam: number;
  weightDaChu: number;
  ngayXuatXuong: Date;
  qcApproved: boolean;
  totalCost154?: number;      // tổng chi phí tích lũy (VND)
}

export interface DustRecoveredEvent {
  eventType: 'DUST_RECOVERED';
  workerId: string;
  role: 'SX' | 'SC';
  vtType: string;
  quy750: number;
  totalVND: number;
  periodId: string;
}

export interface DustAlertEvent {
  eventType: 'DUST_ALERT';
  workerId: string;
  role: 'SX' | 'SC';
  vtType: string;
  lossRate: number;
  expected: number;
  deviation: number;
  level: 'warnING' | 'HIGH' | 'CRITICAL';
  message: string;
}

export interface CarryForwardProposalEvent {
  eventType: 'CARRY_FORWARD_PROPOSAL';
  workerId: string;
  role: 'SX' | 'SC';
  vtType: string;
  amount: number;              // quy 750
  fromPeriod: string;          // YYYY-MM
  toPeriod: string;
  reason: string;
  evidence?: string;
  proposedBy: string;
}

export interface CarryForwardApprovedEvent {
  eventType: 'CARRY_FORWARD_APPROVED';
  proposalId: string;
  approvedBy: string;
  approvedAt: Date;
}

export interface DustCloseReportEvent {
  eventType: 'DUST_CLOSE_REPORT';
  periodId: string;
  summary: any;
  anomalies: DustAlertEvent[];
  carryForwardSuggestions: CarryForwardProposalEvent[];
  status: 'PENDING' | 'APPROVED';
}
EOF

echo "✅ Event contracts created"

# 3. Tạo satellite factories
# port-forge
cat > src/satellites/port-forge/port.factory.ts << 'EOF'
import { EventBus } from '@/core/events/event-bus';

export interface PortConfig {
  cellId: string;
  signals: Record<string, { eventType: string; routeTo: string }>;
}

export function forgeSmartLinkPort(config: PortConfig) {
  const touchHistory: any[] = [];

  const port = {
    emit: (signalType: string, payload: Record<string, unknown>): void => {
      const signalConfig = config.signals[signalType];
      if (!signalConfig) return;

      const touch = {
        fromCellId: config.cellId,
        toCellId: signalConfig.routeTo,
        timestamp: Date.now(),
        signal: signalType,
        allowed: true,
      };
      touchHistory.push(touch);
      EventBus.publish(
        { type: signalConfig.eventType as any, payload },
        config.cellId,
        undefined
      );
    },

    getHistory: () => [...touchHistory],
  };

  // Tạo method notify cho mỗi signal
  for (const [signal] of Object.entries(config.signals)) {
    const methodName = `notify${signal.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')}`;
    (port as any)[methodName] = (payload: Record<string, unknown>) => {
      port.emit(signal, payload);
    };
  }

  return port;
}
EOF

# boundary-guard
cat > src/satellites/boundary-guard/boundary.factory.ts << 'EOF'
export interface BoundaryConfig {
  cellId: string;
  allowedCallers: string[];
  allowedTargets: string[];
  maxPayloadSize?: number;
  rateLimitPerMinute?: number;
}

export function createBoundaryGuard(config: BoundaryConfig) {
  const violations: Array<{ timestamp: number; caller: string; reason: string }> = [];

  return {
    validate: (callerId: string, payload: unknown): { allowed: boolean; reason?: string } => {
      if (config.allowedCallers.length > 0 && !config.allowedCallers.includes(callerId)) {
        violations.push({ timestamp: Date.now(), caller: callerId, reason: 'UNAUTHORIZED_CALLER' });
        return { allowed: false, reason: `${callerId} not in allowedCallers of ${config.cellId}` };
      }

      if (config.maxPayloadSize) {
        const size = JSON.stringify(payload).length / 1024;
        if (size > config.maxPayloadSize) {
          return { allowed: false, reason: `Payload ${size}KB exceeds ${config.maxPayloadSize}KB` };
        }
      }

      return { allowed: true };
    },

    canCallTarget: (targetId: string): boolean => {
      return config.allowedTargets.includes(targetId);
    },

    getViolations: () => [...violations],
    cellId: config.cellId,
  };
}
EOF

# trace-logger
cat > src/satellites/trace-logger/trace.factory.ts << 'EOF'
export interface TraceConfig {
  cellId: string;
  domain: string;
  retentionDays?: number;
}

export interface TraceEntry {
  id: string;
  cellId: string;
  action: string;
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown>;
  userId: string;
  timestamp: number;
}

export function createTraceLogger(config: TraceConfig) {
  const entries: TraceEntry[] = [];
  let seq = 0;

  return {
    log: (action: string, entityId: string, data: {
      before?: Record<string, unknown>;
      after: Record<string, unknown>;
      userId?: string;
    }): TraceEntry => {
      const entry: TraceEntry = {
        id: `${config.cellId}:trace:${++seq}`,
        cellId: config.cellId,
        action,
        entityId,
        before: data.before ?? null,
        after: data.after,
        userId: data.userId ?? 'system',
        timestamp: Date.now(),
      };
      entries.push(entry);
      return entry;
    },

    query: (filter?: { entityId?: string; action?: string; since?: number }): TraceEntry[] => {
      return entries.filter(e => {
        if (filter?.entityId && e.entityId !== filter.entityId) return false;
        if (filter?.action && e.action !== filter.action) return false;
        if (filter?.since && e.timestamp < filter.since) return false;
        return true;
      });
    },

    count: () => entries.length,
    last: (n = 10) => entries.slice(-n),
    cellId: config.cellId,
  };
}
EOF

echo "✅ Satellite factories created"

# 4. Tạo boilerplate cho từng cell (chỉ tạo file index và cấu hình cơ bản, logic sẽ fill sau)
declare -a cells=("order" "prdmaterials" "casting" "stone" "finishing" "polishing" "inventory" "tax" "dust-recovery")

for cell in "${cells[@]}"; do
  cell_dir="src/cells/business/${cell}-cell"
  if [[ "$cell" == "dust-recovery" ]]; then
    cell_dir="src/cells/infrastructure/dust-recovery-cell"
  fi

  # Tạo neural-main-cell.cell.anc
  cat > "$cell_dir/neural-main-cell.cell.anc" << EOF
{
  "id": "${cell}-cell",
  "name": "${cell} cell",
  "version": "1.0.0",
  "qneu": 100,
  "dependencies": [],
  "SmartLink": {
    "subscribes": [],
    "emits": []
  }
}
EOF

  # Tạo index.ts
  cat > "$cell_dir/index.ts" << EOF
export * from './${cell}.engine';
export * from './${cell}.entity';
export * from './${cell}.events';
EOF

  # Tạo file engine rỗng
  cat > "$cell_dir/${cell}.engine.ts" << EOF
import { EventBus } from '@/core/events/event-bus';

export class ${cell^}Engine {
  constructor() {
    // TODO: implement
  }

  async start() {
    // Subscribe to events, start polling
  }
}
EOF

  # Tạo file entity rỗng
  cat > "$cell_dir/${cell}.entity.ts" << EOF
export interface ${cell^}Entity {
  id: string;
  // TODO: define fields
}
EOF

  # Tạo file events (sẽ import từ contracts)
  cat > "$cell_dir/${cell}.events.ts" << EOF
import { 
  OrderCreatedEvent,
  CastingRequestEvent,
  WipPhoiEvent,
  WipStoneEvent,
  WipNguoiEvent,
  DustReturnedEvent,
  WipCompletedEvent,
  DustRecoveredEvent,
  DustAlertEvent,
  CarryForwardProposalEvent,
  CarryForwardApprovedEvent,
  DustCloseReportEvent
} from '@/governance/event-contracts/production-events';

export {
  OrderCreatedEvent,
  CastingRequestEvent,
  WipPhoiEvent,
  WipStoneEvent,
  WipNguoiEvent,
  DustReturnedEvent,
  WipCompletedEvent,
  DustRecoveredEvent,
  DustAlertEvent,
  CarryForwardProposalEvent,
  CarryForwardApprovedEvent,
  DustCloseReportEvent
};
EOF

  # Tạo port config
  mkdir -p "$cell_dir/ports"
  cat > "$cell_dir/ports/${cell}.SmartLink.port.ts" << EOF
import { forgeSmartLinkPort } from '@/satellites/port-forge/port.factory';

export const ${cell^}SmartLinkPort = forgeSmartLinkPort({
  cellId: '${cell}-cell',
  signals: {
    // TODO: define signals
  }
});
EOF

  echo "✅ Created cell: ${cell}"
done

# 5. Tạo adapter Google Sheets (JUST-U có thể dùng lại, tạo stub)
cat > src/infrastructure/adapters/google-sheets.adapter.ts << 'EOF'
export class GoogleSheetsAdapter {
  private spreadsheetId: string;

  constructor(spreadsheetId: string) {
    this.spreadsheetId = spreadsheetId;
  }

  async getSheetData(sheetName: string, range: string): Promise<{ values: any[][] }> {
    // TODO: implement actual Google Sheets API call
    // Stub trả về dữ liệu mẫu
    console.log(`Fetching ${sheetName}!${range} from ${this.spreadsheetId}`);
    return { values: [] };
  }

  async appendRow(sheetName: string, row: any[]): Promise<void> {
    console.log(`Appending row to ${sheetName}:`, row);
  }
}
EOF

# 6. Tạo core event bus
mkdir -p src/core/events
cat > src/core/events/event-bus.ts << 'EOF'
type EventHandler = (event: any) => void;

class EventBusSingleton {
  private handlers: Map<string, EventHandler[]> = new Map();

  subscribe(eventType: string, handler: EventHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  publish(event: any, sourceCellId?: string, targetCellId?: string) {
    const handlers = this.handlers.get(event.eventType) || [];
    handlers.forEach(h => h(event));
    // In production, also route via SmartLink with targetCellId
  }
}

export const EventBus = new EventBusSingleton();
EOF

# 7. Tạo package.json (nếu chưa có)
if [ ! -f package.json ]; then
  cat > package.json << 'EOF'
{
  "name": "tam-luxury-production",
  "version": "1.0.0",
  "description": "Production chain natt-os",
  "main": "index.js",
  "scripts": {
    "start": "ts-node src/index.ts",
    "build": "tsc",
    "test": "jest"
  },
  "dependencies": {
    "typescript": "^5.0.0",
    "ts-node": "^10.9.0",
    "@types/node": "^18.0.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
EOF
fi

# 8. Tạo tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# 9. Cài đặt dependencies
echo "📦 Installing dependencies..."
npm install

# 10. Tạo file chạy chính
cat > src/index.ts << 'EOF'
import { OrderEngine } from './cells/business/order-cell/order.engine';
import { PrdmaterialsEngine } from './cells/business/prdmaterials-cell/prdmaterials.engine';
import { CastingEngine } from './cells/business/casting-cell/casting.engine';
// ... import các engine khác

async function main() {
  console.log('🚀 Starting Tâm Luxury Production Chain');

  const orderEngine = new OrderEngine();
  const prdmaterialsEngine = new PrdmaterialsEngine();
  const castingEngine = new CastingEngine();
  // ... khởi tạo các engine khác

  // Start polling
  setInterval(() => orderEngine.pollNewOrders(), 30 * 60 * 1000); // 30 phút
  // ... các interval khác

  console.log('✅ All engines started');
}

main().catch(console.error);
EOF

# 11. Tạo script smartAudit cơ bản
mkdir -p scripts
cat > scripts/smartAudit.sh << 'EOF'
#!/bin/bash
echo "🔍 Running SmartAudit..."
# Kiểm tra cấu trúc thư mục, file missing, v.v.
errors=0

# Kiểm tra mỗi cell có đủ 5 file không
cells=(order prdmaterials casting stone finishing polishing inventory tax dust-recovery)
for cell in "${cells[@]}"; do
  dir="src/cells/business/${cell}-cell"
  if [[ "$cell" == "dust-recovery" ]]; then
    dir="src/cells/infrastructure/dust-recovery-cell"
  fi
  for file in "neural-main-cell.cell.anc" "index.ts" "${cell}.engine.ts" "${cell}.entity.ts" "${cell}.events.ts" "ports/${cell}.SmartLink.port.ts"; do
    if [ ! -f "$dir/$file" ]; then
      echo "❌ Missing $dir/$file"
      ((errors++))
    fi
  done
done

if [ $errors -eq 0 ]; then
  echo "✅ SmartAudit passed"
else
  echo "❌ SmartAudit found $errors errors"
fi
EOF
chmod +x scripts/smartAudit.sh

# 12. Khởi tạo git repository (nếu chưa có)
if [ ! -d .git ]; then
  git init
  git add .
  git commit -m "Initial production chain structure"
fi

echo ""
echo "🎉 BUILD HOÀN TẤT!"
echo "📁 Cấu trúc đã được tạo tại $(pwd)"
echo "▶️ Chạy 'npm start' để khởi động hệ thống"
echo "🔍 Chạy 'scripts/smartAudit.sh' để kiểm tra tính toàn vẹn"
echo ""
echo "🚀 Next steps: implement logic trong từng engine, kết nối Google Sheets thật."