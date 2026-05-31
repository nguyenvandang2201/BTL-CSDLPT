'use strict';
import { api } from '../api.js';
import { toast, siteBadge, thuLabel, tietRange, progressBar, fmtDate } from '../utils.js';

let _maSV = '';
let _dsDangKy = [];

export function render() {
  return `
  <div class="section-title">Đăng ký học phần</div>
  <div class="section-sub">Tìm kiếm theo mã sinh viên → xem lịch → đăng ký/hủy trực tiếp</div>

  <div style="display:grid;grid-template-columns:340px 1fr;gap:20px;align-items:start">
    <!-- Left: SV search -->
    <div>
      <div class="card mb-4" style="padding:20px">
        <div style="font-weight:600;font-size:14px;margin-bottom:14px;color:#1e293b">
          <i class="fas fa-id-card" style="color:#3b82f6;margin-right:8px"></i>Tra cứu sinh viên
        </div>
        <div style="margin-bottom:10px">
          <label class="form-label">Mã sinh viên</label>
          <div style="display:flex;gap:8px">
            <input class="form-input" id="inp-masv" placeholder="VD: SV_A_001" />
            <button class="btn btn-primary" id="btn-lookup" style="white-space:nowrap">
              <i class="fas fa-search"></i>
            </button>
          </div>
          <div style="font-size:11px;color:#94a3b8;margin-top:5px">
            Thử: SV_A_001, SV_B_001, SV_C_001
          </div>
        </div>
        <div id="sv-info"></div>
      </div>

      <!-- Current registrations -->
      <div class="card" id="card-dang-ky" style="display:none">
        <div class="card-header">
          <div class="card-title" style="font-size:13.5px">
            <i class="fas fa-list-check" style="color:#10b981;margin-right:8px"></i>Đăng ký hiện tại
          </div>
          <span id="dk-count" class="badge badge-gray">0</span>
        </div>
        <div id="dk-list" style="max-height:400px;overflow-y:auto"></div>
      </div>
    </div>

    <!-- Right: Course browser to register -->
    <div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <i class="fas fa-book-open" style="color:#8b5cf6;margin-right:8px"></i>Danh sách lớp có thể đăng ký
          </div>
          <div style="display:flex;gap:8px">
            <select class="form-select" id="f-reg-coso" style="width:auto;font-size:13px">
              <option value="">Tất cả cơ sở</option>
              <option value="A">Site A</option>
              <option value="B">Site B</option>
              <option value="C">Site C</option>
            </select>
            <select class="form-select" id="f-reg-hocky" style="width:auto;font-size:13px">
              <option value="">Tất cả HK</option>
              <option value="20241">2024-1</option>
              <option value="20242">2024-2</option>
            </select>
            <button class="btn btn-outline btn-sm" id="btn-load-courses">
              <i class="fas fa-arrows-rotate"></i>
            </button>
          </div>
        </div>
        <div id="reg-courses-table">
          <div class="empty-state"><i class="fas fa-arrow-left" style="color:#cbd5e1"></i>Tìm sinh viên để bắt đầu đăng ký</div>
        </div>
      </div>
    </div>
  </div>`;
}

export async function init() {
  document.getElementById('btn-lookup').addEventListener('click', lookupSV);
  document.getElementById('inp-masv').addEventListener('keydown', e => e.key === 'Enter' && lookupSV());
  document.getElementById('btn-load-courses').addEventListener('click', loadAvailableCourses);
  document.getElementById('f-reg-coso').addEventListener('change', loadAvailableCourses);
  document.getElementById('f-reg-hocky').addEventListener('change', loadAvailableCourses);

  // Auto-load courses
  await loadAvailableCourses();
}

async function lookupSV() {
  const maSV = document.getElementById('inp-masv').value.trim();
  if (!maSV) { toast('Vui lòng nhập mã sinh viên', 'warn'); return; }
  _maSV = maSV;

  const infoEl = document.getElementById('sv-info');
  infoEl.innerHTML = `<div style="text-align:center;padding:16px"><div class="inline-spinner"></div></div>`;

  try {
    _dsDangKy = await api.dsDangKy(maSV);
    const activeDK = _dsDangKy.filter(d => d.trangthai === 'DangKy');

    infoEl.innerHTML = `
      <div style="background:#f0fdf4;border-radius:10px;padding:14px;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <i class="fas fa-user-graduate" style="color:#10b981;font-size:18px"></i>
          <div>
            <div style="font-weight:600;color:#1e293b">${maSV}</div>
            <div style="font-size:12px;color:#64748b">${activeDK.length} môn đã đăng ký</div>
          </div>
        </div>
      </div>`;

    renderDKList(activeDK);
    document.getElementById('card-dang-ky').style.display = 'block';
    document.getElementById('dk-count').textContent = activeDK.length;

    // Reload available courses with current SV context
    await loadAvailableCourses();
  } catch (err) {
    infoEl.innerHTML = `<div style="background:#fef2f2;border-radius:10px;padding:14px;color:#991b1b;font-size:13px">
      <i class="fas fa-circle-xmark" style="margin-right:6px"></i>${err.message}
    </div>`;
  }
}

function renderDKList(list) {
  const el = document.getElementById('dk-list');
  if (!list.length) {
    el.innerHTML = `<div class="empty-state" style="padding:24px"><i class="fas fa-calendar-xmark"></i>Chưa đăng ký môn nào</div>`;
    return;
  }
  el.innerHTML = list.map(d => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid #f8fafc;font-size:13px">
      <div style="flex:1">
        <div style="font-weight:600">${d.tenhp||d.malop}</div>
        <div style="font-size:11.5px;color:#64748b">${d.malop} · ${d.hocky||''} · ${thuLabel(d.thutrongtuan)} ${tietRange(d.tietbd, d.tietkt)}</div>
      </div>
      ${siteBadge(d.macoso)}
      <button class="btn btn-danger btn-sm" onclick="window._huyDangKy(${d.madk},'${_maSV}')">
        <i class="fas fa-trash-can"></i> Hủy
      </button>
    </div>`).join('');

  window._huyDangKy = async (maDK, maSV) => {
    if (!confirm(`Hủy đăng ký MaDK=${maDK}?`)) return;
    try {
      await api.huyDangKy(maDK, maSV);
      toast('Hủy đăng ký thành công', 'success');
      await refreshDKList();
    } catch (err) {
      toast(`Lỗi: ${err.message}`, 'error');
    }
  };
}

async function refreshDKList() {
  if (!_maSV) return;
  try {
    _dsDangKy = await api.dsDangKy(_maSV);
    const activeDK = _dsDangKy.filter(d => d.trangthai === 'DangKy');
    document.getElementById('dk-count').textContent = activeDK.length;
    renderDKList(activeDK);
  } catch (_) {}
}

async function loadAvailableCourses() {
  const maCoSo = document.getElementById('f-reg-coso')?.value;
  const hocKy  = document.getElementById('f-reg-hocky')?.value;
  const el = document.getElementById('reg-courses-table');
  el.innerHTML = `<div class="empty-state"><i class="fas fa-spinner fa-spin"></i>Đang tải...</div>`;

  try {
    const courses = await api.courses({ maCoSo, hocKy });
    renderRegTable(courses);
  } catch (err) {
    el.innerHTML = `<div class="empty-state"><i class="fas fa-circle-xmark" style="color:#ef4444"></i>${err.message}</div>`;
  }
}

function renderRegTable(courses) {
  const el = document.getElementById('reg-courses-table');
  if (!courses.length) {
    el.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i>Không có lớp học phần</div>`;
    return;
  }

  // Mark already registered
  const registered = new Set(_dsDangKy.filter(d=>d.trangthai==='DangKy').map(d=>d.malop));

  el.innerHTML = `<div class="overflow-x-auto"><table class="data-table">
    <thead><tr>
      <th>Mã lớp</th><th>Học phần</th><th>TC</th><th>Cơ sở</th>
      <th>Lịch học</th><th>Sĩ số</th><th>Thao tác</th>
    </tr></thead>
    <tbody>${courses.map(c => {
      const full = (c.sodadangky||0) >= (c.sisotoida||0);
      const isReg = registered.has(c.malop);
      return `<tr style="${isReg?'background:#f0fdf4':''};${full&&!isReg?'opacity:.6':''}">
        <td><code style="font-size:11px;background:#f8fafc;padding:2px 6px;border-radius:4px">${c.malop}</code></td>
        <td style="font-weight:500">${c.tenhp||'—'}</td>
        <td style="text-align:center">${c.sotinchi||'—'}</td>
        <td>${siteBadge(c.macoso)}</td>
        <td style="font-size:12px;white-space:nowrap">${c.thutrongtuan ? `${thuLabel(c.thutrongtuan)} · ${tietRange(c.tietbd,c.tietkt)}` : '—'}</td>
        <td style="min-width:120px">${progressBar(c.sodadangky||0, c.sisotoida||0)}</td>
        <td>
          ${isReg
            ? `<span class="tag tag-ok"><i class="fas fa-check"></i> Đã đăng ký</span>`
            : full
              ? `<span class="tag tag-err"><i class="fas fa-ban"></i> Hết chỗ</span>`
              : `<button class="btn btn-success btn-sm" onclick="window._dangKy('${c.malop}')">
                  <i class="fas fa-plus"></i> Đăng ký
                </button>`}
        </td>
      </tr>`;
    }).join('')}
    </tbody>
  </table></div>`;

  window._dangKy = async (maLop) => {
    if (!_maSV) { toast('Vui lòng nhập mã sinh viên trước', 'warn'); return; }
    const btn = event.target.closest('button');
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="inline-spinner"></span> Đang xử lý...'; }
    try {
      const res = await api.dangKy(_maSV, maLop, true);
      if (res.success) {
        toast(`✓ Đăng ký thành công lớp <strong>${maLop}</strong>`, 'success');
        await refreshDKList();
        await loadAvailableCourses();
      } else {
        const msgs = {
          HET_CHO:           'Lớp đã đầy — không còn chỗ trống',
          TRUNG_LICH:        'Trùng lịch với môn đang học',
          DA_DANG_KY:        'Sinh viên đã đăng ký lớp này rồi',
          LOP_KHONG_TON_TAI: 'Mã lớp không tồn tại',
        };
        toast(msgs[res.reason] || res.reason || 'Không thể đăng ký', 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus"></i> Đăng ký'; }
      }
    } catch (err) {
      toast(`Lỗi: ${err.message}`, 'error');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus"></i> Đăng ký'; }
    }
  };
}
