#!/usr/bin/env python3
"""
Chứng minh trực quan hàm QNEU với ký hiệu ∫∫∫∫ (Qiint) trong không gian 4D (t,x,c,b)
Không dùng 3D scatter, thay bằng heatmap 2D cho các cặp chiều (x,c), (x,b), (c,b)
và animation theo thời gian.
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.gridspec import GridSpec

# ===================== THAM SỐ =====================
np.random.seed(42)
n_actions = 200          # Số hành động (điểm rời rạc trong 4D)
alpha = 0.5              # Hệ số suy giảm
T_max = 10.0             # Thời gian mô phỏng tối đa
threshold = 15.0         # Ngưỡng cho vết đầu tiên

# ===================== TẠO DỮ LIỆU NGẪU NHIÊN =====================
# Tạo các điểm trong không gian 4D (t, x, c, b)
t = np.random.uniform(0, T_max, n_actions)          # thời gian xảy ra hành động
x = np.random.uniform(0, 1, n_actions)              # loại hành động
c = np.random.uniform(0, 1, n_actions)              # cường độ
b = np.random.uniform(0, 1, n_actions)              # bối cảnh
I = np.random.uniform(0.5, 2.0, n_actions)          # tác động nội tại

# Hàm trọng số gamma – ưu tiên vùng trung tâm (x=0.5, c=0.5, b=0.5)
gamma = np.exp(-((x-0.5)**2 + (c-0.5)**2 + (b-0.5)**2) / 0.2)

# Sắp xếp hành động theo thời gian để dễ xử lý animation
order = np.argsort(t)
t = t[order]
x = x[order]
c = c[order]
b = b[order]
I = I[order]
gamma = gamma[order]

# ===================== TÍNH QNEU THEO THỜI GIAN =====================
# Chọn các thời điểm để vẽ animation
times = np.linspace(0, T_max, 100)
Q_history = []

for T in times:
    mask = t <= T
    if np.any(mask):
        F = I[mask] * gamma[mask] * np.exp(-alpha * (T - t[mask]))
        Q = np.sum(F)
    else:
        Q = 0.0
    Q_history.append(Q)

# Tìm thời điểm vết đầu tiên
first_imprint_time = None
first_imprint_idx = None
for i, T in enumerate(times):
    if Q_history[i] >= threshold:
        first_imprint_time = T
        first_imprint_idx = i
        break

# ===================== TẠO HÌNH ẢNH ANIMATION =====================
# Chia lưới: 3 heatmap + 1 đồ thị QNEU
fig = plt.figure(figsize=(14, 10))
gs = GridSpec(2, 3, height_ratios=[1, 0.5], hspace=0.4, wspace=0.3)

# Các trục heatmap
ax_xc = fig.add_subplot(gs[0, 0])   # heatmap (x, c)
ax_xb = fig.add_subplot(gs[0, 1])   # heatmap (x, b)
ax_cb = fig.add_subplot(gs[0, 2])   # heatmap (c, b)
ax_q = fig.add_subplot(gs[1, :])    # đồ thị QNEU theo thời gian

# Số ô lưới cho heatmap
grid_size = 20
x_edges = np.linspace(0, 1, grid_size+1)
c_edges = np.linspace(0, 1, grid_size+1)
b_edges = np.linspace(0, 1, grid_size+1)

# Tạo lưới để hiển thị
X_mid = (x_edges[:-1] + x_edges[1:]) / 2
C_mid = (c_edges[:-1] + c_edges[1:]) / 2
B_mid = (b_edges[:-1] + b_edges[1:]) / 2
X_grid, C_grid = np.meshgrid(X_mid, C_mid, indexing='ij')
X_grid_b, B_grid = np.meshgrid(X_mid, B_mid, indexing='ij')
C_grid_b, B_grid2 = np.meshgrid(C_mid, B_mid, indexing='ij')

# Hàm tạo heatmap từ dữ liệu tại thời điểm T
def make_heatmaps(T):
    mask = t <= T
    if not np.any(mask):
        return np.zeros((grid_size, grid_size)), np.zeros((grid_size, grid_size)), np.zeros((grid_size, grid_size))
    
    # Giá trị đóng góp của từng hành động tại thời điểm T
    F = I[mask] * gamma[mask] * np.exp(-alpha * (T - t[mask]))
    
    # Tọa độ của các hành động
    x_vals = x[mask]
    c_vals = c[mask]
    b_vals = b[mask]
    
    # Tổng hợp vào lưới
    H_xc = np.zeros((grid_size, grid_size))
    H_xb = np.zeros((grid_size, grid_size))
    H_cb = np.zeros((grid_size, grid_size))
    
    for i in range(len(x_vals)):
        xi = x_vals[i]
        ci = c_vals[i]
        bi = b_vals[i]
        fi = F[i]
        
        # Tìm ô cho (x,c)
        ix = np.digitize(xi, x_edges) - 1
        ic = np.digitize(ci, c_edges) - 1
        if 0 <= ix < grid_size and 0 <= ic < grid_size:
            H_xc[ix, ic] += fi
        
        # (x,b)
        ib = np.digitize(bi, b_edges) - 1
        if 0 <= ix < grid_size and 0 <= ib < grid_size:
            H_xb[ix, ib] += fi
        
        # (c,b)
        if 0 <= ic < grid_size and 0 <= ib < grid_size:
            H_cb[ic, ib] += fi
    
    return H_xc, H_xb, H_cb

# Vẽ đường nền cho đồ thị QNEU (sẽ được cập nhật trong animation)
ax_q.plot(times, Q_history, 'b-', linewidth=2, label='QNEU(t)')
ax_q.axhline(y=threshold, color='r', linestyle='--', label=f'Ngưỡng Θ = {threshold}')
if first_imprint_time is not None:
    ax_q.scatter([first_imprint_time], [Q_history[first_imprint_idx]], 
                 color='gold', s=100, edgecolor='black', zorder=5, label='Vết đầu tiên')
ax_q.set_xlabel('Thời gian T')
ax_q.set_ylabel('QNEU')
ax_q.set_title('Quá trình tích lũy QNEU')
ax_q.legend()
ax_q.grid(alpha=0.3)
ax_q.set_xlim(0, T_max)
ax_q.set_ylim(0, max(Q_history) * 1.1 if Q_history else 1)

# Hàm cập nhật cho animation
def update(frame_idx):
    T = times[frame_idx]
    H_xc, H_xb, H_cb = make_heatmaps(T)
    
    # Xóa và vẽ lại heatmap
    for ax, H, xlabel, ylabel, title in [
        (ax_xc, H_xc, 'Loại hành động x', 'Cường độ c', f'Heatmap (x,c) tại T={T:.2f}'),
        (ax_xb, H_xb, 'Loại hành động x', 'Bối cảnh b', f'Heatmap (x,b) tại T={T:.2f}'),
        (ax_cb, H_cb, 'Cường độ c', 'Bối cảnh b', f'Heatmap (c,b) tại T={T:.2f}')
    ]:
        ax.clear()
        im = ax.imshow(H.T, origin='lower', extent=[0,1,0,1], 
                       cmap='plasma', vmin=0, vmax=np.max(H_xc) if np.max(H_xc) > 0 else 1)
        ax.set_xlabel(xlabel)
        ax.set_ylabel(ylabel)
        ax.set_title(title)
        # Thêm colorbar nếu chưa có
        if not hasattr(update, 'cbar'):
            update.cbar = fig.colorbar(im, ax=[ax_xc, ax_xb, ax_cb], shrink=0.6)
            update.cbar.set_label('Tổng đóng góp F')
    
    # Đánh dấu thời điểm hiện tại trên đồ thị QNEU
    ax_q.axvline(x=T, color='gray', linestyle=':', alpha=0.7)
    ax_q.set_title(f'QNEU theo thời gian (T = {T:.2f})')
    
    # Cập nhật colorbar nếu cần
    # (Không thể cập nhật dễ dàng trong FuncAnimation, tạm thời bỏ qua)
    return ax_xc, ax_xb, ax_cb, ax_q

# Tạo animation
ani = animation.FuncAnimation(fig, update, frames=len(times), interval=100, repeat=True)

# Lưu animation dưới dạng gif (cần pillow)
ani.save('Qiint_4D_heatmap_animation.gif', writer='pillow', fps=10)

# Hiển thị frame cuối để xem tĩnh (tuỳ chọn)
plt.show()

print("Đã tạo file Qiint_4D_heatmap_animation.gif")
if first_imprint_time is not None:
    print(f"Vết đầu tiên tại T = {first_imprint_time:.3f} với QNEU = {Q_history[first_imprint_idx]:.3f}")
else:
    print("Không đạt ngưỡng trong khoảng thời gian mô phỏng.")