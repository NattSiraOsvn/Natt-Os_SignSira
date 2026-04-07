/**
 * NATT-OS EOD Report Engine v1.0
 * Tâm Luxury — Báo Cáo Cuối Ngày
 *
 * Cách dùng: thêm 1 dòng vào bất kỳ HTML nào:
 *   <script src="nattos-eod-engine.js"></script>
 *
 * Engine tự detect role từ login context,
 * render đúng template báo cáo theo vị trí.
 *
 * LỆNH GATEKEEPER #001 compliant — zero external API
 */

(function() {
'use strict';

// ── ROLE → TEMPLATE MAP ─────────────────────────────────────────────────────
const EOD_TEMPLATES = {

  sale: {
    label: 'Sale Online / Showroom',
    icon: '💎',
    color: '#e8b84b',
    sections: [
      {
        id: 'sales_summary', title: '📊 Tổng Kết Doanh Số',
        fields: [
          {id:'revenue_total',     label:'Tổng Doanh Thu Hôm Nay (₫)',  type:'number', required:true},
          {id:'orders_new',        label:'Số Đơn Mới',                   type:'number', required:true},
          {id:'orders_completed',  label:'Số Đơn Hoàn Thành',            type:'number'},
          {id:'customers_met',     label:'Số KH Tiếp Cận/Tư Vấn',       type:'number'},
          {id:'customers_deposit', label:'Số KH Đặt Cọc',               type:'number'},
        ]
      },
      {
        id: 'channel', title: '📱 Kênh Bán',
        fields: [
          {id:'channel_showroom',  label:'Showroom (₫)',   type:'number'},
          {id:'channel_online',    label:'Online/Zalo (₫)',type:'number'},
          {id:'channel_ctv',       label:'CTV giới thiệu', type:'number'},
        ]
      },
      {
        id: 'commission', title: '💰 Hoa Hồng Ước Tính',
        fields: [
          {id:'comm_shell',  label:'HH Vỏ ước tính (₫)',  type:'number'},
          {id:'comm_stone',  label:'HH Đá ước tính (₫)',  type:'number'},
          {id:'note_pending',label:'Đơn/KH Đang Theo Đuổi',type:'textarea'},
        ]
      },
      {
        id: 'issue', title: '⚠️ Vấn Đề & Đề Xuất',
        fields: [
          {id:'customer_complaint',label:'Phản Hồi / Khiếu Nại KH', type:'textarea'},
          {id:'stock_request',     label:'Yêu Cầu Hàng / SP Hết', type:'textarea'},
          {id:'suggestion',        label:'Đề Xuất Cải Tiến',      type:'textarea'},
        ]
      },
    ]
  },

  ctv: {
    label: 'CTV / Cộng Tác Viên',
    icon: '🤝',
    color: '#a78bfa',
    sections: [
      {
        id: 'ctv_sales', title: '📊 Kết Quả Hôm Nay',
        fields: [
          {id:'leads_contacted', label:'Số Lead Liên Hệ',         type:'number', required:true},
          {id:'leads_interested',label:'Số Lead Quan Tâm',        type:'number'},
          {id:'orders_referred', label:'Số Đơn Giới Thiệu Thành', type:'number', required:true},
          {id:'revenue_referred',label:'Doanh Thu Giới Thiệu (₫)',type:'number'},
        ]
      },
      {
        id: 'ctv_comm', title: '💰 Hoa Hồng',
        fields: [
          {id:'comm_expected', label:'HH Dự Kiến (₫)', type:'number'},
          {id:'note_leads',    label:'Ghi Chú Lead Đang Tiếp Cận', type:'textarea'},
        ]
      },
    ]
  },

  production: {
    label: 'Thợ / Tổ Sản Xuất',
    icon: '🔥',
    color: '#f0a030',
    sections: [
      {
        id: 'prod_output', title: '🏭 Sản Lượng Hôm Nay',
        fields: [
          {id:'orders_processed',  label:'Số Đơn Xử Lý',            type:'number', required:true},
          {id:'orders_completed',  label:'Số Đơn Hoàn Thành Công Đoạn', type:'number', required:true},
          {id:'stage_current',     label:'Công Đoạn Phụ Trách',     type:'select',
           options:['Tổ Đúc','Tổ Nguội','Tổ Hột','Nhám Bóng','QC']},
          {id:'hours_worked',      label:'Số Giờ Làm Việc',         type:'number'},
        ]
      },
      {
        id: 'material', title: '⚖️ Nguyên Liệu & Hao Hụt',
        fields: [
          {id:'gold_received',  label:'Vàng Nhận (chỉ)',          type:'number'},
          {id:'gold_returned',  label:'Vàng Giao Lại (chỉ)',      type:'number'},
          {id:'gold_recovery',  label:'Phoi/Vụn Thu Hồi (chỉ)',  type:'number'},
          {id:'loss_pct',       label:'Hao Hụt Thực Tế (%)',     type:'number'},
        ]
      },
      {
        id: 'prod_issue', title: '🔧 Vấn Đề Kỹ Thuật',
        fields: [
          {id:'quality_issue',   label:'Lỗi / Sự Cố Kỹ Thuật',  type:'textarea'},
          {id:'tool_broken',     label:'Dụng Cụ Hỏng / Thiếu',  type:'textarea'},
          {id:'note_tomorrow',   label:'Việc Cần Làm Tiếp Theo', type:'textarea'},
        ]
      },
    ]
  },

  warehouse: {
    label: 'Thủ Kho',
    icon: '📦',
    color: '#2dd4bf',
    sections: [
      {
        id: 'wh_txn', title: '📋 Giao Dịch Kho Hôm Nay',
        fields: [
          {id:'receipts_count',  label:'Số Phiếu Nhập',         type:'number', required:true},
          {id:'issues_count',    label:'Số Phiếu Xuất',         type:'number', required:true},
          {id:'transfers_count', label:'Số Lệnh Điều Chuyển',   type:'number'},
          {id:'stockcheck_done', label:'Kiểm Kê Định Kỳ',       type:'select',
           options:['Không','Có — Đúng','Có — Phát Hiện Chênh Lệch']},
        ]
      },
      {
        id: 'wh_alert', title: '🚨 Cảnh Báo Tồn Kho',
        fields: [
          {id:'low_stock_items',label:'Mặt Hàng Dưới Ngưỡng (liệt kê)', type:'textarea'},
          {id:'missing_items',  label:'Hàng Hóa Thiếu / Không Khớp',   type:'textarea'},
        ]
      },
      {
        id: 'wh_note', title: '📝 Ghi Chú',
        fields: [
          {id:'pending_delivery',label:'Hàng Chờ Giao / Nhận',  type:'textarea'},
          {id:'note_issue',      label:'Sự Cố / Đề Xuất',       type:'textarea'},
        ]
      },
    ]
  },

  accounting: {
    label: 'Kế Toán / KTT',
    icon: '📊',
    color: '#60b8f0',
    sections: [
      {
        id: 'acc_approval', title: '✅ Phê Duyệt Hôm Nay',
        fields: [
          {id:'ck_approved',    label:'Số Lệnh CK Đã Duyệt',     type:'number', required:true},
          {id:'ck_amount',      label:'Tổng Tiền Đã CK (₫)',      type:'number', required:true},
          {id:'invoice_issued', label:'Số Hóa Đơn Xuất',         type:'number'},
          {id:'invoice_amount', label:'Tổng Trị Giá HĐ (₫)',      type:'number'},
        ]
      },
      {
        id: 'acc_reconcile', title: '🔢 Đối Chiếu Tài Chính',
        fields: [
          {id:'bank_balance',   label:'Số Dư TK Vietinbank (₫)', type:'number'},
          {id:'cash_on_hand',   label:'Tiền Mặt Tại Quỹ (₫)',   type:'number'},
          {id:'pending_ck',     label:'Số CK Chờ Duyệt Còn Lại', type:'number'},
          {id:'diff_note',      label:'Chênh Lệch / Giải Thích', type:'textarea'},
        ]
      },
      {
        id: 'acc_tax', title: '🏛️ Thuế & Tuân Thủ',
        fields: [
          {id:'vat_collected',  label:'VAT Thu Hôm Nay (₫)',     type:'number'},
          {id:'compliance_note',label:'Vấn Đề Tuân Thủ / Rủi Ro', type:'textarea'},
        ]
      },
    ]
  },

  hr: {
    label: 'HR / Nhân Sự',
    icon: '👥',
    color: '#a78bfa',
    sections: [
      {
        id: 'hr_attendance', title: '🕐 Chấm Công',
        fields: [
          {id:'present_count', label:'Số NV Có Mặt',          type:'number', required:true},
          {id:'absent_count',  label:'Số NV Vắng Mặt',        type:'number', required:true},
          {id:'late_count',    label:'Số NV Đi Trễ',          type:'number'},
          {id:'leave_count',   label:'Số NV Nghỉ Phép',       type:'number'},
        ]
      },
      {
        id: 'hr_event', title: '📋 Sự Kiện Nhân Sự',
        fields: [
          {id:'new_staff',      label:'NV Mới / Onboard',     type:'textarea'},
          {id:'resign_note',    label:'NV Nghỉ Việc / Báo',   type:'textarea'},
          {id:'discipline_note',label:'Vi Phạm / Kỷ Luật',   type:'textarea'},
          {id:'hr_pending',     label:'Việc HR Tồn Đọng',     type:'textarea'},
        ]
      },
    ]
  },

  operations: {
    label: 'Vận Hành',
    icon: '⚙️',
    color: '#60b8f0',
    sections: [
      {
        id: 'ops_orders', title: '📋 Xử Lý Đơn',
        fields: [
          {id:'orders_advanced',label:'Đơn Chuyển Công Đoạn', type:'number', required:true},
          {id:'orders_late',    label:'Đơn Trễ Hạn',          type:'number'},
          {id:'orders_urgent',  label:'Đơn Gấp Xử Lý',       type:'number'},
          {id:'files_processed',label:'File Chứng Từ Xử Lý',  type:'number'},
        ]
      },
      {
        id: 'ops_logistics', title: '🚚 Hậu Cần',
        fields: [
          {id:'shipments_sent',    label:'Vận Đơn Tạo/Gửi',    type:'number'},
          {id:'transfers_created', label:'Lệnh Điều Chuyển',    type:'number'},
          {id:'logistics_issue',   label:'Sự Cố Vận Chuyển',   type:'textarea'},
        ]
      },
      {
        id: 'ops_note', title: '📝 Tổng Kết',
        fields: [
          {id:'wac_updated',label:'WAC Cập Nhật Hôm Nay', type:'select',
           options:['Không','Có — Đúng','Có — Cần Xem Lại']},
          {id:'ops_pending',label:'Việc Tồn Đọng Cần Xử Lý Ngày Mai', type:'textarea'},
        ]
      },
    ]
  },

  design3d: {
    label: 'Thiết Kế 3D / SKU',
    icon: '🎨',
    color: '#3dd68c',
    sections: [
      {
        id: 'design_output', title: '🎨 Sản Phẩm Thiết Kế',
        fields: [
          {id:'sku_created',   label:'Số SKU Tạo Mới',         type:'number', required:true},
          {id:'sku_revised',   label:'Số SKU Chỉnh Sửa',       type:'number'},
          {id:'files_uploaded',label:'Số File 3D Upload',       type:'number'},
          {id:'render_done',   label:'Số Ảnh Render Hoàn Thành',type:'number'},
        ]
      },
      {
        id: 'design_feedback', title: '💬 Phản Hồi & Chỉnh Sửa',
        fields: [
          {id:'feedback_received', label:'Yêu Cầu Chỉnh Từ Xưởng/Sale', type:'textarea'},
          {id:'design_note',       label:'Ghi Chú Kỹ Thuật',             type:'textarea'},
          {id:'pending_designs',   label:'Thiết Kế Đang Làm Dở',         type:'textarea'},
        ]
      },
    ]
  },

  master: {
    label: 'MASTER / Giám Đốc',
    icon: '👑',
    color: '#f5d080',
    sections: [
      {
        id: 'master_summary', title: '📊 Tổng Kết Ngày',
        fields: [
          {id:'revenue_day',    label:'Doanh Thu Hôm Nay (₫)',    type:'number', required:true},
          {id:'orders_total',   label:'Tổng Đơn Hàng Hôm Nay',   type:'number'},
          {id:'staff_present',  label:'Số NV Có Mặt / Tổng',      type:'text', placeholder:'e.g. 119/122'},
          {id:'approved_today', label:'Lệnh Phê Duyệt',           type:'number'},
        ]
      },
      {
        id: 'master_flag', title: '🚨 Flagged Items',
        fields: [
          {id:'risk_items',     label:'Rủi Ro / Vấn Đề Cần Chú Ý', type:'textarea'},
          {id:'decision_made',  label:'Quyết Định / Chỉ Đạo Hôm Nay', type:'textarea'},
          {id:'tomorrow_focus', label:'Ưu Tiên Ngày Mai',           type:'textarea'},
        ]
      },
    ]
  },
};

// ── ROLE DETECTION ──────────────────────────────────────────────────────────
function detectRole() {
  // Thử lấy từ user context của từng app
  if (window.user?.role) {
    const r = window.user.role;
    if (r.includes('master') || r.includes('MASTER')) return 'master';
    if (r.includes('kt') || r.includes('accounting') || r.includes('ktt')) return 'accounting';
    if (r.includes('hr')) return 'hr';
    if (r.includes('design')) return 'design3d';
    if (r.includes('wh') || r.includes('warehouse')) return 'warehouse';
    if (r.includes('ops') || r.includes('operation')) return 'operations';
    if (r.includes('production') || r.includes('factory')) return 'production';
    if (r.includes('ctv')) return 'ctv';
    if (r.includes('sale')) return 'sale';
  }
  // Thử lấy từ URL
  const url = window.location.href.toLowerCase();
  if (url.includes('master')) return 'master';
  if (url.includes('ktt')) return 'accounting';
  if (url.includes('hr-manager')) return 'hr';
  if (url.includes('warehouse')) return 'warehouse';
  if (url.includes('operations')) return 'operations';
  if (url.includes('production')) return 'production';
  if (url.includes('showroom') || url.includes('tamluxury') || url.includes('order-flow')) return 'sale';
  if (url.includes('pricing')) return 'sale';
  if (url.includes('attendance')) return 'hr';
  return 'sale'; // default
}

function getEmployeeName() {
  return window.user?.name || document.getElementById('tu')?.textContent || 'Nhân Viên';
}
function getEmployeeCode() {
  return window.user?.code || '—';
}

// ── STORED REPORTS ──────────────────────────────────────────────────────────
const EOD_STORE_KEY = 'nattos_eod_reports';
function loadReports() {
  try { return JSON.parse(localStorage.getItem(EOD_STORE_KEY) || '[]'); } catch { return []; }
}
function saveReport(report) {
  try {
    const list = loadReports();
    list.unshift(report);
    localStorage.setItem(EOD_STORE_KEY, JSON.stringify(list.slice(0, 90)));
  } catch(e) { console.warn('[EOD] localStorage unavailable, storing in memory'); }
  window._eodReports = window._eodReports || [];
  window._eodReports.unshift(report);
}

// ── CSS INJECTION ───────────────────────────────────────────────────────────
function injectCSS() {
  if (document.getElementById('nattos-eod-css')) return;
  const style = document.createElement('style');
  style.id = 'nattos-eod-css';
  style.textContent = `
:root{--eod-gold:#e8b84b;--eod-bg:#0d1017;--eod-bg2:#121820;--eod-border:rgba(200,146,42,.18);--eod-text:#ede0c8;--eod-text2:#a89070;--eod-text3:#60503a;--eod-green:#3dd68c;--eod-red:#f05050;--eod-amber:#f0a030}
#nattos-eod-fab{position:fixed;bottom:24px;left:24px;z-index:9000;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;transition:all .2s}
#nattos-eod-fab:hover #eod-btn{transform:scale(1.08)}
#eod-btn{width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#c8922a,#e8b84b);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 4px 20px rgba(200,146,42,.4);transition:all .2s}
#eod-label{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--eod-gold);letter-spacing:.12em;text-transform:uppercase;background:rgba(0,0,0,.7);padding:2px 7px;border-radius:10px;white-space:nowrap}
#eod-badge{position:absolute;top:-3px;right:-3px;width:18px;height:18px;border-radius:50%;background:var(--eod-red);color:#fff;font-size:9px;font-weight:700;display:none;align-items:center;justify-content:center;font-family:monospace}
#nattos-eod-panel{position:fixed;bottom:0;left:0;width:520px;max-height:90vh;background:var(--eod-bg);border:1px solid var(--eod-border);border-bottom:none;border-left:none;border-radius:0 12px 0 0;z-index:9001;display:flex;flex-direction:column;transform:translateY(100%);transition:transform .3s cubic-bezier(.4,0,.2,1);box-shadow:4px 0 40px rgba(0,0,0,.8)}
#nattos-eod-panel.open{transform:translateY(0)}
#eod-panel-hdr{padding:14px 18px;border-bottom:1px solid var(--eod-border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;background:var(--eod-bg2);border-radius:0 12px 0 0}
#eod-panel-title{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.16em;color:var(--eod-gold);text-transform:uppercase}
#eod-panel-sub{font-size:10px;color:var(--eod-text3);margin-top:1px}
.eod-close{background:none;border:none;color:var(--eod-text3);cursor:pointer;font-size:20px;line-height:1;padding:0 4px}
.eod-close:hover{color:var(--eod-text)}
#eod-tabs{display:flex;border-bottom:1px solid var(--eod-border);flex-shrink:0}
.eod-tab{padding:8px 14px;font-size:11px;font-weight:500;color:var(--eod-text2);cursor:pointer;border-bottom:2px solid transparent;background:none;border-top:none;border-left:none;border-right:none;transition:all .15s;white-space:nowrap}
.eod-tab:hover{color:var(--eod-text)}.eod-tab.active{color:var(--eod-gold);border-bottom-color:var(--eod-gold)}
#eod-body{overflow-y:auto;flex:1;padding:14px 16px}
.eod-section{margin-bottom:16px}
.eod-section-title{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.16em;color:var(--eod-gold);text-transform:uppercase;padding:5px 0 6px;border-bottom:1px solid var(--eod-border);margin-bottom:10px}
.eod-field{margin-bottom:10px}
.eod-field label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;color:var(--eod-text3);text-transform:uppercase;display:block;margin-bottom:3px}
.eod-field label.required::after{content:' *';color:var(--eod-red)}
.eod-field input,.eod-field select,.eod-field textarea{width:100%;background:var(--eod-bg2);border:1px solid var(--eod-border);color:var(--eod-text);padding:7px 10px;font-size:12px;border-radius:3px;outline:none;font-family:'Be Vietnam Pro',sans-serif;transition:border .15s;-webkit-user-select:text!important;user-select:text!important}
.eod-field input:focus,.eod-field select:focus,.eod-field textarea:focus{border-color:var(--eod-gold)}
.eod-field select option{background:var(--eod-bg)}
.eod-field textarea{resize:vertical;min-height:60px}
.eod-row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#eod-footer{padding:12px 16px;border-top:1px solid var(--eod-border);flex-shrink:0;display:flex;gap:8px;background:var(--eod-bg2)}
.eod-submit{flex:1;padding:10px;background:linear-gradient(135deg,#c8922a,#e8b84b);color:#000;border:none;border-radius:3px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Be Vietnam Pro',sans-serif;letter-spacing:.04em}
.eod-submit:hover{opacity:.9}
.eod-draft{padding:10px 14px;background:transparent;border:1px solid var(--eod-border);color:var(--eod-text2);border-radius:3px;font-size:11px;cursor:pointer;font-family:'Be Vietnam Pro',sans-serif}
.eod-draft:hover{border-color:var(--eod-gold);color:var(--eod-text)}
/* History tab */
.eod-hist-item{background:var(--eod-bg2);border:1px solid var(--eod-border);border-radius:4px;padding:10px 12px;margin-bottom:8px;cursor:pointer;transition:all .15s}
.eod-hist-item:hover{border-color:rgba(200,146,42,.3)}
.eod-hist-date{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--eod-gold);margin-bottom:3px}
.eod-hist-name{font-size:11px;font-weight:500;margin-bottom:2px}
.eod-hist-meta{font-size:10px;color:var(--eod-text3)}
.eod-badge-ok{display:inline-block;font-family:'JetBrains Mono',monospace;font-size:8px;padding:2px 6px;border-radius:2px;background:rgba(61,214,140,.1);color:#3dd68c;border:1px solid rgba(61,214,140,.2)}
.eod-badge-draft{display:inline-block;font-family:'JetBrains Mono',monospace;font-size:8px;padding:2px 6px;border-radius:2px;background:rgba(240,160,48,.1);color:var(--eod-amber);border:1px solid rgba(240,160,48,.2)}
.eod-notif{position:fixed;bottom:90px;left:24px;background:var(--eod-bg);border:1px solid var(--eod-border);border-radius:6px;padding:10px 14px;font-size:12px;display:flex;align-items:center;gap:8px;z-index:9002;box-shadow:0 4px 20px rgba(0,0,0,.6);animation:eod_si .25s ease;max-width:340px}
@keyframes eod_si{from{transform:translateX(-100%);opacity:0}to{transform:none;opacity:1}}
.eod-deadline-warn{background:rgba(240,80,80,.08);border:1px solid rgba(240,80,80,.2);border-radius:4px;padding:8px 10px;font-size:11px;color:#f05050;margin-bottom:12px;display:flex;align-items:center;gap:6px}
`;
  document.head.appendChild(style);
}

// ── BUILD PANEL HTML ─────────────────────────────────────────────────────────
function buildPanel(role) {
  const tmpl = EOD_TEMPLATES[role] || EOD_TEMPLATES.sale;
  const now = new Date();
  const deadline = '18:00';
  const isLate = now.getHours() >= 18;
  const empName = getEmployeeName();
  const empCode = getEmployeeCode();
  const reports = window._eodReports || loadReports();
  const todayStr = now.toLocaleDateString('vi-VN');
  const todayReport = reports.find(r => r.date === todayStr && r.empCode === empCode);

  let formHTML = '';
  tmpl.sections.forEach(sec => {
    formHTML += `<div class="eod-section"><div class="eod-section-title">${sec.title}</div>`;
    // Group numeric fields 2 per row
    let i = 0;
    const fields = sec.fields;
    while (i < fields.length) {
      const f = fields[i];
      const fNext = fields[i+1];
      const isNum = f.type === 'number';
      const nextIsNum = fNext?.type === 'number';
      if (isNum && nextIsNum) {
        formHTML += `<div class="eod-row2">`;
        [f, fNext].forEach(ff => {
          const val = todayReport?.data?.[ff.id] || '';
          formHTML += `<div class="eod-field">
            <label class="${ff.required?'required':''}">${ff.label}</label>
            <input type="number" id="eod_${ff.id}" name="${ff.id}" value="${val}" placeholder="0" min="0">
          </div>`;
        });
        formHTML += `</div>`;
        i += 2;
      } else {
        const val = todayReport?.data?.[f.id] || '';
        formHTML += `<div class="eod-field"><label class="${f.required?'required':''}">${f.label}</label>`;
        if (f.type === 'textarea') {
          formHTML += `<textarea id="eod_${f.id}" name="${f.id}" placeholder="Ghi chú...">${val}</textarea>`;
        } else if (f.type === 'select') {
          formHTML += `<select id="eod_${f.id}" name="${f.id}">
            ${(f.options||[]).map(o=>`<option value="${o}" ${val===o?'selected':''}>${o}</option>`).join('')}
          </select>`;
        } else if (f.type === 'text') {
          formHTML += `<input type="text" id="eod_${f.id}" name="${f.id}" value="${val}" placeholder="${f.placeholder||''}">`;
        } else {
          formHTML += `<input type="number" id="eod_${f.id}" name="${f.id}" value="${val}" placeholder="0" min="0">`;
        }
        formHTML += `</div>`;
        i++;
      }
    }
    formHTML += `</div>`;
  });

  // History tab
  let histHTML = '';
  if (reports.length === 0) {
    histHTML = `<div style="color:var(--eod-text3);font-size:11px;text-align:center;padding:20px 0">Chưa có báo cáo nào</div>`;
  } else {
    histHTML = reports.slice(0,20).map(r=>`
      <div class="eod-hist-item">
        <div class="eod-hist-date">${r.date} · ${r.time}</div>
        <div class="eod-hist-name">${r.empName} (${r.empCode})</div>
        <div class="eod-hist-meta">${r.role} · ${r.status === 'submitted' ? '<span class="eod-badge-ok">GỬI</span>' : '<span class="eod-badge-draft">DRAFT</span>'}</div>
      </div>`).join('');
  }

  return `
    <div id="eod-panel-hdr">
      <div>
        <div id="eod-panel-title">${tmpl.icon} Báo Cáo Cuối Ngày</div>
        <div id="eod-panel-sub">${empName} · ${tmpl.label} · ${now.toLocaleDateString('vi-VN')}</div>
      </div>
      <button class="eod-close" onclick="window._eodToggle()">×</button>
    </div>
    <div id="eod-tabs">
      <button class="eod-tab active" onclick="window._eodSwitchTab('form',this)">📝 Báo Cáo</button>
      <button class="eod-tab" onclick="window._eodSwitchTab('history',this)">📋 Lịch Sử</button>
    </div>
    <div id="eod-body">
      <div id="eod-tp-form">
        ${isLate ? `<div class="eod-deadline-warn">⚠️ Đã qua ${deadline} — Báo cáo trễ sẽ được ghi nhận trong hệ thống</div>` : ''}
        ${todayReport?.status === 'submitted' ? `<div style="background:rgba(61,214,140,.08);border:1px solid rgba(61,214,140,.2);border-radius:4px;padding:8px 10px;font-size:11px;color:#3dd68c;margin-bottom:12px">✓ Đã nộp báo cáo hôm nay lúc ${todayReport.time}</div>` : ''}
        ${formHTML}
      </div>
      <div id="eod-tp-history" style="display:none">${histHTML}</div>
    </div>
    <div id="eod-footer">
      <button class="eod-draft" onclick="window._eodSave('draft')">💾 Lưu Draft</button>
      <button class="eod-submit" onclick="window._eodSave('submitted')">✓ NỘP BÁO CÁO CUỐI NGÀY</button>
    </div>`;
}

// ── SAVE LOGIC ───────────────────────────────────────────────────────────────
function collectFormData(role) {
  const tmpl = EOD_TEMPLATES[role] || EOD_TEMPLATES.sale;
  const data = {};
  tmpl.sections.forEach(sec => {
    sec.fields.forEach(f => {
      const el = document.getElementById('eod_' + f.id);
      if (el) data[f.id] = el.value;
    });
  });
  return data;
}

// ── MAIN INIT ────────────────────────────────────────────────────────────────
function init() {
  injectCSS();

  const role = detectRole();
  const tmpl = EOD_TEMPLATES[role] || EOD_TEMPLATES.sale;

  // FAB button
  const fab = document.createElement('div');
  fab.id = 'nattos-eod-fab';
  fab.innerHTML = `
    <div id="eod-btn" style="border:2px solid rgba(200,146,42,.4)" onclick="window._eodToggle()">📋</div>
    <div id="eod-badge">!</div>
    <div id="eod-label">BC Cuối Ngày</div>`;
  document.body.appendChild(fab);

  // Panel
  const panel = document.createElement('div');
  panel.id = 'nattos-eod-panel';
  panel.innerHTML = buildPanel(role);
  document.body.appendChild(panel);

  // Check if already submitted today
  const reports = window._eodReports || loadReports();
  const todayStr = new Date().toLocaleDateString('vi-VN');
  const empCode = getEmployeeCode();
  const todayDone = reports.some(r => r.date === todayStr && r.empCode === empCode && r.status === 'submitted');

  if (!todayDone) {
    // Show badge pulsing after 17:30
    const now = new Date();
    if (now.getHours() * 60 + now.getMinutes() >= 17 * 60 + 30) {
      const badge = document.getElementById('eod-badge');
      if (badge) { badge.style.display = 'flex'; }
      // Show reminder toast
      setTimeout(() => showNotif('⏰ Đến giờ nộp Báo Cáo Cuối Ngày!', tmpl.color), 2000);
    }
  } else {
    const btn = document.getElementById('eod-btn');
    if (btn) btn.style.background = 'linear-gradient(135deg,#1a3a2a,#2a5a3a)';
  }

  // Reminder at 17:30 if not submitted
  scheduleReminder(role);

  // Global functions
  window._eodToggle = function() {
    const p = document.getElementById('nattos-eod-panel');
    p.classList.toggle('open');
    // Rebuild panel to get fresh user info after login
    if (p.classList.contains('open')) {
      p.innerHTML = buildPanel(detectRole());
      attachTabListeners();
    }
  };
  window._eodSwitchTab = function(tab, el) {
    document.querySelectorAll('.eod-tab').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');
    document.getElementById('eod-tp-form').style.display = tab === 'form' ? 'block' : 'none';
    document.getElementById('eod-tp-history').style.display = tab === 'history' ? 'block' : 'none';
  };
  window._eodSave = function(status) {
    const currentRole = detectRole();
    const data = collectFormData(currentRole);
    const tmpl2 = EOD_TEMPLATES[currentRole] || EOD_TEMPLATES.sale;
    // Validate required
    const missing = [];
    (tmpl2.sections || []).forEach(sec => sec.fields.filter(f=>f.required).forEach(f => {
      if (!data[f.id] || data[f.id] === '0') missing.push(f.label);
    }));
    if (status === 'submitted' && missing.length > 0) {
      showNotif('❌ Điền đủ: ' + missing.slice(0,2).join(', '), '#f05050');
      return;
    }
    const now = new Date();
    const report = {
      id: 'EOD-' + Date.now(),
      empCode: getEmployeeCode(),
      empName: getEmployeeName(),
      role: tmpl2.label,
      date: now.toLocaleDateString('vi-VN'),
      time: `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
      status,
      isLate: now.getHours() >= 18,
      data,
    };
    saveReport(report);
    if (status === 'submitted') {
      document.getElementById('nattos-eod-panel').classList.remove('open');
      const btn = document.getElementById('eod-btn');
      if (btn) btn.style.background = 'linear-gradient(135deg,#1a3a2a,#2a5a3a)';
      const badge = document.getElementById('eod-badge');
      if (badge) badge.style.display = 'none';
      showNotif(`✓ Đã nộp Báo Cáo Cuối Ngày — ${report.time}`, '#3dd68c');
    } else {
      showNotif('💾 Đã lưu draft', '#e8b84b');
    }
  };

  attachTabListeners();
}

function attachTabListeners() {
  // Already handled via onclick in HTML, nothing extra needed
}

function scheduleReminder(role) {
  const now = new Date();
  const target = new Date(now);
  target.setHours(17, 30, 0, 0);
  const msUntil = target.getTime() - now.getTime();
  if (msUntil > 0 && msUntil < 2 * 60 * 60 * 1000) {
    setTimeout(() => {
      const reports = window._eodReports || loadReports();
      const todayStr = new Date().toLocaleDateString('vi-VN');
      const done = reports.some(r => r.date === todayStr && r.empCode === getEmployeeCode() && r.status === 'submitted');
      if (!done) {
        const badge = document.getElementById('eod-badge');
        if (badge) badge.style.display = 'flex';
        showNotif('⏰ 17:30 — Đến giờ nộp Báo Cáo Cuối Ngày!', EOD_TEMPLATES[role]?.color || '#e8b84b');
      }
    }, msUntil);
  }
}

function showNotif(msg, color) {
  const n = document.createElement('div');
  n.className = 'eod-notif';
  n.style.borderLeftColor = color || '#e8b84b';
  n.innerHTML = `<span style="color:${color||'#e8b84b'};font-size:16px">📋</span><span style="font-size:12px">${msg}</span>`;
  document.body.appendChild(n);
  setTimeout(() => { n.style.opacity = '0'; setTimeout(() => n.remove(), 300); }, 4000);
}

// ── BOOT ────────────────────────────────────────────────────────────────────
// Wait for DOM + potential login
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
} else {
  setTimeout(init, 500);
}

// Re-init after login (hook vào doLogin của các app)
const _origDoLogin = window.doLogin;
if (typeof _origDoLogin === 'function') {
  window.doLogin = function(...args) {
    const result = _origDoLogin.apply(this, args);
    setTimeout(() => {
      const panel = document.getElementById('nattos-eod-panel');
      if (panel) panel.innerHTML = buildPanel(detectRole());
    }, 800);
    return result;
  };
}

})();
