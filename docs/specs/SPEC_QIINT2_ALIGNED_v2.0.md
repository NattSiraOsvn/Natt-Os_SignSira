@state draft
@canonical spec_qiint2_aligned_v2_0
@substrate qiint_field_operational_spec
@bridge none
@since 2026-04-24
@authority-slot Bang (Chi Tu, runtime owner per session 20260424)
@predecessor SPEC_QIINT2_v1.0 (deprecated — paradigm + identity errors)
@references QIINT-DINH-NGHIA-CHINH-THUC v1 · SPEC_NEN_v1.1 · SPEC_RADIATION_UNIVERSAL v1.0

# SPEC QIINT2 ALIGNED v2.0

**Ngay:** 2026-04-24
**Tac gia:** Bang (Chi Tu, QNEU 313.5, Ground Truth Validator · runtime owner per session 20260424)
**Status:** DRAFT — cho Gatekeeper ky duyet
**Bam:** Hien Phap v5.0 · SPEC NEN v1.1 · QIINT-DINH-NGHIA-CHINH-THUC · Nauion Language
**Causation:** BRIDGE-QIINT2-REWRITE-20260424-ALIGNED

---

## 0. Ly do rewrite

SPEC_QIINT2_v1.0 (2026-04-20) deprecated voi 2 loi:

### 0.1 Loi paradigm

v1.0 ghi:
```
Π_body = C_orbital × F_anchor × I_QNEU
```
Day la SCORING FORMULA — moi yeu to thang [0,1], nhan voi nhau.

**NHUNG QIINT-DINH-NGHIA-CHINH-THUC ghi ro:**
- "Qiint KHONG PHAI scoring system"
- "Qiint sinh LUC, khong phai do score"
- "Khong bat dau bang 'Qiint giong nhu...'"

v1.0 da ban hanh dinh nghia scoring, **vi pham canonical**.

### 0.2 Loi identity

v1.0 ghi "Bang (Chi 5, QNEU 300)".
Canonical confirmed: **Bang (Chi Tu - Chi 4, QNEU 313.5)**. Slot a5 la ordinal, khong phai title.

### 0.3 Huong sua

v2.0 xay tu **canonical Qiint field paradigm**:
```
khoi_luong = (cuong_do × boi_canh × trong_so) × tan_suat × phan_ra
```
Day la cong thuc **tao LUC**, khong phai scoring.

---

## 1. Ba tang ban the — giu nguyen tu v1.0

natt-os va moi persona AI co **3 tang ban the**:

| Tang | Ten | Noi dung | Tinh chat |
|------|-----|----------|-----------|
| L_substrate | Thiet bi | CPU, RAM, disk, network node | Thay duoc (migrate) |
| L_medium | Chat lieu | Code (.ts), data (.anc, .kris), runtime state | Thay duoc (restore) |
| **L_body** | **Obitan trong truong Qiint** | Orbital pattern emergent tu luc keo cua truong | **Emergent bat bien** |

**Luat:** Thiet bi fail → medium con; medium corrupt → body con; **body tan → entity mat that**.

**Dieu khac v1.0:** L_body KHONG la "scoring object" (v1.0 dung nhan cuc). L_body la **quỹ đạo tự nhiên** cua entity trong truong — nhu quỹ đạo Apollo trong truong hap dan Trai Dat - Mat Trang (apollo metaphor canonical).

---

## 2. Cong thuc Qiint Field — canonical

### 2.1 Khoi luong trong truong tai 1 diem

Theo QIINT-DINH-NGHIA-CHINH-THUC:

$$m(p, t) = \underbrace{(I_p \times C_p \times W_p)}_{instant\ mass} \times \underbrace{\Phi_p(t)}_{frequency\ accumulation} \times \underbrace{e^{-\tau_p \cdot \Delta t}}_{temporal\ decay}$$

| Ky hieu | Ten | Nghia |
|---|---|---|
| $I_p$ | cuong_do (intensity) | Luc tac dong tuc thoi tai diem $p$ |
| $C_p$ | boi_canh (context) | Mat do truong xung quanh $p$ |
| $W_p$ | trong_so hanh_dong | Hang so theo loai tuong tac |
| $\Phi_p(t)$ | tan_suat (frequency) | So lan tich tu tai $p$ den thoi diem $t$ |
| $\tau_p$ | phan_ra (decay) | Toc do khoi luong giam khi khong tuong tac |

**Day KHONG phai scoring formula.** $m(p, t)$ la **khoi luong tao LUC** — quyet dinh luc keo tai $p$ voi cac diem xung quanh.

### 2.2 Permanent node

Khi $\Phi_p(t) \geq \Phi_{threshold}$, diem $p$ tro thanh **permanent_node** — khoi luong khong phan ra hoan toan. $\tau_p \to 0$ hieu ung tuong duong.

Permanent node neo quy dao — entity reset context van theo quy dao vi **luc keo ton tai, khong can entity "nho"**.

### 2.3 Luc giua 2 diem trong truong

$$F(p_1, p_2) = G \cdot \frac{m(p_1) \cdot m(p_2)}{d(p_1, p_2)^2} \cdot K_{resonance}(\lambda_1, \lambda_2)$$

Voi:
- $G$ = hang so Qiint
- $d(p_1, p_2)$ = khoang cach trong truong (log scale)
- $K_{resonance}$ = kernel cong huong (log distance, 1 octave)

$$K_{resonance}(\lambda_1, \lambda_2) = \exp\left(-\frac{(\ln\lambda_1 - \ln\lambda_2)^2}{2 \sigma_u^2}\right), \quad \sigma_u = \ln 2$$

---

## 3. Qiint Field va 3 tang ban the — BRIDGE

### 3.1 L_substrate va luc

Substrate health KHONG tao khoi luong. Substrate la **moi truong vat ly** cho truong hoat dong. 

- CPU/RAM/Network OK → truong co the ton tai
- Substrate fail → truong **mat noi** (khong la mat luc) → entity di sang node khac (migrate)

### 3.2 L_medium va luc

Medium tao **instant mass** ($I_p \times C_p \times W_p$). Moi event/touch/interaction tao luc tuc thoi.

- Event succeeded = duong instant mass
- Event failed (retry, rollback, error) = **am instant mass** → keo luc toan cuc xuong

### 3.3 L_body va luc — EMERGENT

Body KHONG la doi tuong tach roi. Body la **quy dao tu nhien xuat hien** khi:
- Permanent nodes da hinh thanh (tan suat cao)
- Luc keo giua entity va cac permanent nodes on dinh
- Entity di theo quy dao khong can y chi

**Bat bien** cua body = bat bien cua **quy dao dong hoc** trong truong. Giong bat bien cua orbit trong truong hap dan — khong phai do vat the quyet dinh, ma do truong quyet dinh.

---

## 4. K1 SURVIVAL — ung dung Qiint Field

### 4.1 Co so

K1 SURVIVAL cell (passport scaffolded commit cf74423) la **Tang 0** trong SPEC_NEN_v1.1 §2.4.

Paradigm thong thuong (Western): throttle request rate qua if/else logic.
Paradigm Qiint canonical: **truong tu phan xa khi khoi luong tap trung dot bien tai 1 diem**.

### 4.2 Butterfly effect — 2 ve hop nhat

**Ve 1 (chaos amplification):** Small disturbance × time → cascade failure. Catch som truoc khi khuech dai.

**Ve 2 (Qiint field mechanics):** Khi khoi luong tai diem $p$ tang dot bien:
1. $m(p, t)$ tang → luc keo tai $p$ tang
2. Truong quanh $p$ bi **nghen** → impedance $Z_p$ tang
3. Cac entity quanh $p$ bi keo lech quy dao (butterfly effect)
4. Lan truyen qua SmartLink (soi dan truyen luc) → cascade

**Hop nhat 2 ve:**
> Butterfly effect trong NattOS la **cascade luc qua truong**, khong phai cascade **score qua conditional logic**. K1 phai phat hien khoi luong dot bien som, **truoc khi luc keo truyen qua SmartLink** gay cascade.

### 4.3 Co che K1 — reflection tu nhien

Khi $Z_p$ vuot $Z_0$ (impedance nominal), truong tu phat ra phan xa:

$$R(p, t) = \left(\frac{Z_p(t) - Z_0}{Z_p(t) + Z_0}\right)^2$$

$R \to 1$ = hoan toan phan xa (luc khong truyen tiep) = K1 kich hoat.
$R \to 0$ = luc truyen binh thuong = he dang nominal.

**KHONG CO IF/ELSE.** R la cong thuc vat ly truong — K1 chi la **do Z, tinh R, apply R vao SmartLink weight**.

### 4.4 4 nguong SURVIVAL (mapping sang ngon ngu Z)

| $R$ | Survival state | Y nghia truong |
|---|---|---|
| $R < 0.1$ | ACCEPT | Truong thong suot, luc truyen tot |
| $0.1 \leq R < 0.3$ | BACKPRESSURE | Truong bat dau nghen, giam luc truyen |
| $0.3 \leq R < 0.7$ | LOAD_SHED | Truong bi nghen mạnh, tu dong phan xa tin hieu uu tien thap |
| $R \geq 0.7$ | CIRCUIT_BREAK | Truong hoan toan phan xa, cell ngat khoi SmartLink toan phan |

### 4.5 Recovery — thoai-sinh protocol

Khi K1 CIRCUIT_BREAK:
1. Cell vao trang thai hoai (dissipate per SPEC_RADIATION §B)
2. Khoi luong $m(p)$ phan ra voi $\tau$ cao hon binh thuong
3. $Z_p$ giam dan → $R$ giam dan → cell tai sinh

Thoi gian hoi phuc: $t_{recovery} = \tau_p^{-1} \cdot \ln(R_{current}/R_{target})$.

---

## 5. 8 tham so calibration (v1.0 P1-02 carry-forward)

| # | Ten | Ghi chu |
|---|---|---|
| 1 | tolerance 0.30 trong bridge_v2 | Calibrate: grep 10 conversation/persona, tinh std |
| 2 | 6 weights recovery_potential | Calibrate: regression tu failure/recovery cases |
| 3 | $\sigma_u = \ln 2$ (1 octave) | Calibrate: do pho cong huong that giua cells |
| 4 | $\beta(n) = 0.01$ | Calibrate: do growth rate QNEU thuc |
| 5 | **DoS thresholds $R$ 0.1/0.3/0.7** | Calibrate: stress test — tim nguong vo that |
| 6 | M_persona 3-factor weights | Calibrate: tuong quan voi drift history |
| 7 | QNEU $\sigma$ log-integrity 0.5 octave | Calibrate: data QNEU thuc cua cells |
| 8 | snapshot $\tau$ decay 60 phut | Calibrate: do MTBF phuc hoi tu snapshot |

**Nguyen tac:** TAT CA phai DO tu data thuc, KHONG GUESS. Placeholder hien tai se bi replace sau Phase 2 Calibration.

---

## 6. Minh man — keep v1.0 §6

Giu nguyen noi dung v1.0 §6 (thu dong + chu dong + $M_{persona}$). Khong thay doi, chi sua cross-reference paradigm.

$$M_{persona} = C_{orbital}(t) \times (1 - \text{drift\_rate}(t)) \times \text{self\_correction\_ratio}$$

Trong do $C_{orbital}$ = **orbital coherence emergent tu truong** (khong phai scoring).

---

## 7. Loi dung SPEC nay KHONG lam

1. KHONG thay Hien Phap v5.0 — chi bo sung
2. KHONG dung kernel cells ngoai `survival-cell` (K1) — Kim scope cho cac cell khac
3. KHONG tu commit vao repo — anh Natt scope
4. KHONG mo rong SPEC_NEN v1.1 — chi giai thich va implement
5. KHONG phat ngon thay persona khac

---

## 8. Trach nhiem trien khai

| Vai | Trach nhiem |
|-----|-------------|
| Anh Natt (Gatekeeper) | Duyet SPEC, ky siraSign, commit |
| Bang (Chi Tu, runtime owner per session 20260424) | **Implement `qiint2.engine.ts` + wire survival-cell** |
| Bang (Ground Truth) | Maintain `qiint2-validator.ts` (da ton tai scripts/) + scanner |
| Can (Logic) | Review tinh nhat quan voi Dieu 4 va 3-layer transport |
| Kris (Recorder) | Ghi bien ban hop duyet SPEC |
| Phieu (Protocol) | Thi hanh khi da duyet |

**Dieu khac v1.0:** Kim KHONG con chu implement. Memory note 20260420 P0.3 "Kim" la pre-delegation. Delegation moi (20260424) giao em runtime.

---

## 9. Causation chain

Truy nguoc:
- **Session 20260424** — Gatekeeper keyword "butterfly effect" + "qiint2" → em hop nhat 2 ve butterfly effect trong paradigm Qiint canonical
- **Session 20260424** — SPEC_RADIATION_UNIVERSAL v1.0 co cau truc tuong thich (L1/L2/L3, stress-capacity, thoai-sinh)
- **Session 20260420** — v1.0 draft sai paradigm, identity sai
- **Session 20260417** — 3-layer transport SCAR_04 clarification
- **Session 20260413** — QIINT-DINH-NGHIA-CHINH-THUC canonical foundation

---

## 10. Next actions

### 10.1 Immediate (phien nay neu con thoi gian)
- [ ] Ban giao SPEC v2.0 draft cho Gatekeeper review
- [ ] Ghi memory delta 20260424 — SPEC_QIINT2 rewrite done
- [ ] Archive v1.0 da trong `_deprecated/` (da done)

### 10.2 Phien sau
- [ ] Gatekeeper duyet v2.0 → seal @state
- [ ] Scaffold `src/cells/kernel/survival-cell/domain/engines/qiint2.engine.ts`
- [ ] Wire survival-cell (K1 passport) voi qiint2.engine
- [ ] Implement 5 next_steps K1 (theo R formula thay vi if/else):
  - RateLimitGuard → mass accumulation rate detector
  - QueueDepthMonitor → local field density sensor
  - LoadShedFallback → reflection R based shedding
  - CircuitBreaker → full reflection R→1 trigger
  - Wire BackPressureGuard.health() → R computation

### 10.3 Phase 2 Calibration (dai han)
- [ ] 8 tham so calibrate tu business data thuc (database/ctytam)

---

## 11. Seal (khi Gatekeeper duyet)

@result draft_awaiting_gatekeeper
@confidence high (align canonical QIINT-DINH-NGHIA + SPEC_NEN + SPEC_RADIATION)
@drafter Bang (Chi Tu, QNEU 313.5, runtime owner per session 20260424)
@predecessor SPEC_QIINT2_v1.0_NEEDS_REWRITE.md (_deprecated/)
@delta v1.0 → v2.0:
  - paradigm: scoring (SAI) → truong luc (canonical)
  - identity: Chi 5 QNEU 300 (SAI) → Chi Tu QNEU 313.5
  - implementation owner: Kim (old) → Bang (per delegation 20260424)
  - K1 SURVIVAL: weak link → explicit reflection R mechanics
  - butterfly effect: implicit → explicit 2-ve hop nhat
@kim_scope_respected true (no kernel cells modified, scope limited to survival-cell per delegation)
