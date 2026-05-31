'use strict';
import { api } from '../api.js';
import { siteBadge, thuLabel, tietRange, progressBar, openModal, fmtDate } from '../utils.js';

let _allCourses = [];

export function render() {
  return `
  <div class="section-title">Lớp học phần toàn trường</div>
  <div class="section-sub">Tra cứu lớp học phần từ cả 3 cơ sở qua truy vấn phân tán (FDW)</div>

  <!-- Filters -->
  <div class="card mb-5" style="padding:16px 20px">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:12px;align-items:flex-end">
      <div>
        <label class="form-label">Cơ sở</label>
        <select class="form-select" id="f-coso">
          <option value="">Tất cả cơ sở</option>
          <option value="A">Site A — Hà Nội</option>
          <option value="B">Site B — TP.HCM</option>
          <option value="C">Site C — Đà Nẵng</option>
        </select>
      </div>
      <div>
        <label class="form-label">Học kỳ</label>
        <select class="form-select" id="f-hocky">
          <option value="">Tất cả</option>
          <option value="20241">2024-1</option>
          <option value="20242">2024-2</option>
        </select>
      </div>
      <div>
        <label class="form-label">Tìm kiếm</label>
        <input class="form-input" id="f-search" placeholder="Mã lớp, tên học phần..." />
      </div>
      <button class="btn btn-primary" id="btn-filter">
        <i class="fas fa-magnifying-glass"></i> Lọc
      </button>
    </div>
  </div>

  <!-- Summary chips -->
  <div id="courses-summary" style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap"></div>

  <!-- Table -->
  <div class="card">
    <div class="card-header">
      <div class="card-title">
        <i class="fas fa-table" style="color:#64748b;margin-right:8px"></i>
        Danh sách lớp học phần
        <span id="courses-count" class="badge badge-gray" style="margin-left:8px">...</span>
      </div>
      <button class="btn btn-outline btn-sm" id="btn-reload">
        <i class="fas fa-arrows-rotate"></i> Tải lại
      </button>
    </div>
    <div id="courses-table">
      <div class="empty-state"><i class="fas fa-spinner fa-spin"></i>Đang tải...</div>
    </div>
  </div>`;
}

export async function init() {
  document.getElementById('btn-filter').addEventListener('click', applyFilter);
  document.getElementById('btn-reload').addEventListener('click', loadCourses);
  document.getElementById('f-search').addEventListener('keydown', e => e.key === 'Enter' && applyFilter());
  await loadCourses();
}

async function loadCourses() {
  const maCoSo = document.getElementById('f-coso')?.value;
  const hocKy  = document.getElementById('f-hocky')?.value;
  const tableEl = document.getElementById('courses-table');
  tableEl.innerHTML = `<div class="empty-state"><i class="fas fa-spinner fa-spin"></i>Đang tải...</div>`;

  try {
    _allCourses = await api.courses({ maCoSo, hocKy });
    renderSummary();
    applyFilter();
  } catch (err) {
    tableEl.innerHTML = `<div class="empty-state"><i class="fas fa-circle-xmark" style="color:#ef4444"></i>Lỗi: ${err.message}</div>`;
  }
}

function renderSummary() {
  const summary = document.getElementById('courses-summary');
  const bysite = { A: 0, B: 0, C: 0 };
  for (const c of _allCourses) bysite[c.macoso] = (bysite[c.macoso] || 0) + 1;
  summary.innerHTML = Object.entries(bysite).map(([s, n]) =>
    `<span style="display:flex;align-items:center;gap:6px;background:white;padding:5px 12px;border-radius:99px;font-size:12.5px;box-shadow:0 1px 3px rgba(0,0,0,.06)">
      ${siteBadge(s)} <strong>${n}</strong> lớp
    </span>`
  ).join('');
}

function applyFilter() {
  const q = (document.getElementById('f-search')?.value || '').toLowerCase().trim();
  const rows = q
    ? _allCourses.filter(c =>
        (c.malop||'').toLowerCase().includes(q) ||
        (c.tenhp||'').toLowerCase().includes(q) ||
        (c.tengv||'').toLowerCase().includes(q)
      )
    : _allCourses;

  document.getElementById('courses-count').textContent = `${rows.length} lớp`;
  document.getElementById('courses-table').innerHTML = renderCoursesTable(rows);
  // Attach click handlers
  document.querySelectorAll('[data-malop]').forEach(el => {
    el.addEventListener('click', () => showCourseDetail(el.dataset.malop));
  });
}

function renderCoursesTable(rows) {
  if (!rows.length) return `<div class="empty-state"><i class="fas fa-inbox"></i>Không tìm thấy lớp học phần</div>`;
  return `<div class="overflow-x-auto"><table class="data-table">
    <thead><tr>
      <th>Mã lớp</th>
      <th>Học phần</th>
      <th>TC</th>
      <th>Cơ sở</th>
      <th>Học kỳ</th>
      <th>Giảng viên</th>
      <th>Lịch học</th>
      <th>Sĩ số</th>
      <th></th>
    </tr></thead>
    <tbody>
      ${rows.map(c => {
        const rate = c.sisoToiDa > 0 ? Math.round(c.sodadangky / c.sisotoida * 100) : 0;
        return `<tr>
          <td><code style="font-size:12px;background:#f8fafc;padding:2px 6px;border-radius:4px">${c.malop}</code></td>
          <td style="font-weight:500;max-width:200px">${c.tenhp||'—'}</td>
          <td style="text-align:center"><strong>${c.sotinchi||'—'}</strong></td>
          <td>${siteBadge(c.macoso)}</td>
          <td>${c.hocky||'—'}</td>
          <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.tengv||'<span style="color:#94a3b8">Chưa phân công</span>'}</td>
          <td style="font-size:12px;white-space:nowrap">${c.thutrongtuan ? `${thuLabel(c.thutrongtuan)} · ${tietRange(c.tietbd, c.tietkt)}` : '—'}</td>
          <td style="min-width:130px">${progressBar(c.sodadangky||0, c.sisotoida||0)}</td>
          <td><button class="btn btn-outline btn-sm" data-malop="${c.malop}"><i class="fas fa-eye"></i> Chi tiết</button></td>
        </tr>`;
      }).join('')}
    </tbody>
  </table></div>`;
}

async function showCourseDetail(maLop) {
  openModal(`Chi tiết lớp: ${maLop}`, `<div class="empty-state"><i class="fas fa-spinner fa-spin"></i>Đang tải...</div>`);
  try {
    const d = await api.courseDetail(maLop);
    const body = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
        <div><div class="form-label">Mã lớp</div><div style="font-size:15px;font-weight:600">${d.malop}</div></div>
        <div><div class="form-label">Học phần</div><div style="font-weight:500">${d.tenhp} (${d.sotinchi} TC)</div></div>
        <div><div class="form-label">Cơ sở</div><div>${siteBadge(d.macoso)}</div></div>
        <div><div class="form-label">Học kỳ</div><div>${d.hocky}</div></div>
        <div><div class="form-label">Giảng viên</div><div>${d.tengv||'<span style="color:#94a3b8">Chưa phân công</span>'}</div></div>
        <div><div class="form-label">Phòng học</div><div>${d.maphong||'—'}</div></div>
        <div><div class="form-label">Lịch học</div><div>${d.thutrongtuan ? `${thuLabel(d.thutrongtuan)} · ${tietRange(d.tietbd, d.tietkt)}` : '—'}</div></div>
        <div><div class="form-label">Sĩ số</div><div>${progressBar(d.sodadangky||0, d.sisotoida||0)}</div></div>
      </div>
      <hr class="divider">
      <div style="font-weight:600;margin-bottom:12px">Danh sách sinh viên đã đăng ký (${(d.danhsachsv||[]).length})</div>
      ${d.danhsachsv?.length ? `
        <table class="data-table" style="font-size:12.5px">
          <thead><tr><th>#</th><th>Mã SV</th><th>Họ tên</th><th>Cơ sở SV</th><th>Thời gian ĐK</th></tr></thead>
          <tbody>${d.danhsachsv.map((s,i) => `
            <tr>
              <td style="color:#94a3b8">${i+1}</td>
              <td><code style="font-size:11px">${s.masv}</code></td>
              <td>${s.tensv||'—'}</td>
              <td>${siteBadge(s.cososv)}</td>
              <td style="font-size:11.5px">${fmtDate(s.thoigiandk)}</td>
            </tr>`).join('')}
          </tbody>
        </table>` : `<div class="empty-state" style="padding:24px"><i class="fas fa-user-slash"></i>Chưa có sinh viên nào đăng ký</div>`}
    `;
    document.getElementById('modal-body').innerHTML = body;
  } catch (err) {
    document.getElementById('modal-body').innerHTML =
      `<div class="empty-state"><i class="fas fa-circle-xmark" style="color:#ef4444"></i>${err.message}</div>`;
  }
}
