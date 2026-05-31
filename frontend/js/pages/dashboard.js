'use strict';
import { api } from '../api.js';
import { siteBadge, fmtDate } from '../utils.js';

export function render() {
  return `
  <div class="section-title">Tổng quan hệ thống</div>
  <div class="section-sub">Hệ thống CSDL phân tán 3 site — PostgreSQL + FDW</div>

  <!-- Architecture diagram -->
  <div class="card mb-6" style="padding:24px">
    <div style="display:flex;align-items:center;justify-content:center;gap:0;flex-wrap:wrap">
      <div style="text-align:center">
        <div style="background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;padding:14px 22px;font-size:13px;font-weight:600;color:#475569">
          <i class="fas fa-desktop" style="color:#3b82f6;margin-right:6px"></i>Frontend :3000
        </div>
      </div>
      <div style="padding:0 12px;color:#cbd5e1;font-size:20px">→</div>
      <div style="text-align:center">
        <div style="background:#eff6ff;border:2px solid #3b82f6;border-radius:12px;padding:14px 22px;font-size:13px;font-weight:600;color:#1e40af">
          <i class="fas fa-gear" style="margin-right:6px"></i>Backend :4000<br>
          <span style="font-size:11px;font-weight:400;color:#3b82f6">Coordinator (Site A)</span>
        </div>
      </div>
      <div style="padding:0 12px;color:#cbd5e1;font-size:20px">→</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div class="card site-card-A" style="padding:10px 16px;font-size:12px;font-weight:600;color:#1e40af;min-width:140px">
          <div><i class="fas fa-database" style="margin-right:6px"></i>Site A :5433</div>
          <div style="font-size:10px;font-weight:400;color:#64748b;margin-top:2px">Hà Nội · Coordinator</div>
          <div id="site-a-rt" style="font-size:10px;color:#94a3b8">—</div>
        </div>
        <div class="card site-card-B" style="padding:10px 16px;font-size:12px;font-weight:600;color:#065f46;min-width:140px">
          <div><i class="fas fa-database" style="margin-right:6px"></i>Site B :5434</div>
          <div style="font-size:10px;font-weight:400;color:#64748b;margin-top:2px">TP.HCM</div>
          <div id="site-b-rt" style="font-size:10px;color:#94a3b8">—</div>
        </div>
        <div class="card site-card-C" style="padding:10px 16px;font-size:12px;font-weight:600;color:#5b21b6;min-width:140px">
          <div><i class="fas fa-database" style="margin-right:6px"></i>Site C :5435</div>
          <div style="font-size:10px;font-weight:400;color:#64748b;margin-top:2px">Đà Nẵng</div>
          <div id="site-c-rt" style="font-size:10px;color:#94a3b8">—</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Stat cards -->
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px">
    <div class="stat-card">
      <div class="stat-icon" style="background:#dbeafe">
        <i class="fas fa-users" style="color:#3b82f6"></i>
      </div>
      <div>
        <div class="stat-val" id="stat-sv">—</div>
        <div class="stat-label">Sinh viên toàn trường</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#d1fae5">
        <i class="fas fa-chalkboard-user" style="color:#10b981"></i>
      </div>
      <div>
        <div class="stat-val" id="stat-lhp">—</div>
        <div class="stat-label">Lớp học phần đang mở</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#fce7f3">
        <i class="fas fa-pen-to-square" style="color:#ec4899"></i>
      </div>
      <div>
        <div class="stat-val" id="stat-dk">—</div>
        <div class="stat-label">Lượt đăng ký</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#ede9fe">
        <i class="fas fa-person-chalkboard" style="color:#8b5cf6"></i>
      </div>
      <div>
        <div class="stat-val" id="stat-gv">—</div>
        <div class="stat-label">Giảng viên</div>
      </div>
    </div>
  </div>

  <!-- Bottom: SV per site + Recent log -->
  <div style="display:grid;grid-template-columns:1fr 1.6fr;gap:20px">
    <!-- SV by site -->
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-pie-chart" style="color:#3b82f6;margin-right:8px"></i>Sinh viên theo cơ sở</div>
      </div>
      <div class="card-body">
        <canvas id="chart-sv-coso" height="200"></canvas>
        <div id="sv-coso-detail" style="margin-top:12px"></div>
      </div>
    </div>

    <!-- Recent activity -->
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-clock-rotate-left" style="color:#64748b;margin-right:8px"></i>Hoạt động gần đây</div>
        <span class="badge badge-gray" id="log-site-tag">Tất cả site</span>
      </div>
      <div class="card-body" style="padding:0">
        <div id="recent-log" style="max-height:340px;overflow-y:auto">
          <div class="empty-state"><i class="fas fa-spinner fa-spin"></i>Đang tải...</div>
        </div>
      </div>
    </div>
  </div>`;
}

export async function init() {
  // Load health + stats in parallel
  const [health, stats, log] = await Promise.allSettled([
    api.health(),
    api.statsAll(),
    api.log({ limit: 15 }),
  ]);

  // Health
  if (health.status === 'fulfilled') {
    const sites = health.value.sites;
    for (const [s, info] of Object.entries(sites)) {
      const dot = document.getElementById(`dot-${s}`);
      const rt  = document.getElementById(`site-${s.toLowerCase()}-rt`);
      if (dot) dot.className = `status-dot ${info.ok ? 'dot-online' : 'dot-offline'}`;
      if (rt)  rt.textContent = info.ok ? `✓ ${info.db} — ${new Date(info.ts).toLocaleTimeString('vi-VN')}` : `✗ ${info.error}`;
    }
    // Global status bar
    const gs = document.getElementById('global-status');
    if (gs) {
      gs.innerHTML = ['A','B','C'].map(s => {
        const ok = sites[s]?.ok;
        return `<div class="gs-item"><div class="gs-dot" style="background:${ok?'#22c55e':'#ef4444'}"></div>Site ${s}</div>`;
      }).join('');
    }
  }

  // Stats Q1 (sv by coso)
  if (stats.status === 'fulfilled') {
    const { q1, q2 } = stats.value;

    // Totals
    const totalSV = q1?.reduce((s, r) => s + parseInt(r.sosv || 0), 0) ?? '—';
    document.getElementById('stat-sv').textContent = totalSV;

    // Fill other stats from q2
    const totalLHP = q2?.length ? q2.reduce((s, r) => s + parseInt(r.tong_dk || 0), 0) : '—';
    document.getElementById('stat-dk').textContent = totalLHP;

    // Pie chart
    if (q1?.length) {
      const ctx = document.getElementById('chart-sv-coso')?.getContext('2d');
      if (ctx) {
        new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: q1.map(r => `CS ${r.macoso} (${r.tencoso || r.macoso})`),
            datasets: [{
              data: q1.map(r => parseInt(r.sosv)),
              backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6'],
              borderWidth: 2, borderColor: '#fff',
            }],
          },
          options: {
            plugins: { legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 12 } } },
            cutout: '60%',
          },
        });
      }

      const detail = document.getElementById('sv-coso-detail');
      if (detail) {
        detail.innerHTML = q1.map(r => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:13px">
            <div>${siteBadge(r.macoso)} ${r.tencoso || r.macoso}</div>
            <strong>${parseInt(r.sosv).toLocaleString()} SV</strong>
          </div>`).join('');
      }
    }
  }

  // Fallback: fetch individual counts
  try {
    const gvs = await api.catalogGV();
    document.getElementById('stat-gv').textContent = gvs.length;
    const lhp = await api.courses();
    document.getElementById('stat-lhp').textContent = lhp.length;
  } catch (_) {}

  // Recent log
  if (log.status === 'fulfilled') {
    const logEl = document.getElementById('recent-log');
    if (logEl && log.value.length) {
      logEl.innerHTML = log.value.map(r => `
        <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 20px;border-bottom:1px solid #f8fafc;font-size:12.5px">
          <span class="badge badge-${(r.site_nguon||r.sitexuly||'A').toUpperCase()}">${r.site_nguon||r.sitexuly||'?'}</span>
          <div style="flex:1">
            <div style="color:#1e293b;font-weight:500">${r.hanhdong||'—'} <span style="color:#64748b">· ${r.masv||'—'} → ${r.malop||'—'}</span></div>
            <div style="color:#94a3b8;margin-top:1px">${fmtDate(r.thoigian)}</div>
          </div>
          <span class="tag ${r.ketqua==='ThanhCong'||r.ketqua==='OK' ? 'tag-ok' : 'tag-err'}">${r.ketqua||'—'}</span>
        </div>`).join('');
    } else if (logEl) {
      logEl.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i>Chưa có hoạt động nào</div>`;
    }
  }
}
