/**
 * Natt-OS Chromatic Immune System v1.0
 * EventBus subscriber — nhận state signal, render chromatic swarm
 * KHÔNG tự tính state. Chỉ nhận từ EventBus.
 */

const CHROMATIC_STATES = ['critical','risk','warning','drift','nominal','stable','optimal'];

const SWARM_INTENSITY = {
  primary:   1.0,
  secondary: 0.5,
  tertiary:  0.2
};

// EventBus subscriber
function subscribeChromatic(eventBus) {
  eventBus.on('cell.state', (payload) => {
    const { source_cell, state, confidence } = payload;

    if (!CHROMATIC_STATES.includes(state)) {
      console.warn(`[Chromatic] Unknown state: ${state}`);
      return;
    }

    // Audit log
    console.log(`[Chromatic] ${source_cell} → ${state} (confidence: ${confidence})`);

    // Apply swarm signal to bound components
    const bound = document.querySelectorAll(
      `[data-ui][data-cell="${source_cell}"]:not([data-ui-layer="1"])`
    );

    bound.forEach((el, i) => {
      const tier = i === 0 ? 'primary' : i < 3 ? 'secondary' : 'tertiary';
      el.setAttribute('data-state', state);
      el.setAttribute('data-chromatic-tier', tier);
      el.style.setProperty('--chromatic-intensity', SWARM_INTENSITY[tier] * confidence);
    });
  });

  // Reset khi state về nominal/stable
  eventBus.on('cell.state.reset', ({ source_cell }) => {
    document.querySelectorAll(`[data-cell="${source_cell}"]`).forEach(el => {
      el.removeAttribute('data-state');
      el.removeAttribute('data-chromatic-tier');
      el.style.removeProperty('--chromatic-intensity');
    });
  });
}

// Quantum Defense hook (critical only)
function hookQuantumDefense(eventBus, securityCell) {
  eventBus.on('cell.state', ({ source_cell, state }) => {
    if (state === 'critical') {
      // Signal security-cell — không tự xử lý
      securityCell.emit('quantum.freeze.request', { target: source_cell });
    }
  });
}

export { subscribeChromatic, hookQuantumDefense };
