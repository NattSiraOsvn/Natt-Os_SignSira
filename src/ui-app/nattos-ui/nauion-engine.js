// ═══════════════════════════════════════════════════════════
// NAUION ENGINE v2 — đã fix 3 lỗi Thiên Lớn chỉ ra
// ═══════════════════════════════════════════════════════════

export const NAUION = {
  HeyNa:  'HeyNa',
  Nahere: 'Nahere',
  whao:   'whao',
  whau:   'whau',
  nauion: 'nauion',
  lech:   'lệch',
  // FIX #1 (Thiên Lớn): key phải là 'gay', không phải 'gây'
  // 'gây' là tiếng Việt có dấu → NAUION.gây undefined
  gay:    'gãy',
};

// ── MAP EVENT → NAUION SIGNAL ────────────────────────────
// FIX #2 (Thiên Lớn): thêm case NAUION.nauion — trước đây không bao giờ emit
// → hệ không bao giờ "đạt trạng thái đúng"

export function toNauion(eventName) {
  if (!eventName) return { signal: NAUION.whao, intensity: 0.3, color: 'lav', viet: 'tín hiệu' };

  const e = eventName.toLowerCase();

  // gãy / collapse — THIÊN LỚN FIX: dùng NAUION.gay (không phải gây)
  if (e.includes('escalat') || e.includes('collapse') || e.includes('circuit.break'))
    return { signal: NAUION.gay, intensity: 1.0, color: 'red', viet: 'gãy dòng' };

  // anomaly → whao mạnh
  if (e.includes('anomaly') || e.includes('violation') || e.includes('critical'))
    return { signal: NAUION.whao, intensity: 1.0, color: 'red', viet: 'lệch nặng' };

  // self-healing retry → whao vàng
  if (e.includes('retry') || e.includes('self-heal'))
    return { signal: NAUION.whao, intensity: 0.72, color: 'yel', viet: 'đang hồi' };

  // FIX #2: NAUION.nauion phải được emit
  // Stable / healthy / success → nauion (hệ đạt trạng thái đúng)
  if (e.includes('nauion') || e.includes('stable') || e.includes('healthy')
    || e.includes('success') || e.includes('optimal'))
    return { signal: NAUION.nauion, intensity: 0.85, color: 'vio', viet: 'nauion' };

  // whau: đã xử lý, đã ghi nhớ
  if (e.includes('recorded') || e.includes('completed') || e.includes('closed')
    || e.includes('calculated') || e.includes('approved') || e.includes('cleared')
    || e.includes('dispatched') || e.includes('issued') || e.includes('registered'))
    return { signal: NAUION.whau, intensity: 0.62, color: 'mint', viet: 'đã xử lý' };

  // sales / order / payment → whao lan
  if (e.includes('sales') || e.includes('order') || e.includes('payment') || e.includes('confirm'))
    return { signal: NAUION.whao, intensity: 0.78, color: 'mint', viet: 'đơn chạy' };

  // audit / record → whau (hệ nhớ)
  if (e.includes('audit') || e.includes('record'))
    return { signal: NAUION.whau, intensity: 0.52, color: 'lav', viet: 'hệ nhớ' };

  // cell.metric / health → Nahere
  if (e.includes('metric') || e.includes('health') || e.includes('cell.'))
    return { signal: NAUION.Nahere, intensity: 0.40, color: 'ice', viet: 'nahere' };

  // production flow → whao nhẹ
  if (e.includes('production') || e.includes('casting') || e.includes('stone')
    || e.includes('polish') || e.includes('finish'))
    return { signal: NAUION.whao, intensity: 0.55, color: 'peach', viet: 'dòng chảy' };

  return { signal: NAUION.whao, intensity: 0.35, color: 'lav', viet: 'tín hiệu' };
}

// ── PATTERN MEMORY (L4.5) ────────────────────────────────
// FIX #3 (Thiên Lớn): push() phải được gọi TỪNG EVENT qua toNauion() → push
// Xem app.js: mỗi event → const {signal} = toNauion(e.event); patternMemory.push(signal)

const MEMORY_KEY = 'nauion_pattern_v2';
const MAX_MEM    = 200;

export const patternMemory = {
  patterns: [],
  currentChain: [],

  load() {
    try {
      const s = localStorage.getItem(MEMORY_KEY);
      if (s) this.patterns = JSON.parse(s);
    } catch {}
  },

  save() {
    try {
      localStorage.setItem(MEMORY_KEY, JSON.stringify(this.patterns.slice(-MAX_MEM)));
    } catch {}
  },

  // FIX #3: push() nhận signal TỪ toNauion() trong luồng event thật
  push(signal) {
    this.currentChain.push(signal);
    if (this.currentChain.length > 4) this.currentChain.shift();
    if (this.currentChain.length >= 3) {
      this._record(this.currentChain.slice(-3));
    }
  },

  _record(chain) {
    const flow = chain.join('→');
    const ex   = this.patterns.find(p => p.flow === flow);
    if (ex) { ex.count++; ex.meaning = this._infer(chain); }
    else    { this.patterns.push({ flow, count: 1, meaning: this._infer(chain) }); }
    this._reclassify();
    this.save();
  },

  // Hệ tự suy nghĩa — không hardcode
  _infer(chain) {
    const last = chain[chain.length - 1];
    // FIX #2 impact: giờ nauion thật sự xuất hiện trong chain
    if (chain.includes(NAUION.gay))    return 'gãy';
    if (last === NAUION.nauion)        return 'đúng';
    if (chain.every(s => s === NAUION.whao)) return 'lệch';
    if (last === NAUION.whau)          return 'thiếu';
    if (last === NAUION.Nahere)        return 'học';
    return 'học';
  },

  _reclassify() {
    for (const p of this.patterns) {
      if (p.count >= 8  && p.meaning === 'đúng') p.meaning = 'chuẩn';
      if (p.count >= 5  && p.meaning === 'lệch') p.meaning = 'lệch-thường';
    }
  },

  getTop(n = 5) {
    return [...this.patterns].sort((a,b) => b.count - a.count).slice(0, n);
  },

  // Tự suy trạng thái từ 12 pattern gần nhất
  // Thiên Lớn: cần dựa vào trend + frequency, không chỉ ngưỡng cứng
  currentState() {
    if (this.patterns.length === 0) return NAUION.HeyNa;
    const recent = this.patterns.slice(-12);
    const total  = recent.reduce((s,p) => s + p.count, 0) || 1;
    // Weight: chuẩn/đúng = +2, thiếu/học = +0.5, lệch = -1, gãy = -3
    const score = recent.reduce((s,p) => {
      const w = p.meaning==='chuẩn'?2 : p.meaning==='đúng'?1.5 : p.meaning==='thiếu'||p.meaning==='học'?0.3 : p.meaning==='lệch'||p.meaning==='lệch-thường'?-1 : p.meaning==='gãy'?-3 : 0;
      return s + w * p.count;
    }, 0);
    const norm = score / total;
    if (norm >= 1.0)  return NAUION.nauion;
    if (norm <= -0.5) return NAUION.lech;
    return NAUION.Nahere;
  }
};

patternMemory.load();
