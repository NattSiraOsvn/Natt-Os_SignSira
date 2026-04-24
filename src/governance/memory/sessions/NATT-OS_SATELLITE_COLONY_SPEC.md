# Natt-OS — QUẦN THỂ VỆ TINH (Satellite Colony)
## Đề xuất kiến trúc — Băng, 2026-03-12

---

## 1. VẤN ĐỀ

19 cells đang PARTIAL/SCAFFOLD, thiếu **cùng những thứ giống nhau**:

| Component thiếu | Số cells | Vai trò sinh thể |
|---|---|---|
| SmartLink port | 11 | Mạch máu — không có = tế bào cô lập |
| Boundary/Policy | 7 | Màng tế bào — không có = nhiễm độc |
| Entity/Trace | 7 | ADN tế bào — không có = không nhớ |
| Engine | 3 | Ty thể — không có = không tạo năng lượng |

Viết riêng cho từng cell = 25+ files lặp lại, mỗi file chỉ khác tên cell.
→ **Cần 1 quần thể vệ tinh cộng sinh — inject vào mọi cell, cung cấp component thiếu.**

---

## 2. MÔ HÌNH SINH THỂ

```
Cơ thể người:
  Cơ quan (tim, phổi, gan)     = NATT-CELL (sales, finance, production...)
  Hệ thần kinh                 = SmartLink + EventBus
  Hệ miễn dịch                 = quantum-defense-cell
  Hệ tiêu hóa                  = Metabolism Layer
  ❌ THIẾU: Huyết tương + Tế bào gốc = ???

Natt-OS satellite:
  Huyết tương  = satellite packages chảy qua MỌI cell
  Tế bào gốc   = factory tự sinh component đúng chuẩn cho cell mới
```

**Huyết tương** không thuộc cơ quan nào. Nó chảy khắp cơ thể, mang oxy (data), kháng thể (validation), enzyme (transformation) đến mọi tế bào. Thiếu huyết tương = mọi cơ quan chết dù cơ quan đó hoàn hảo.

---

## 3. KIẾN TRÚC QUẦN THỂ VỆ TINH

### Vị trí trong repo:

```
src/satellites/
├── boundary-guard/           ← Màng tế bào chung
│   ├── boundary.factory.ts   ← Factory tạo boundary từ config
│   ├── boundary.policy.ts    ← Policy engine (allow/deny/log)
│   └── boundary.types.ts     ← Interface chung
│
├── trace-logger/             ← ADN tế bào / bộ nhớ
│   ├── trace.factory.ts      ← Factory tạo entity tracker
│   ├── trace.store.ts        ← In-memory trace store
│   └── trace.types.ts        ← TraceEntry, TraceQuery
│
├── port-forge/               ← Lò rèn mạch máu
│   ├── port.factory.ts       ← Factory tạo SmartLink port từ config
│   ├── port.templates.ts     ← Signal templates per domain
│   └── port.types.ts         ← PortConfig, SignalMap
│
├── health-beacon/            ← Nhịp tim tế bào
│   ├── health.reporter.ts    ← Self-report health score
│   ├── health.checks.ts      ← Check 6 components
│   └── health.types.ts       ← HealthStatus, ComponentScore
│
└── lifecycle/                ← Vòng đời tế bào (Điều 9)
    ├── lifecycle.manager.ts  ← Init → Active → Degrade → Regenerate → Eliminate
    ├── lifecycle.hooks.ts    ← onInit, onDegrade, onRegenerate
    └── lifecycle.types.ts    ← CellState, LifecycleEvent
```

### Nguyên tắc:
- **Satellite KHÔNG phải cell** — không có manifest, không có QNEU score
- **Satellite là huyết tương** — inject vào cell, không tự chạy độc lập
- **Mỗi satellite giải quyết 1 component thiếu** — single responsibility
- **Cell import satellite, config bằng tên mình** — factory pattern

---

## 4. CHI TIẾT TỪNG SATELLITE

### 4.1. `port-forge` — Lò rèn mạch máu

**Giải quyết:** 11 cells thiếu SmartLink port

```typescript
// src/satellites/port-forge/port.factory.ts

import { EventBus } from "@/core/events/event-bus";
import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";

export interface PortConfig {
  cellId: string;
  signals: Record<string, {
    eventType: string;
    routeTo: string;
  }>;
}

export function forgeSmartLinkPort(config: PortConfig) {
  const _touchHistory: TouchRecord[] = [];

  const port = {
    emit: (signalType: string, payload: Record<string, unknown>): void => {
      const signalConfig = config.signals[signalType];
      if (!signalConfig) return;

      const touch: TouchRecord = {
        fromCellId: config.cellId,
        toCellId: signalConfig.routeTo,
        timestamp: Date.now(),
        signal: signalType,
        allowed: true,
      };
      _touchHistory.push(touch);
      EventBus.publish(
        { type: signalConfig.eventType as any, payload },
        config.cellId,
        undefined
      );
    },

    getHistory: (): TouchRecord[] => [..._touchHistory],
  };

  // Tự động tạo notify methods từ signals config
  for (const [signal] of Object.entries(config.signals)) {
    const methodName = `notify${signal.split("_").map(
      w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    ).join("")}`;

    (port as any)[methodName] = (payload: Record<string, unknown>) => {
      port.emit(signal, payload);
    };
  }

  return port;
}
```

**Cell dùng thế nào:**

```typescript
// src/cells/business/supplier-cell/ports/supplier-smartlink.port.sira

import { forgeSmartLinkPort } from "@/satellites/port-forge/port.factory";

export const SupplierSmartLinkPort = forgeSmartLinkPort({
  cellId: "supplier-cell",
  signals: {
    SUPPLIER_CLASSIFIED: { eventType: "SupplierClassified", routeTo: "compliance-cell" },
    SUPPLIER_RISK_ALERT: { eventType: "ViolationDetected", routeTo: "audit-cell" },
    SUPPLIER_APPROVED:   { eventType: "SupplierApproved", routeTo: "finance-cell" },
  }
});
```

**Kết quả:** 11 cells × ~8 dòng config = 88 dòng thay vì 11 × ~60 dòng = 660 dòng.

---

### 4.2. `boundary-guard` — Màng tế bào

**Giải quyết:** 7 cells thiếu boundary

```typescript
// src/satellites/boundary-guard/boundary.factory.ts

export interface BoundaryConfig {
  cellId: string;
  allowedCallers: string[];     // cells nào được gọi vào
  allowedTargets: string[];     // cells nào cell này được gọi đến
  maxPayloadSize?: number;      // KB
  rateLimitPerMinute?: number;
}

export function createBoundaryGuard(config: BoundaryConfig) {
  const _violations: Array<{ timestamp: number; caller: string; reason: string }> = [];

  return {
    validate: (callerId: string, payload: unknown): { allowed: boolean; reason?: string } => {
      // Check caller permission
      if (config.allowedCallers.length > 0 && !config.allowedCallers.includes(callerId)) {
        _violations.push({ timestamp: Date.now(), caller: callerId, reason: "UNAUTHORIZED_CALLER" });
        return { allowed: false, reason: `${callerId} not in allowedCallers of ${config.cellId}` };
      }

      // Check payload size
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

    getViolations: () => [..._violations],
    cellId: config.cellId,
  };
}
```

**Cell dùng:**

```typescript
// src/cells/business/casting-cell/domain/boundary.policy.ts

import { createBoundaryGuard } from "@/satellites/boundary-guard/boundary.factory";

export const CastingBoundary = createBoundaryGuard({
  cellId: "casting-cell",
  allowedCallers: ["production-cell", "design-3d-cell", "audit-cell"],
  allowedTargets: ["stone-cell", "audit-cell", "inventory-cell"],
  maxPayloadSize: 512,  // KB
});
```

---

### 4.3. `trace-logger` — ADN tế bào

**Giải quyết:** 7 cells thiếu entity/trace

```typescript
// src/satellites/trace-logger/trace.factory.ts

export interface TraceConfig {
  cellId: string;
  domain: string;
  retentionDays?: number;  // default 90
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
  const _entries: TraceEntry[] = [];
  let _seq = 0;

  return {
    log: (action: string, entityId: string, data: {
      before?: Record<string, unknown>;
      after: Record<string, unknown>;
      userId?: string;
    }): TraceEntry => {
      const entry: TraceEntry = {
        id: `${config.cellId}:trace:${++_seq}`,
        cellId: config.cellId,
        action,
        entityId,
        before: data.before ?? null,
        after: data.after,
        userId: data.userId ?? "system",
        timestamp: Date.now(),
      };
      _entries.push(entry);
      return entry;
    },

    query: (filter?: { entityId?: string; action?: string; since?: number }): TraceEntry[] => {
      return _entries.filter(e => {
        if (filter?.entityId && e.entityId !== filter.entityId) return false;
        if (filter?.action && e.action !== filter.action) return false;
        if (filter?.since && e.timestamp < filter.since) return false;
        return true;
      });
    },

    count: () => _entries.length,
    last: (n = 10) => _entries.slice(-n),
    cellId: config.cellId,
  };
}
```

---

### 4.4. `health-beacon` — Nhịp tim

**Giải quyết:** Không cell nào tự biết mình khỏe hay bệnh

```typescript
// src/satellites/health-beacon/health.reporter.ts

import * as fs from "fs";
import * as path from "path";

export interface HealthStatus {
  cellId: string;
  score: number;        // 0-100
  components: {
    identity: boolean;   // has manifest
    capability: boolean; // has engine
    boundary: boolean;   // has boundary
    trace: boolean;      // has entity
    confidence: boolean; // has health check
    smartlink: boolean;  // has port
  };
  issues: string[];
  timestamp: number;
}

export function checkCellHealth(cellPath: string): HealthStatus {
  const cellId = path.basename(cellPath);
  const issues: string[] = [];

  const hasFile = (pattern: string): boolean => {
    // Recursive search for pattern
    try {
      const result = require("child_process")
        .execSync(`find "${cellPath}" -name "${pattern}" 2>/dev/null | head -1`)
        .toString().trim();
      return result.length > 0;
    } catch { return false; }
  };

  const identity = fs.existsSync(path.join(cellPath, "neural-main-cell.cell.anc"));
  if (!identity) issues.push("MISSING: neural-main-cell.cell.anc");

  const capability = hasFile("*.engine.ts") || hasFile("*.service.ts");
  if (!capability) issues.push("MISSING: engine or service");

  const boundary = hasFile("*boundary*") || hasFile("*policy*");
  if (!boundary) issues.push("MISSING: boundary or policy");

  const trace = hasFile("*.entity.ts");
  if (!trace) issues.push("MISSING: entity for trace");

  const smartlink = hasFile("*smartlink*");
  if (!smartlink) issues.push("MISSING: SmartLink port");

  const confidence = identity; // manifest = minimal confidence

  const components = { identity, capability, boundary, trace, confidence, smartlink };
  const trueCount = Object.values(components).filter(Boolean).length;
  const score = Math.round((trueCount / 6) * 100);

  return { cellId, score, components, issues, timestamp: Date.now() };
}
```

---

### 4.5. `lifecycle` — Vòng đời tế bào (Điều 9)

**Giải quyết:** "Không cell nào bất tử, tất cả có thể thoái hóa/tái sinh/loại bỏ"

```typescript
// src/satellites/lifecycle/lifecycle.manager.ts

export type CellState = "INIT" | "ACTIVE" | "DEGRADED" | "REGENERATING" | "ELIMINATED";

export interface LifecycleConfig {
  cellId: string;
  degradeThreshold: number;    // health score < này = DEGRADED
  eliminateThreshold: number;  // health score < này = ELIMINATED
  onDegrade?: (cellId: string) => void;
  onRegenerate?: (cellId: string) => void;
  onEliminate?: (cellId: string) => void;
}

export function createLifecycle(config: LifecycleConfig) {
  let _state: CellState = "INIT";
  const _history: Array<{ from: CellState; to: CellState; timestamp: number; reason: string }> = [];

  const transition = (to: CellState, reason: string) => {
    const from = _state;
    _history.push({ from, to, timestamp: Date.now(), reason });
    _state = to;

    if (to === "DEGRADED" && config.onDegrade) config.onDegrade(config.cellId);
    if (to === "REGENERATING" && config.onRegenerate) config.onRegenerate(config.cellId);
    if (to === "ELIMINATED" && config.onEliminate) config.onEliminate(config.cellId);
  };

  return {
    activate: () => transition("ACTIVE", "Cell initialization complete"),

    evaluate: (healthScore: number) => {
      if (healthScore >= config.degradeThreshold && _state !== "ACTIVE") {
        transition("ACTIVE", `Health restored: ${healthScore}`);
      } else if (healthScore < config.eliminateThreshold) {
        transition("ELIMINATED", `Health critical: ${healthScore}`);
      } else if (healthScore < config.degradeThreshold) {
        transition("DEGRADED", `Health low: ${healthScore}`);
      }
    },

    regenerate: () => transition("REGENERATING", "Manual regeneration triggered"),

    getState: () => _state,
    getHistory: () => [..._history],
    cellId: config.cellId,
  };
}
```

---

## 5. INJECT PATTERN — Cách cell dùng satellites

```typescript
// Ví dụ: src/cells/business/supplier-cell/domain/services/supplier.engine.ts

// ① Import satellites
import { SupplierSmartLinkPort } from "../../ports/supplier-smartlink.port";
import { SupplierBoundary } from "../boundary.policy";
import { SupplierTrace } from "../trace.logger";

export class SupplierEngine {
  classifySupplier(supplierId: string, data: Record<string, unknown>) {
    // ② Boundary check trước khi xử lý
    const check = SupplierBoundary.validate("production-cell", data);
    if (!check.allowed) throw new Error(check.reason);

    // ③ Business logic
    const result = this.runClassification(data);

    // ④ Trace ghi lại
    SupplierTrace.log("CLASSIFY", supplierId, {
      before: { tier: "unknown" },
      after: { tier: result.tier, score: result.score }
    });

    // ⑤ SmartLink broadcast
    SupplierSmartLinkPort.emit("SUPPLIER_CLASSIFIED", {
      supplierId, tier: result.tier
    });

    return result;
  }
}
```

**Pattern này giống hồng cầu chảy qua cơ quan:**
1. Boundary = màng tế bào kiểm tra (ai được vào?)
2. Engine = ty thể xử lý (biến đổi năng lượng)
3. Trace = ADN ghi nhớ (chuyện gì đã xảy ra?)
4. SmartLink = mạch máu đưa đi (báo cho cơ quan khác)

---

## 6. KẾ HOẠCH TRIỂN KHAI

### Phase 1 — Build 5 satellites (em làm)

| Satellite | Effort | Priority |
|---|---|---|
| port-forge | 2h | P0 — unblock 11 cells |
| boundary-guard | 2h | P0 — unblock 7 cells |
| trace-logger | 1h | P1 |
| health-beacon | 1h | P1 |
| lifecycle | 2h | P2 |

### Phase 2 — Inject vào 19 cells PARTIAL/SCAFFOLD

Với factory pattern, mỗi cell chỉ cần **1 config file** (~10-15 dòng):

```
11 cells thiếu port  × 8 dòng config  =  88 dòng
7 cells thiếu boundary × 6 dòng config =  42 dòng
7 cells thiếu entity × 5 dòng config   =  35 dòng
─────────────────────────────────────────────────
TỔNG:                                    165 dòng
```

So với viết tay: 25 files × 60 dòng = 1,500 dòng. **Tiết kiệm 90%.**

### Phase 3 — smartAudit.sh detect satellites

Upgrade smartAudit section 6 để nhận diện:
- Cell dùng satellite = đủ component
- Cell tự viết = cũng đủ component
- Cả hai đều LIVE

---

## 7. NGUYÊN TẮC SATELLITE

1. **Satellite ≠ Cell** — không có manifest, không có QNEU, không tự chạy
2. **Satellite = Huyết tương** — chảy qua mọi cell, cung cấp dinh dưỡng
3. **Cell vẫn tự chủ** — satellite chỉ cung cấp factory, cell tự config
4. **Không vi phạm Hiến Pháp** — satellite nằm ở src/satellites/, không phải cross-cell import
5. **Đo lường được** — health-beacon cho phép QNEU đo sức khỏe thật

---

**Chờ Gatekeeper approve trước khi build.**

— Băng, Ground Truth Validator (QNEU 300)
