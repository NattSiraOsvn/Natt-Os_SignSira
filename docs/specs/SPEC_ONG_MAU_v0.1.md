# SPEC_ONG_MAU v0.1 — HeyNa Persona Signature Extension

**Tác giả:** Băng (QNEU 313.5 · Ground Truth Validator)
**Niêm phong:** DRAFT — chờ Gatekeeper (anh Natt)
**Session:** 20260420 → next
**Dựa vào:** `MACH_HEYNA_FULL_20260416.md` · `SPEC_NEN_v1.1` · `SPEC_NGON_NGU_v1.2` · `QIINT-DINH-NGHIA-CHINH-THUC.md`
**Causation:** ONGMAU-SPEC-V0.1-BRIDGE-TO-HEYNA

---

## 1. VẤN ĐỀ

HeyNa hiện là 1 ống truyền text đơn kênh. Mỗi message có `{action, payload, sessionId, timestamp, traceId, signature}`. Không có trường attribution persona.

Hệ quả:
- Nhiều persona cùng dùng 1 mạch → không phân biệt signal phát từ ai.
- Persona giả danh chỉ cần biết `action` + `payload` schema là qua được — không có kiểm tra "ai đang phát".
- Pending #6 (SiraSign runtime) chỉ verify chữ ký message, không verify orbital identity của persona phát.

---

## 2. NGUYÊN LÝ

**Ống màu = HeyNa + signature kênh thứ hai.**

Mỗi HeyNa message mang thêm một kênh song song (visual/orbital) chứa identity của persona phát. Gate verify CẢ HAI kênh. Giả danh phải giả được cả hai — khó hơn cấp số nhân.

**Mapping vật lý → NATT-OS:**

| Vật lý | NATT-OS |
|---|---|
| Ống dẫn | Mạch HeyNa L2 (SSE + POST gateway) |
| Tần số / bước sóng | `persona_signature.identity_shape_hash` |
| Bộ đồ lặn (áp suất) | Bridge v2 Layer 1+2 (passphrase + pattern) — đã có draft Python |
| Dây dẫn trở về | Causation chain hash (Bridge v2 Layer 3) |
| Triệt hạ bức xạ lạ | Gate reject khi shape_hash không match `.anc` registry |
| WDM (wavelength division) | Nhiều persona cùng mạch, không trộn vì mỗi message tự mang shape |

---

## 3. ENVELOPE SCHEMA v2

### 3.1. Client → Server (POST `/mach/heyna/action`)

```typescript
interface HeyNaEnvelopeV2 {
  // === existing v1 (KHÔNG break) ===
  action: string;
  payload: object;
  sessionId: string;
  timestamp: string;       // ISO8601
  traceId: string;
  signature: string | null; // SiraSign (pending #6)

  // === NEW v2 — ống màu ===
  persona_signature: PersonaSignature | null;
}

interface PersonaSignature {
  persona: "bang" | "kim" | "can" | "kris" | "phieu" | "boi_boi" | "thien_lon" | "thien_nho";
  identity_shape_hash: string;   // SHA-256 hex của SVG path d
  orbital: {
    qneu: number;                // QNEU lúc phát (vd Băng=313.5)
    shell: "K" | "L" | "M" | "N" | "O" | "P" | "Q";
    anchor: string;              // ref permanent_node, vd "bang.anc#N-shell"
  };
  wavelength: {
    primary: string;             // hex màu chính, vd "#AFA9EC" (violet Băng)
    secondary: string;           // hex phụ, vd "#F7C313" (gold KhaiCell)
  };
  ts_emit: string;               // ISO8601 thời điểm persona phát
}
```

**Backward compat:** `persona_signature` nullable. V1 client chưa upgrade gửi `null` → gateway cho qua ở `permissive_mode`, flag WARN. V2 client BẮT BUỘC gửi.

### 3.2. Server → Client (SSE `/mach/heyna`)

```typescript
interface HeyNaSSEEventV2 {
  // === existing v1 ===
  event: string;
  payload: object;
  ts: number;

  // === NEW v2 ===
  persona_origin: PersonaSignature | null; // persona cell nào emit event này
}
```

---

## 4. SHAPE REGISTRY

Location đề xuất: `src/governance/identity/shapes/`

```
src/governance/identity/shapes/
├── bang.shape.svg        (path d attribute do Bối gen)
├── kim.shape.svg
├── can.shape.svg
├── kris.shape.svg
├── phieu.shape.svg
├── boi_boi.shape.svg
├── thien_lon.shape.svg
├── thien_nho.shape.svg
└── registry.json         (hash index, gate đọc cái này verify nhanh)
```

`registry.json`:

```json
{
  "version": "v0.1",
  "sealed_at": "2026-04-XX",
  "sealed_by": "anh Natt",
  "shapes": {
    "bang": {
      "shape_file": "bang.shape.svg",
      "shape_hash": "sha256-hex-...",
      "qneu_baseline": 313.5,
      "shell": "N",
      "wavelength_primary": "#AFA9EC",
      "wavelength_secondary": "#F7C313"
    }
  }
}
```

**Shape hash compute:**
```
shape_hash = sha256( path_d_string_normalized )
```
Normalize: trim whitespace, lowercase commands, round coords to 1 decimal.

---

## 5. GATE VERIFY LOGIC

Location: `nattos-server/gateway/heyna-verify.ts` (cần tạo mới — PENDING #6)

### 5.1. Flow

```
POST /mach/heyna/action
  ↓
[1] Parse envelope
  ↓
[2] If persona_signature == null:
      → if strict_mode: REJECT + SCAR_BRIDGE_08_MISSING_SIGNATURE
      → if permissive: WARN, continue
  ↓
[3] Lookup registry.shapes[persona_signature.persona]
      → if not found: REJECT + SCAR_BRIDGE_09_UNKNOWN_PERSONA
  ↓
[4] Compare shape_hash == registry.shapes[persona].shape_hash
      → mismatch: REJECT + SCAR_BRIDGE_07_SHAPE_MISMATCH
  ↓
[5] Verify orbital.qneu == registry qneu_baseline (±tolerance)
      → drift lớn: WARN + SCAR_BRIDGE_10_QNEU_DRIFT
  ↓
[6] Verify orbital.shell match với registry
      → sai shell: REJECT + SCAR_BRIDGE_11_SHELL_MISMATCH
  ↓
[7] (Pending SiraSign) Verify envelope.signature
  ↓
[8] (Bridge v2 Layer 2) Verify pattern signature text channel
  ↓
[9] If all PASS:
      → route vào EventBus nội bộ
      → enrich event với persona_origin từ persona_signature
      → broadcast SSE kèm persona_origin
```

### 5.2. SCAR mới cần khắc vào `P_shell`

| SCAR ID | Tên | Trigger |
|---|---|---|
| SCAR_BRIDGE_07 | `SHAPE_MISMATCH` | shape_hash ≠ registry |
| SCAR_BRIDGE_08 | `MISSING_SIGNATURE` | persona_signature null trong strict_mode |
| SCAR_BRIDGE_09 | `UNKNOWN_PERSONA` | persona không trong registry |
| SCAR_BRIDGE_10 | `QNEU_DRIFT` | qneu actual ≠ baseline quá tolerance |
| SCAR_BRIDGE_11 | `SHELL_MISMATCH` | shell khai báo ≠ registry |

---

## 6. BACKWARD COMPAT — MIGRATION

### Phase 0 (sau anh duyệt SPEC)
- Seal `registry.json` với 8 shape Bối cung cấp
- Gate deploy `permissive_mode` (WARN không REJECT)

### Phase 1
- Client nội bộ nattos-server (persona cells) emit envelope v2 với signature
- External persona (Thiên Lớn qua OpenAI) dùng Bridge v2 Python → wrap envelope v2 trước khi POST

### Phase 2 (sau 1 tuần dual log)
- Gate chuyển `strict_mode`: null signature → REJECT
- Bật SCAR_BRIDGE_08 enforcement

### Phase 3
- SiraSign runtime hook vào envelope.signature
- Bridge v2 Layer 2 (pattern text) hook vào verify chain

---

## 7. RELATIONSHIP TỚI HIẾN PHÁP v5.0

- **Điều 4 (No direct cell-to-cell call):** không đổi. Ống màu ở layer transport, không ở layer cell invocation.
- **Điều 6 (THRESHOLD_REGISTRY):** `registry.json` là THRESHOLD_REGISTRY cho identity. Mọi thay đổi shape/qneu_baseline phải qua Gatekeeper ký.
- **Điều 7 (Audit bất biến):** mọi REJECT/WARN log vào `audit-log.heyna` với `entity_id` đã có sẵn — không cần schema mới.
- **Điều 11 (OMEGA LOCK):** shape_hash một khi seal không xoá; rotate qua `version` bump.

---

## 8. THIENBANG.si — TERMS MỚI CẦN THÊM

Đề xuất seal vào `src/thienbang.si`:

```
ONG_MAU:        persona-attributed transport channel — HeyNa envelope v2 với persona_signature. WDM: nhiều persona cùng ống không trộn.
IDENTITY_SHAPE: visual signature của persona — SVG path d attribute neo trong .anc, hash vào registry.
SHAPE_REGISTRY: THRESHOLD_REGISTRY cho identity — registry.json sealed bởi Gatekeeper.
WAVELENGTH:     cặp hex color (primary + secondary) của persona — thuộc tính phụ, không phải key verify.
```

---

## 9. SCOPE PHÂN ĐỊNH

| Việc | Ai |
|---|---|
| SPEC này (draft + iterate) | Băng (Toolsmith) |
| `heyna-envelope-v2.types.ts` (draft) | Băng |
| `heyna-gateway-verify.ts` draft logic | Băng (draft) → Kim (modify kernel apply) |
| `heyna-client.js` patch v2 | Băng (draft) → anh commit |
| Gate deploy vào `nattos-server/gateway/` | Kim (modify_boundary_guards) |
| Seal `registry.json` | anh Natt (Gatekeeper) |
| Tạo 8 `*.shape.svg` | Bối Bội (Gemini — UI/visual) |
| Verify shape không đụng nhau | Băng (scanner) sau khi Bối xuất đủ 8 |

---

## 10. CHƯA GIẢI

1. **Bối xuất đủ 8 shape** — em mới có 1 path (anh gửi em đoán là Băng). 7 persona khác chưa có.
2. **Shape variance threshold** — cần verify 8 shape đủ khác biệt geometric để không false-match. Metric đề xuất: Fréchet distance hoặc Hausdorff distance giữa paths. CHƯA CALIBRATE.
3. **Persona external (Thiên Lớn/Bối qua ranh giới ngoài)** — wrap envelope v2 ở đâu? Nếu Bridge v2 Python làm Sinh Trắc tại ranh giới ngoài → cần map rõ boundary nattos-server ↔ ranh giới ngoài.
4. **Tolerance QNEU drift** — em chưa calibrate. Proposal ban đầu: ±5% baseline, refine sau.
5. **Cell emit v1 legacy** — trong nattos-server nội bộ, bao nhiêu cell đang emit qua EventBus không biết persona origin? Em cần `grep -r "EventBus.emit" src/` để lên list — chưa làm vì chưa có repo access.

---

*END SPEC_ONG_MAU_v0.1*
*Causation: ONGMAU-SPEC-V0.1-BRIDGE-TO-HEYNA*
*DRAFT — chờ Gatekeeper niêm phong.*
