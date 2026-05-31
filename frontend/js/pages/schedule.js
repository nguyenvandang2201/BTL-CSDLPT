'use strict';
import { api } from '../api.js';
import { toast, renderTimetable, siteBadge } from '../utils.js';

export function render() {
  return `
  <div class="section-title">Thời khoá biểu</div>
  <div class="section-sub">Xem lịch học theo sinh viên, giảng viên hoặc phòng học</div>

  <!-- Tabs -->
  <div class="tab-bar">
    <button class="tab-btn active" data-tab="sv">
      <i class="fas fa-user-graduate" style="margin-right:6px"></i>Sinh viên
    </button>
    <button class="tab-btn" data-tab="gv">
      <i class="fas fa-person-chalkboard" style="margin-right:6px"></i>Giảng viên
    </button>
    <button class="tab-btn" data-tab="phong">
      <i class="fas fa-door-open" style="margin-right:6px"></i>Phòng học
    </button>
  </div>

  <!-- SV tab -->
  <div id="tab-sv">
    <div class="card mb-4" style="padding:16px 20px">
      <div style="display:flex;gap:12px;align-items:flex-end">
        <div style="flex:1;max-width:260px">
          <label class="form-label">Mã sinh viên</label>
          <input class="form-input" id="sv-masv" placeholder="VD: SV_A_001" />
        </div>
        <div style="flex:1;max-width:180px">
          <label class="form-label">Học kỳ</label>
          <select class="form-select" id="sv-hocky">
            <option value="">Tất cả</option>
            <option value="20241">2024-1</option>
            <option value="20242">2024-2</option>
          </select>
        </div>
        <button class="btn btn-primary" id="btn-sv-lich">
          <i class="fas fa-calendar-check"></i> Xem lịch
        </button>
      </div>
    </div>
    <div id="sv-lich-result">
      <div class="empty-state"><i class="fas fa-calendar-week" style="color:#cbd5e1"></i>Nhập mã sinh viên để xem thời khoá biểu</div>
    </div>
  </div>

  <!-- GV tab -->
  <div id="tab-gv" style="display:none">
    <div class="card mb-4" style="padding:16px 20px">
      <div style="display:flex;gap:12px;align-items:flex-end">
        <div style="flex:1;max-width:260px">
          <label class="form-label">Mã giảng viên</label>
          <input class="form-input" id="gv-magv" placeholder="VD: GV_A_001" />
        </div>
        <div style="flex:1;max-width:180px">
          <label class="form-label">Học kỳ</label>
          <select class="form-select" id="gv-hocky">
            <option value="">Tất cả</option>
            <option value="20241">2024-1</option>
            <option value="20242">2024-2</option>
          </select>
        </div>
        <button class="btn btn-primary" id="btn-gv-lich">
          <i class="fas fa-calendar-check"></i> Xem lịch
        </button>
      </div>
    </div>
    <div id="gv-lich-result">
      <div class="empty-state"><i class="fas fa-calendar-week" style="color:#cbd5e1"></i>Nhập mã giảng viên để xem lịch dạy</div>
    </div>
  </div>

  <!-- Phong tab -->
  <div id="tab-phong" style="display:none">
    <div class="card mb-4" style="padding:16px 20px">
      <div style="display:flex;gap:12px;align-items:flex-end">
        <div style="flex:1;max-width:260px">
          <label class="form-label">Mã phòng học</label>
          <input class="form-input" id="phong-ma" placeholder="VD: P101, P_A_01" />
        </div>
        <div style="flex:1;max-width:180px">
          <label class="form-label">Học kỳ</label>
          <select class="form-select" id="phong-hocky">
            <option value="">Tất cả</option>
            <option value="20241">2024-1</option>
            <option value="20242">2024-2</option>
          </select>
        </div>
        <button class="btn btn-primary" id="btn-phong-lich">
          <i class="fas fa-calendar-check"></i> Xem lịch
        </button>
      </div>
    </div>
    <div id="phong-lich-result">
      <div class="empty-state"><i class="fas fa-door-open" style="color:#cbd5e1"></i>Nhập mã phòng học để xem lịch sử dụng</div>
    </div>
  </div>

  <!-- Legend -->
  <div style="display:flex;gap:16px;margin-top:16px;flex-wrap:wrap">
    <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#64748b">
      <div style="width:16px;height:16px;border-radius:3px;background:#dbeafe;border-left:3px solid #3b82f6"></div>Site A — Hà Nội
    </div>
    <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#64748b">
      <div style="width:16px;height:16px;border-radius:3px;background:#d1fae5;border-left:3px solid #10b981"></div>Site B — TP.HCM
    </div>
    <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#64748b">
      <div style="width:16px;height:16px;border-radius:3px;background:#ede9fe;border-left:3px solid #8b5cf6"></div>Site C — Đà Nẵng
    </div>
    <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#64748b">
      <div style="width:16px;height:16px;border-radius:3px;background:#fee2e2;border-left:3px solid #ef4444"></div>Trùng lịch
    </div>
  </div>`;
}

export function init() {
  // Tab switching
  document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn[data-tab]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ['sv','gv','phong'].forEach(t => {
        document.getElementById(`tab-${t}`).style.display = t === btn.dataset.tab ? '' : 'none';
      });
    });
  });

  document.getElementById('btn-sv-lich').addEventListener('click', loadSVLich);
  document.getElementById('sv-masv').addEventListener('keydown', e => e.key==='Enter' && loadSVLich());

  document.getElementById('btn-gv-lich').addEventListener('click', loadGVLich);
  document.getElementById('gv-magv').addEventListener('keydown', e => e.key==='Enter' && loadGVLich());

  document.getElementById('btn-phong-lich').addEventListener('click', loadPhongLich);
  document.getElementById('phong-ma').addEventListener('keydown', e => e.key==='Enter' && loadPhongLich());
}

async function loadSVLich() {
  const maSV  = document.getElementById('sv-masv').value.trim();
  const hocKy = document.getElementById('sv-hocky').value;
  const res   = document.getElementById('sv-lich-result');
  if (!maSV) { toast('Nhập mã sinh viên', 'warn'); return; }

  res.innerHTML = `<div class="empty-state"><i class="fas fa-spinner fa-spin"></i>Đang tải...</div>`;
  try {
    const rows = await api.lichSV(maSV, hocKy);
    const conflicts = rows.filter(r => r.hasConflict);

    let html = '';
    if (conflicts.length) {
      html += `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:13.5px;color:#991b1b">
        <i class="fas fa-triangle-exclamation" style="margin-right:8px"></i>
        <strong>Cảnh báo:</strong> Phát hiện ${conflicts.length} xung đột lịch học!
        ${conflicts.map(c => `<span style="background:#fee2e2;padding:2px 8px;border-radius:4px;margin-left:6px">${c.malop}</span>`).join('')}
      </div>`;
    }

    html += `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div style="font-size:13.5px;color:#475569"><strong>${rows.length}</strong> lớp học phần đã đăng ký ${hocKy ? `(HK ${hocKy})` : ''}</div>
    </div>`;
    html += `<div class="card" style="padding:20px">${renderTimetable(rows)}</div>`;

    // Also show list
    if (rows.length) {
      html += `<div class="card" style="margin-top:16px">
        <div class="card-header"><div class="card-title" style="font-size:13.5px">Chi tiết đăng ký</div></div>
        <div style="overflow-x:auto"><table class="data-table" style="font-size:12.5px">
          <thead><tr><th>Lớp</th><th>Học phần</th><th>Cơ sở</th><th>Lịch học</th><th>Phòng</th><th>Giảng viên</th><th>Trạng thái</th></tr></thead>
          <tbody>${rows.map(r => `<tr style="${r.hasConflict?'background:#fef2f2':''}">
            <td><code style="font-size:11px">${r.malop}</code></td>
            <td>${r.tenhp||'—'}</td>
            <td>${siteBadge(r.macoso)}</td>
            <td style="white-space:nowrap">Thứ ${r.thutrongtuan}, Tiết ${r.tietbd}–${r.tietkt}</td>
            <td>${r.maphong||'—'}</td>
            <td>${r.tengv||'—'}</td>
            <td>${r.hasConflict ? '<span class="tag tag-err">⚠️ Trùng lịch</span>' : '<span class="tag tag-ok">✓ OK</span>'}</td>
          </tr>`).join('')}
          </tbody>
        </table></div>
      </div>`;
    }

    res.innerHTML = html;
  } catch (err) {
    res.innerHTML = `<div class="empty-state"><i class="fas fa-circle-xmark" style="color:#ef4444"></i>${err.message}</div>`;
  }
}

async function loadGVLich() {
  const maGV  = document.getElementById('gv-magv').value.trim();
  const hocKy = document.getElementById('gv-hocky').value;
  const res   = document.getElementById('gv-lich-result');
  if (!maGV) { toast('Nhập mã giảng viên', 'warn'); return; }

  res.innerHTML = `<div class="empty-state"><i class="fas fa-spinner fa-spin"></i>Đang tải...</div>`;
  try {
    const rows = await api.lichGV(maGV, hocKy);
    let html = `<div style="margin-bottom:12px;font-size:13.5px;color:#475569"><strong>${rows.length}</strong> lớp phụ trách</div>`;
    html += `<div class="card" style="padding:20px">${renderTimetable(rows)}</div>`;
    res.innerHTML = html;
  } catch (err) {
    res.innerHTML = `<div class="empty-state"><i class="fas fa-circle-xmark" style="color:#ef4444"></i>${err.message}</div>`;
  }
}

async function loadPhongLich() {
  const maPhong = document.getElementById('phong-ma').value.trim();
  const hocKy   = document.getElementById('phong-hocky').value;
  const res     = document.getElementById('phong-lich-result');
  if (!maPhong) { toast('Nhập mã phòng học', 'warn'); return; }

  res.innerHTML = `<div class="empty-state"><i class="fas fa-spinner fa-spin"></i>Đang tải...</div>`;
  try {
    const rows = await api.lichPhong(maPhong, hocKy);
    let html = `<div style="margin-bottom:12px;font-size:13.5px;color:#475569">Phòng <strong>${maPhong}</strong> — <strong>${rows.length}</strong> lớp sử dụng</div>`;
    html += `<div class="card" style="padding:20px">${renderTimetable(rows)}</div>`;
    res.innerHTML = html;
  } catch (err) {
    res.innerHTML = `<div class="empty-state"><i class="fas fa-circle-xmark" style="color:#ef4444"></i>${err.message}</div>`;
  }
}
