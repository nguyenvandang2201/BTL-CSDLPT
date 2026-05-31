'use strict';
import { closeModal } from './utils.js';

// ── Page registry ───────────────────────────────────────────
const PAGES = {
  dashboard:    { title: 'Tổng quan',           load: () => import('./pages/dashboard.js') },
  courses:      { title: 'Lớp học phần',         load: () => import('./pages/courses.js') },
  registration: { title: 'Đăng ký học phần',    load: () => import('./pages/registration.js') },
  schedule:     { title: 'Thời khoá biểu',      load: () => import('./pages/schedule.js') },
  stats:        { title: 'Thống kê phân tán',   load: () => import('./pages/stats.js') },
  admin:        { title: 'Quản trị & Demo',     load: () => import('./pages/admin.js') },
};

let _currentPage = null;

// ── Router ──────────────────────────────────────────────────
async function navigate(hash) {
  const page = hash.replace(/^#/, '') || 'dashboard';
  if (!PAGES[page]) return navigate('dashboard');

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  // Update page title
  document.getElementById('page-title').textContent = PAGES[page].title;

  // Load and render
  const content = document.getElementById('app-content');
  content.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:200px;color:#94a3b8">
      <div class="text-center">
        <div style="width:36px;height:36px;border:3px solid #e2e8f0;border-top-color:#3b82f6;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 12px"></div>
        <div>Đang tải trang...</div>
      </div>
    </div>`;

  try {
    const mod = await PAGES[page].load();
    content.innerHTML = mod.render();
    if (mod.init) await mod.init(content);
    _currentPage = page;
  } catch (err) {
    console.error(err);
    content.innerHTML = `
      <div style="text-align:center;padding:60px;color:#ef4444">
        <i class="fas fa-circle-xmark" style="font-size:40px;margin-bottom:16px;display:block"></i>
        <div style="font-weight:600;margin-bottom:8px">Không thể tải trang</div>
        <div style="font-size:13px;color:#94a3b8">${err.message}</div>
      </div>`;
  }
}

// ── Clock ───────────────────────────────────────────────────
function startClock() {
  function tick() {
    const el = document.getElementById('clock');
    if (el) {
      el.textContent = new Date().toLocaleTimeString('vi-VN', { hour12: false });
    }
  }
  tick();
  setInterval(tick, 1000);
}

// ── Health poll (sidebar dots) ──────────────────────────────
async function pollHealth() {
  try {
    const { api } = await import('./api.js');
    const { sites } = await api.health();
    for (const [s, info] of Object.entries(sites)) {
      const dot = document.getElementById(`dot-${s}`);
      if (dot) dot.className = `status-dot ${info.ok ? 'dot-online' : 'dot-offline'}`;
    }
    const gs = document.getElementById('global-status');
    if (gs) {
      gs.innerHTML = Object.entries(sites).map(([s, info]) =>
        `<div class="gs-item"><div class="gs-dot" style="background:${info.ok?'#22c55e':'#ef4444'}"></div>Site ${s}</div>`
      ).join('');
    }
  } catch (_) {}
}

// ── Boot ────────────────────────────────────────────────────
window._closeModal = closeModal;

window.addEventListener('hashchange', () => navigate(location.hash));

startClock();
pollHealth();
setInterval(pollHealth, 30000);

// Initial navigation
navigate(location.hash || '#dashboard');
