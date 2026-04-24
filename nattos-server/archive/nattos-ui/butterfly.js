// effects/butterfly.js — Natt-OS Butterfly Effect Engine
// CSS-class based — không dùng inline style spam

const BF_DURATION = 600;

function addThenRemove(el, cls) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth; // reflow để reset animation
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), BF_DURATION);
}

// pulse: box-shadow glow theo loại event
export function pulse(el, type = 'default') {
  const cls = {
    anomaly:  'bf-pulse-red',
    healing:  'bf-pulse-yel',
    sales:    'bf-pulse-mint',
    default:  'bf-pulse-lav',
  }[type] || 'bf-pulse-lav';
  addThenRemove(el, cls);
}

// ripple: scale container nhẹ khi có event mới
export function ripple(container) {
  addThenRemove(container, 'bf-ripple');
}

// flash: background flash cho anomaly critical
export function flash(el, type = 'anomaly') {
  const cls = {
    anomaly: 'bf-flash-r',
    healing: 'bf-flash-y',
    sales:   'bf-flash-g',
  }[type] || 'bf-flash-r';
  addThenRemove(el, cls);
}

// classify event type for color routing
export function classifyEvent(eventName) {
  if (!eventName) return 'default';
  const e = eventName.toLowerCase();
  if (e.includes('anomaly') || e.includes('critical') || e.includes('violation')) return 'anomaly';
  if (e.includes('self-healing') || e.includes('retry') || e.includes('escalat')) return 'healing';
  if (e.includes('sales') || e.includes('order') || e.includes('payment')) return 'sales';
  if (e.includes('production') || e.includes('casting') || e.includes('stone')) return 'production';
  if (e.includes('audit') || e.includes('constitutional')) return 'audit';
  return 'default';
}
