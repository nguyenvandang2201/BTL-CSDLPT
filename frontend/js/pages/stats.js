'use strict';
import { api } from '../api.js';
import { siteBadge, thuLabel, tietRange } from '../utils.js';

let _charts = {};

export function render() {
  return `
  <div class="section-title">Thống kê phân tán</div>
  <div class="section-sub">6 truy vấn phân tán (Q1–Q6) qua FDW — dữ liệu tổng hợp từ cả 3 site</div>

  <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
    <div>
      <label class="form-label">Học kỳ</label>
      <select class="form-select" id="stats-hocky" style="width:180px">
        <option value="">Tất cả học kỳ</option>
        <option value="20241">2024-1</option>
        <option value="20242">2024-2</option>
      </select>
    </div>
    <div style="align-self:flex-end">
      <button class="btn btn-primary" id="btn-load-stats">
        <i class="fas fa-arrows-rotate"></i> Tải thống kê
      </button>
    </div>
    <div id="stats-loading" style="align-self:flex-end;display:none">
      <span class="inline-spinner"></span> <span style="font-size:13px;color:#64748b">Đang truy vấn 3 site...</span>
    </div>
  </div>

  <!-- Q1 + Q2 -->
  <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:20px;margin-bottom:20px">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Q1 — Sinh viên theo cơ sở</div>
          <div style="font-size:11.5px;color:#64748b;margin-top:2px">Phân mảnh ngang theo MaCoSo</div>
        </div>
      </div>
      <div class="card-body">
        <div id="q1-chart-wrap" style="max-height:220px"><canvas id="chart-q1"></canvas></div>
        <div id="q1-detail" style="margin-top:12px"></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Q2 — Top 5 học phần đăng ký nhiều nhất</div>
          <div style="font-size:11.5px;color:#64748b;margin-top:2px">Truy vấn tổng hợp từ v_DangKy_All</div>
        </div>
      </div>
      <div class="card-body">
        <canvas id="chart-q2" height="130"></canvas>
      </div>
    </div>
  </div>

  <!-- Q3 + Q4 -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Q3 — Đăng ký chéo cơ sở</div>
          <div style="font-size:11.5px;color:#64748b;margin-top:2px">SV.MaCoSo ≠ LHP.MaCoSo</div>
        </div>
      </div>
      <div id="q3-content" class="card-body">
        <div class="empty-state" style="padding:24px"><i class="fas fa-chart-bar" style="color:#cbd5e1"></i>Chưa tải</div>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Q4 — Tỷ lệ lấp đầy lớp học</div>
          <div style="font-size:11.5px;color:#64748b;margin-top:2px">SoDaDangKy / SiSoToiDa</div>
        </div>
      </div>
      <div class="card-body" style="padding:0">
        <div id="q4-content" style="max-height:280px;overflow-y:auto">
          <div class="empty-state" style="padding:24px"><i class="fas fa-chart-bar" style="color:#cbd5e1"></i>Chưa tải</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Q5 + Q6 -->
  <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:20px">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Q5 — Số lớp theo Khoa & Cơ sở</div>
          <div style="font-size:11.5px;color:#64748b;margin-top:2px">GROUP BY MaKhoa, MaCoSo</div>
        </div>
      </div>
      <div class="card-body">
        <canvas id="chart-q5" height="180"></canvas>
        <div id="q5-table" style="margin-top:16px"></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Q6 — Lịch dạy giảng viên</div>
          <div style="font-size:11.5px;color:#64748b;margin-top:2px">Xem từng GV hoặc toàn bộ</div>
        </div>
      </div>
      <div class="card-body">
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <input class="form-input" id="q6-magv" placeholder="Mã GV (bỏ trống = tất cả)" style="flex:1" />
          <button class="btn btn-outline btn-sm" id="btn-q6-load" style="white-space:nowrap">
            <i class="fas fa-search"></i> Lọc
          </button>
        </div>
        <div id="q6-content">
          <div class="empty-state" style="padding:24px"><i class="fas fa-person-chalkboard" style="color:#cbd5e1"></i>Chưa tải</div>
        </div>
      </div>
    </div>
  </div>`;
}

export function init() {
  document.getElementById('btn-load-stats').addEventListener('click', loadAllStats);
  document.getElementById('btn-q6-load').addEventListener('click', loadQ6);
  document.getElementById('q6-magv').addEventListener('keydown', e => e.key==='Enter' && loadQ6());
  // Auto-load
  loadAllStats();
}

function destroyCharts() {
  for (const c of Object.values(_charts)) c.destroy();
  _charts = {};
}

async function loadAllStats() {
  const hocKy = document.getElementById('stats-hocky')?.value;
  document.getElementById('stats-loading').style.display = 'flex';
  document.getElementById('btn-load-stats').disabled = true;
  destroyCharts();

  try {
    const { q1, q2, q3, q4, q5 } = await api.statsAll(hocKy);
    renderQ1(q1);
    renderQ2(q2);
    renderQ3(q3);
    renderQ4(q4);
    renderQ5(q5);
  } catch (err) {
    console.error(err);
  } finally {
    document.getElementById('stats-loading').style.display = 'none';
    document.getElementById('btn-load-stats').disabled = false;
  }

  await loadQ6();
}

function renderQ1(data) {
  if (!data?.length) return;
  const ctx = document.getElementById('chart-q1')?.getContext('2d');
  if (ctx) {
    _charts.q1 = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(r => `CS ${r.macoso}`),
        datasets: [{ data: data.map(r=>parseInt(r.sosv)), backgroundColor:['#3b82f6','#10b981','#8b5cf6'], borderWidth:3, borderColor:'#fff' }],
      },
      options: { plugins: { legend:{position:'right', labels:{font:{size:12}}} }, cutout:'65%' },
    });
  }
  const detail = document.getElementById('q1-detail');
  if (detail) {
    detail.innerHTML = data.map(r=>`
      <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:13px">
        <div>${siteBadge(r.macoso)} ${r.tencoso||r.macoso}</div>
        <strong>${parseInt(r.sosv).toLocaleString()} SV</strong>
      </div>`).join('');
  }
}

function renderQ2(data) {
  if (!data?.length) return;
  const ctx = document.getElementById('chart-q2')?.getContext('2d');
  if (ctx) {
    _charts.q2 = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(r => r.tenhp || r.mahp),
        datasets: [{
          label: 'Lượt đăng ký',
          data: data.map(r=>parseInt(r.tong_dk)),
          backgroundColor: ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ec4899'],
          borderRadius: 6,
        }],
      },
      options: {
        indexAxis: 'y',
        plugins: { legend:{display:false} },
        scales: { x:{grid:{color:'#f1f5f9'}} },
      },
    });
  }
}

function renderQ3(data) {
  const el = document.getElementById('q3-content');
  if (!data?.length) {
    el.innerHTML = `<div class="empty-state" style="padding:20px"><i class="fas fa-circle-check" style="color:#10b981"></i>Không có đăng ký chéo cơ sở</div>`;
    return;
  }
  el.innerHTML = `
    <div style="font-size:13px;color:#64748b;margin-bottom:10px">${data.length} lượt đăng ký chéo</div>
    <div style="max-height:240px;overflow-y:auto">
      <table class="data-table" style="font-size:12.5px">
        <thead><tr><th>Mã SV</th><th>CS SV</th><th>Lớp</th><th>CS LHP</th></tr></thead>
        <tbody>${data.map(r=>`<tr>
          <td><code style="font-size:11px">${r.masv}</code></td>
          <td>${siteBadge(r.cosotruong)}</td>
          <td><code style="font-size:11px">${r.malop}</code></td>
          <td>${siteBadge(r.coso_lhp)}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
}

function renderQ4(data) {
  const el = document.getElementById('q4-content');
  if (!data?.length) {
    el.innerHTML = `<div class="empty-state" style="padding:24px"><i class="fas fa-inbox"></i>Không có dữ liệu</div>`;
    return;
  }
  el.innerHTML = data.map(r => {
    const rate = parseFloat(r.ty_le_lap_day || 0);
    const fill  = rate < 60 ? 'prog-low' : rate < 85 ? 'prog-mid' : 'prog-high';
    const status = r.tinh_trang || (rate >= 100 ? 'Đầy' : rate >= 85 ? 'Sắp đầy' : 'Còn chỗ');
    return `<div style="padding:10px 20px;border-bottom:1px solid #f8fafc">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;font-size:13px">
        <div><code style="font-size:11px;background:#f8fafc;padding:1px 5px;border-radius:3px">${r.malop}</code>
          <span style="margin-left:6px;color:#475569">${r.tenhp||''}</span>
          ${siteBadge(r.macoso)}
        </div>
        <span class="tag ${rate>=100?'tag-err':rate>=85?'tag-warn':'tag-ok'}">${status}</span>
      </div>
      <div class="prog-wrap">
        <div class="prog-track">
          <div class="prog-fill ${fill}" style="width:${Math.min(rate,100)}%"></div>
        </div>
        <span class="prog-label" style="color:${rate>=100?'#dc2626':rate>=85?'#d97706':'#16a34a'}">${Math.round(rate)}%</span>
      </div>
    </div>`;
  }).join('');
}

function renderQ5(data) {
  if (!data?.length) return;
  // Group by khoa
  const khoas = [...new Set(data.map(r=>r.tenkhoa))];
  const cosos  = ['A','B','C'];
  const datasets = cosos.map((cs, i) => ({
    label: `Site ${cs}`,
    data: khoas.map(k => {
      const r = data.find(d=>d.tenkhoa===k && d.macoso===cs);
      return r ? parseInt(r.so_lop) : 0;
    }),
    backgroundColor: ['#3b82f6','#10b981','#8b5cf6'][i],
    borderRadius: 4,
  }));

  const ctx = document.getElementById('chart-q5')?.getContext('2d');
  if (ctx) {
    _charts.q5 = new Chart(ctx, {
      type: 'bar',
      data: { labels: khoas.map(k => k.length > 20 ? k.slice(0,20)+'…' : k), datasets },
      options: {
        plugins: { legend:{position:'top',labels:{font:{size:11}}} },
        scales: { x:{stacked:false,grid:{display:false}}, y:{grid:{color:'#f1f5f9'},ticks:{stepSize:1}} },
      },
    });
  }
}

async function loadQ6() {
  const maGV  = document.getElementById('q6-magv')?.value.trim();
  const hocKy = document.getElementById('stats-hocky')?.value;
  const el    = document.getElementById('q6-content');
  el.innerHTML = `<div style="text-align:center;padding:16px"><span class="inline-spinner"></span></div>`;
  try {
    const url = `/api/thongke/lich-day-gv` + (maGV || hocKy ? `?${new URLSearchParams(Object.fromEntries(Object.entries({maGV,hocKy}).filter(([,v])=>v)))}` : '');
    const data = await fetch(url).then(r=>r.json());
    if (!data?.length) {
      el.innerHTML = `<div class="empty-state" style="padding:20px"><i class="fas fa-inbox"></i>Không có dữ liệu</div>`;
      return;
    }
    el.innerHTML = `<div style="max-height:280px;overflow-y:auto">
      <table class="data-table" style="font-size:12px">
        <thead><tr><th>GV</th><th>Lớp</th><th>Học phần</th><th>Lịch</th><th>CS</th></tr></thead>
        <tbody>${data.map(r=>`<tr>
          <td style="white-space:nowrap">${r.hotengv||r.magv||'—'}</td>
          <td><code style="font-size:10.5px">${r.malop}</code></td>
          <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.tenhp||'—'}</td>
          <td style="white-space:nowrap;font-size:11px">${thuLabel(r.thutrongtuan)} · ${tietRange(r.tietbd,r.tietkt)}</td>
          <td>${siteBadge(r.macoso)}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
  } catch (err) {
    el.innerHTML = `<div class="empty-state" style="padding:16px"><i class="fas fa-circle-xmark" style="color:#ef4444"></i>${err.message}</div>`;
  }
}
