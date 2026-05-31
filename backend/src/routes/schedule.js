'use strict';
const express = require('express');
const router  = express.Router();
const { coordinator, pools } = require('../db');
const { phanCongGV, taoLopHocPhan, getLichDayGV, thongKeTaiGiangDay }
  = require('../services/teachingScheduleService');

// ── Lịch học sinh viên ────────────────────────────────────────────────────────

// GET /api/lich/sv/:maSV?hocKy=20241
router.get('/sv/:maSV', async (req, res) => {
  try {
    const { maSV } = req.params;
    const { hocKy } = req.query;
    const params = [maSV];
    const hkCond = hocKy ? `AND lhp.HocKy=$${params.push(hocKy)}` : '';

    const { rows } = await coordinator.query(`
      SELECT dk.MaDK, lhp.MaLop, hp.TenHP, hp.SoTinChi,
             lhp.MaCoSo, cs.TenCoSo, lhp.HocKy,
             lhp.ThuTrongTuan, lhp.TietBD, lhp.TietKT,
             lhp.MaPhong, gv.HoTen AS TenGV
      FROM v_DangKy_All dk
      JOIN v_LopHocPhan_All lhp    ON dk.MaLop   = lhp.MaLop
      JOIN HocPhan hp              ON lhp.MaHP    = hp.MaHP
      JOIN CoSo cs                 ON lhp.MaCoSo  = cs.MaCoSo
      LEFT JOIN v_GiangVien_All gv ON lhp.MaGV    = gv.MaGV
      WHERE dk.MaSV = $1 AND dk.TrangThai = 'DangKy' ${hkCond}
      ORDER BY lhp.ThuTrongTuan, lhp.TietBD
    `, params);

    // Đánh dấu ô trùng lịch (tính phía server để UI hiển thị màu đỏ)
    const withConflict = rows.map(lop => {
      const conflict = rows.find(o =>
        o.malop !== lop.malop &&
        o.thutrongtuan === lop.thutrongtuan &&
        o.tietbd <= lop.tietkt &&
        o.tietkt >= lop.tietbd
      );
      return { ...lop, hasConflict: !!conflict, conflictWith: conflict?.malop ?? null };
    });

    res.json(withConflict);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Lịch sử dụng phòng ────────────────────────────────────────────────────────

// GET /api/lich/phong/:maPhong?hocKy=20241
router.get('/phong/:maPhong', async (req, res) => {
  try {
    const { maPhong } = req.params;
    const { hocKy } = req.query;

    for (const pool of Object.values(pools)) {
      const chk = await pool.query('SELECT 1 FROM PhongHoc WHERE MaPhong=$1', [maPhong]);
      if (!chk.rows.length) continue;

      const params = [maPhong];
      const hkCond = hocKy ? `AND lhp.HocKy=$${params.push(hocKy)}` : '';

      const { rows } = await pool.query(`
        SELECT lhp.MaLop, hp.TenHP, lhp.HocKy,
               lhp.ThuTrongTuan, lhp.TietBD, lhp.TietKT,
               lhp.SoDaDangKy, lhp.SiSoToiDa,
               gv.HoTen AS TenGV
        FROM LopHocPhan lhp
        JOIN HocPhan hp          ON lhp.MaHP = hp.MaHP
        LEFT JOIN GiangVien gv   ON lhp.MaGV = gv.MaGV
        WHERE lhp.MaPhong = $1 ${hkCond}
        ORDER BY lhp.ThuTrongTuan, lhp.TietBD
      `, params);

      return res.json(rows);
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Lịch dạy giảng viên ───────────────────────────────────────────────────────

// GET /api/lich/gv/:maGV?hocKy=20241
router.get('/gv/:maGV', async (req, res) => {
  try {
    const rows = await getLichDayGV(req.params.maGV, req.query.hocKy || null);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/lich/tai-giang-day?hocKy=20241
router.get('/tai-giang-day', async (req, res) => {
  try {
    const { hocKy } = req.query;
    if (!hocKy) return res.status(400).json({ error: 'Thieu hocKy' });
    res.json(await thongKeTaiGiangDay(hocKy));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Quản lý lớp học phần (Admin) ─────────────────────────────────────────────

// POST /api/lich/phan-cong-gv — Body: { maLop, maGV }
router.post('/phan-cong-gv', async (req, res) => {
  try {
    const { maLop, maGV } = req.body;
    if (!maLop || !maGV) return res.status(400).json({ error: 'Thieu maLop hoac maGV' });
    const result = await phanCongGV(maLop, maGV);
    res.status(result.success ? 200 : 409).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/lich/tao-lop — Body: { maLop, maHP, maGV?, maCoSo, maPhong?, hocKy, siSoToiDa, thuTrongTuan?, tietBD?, tietKT? }
router.post('/tao-lop', async (req, res) => {
  try {
    const required = ['maLop', 'maHP', 'maCoSo', 'hocKy', 'siSoToiDa'];
    const missing  = required.filter(f => !req.body[f]);
    if (missing.length) return res.status(400).json({ error: `Thieu truong: ${missing.join(', ')}` });

    const result = await taoLopHocPhan(req.body);
    res.status(result.success ? 201 : 409).json(result);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'MaLop da ton tai' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
