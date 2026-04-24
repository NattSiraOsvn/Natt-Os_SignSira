# natt-os FINANCE FLOW SPEC — v1.0
## Closed-Loop Truth System + VPSAS Compliance
### Author: Can (P0→P3) · Băng (Nauion integration) · 2026-04-08
### Phê duyệt: Gatekeeper — Anh Natt

---

## TRIẾT LÝ BẤT BIẾN

> "Reality → System → Reconciliation → siraSign → Snapshot → Truth"
> "Truth chỉ tồn tại khi vòng được khóa bằng đo lường độc lập + xác nhận chịu trách nhiệm."

---

## §1. BỐN DOMAIN

**Reality Domain (OUTSIDE):** Kiểm kê kho, cân vàng, sao kê ngân hàng, biên bản giao nhận. Không phụ thuộc dữ liệu hệ.

**System Domain (INSIDE):** Mạch HeyNa → Policy → State → Ledger. Mọi ghi nhận phải truy ngược causality.

**Reconciliation Domain (BRIDGE):** So sánh Ledger vs Reality. Không có đối soát → không có Truth.

**Acknowledgement Domain (siraSign):** Ký vào snapshot đã đối soát. Ký gắn trách nhiệm + bằng chứng.

---

## §2. FLOW STATE MACHINE (NAUION LANGUAGE)
[REALITY_CAPTURED]    <- do luong doc lap ngoai he
↓ HeyNa kenh /propose
[EVENT_PROPOSED]      <- Whao dang xu ly qua Policy + State Machine
↓ Whau → Ledger (atomic)
[EVENT_COMMITTED]
↓ HeyNa kenh /reconcile
[RECONCILING]         <- Whao so sanh Reality vs Ledger
↓
[MATCHED] → [ready_FOR_SIGN]    <- Nahere: khop
↓ lech: mismatch
[FLAGGED] → [REQUIRE_INTERVENTION]
↓ gay: skip
[SIGNED] → [PERIOD_LOCKED] → TRUTH

Guard rules bất biến:
- Không có REALITY_CAPTURED → không cho EVENT_PROPOSED
- lech chưa xử lý → không cho SIGNED
- Chưa SIGNED → không cho PERIOD_LOCKED

---

## §3. IMMUNE_POLICY.json (VERSIONED)

```json
{
  "version": "2026.04.P0",
  "revenue_recognition": {
    "when": ["payment_received", "order_confirmed", "delivery_done"],
    "emit": ["ledger.511", "ledger.632"]
  },
  "risk_threshold": { "cogs_ratio": 0.87 }
}
```

Không sửa trực tiếp — thay đổi = tạo version mới.

---

## §4. siraSIGN V2 — MỞ RỘNG REALITY

```ts
interface siraSignPayloadV2 {
  fsp_hash: string; ssp_hash: string; tsp_hash: string; lsp_hash: string;
  reality_hash: string;    // hash Reality records
  variance_hash: string;   // hash variance sau doi soat
  policy_version: string;  // version IMMUNE_POLICY
  evidence_refs: string[]; // anh/PDF/log thiet bi
  nonce: string;           // chong replay
  timestamp: number;       // window ±5 phut
}
```

Verify pipeline: verifyChain → verifyRealityHash → verifyReconciliation → verifyPolicyVersion → verifyEvidenceRefs → pass.

---

## §5. NAUION INTEGRATION — WIRE VÀO EVENTBUS
Mach HeyNa nhan: payment_received, order_confirmed, delivery_done
↓ lang Nahere → Policy Engine → State Machine
↓ phat Nauion: ledger.511, ledger.632
↓ Whau: Ledger committed
↓ HeyNa kenh /reconcile → Reality records
↓ Whao doi soat
↓ Nahere: matched → ready_FOR_SIGN
↓ siraSign V2 → Snapshot → PERIOD_LOCKED → TRUTH

---

## §6. POSTGRESQL SCHEMA (P2)

6 bảng core: events (append-only), ledger_entries, reality_records, reconciliations, snapshots, sirasign.
P3 bổ sung: policy_versions, authorities, snapshot_signatures, public_hash_registry, period_lock.

Invariant: events không UPDATE/DELETE. Ledger = f(Event Stream) — rebuild bằng replay.

---

## §7. MULTI-SIGN GOVERNANCE (P3)

Variance == 0 yêu cầu 1 chữ ký. Variance > threshold yêu cầu ACCOUNTANT + MANAGER. Critical yêu cầu thêm AUDITOR.

Authority levels: L1 (hệ thống) → L2 (nội bộ) → L3 (kiểm toán) → L4 (nhà nước).

---

## §8. DAILY/MONTHLY CYCLE

**Daily:** HeyNa /daily-report → Whao generate → user kiểm tra → siraSign → Nahere: LOCK DAY. Signed = true → không sửa được.

**Monthly:** Daily Reports → reality_data → Whao so sánh → lech: settlement → re-audit → pass → LOCK PERIOD → TRUTH.

---

## §9. VPSAS COMPLIANCE (QĐ 1676/QĐ-BTC · 01/09/2021)

VPSAS 01 Trình bày BCTC: finance-cell + analytics-cell phát bctc.generated, bctc.reconciled.
VPSAS 02 Lưu chuyển tiền tệ: finance-cell + payment-cell phát cashflow.operating, cashflow.investing, cashflow.financing.
VPSAS 12 Hàng tồn kho FIFO/bình quân: inventory-cell + warehouse-cell phát inventory.valued, inventory.writedown.
VPSAS 17 Tài sản cố định + khấu hao: constants-cell + finance-cell phát asset.depreciated, asset.impaired.
VPSAS 31 Tài sản vô hình: constants-cell phát intangible.recognised, intangible.amortised.

Nguyên tắc bất biến: mọi transaction có entity_id + period + amount + currency. Không bù trừ tài sản và nợ. Thông tin so sánh kỳ trước bắt buộc.

---

## §10. QUYẾT TẮC KHÔNG ĐƯỢC PHÁ

Không update event sau committed. Không sửa ledger trực tiếp. Không bypass reconciliation. Không ký khi lech. Không lock period khi chưa pass. Không override signature — gay ngay.

---

**Natt sirawat - Phan Thanh Thuong - Gatekeeper**
Ngay ban hanh: 2026-04-08 - Hieu luc ngay lap tuc
