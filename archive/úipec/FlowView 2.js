// components/FlowView.js
import { ripple, classifyEvent } from '../effects/butterfly.js';

const MAX_NODES = 12;

export function renderFlow(events, newEvents = []) {
  const el = document.getElementById('flow-view');
  const cnt = document.getElementById('flow-cnt');
  if (!el) return;

  const empty = el.querySelector('.empty-state');
  if (empty && newEvents.length > 0) empty.remove();
  if (newEvents.length === 0) return;

  // Butterfly: ripple container on new event cascade
  ripple(el);

  newEvents.slice(-8).forEach(e => {
    const type = classifyEvent(e.event);
    const nodeClass = type === 'anomaly' ? 'anom' : type === 'healing' ? 'heal' : '';
    const div = document.createElement('div');
    div.className = `node ${nodeClass}`;
    div.innerHTML = `
      <div class="nd-event">${e.event || '—'}</div>
      ${e.causedBy ? `<div class="nd-from">← ${e.causedBy}</div>` : ''}`;
    el.insertBefore(div, el.firstChild);
  });

  // Prune
  while (el.children.length > MAX_NODES) {
    el.removeChild(el.lastChild);
  }

  if (cnt) cnt.textContent = `${el.children.length} nodes`;
}
