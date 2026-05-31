'use strict';

const BASE = '/api';

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function qs(params) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') p.set(k, v);
  }
  const s = p.toString();
  return s ? '?' + s : '';
}

export const api = {
  // System
  health:       ()                      => req('/admin/health'),

  // Courses & catalog
  courses:      (p = {})               => req('/hocphan' + qs(p)),
  courseDetail: (id)                   => req(`/hocphan/${encodeURIComponent(id)}`),
  catalogHP:    ()                     => req('/hocphan/danhmuc/hocphan'),
  catalogGV:    (p = {})              => req('/hocphan/danhmuc/giangvien' + qs(p)),
  catalogPhong: ()                     => req('/hocphan/danhmuc/phong'),

  // Registration
  dangKy:       (maSV, maLop, useLock = true) =>
    req('/dangky', { method: 'POST', body: { maSV, maLop, useLock } }),
  huyDangKy:    (maDK, maSV) =>
    req(`/dangky/${maDK}?maSV=${encodeURIComponent(maSV)}`, { method: 'DELETE' }),
  dsDangKy:     (maSV)                => req(`/dangky/sv/${encodeURIComponent(maSV)}`),
  demoDongThoi: (maLop, soLuong = 30, useLock = true) =>
    req('/dangky/demo-dongthoi', { method: 'POST', body: { maLop, soLuong, useLock } }),

  // Schedule
  lichSV:       (maSV, hocKy)         => req(`/lich/sv/${encodeURIComponent(maSV)}` + qs({ hocKy })),
  lichGV:       (maGV, hocKy)         => req(`/lich/gv/${encodeURIComponent(maGV)}` + qs({ hocKy })),
  lichPhong:    (maPhong, hocKy)      => req(`/lich/phong/${encodeURIComponent(maPhong)}` + qs({ hocKy })),
  taiGiangDay:  (hocKy)              => req(`/lich/tai-giang-day?hocKy=${hocKy}`),
  phanCongGV:   (maLop, maGV)        =>
    req('/lich/phan-cong-gv', { method: 'POST', body: { maLop, maGV } }),
  taoLop:       (data)               =>
    req('/lich/tao-lop', { method: 'POST', body: data }),

  // Statistics
  statsAll:     (hocKy)              => req('/thongke/all' + qs({ hocKy })),

  // Admin
  log:          (p = {})             => req('/admin/log' + qs(p)),
  syncCatalog:  (table, sourceSite)  =>
    req('/admin/sync-catalog', { method: 'POST', body: { table, sourceSite } }),
  demoDeadlock: (lopA, lopB)         =>
    req('/admin/demo-deadlock', { method: 'POST', body: { lopA, lopB } }),
};
