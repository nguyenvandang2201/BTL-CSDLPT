'use strict';
const { coordinator, pools } = require('../db');

// Tìm lịch lớp học phần — duyệt qua cả 3 site
async function getLopSchedule(maLop) {
  for (const pool of Object.values(pools)) {
    try {
      const { rows } = await pool.query(
        `SELECT MaLop, MaGV, MaPhong, HocKy, ThuTrongTuan, TietBD, TietKT
         FROM LopHocPhan WHERE MaLop = $1`,
        [maLop]
      );
      if (rows.length) return rows[0];
    } catch (_) {}
  }
  return null;
}

// Kiểm tra trùng lịch SV — phân tán qua FDW tại Site A (coordinator)
async function checkSVScheduleConflict(maSV, maLopMoi) {
  const lopMoi = await getLopSchedule(maLopMoi);
  if (!lopMoi || !lopMoi.thutrongtuan) return { hasConflict: false };

  const { rows } = await coordinator.query(
    `SELECT lhp.MaLop, lhp.ThuTrongTuan, lhp.TietBD, lhp.TietKT, hp.TenHP
     FROM v_DangKy_All dk
     JOIN v_LopHocPhan_All lhp ON dk.MaLop = lhp.MaLop
     JOIN HocPhan hp ON lhp.MaHP = hp.MaHP
     WHERE dk.MaSV      = $1
       AND dk.TrangThai  = 'DangKy'
       AND dk.MaLop     <> $2
       AND lhp.HocKy     = $3
       AND lhp.ThuTrongTuan IS NOT NULL`,
    [maSV, maLopMoi, lopMoi.hocky]
  );

  for (const lop of rows) {
    if (
      lop.thutrongtuan === lopMoi.thutrongtuan &&
      lop.tietbd <= lopMoi.tietkt &&
      lop.tietkt >= lopMoi.tietbd
    ) {
      return {
        hasConflict: true,
        conflictLop: lop.malop,
        conflictHP:  lop.tenhp,
        thu:   lopMoi.thutrongtuan,
        tietBD: lopMoi.tietbd,
        tietKT: lopMoi.tietkt,
      };
    }
  }
  return { hasConflict: false };
}

// Kiểm tra trùng lịch PHÒNG — cục bộ tại site chứa phòng
async function checkPhongConflict(maPhong, hocKy, thu, tietBD, tietKT, maLopExclude = null) {
  if (!maPhong || !thu) return { hasConflict: false };
  for (const pool of Object.values(pools)) {
    try {
      const chk = await pool.query('SELECT 1 FROM PhongHoc WHERE MaPhong=$1', [maPhong]);
      if (!chk.rows.length) continue;
      const { rows } = await pool.query(
        `SELECT MaLop FROM LopHocPhan
         WHERE MaPhong = $1 AND HocKy = $2 AND ThuTrongTuan = $3
           AND TietBD <= $5 AND TietKT >= $4
           AND ($6::VARCHAR IS NULL OR MaLop <> $6)`,
        [maPhong, hocKy, thu, tietBD, tietKT, maLopExclude]
      );
      if (rows.length) return { hasConflict: true, conflictLop: rows[0].malop };
      return { hasConflict: false };
    } catch (_) {}
  }
  return { hasConflict: false };
}

// Kiểm tra trùng lịch GV — qua FDW (GV có thể dạy nhiều site)
async function checkGVConflict(maGV, hocKy, thu, tietBD, tietKT, maLopExclude = null) {
  if (!maGV || !thu) return { hasConflict: false };
  const { rows } = await coordinator.query(
    `SELECT MaLop, MaCoSo FROM v_LopHocPhan_All
     WHERE MaGV = $1 AND HocKy = $2 AND ThuTrongTuan = $3
       AND TietBD <= $5 AND TietKT >= $4
       AND ($6::VARCHAR IS NULL OR MaLop <> $6)`,
    [maGV, hocKy, thu, tietBD, tietKT, maLopExclude]
  );
  if (rows.length) return { hasConflict: true, conflictLop: rows[0].malop, coSo: rows[0].macoso };
  return { hasConflict: false };
}

module.exports = { getLopSchedule, checkSVScheduleConflict, checkPhongConflict, checkGVConflict };
