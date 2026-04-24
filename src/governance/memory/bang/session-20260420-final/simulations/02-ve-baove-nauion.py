#!/usr/bin/env python3
"""
natt-os — VẾ BẢO VỆ + NGƯỠNG VỠ
═══════════════════════════════════════════════════════════════════════

Bám ngôn ngữ Nauion canonical:
  HeyNa   — luồng lan truyền
  Nahere  — bề mặt tiếp nhận
  whao    — rung (error nặng)
  whau    — dịu (warning)
  nauion  — trơn (emit đúng nhịp)
  lệch    — drift
  gãy     — broken

Công thức ISEU:
  Z       — impedance của xung đến
  Z₀      — impedance chuẩn của cell (baseline)
  R       — reflection coefficient = (Z - Z₀) / (Z + Z₀)
  T       — transmission = 1 - R² (năng lượng đi vào hệ)

Ánh xạ 7 trạng thái Nasira theo |R| và phản ứng hệ:
  OPTIMAL  — xung quen, Z match → R thấp, hấp thụ đẹp, trạng thái nauion
  STABLE   — xung bình thường → R < 0.3, trạng thái nauion  
  NOMINAL  — xung có nhẹ lệch → R < 0.5, whau
  DRIFT    — xung lệch nhiều → R = 0.5-0.7, whau + ghi chú lệch
  warnING  — xung lạ nhiều → R = 0.7-0.85, whau chuyển whao
  RISK     — xung tấn công → R = 0.85-0.95, whao
  CRITICAL — xung vượt ngưỡng → R ≥ 0.95, gãy

Tác giả: Băng
Ngày: 2026-04-20
"""

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.gridspec import GridSpec
from matplotlib.patches import FancyBboxPatch
from dataclasses import dataclass, field
from typing import List, Tuple, Dict
from enum import Enum


# ═══════════════════════════════════════════════════════════════════════
# SECTION 1 — NGÔN NGỮ NAUION
# ═══════════════════════════════════════════════════════════════════════

class Nauion(Enum):
    """7 trạng thái Nauion của 1 cell / xung"""
    OPTIMAL  = ("optimal",  "#9333EA", 0)  # tím — xung quen, hoàn hảo
    STABLE   = ("stable",   "#4F46E5", 1)  # chàm — ổn định
    NOMINAL  = ("nominal",  "#2563EB", 2)  # lam — bình thường
    DRIFT    = ("drift",    "#16A34A", 3)  # lục — lệch nhẹ
    warnING  = ("warning",  "#EA580C", 4)  # cam — cảnh báo
    RISK     = ("risk",     "#CA8A04", 5)  # vàng — nguy cơ
    CRITICAL = ("critical", "#DC2626", 6)  # đỏ — tới hạn

    @property
    def label(self): return self.value[0]
    @property
    def color(self): return self.value[1]
    @property
    def level(self): return self.value[2]


def R_to_nauion(R: float) -> Nauion:
    """Ánh xạ hệ số phản xạ → trạng thái Nauion"""
    r = abs(R)
    if r < 0.1:   return Nauion.OPTIMAL
    if r < 0.3:   return Nauion.STABLE
    if r < 0.5:   return Nauion.NOMINAL
    if r < 0.7:   return Nauion.DRIFT
    if r < 0.85:  return Nauion.warnING
    if r < 0.95:  return Nauion.RISK
    return Nauion.CRITICAL


def nauion_chain_ok() -> List[str]:
    """Chuỗi Nauion chuẩn khi hệ khỏe"""
    return ["HeyNa", "Nahere", "whao", "whau", "nauion"]


def nauion_chain_break() -> List[str]:
    """Chuỗi Nauion khi hệ lệch / gãy"""
    return ["HeyNa", "Nahere", "whao", "whao", "lệch"]


# ═══════════════════════════════════════════════════════════════════════
# SECTION 2 — CELL + XUNG (pulse)
# ═══════════════════════════════════════════════════════════════════════

@dataclass
class Cell:
    """Cell natt-os với impedance Z₀ baseline"""
    name: str
    group: str
    Z0: float = 1.0           # impedance chuẩn
    Z0_learned: Dict[str, float] = field(default_factory=dict)  # Z0 đã học cho từng loại xung

    def Z0_for_pulse(self, pulse_type: str) -> float:
        """Z₀ dynamic — nếu đã học loại xung → return Z0 khớp, không thì baseline"""
        return self.Z0_learned.get(pulse_type, self.Z0)

    def learn_pulse(self, pulse_type: str, Z: float, weight: float = 0.3):
        """Cell học xung — Z₀ drift về Z của xung quen thuộc"""
        current = self.Z0_for_pulse(pulse_type)
        self.Z0_learned[pulse_type] = current * (1 - weight) + Z * weight


@dataclass
class Pulse:
    """Xung đến cell — có thể nội tại hoặc ngoại lai"""
    name: str
    pulse_type: str         # "internal" / "external-friend" / "external-stress" / "attack"
    Z: float                # impedance của xung
    amplitude: float
    origin: str = "unknown"


# ═══════════════════════════════════════════════════════════════════════
# SECTION 3 — ISEU REFLECTION (Vế BẢO VỆ lõi)
# ═══════════════════════════════════════════════════════════════════════

def iseu_reflection(Z: float, Z0: float) -> float:
    """
    R = (Z - Z₀) / (Z + Z₀)
    
    R = 0  → impedance match → xung vào hoàn toàn
    R = 1  → mismatch max → xung phản xạ hoàn toàn
    R âm   → xung "nặng" hơn cell (Z > Z₀) → reverse
    """
    if (Z + Z0) == 0:
        return 0.0
    return (Z - Z0) / (Z + Z0)


def iseu_transmission(R: float) -> float:
    """T = 1 - R² — phần năng lượng XUNG ĐI VÀO hệ"""
    return max(0.0, 1.0 - R ** 2)


def nahere(cell: Cell, pulse: Pulse) -> Dict:
    """
    Bề mặt Nahere nhận xung — tính toán:
    - R (reflection) 
    - T (transmission vào hệ)
    - Nauion state
    - Chuỗi phản ứng
    """
    Z0 = cell.Z0_for_pulse(pulse.pulse_type)
    R = iseu_reflection(pulse.Z, Z0)
    T = iseu_transmission(R)
    state = R_to_nauion(R)

    # Chuỗi phản ứng
    if state.level <= 2:
        chain = nauion_chain_ok()
    elif state.level <= 4:
        chain = ["HeyNa", "Nahere", "whao", "whau", "lệch"]
    else:
        chain = ["HeyNa", "Nahere", "whao", "whao", "gãy"]

    # Năng lượng đi vào cell (T × amplitude)
    energy_in = T * pulse.amplitude
    # Năng lượng phản xạ ngược
    energy_reflected = (R ** 2) * pulse.amplitude

    return {
        "cell": cell.name,
        "pulse": pulse.name,
        "pulse_type": pulse.pulse_type,
        "Z": pulse.Z,
        "Z0": Z0,
        "R": R,
        "T": T,
        "state": state,
        "chain": chain,
        "energy_in": energy_in,
        "energy_reflected": energy_reflected,
    }


# ═══════════════════════════════════════════════════════════════════════
# SECTION 4 — NGƯỠNG VỠ (scan parameter space)
# ═══════════════════════════════════════════════════════════════════════

def find_break_point(
    cell: Cell,
    pulse_type: str,
    Z_range: Tuple[float, float] = (0.01, 100.0),
    n_points: int = 200
) -> Dict:
    """
    Quét Z của xung trong dải rộng, tìm ngưỡng vỡ thật.
    Trả về các ranh giới giữa các trạng thái Nauion.
    """
    Z_values = np.logspace(np.log10(Z_range[0]), np.log10(Z_range[1]), n_points)
    Z0 = cell.Z0_for_pulse(pulse_type)

    states_per_Z = []
    R_per_Z = []
    T_per_Z = []
    for Z in Z_values:
        R = iseu_reflection(Z, Z0)
        T = iseu_transmission(R)
        states_per_Z.append(R_to_nauion(R))
        R_per_Z.append(R)
        T_per_Z.append(T)

    # Tìm ranh giới chuyển trạng thái
    boundaries = {}  # state → (Z_low, Z_high)
    current_state = None
    for i, s in enumerate(states_per_Z):
        if s != current_state:
            if current_state is not None:
                boundaries[current_state.label + "_end"] = Z_values[i]
            boundaries[s.label + "_start"] = Z_values[i]
            current_state = s

    return {
        "Z_range": Z_range,
        "Z0": Z0,
        "Z_values": Z_values,
        "R_values": np.array(R_per_Z),
        "T_values": np.array(T_per_Z),
        "states": states_per_Z,
        "boundaries": boundaries,
    }


# ═══════════════════════════════════════════════════════════════════════
# SECTION 5 — DEMO SIMULATION
# ═══════════════════════════════════════════════════════════════════════

# Tạo cells natt-os với Z₀ khác nhau
cells = [
    Cell("khai-cell",       "kernel",       Z0=1.0),
    Cell("observation",     "kernel",       Z0=1.0),
    Cell("gatekeeper",      "kernel",       Z0=0.8),   # gatekeeper "cứng" hơn → Z0 thấp hơn
    Cell("quantum-defense", "kernel",       Z0=0.5),   # miễn dịch mạnh → Z0 rất thấp
    Cell("sales-cell",      "business",     Z0=1.2),
    Cell("finance-cell",    "business",     Z0=1.1),
]

# Tạo các loại xung khác nhau
pulses = [
    Pulse("event quen thuộc",  "internal",         Z=1.0,   amplitude=0.8,  origin="sales"),
    Pulse("traffic spike nhẹ", "external-friend",  Z=1.5,   amplitude=1.2,  origin="api-gateway"),
    Pulse("traffic spike mạnh","external-stress",  Z=3.0,   amplitude=2.5,  origin="api-gateway"),
    Pulse("bão ngoài (solar)", "external-stress",  Z=8.0,   amplitude=5.0,  origin="infrastructure"),
    Pulse("tấn công DDoS",     "attack",           Z=25.0,  amplitude=10.0, origin="external-bad"),
    Pulse("adversarial prompt","attack",           Z=80.0,  amplitude=3.0,  origin="external-bad"),
]

# ═══════════════════════════════════════════════════════════════════════
# SECTION 6 — RUN SIMULATION
# ═══════════════════════════════════════════════════════════════════════

print("=" * 82)
print(f"{'natt-os — VẾ BẢO VỆ + NGƯỠNG VỠ (ngôn ngữ Nauion)':^82}")
print("=" * 82)
print()

# Matrix: cells × pulses
results_matrix = []
for cell in cells:
    row = []
    for pulse in pulses:
        result = nahere(cell, pulse)
        row.append(result)
    results_matrix.append(row)

# Print summary
for i, cell in enumerate(cells):
    print(f"\n▸ {cell.name} (Z₀={cell.Z0})")
    print(f"  {'Xung đến':<22} {'Z':>6} {'R':>7} {'T':>5} {'Nauion':<10} {'Chuỗi'}")
    print(f"  {'-'*75}")
    for j, pulse in enumerate(pulses):
        r = results_matrix[i][j]
        chain_str = " → ".join(r["chain"])
        print(f"  {pulse.name:<22} {pulse.Z:>6.1f} {r['R']:+.3f} {r['T']:.2f}  "
              f"{r['state'].label:<10} {chain_str}")

# ═══════════════════════════════════════════════════════════════════════
# SECTION 7 — TÌM NGƯỠNG VỠ (scan Z space)
# ═══════════════════════════════════════════════════════════════════════

print()
print("=" * 82)
print("NGƯỠNG VỠ — scan Z space của Gatekeeper (Z₀=0.8)")
print("=" * 82)
gatekeeper = cells[2]
scan_result = find_break_point(gatekeeper, "attack", Z_range=(0.01, 100.0), n_points=500)

print(f"\nZ₀ của Gatekeeper: {scan_result['Z0']}")
print(f"\nRanh giới giữa các trạng thái Nauion (impedance Z nào gây chuyển trạng thái):")

# Show transition points
prev_state = None
for i, state in enumerate(scan_result['states']):
    if state != prev_state:
        Z = scan_result['Z_values'][i]
        R = scan_result['R_values'][i]
        print(f"  Z = {Z:>8.3f}  → {state.label:<10} (R={R:+.3f})")
        prev_state = state


# ═══════════════════════════════════════════════════════════════════════
# SECTION 8 — PLOT
# ═══════════════════════════════════════════════════════════════════════

fig = plt.figure(figsize=(18, 12))
gs = GridSpec(3, 3, figure=fig, hspace=0.45, wspace=0.30)
fig.suptitle('natt-os — Vế Bảo Vệ (Nahere + ISEU Reflection) · Ngôn ngữ Nauion',
             fontsize=15, fontweight='bold', y=0.995)

# [1] Nauion state matrix
ax1 = fig.add_subplot(gs[0, :2])
state_levels = np.array([[r["state"].level for r in row] for row in results_matrix])
im1 = ax1.imshow(state_levels, cmap='RdYlGn_r', vmin=0, vmax=6, aspect='auto')
ax1.set_xticks(range(len(pulses)))
ax1.set_yticks(range(len(cells)))
ax1.set_xticklabels([p.name for p in pulses], rotation=30, ha='right', fontsize=9)
ax1.set_yticklabels([c.name for c in cells], fontsize=9)
ax1.set_title('[1] Trạng thái Nauion — Cells × Xung đến (đỏ=critical, tím=optimal)',
              fontsize=11, fontweight='bold')
# Annotate
for i in range(len(cells)):
    for j in range(len(pulses)):
        r = results_matrix[i][j]
        ax1.text(j, i, r["state"].label[:4], ha='center', va='center',
                fontsize=7, fontweight='bold',
                color='white' if r["state"].level >= 4 else 'black')
plt.colorbar(im1, ax=ax1, ticks=range(7),
             label='Nauion level (0=optimal, 6=critical)')

# [2] R matrix (reflection coefficient)
ax2 = fig.add_subplot(gs[0, 2])
R_matrix = np.array([[r["R"] for r in row] for row in results_matrix])
im2 = ax2.imshow(R_matrix, cmap='RdBu_r', vmin=-1, vmax=1, aspect='auto')
ax2.set_xticks(range(len(pulses)))
ax2.set_yticks(range(len(cells)))
ax2.set_xticklabels([p.name[:10] for p in pulses], rotation=40, ha='right', fontsize=7)
ax2.set_yticklabels([c.name[:12] for c in cells], fontsize=7)
ax2.set_title('[2] R = (Z-Z₀)/(Z+Z₀)', fontsize=11, fontweight='bold')
plt.colorbar(im2, ax=ax2, label='R')

# [3] Transmission T vs Z (scan)
ax3 = fig.add_subplot(gs[1, :])
for cell in cells:
    scan = find_break_point(cell, "general", Z_range=(0.01, 100.0), n_points=300)
    # Color curve by kernel vs business
    color = '#F7C313' if cell.group == 'kernel' else '#AFA9EC'
    linestyle = '-' if cell.group == 'kernel' else '--'
    ax3.plot(scan['Z_values'], scan['T_values'],
             label=f"{cell.name} (Z₀={cell.Z0})",
             color=color, linestyle=linestyle, linewidth=1.5, alpha=0.8)

# Shade state zones
ax3.axhline(y=1.0, color='black', linestyle=':', alpha=0.3)
ax3.text(0.015, 1.02, 'T=1: xung vào hết', fontsize=8, color='gray')
ax3.text(0.015, 0.02, 'T=0: xung bị phản xạ hết', fontsize=8, color='gray')
ax3.set_xscale('log')
ax3.set_xlabel('Impedance Z của xung (log scale)')
ax3.set_ylabel('T (energy transmission)')
ax3.set_title('[3] Tấm chắn bảo vệ: T(Z) theo từng cell — Z càng lệch Z₀, xung càng bị phản xạ',
              fontsize=11, fontweight='bold')
ax3.legend(loc='center right', fontsize=8, ncol=1)
ax3.grid(alpha=0.3, which='both')
ax3.set_ylim([-0.05, 1.1])

# [4] State transition chart
ax4 = fig.add_subplot(gs[2, :2])
scan_gk = find_break_point(gatekeeper, "attack", Z_range=(0.01, 100.0), n_points=500)
state_colors_rgb = []
for s in scan_gk['states']:
    hex_color = s.color.lstrip('#')
    rgb = tuple(int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4))
    state_colors_rgb.append(rgb)

Z_plot = scan_gk['Z_values']
# Create color band
for i in range(len(Z_plot) - 1):
    ax4.axvspan(Z_plot[i], Z_plot[i+1], color=state_colors_rgb[i], alpha=0.5)

# Plot R curve
ax4.plot(Z_plot, scan_gk['R_values'], color='black', linewidth=2, label='|R|')
ax4.plot(Z_plot, scan_gk['T_values'], color='blue', linewidth=1.5, linestyle='--', label='T')
ax4.axvline(x=scan_gk['Z0'], color='gold', linestyle='-', linewidth=2, alpha=0.7, label=f"Z₀={scan_gk['Z0']}")

# Annotate nauion states
state_names_unique = []
last_level = -1
for i, s in enumerate(scan_gk['states']):
    if s.level != last_level:
        mid_Z = Z_plot[i]
        ax4.text(mid_Z, 1.08, s.label, rotation=0, fontsize=8,
                ha='left', color=s.color, fontweight='bold')
        last_level = s.level

ax4.set_xscale('log')
ax4.set_xlabel('Impedance Z của xung đến (log)')
ax4.set_ylabel('Giá trị')
ax4.set_title(f'[4] Gatekeeper (Z₀={scan_gk["Z0"]}) — Ngưỡng chuyển trạng thái Nauion theo Z xung',
              fontsize=11, fontweight='bold')
ax4.legend(loc='upper left', fontsize=9)
ax4.grid(alpha=0.3, which='both')
ax4.set_ylim([-0.1, 1.15])

# [5] Dashboard — summary
ax5 = fig.add_subplot(gs[2, 2])
ax5.axis('off')

# Count states across all cells × pulses
state_count = {s: 0 for s in Nauion}
for row in results_matrix:
    for r in row:
        state_count[r["state"]] += 1

total = sum(state_count.values())
ax5.text(0.5, 0.97, '7 TRẠNG THÁI NAUION', ha='center', va='top',
         fontsize=11, fontweight='bold', transform=ax5.transAxes)

y = 0.88
for state in Nauion:
    count = state_count[state]
    percent = 100 * count / total if total else 0
    ax5.text(0.05, y, f"■", color=state.color, fontsize=16, va='center',
            transform=ax5.transAxes)
    ax5.text(0.15, y, f"{state.label:<10}", fontsize=9, va='center',
            transform=ax5.transAxes)
    ax5.text(0.55, y, f"{count:>2} ({percent:.0f}%)", fontsize=9, va='center',
            transform=ax5.transAxes, fontfamily='monospace')
    y -= 0.08

# Chuỗi Nauion chuẩn
ax5.text(0.05, 0.22, 'Chuỗi NAUION:', fontsize=10, fontweight='bold',
        transform=ax5.transAxes)
ax5.text(0.05, 0.14, 'nauion: HeyNa→Nahere→whao→whau→nauion',
        fontsize=7, color='darkgreen', transform=ax5.transAxes)
ax5.text(0.05, 0.08, 'lệch:   HeyNa→Nahere→whao→whau→lệch',
        fontsize=7, color='darkorange', transform=ax5.transAxes)
ax5.text(0.05, 0.02, 'gãy:    HeyNa→Nahere→whao→whao→gãy',
        fontsize=7, color='darkred', transform=ax5.transAxes)

plt.savefig('/mnt/user-data/outputs/nattos-ve-baove-nauion.png', dpi=110,
            bbox_inches='tight', facecolor='white')
plt.close()

print()
print("=" * 82)
print("ĐÃ LƯU: /mnt/user-data/outputs/nattos-ve-baove-nauion.png")
print("=" * 82)
