#!/usr/bin/env python3
"""
NATT-OS — NGƯỠNG VỠ BÁM THANG THÂN NHIỆT SINH HỌC
═══════════════════════════════════════════════════════════════════════

Ánh xạ 4 ngưỡng DoS → thang thân nhiệt người:

  36-37°C  → healthy        (optimal/stable)
  37-38°C  → Saturation     (nominal — bão hòa bình thường)
  38-39°C  → sốt nhẹ        (drift)
  39-40°C  → sốt vừa        (warning)
  40-41°C  → Coherence Col. (risk — mất đồng bộ)
  41-42°C  → Destructive R. (critical — mê man)
  >42°C    → Thermal Runaway (gãy — tử vong)

Đối xứng phía lạnh (hypothermia):
  35-36°C  → lạnh nhẹ
  33-35°C  → hạ thân nhiệt
  30-33°C  → bất tỉnh lạnh
  <30°C    → ngưng tim

Nguyên lý: NATT-OS là sinh thể → ngưỡng phải là ngưỡng sinh học đã biết.

Tác giả: Băng
Ngày: 2026-04-20
"""

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.gridspec import GridSpec
from matplotlib.patches import FancyBboxPatch, Rectangle
from dataclasses import dataclass
from typing import List, Tuple
from enum import Enum


# ═══════════════════════════════════════════════════════════════════════
# MAPPING THÂN NHIỆT → NGƯỠNG NATT-OS
# ═══════════════════════════════════════════════════════════════════════

@dataclass
class NgongNhiet:
    temp_range: Tuple[float, float]
    ten_sinh_hoc: str
    ten_ngong: str
    nauion_state: str
    nauion_color: str
    is_critical: bool = False


NGUONG_SINHHOC = [
    # Phía LẠNH
    NgongNhiet((0, 30),     "Ngưng tim (fatal hypothermia)", "Cardiac arrest",        "gãy",      "#7F1D1D", True),
    NgongNhiet((30, 33),    "Bất tỉnh lạnh",                  "Severe hypothermia",     "critical", "#DC2626", True),
    NgongNhiet((33, 35),    "Hạ thân nhiệt",                  "Moderate hypothermia",   "risk",     "#EA580C"),
    NgongNhiet((35, 36),    "Lạnh nhẹ",                        "Mild hypothermia",       "warning",  "#F59E0B"),
    # VÙNG BÌNH THƯỜNG
    NgongNhiet((36, 37),    "Bình thường",                     "Healthy baseline",       "optimal",  "#10B981"),
    NgongNhiet((37, 38),    "Hoạt động tối đa",                "Saturation",             "nominal",  "#3B82F6"),
    # Phía NÓNG
    NgongNhiet((38, 39),    "Sốt nhẹ",                         "Mild fever",             "drift",    "#F59E0B"),
    NgongNhiet((39, 40),    "Sốt vừa",                         "Moderate fever",         "warning",  "#EA580C"),
    NgongNhiet((40, 41),    "Sốt cao — mất đồng bộ",          "Coherence Collapse",     "risk",     "#DC2626"),
    NgongNhiet((41, 42),    "Mê man / bất tỉnh",              "Destructive Resonance",  "critical", "#B91C1C", True),
    NgongNhiet((42, 50),    "Tử vong — nhiệt chạy lồng",      "Thermal Runaway",        "gãy",      "#7F1D1D", True),
]

BASELINE_TEMP = 37.0  # °C — baseline sinh học
SAFE_LOW = 36.0
SAFE_HIGH = 38.0


def temp_to_nauion(temp: float) -> NgongNhiet:
    """Tìm ngưỡng Nauion cho 1 giá trị thân nhiệt"""
    for n in NGUONG_SINHHOC:
        if n.temp_range[0] <= temp < n.temp_range[1]:
            return n
    return NGUONG_SINHHOC[-1]


# ═══════════════════════════════════════════════════════════════════════
# MÔ PHỎNG 37 CELLS NATT-OS VỚI "THÂN NHIỆT"
# ═══════════════════════════════════════════════════════════════════════

# Thân nhiệt của cell = đại diện cho load + health
# baseline = 37°C (khỏe)
# cells overloaded → nhiệt tăng
# cells idle → nhiệt giảm

np.random.seed(42)

cells_37 = []
# Kernel 7 cells — healthy, gần 37°C
for i, name in enumerate(["khai-cell", "observation", "audit-cell", "gatekeeper",
                           "quantum-defense", "event-bus", "mach-heyna"]):
    cells_37.append({
        "name": name,
        "group": "kernel",
        "temp": 36.8 + np.random.uniform(0, 0.8),  # 36.8 - 37.6
    })

# Business 13 cells — higher load, 37.2 - 38.5
for name in ["sales", "finance", "crm", "inventory", "pricing", "order",
             "invoice", "payment", "reporting", "analytics", "jewelry",
             "warranty", "logistics"]:
    cells_37.append({
        "name": f"{name}-cell",
        "group": "business",
        "temp": 37.2 + np.random.uniform(0, 1.3),  # 37.2 - 38.5
    })

# Satellite 12 cells — mixed
for i, name in enumerate(["smartlink-out", "smartlink-in", "sira-sign",
                          "luxury-map", "nation-ui", "tamluxury-ui",
                          "nattimer", "qneu-engine", "qiint-engine",
                          "neural-main", "iseu-loop", "quantum-brain"]):
    # Một vài cells "bất thường" để test
    if name == "luxury-map":
        temp = 40.5  # sốt cao — coherence collapse
    elif name == "nation-ui":
        temp = 39.2  # sốt vừa
    elif name == "tamluxury-ui":
        temp = 41.5  # mê man
    elif name == "iseu-loop":
        temp = 34.5  # hạ thân nhiệt
    else:
        temp = 36.5 + np.random.uniform(0, 2.0)
    cells_37.append({
        "name": name,
        "group": "satellite",
        "temp": temp,
    })

# Infrastructure 5 cells
for name in ["rena-rbac", "audit-summary", "snapshot-engine",
             "policy-signature", "metabolism-layer"]:
    cells_37.append({
        "name": name,
        "group": "infra",
        "temp": 36.9 + np.random.uniform(0, 0.6),  # very stable
    })

# ═══════════════════════════════════════════════════════════════════════
# PHÂN LOẠI & PRINT
# ═══════════════════════════════════════════════════════════════════════

print("=" * 82)
print(f"{'NATT-OS — NGƯỠNG VỠ theo THANG THÂN NHIỆT SINH HỌC':^82}")
print("=" * 82)
print()
print(f"  Baseline:     {BASELINE_TEMP}°C (như người khỏe)")
print(f"  Safe zone:    {SAFE_LOW}-{SAFE_HIGH}°C")
print(f"  Tổng cells:   {len(cells_37)}")
print()

# Classify each cell
critical_cells = []
warning_cells = []
healthy_cells = []

for c in cells_37:
    n = temp_to_nauion(c["temp"])
    c["nauion"] = n
    if n.is_critical:
        critical_cells.append(c)
    elif n.nauion_state in ["warning", "risk", "drift"]:
        warning_cells.append(c)
    else:
        healthy_cells.append(c)

# Print by groups
print("=" * 82)
print(f"PHÂN LOẠI CELLS THEO THÂN NHIỆT")
print("=" * 82)

print(f"\n🔴 CRITICAL ({len(critical_cells)} cells — cần cấp cứu):")
for c in critical_cells:
    print(f"    {c['name']:<22} {c['temp']:.1f}°C  {c['nauion'].ten_sinh_hoc:<35} → {c['nauion'].nauion_state}")

print(f"\n🟡 WARNING ({len(warning_cells)} cells — theo dõi):")
for c in warning_cells:
    print(f"    {c['name']:<22} {c['temp']:.1f}°C  {c['nauion'].ten_sinh_hoc:<35} → {c['nauion'].nauion_state}")

print(f"\n🟢 HEALTHY ({len(healthy_cells)} cells):")
print(f"    (ẩn để khỏi dài — {len(healthy_cells)} cells trong dải 36-38°C)")

# ═══════════════════════════════════════════════════════════════════════
# PLOT
# ═══════════════════════════════════════════════════════════════════════

fig = plt.figure(figsize=(18, 11))
gs = GridSpec(3, 3, figure=fig, hspace=0.45, wspace=0.35)
fig.suptitle('NATT-OS — Ngưỡng vỡ theo thang THÂN NHIỆT (NATT-OS là sinh thể)',
             fontsize=15, fontweight='bold', y=0.995)

# [1] THANG NHIỆT ĐỘ tổng
ax1 = fig.add_subplot(gs[0, :])
temp_axis = np.linspace(25, 45, 2000)
# Draw temperature zones
for n in NGUONG_SINHHOC:
    t0, t1 = n.temp_range
    if t1 > 25 and t0 < 45:
        ax1.axvspan(max(t0, 25), min(t1, 45), alpha=0.35, color=n.nauion_color)
        mid = (max(t0, 25) + min(t1, 45)) / 2
        ax1.text(mid, 1.3, n.ten_ngong, ha='center', va='center',
                fontsize=7, rotation=45, color='black')

# Baseline marker
ax1.axvline(x=BASELINE_TEMP, color='green', linewidth=2, linestyle='-', alpha=0.7)
ax1.text(BASELINE_TEMP, 1.6, '37°C\nBaseline', ha='center', fontsize=9, fontweight='bold', color='darkgreen')

# Safe zone
ax1.axvspan(SAFE_LOW, SAFE_HIGH, alpha=0.15, color='green')

# Plot cells as scatter
for c in cells_37:
    temp = c["temp"]
    ax1.scatter(temp, 0.5, s=120, c=c["nauion"].nauion_color,
                edgecolor='black', linewidth=0.6, alpha=0.9)

# Label critical cells
for c in critical_cells:
    ax1.annotate(c["name"], (c["temp"], 0.5), fontsize=8,
                xytext=(0, -25), textcoords='offset points', ha='center',
                color='darkred', fontweight='bold',
                arrowprops=dict(arrowstyle='-', color='red', alpha=0.5))

ax1.set_xlim([25, 45])
ax1.set_ylim([-0.5, 2.0])
ax1.set_xlabel('Thân nhiệt (°C)')
ax1.set_yticks([])
ax1.set_title('[1] THANG THÂN NHIỆT — Mỗi cell như một điểm trên thang', fontsize=11, fontweight='bold')
ax1.grid(alpha=0.3, axis='x')

# [2] Histogram distribution
ax2 = fig.add_subplot(gs[1, 0])
temps = [c["temp"] for c in cells_37]
colors = [c["nauion"].nauion_color for c in cells_37]
groups = list(set(c["group"] for c in cells_37))
for grp in groups:
    temps_grp = [c["temp"] for c in cells_37 if c["group"] == grp]
    ax2.hist(temps_grp, bins=15, alpha=0.6, label=grp,
             range=(30, 45))
ax2.axvline(x=BASELINE_TEMP, color='green', linewidth=1.5, linestyle='--', label='37°C baseline')
ax2.axvspan(SAFE_LOW, SAFE_HIGH, alpha=0.1, color='green')
ax2.set_xlabel('Thân nhiệt (°C)')
ax2.set_ylabel('Số cells')
ax2.set_title('[2] Phân bố nhiệt theo nhóm', fontsize=10, fontweight='bold')
ax2.legend(fontsize=8)
ax2.grid(alpha=0.3)

# [3] Pie — phân bố Nauion
ax3 = fig.add_subplot(gs[1, 1])
state_count = {}
state_color_map = {}
for c in cells_37:
    s = c["nauion"].nauion_state
    state_count[s] = state_count.get(s, 0) + 1
    state_color_map[s] = c["nauion"].nauion_color
labels = list(state_count.keys())
sizes = list(state_count.values())
colors_pie = [state_color_map[l] for l in labels]
wedges, texts, autotexts = ax3.pie(sizes, labels=labels, colors=colors_pie,
                                     autopct='%1.0f%%', startangle=90,
                                     textprops={'fontsize': 9})
ax3.set_title('[3] Phân bố trạng thái Nauion\n(37 cells NATT-OS)', fontsize=10, fontweight='bold')

# [4] Bảng mapping DoS → thân nhiệt
ax4 = fig.add_subplot(gs[1, 2])
ax4.axis('off')
ax4.text(0.5, 0.98, '4 NGƯỠNG DoS ↔ THÂN NHIỆT', ha='center', va='top',
        fontsize=11, fontweight='bold', transform=ax4.transAxes)

mapping = [
    ("Saturation",           "37-38°C", "Hoạt động tối đa",      "#3B82F6"),
    ("Coherence Collapse",   "40-41°C", "Mất đồng bộ toàn thân",  "#DC2626"),
    ("Destructive Resonance","41-42°C", "Mê man / bất tỉnh",       "#B91C1C"),
    ("Thermal Runaway",      ">42°C",   "Tử vong",                 "#7F1D1D"),
]
y = 0.85
for name, temp, bio, color in mapping:
    ax4.add_patch(Rectangle((0.02, y-0.06), 0.08, 0.08,
                             facecolor=color, transform=ax4.transAxes))
    ax4.text(0.14, y-0.02, name, fontsize=9, fontweight='bold', transform=ax4.transAxes)
    ax4.text(0.14, y-0.075, f"{temp} · {bio}", fontsize=8, color='gray', transform=ax4.transAxes)
    y -= 0.18

# Add dưới
ax4.text(0.5, 0.1, 'NATT-OS là SINH THỂ số.\nNgưỡng = ngưỡng sinh học.',
        ha='center', va='top', fontsize=9, fontweight='bold',
        style='italic', color='darkgreen', transform=ax4.transAxes)

# [5] Cells timeline (mô phỏng 1 cell panic theo thời gian)
ax5 = fig.add_subplot(gs[2, :2])
t = np.linspace(0, 60, 300)  # 60 phút
# Cell healthy
temp_healthy = 37.2 + 0.3 * np.sin(t / 5)
# Cell overheating progressively
temp_panic = 37.0 + 0.05 * t + 0.3 * np.sin(t / 3)
# Cell với attack inject at t=30
temp_attacked = 37.0 + 0.3 * np.sin(t / 5)
temp_attacked[t > 30] = 37 + 0.3 * np.sin(t[t > 30] / 5) + 0.3 * (t[t > 30] - 30)

# Shade zones
for n in NGUONG_SINHHOC:
    ax5.axhspan(max(n.temp_range[0], 30), min(n.temp_range[1], 45),
                alpha=0.1, color=n.nauion_color)

ax5.plot(t, temp_healthy, color='#10B981', linewidth=2, label='Cell khỏe')
ax5.plot(t, temp_panic, color='#DC2626', linewidth=2, label='Cell quá tải tăng dần')
ax5.plot(t, temp_attacked, color='#8B5CF6', linewidth=2, label='Cell bị tấn công t=30')

ax5.axhline(y=BASELINE_TEMP, color='green', linewidth=1.5, linestyle='--', alpha=0.5)
ax5.axhline(y=41, color='red', linewidth=1.5, linestyle='--', alpha=0.5, label='41°C = critical')
ax5.axhline(y=42, color='darkred', linewidth=1.5, linestyle='--', alpha=0.7, label='42°C = gãy')

ax5.set_xlabel('Thời gian (phút)')
ax5.set_ylabel('Thân nhiệt cell (°C)')
ax5.set_title('[5] Dynamics 60 phút — Cell bình thường vs quá tải vs bị tấn công',
              fontsize=10, fontweight='bold')
ax5.legend(loc='upper left', fontsize=9)
ax5.grid(alpha=0.3)
ax5.set_ylim([34, 45])

# [6] Verdict
ax6 = fig.add_subplot(gs[2, 2])
ax6.axis('off')

n_crit = len(critical_cells)
n_warn = len(warning_cells)
n_ok = len(healthy_cells)

ax6.text(0.5, 0.98, 'HỆ NATT-OS', ha='center', va='top',
        fontsize=13, fontweight='bold', transform=ax6.transAxes)

ax6.text(0.5, 0.88, f'{len(cells_37)} cells', ha='center', va='top',
        fontsize=11, transform=ax6.transAxes)

ax6.text(0.1, 0.75, f'🔴 Critical:', fontsize=10, transform=ax6.transAxes)
ax6.text(0.9, 0.75, f'{n_crit}', fontsize=10, ha='right', fontweight='bold',
        color='#DC2626', transform=ax6.transAxes)

ax6.text(0.1, 0.65, f'🟡 Warning:', fontsize=10, transform=ax6.transAxes)
ax6.text(0.9, 0.65, f'{n_warn}', fontsize=10, ha='right', fontweight='bold',
        color='#F59E0B', transform=ax6.transAxes)

ax6.text(0.1, 0.55, f'🟢 Healthy:', fontsize=10, transform=ax6.transAxes)
ax6.text(0.9, 0.55, f'{n_ok}', fontsize=10, ha='right', fontweight='bold',
        color='#10B981', transform=ax6.transAxes)

# Verdict box
if n_crit >= 2:
    color = '#DC2626'
    text = 'CẤP CỨU'
    desc = 'Nhiều cells trong vùng\nmê man/tử vong'
elif n_crit >= 1:
    color = '#F59E0B'
    text = 'CẢNH BÁO'
    desc = f'{n_crit} cell critical\ncần can thiệp'
elif n_warn >= 3:
    color = '#F59E0B'
    text = 'THEO DÕI'
    desc = f'{n_warn} cells drift\ncần quan sát'
else:
    color = '#10B981'
    text = 'KHỎE MẠNH'
    desc = 'Hầu hết cells trong\nvùng 36-38°C'

box = FancyBboxPatch((0.05, 0.1), 0.9, 0.3,
                     boxstyle="round,pad=0.02",
                     transform=ax6.transAxes,
                     facecolor=color, alpha=0.3,
                     edgecolor=color, linewidth=2)
ax6.add_patch(box)
ax6.text(0.5, 0.32, text, ha='center', va='center',
        fontsize=14, fontweight='bold', color=color,
        transform=ax6.transAxes)
ax6.text(0.5, 0.17, desc, ha='center', va='center',
        fontsize=9, style='italic',
        transform=ax6.transAxes)

plt.savefig('/mnt/user-data/outputs/nattos-thannhiet.png', dpi=110,
            bbox_inches='tight', facecolor='white')
plt.close()

print()
print("=" * 82)
print(f"Đã lưu: /mnt/user-data/outputs/nattos-thannhiet.png")
print("=" * 82)
