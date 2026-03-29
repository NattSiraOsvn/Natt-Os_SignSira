// core/store.js — NATT-OS State Store
// Source of truth: /api/audit + /api/intelligence

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
