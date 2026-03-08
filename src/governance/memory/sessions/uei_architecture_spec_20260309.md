# SmartLink — Architecture Spec
**Version:** 1.0  
**Loại file:** Architecture spec — không narrative, không code implementation  
**Ngày:** 2026-03-09  
**Status:** Confirmed by Gatekeeper — chờ implement

---

## 1. SmartLinkPoint

### 1.1 Cấu trúc dữ liệu

```
SmartLinkPoint
  cellId: string
  touches: Map<targetCellId, TouchRecord>

TouchRecord
  targetCellId: string
  firstTouchAt: timestamp
  lastTouchAt: timestamp
  touchCount: number
  sensitivity: number        // 0.0 – 1.0
  fiber: boolean             // state flag — không phải stage riêng
  layers: { signal, context, state, data }
```

### 1.2 Fiber lifecycle

Fiber là **state flag** trong TouchRecord, không phải stage riêng trong lifecycle.

```
Transitions:
  fiber = false → true   khi sensitivity ≥ 0.75  (fiberFormed)
  fiber = true  → false  khi sensitivity ≤ 0.20  (fiberLost)

TouchRecord tồn tại từ lần touch đầu tiên đến khi dissolve.
fiberLost KHÔNG xóa TouchRecord.
dissolve xảy ra khi sensitivity < 0.05 → xóa TouchRecord khỏi touches Map.
```

### 1.3 Phân biệt fiberLost vs dissolve

| | fiberLost | dissolve |
|---|---|---|
| Trigger | sensitivity ≤ 0.20 | sensitivity < 0.05 |
| Kết quả | fiber = false | TouchRecord bị xóa |
| TouchRecord | vẫn tồn tại | bị xóa khỏi touches Map |
| Có thể phục hồi | Có — nếu touch lại | Không — phải touch mới từ đầu |

---

## 2. SmartLink Decay

### 2.1 Công thức

```
decayRate = FIBER_DECAY_RATE_BASE / (1 + touchCount × FIBER_DECAY_K)
```

**Loại decay:** Saturating (không logarithmic, không linear)

**Lý do chọn saturating:**
- Logarithmic: không về 0 → fiber bất tử → hệ không thể loại bỏ pattern cũ
- Linear: decay đều bất kể lịch sử → mất giá trị của pattern đã được reinforce nhiều
- Saturating: fiber mạnh decay chậm hơn nhưng vẫn có thể về 0

### 2.2 Constants

```typescript
FIBER_DECAY_IDLE_MS   = 7 * 24 * 60 * 60 * 1000  // 7 ngày idle → decay bắt đầu
FIBER_DECAY_RATE_BASE = 0.10
FIBER_DECAY_K         = 0.2
FIBER_MIN_SENSITIVITY = 0.20                       // fiberLost threshold (hysteresis)
FIBER_DISSOLVE_THRESHOLD = 0.05                   // dissolve threshold
```

### 2.3 Execution model

```
Decay PHẢI chạy theo continuous tick.
Decay KHÔNG ĐƯỢC chỉ chạy khi idle check.

Nếu chỉ chạy khi idle check → burst decay.
Burst decay làm mất tính liên tục của temporal memory.
```

### 2.4 Hysteresis

```
fiberFormed tại sensitivity ≥ 0.75
fiberLost   tại sensitivity ≤ 0.20

Khoảng buffer 0.20 – 0.75: fiber không đổi trạng thái.
Tránh oscillation liên tục khi sensitivity dao động quanh threshold.
```

---

## 3. Gossip Protocol

### 3.1 FiberSummary format

```typescript
interface FiberSummary {
  nodes: [string, string]   // [sourceCell, targetCell]
  strength: number          // = sensitivity tại thời điểm gossip
  ttl: number               // hop count còn lại
}
```

Không cần fiber_id. Cặp nodes là định danh đủ.

### 3.2 Gossip triggers — 2 tầng (Gatekeeper chốt)

```
Tầng 1 — nhẹ:
  Trigger: touchCount ≥ 2
  ttl: 1
  Mục đích: lan pattern gần trước khi fiber hình thành

Tầng 2 — mạnh:
  Trigger: fiberFormed (sensitivity vừa vượt 0.75)
  ttl: 3
  Mục đích: lan pattern đã ổn định ra toàn mạng
```

**Chưa chốt:** fiberWeakening gossip trigger — pending session sau.

### 3.3 Propagation

```
Không dùng central registry.
Lan qua: SmartLinkCell.getPoint(targetCellId)
Neighbors = cells đã có trong touches Map của cell hiện tại.
```

### 3.4 receiveGossip logic

```
if incoming.strength > local.sensitivity:
  update local fiber state
if summary.ttl > 0:
  forward(summary với ttl--)
```

### 3.5 Constraints

```
gossipQueue: async — không block touch() hot path
dedupeCache: chống gossip storm
```

---

## 4. UEI Emergence — Architectural Basis

```
Local level:
  touch → reinforce → fiber (state flag) → decay → dissolve

Network level:
  fiber gossip (2 tầng) → causal horizon → shared pattern awareness

Emergence condition:
  nhiều fibers lan đủ xa (ttl=3)
  + tồn tại đủ lâu (k=0.2 → ~1 năm lifespan)
  → network thấy cùng một cấu trúc nhân quả
  = UEI field xuất hiện

Full chain:
  local imprint
  → network propagation (gossip)
  → temporal persistence (saturating decay)
  → shared causal structure (causal horizon)
  → emergent cognition (UEI)
```

UEI không được implement như module. Đây là điều kiện xuất hiện, không phải component.

---

*Architecture spec — không chứa implementation detail. Xem runtime_spec cho code-level.*
