'use strict';
import { api } from '../api.js';
import { toast, showLoading, hideLoading, siteBadge, fmtDate } from '../utils.js';

export function render() {
  return `
  <div class="section-title">Quản trị & Demo kỹ thuật</div>
  <div class="section-sub">Kiểm tra kết nối, đồng bộ dữ liệu, nhật ký và demo cơ chế phân tán</div>

  <!-- Health check -->
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px" id="health-grid">
    ${['A','B','C'].map(s => `
      <div class="card site-card-${s}" id="health-card-${s}">
        <div style="padding:18px 20px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div style="font-weight:700;font-size:15px">Site ${s}</div>
            <span id="health-badge-${s}" class="badge badge-gray">Đang kiểm tra...</span>
          </div>
          <div id="health-detail-${s}" style="font-size:12.5px;color:#64748b;line-height:1.8">—</div>
        </div>
      </div>`).join('')}
  </div>
  <div style="margin-bottom:24px">
    <button class="btn btn-outline" id="btn-health-check">
      <i class="fas fa-heartbeat"></i> Kiểm tra lại kết nối
    </button>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
    <!-- Sync catalog -->
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-arrows-rotate" style="color:#10b981;margin-right:8px"></i>Đồng bộ dữ liệu Catalog</div>
      </div>
      <div class="card-body">
        <p style="font-size:13px;color:#64748b;margin-bottom:16px">
          Đồng bộ lại bảng nhân bản (replicated tables) từ Site nguồn sang 2 site còn lại.
        </p>
        <div style="margin-bottom:12px">
          <label class="form-label">Site nguồn</label>
          <select class="form-select" id="sync-src" style="width:auto">
            <option value="A">Site A — Hà Nội</option>
            <option value="B">Site B — TP.HCM</option>
            <option value="C">Site C — Đà Nẵng</option>
          </select>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${['HocPhan','CoSo','Khoa','ChuongTrinhDaoTao'].map(t=>`
            <button class="btn btn-outline btn-sm sync-btn" data-table="${t}">
              <i class="fas fa-table"></i> ${t}
            </button>`).join('')}
          <button class="btn btn-primary btn-sm" id="btn-sync-all">
            <i class="fas fa-layer-group"></i> Đồng bộ tất cả
          </button>
        </div>
        <div id="sync-result" style="margin-top:12px"></div>
      </div>
    </div>

    <!-- Assign GV -->
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-user-tie" style="color:#8b5cf6;margin-right:8px"></i>Phân công giảng viên</div>
      </div>
      <div class="card-body">
        <p style="font-size:13px;color:#64748b;margin-bottom:16px">
          Phân công GV cho lớp học phần. Kiểm tra xung đột lịch qua FDW trước khi cập nhật.
        </p>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div>
            <label class="form-label">Mã lớp</label>
            <input class="form-input" id="pc-malop" placeholder="VD: L_A_001" />
          </div>
          <div>
            <label class="form-label">Mã giảng viên</label>
            <input class="form-input" id="pc-magv" placeholder="VD: GV_B_001" />
          </div>
          <button class="btn btn-primary" id="btn-phan-cong">
            <i class="fas fa-user-check"></i> Phân công
          </button>
        </div>
        <div id="pc-result" style="margin-top:12px"></div>
      </div>
    </div>
  </div>

  <!-- Demo section -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
    <!-- Demo đồng thời -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <i class="fas fa-bolt" style="color:#f59e0b;margin-right:8px"></i>Demo Đăng ký Đồng thời
        </div>
      </div>
      <div class="card-body">
        <p style="font-size:13px;color:#64748b;margin-bottom:16px">
          Mô phỏng <strong>N sinh viên đăng ký cùng lúc</strong> vào 1 lớp. Kiểm chứng cơ chế
          <code style="background:#f8fafc;padding:1px 5px;border-radius:3px">SELECT FOR UPDATE</code> ngăn over-booking.
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
          <div>
            <label class="form-label">Mã lớp</label>
            <input class="form-input" id="demo-malop" placeholder="VD: L_A_001" value="L_A_001" />
          </div>
          <div>
            <label class="form-label">Số lượng SV</label>
            <input class="form-input" type="number" id="demo-so-luong" value="30" min="1" max="100" />
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <input type="checkbox" id="demo-use-lock" checked style="width:16px;height:16px" />
          <label for="demo-use-lock" style="font-size:13px">Dùng SELECT FOR UPDATE (có khóa)</label>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary" id="btn-demo-lock">
            <i class="fas fa-lock"></i> Chạy (có khóa)
          </button>
          <button class="btn btn-outline" id="btn-demo-nolock">
            <i class="fas fa-lock-open"></i> Chạy (không khóa)
          </button>
        </div>
        <div id="demo-result" style="margin-top:12px"></div>
      </div>
    </div>

    <!-- Demo deadlock -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <i class="fas fa-skull-crossbones" style="color:#ef4444;margin-right:8px"></i>Demo Deadlock
        </div>
      </div>
      <div class="card-body">
        <p style="font-size:13px;color:#64748b;margin-bottom:16px">
          Tạo 2 transaction cố tình khóa chéo nhau. PostgreSQL sẽ tự động phát hiện và
          abort 1 bên để giải quyết.
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
          <div>
            <label class="form-label">Lớp A (T1 khóa)</label>
            <input class="form-input" id="dl-lopa" placeholder="L_A_001" value="L_A_001" />
          </div>
          <div>
            <label class="form-label">Lớp B (T2 khóa)</label>
            <input class="form-input" id="dl-lopb" placeholder="L_A_002" value="L_A_002" />
          </div>
        </div>
        <button class="btn btn-danger" id="btn-deadlock">
          <i class="fas fa-bomb"></i> Kích hoạt Deadlock Demo
        </button>
        <div id="deadlock-result" style="margin-top:12px"></div>
      </div>
    </div>
  </div>

  <!-- Activity log -->
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="fas fa-scroll" style="color:#64748b;margin-right:8px"></i>Nhật ký thao tác</div>
      <button class="btn btn-outline btn-sm" id="btn-reload-log">
        <i class="fas fa-arrows-rotate"></i> Tải lại
      </button>
    </div>
    <div style="padding:12px 20px;background:#f8fafc;border-bottom:1px solid #f1f5f9;display:flex;gap:10px;flex-wrap:wrap">
      <select class="form-select" id="log-site" style="width:auto;font-size:13px">
        <option value="">Tất cả site</option>
        <option value="A">Site A</option>
        <option value="B">Site B</option>
        <option value="C">Site C</option>
      </select>
      <select class="form-select" id="log-hanhdong" style="width:auto;font-size:13px">
        <option value="">Tất cả thao tác</option>
        <option value="DANG_KY">DANG_KY</option>
        <option value="HUY_DANG_KY">HUY_DANG_KY</option>
      </select>
      <input class="form-input" id="log-masv" placeholder="Lọc theo MaSV" style="width:160px;font-size:13px" />
      <select class="form-select" id="log-limit" style="width:auto;font-size:13px">
        <option value="20">20 bản ghi</option>
        <option value="50">50 bản ghi</option>
        <option value="100">100 bản ghi</option>
      </select>
    </div>
    <div id="log-content">
      <div class="empty-state"><i class="fas fa-spinner fa-spin"></i>Đang tải...</div>
    </div>
  </div>`;
}

export async function init() {
  await checkHealth();
  document.getElementById('btn-health-check').addEventListener('click', checkHealth);

  // Sync
  document.querySelectorAll('.sync-btn').forEach(btn => {
    btn.addEventListener('click', () => syncTable(btn.dataset.table));
  });
  document.getElementById('btn-sync-all').addEventListener('click', () => syncTable(null));

  // Assign GV
  document.getElementById('btn-phan-cong').addEventListener('click', phanCongGV);

  // Demo
  document.getElementById('btn-demo-lock').addEventListener('click', () => runDemoDongThoi(true));
  document.getElementById('btn-demo-nolock').addEventListener('click', () => runDemoDongThoi(false));
  document.getElementById('btn-deadlock').addEventListener('click', runDeadlock);

  // Log
  document.getElementById('btn-reload-log').addEventListener('click', loadLog);
  ['log-site','log-hanhdong','log-masv','log-limit'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', loadLog);
  });
  document.getElementById('log-masv').addEventListener('keydown', e => e.key==='Enter' && loadLog());

  await loadLog();
}

async function checkHealth() {
  ['A','B','C'].forEach(s => {
    document.getElementById(`health-badge-${s}`).innerHTML = `<span class="inline-spinner"></span>`;
    document.getElementById(`health-detail-${s}`).textContent = '—';
  });
  try {
    const { sites } = await api.health();
    for (const [s, info] of Object.entries(sites)) {
      const badge = document.getElementById(`health-badge-${s}`);
      const detail = document.getElementById(`health-detail-${s}`);
      const dot = document.getElementById(`dot-${s}`);
      if (info.ok) {
        badge.className = 'badge tag-ok';
        badge.textContent = 'Online';
        detail.innerHTML = `
          <div><i class="fas fa-database" style="color:#10b981;margin-right:6px"></i>${info.db}</div>
          <div><i class="fas fa-clock" style="color:#94a3b8;margin-right:6px"></i>${new Date(info.ts).toLocaleString('vi-VN')}</div>`;
        if (dot) dot.className = 'status-dot dot-online';
      } else {
        badge.className = 'badge tag-err';
        badge.textContent = 'Offline';
        detail.innerHTML = `<div style="color:#ef4444"><i class="fas fa-circle-xmark" style="margin-right:6px"></i>${info.error}</div>`;
        if (dot) dot.className = 'status-dot dot-offline';
      }

      // Global status bar
      const gs = document.getElementById('global-status');
      if (gs) {
        const allSites = await api.health().catch(()=>({sites:{A:{ok:false},B:{ok:false},C:{ok:false}}}));
        gs.innerHTML = ['A','B','C'].map(x => {
          const ok = allSites.sites[x]?.ok;
          return `<div class="gs-item"><div class="gs-dot" style="background:${ok?'#22c55e':'#ef4444'}"></div>Site ${x}</div>`;
        }).join('');
      }
    }
  } catch (err) {
    ['A','B','C'].forEach(s => {
      document.getElementById(`health-badge-${s}`).innerHTML = '<span style="color:#ef4444">Lỗi</span>';
    });
  }
}

async function syncTable(table) {
  const src = document.getElementById('sync-src').value;
  const resEl = document.getElementById('sync-result');
  resEl.innerHTML = `<div style="font-size:13px;color:#64748b"><span class="inline-spinner"></span> Đang đồng bộ${table ? ` ${table}` : ' tất cả bảng'}...</div>`;
  try {
    const result = await api.syncCatalog(table || undefined, src);
    resEl.innerHTML = `
      <div style="background:#f0fdf4;border-radius:8px;padding:12px;font-size:13px">
        <div style="font-weight:600;color:#166534;margin-bottom:6px"><i class="fas fa-check-circle" style="margin-right:6px"></i>Đồng bộ hoàn tất</div>
        ${Object.entries(result.results||{}).map(([t,r])=>`
          <div style="display:flex;gap:8px;padding:3px 0">
            <span class="tag ${r==='ok'?'tag-ok':'tag-err'}">${r==='ok'?'✓':'✗'}</span>
            <span>${t}</span>
            ${r!=='ok'?`<span style="color:#ef4444">${r}</span>`:''}
          </div>`).join('')}
      </div>`;
    toast('Đồng bộ thành công', 'success');
  } catch (err) {
    resEl.innerHTML = `<div style="font-size:13px;color:#ef4444"><i class="fas fa-circle-xmark" style="margin-right:6px"></i>${err.message}</div>`;
    toast('Lỗi đồng bộ: ' + err.message, 'error');
  }
}

async function phanCongGV() {
  const maLop = document.getElementById('pc-malop').value.trim();
  const maGV  = document.getElementById('pc-magv').value.trim();
  const resEl = document.getElementById('pc-result');
  if (!maLop || !maGV) { toast('Nhập đầy đủ Mã lớp và Mã GV', 'warn'); return; }

  resEl.innerHTML = `<div style="font-size:13px;color:#64748b"><span class="inline-spinner"></span> Đang xử lý...</div>`;
  try {
    const res = await api.phanCongGV(maLop, maGV);
    if (res.success) {
      resEl.innerHTML = `<div class="tag tag-ok" style="font-size:13px;padding:6px 12px"><i class="fas fa-check" style="margin-right:6px"></i>Phân công thành công</div>`;
      toast(`Phân công GV ${maGV} cho lớp ${maLop} thành công`, 'success');
    } else {
      resEl.innerHTML = `<div class="tag tag-err" style="font-size:13px;padding:6px 12px"><i class="fas fa-xmark" style="margin-right:6px"></i>${res.reason || 'Thất bại'}: ${res.message||''}</div>`;
      toast(res.reason || 'Không thể phân công', 'error');
    }
  } catch (err) {
    resEl.innerHTML = `<div style="font-size:13px;color:#ef4444">${err.message}</div>`;
    toast('Lỗi: ' + err.message, 'error');
  }
}

async function runDemoDongThoi(useLock) {
  const maLop   = document.getElementById('demo-malop').value.trim();
  const soLuong = parseInt(document.getElementById('demo-so-luong').value) || 30;
  const resEl   = document.getElementById('demo-result');
  if (!maLop) { toast('Nhập mã lớp để demo', 'warn'); return; }

  resEl.innerHTML = `<div class="demo-result"><span class="demo-info">▶ Đang chạy demo ${soLuong} requests đồng thời (${useLock?'CÓ':'KHÔNG'} khóa)...</span></div>`;
  try {
    const start = Date.now();
    const res = await api.demoDongThoi(maLop, soLuong, useLock);
    const elapsed = Date.now() - start;
    resEl.innerHTML = `<div class="demo-result">
      <div class="demo-info">── Kết quả demo (${elapsed}ms) ──</div>
      <div class="demo-ok">✓ Thành công: ${res.thanhCong ?? res.ok ?? '?'}</div>
      <div class="demo-err">✗ Thất bại: ${res.thatBai ?? res.failed ?? '?'}</div>
      <div class="demo-info">── Lý do thất bại ──</div>
      ${Object.entries(res.lyDo || res.reasons || {}).map(([r,n])=>`<div style="color:#fbbf24">${r}: ${n}</div>`).join('')}
      ${res.siSoToiDa ? `<div class="demo-info">── Sĩ số tối đa: ${res.siSoToiDa} ──</div>` : ''}
      <div class="demo-info">${useLock ? '🔒 SELECT FOR UPDATE ngăn over-booking thành công' : '⚠️ Không có khóa — có thể over-book!'}</div>
    </div>`;
  } catch (err) {
    resEl.innerHTML = `<div class="demo-result"><span class="demo-err">✗ Lỗi: ${err.message}</span></div>`;
  }
}

async function runDeadlock() {
  const lopA = document.getElementById('dl-lopa').value.trim() || 'L_A_001';
  const lopB = document.getElementById('dl-lopb').value.trim() || 'L_A_002';
  const resEl = document.getElementById('deadlock-result');
  resEl.innerHTML = `<div class="demo-result"><span class="demo-info">▶ Kích hoạt deadlock giữa ${lopA} và ${lopB}...</span></div>`;
  try {
    const res = await api.demoDeadlock(lopA, lopB);
    resEl.innerHTML = `<div class="demo-result">
      ${(res.log||[]).map(l => {
        const cls = l.includes('LOCK') ? 'demo-info' : l.includes('victim') ? 'demo-err' : l.includes('fulfilled') ? 'demo-ok' : 'demo-info';
        return `<div class="${cls}">${l}</div>`;
      }).join('')}
      <div class="demo-info" style="margin-top:8px">── PostgreSQL tự động phát hiện & giải quyết deadlock ──</div>
    </div>`;
    toast('Demo deadlock hoàn tất — PostgreSQL đã abort 1 transaction', 'info');
  } catch (err) {
    resEl.innerHTML = `<div class="demo-result"><span class="demo-err">✗ ${err.message}</span></div>`;
  }
}

async function loadLog() {
  const site     = document.getElementById('log-site')?.value;
  const hanhDong = document.getElementById('log-hanhdong')?.value;
  const maSV     = document.getElementById('log-masv')?.value.trim();
  const limit    = document.getElementById('log-limit')?.value || 20;
  const el = document.getElementById('log-content');
  el.innerHTML = `<div class="empty-state"><i class="fas fa-spinner fa-spin"></i>Đang tải nhật ký...</div>`;
  try {
    const rows = await api.log({ site, hanhDong, maSV, limit });
    if (!rows.length) {
      el.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i>Không có bản ghi nào</div>`;
      return;
    }
    el.innerHTML = `<div class="overflow-x-auto"><table class="data-table" style="font-size:12.5px">
      <thead><tr><th>#</th><th>Site</th><th>Thao tác</th><th>Mã SV</th><th>Lớp</th><th>Kết quả</th><th>Thời gian</th><th>Ghi chú</th></tr></thead>
      <tbody>${rows.map((r,i)=>`<tr>
        <td style="color:#94a3b8">${i+1}</td>
        <td>${siteBadge(r.site_nguon||r.sitexuly||'?')}</td>
        <td><code style="font-size:11px;background:#f8fafc;padding:1px 5px;border-radius:3px">${r.hanhdong||'—'}</code></td>
        <td style="font-size:11.5px">${r.masv||'—'}</td>
        <td style="font-size:11.5px">${r.malop||'—'}</td>
        <td><span class="tag ${r.ketqua==='ThanhCong'||r.ketqua==='OK' ?'tag-ok':'tag-err'}">${r.ketqua||'—'}</span></td>
        <td style="font-size:11.5px;white-space:nowrap">${fmtDate(r.thoigian)}</td>
        <td style="font-size:11px;color:#94a3b8;max-width:200px;overflow:hidden;text-overflow:ellipsis">${r.ghichu||'—'}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  } catch (err) {
    el.innerHTML = `<div class="empty-state"><i class="fas fa-circle-xmark" style="color:#ef4444"></i>${err.message}</div>`;
  }
}
