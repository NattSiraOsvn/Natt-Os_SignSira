// core/store.js — natt-os State Store
// Source of truth: /kenh/vet + /kenh/intel

export const store = {
  audit: [],
  flows: {},
  intelligence: [],

  _lastAuditLen: 0,
  _lastIntelHash: '',

  updateAudit(events) {
    this.audit = events;
  },

  updateIntelligence(data) {
    this.intelligence = data.flows || [];
  },

  // diff: returns only NEW events since last tick
  getNewAuditEvents() {
    const prev = this._lastAuditLen;
    this._lastAuditLen = this.audit.length;
    if (this.audit.length > prev) {
      return this.audit.slice(prev);
    }
    return [];
  },

  // Returns true if intel changed
  intelChanged() {
    const h = JSON.stringify(this.intelligence.map(f => f.failCount + f.adaptiveDelay));
    if (h !== this._lastIntelHash) {
      this._lastIntelHash = h;
      return true;
    }
    return false;
  }
};

// ── Mạch HeyNa — subscribe SSE ──
import { machHeyna } from './adapter.js';

store.machOn = false;
store.impedanceZ = 1.0;
store._closeMach = null;

store.startMach = function() {
  if (store.machOn) return;
  store.machOn = true;
  store._closeMach = machHeyna(
    (data) => {
      // Nhận event từ Mạch HeyNa
      if (data.event === 'cell.metric' && data.payload?.cell) {
        if (!store.flows[data.payload.cell]) store.flows[data.payload.cell] = {};
        store.flows[data.payload.cell][data.payload.metric] = { value: data.payload.value, ts: data.ts };
      }
      if (data.event === 'Nahere' && data.payload?.impedanceZ !== undefined) {
        store.impedanceZ = data.payload.impedanceZ;
      }
      if (data.event === 'audit.record') {
        store.audit.push(data.payload);
        if (store.audit.length > 1000) store.audit.shift();
      }
    },
    () => {
      // Whao fallback — mạch đứt
      store.machOn = false;
      setTimeout(() => store.startMach(), 3000);
    }
  );
};

store.stopMach = function() {
  if (store._closeMach) store._closeMach();
  store.machOn = false;
};
