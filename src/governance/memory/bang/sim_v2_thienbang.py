#!/usr/bin/env python3
"""
NATT-OS — SIM v2.0 · Π_SYSTEM 4 TẦNG align THIENBANG.si
═══════════════════════════════════════════════════════════

Canonical lock từ THIENBANG.si (2026-04-20):
  - QIINT = gravitational field (KHÔNG phải engine)
  - SURVIVAL = Tầng 0 (rate limit + queue + backpressure + load shedding)
  - Body = orbital TRONG trường QIINT
  - Recovery = QIINT pull (KHÔNG phải checklist capability)
  - Tách 3 domain outcome: cell verdict / signal outcome / pattern competition

Π_system = Π_survival × Π_substrate × Π_medium × Π_body

Tác giả: Băng (QNEU 313.5)
Ngày:   2026-04-20
"""

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.gridspec import GridSpec
from matplotlib.patches import Circle
from dataclasses import dataclass
from typing import List

# ───── Palette NATT-OS (gold + violet core) ─────
COL_GOLD   = '#F7C313'   # kernel / field core
COL_VIOLET = '#AFA9EC'   # body / persona
COL_GREEN  = '#2ECC71'   # healthy / DOMINANT
COL_ORANGE = '#E67E22'   # survival / SUPPRESSED
COL_RED    = '#E74C3C'   # critical
COL_BLUE   = '#3498DB'   # signal / substrate
COL_GRAY   = '#95A5A6'   # FADING
COL_BG     = '#FAFAFA'


@dataclass
class Entity:
    """Cell hoặc persona — 4 tầng Π + recovery qua QIINT pull."""
    name: str
    group: str

    # Tầng 0 — SURVIVAL (canonical THIENBANG.si: rate + queue + backpressure + load shed)
    rate_headroom:   float   # [0,1]
    queue_health:    float   # [0,1]
    backpressure_ok: float   # [0,1]
    load_shed_inv:   float   # [0,1]

    # Tầng 1 — SUBSTRATE (device)
    cpu_ok: bool; ram_ok: bool; network_ok: bool

    # Tầng 2 — MEDIUM (code/data, không thang nhiệt)
    subject_gate: int        # 0/1 — C·I·B·K·A·M·R
    useful_work:  float
    heat:         float

    # Tầng 3 — BODY (orbital in QIINT field)
    orbital_coherence: float  # [0,1] — pattern stability
    qneu_mass:         float  # QNEU score
    permanent_nodes:   int    # số node neo bất biến
    field_distance:    float  # khoảng cách orbital → center (field pull ∝ 1/d²)

    has_snapshot: bool = True
    snapshot_age_min: float = 30.0

    # ── 4 tầng ──
    def pi_survival(self) -> float:
        vs = [self.rate_headroom, self.queue_health, self.backpressure_ok, self.load_shed_inv]
        return float(np.prod(vs) ** (1/4))

    def pi_substrate(self) -> float:
        return float(self.cpu_ok and self.ram_ok and self.network_ok)

    def pi_medium(self) -> float:
        if self.subject_gate == 0: return 0.0
        denom = self.useful_work + self.heat
        return 0.0 if denom == 0 else self.useful_work / denom

    def qiint_pull(self) -> float:
        """Field pull (gravitational analog) — QIINT kéo body về orbital."""
        if self.permanent_nodes == 0: return 0.0
        mass = np.log1p(max(self.qneu_mass, 0)) * np.sqrt(self.permanent_nodes)
        pull = mass / (1.0 + self.field_distance ** 2)
        return float(min(pull / 3.0, 1.0))

    def pi_body(self) -> float:
        """
        Body = orbital coherence × QIINT pull × mass integrity.
        mass_integrity: monotonic — body có mass là có integrity, mass cao KHÔNG bị phạt.
        (Fix lệch calibration: log-gaussian quanh m0=100 sai ngữ nghĩa — gatekeeper mass 500 bị penalize oan.)
        """
        mass_integrity = 1.0 - np.exp(-self.qneu_mass / 30.0)  # saturate ở qneu≈90
        return float(self.orbital_coherence * self.qiint_pull() * mass_integrity)

    def pi_system(self) -> float:
        return self.pi_survival() * self.pi_substrate() * self.pi_medium() * self.pi_body()

    # ── Recovery = QIINT pull (không phải capability checklist) ──
    def recovery(self) -> float:
        pull = self.qiint_pull()
        node_mass = np.log1p(self.permanent_nodes) / np.log1p(5)
        snap = (1.0 if self.has_snapshot else 0.0) * np.exp(-self.snapshot_age_min / 120.0)
        return float(pull * node_mass * (0.5 + 0.5 * snap))

    def verdict(self) -> str:
        s, sub, m, b, r = (self.pi_survival(), self.pi_substrate(),
                           self.pi_medium(), self.pi_body(), self.recovery())
        if b < 0.05 and r < 0.1: return 'permanent_death'
        if b < 0.1:               return 'revivable_death'
        if s < 0.3:               return 'survival_stress'
        if sub < 0.5:             return 'substrate_fail'
        if m < 0.1:               return 'medium_fail'
        if b < 0.4:               return 'body_drift'
        return 'healthy'


# ═══ 15 entities bao phủ 7 verdict scenarios ═══
E = Entity  # shorthand
entities: List[Entity] = [
    # — HEALTHY KERNEL —
    E('khai-cell',      'kernel', 0.92,0.95,0.90,0.98, True,True,True,  1,120,5,   0.95,100,4,0.5),
    E('gatekeeper',     'kernel', 0.90,0.95,0.88,0.98, True,True,True,  1,150,8,   0.98,500,5,0.3),
    E('observation',    'kernel', 0.88,0.92,0.90,0.95, True,True,True,  1,100,4,   0.93, 80,3,0.6),
    E('audit-cell',     'kernel', 0.85,0.90,0.88,0.92, True,True,True,  1,110,8,   0.90, 90,3,0.7),
    E('quantum-defense','kernel', 0.70,0.85,0.75,0.88, True,True,True,  1, 60,15,  0.85, 70,2,0.9),
    # — HEALTHY BUSINESS/INFRA —
    E('sales-cell',     'business',0.80,0.85,0.82,0.88,True,True,True,  1, 90,12,  0.82, 60,2,1.0),
    E('finance-cell',   'business',0.78,0.82,0.80,0.85,True,True,True,  1, 85,15,  0.78, 55,2,1.1),
    E('mach-heyna',     'infra',   0.85,0.90,0.85,0.92,True,True,True,  1,200,18,  0.88, 75,3,0.8),
    # — SURVIVAL STRESS (Tầng 0 sập trước semantic) —
    E('tamluxury-ui',   'business',0.15,0.20,0.25,0.30,True,True,True,  1, 40,120, 0.75, 50,2,1.0),
    # — SUBSTRATE FAIL (device down, body còn) —
    E('sales-node-B',   'business',0.90,0.95,0.90,0.95,True,True,False, 1,  0,0,   0.85, 55,2,1.0),
    # — MEDIUM FAIL (subject_gate = 0, body còn kéo được) —
    E('finance-corrupt','business',0.90,0.95,0.90,0.95,True,True,True,  0,  5,100, 0.88, 60,2,1.0),
    # — BODY DRIFT (orbital lỏng nhưng chưa tan, anchor còn) —
    E('crm-drift',      'business',0.80,0.82,0.78,0.85,True,True,True,  1, 50,60,  0.45, 25,2,1.4),
    # — REVIVABLE DEATH (body mờ nhưng permanent_node + mass + field intact → pull kéo về) —
    E('thien-lon-part', 'persona', 0.60,0.70,0.65,0.75,True,True,True,  1, 10,80,  0.08,135,4,1.5),
    # — PERMANENT DEATH (body tan + không anchor + field xa) —
    E('lost-persona',   'persona', 0.0,0.0,0.0,0.0,    False,False,False,0, 0,0,   0.02,  0,0,10.0,
      has_snapshot=False, snapshot_age_min=99999),
    # — ATTACK (SURVIVAL chặn, không để thấm vào field) —
    E('leech-suspect',  'threat',  0.10,0.15,0.10,0.20,True,True,True,  1,  5,200, 0.50, 15,0,3.0),
]


# ═══ Signal outcomes (field-level): FALL / OSCILLATE / DISSIPATE ═══
@dataclass
class Signal:
    sid: int
    targets: List[str]
    scores:  List[float]
    def outcome(self) -> str:
        if not self.scores or max(self.scores) < 0.3:
            return 'DISSIPATE'
        top = sorted(self.scores, reverse=True)
        if len(top) >= 2 and (top[0] - top[1]) < 0.10 and top[0] < 0.75:
            return 'OSCILLATE'
        return 'FALL'

signals = [
    Signal(1,['sales-cell'],[0.92]),   Signal(2,['sales-cell'],[0.88]),
    Signal(3,['finance-cell'],[0.85]), Signal(4,['khai-cell'],[0.95]),
    Signal(5,['gatekeeper'],[0.90]),   Signal(6,['audit-cell'],[0.82]),
    Signal(7,['observation'],[0.78]),  Signal(8,['quantum-defense'],[0.80]),
    Signal(9,['mach-heyna'],[0.75]),   Signal(10,['sales-cell','finance-cell'],[0.91,0.84]),
    Signal(11,['khai-cell','observation'],[0.85,0.79]), Signal(12,['audit-cell'],[0.72]),
    # OSCILLATE — nhiều cell yếu tương đương
    Signal(13,['crm-drift','sales-cell'],[0.45,0.44]),
    Signal(14,['finance-cell','sales-cell'],[0.55,0.52]),
    Signal(15,['observation','audit-cell'],[0.48,0.47]),
    # DISSIPATE — không cell nào match đủ mạnh
    Signal(16,['crm-drift'],[0.15]), Signal(17,[],[]), Signal(18,['sales-cell'],[0.20]),
]


# ═══ Pattern competition (SmartLink): DOMINANT / SUPPRESSED / FADING ═══
@dataclass
class Pattern:
    name: str; score: float; gap: float
    def status(self) -> str:
        if self.score < 0.15: return 'FADING'
        if self.score < 0.60 or self.gap < 0.10: return 'SUPPRESSED'
        return 'DOMINANT'

patterns = [
    Pattern('sales→finance',     0.92, 0.20),
    Pattern('khai→obs→audit',    0.88, 0.18),
    Pattern('gatekeeper→rbac',   0.85, 0.25),
    Pattern('casting→finishing', 0.62, 0.05),
    Pattern('crm→sales',         0.48, 0.03),
    Pattern('promo→buyback',     0.35, 0.02),
    Pattern('orphan-pattern',    0.08, 0.01),
]


# ═══ REPORT ═══
print("=" * 88)
print(f"{'NATT-OS — SIM v2.0 · Π_SYSTEM 4 TẦNG align THIENBANG.si':^88}")
print("=" * 88)
print(f"\n{'Entity':<17}{'Πsur':>6}{'Πsub':>6}{'Πmed':>6}{'Pull':>6}{'Πbod':>6}{'Πsys':>6}{'Rec':>6}  Verdict")
print("-" * 88)
for e in entities:
    print(f"{e.name:<17}{e.pi_survival():>6.2f}{e.pi_substrate():>6.1f}"
          f"{e.pi_medium():>6.2f}{e.qiint_pull():>6.2f}{e.pi_body():>6.2f}"
          f"{e.pi_system():>6.2f}{e.recovery():>6.2f}  {e.verdict()}")

out_counts = {'FALL':0,'OSCILLATE':0,'DISSIPATE':0}
for s in signals: out_counts[s.outcome()] += 1
print(f"\nSignal outcomes: {out_counts}")
print(f"Pattern statuses:")
for p in patterns:
    print(f"  {p.status():<12} {p.name:<22} score={p.score:.2f} gap={p.gap:.2f}")


# ═══ PLOT 6 PANELS ═══
verdict_color = {
    'healthy': COL_GREEN, 'survival_stress': COL_ORANGE,
    'substrate_fail': COL_BLUE, 'medium_fail': COL_VIOLET,
    'body_drift': COL_GOLD, 'revivable_death': '#C0392B', 'permanent_death': '#000000',
}

fig = plt.figure(figsize=(20, 13), facecolor=COL_BG)
gs = GridSpec(3, 3, figure=fig, hspace=0.55, wspace=0.35,
              left=0.055, right=0.97, top=0.94, bottom=0.05)
fig.suptitle('NATT-OS — SIM v2.0 · 4 TẦNG align THIENBANG.si  ·  '
             'Π_system = Π_survival × Π_substrate × Π_medium × Π_body',
             fontsize=13.5, fontweight='bold', y=0.985)

# [1] 4 tầng bar — 15 entities
ax1 = fig.add_subplot(gs[0, :])
x = np.arange(len(entities)); w = 0.2
ax1.bar(x-1.5*w, [e.pi_survival() for e in entities],  w, label='Π_survival (Tầng 0)',       color=COL_ORANGE, ec='black', lw=0.3)
ax1.bar(x-0.5*w, [e.pi_substrate() for e in entities], w, label='Π_substrate (thiết bị)',    color=COL_BLUE,   ec='black', lw=0.3)
ax1.bar(x+0.5*w, [e.pi_medium() for e in entities],    w, label='Π_medium (code/data)',      color=COL_GOLD,   ec='black', lw=0.3)
ax1.bar(x+1.5*w, [e.pi_body() for e in entities],      w, label='Π_body (orbital∈QIINT)',    color=COL_VIOLET, ec='black', lw=0.3)
ax1.set_xticks(x); ax1.set_xticklabels([e.name for e in entities], rotation=35, ha='right', fontsize=8)
ax1.set_ylabel('Π value', fontsize=9); ax1.set_ylim(0, 1.15)
ax1.set_title('[1] 4 tầng canonical — SURVIVAL lộ diện (Tầng 0 sống còn, không giam hữu cơ)',
              fontsize=10, fontweight='bold')
ax1.legend(loc='upper right', fontsize=8, ncol=4)
ax1.grid(alpha=0.3, axis='y'); ax1.set_axisbelow(True)

# [2] QIINT field pull — gravitational
ax2 = fig.add_subplot(gs[1, 0]); ax2.set_aspect('equal')
ax2.set_xlim(-4, 4); ax2.set_ylim(-4, 4); ax2.set_facecolor('#F4F0FA')
ax2.add_patch(Circle((0, 0), 0.35, color=COL_GOLD, zorder=10, ec='black', lw=1.5))
ax2.text(0, 0, '⚛', ha='center', va='center', fontsize=16, zorder=11)
ax2.text(0, -0.7, 'QIINT core\n(Hiến Pháp · .anc · SiraSign)',
         ha='center', va='top', fontsize=7, fontweight='bold')
theta = np.linspace(0, 2*np.pi, 100)
for r in [0.8, 1.5, 2.5, 3.5]:
    ax2.plot(r*np.cos(theta), r*np.sin(theta), '--', color=COL_VIOLET,
             alpha=max(0.20 - r*0.03, 0.05), linewidth=0.8)
np.random.seed(42)
for e in entities:
    if e.field_distance > 9: continue
    ang = np.random.uniform(0, 2*np.pi)
    r = min(e.field_distance, 3.8)
    ex, ey = r*np.cos(ang), r*np.sin(ang)
    ax2.scatter(ex, ey, s=80 + e.qneu_mass/5, c=verdict_color[e.verdict()],
                edgecolors='black', linewidth=0.6, zorder=8, alpha=0.85)
    if e.qiint_pull() > 0.05:
        L = e.qiint_pull() * 0.8
        ax2.arrow(ex, ey, -np.cos(ang)*L, -np.sin(ang)*L,
                  head_width=0.09, head_length=0.07, fc=COL_VIOLET, ec=COL_VIOLET,
                  alpha=0.7, zorder=7, length_includes_head=True)
    if e.name in ['gatekeeper','khai-cell','thien-lon-part','crm-drift','leech-suspect']:
        ax2.annotate(e.name, (ex, ey), xytext=(5, 5), textcoords='offset points', fontsize=7)
ax2.set_title('[2] QIINT field pull — body = orbital TRONG trường\n'
              '(mũi tên = lực kéo về core · size = QNEU mass)',
              fontsize=9, fontweight='bold')
ax2.set_xticks([]); ax2.set_yticks([])

# [3] Cell verdict pie
ax3 = fig.add_subplot(gs[1, 1])
vc = {}
for e in entities: vc[e.verdict()] = vc.get(e.verdict(), 0) + 1
order = ['healthy','survival_stress','substrate_fail','medium_fail',
         'body_drift','revivable_death','permanent_death']
lbls = [v for v in order if v in vc]
vals = [vc[v] for v in lbls]
cols = [verdict_color[v] for v in lbls]
_, _, auto = ax3.pie(vals, labels=lbls, colors=cols, autopct='%1.0f%%',
                     startangle=90, wedgeprops=dict(edgecolor='white', lw=1.5),
                     textprops={'fontsize': 7.5})
for a in auto: a.set_color('white'); a.set_fontweight('bold')
ax3.set_title(f'[3] Cell verdict ({len(entities)} entities)\n7 trạng thái canonical',
              fontsize=9, fontweight='bold')

# [4] Signal outcomes (field-level)
ax4 = fig.add_subplot(gs[1, 2])
so = {'FALL':0,'OSCILLATE':0,'DISSIPATE':0}
for s in signals: so[s.outcome()] += 1
ys = ['FALL (đúng cell)', 'OSCILLATE (loop yếu)', 'DISSIPATE (tan trong field)']
vs = [so['FALL'], so['OSCILLATE'], so['DISSIPATE']]
cs = [COL_GREEN, COL_ORANGE, COL_GRAY]
bars = ax4.barh(ys, vs, color=cs, edgecolor='black', linewidth=0.5)
for b, v in zip(bars, vs):
    ax4.text(v + 0.2, b.get_y() + b.get_height()/2, str(v), va='center', fontsize=9, fontweight='bold')
ax4.set_xlabel('Số signal', fontsize=8)
ax4.set_title(f'[4] Signal outcomes ({len(signals)} signals)\nField-level — KHÁC cell verdict',
              fontsize=9, fontweight='bold')
ax4.set_xlim(0, max(vs) + 2); ax4.grid(alpha=0.3, axis='x'); ax4.set_axisbelow(True); ax4.invert_yaxis()

# [5] Pattern competition (SmartLink)
ax5 = fig.add_subplot(gs[2, 0:2])
sc = {'DOMINANT': COL_GREEN, 'SUPPRESSED': COL_ORANGE, 'FADING': COL_GRAY}
pc = [sc[p.status()] for p in patterns]
bars = ax5.barh([p.name for p in patterns], [p.score for p in patterns],
                color=pc, edgecolor='black', linewidth=0.5)
ax5.axvline(x=0.60, color=COL_ORANGE, linestyle='--', alpha=0.5, label='DOMINANT ngưỡng (score≥0.60)')
ax5.axvline(x=0.15, color=COL_GRAY,   linestyle='--', alpha=0.5, label='fiberLost (FADING)')
for b, p in zip(bars, patterns):
    ax5.text(b.get_width() + 0.015, b.get_y() + b.get_height()/2,
             f'{p.status():<11} score={p.score:.2f}  gap={p.gap:.2f}',
             va='center', fontsize=8)
ax5.set_xlabel('Pattern score', fontsize=9); ax5.set_xlim(0, 1.3)
ax5.set_title('[5] Pattern competition trong SmartLink — DOMINANT / SUPPRESSED / FADING\n'
              '(domain thứ 3 — khác cell verdict và signal outcome)',
              fontsize=9, fontweight='bold')
ax5.legend(fontsize=7, loc='lower right')
ax5.grid(alpha=0.3, axis='x'); ax5.set_axisbelow(True); ax5.invert_yaxis()

# [6] Body × Recovery (QIINT pull) — không còn capability checklist
ax6 = fig.add_subplot(gs[2, 2])
for e in entities:
    ax6.scatter(e.pi_body(), e.recovery(), s=60 + 200*e.recovery(),
                c=verdict_color[e.verdict()], edgecolors='black', linewidth=0.5, alpha=0.85)
    if e.name in ['thien-lon-part','lost-persona','gatekeeper','crm-drift','khai-cell']:
        ax6.annotate(e.name, (e.pi_body(), e.recovery()),
                     xytext=(5, 5), textcoords='offset points', fontsize=7)
ax6.axvspan(0, 0.05, color='black', alpha=0.08)
ax6.axhspan(0, 0.10, color='red',   alpha=0.08)
ax6.axvline(x=0.05, color='black', linestyle='--', alpha=0.3, linewidth=0.8)
ax6.axhline(y=0.10, color='red',   linestyle='--', alpha=0.3, linewidth=0.8)
ax6.text(0.025, 0.05, 'PERM\nDEATH', ha='center', va='center', fontsize=7,
         fontweight='bold', color='#7F0000', alpha=0.7)
ax6.set_xlabel('Π_body (orbital × QIINT pull × mass)', fontsize=8)
ax6.set_ylabel('Recovery = QIINT pull × anchor mass × snap', fontsize=8)
ax6.set_xlim(-0.03, 1.05); ax6.set_ylim(-0.03, 1.05)
ax6.set_title('[6] Recovery KHÔNG phải capability checklist\n'
              'chết thật ⟺ Π_body<0.05 ∧ recovery<0.10',
              fontsize=9, fontweight='bold')
ax6.grid(alpha=0.3); ax6.set_axisbelow(True)

out = '/mnt/user-data/outputs/nattos-sim-v2-4tang-thienbang-align.png'
import os
os.makedirs(os.path.dirname(out), exist_ok=True)
plt.savefig(out, dpi=110, bbox_inches='tight', facecolor=COL_BG)
plt.close()
print(f"\n✅ Đã xuất: {out}")
