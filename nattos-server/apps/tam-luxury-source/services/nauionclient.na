// KHÔNG import gì từ src/cells. Chỉ gọi fetch.
export const NAUION_ENDPOINT = '/phat/nauion';

export interface NauionPayload {
  event_type: string;
  payload: any;
  event_id?: string;      // UI tự tạo, server sẽ dùng hoặc tạo mới
  causation_id?: string;  // nếu có event cha
}

export async function phatNauion(payload: NauionPayload): Promise<Response> {
  const eventId = payload.event_id || crypto.randomUUID();
  const body = {
    ...payload,
    event_id: eventId,
    timestamp: Date.now(),
  };
  return fetch(NAUION_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}