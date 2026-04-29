// components/IntelligencePanel.js

function delayColor(delay) {
  if (delay >= 6000) return '#FF7070';
  if (delay >= 3000) return '#FFD09A';
  return '#7FFFCC';
}

function barWidth(failCount) {
  return Math.min(failCount * 18, 100);
}

export function renderIntelligence(flows) {
  const el = document.getElementById('intelligence');
  const summary = document.getElementById('intel-summary');
  if (!el) return;

  const empty = el.querySelector('.empty-state');
  if (empty && flows.length > 0) empty.remove();

  // Summary chips
  if (summary) {
    const healthy = flows.filter(f => f.failCount === 0).length;
    const failing = flows.filter(f => f.failCount >= 2).length;
    summary.innerHTML = `
      <span class="isumm-chip isumm-h">${healthy} healthy</span>
      ${failing > 0 ? `<span class="isumm-chip isumm-f">${failing} failing</span>` : ''}
      <span class="isumm-chip isumm-o">${flows.length} total flows</span>`;
  }

  // Full re-render only on intel change (controlled by store.intelChanged)
  el.innerHTML = '';

  if (flows.length === 0) {
    el.innerHTML = '<div class="empty-state">no flow data yet…</div>';
    return;
  }

  flows.forEach(f => {
    const failing = f.failCount >= 2;
    const warning = f.failCount === 1;
    const cls = failing ? 'failing' : warning ? 'warning' : '';
    const col = delayColor(f.adaptiveDelay || 0);
    const bw  = barWidth(f.failCount || 0);

    const div = document.createElement('div');
    div.className = `flow ${cls}`;
    div.innerHTML = `
      <div class="fl-name">${f.flow || f.from || '—'}</div>
      <div class="fl-row"><span>fails</span><span class="fl-val" style="color:${col}">${f.failCount ?? 0}</span></div>
      <div class="fl-row"><span>delay</span><span class="fl-val">${f.adaptiveDelay ?? 0}ms</span></div>
      ${f.lastFailAt ? `<div class="fl-row"><span>last fail</span><span class="fl-val" style="font-size:7px">${new Date(f.lastFailAt).toLocaleTimeString('vi')}</span></div>` : ''}
      <div class="fl-bar-wrap"><div class="fl-bar" style="width:${bw}%;background:${col}"></div></div>`;
    el.appendChild(div);
  });
}
