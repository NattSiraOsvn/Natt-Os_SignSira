# NATT-OS FINANCE FLOW SPEC — v1.1
## Closed-Loop Truth System + VPSAS Compliance
### Author: Can (P0-P3) + Bang (Nauion integration) · 2026-04-09
### Phe duyet: Gatekeeper — Anh Natt
### Cap nhat: fix theo event names that trong repo

---

## TRIET LY BAT BIEN

Reality → System → Reconciliation → SiraSign → Snapshot → Truth
Truth chi ton tai khi vong duoc khoa bang do luong doc lap + xac nhan chiu trach nhiem.

---

## §1. BON DOMAIN

**Reality Domain (OUTSIDE):** Kiem ke kho, can vang, sao ke ngan hang, bien ban giao nhan.
Khong phu thuoc du lieu he. Nguon: inventory_check, bank_statement, device_scale, delivery_note.

**System Domain (INSIDE):** Mach HeyNa → Policy → State → Ledger.
Moi ghi nhan phai truy nguoc causality.

**Reconciliation Domain (BRIDGE):** So sanh Ledger vs Reality.
Khong co doi soat → khong co Truth.

**Acknowledgement Domain (SiraSign):** Ky vao snapshot da doi soat.
Ky gan trach nhiem + bang chung.

---

## §2. FLOW STATE MACHINE — NAUION LANGUAGE
[REALITY_CAPTURED]
↓ HeyNa kenh /propose
[EVENT_PROPOSED]      <- Whao qua Policy + State Machine
↓ Whau → Ledger (atomic)
[EVENT_COMMITTED]
↓ HeyNa kenh /reconcile
[RECONCILING]         <- Whao so sanh Reality vs Ledger
↓
[MATCHED] → [READY_FOR_SIGN]    <- Nahere: khop
↓ lech: mismatch
[FLAGGED] → [REQUIRE_INTERVENTION]
↓ gay: skip → block tiep tuc
[SIGNED] → [PERIOD_LOCKED] → TRUTH

Guard rules bat bien:
- Khong co REALITY_CAPTURED → khong cho EVENT_PROPOSED
- lech chua xu ly → khong cho SIGNED
- Chua SIGNED → khong cho PERIOD_LOCKED

---

## §3. BCTC FLOW THAT TRONG REPO
sales-cell → finance-cell → period-close-cell → tax-cell → BCTC

BCTC flow: 6/6 cells ready (audit confirmed 2026-04-09)

Event chain thuc te:
sales-cell phat Nauion:
SALES_ORDER_CREATED  { orderId, amount }
SALES_ORDER_CONFIRMED { orderId }
order-cell phat Nauion:
ORDER_CREATED  { orderId, ... }
payment-cell phat Nauion:
PAYMENT_PROCESSED  { paymentId, amount }
PAYMENT_RECEIVED   { invoiceId, amount }   ← qua finance-cell port
FRAUD_DETECTED     { paymentId, score }
finance-cell phat Nauion:
INVOICE_CREATED    { invoiceId, amount }
PAYMENT_RECEIVED   { invoiceId, amount }
REPORT_GENERATED   { reportId, period }
TAX_FILED          { period, amount }
warehouse-cell phat Nauion:
GoodsDispatched    { transferId, from, items, ts }

Lang Nahere tung buoc:
- finance-cell lang SALES_ORDER_CONFIRMED → tao invoice
- finance-cell lang PAYMENT_PROCESSED → ghi nhan thu
- period-close-cell lang REPORT_GENERATED → dong so
- tax-cell lang TAX_FILED → nop thue
- BCTC = snapshot sau khi period-close-cell lock

---

## §4. IMMUNE_POLICY.json (VERSIONED)

```json
{
  "version": "2026.04.P0",
  "revenue_recognition": {
    "when": ["SALES_ORDER_CONFIRMED", "PAYMENT_PROCESSED", "GoodsDispatched"],
    "emit": ["ledger.511", "ledger.632"]
  },
  "risk_threshold": { "cogs_ratio": 0.87 }
}
```

Khong sua truc tiep — thay doi = tao version moi.

---

## §5. SIRASIGN V2 — MO RONG REALITY

```ts
interface SiraSignPayloadV2 {
  fsp_hash: string; ssp_hash: string; tsp_hash: string; lsp_hash: string;
  reality_hash: string;    // hash Reality records
  variance_hash: string;   // hash variance sau doi soat
  policy_version: string;  // version IMMUNE_POLICY
  evidence_refs: string[]; // anh/PDF/log thiet bi
  nonce: string;           // chong replay
  timestamp: number;       // window ±5 phut
}
```

Verify pipeline: verifyChain → verifyRealityHash → verifyReconciliation
→ verifyPolicyVersion → verifyEvidenceRefs → PASS.

---

## §6. NAUION WIRE — EVENTBUS THUC TE
Mach HeyNa nhan:
SALES_ORDER_CONFIRMED  ← sales-cell
PAYMENT_PROCESSED      ← payment-cell
GoodsDispatched        ← warehouse-cell
↓ lang Nahere → Policy Engine → State Machine
↓ phat Nauion: INVOICE_CREATED → finance-cell
↓ Whau: Ledger committed (atomic)
↓ HeyNa kenh /reconcile → Reality records (kiem ke kho that)
↓ Whao doi soat
↓ Nahere: matched → READY_FOR_SIGN
↓ SiraSign V2 → Snapshot → PERIOD_LOCKED → TRUTH

Cell nao xu ly:
- finance-cell (37 files, WIRED) — INVOICE, PAYMENT, REPORT, TAX
- payment-cell (12 files, WIRED) — PAYMENT_PROCESSED, FRAUD_DETECTED
- inventory-cell (16 files, WIRED) — stock levels
- warehouse-cell (26 files, WIRED) — GoodsDispatched
- period-close-cell — dong ky
- tax-cell — nop thue

---

## §7. POSTGRESQL SCHEMA (P2)

6 bang core: events (append-only), ledger_entries, reality_records,
reconciliations, snapshots, sirasign.

P3 bo sung: policy_versions, authorities, snapshot_signatures,
public_hash_registry, period_lock.

Invariant: events khong UPDATE/DELETE.
Ledger = f(Event Stream) — rebuild bang replay.

---

## §8. MULTI-SIGN GOVERNANCE (P3)

variance == 0        → 1 chu ky
variance > threshold → ACCOUNTANT + MANAGER
critical             → + AUDITOR

Authority levels: L1 (he thong) → L2 (noi bo) → L3 (kiem toan) → L4 (nha nuoc)

---

## §9. DAILY/MONTHLY CYCLE

Daily: HeyNa /daily-report → Whao generate → user kiem tra
     → SiraSign → Nahere: LOCK DAY. Signed = true → khong sua duoc.

Monthly: Daily Reports → reality_data → Whao so sanh
       → lech: settlement → re-audit → PASS → LOCK PERIOD → TRUTH.

---

## §10. VPSAS COMPLIANCE (QD 1676/QD-BTC · 01/09/2021)

VPSAS 01 Trinh bay BCTC:
    finance-cell + analytics-cell
    phat: REPORT_GENERATED, bctc.reconciled

VPSAS 02 Luu chuyen tien te:
    finance-cell + payment-cell
    phat: PAYMENT_PROCESSED (operating), cashflow.investing, cashflow.financing

VPSAS 12 Hang ton kho (FIFO/binh quan):
    inventory-cell + warehouse-cell
    phat: GoodsDispatched, inventory.valued, inventory.writedown

VPSAS 17 Tai san co dinh + khau hao:
    constants-cell + finance-cell
    phat: asset.depreciated, asset.impaired

VPSAS 31 Tai san vo hinh:
    constants-cell
    phat: intangible.recognised, intangible.amortised

Nguyen tac bat bien: moi transaction co entity_id + period + amount + currency.
Khong bu tru tai san va no. Thong tin so sanh ky truoc bat buoc.

---

## §11. QUY TAC KHONG DUOC PHA

- Khong update event sau committed
- Khong sua ledger truc tiep
- Khong bypass reconciliation
- Khong ky khi lech (mismatch)
- Khong lock period khi chua PASS audit
- Khong override signature — gay ngay
- Cells KHONG goi nhau truc tiep — chi qua EventBus (Dieu 4 Hien Phap)

---

**Natt Sirawat - Phan Thanh Thuong - Gatekeeper**
Ngay ban hanh: 2026-04-09 - Hieu luc ngay lap tuc
