'use strict';
const express = require('express');
const router  = express.Router();
const { coordinator, pools } = require('../db');

// GET /api/hocphan — Danh sách lớp học phần toàn trường
// Query: ?maCoSo=A&hocKy=20241&maHP=IT001
router.get('/', async (req, res) => {
  try {
    const { maCoSo, hocKy, maHP } = req.query;
    const conditions = [];
    const params = [];

    if (maCoSo) { params.push(maCoSo); conditions.push(`lhp.MaCoSo=$${params.length}`); }
    if (hocKy)  { params.push(hocKy);  conditions.push(`lhp.HocKy=$${params.length}`);  }
    if (maHP)   { params.push(maHP);   conditions.push(`lhp.MaHP=$${params.length}`);   }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await coordinator.query(`
      SELECT lhp.MaLop, lhp.MaHP, hp.TenHP, hp.SoTinChi,
             lhp.MaCoSo, cs.TenCoSo, lhp.HocKy,
             lhp.MaGV, gv.HoTen AS TenGV,
             lhp.MaPhong,
             lhp.SiSoToiDa, lhp.SoDaDangKy,
             (lhp.SiSoToiDa - lhp.SoDaDangKy) AS ConLai,
             lhp.ThuTrongTuan, lhp.TietBD, lhp.TietKT,
             lhp.site
      FROM v_LopHocPhan_All lhp
      JOIN HocPhan hp          ON lhp.MaHP   = hp.MaHP
      JOIN CoSo cs             ON lhp.MaCoSo = cs.MaCoSo
      LEFT JOIN v_GiangVien_All gv ON lhp.MaGV = gv.MaGV
      ${where}
      ORDER BY lhp.MaCoSo, lhp.HocKy, lhp.MaLop
    `, params);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hocphan/danhmuc/hocphan — Danh mục học phần (replicated)
// QUAN TRỌNG: phải đặt trước /:maLop để Express không bắt nhầm
router.get('/danhmuc/hocphan', async (req, res) => {
  try {
    const { rows } = await coordinator.query(`
      SELECT hp.MaHP, hp.TenHP, hp.SoTinChi, hp.MoTa, k.TenKhoa
      FROM HocPhan hp
      JOIN Khoa k ON hp.MaKhoa = k.MaKhoa
      ORDER BY hp.MaHP
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hocphan/danhmuc/giangvien — Danh sách GV toàn trường (qua FDW)
router.get('/danhmuc/giangvien', async (req, res) => {
  try {
    const { maCoSo } = req.query;
    const params = [];
    const where = maCoSo
      ? `WHERE gv.MaCoSo=$${params.push(maCoSo)}`
      : '';

    const { rows } = await coordinator.query(`
      SELECT gv.MaGV, gv.HoTen, gv.MaCoSo, cs.TenCoSo, gv.MaKhoa, k.TenKhoa
      FROM v_GiangVien_All gv
      JOIN CoSo cs ON gv.MaCoSo = cs.MaCoSo
      JOIN Khoa k  ON gv.MaKhoa = k.MaKhoa
      ${where}
      ORDER BY gv.MaCoSo, gv.MaGV
    `, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hocphan/danhmuc/phong — Danh sách phòng học
router.get('/danhmuc/phong', async (req, res) => {
  try {
    const { maCoSo } = req.query;
    const rows_all = [];

    for (const [site, pool] of Object.entries(pools)) {
      try {
        const params = [];
        const where = maCoSo ? `WHERE MaCoSo=$${params.push(maCoSo)}` : '';
        const { rows } = await pool.query(
          `SELECT MaPhong, TenPhong, MaCoSo, SucChua FROM PhongHoc ${where} ORDER BY MaPhong`,
          params
        );
        rows.forEach(r => rows_all.push({ ...r, site }));
      } catch (_) {}
    }
    res.json(rows_all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hocphan/:maLop — Chi tiết 1 lớp + danh sách SV đã đăng ký
// Đặt SAU /danhmuc/* để tránh Express bắt nhầm 'danhmuc' thành :maLop
router.get('/:maLop', async (req, res) => {
  try {
    const { maLop } = req.params;

    const { rows: lopRows } = await coordinator.query(`
      SELECT lhp.MaLop, lhp.MaHP, hp.TenHP, hp.SoTinChi,
             lhp.MaCoSo, cs.TenCoSo, lhp.HocKy,
             lhp.MaGV, gv.HoTen AS TenGV,
             lhp.MaPhong, lhp.SiSoToiDa, lhp.SoDaDangKy,
             lhp.ThuTrongTuan, lhp.TietBD, lhp.TietKT, lhp.site
      FROM v_LopHocPhan_All lhp
      JOIN HocPhan hp              ON lhp.MaHP   = hp.MaHP
      JOIN CoSo cs                 ON lhp.MaCoSo = cs.MaCoSo
      LEFT JOIN v_GiangVien_All gv ON lhp.MaGV   = gv.MaGV
      WHERE lhp.MaLop = $1
    `, [maLop]);

    if (!lopRows.length) return res.status(404).json({ error: 'Lop khong ton tai' });

    const { rows: svRows } = await coordinator.query(`
      SELECT dk.MaDK, dk.MaSV, sv.HoTen AS TenSV, sv.MaCoSo AS CoSoSV,
             dk.TrangThai, dk.ThoiGianDK
      FROM v_DangKy_All dk
      JOIN v_SinhVien_All sv ON dk.MaSV = sv.MaSV
      WHERE dk.MaLop = $1 AND dk.TrangThai = 'DangKy'
      ORDER BY dk.ThoiGianDK
    `, [maLop]);

    res.json({ ...lopRows[0], danhSachSV: svRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
