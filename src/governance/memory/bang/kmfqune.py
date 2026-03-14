import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# Thiết lập tham số
np.random.seed(42)
alpha = 0.5                 # Hệ số suy giảm
threshold = 15.0             # Ngưỡng cho vết hằn đầu tiên
T_max = 10.0                 # Thời gian mô phỏng tối đa

# Số lượng hành động
n_actions = 200

# Tạo dữ liệu hành động ngẫu nhiên
t = np.random.uniform(0, T_max, n_actions)          # Thời điểm
x = np.random.uniform(0, 1, n_actions)              # Loại
c = np.random.uniform(0, 1, n_actions)              # Cường độ
b = np.random.uniform(0, 1, n_actions)              # Bối cảnh
I = np.random.uniform(0.5, 2.0, n_actions)          # Tác động

# Trọng số gamma – ưu tiên vùng trung tâm không gian (x,c,b)
gamma = np.exp(-((x-0.5)**2 + (c-0.5)**2 + (b-0.5)**2) / 0.2)

# Sắp xếp hành động theo thời gian
order = np.argsort(t)
t = t[order]
x = x[order]
c = c[order]
b = b[order]
I = I[order]
gamma = gamma[order]

# Tính QNEU theo thời gian
times = np.linspace(0, T_max, 500)
Q = np.zeros_like(times)
first_imprint_time = None
first_imprint_idx = None

for idx, T in enumerate(times):
    # Tính tổng đóng góp từ các hành động đã xảy ra
    mask = t <= T
    if np.any(mask):
        contrib = I[mask] * gamma[mask] * np.exp(-alpha * (T - t[mask]))
        Q[idx] = np.sum(contrib)
    else:
        Q[idx] = 0.0
    
    # Kiểm tra ngưỡng
    if first_imprint_time is None and Q[idx] >= threshold:
        first_imprint_time = T
        first_imprint_idx = idx

if first_imprint_time is None:
    print("Không đạt ngưỡng trong khoảng thời gian mô phỏng.")
else:
    print(f"Vết hằn đầu tiên tại T = {first_imprint_time:.3f}, QNEU = {Q[first_imprint_idx]:.3f}")

# Vẽ đồ thị QNEU theo thời gian
plt.figure(figsize=(12, 6))
plt.plot(times, Q, 'b-', linewidth=2, label='QNEU(t)')
plt.axhline(y=threshold, color='r', linestyle='--', label=f'Ngưỡng Θ = {threshold}')
if first_imprint_time is not None:
    plt.scatter([first_imprint_time], [Q[first_imprint_idx]], color='gold', s=200, 
                edgecolor='black', zorder=5, label='Vết hằn đầu tiên')
plt.xlabel('Thời gian T', fontsize=12)
plt.ylabel('QNEU', fontsize=12)
plt.title('Quá trình tiến hóa QNEU và vết hằn đầu tiên', fontsize=14)
plt.legend()
plt.grid(alpha=0.3)
plt.tight_layout()
plt.savefig('first_imprint_timeline.png', dpi=150)
plt.show()

# Hiển thị lát cắt không gian 3 chiều tại thời điểm vết hằn đầu tiên
if first_imprint_time is not None:
    # Lấy các hành động đã xảy ra đến thời điểm đó
    mask = t <= first_imprint_time
    x_plot = x[mask]
    c_plot = c[mask]
    b_plot = b[mask]
    I_plot = I[mask]
    gamma_plot = gamma[mask]
    
    # Tính giá trị đóng góp F tại thời điểm đó (có nhân suy giảm)
    F = I_plot * gamma_plot * np.exp(-alpha * (first_imprint_time - t[mask]))
    
    fig = plt.figure(figsize=(12, 9))
    ax = fig.add_subplot(111, projection='3d')
    sc = ax.scatter(x_plot, c_plot, b_plot, c=F, cmap='plasma', s=F*50, 
                    alpha=0.7, edgecolors='w', linewidth=0.5)
    ax.set_xlabel('Loại hành động x', fontsize=12)
    ax.set_ylabel('Cường độ c', fontsize=12)
    ax.set_zlabel('Bối cảnh b', fontsize=12)
    ax.set_title(f'Lát cắt không gian tại thời điểm vết hằn đầu tiên T = {first_imprint_time:.3f}\n'
                 f'Kích thước và màu sắc tỉ lệ với giá trị đóng góp F', fontsize=14)
    cbar = plt.colorbar(sc, ax=ax, shrink=0.6)
    cbar.set_label('Giá trị đóng góp F', fontsize=12)
    ax.view_init(elev=25, azim=50)
    plt.tight_layout()
    plt.savefig('first_imprint_slice.png', dpi=150)
    plt.show()