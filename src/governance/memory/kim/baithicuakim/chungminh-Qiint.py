import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.animation as animation

# Tham số
np.random.seed(42)
n_points = 80
alpha = 0.5
T_max = 5.0

# Dữ liệu cố định (t, x, c, b, I)
t = np.random.uniform(0, T_max, n_points)
x = np.random.uniform(0, 1, n_points)
c = np.random.uniform(0, 1, n_points)
b = np.random.uniform(0, 1, n_points)
I = np.random.uniform(0.5, 2.0, n_points)

# Gamma – ưu tiên vùng trung tâm
gamma = np.exp(-((x-0.5)**2 + (c-0.5)**2 + (b-0.5)**2) / 0.2)

# Chuẩn bị figure
fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')

def update(T):
    ax.clear()
    mask = t <= T
    if np.any(mask):
        F = I[mask] * gamma[mask] * np.exp(-alpha * (T - t[mask]))
        sc = ax.scatter(x[mask], c[mask], b[mask],
                        c=F, cmap='plasma', s=F*80, alpha=0.8)
        # Thêm colorbar tĩnh để tham chiếu
        if not hasattr(update, "cbar"):
            update.cbar = fig.colorbar(sc, ax=ax, shrink=0.6)
    ax.set_xlim(0,1); ax.set_ylim(0,1); ax.set_zlim(0,1)
    ax.set_xlabel('x (loại hành động)')
    ax.set_ylabel('c (cường độ)')
    ax.set_zlabel('b (bối cảnh)')
    ax.set_title(f'Lát cắt 3D tại thời điểm T = {T:.2f}\nTổng QNEU = {np.sum(F) if np.any(mask) else 0:.3f}')
    ax.view_init(elev=25, azim=50)

ani = animation.FuncAnimation(fig, update, frames=np.linspace(0, T_max, 100), interval=100)
ani.save('Qint_4D_animation.gif', writer='pillow')