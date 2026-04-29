/**
 * NAVIGATION ENGINE — v0.1 (PILOT)
 * @cell: render-stack-cell
 * @status: pilot — chuyển giữa các màn hình, giữ stack history
 * 
 * Quản lý danh sách màn hình, chuyển đổi và lưu lịch sử
 */

export interface Screen {
  id: string;
  title: string;
  layout: HTMLElement;
  data?: Record<string, any>;
}

export class NavigationEngine {
  private screens: Map<string, Screen> = new Map();
  private history: string[] = [];
  private currentScreenId: string | null = null;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Đăng ký một màn hình
   */
  register(screen: Screen): void {
    this.screens.set(screen.id, screen);
    screen.layout.style.display = 'none';
    this.container.appendChild(screen.layout);
  }

  /**
   * Chuyển đến màn hình theo id
   */
  navigate(screenId: string, addToHistory: boolean = true): void {
    const target = this.screens.get(screenId);
    if (!target) {
      console.error(`Navigation: screen "${screenId}" not found`);
      return;
    }

    // Ẩn màn hình hiện tại
    if (this.currentScreenId) {
      const current = this.screens.get(this.currentScreenId);
      if (current) {
        current.layout.style.display = 'none';
      }
    }

    // Hiển thị màn hình mới
    target.layout.style.display = 'block';
    
    // Cập nhật lịch sử
    if (addToHistory && this.currentScreenId) {
      this.history.push(this.currentScreenId);
    }
    
    this.currentScreenId = screenId;
  }

  /**
   * Quay lại màn hình trước đó
   */
  back(): void {
    if (this.history.length === 0) return;
    const previousScreenId = this.history.pop()!;
    this.navigate(previousScreenId, false);
  }

  /**
   * Lấy màn hình hiện tại
   */
  getCurrent(): Screen | null {
    if (!this.currentScreenId) return null;
    return this.screens.get(this.currentScreenId) || null;
  }

  /**
   * Lấy danh sách tất cả màn hình đã đăng ký
   */
  list(): string[] {
    return Array.from(this.screens.keys());
  }

  /**
   * Xóa lịch sử (ví dụ khi về home)
   */
  clearHistory(): void {
    this.history = [];
  }
}
