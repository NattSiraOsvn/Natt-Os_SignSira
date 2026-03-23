/**
 * NATT-OS Payment Module v1.0
 * Tâm Luxury — Thanh Toán Đơn Hàng
 *
 * Tích hợp:
 *   - VietQR (chuẩn NAPAS — quét được mọi app ngân hàng)
 *   - Vietinbank chuyển khoản confirm
 *   - COD — thu tiền khi giao
 *   - Zalo Pay link
 *
 * Dùng: NattosPayment.show({ orderId, amount, customer, note })
 * Inject: <script src="nattos-payment.js"></script>
 *
 * LỆNH #001 compliant — zero external API
 */

const NattosPayment = (() => {
'use strict';

// ── CONFIG — Thông tin tài khoản Tâm Luxury ──────────────────────────────
const CONFIG = {
  bank: {
    name:      'Vietinbank',
    bankCode:  '970415',          // Mã ngân hàng VietQR
    accountNo: '108002580xxx',    // ← Anh điền TK thật vào đây
    accountName: 'CONG TY TNHH VAT BAC DA QUY TAM LUXURY',
    branch:    'Chi Nhánh Hồ Chí Minh',
  },
  zaloPayUrl: 'https://zalopay.vn/qr-code/', // deeplink
  confirmTimeout: 120, // giây chờ xác nhận
};

// ── VIETQR URL GENERATOR ──────────────────────────────────────────────────
// Chuẩn VietQR v2 — quét được bằng mọi app ngân hàng VN
function buildVietQRUrl(amount, orderId, note) {
  const base = 'https://img.vietqr.io/image';
  const bank = CONFIG.bank.bankCode;
  const acc  = CONFIG.bank.accountNo;
  const amt  = Math.round(amount);
  const desc = encodeURIComponent(`${orderId} ${note || 'Thanh toan don hang'}`);
  const accName = encodeURIComponent(CONFIG.bank.accountName);
  return `${base}/${bank}-${acc}-compact2.png?amount=${amt}&addInfo=${desc}&accountName=${accName}`;
}

// ── CSS INJECTION ─────────────────────────────────────────────────────────
function injectCSS() {
  if (document.getElementById('nattos-pay-css')) return;
  const s = document.createElement('style');
  s.id = 'nattos-pay-css';
  s.textContent = `
.npay-overlay{position:fixed;inset:0;background:rgba(0,0,0,.88);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;z-index:9500;animation:npay-in .25s ease}
@keyframes npay-in{from{opacity:0}to{opacity:1}}
.npay-modal{background:#0d1017;border:1px solid rgba(200,146,42,.3);border-radius:8px;width:540px;max-height:92vh;display:flex;flex-direction:column;box-shadow:0 32px 80px rgba(0,0,0,.9);overflow:hidden;animation:npay-scale .3s cubic-bezier(.23,1,.32,1)}
@keyframes npay-scale{from{transform:scale(.95) translateY(16px);opacity:0}to{transform:none;opacity:1}}
.npay-hdr{padding:14px 18px;border-bottom:1px solid rgba(200,146,42,.14);display:flex;align-items:center;justify-content:space-between;background:rgba(200,146,42,.06)}
.npay-title{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.18em;color:#e8b84b;text-transform:uppercase}
.npay-close{background:none;border:none;color:#60503a;cursor:pointer;font-size:22px;line-height:1;padding:0 4px}
.npay-close:hover{color:#ede0c8}
.npay-tabs{display:flex;border-bottom:1px solid rgba(200,146,42,.1)}
.npay-tab{flex:1;padding:10px;font-size:11px;font-weight:600;color:#a89070;cursor:pointer;border-bottom:2px solid transparent;background:none;border-top:none;border-left:none;border-right:none;font-family:'Be Vietnam Pro',sans-serif;transition:all .15s}
.npay-tab:hover{color:#ede0c8}.npay-tab.active{color:#e8b84b;border-bottom-color:#c8922a;background:rgba(200,146,42,.05)}
.npay-body{padding:18px;overflow-y:auto;flex:1}
.npay-amount-box{background:rgba(200,146,42,.08);border:1px solid rgba(200,146,42,.2);border-radius:6px;padding:14px 16px;margin-bottom:16px;text-align:center}
.npay-amount-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.18em;color:#60503a;text-transform:uppercase;margin-bottom:6px}
.npay-amount-value{font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:500;background:linear-gradient(135deg,#f5d080,#e8b84b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.npay-order-meta{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
.npay-meta-item{font-family:'JetBrains Mono',monospace;font-size:10px;padding:3px 8px;background:rgba(200,146,42,.08);border:1px solid rgba(200,146,42,.15);border-radius:2px;color:#a89070}
/* QR Tab */
.npay-qr-wrap{display:flex;flex-direction:column;align-items:center;gap:12px}
.npay-qr-img{width:220px;height:220px;background:#fff;border-radius:6px;padding:8px;display:flex;align-items:center;justify-content:center}
.npay-qr-img img{width:100%;height:100%;object-fit:contain}
.npay-bank-info{background:rgba(8,8,20,.6);border:1px solid rgba(200,146,42,.14);border-radius:4px;padding:12px 14px;width:100%}
.npay-bank-row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(200,146,42,.06);font-size:11px}
.npay-bank-row:last-child{border-bottom:none}.npay-bank-label{color:#60503a}.npay-bank-val{font-weight:600;color:#ede0c8;font-family:'JetBrains Mono',monospace}
.npay-copy-btn{width:100%;padding:8px;background:rgba(200,146,42,.1);border:1px solid rgba(200,146,42,.2);color:#e8b84b;border-radius:3px;font-size:11px;font-weight:600;cursor:pointer;font-family:'Be Vietnam Pro',sans-serif;transition:all .15s}
.npay-copy-btn:hover{background:rgba(200,146,42,.2)}
/* CK Tab */
.npay-ck-info{background:rgba(8,8,20,.6);border:1px solid rgba(200,146,42,.14);border-radius:4px;padding:14px;margin-bottom:12px}
.npay-ck-row{display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(200,146,42,.06);font-size:12px}
.npay-ck-row:last-child{border-bottom:none}.npay-ck-label{color:#60503a;font-size:11px}.npay-ck-val{font-family:'JetBrains Mono',monospace;font-weight:600;color:#ede0c8;display:flex;align-items:center;gap:6px}
.npay-ck-copy{background:none;border:1px solid rgba(200,146,42,.2);color:#a89070;padding:2px 7px;border-radius:2px;font-size:9px;cursor:pointer;font-family:monospace}
.npay-ck-copy:hover{color:#e8b84b;border-color:rgba(200,146,42,.4)}
/* COD Tab */
.npay-cod-box{background:rgba(61,214,140,.06);border:1px solid rgba(61,214,140,.2);border-radius:4px;padding:14px;margin-bottom:12px;font-size:12px;line-height:1.8;color:#a89070}
.npay-cod-title{color:#3dd68c;font-weight:600;margin-bottom:8px;font-size:13px}
/* Confirm section */
.npay-confirm-section{margin-top:14px;padding-top:14px;border-top:1px solid rgba(200,146,42,.1)}
.npay-confirm-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.14em;color:#60503a;text-transform:uppercase;margin-bottom:8px}
.npay-ref-input{width:100%;background:rgba(8,8,20,.6);border:1px solid rgba(200,146,42,.2);color:#ede0c8;padding:8px 10px;font-size:12px;border-radius:3px;outline:none;font-family:'Be Vietnam Pro',sans-serif;margin-bottom:8px}
.npay-ref-input:focus{border-color:#e8b84b}
.npay-confirm-btn{width:100%;padding:11px;background:linear-gradient(135deg,rgba(61,214,140,.15),rgba(61,214,140,.05));border:1px solid rgba(61,214,140,.3);color:#3dd68c;border-radius:3px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Be Vietnam Pro',sans-serif;letter-spacing:.04em;transition:all .2s}
.npay-confirm-btn:hover{background:linear-gradient(135deg,rgba(61,214,140,.25),rgba(61,214,140,.1));box-shadow:0 0 20px -4px rgba(61,214,140,.3)}
.npay-timer{font-family:'JetBrains Mono',monospace;font-size:11px;color:#f0a030;text-align:center;margin-bottom:8px}
.npay-footer{padding:12px 18px;border-top:1px solid rgba(200,146,42,.1);display:flex;gap:8px;justify-content:flex-end;background:rgba(8,8,20,.4)}
.npay-btn-cancel{padding:8px 16px;background:transparent;border:1px solid rgba(200,146,42,.14);color:#a89070;border-radius:3px;font-size:11px;cursor:pointer;font-family:'Be Vietnam Pro',sans-serif}
.npay-btn-cancel:hover{border-color:rgba(200,146,42,.3);color:#ede0c8}
.npay-badge-paid{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(61,214,140,.12);border:1px solid rgba(61,214,140,.3);border-radius:3px;color:#3dd68c;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600}
`;
  document.head.appendChild(s);
}

// ── STATE ─────────────────────────────────────────────────────────────────
let currentPayment = null;
let timerInterval  = null;
let onSuccess      = null;

// ── MAIN: SHOW PAYMENT MODAL ──────────────────────────────────────────────
function show(opts = {}) {
  injectCSS();

  const {
    orderId  = 'TL-' + Date.now().toString().slice(-6),
    amount   = 0,
    customer = '—',
    note     = '',
    method   = 'qr',      // 'qr' | 'ck' | 'cod'
    onPaid   = null,
  } = opts;

  currentPayment = { orderId, amount, customer, note, method };
  onSuccess = onPaid;

  // Remove existing
  document.getElementById('nattos-pay-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'nattos-pay-overlay';
  overlay.className = 'npay-overlay';
  overlay.onclick = e => { if (e.target === overlay) close(); };

  const qrUrl = buildVietQRUrl(amount, orderId, note || customer);
  const amtFmt = amount.toLocaleString('vi-VN') + '₫';
  const bankNo = CONFIG.bank.accountNo;
  const bankName = CONFIG.bank.name;
  const accName = CONFIG.bank.accountName;

  overlay.innerHTML = `
    <div class="npay-modal">
      <div class="npay-hdr">
        <span class="npay-title">💳 Thanh Toán Đơn Hàng</span>
        <button class="npay-close" onclick="NattosPayment.close()">×</button>
      </div>
      <div class="npay-tabs">
        <button class="npay-tab active" onclick="NattosPayment.switchTab('qr',this)">📱 QR VietQR</button>
        <button class="npay-tab" onclick="NattosPayment.switchTab('ck',this)">🏦 Chuyển Khoản</button>
        <button class="npay-tab" onclick="NattosPayment.switchTab('cod',this)">💵 COD</button>
      </div>
      <div class="npay-body">
        <!-- Amount -->
        <div class="npay-amount-box">
          <div class="npay-amount-label">Số Tiền Cần Thanh Toán</div>
          <div class="npay-amount-value">${amtFmt}</div>
        </div>
        <div class="npay-order-meta">
          <span class="npay-meta-item">Đơn: ${orderId}</span>
          <span class="npay-meta-item">KH: ${customer}</span>
          ${note ? `<span class="npay-meta-item">${note}</span>` : ''}
        </div>

        <!-- QR TAB -->
        <div id="npay-tp-qr">
          <div class="npay-qr-wrap">
            <div class="npay-qr-img">
              <img src="${qrUrl}" alt="VietQR" onerror="this.parentElement.innerHTML='<div style=\\'color:#f0a030;font-size:10px;text-align:center;padding:10px\\'>Không load được QR<br>Dùng tab Chuyển Khoản</div>'">
            </div>
            <div style="font-size:10px;color:#60503a;text-align:center">
              Quét bằng bất kỳ app ngân hàng nào · VietQR chuẩn NAPAS
            </div>
            <div class="npay-bank-info">
              ${[
                ['Ngân Hàng', bankName],
                ['Số Tài Khoản', bankNo],
                ['Chủ Tài Khoản', accName],
                ['Số Tiền', amtFmt],
                ['Nội Dung CK', `${orderId} ${customer}`],
              ].map(([l,v])=>`<div class="npay-bank-row"><span class="npay-bank-label">${l}</span><span class="npay-bank-val">${v}</span></div>`).join('')}
            </div>
            <button class="npay-copy-btn" onclick="NattosPayment.copyInfo()">📋 Copy Thông Tin CK</button>
          </div>
          ${_confirmSection(orderId)}
        </div>

        <!-- CK TAB -->
        <div id="npay-tp-ck" style="display:none">
          <div class="npay-ck-info">
            ${[
              ['Ngân Hàng', bankName, false],
              ['Số Tài Khoản', bankNo, true],
              ['Chủ TK', accName, false],
              ['Chi Nhánh', CONFIG.bank.branch, false],
              ['Số Tiền', amtFmt, true],
              ['Nội Dung', `${orderId} ${customer}`, true],
            ].map(([l,v,copy])=>`
              <div class="npay-ck-row">
                <span class="npay-ck-label">${l}</span>
                <span class="npay-ck-val">${v}
                  ${copy ? `<button class="npay-ck-copy" onclick="NattosPayment.copyText('${v}')">copy</button>` : ''}
                </span>
              </div>`).join('')}
          </div>
          ${_confirmSection(orderId)}
        </div>

        <!-- COD TAB -->
        <div id="npay-tp-cod" style="display:none">
          <div class="npay-cod-box">
            <div class="npay-cod-title">💵 Thu Tiền Mặt Khi Giao Hàng</div>
            <div>Nhân viên giao hàng thu <strong style="color:#ede0c8">${amtFmt}</strong> từ khách khi giao.</div>
            <div style="margin-top:8px;color:#f0a030">⚠️ Ghi nhận sau khi đã thu tiền thực tế</div>
          </div>
          <div class="npay-confirm-section">
            <div class="npay-confirm-label">Xác Nhận Đã Thu Tiền</div>
            <input class="npay-ref-input" id="npay-cod-note" placeholder="Ghi chú: Đã thu tiền mặt ${amtFmt} từ ${customer}...">
            <button class="npay-confirm-btn" onclick="NattosPayment.confirmCOD()">✓ XÁC NHẬN ĐÃ THU TIỀN COD</button>
          </div>
        </div>

      </div>
      <div class="npay-footer">
        <button class="npay-btn-cancel" onclick="NattosPayment.close()">Hủy</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
}

function _confirmSection(orderId) {
  return `
    <div class="npay-confirm-section">
      <div class="npay-confirm-label">Xác Nhận Đã Nhận Tiền</div>
      <div class="npay-timer" id="npay-timer">Chờ xác nhận thanh toán...</div>
      <input class="npay-ref-input" id="npay-ref" placeholder="Mã giao dịch / Số tham chiếu ngân hàng...">
      <button class="npay-confirm-btn" onclick="NattosPayment.confirmPaid()">✅ XÁC NHẬN TIỀN ĐÃ VỀ</button>
    </div>`;
}

// ── SWITCH TAB ────────────────────────────────────────────────────────────
function switchTab(tab, el) {
  document.querySelectorAll('.npay-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  ['qr','ck','cod'].forEach(t => {
    const el = document.getElementById(`npay-tp-${t}`);
    if (el) el.style.display = t === tab ? 'block' : 'none';
  });
}

// ── COPY ──────────────────────────────────────────────────────────────────
function copyText(text) {
  navigator.clipboard?.writeText(text)
    .then(() => _toast('✓ Đã copy: ' + text.slice(0,30)))
    .catch(() => {
      const el = document.createElement('textarea');
      el.value = text; document.body.appendChild(el);
      el.select(); document.execCommand('copy');
      document.body.removeChild(el);
      _toast('✓ Đã copy');
    });
}

function copyInfo() {
  if (!currentPayment) return;
  const p = currentPayment;
  const text = [
    `Ngân hàng: ${CONFIG.bank.name}`,
    `Số TK: ${CONFIG.bank.accountNo}`,
    `Chủ TK: ${CONFIG.bank.accountName}`,
    `Số tiền: ${p.amount.toLocaleString('vi-VN')}đ`,
    `Nội dung: ${p.orderId} ${p.customer}`,
  ].join('\n');
  copyText(text);
}

// ── CONFIRM PAID ──────────────────────────────────────────────────────────
function confirmPaid() {
  const ref = document.getElementById('npay-ref')?.value?.trim();
  if (!ref) {
    _toast('Nhập mã giao dịch / tham chiếu ngân hàng', 'warn');
    return;
  }
  _finalize({ method: 'CK/QR', ref, note: '' });
}

function confirmCOD() {
  const note = document.getElementById('npay-cod-note')?.value?.trim();
  _finalize({ method: 'COD', ref: 'COD-' + Date.now().toString().slice(-6), note });
}

function _finalize(payInfo) {
  const p = currentPayment;
  if (!p) return;

  const result = {
    orderId:   p.orderId,
    amount:    p.amount,
    customer:  p.customer,
    method:    payInfo.method,
    ref:       payInfo.ref,
    paidAt:    new Date().toISOString(),
    paidAtVN:  new Date().toLocaleString('vi-VN'),
    status:    'PAID',
  };

  // Callback
  if (typeof onSuccess === 'function') onSuccess(result);

  // Store in window for app to pick up
  window._lastPayment = result;

  // Close modal
  close();

  // Success toast
  _toast(`✅ Xác nhận thanh toán ${p.amount.toLocaleString('vi-VN')}₫ — ${payInfo.method}`, 'success');

  // Dispatch event for other modules
  window.dispatchEvent(new CustomEvent('nattos-payment-confirmed', { detail: result }));
}

// ── CLOSE ─────────────────────────────────────────────────────────────────
function close() {
  clearInterval(timerInterval);
  document.getElementById('nattos-pay-overlay')?.remove();
  currentPayment = null;
  onSuccess = null;
}

// ── TOAST ─────────────────────────────────────────────────────────────────
function _toast(msg, type = 'info') {
  // Dùng toast của app nếu có, fallback về alert
  if (typeof window.toast === 'function') {
    window.toast(msg, type);
  } else {
    const tw = document.getElementById('tw') || document.querySelector('.tw');
    if (tw) {
      const el = document.createElement('div');
      el.className = `toast ${type}`;
      const color = type==='success'?'#3dd68c':type==='warn'?'#f0a030':'#e8b84b';
      el.innerHTML = `<span style="color:${color};font-weight:700">${type==='success'?'✓':'ℹ'}</span><span style="font-size:12px">${msg}</span>`;
      el.style.cssText = 'background:#0d1017;border:1px solid rgba(200,146,42,.3);border-radius:4px;padding:10px 14px;display:flex;align-items:center;gap:8px;animation:si .25s ease;max-width:320px';
      if (type==='success') el.style.borderLeft='3px solid #3dd68c';
      tw.appendChild(el);
      setTimeout(() => { el.style.opacity='0'; setTimeout(()=>el.remove(),300); }, 3500);
    } else {
      console.log('[Payment]', msg);
    }
  }
}

// ── PUBLIC API ────────────────────────────────────────────────────────────
return { show, close, switchTab, copyText, copyInfo, confirmPaid, confirmCOD, CONFIG };

})();

// Expose globally
if (typeof window !== 'undefined') window.NattosPayment = NattosPayment;
if (typeof module !== 'undefined') module.exports = NattosPayment;
