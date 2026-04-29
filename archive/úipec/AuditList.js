// components/AuditList.js
import { pulse, flash, classifyEvent } from '../effects/butterfly.js';

const MAX_EVENTS = 60;

function formatTs(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
  } catch { return ''; }
}

export function renderAudit(events, newEvents = []) {
  const el = document.getElementById('audit-list');
  const cnt = document.getElementById('audit-cnt');
  if (!el) return;

  // Remove empty state
  const empty = el.querySelector('.empty-state');
  if (empty) empty.remove();

  // Prepend new events only (diff render — không rebuild full DOM)
  newEvents.slice(-20).reverse().forEach(e => {
    const type = classifyEvent(e.event);
    const div = document.createElement('div');
    div.className = `event ${type}`;
    div.innerHTML = `
      <div><span class="ev-ts">${formatTs(e.timestamp)}</span><span class="ev-type">${e.event || '—'}</span></div>
      ${e.hash ? `<div class="ev-hash"># ${e.hash.slice(0,12)}…</div>` : ''}`;

    el.insertBefore(div, el.firstChild);

    // Butterfly effect per event type
    if (type === 'anomaly') {
      pulse(div, 'anomaly');
      flash(div, 'anomaly');
    } else if (type === 'healing') {
      pulse(div, 'healing');
    } else if (type === 'sales') {
      pulse(div, 'sales');
    } else {
      pulse(div, 'default');
    }
  });

  // Prune old entries
  while (el.children.length > MAX_EVENTS) {
    el.removeChild(el.lastChild);
  }

  if (cnt) cnt.textContent = `${events.length} events`;
}
