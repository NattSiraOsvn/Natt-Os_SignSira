/**
 * INTERACTION ENGINE — v0.1 (PILOT)
 * @cell: render-stack-cell
 * @status: pilot — bắt sự kiện người dùng, map về memory state
 * 
 * Lắng nghe các sự kiện DOM (click, hover, input) và chuyển đổi
 * thành các thay đổi trạng thái ký ức tương ứng
 */

export type InteractionType = 'click' | 'hover' | 'focus' | 'blur' | 'input' | 'scroll';

export interface InteractionMapping {
  elementId: string;
  interaction: InteractionType;
  targetState: string;
  handler?: (event: Event) => void;
}

export interface InteractionEvent {
  elementId: string;
  interaction: InteractionType;
  timestamp: number;
  originalEvent: Event;
}

export class InteractionEngine {
  private mappings: Map<string, InteractionMapping[]> = new Map();
  private listeners: Map<string, (e: Event) => void> = new Map();
  private container: HTMLElement;
  public state: string = 'active';
  private eventLog: InteractionEvent[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Đăng ký một mapping: element + sự kiện → memory state
   */
  map(mapping: InteractionMapping): void {
    const key = this.getKey(mapping.elementId, mapping.interaction);
    
    // Lưu mapping
    const existing = this.mappings.get(key) || [];
    existing.push(mapping);
    this.mappings.set(key, existing);

    // Gắn listener nếu chưa có
    if (!this.listeners.has(key)) {
      const listener = (event: Event) => {
        this.handleInteraction(mapping.elementId, mapping.interaction, event);
      };
      this.listeners.set(key, listener);
      this.attachListener(mapping.elementId, mapping.interaction, listener);
    }
  }

  /**
   * Xử lý khi có tương tác
   */
  private handleInteraction(elementId: string, interaction: InteractionType, event: Event): void {
    // Log sự kiện
    const interactionEvent: InteractionEvent = {
      elementId,
      interaction,
      timestamp: Date.now(),
      originalEvent: event
    };
    this.eventLog.push(interactionEvent);

    // Thực thi handler của từng mapping
    const key = this.getKey(elementId, interaction);
    const mappings = this.mappings.get(key) || [];
    for (const mapping of mappings) {
      if (mapping.handler) {
        mapping.handler(event);
      }
    }

    // Dispatch custom event để hệ thống khác lắng nghe
    const customEvent = new CustomEvent('natt-interaction', {
      detail: {
        elementId,
        interaction,
        targetState: mappings[0]?.targetState,
        timestamp: interactionEvent.timestamp
      }
    });
    this.container.dispatchEvent(customEvent);
  }

  /**
   * Gắn listener vào element trong container
   */
  private attachListener(elementId: string, interaction: InteractionType, listener: (e: Event) => void): void {
    // Tìm element trong container
    const findAndAttach = () => {
      const element = this.container.querySelector(`#${elementId}`);
      if (element) {
        element.addEventListener(interaction, listener);
        return true;
      }
      return false;
    };

    // Thử ngay lập tức
    if (!findAndAttach()) {
      // Nếu chưa có, thử lại sau khi DOM cập nhật
      const observer = new MutationObserver(() => {
        if (findAndAttach()) {
          observer.disconnect();
        }
      });
      observer.observe(this.container, { childList: true, subtree: true });
    }
  }

  /**
   * Lấy danh sách các tương tác đã ghi nhận
   */
  getEventLog(): InteractionEvent[] {
    return [...this.eventLog];
  }

  /**
   * Xóa lịch sử tương tác
   */
  clearEventLog(): void {
    this.eventLog = [];
  }

  /**
   * Hủy tất cả listener
   */
  destroy(): void {
    for (const [key, listener] of this.listeners.entries()) {
      // Parse key để tìm element và interaction type
      const parts = key.split(':');
      const elementId = parts[0];
      const interaction = parts[1] as InteractionType;
      const element = this.container.querySelector(`#${elementId}`);
      if (element) {
        element.removeEventListener(interaction, listener);
      }
    }
    this.listeners.clear();
    this.mappings.clear();
    this.eventLog = [];
  }

  private getKey(elementId: string, interaction: InteractionType): string {
    return `${elementId}:${interaction}`;
  }
}
