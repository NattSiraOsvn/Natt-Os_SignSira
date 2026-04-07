/**
 * NATT-OS Document Engine v2.0
 * Tâm Luxury — Full file format support
 *
 * HỖ TRỢ:
 *  PDF       → PDF.js (text layer, multi-page)
 *  Image     → Canvas (JPG/PNG/HEIC/WebP)
 *  Excel     → SheetJS (xlsx/xls/xlsm/xlsb)
 *  Word      → Mammoth.js (docx/doc)
 *  CSV       → Papa.parse
 *  TXT/MD/LOG→ Native FileReader
 *  JSON      → JSON.parse + preview
 *  ZIP       → JSZip (peek contents list)
 *
 * LỆNH GATEKEEPER #001 — zero external AI API
 * All libs loaded from cdnjs.cloudflare.com (no server needed)
 */

// ── CDN LIBS ─────────────────────────────────────────────────────────────────
const _LIBS = {
  pdfjs:    { url:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',         check:()=>!!window.pdfjsLib },
  xlsx:     { url:'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',       check:()=>!!window.XLSX },
  mammoth:  { url:'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js', check:()=>!!window.mammoth },
  papaparse:{ url:'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js',  check:()=>!!window.Papa },
  jszip:    { url:'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',          check:()=>!!window.JSZip },
};

async function _loadLib(name) {
  if (_LIBS[name].check()) return;
  await new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = _LIBS[name].url;
    s.onload = res;
    s.onerror = () => rej(new Error('Cannot load: ' + name));
    document.head.appendChild(s);
  });
  if (name === 'pdfjs') {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
}

// ── FILE TYPE DETECTOR ───────────────────────────────────────────────────────
function _detectType(file) {
  const mime = file.type.toLowerCase();
  const ext  = file.name.split('.').pop().toLowerCase();
  if (mime === 'application/pdf' || ext === 'pdf')                                      return 'PDF';
  if (mime.startsWith('image/') || ['jpg','jpeg','png','gif','webp','heic','bmp'].includes(ext)) return 'IMAGE';
  if (['xlsx','xls','xlsm','xlsb'].includes(ext) || mime.includes('spreadsheet') || mime.includes('excel')) return 'EXCEL';
  if (['docx','doc','rtf'].includes(ext) || mime.includes('word'))                      return 'WORD';
  if (ext === 'csv' || mime === 'text/csv')                                             return 'CSV';
  if (ext === 'json' || mime === 'application/json')                                    return 'JSON';
  if (['zip','rar','7z'].includes(ext) || mime.includes('zip'))                         return 'ZIP';
  return 'TEXT';
}

// ── DOCUMENT KEYWORDS (SuperDictionary) ──────────────────────────────────────
const _DOC_KW = {
  GDB:        ['GIAY DAM BAO','GDB','PHIEU DAM BAO','BAO HANH','TAM LUXURY CERT'],
  INVOICE:    ['HOA DON','INVOICE','VAT','GTGT','01GTKT','PHIEU THU','E-INVOICE'],
  PRODUCTION: ['LENH SAN XUAT','JOB BAG','PRODUCTION ORDER','PHIEU GIAO VIEC','CASTING','THO KIM HOAN'],
  SALARY:     ['BANG LUONG','PAYROLL','LUONG THANG','SALARY','BHXH','PIT','TNCN','LUONG CO BAN'],
  CUSTOMS:    ['TO KHAI','CUSTOMS','HS CODE','CERTIFICATE OF ORIGIN','BILL OF LADING','PACKING LIST'],
  BANKING:    ['SAO KE','STATEMENT','GIAO DICH NGAN HANG','CREDIT ADVICE','DEBIT','SO PHU'],
  CONTRACT:   ['HOP DONG LAO DONG','CONTRACT','AGREEMENT','KY KET','THOÁ THUAN'],
  HR:         ['HO SO NHAN SU','NHAN VIEN','EMPLOYEE','CCCD','CMND','LY LICH'],
  INVENTORY:  ['TON KHO','INVENTORY','NHAP KHO','XUAT KHO','THE KHO','STOCK REPORT'],
};

function _classify(text) {
  const up = (text||'').toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/Đ/g,'D').replace(/đ/g,'d');
  const scores = {};
  for (const [type, kws] of Object.entries(_DOC_KW)) {
    scores[type] = kws.filter(kw => up.includes(kw)).length;
  }
  const sorted = Object.entries(scores).sort((a,b) => b[1]-a[1]);
  return {
    type: sorted[0][1] > 0 ? sorted[0][0] : 'UNKNOWN',
    confidence: Math.min(sorted[0][1] / 2 * 100, 95),
    scores,
  };
}

// ── GDB EXTRACTOR ─────────────────────────────────────────────────────────────
const _GDB = {
  cert:         /(?:TL[-.]?\d{4}[-.]?\d{3,6})/i,
  customer:     /(?:Tên KH|Khách hàng|Customer|Họ tên|HO TEN)[:\s]+([^\n\r|;,]{3,50})/i,
  phone:        /(?:SĐT|Phone|Tel|Điện thoại)[:\s]*(0\d{9}|\+84\d{9})/i,
  cccd:         /(?:CCCD|CMND|ID)[:\s]*(\d{9,12})/i,
  productName:  /(?:Sản phẩm|Product|Tên hàng|MÔ TẢ)[:\s]+([^\n\r|;]{3,60})/i,
  goldPurity:   /\b(24[Kk]|18[Kk]|14[Kk]|10[Kk]|9{3,4}|750|585|417)\b/,
  weight:       /(?:Trọng lượng|Weight|KL|Nặng)[:\s]*([\d.,]+)\s*(?:chỉ|gram|g\b)?/i,
  purchaseDate: /(?:Ngày mua|Date|Ngày bán)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
  price:        /(?:Giá|Price|Trị giá|Giá bán)[:\s]*([\d.,]{3,})/i,
  stoneSpec:    /(?:Đá|Stone|Kim cương|Diamond|Hột chủ)[:\s]+([^\n\r|;]{3,60})/i,
  buybackPol:   /(?:Thu hồi|Buyback)[:\s]*([\d]+)\s*%?/i,
  exchangePol:  /(?:Đổi|Exchange)[:\s]*([\d]+)\s*%?/i,
};

const _GOLD_MAP = {'999':'24K','24K':'24K','750':'18K','18K':'18K','14K':'14K','585':'14K','10K':'10K','417':'10K'};
const _GOLD_RATES = {'24K':0.95,'18K':0.88,'14K':0.82,'10K':0.75};

function _extractGDB(text) {
  const m = (pat, t, g=1) => { try { const r=pat.exec(t); return r ? (r[g]||r[0]).trim() : null; } catch{ return null; } };
  const ex = {
    cert: m(_GDB.cert, text, 0),
    customer: m(_GDB.customer, text),
    phone: m(_GDB.phone, text),
    cccd: m(_GDB.cccd, text),
    productName: m(_GDB.productName, text),
    stoneSpec: m(_GDB.stoneSpec, text),
    purchaseDate: m(_GDB.purchaseDate, text),
    goldType: null, goldKarat: null, buyRate: 0.88,
    weight: null, purchasePrice: null,
    buybackPolicy: 20, exchangePolicy: 10,
  };
  const gm = m(_GDB.goldPurity, text, 0);
  if (gm) {
    const k = _GOLD_MAP[gm.toUpperCase()];
    if (k) { ex.goldType=gm; ex.goldKarat=k; ex.buyRate=_GOLD_RATES[k]||0.88; }
  }
  const wm = m(_GDB.weight, text);
  if (wm) ex.weight = parseFloat(wm.replace(',','.')) || null;
  const pm = m(_GDB.price, text);
  if (pm) ex.purchasePrice = parseInt(pm.replace(/[.,]/g,'')) || null;
  const bp = m(_GDB.buybackPol, text);
  if (bp) ex.buybackPolicy = parseFloat(bp) || 20;
  const ep = m(_GDB.exchangePol, text);
  if (ep) ex.exchangePolicy = parseFloat(ep) || 10;
  const filled = Object.values(ex).filter(v=>v!==null&&v!==0&&v!==0.88&&v!==20&&v!==10).length;
  ex.confidence = Math.round(filled / 10 * 100);
  return ex;
}

// ── TABLE EXTRACTORS ──────────────────────────────────────────────────────────
function _extractSalary(tables) {
  if (!tables?.length) return null;
  const rows = tables[0].rows || [];
  const hdrs = (rows[0]||[]).map(h=>String(h||'').toLowerCase());
  const ci = hdrs.findIndex(h=>h.includes('mã')||h.includes('code'));
  const ni = hdrs.findIndex(h=>h.includes('tên')||h.includes('name'));
  const gi = hdrs.findIndex(h=>h.includes('cơ bản')||h.includes('gross')||h.includes('lương'));
  const neti= hdrs.findIndex(h=>h.includes('net')||h.includes('thực lãnh'));
  const records = rows.slice(1).filter(r=>r.length>1).map(r=>({
    code:  ci>=0 ? String(r[ci]||'') : '',
    name:  ni>=0 ? String(r[ni]||'') : '',
    gross: gi>=0 ? parseInt(String(r[gi]||'').replace(/\D/g,''))||0 : 0,
    net:   neti>=0? parseInt(String(r[neti]||'').replace(/\D/g,''))||0 : 0,
  })).filter(r=>r.name||r.code);
  return { records, total: records.reduce((s,r)=>s+(r.net||r.gross),0), count: records.length };
}

function _extractInventory(tables) {
  if (!tables?.length) return null;
  const rows = tables[0].rows || [];
  const hdrs = (rows[0]||[]).map(h=>String(h||'').toLowerCase());
  const ni = hdrs.findIndex(h=>h.includes('tên')||h.includes('hàng')||h.includes('name'));
  const qi = hdrs.findIndex(h=>h.includes('số lượng')||h.includes('qty')||h.includes('sl'));
  const ui = hdrs.findIndex(h=>h.includes('đvt')||h.includes('unit'));
  const pi = hdrs.findIndex(h=>h.includes('giá')||h.includes('price'));
  return rows.slice(1).filter(r=>r.length>1).map(r=>({
    name:  ni>=0?String(r[ni]||''):'',
    qty:   qi>=0?parseFloat(String(r[qi]||'').replace(/,/g,'.'))||0:0,
    unit:  ui>=0?String(r[ui]||''):'',
    price: pi>=0?parseInt(String(r[pi]||'').replace(/\D/g,''))||0:0,
  })).filter(r=>r.name);
}

// ── FILE READERS ──────────────────────────────────────────────────────────────
const _Readers = {

  async pdf(file) {
    await _loadLib('pdfjs');
    const ab = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({data:ab}).promise;
    let text='';
    const pages = pdf.numPages;
    for (let i=1; i<=Math.min(pages,20); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += `\n[PAGE ${i}]\n` + content.items.map(x=>x.str).join(' ');
    }
    return { text, source:'PDF', pages, tables:[] };
  },

  async excel(file) {
    await _loadLib('xlsx');
    const ab = await file.arrayBuffer();
    const wb = window.XLSX.read(ab, {type:'array', cellDates:true});
    let text = `EXCEL: ${file.name}\n`;
    const tables = [];
    for (const sn of wb.SheetNames) {
      const ws = wb.Sheets[sn];
      const rows = window.XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
      tables.push({name:sn, rows});
      text += `[SHEET: ${sn}] ${rows.length} rows\n`;
      text += rows.slice(0,8).map(r=>r.join('\t')).join('\n') + '\n';
      // Full flat text cho classify
      text += rows.flat().join(' ') + '\n';
    }
    return { text, source:'EXCEL', sheets:wb.SheetNames.length, tables };
  },

  async word(file) {
    await _loadLib('mammoth');
    const ab = await file.arrayBuffer();
    const [raw, html] = await Promise.all([
      window.mammoth.extractRawText({arrayBuffer:ab}),
      window.mammoth.convertToHtml({arrayBuffer:ab}),
    ]);
    return { text: raw.value, html: html.value, source:'WORD', tables:[] };
  },

  async csv(file) {
    await _loadLib('papaparse');
    const text = await file.text();
    const parsed = window.Papa.parse(text, {header:true, skipEmptyLines:true, dynamicTyping:true});
    const fields = parsed.meta?.fields || [];
    const rows = [fields, ...parsed.data.map(r => fields.map(f=>r[f]??''))];
    return { text, source:'CSV', tables:[{name:'CSV',rows}], records:parsed.data };
  },

  async json(file) {
    const text = await file.text();
    let parsed=null;
    try { parsed=JSON.parse(text); } catch(e){}
    return { text, source:'JSON', parsed, tables:[] };
  },

  async zip(file) {
    await _loadLib('jszip');
    const ab = await file.arrayBuffer();
    const zip = await window.JSZip.loadAsync(ab);
    const names = Object.keys(zip.files).filter(n=>!zip.files[n].dir).slice(0,100);
    const text = `ZIP: ${file.name}\n${names.length} files:\n${names.join('\n')}`;
    return { text, source:'ZIP', fileList:names, tables:[] };
  },

  async image(file) {
    return new Promise(res => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width=img.width; c.height=img.height;
        c.getContext('2d').drawImage(img,0,0);
        URL.revokeObjectURL(url);
        res({ text:`IMAGE: ${file.name} [${img.width}x${img.height}]`, source:'IMAGE',
              imageData:c.toDataURL('image/jpeg',.82), width:img.width, height:img.height, tables:[] });
      };
      img.onerror = () => { URL.revokeObjectURL(url); res({text:`IMAGE: ${file.name}`,source:'IMAGE',tables:[]}); };
      img.src = url;
    });
  },

  async text(file) {
    const text = await file.text();
    return { text, source:'TEXT', tables:[] };
  },
};

// ── MAIN ENGINE ───────────────────────────────────────────────────────────────
const NattDocEngine = {

  version: '2.0',

  async process(file) {
    const t0 = Date.now();
    try {
      const fileType = _detectType(file);
      let raw;
      switch(fileType) {
        case 'PDF':   raw = await _Readers.pdf(file);   break;
        case 'EXCEL': raw = await _Readers.excel(file); break;
        case 'WORD':  raw = await _Readers.word(file);  break;
        case 'CSV':   raw = await _Readers.csv(file);   break;
        case 'JSON':  raw = await _Readers.json(file);  break;
        case 'ZIP':   raw = await _Readers.zip(file);   break;
        case 'IMAGE': raw = await _Readers.image(file); break;
        default:      raw = await _Readers.text(file);  break;
      }
      raw = raw || {text:'',tables:[]};

      const cls = _classify(raw.text);
      let docType = cls.type;

      // Force GDB nếu filename gợi ý
      if (/GDB|GUARANTEE|DAM.BAO|PHIEU.BH|WARRANTY/i.test(file.name)) docType = 'GDB';

      let extracted = null;
      if (docType === 'GDB')             extracted = _extractGDB(raw.text);
      else if (docType === 'SALARY')     extracted = _extractSalary(raw.tables);
      else if (docType === 'INVENTORY')  extracted = _extractInventory(raw.tables);

      const hash = await this._hash(file.name + file.size + (file.lastModified||0));

      return {
        ok: true,
        fileType, docType,
        confidence: cls.confidence,
        source: raw.source,
        fileName: file.name,
        fileSize: file.size,
        fileSizeLabel: this._fmtSize(file.size),
        pages: raw.pages,
        sheets: raw.sheets,
        fileList: raw.fileList,
        tableCount: (raw.tables||[]).length,
        tables: raw.tables,
        text: (raw.text||'').slice(0,1000),
        extracted,
        imageData: raw.imageData || null,
        hash,
        processedMs: Date.now()-t0,
        processedAt: new Date().toLocaleString('vi-VN'),
      };
    } catch(err) {
      return { ok:false, error:err.message, fileName:file.name, fileType:_detectType(file) };
    }
  },

  async processAll(files, onProgress) {
    const results = [];
    for (let i=0; i<files.length; i++) {
      if (onProgress) onProgress(i, files.length, files[i].name);
      results.push(await this.process(files[i]));
    }
    return results;
  },

  generateGDBTemplate(d={}) {
    const now=new Date();
    const date=`${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
    return `GIẤY ĐẢM BẢO SẢN PHẨM (CẤP LẠI)
CÔNG TY TNHH VÀNG BẠC ĐÁ QUÝ TÂM LUXURY
MST: 0315xxxxxx · 123 Đường ABC, Q.1, TP.HCM

Số GĐB    : ${d.cert||'TL'+now.getFullYear()+'-XXXX'} (Cấp lại)
Ngày cấp  : ${date}
Lý do     : Khách hàng khai báo mất giấy đảm bảo gốc

=== KHÁCH HÀNG ===
Tên KH    : ${d.customer||'—'}
SĐT       : ${d.phone||'—'}
CCCD/CMND : ${d.cccd||'—'}

=== SẢN PHẨM ===
Sản phẩm  : ${d.productName||'—'}
Chất liệu : ${d.goldKarat||'Vàng 18K'}
Trọng lượng: ${d.weight||'—'} chỉ
Đá chủ    : ${d.stoneSpec||'—'}
Ngày mua  : ${d.purchaseDate||'—'}
Giá bán   : ${d.purchasePrice?(+d.purchasePrice).toLocaleString('vi-VN')+'₫':'—'}

=== CHÍNH SÁCH ===
Thu hồi (Buyback) : ${100-(d.buybackPolicy||20)}%
Đổi lên (Exchange): ${100-(d.exchangePolicy||10)}%

Nhân viên : ${d.processedBy||'—'} (${d.processedByCode||'—'})
Giám đốc  : ________________________`.trim();
  },

  fileIcon(fileType, docType) {
    const dIcons={GDB:'📄',INVOICE:'🧾',PRODUCTION:'🏭',SALARY:'💰',CUSTOMS:'🚢',BANKING:'🏦',CONTRACT:'📋',HR:'👤',INVENTORY:'📦'};
    const fIcons={PDF:'📋',EXCEL:'📊',WORD:'📝',CSV:'🗃',JSON:'⚙️',ZIP:'🗜',IMAGE:'🖼',TEXT:'📃'};
    return dIcons[docType] || fIcons[fileType] || '📎';
  },

  _fmtSize(b) {
    if(b<1024) return b+'B'; if(b<1048576) return (b/1024).toFixed(1)+'KB'; return (b/1048576).toFixed(1)+'MB';
  },

  async _hash(s) {
    const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
    return Array.from(new Uint8Array(b)).slice(0,8).map(x=>x.toString(16).padStart(2,'0')).join('');
  },
};

window.NattDocEngine = NattDocEngine;
console.log('[NattDocEngine] v2.0 — PDF/Excel/Word/CSV/JSON/ZIP/Image — LỆNH #001 OK');
