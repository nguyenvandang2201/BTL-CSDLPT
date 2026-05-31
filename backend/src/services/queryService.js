'use strict';
const { coordinator } = require('../db');

// Q1 — Số SV đăng ký theo từng cơ sở
async function soSVTheoCoSo() {
  const { rows } = await coordinator.query(`
    SELECT lhp.MaCoSo, cs.TenCoSo,
           COUNT(dk.MaDK)            AS SoLuotDangKy,
           COUNT(DISTINCT dk.MaSV)   AS SoSVDangKy
    FROM v_DangKy_All dk
    JOIN v_LopHocPhan_All lhp ON dk.MaLop = lhp.MaLop
    JOIN CoSo cs ON lhp.MaCoSo = cs.MaCoSo
    WHERE dk.TrangThai = 'DangKy'
    GROUP BY lhp.MaCoSo, cs.TenCoSo
    ORDER BY SoLuotDangKy DESC`);
  return rows;
}

// Q2 — Top 5 học phần đông đăng ký nhất toàn trường
async function hocPhanDongNhat() {
  const { rows } = await coordinator.query(`
    SELECT hp.MaHP, hp.TenHP, hp.SoTinChi,
           k.TenKhoa, COUNT(dk.MaDK) AS TongDangKy
    FROM v_DangKy_All dk
    JOIN v_LopHocPhan_All lhp ON dk.MaLop = lhp.MaLop
    JOIN HocPhan hp ON lhp.MaHP = hp.MaHP
    JOIN Khoa k ON hp.MaKhoa = k.MaKhoa
    WHERE dk.TrangThai = 'DangKy'
    GROUP BY hp.MaHP, hp.TenHP, hp.SoTinChi, k.TenKhoa
    ORDER BY TongDangKy DESC LIMIT 5`);
  return rows;
}

// Q3 — SV đăng ký chéo cơ sở (SV của cơ sở này học lớp ở cơ sở khác)
async function dangKyCheoCoso() {
  const { rows } = await coordinator.query(`
    SELECT sv.MaSV, sv.HoTen       AS TenSV,
           sv.MaCoSo               AS CoSoNha,
           cs_nha.TenCoSo          AS TenCoSoNha,
           lhp.MaCoSo              AS CoSoLop,
           cs_lop.TenCoSo          AS TenCoSoLop,
           hp.TenHP, lhp.MaLop, lhp.HocKy
    FROM v_DangKy_All dk
    JOIN v_LopHocPhan_All lhp  ON dk.MaLop  = lhp.MaLop
    JOIN v_SinhVien_All sv     ON dk.MaSV   = sv.MaSV
    JOIN HocPhan hp            ON lhp.MaHP  = hp.MaHP
    JOIN CoSo cs_nha           ON sv.MaCoSo = cs_nha.MaCoSo
    JOIN CoSo cs_lop           ON lhp.MaCoSo = cs_lop.MaCoSo
    WHERE dk.TrangThai = 'DangKy'
      AND sv.MaCoSo <> lhp.MaCoSo
    ORDER BY sv.MaCoSo, sv.MaSV`);
  return rows;
}

// Q4 — Tỷ lệ lấp đầy các lớp toàn hệ thống
async function tyLeLapDay() {
  const { rows } = await coordinator.query(`
    SELECT lhp.site, lhp.MaLop, hp.TenHP,
           lhp.MaCoSo, cs.TenCoSo, lhp.HocKy,
           lhp.SoDaDangKy AS DaDangKy, lhp.SiSoToiDa,
           ROUND(lhp.SoDaDangKy * 100.0 / NULLIF(lhp.SiSoToiDa, 0), 1) AS TyLePct,
           CASE
             WHEN lhp.SoDaDangKy >= lhp.SiSoToiDa THEN 'Đầy'
             WHEN lhp.SoDaDangKy * 1.0 / NULLIF(lhp.SiSoToiDa, 0) >= 0.8 THEN 'Gần đầy'
             ELSE 'Còn chỗ'
           END AS TrangThai
    FROM v_LopHocPhan_All lhp
    JOIN HocPhan hp ON lhp.MaHP = hp.MaHP
    JOIN CoSo cs    ON lhp.MaCoSo = cs.MaCoSo
    ORDER BY TyLePct DESC`);
  return rows;
}

// Q5 — Số lớp mở theo khoa và theo cơ sở
async function soLopTheoKhoaVaCoSo() {
  const { rows } = await coordinator.query(`
    SELECT k.TenKhoa, lhp.MaCoSo, cs.TenCoSo,
           COUNT(*)                AS SoLop,
           SUM(lhp.SiSoToiDa)     AS TongSiSo,
           SUM(lhp.SoDaDangKy)    AS TongDaDangKy,
           ROUND(SUM(lhp.SoDaDangKy) * 100.0 / NULLIF(SUM(lhp.SiSoToiDa), 0), 1) AS TyLeTBPct
    FROM v_LopHocPhan_All lhp
    JOIN HocPhan hp ON lhp.MaHP  = hp.MaHP
    JOIN Khoa k     ON hp.MaKhoa = k.MaKhoa
    JOIN CoSo cs    ON lhp.MaCoSo = cs.MaCoSo
    GROUP BY k.TenKhoa, lhp.MaCoSo, cs.TenCoSo
    ORDER BY k.TenKhoa, lhp.MaCoSo`);
  return rows;
}

// Q6 — Lịch dạy GV toàn trường (lọc tùy chọn)
async function lichDayGiangVien(maGV = null, hocKy = null) {
  const conditions = [];
  const params = [];
  if (maGV)  { params.push(maGV);  conditions.push(`lhp.MaGV=$${params.length}`); }
  if (hocKy) { params.push(hocKy); conditions.push(`lhp.HocKy=$${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await coordinator.query(`
    SELECT gv.MaGV, gv.HoTen AS TenGV, gv.MaCoSo AS CoSoGV,
           cs_gv.TenCoSo AS TenCoSoGV,
           lhp.MaLop, hp.TenHP, lhp.MaCoSo AS CoSoLop,
           cs_lop.TenCoSo AS TenCoSoLop,
           lhp.HocKy, lhp.ThuTrongTuan, lhp.TietBD, lhp.TietKT,
           (lhp.TietKT - lhp.TietBD + 1) AS SoTiet,
           lhp.SiSoToiDa, lhp.SoDaDangKy
    FROM v_LopHocPhan_All lhp
    JOIN v_GiangVien_All gv  ON lhp.MaGV    = gv.MaGV
    JOIN HocPhan hp           ON lhp.MaHP    = hp.MaHP
    JOIN CoSo cs_gv           ON gv.MaCoSo   = cs_gv.MaCoSo
    JOIN CoSo cs_lop          ON lhp.MaCoSo  = cs_lop.MaCoSo
    ${where}
    ORDER BY gv.MaGV, lhp.ThuTrongTuan, lhp.TietBD`,
    params
  );
  return rows;
}

module.exports = {
  soSVTheoCoSo,
  hocPhanDongNhat,
  dangKyCheoCoso,
  tyLeLapDay,
  soLopTheoKhoaVaCoSo,
  lichDayGiangVien,
};
