'use strict';

// ── Toast notifications ─────────────────────────────────────
const ICONS = {
  success: 'fa-circle-check',
  error:   'fa-circle-xmark',
  info:    'fa-circle-info',
  warn:    'fa-triangle-exclamation',
};

export function toast(msg, type = 'info', duration = 4500) {
  const c = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<i class="fas ${ICONS[type] || ICONS.info}"></i><div>${msg}</div>`;
  c.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'toast-out .2s ease forwards';
    setTimeout(() => el.remove(), 220);
  }, duration);
}

// ── Loading overlay ─────────────────────────────────────────
export function showLoading(text = 'Đang xử lý...') {
  document.getElementById('loading-text').textContent = text;
  document.getElementById('loading-overlay').classList.remove('hidden');
}

export function hideLoading() {
  document.getElementById('loading-overlay').classList.add('hidden');
}

// ── Modal ───────────────────────────────────────────────────
export function openModal(title, bodyHTML) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

export function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-body').innerHTML = '';
}

// ── Site helpers ────────────────────────────────────────────
const SITE_LABELS = { A: 'Cơ sở Hà Nội', B: 'Cơ sở HCM', C: 'Cơ sở Đà Nẵng' };
const SITE_SHORT  = { A: 'CS1 – HN', B: 'CS2 – HCM', C: 'CS3 – ĐN' };

export function siteBadge(site) {
  const label = SITE_SHORT[site] || site;
  return `<span class="badge badge-${site}">${label}</span>`;
}

export function siteLabel(site) { return SITE_LABELS[site] || site; }

// ── Date / time ─────────────────────────────────────────────
export function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
}

export function thuLabel(n) {
  if (!n) return '—';
  const num = parseInt(n);
  return num === 1 ? 'Chủ nhật' : `Thứ ${num}`;
}

export function tietRange(bd, kt) {
  if (!bd) return '—';
  return `Tiết ${bd}${kt && kt > bd ? `–${kt}` : ''}`;
}

// ── Progress bar ────────────────────────────────────────────
export function progressBar(current, max) {
  const rate = max > 0 ? Math.round(current / max * 100) : 0;
  const cls = rate < 60 ? 'prog-low' : rate < 85 ? 'prog-mid' : 'prog-high';
  const col = rate < 60 ? '#16a34a' : rate < 85 ? '#d97706' : '#dc2626';
  return `
    <div class="prog-wrap">
      <div class="prog-track">
        <div class="prog-fill ${cls}" style="width:${rate}%"></div>
      </div>
      <span class="prog-label" style="color:${col}">${current}/${max}</span>
    </div>`;
}

// ── Timetable renderer ──────────────────────────────────────
const THUS = [2, 3, 4, 5, 6, 7];
const TIETS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function renderTimetable(classes, onClickClass) {
  if (!classes || !classes.length) {
    return `<div class="empty-state"><i class="fas fa-calendar-xmark"></i>Không có lịch học</div>`;
  }

  // Build occupancy grid: grid[thu][tiet] = class obj
  const grid = {};
  for (const thu of THUS) grid[thu] = {};

  for (const c of classes) {
    const thu = parseInt(c.thutrongtuan);
    if (!THUS.includes(thu)) continue;
    for (let t = parseInt(c.tietbd); t <= parseInt(c.tietkt); t++) {
      grid[thu][t] = c;
    }
  }

  let html = `<div class="ttable-wrap"><table class="ttable">
    <thead><tr>
      <th style="width:38px">Tiết</th>
      ${THUS.map(t => `<th>${thuLabel(t)}</th>`).join('')}
    </tr></thead>
    <tbody>`;

  for (const tiet of TIETS) {
    html += `<tr><td class="tiet-hdr">${tiet}</td>`;
    for (const thu of THUS) {
      const c = grid[thu][tiet];
      if (!c) {
        html += `<td class="empty"></td>`;
      } else if (parseInt(c.tietbd) === tiet) {
        const span = parseInt(c.tietkt) - parseInt(c.tietbd) + 1;
        const site = (c.macoso || '').toUpperCase();
        const cellCls = c.hasConflict ? 'cls-conflict' : `cls-${site}`;
        const dataAttr = onClickClass ? `onclick='window._timetableClick(${JSON.stringify(c.malop)})'` : '';
        html += `<td class="cls-cell ${cellCls}" rowspan="${span}" ${dataAttr}>
          <div class="cls-name">${c.tenhp || c.tenHP || c.malop || ''}</div>
          <div class="cls-code">${c.malop || ''}</div>
          ${c.tengv  ? `<div class="cls-room">👨‍🏫 ${c.tengv}</div>`  : ''}
          ${c.maphong ? `<div class="cls-room">🚪 ${c.maphong}</div>` : ''}
          ${c.hasConflict ? `<div class="cls-warn">⚠️ Trùng lịch!</div>` : ''}
        </td>`;
      }
      // Cells covered by rowspan: skip
    }
    html += `</tr>`;
  }

  html += `</tbody></table></div>`;
  if (onClickClass) {
    window._timetableClick = onClickClass;
  }
  return html;
}

// ── Generic table builder ───────────────────────────────────
export function renderTable(cols, rows, emptyMsg = 'Không có dữ liệu') {
  if (!rows || !rows.length) {
    return `<div class="empty-state"><i class="fas fa-inbox"></i>${emptyMsg}</div>`;
  }
  let html = `<div class="overflow-x-auto"><table class="data-table">
    <thead><tr>${cols.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
    <tbody>`;
  for (const row of rows) {
    html += `<tr>${cols.map(c => `<td>${c.render ? c.render(row) : (row[c.key] ?? '—')}</td>`).join('')}</tr>`;
  }
  html += `</tbody></table></div>`;
  return html;
}
