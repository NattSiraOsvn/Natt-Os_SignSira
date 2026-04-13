import { useEffect, useState } from 'react';

export function useSSE<T = any>(eventType: string, handler: (data: T) => void) {
  useEffect(() => {
    const eventSource = new EventSource('/mach/heyna');

    const listener = (e: MessageEvent) => {
      try {
        const event = JSON.parse(e.data);
        if (event.event_type === eventType) {
          handler(event.payload);
        }
      } catch (err) {
        console.error('SSE parse error', err);
      }
    };

    eventSource.addEventListener('message', listener);
    // Có thể cần lắng nghe các event cụ thể nếu server gửi theo từng type riêng

    return () => {
      eventSource.removeEventListener('message', listener);
      eventSource.close();
    };
  }, [eventType, handler]);
}