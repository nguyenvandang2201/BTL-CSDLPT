'use strict';
const { coordinator, pools } = require('../db');
const { getLopSchedule, checkGVConflict, checkPhongConflict } = require('./scheduleConflictService');

// Phân công GV vào lớp — kiểm tra trùng lịch GV toàn trường qua FDW
async function phanCongGV(maLop, maGV) {
  const lop = await getLopSchedule(maLop);
  if (!lop) return { success: false, reason: 'LOP_KHONG_TON_TAI' };

  if (lop.thutrongtuan) {
    const gvConflict = await checkGVConflict(
      maGV, lop.hocky, lop.thutrongtuan, lop.tietbd, lop.tietkt, maLop
    );
    if (gvConflict.hasConflict) {
      return {
        success: false,
        reason: 'TRUNG_LICH_GV',
        detail: {
          maGV,
          conflictLop: gvConflict.conflictLop,
          coSo: gvConflict.coSo,
          message: `GV dang day lop ${gvConflict.conflictLop} tai co so ${gvConflict.coSo}`,
        },
      };
    }
  }

  for (const [site, pool] of Object.entries(pools)) {
    try {
      const { rowCount } = await pool.query(
        'UPDATE LopHocPhan SET MaGV=$1 WHERE MaLop=$2', [maGV, maLop]
      );
      if (rowCount > 0) {
        await pool.query(
          `INSERT INTO NhatKyThaoTac(MaLop,HanhDong,KetQua,SiteXuLy,GhiChu)
           VALUES($1,'PHAN_CONG_GV','THANH_CONG',$2,$3)`,
          [maLop, site, `Phan cong ${maGV}`]
        );
        return { success: true, maLop, maGV, site };
      }
    } catch (_) {}
  }
  return { success: false, reason: 'KHONG_TIM_THAY_LOP' };
}

// Tạo lớp học phần mới — kiểm tra xung đột phòng + GV trước khi INSERT
async function taoLopHocPhan({ maLop, maHP, maGV, maCoSo, maPhong,
                                hocKy, siSoToiDa, thuTrongTuan, tietBD, tietKT }) {
  if (maPhong && thuTrongTuan) {
    const phongConflict = await checkPhongConflict(maPhong, hocKy, thuTrongTuan, tietBD, tietKT);
    if (phongConflict.hasConflict)
      return { success: false, reason: 'TRUNG_LICH_PHONG', detail: phongConflict };
  }
  if (maGV && thuTrongTuan) {
    const gvConflict = await checkGVConflict(maGV, hocKy, thuTrongTuan, tietBD, tietKT);
    if (gvConflict.hasConflict)
      return { success: false, reason: 'TRUNG_LICH_GV', detail: gvConflict };
  }

  const pool = pools[maCoSo];
  if (!pool) return { success: false, reason: 'CO_SO_KHONG_HOP_LE' };

  await pool.query(
    `INSERT INTO LopHocPhan
       (MaLop,MaHP,MaGV,MaCoSo,MaPhong,HocKy,SiSoToiDa,ThuTrongTuan,TietBD,TietKT)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [maLop, maHP, maGV ?? null, maCoSo, maPhong ?? null,
     hocKy, siSoToiDa, thuTrongTuan ?? null, tietBD ?? null, tietKT ?? null]
  );
  return { success: true, maLop, site: maCoSo };
}

// Lấy lịch dạy của GV — toàn trường qua FDW
async function getLichDayGV(maGV, hocKy = null) {
  const params = [maGV];
  const hkCond = hocKy ? `AND lhp.HocKy=$${params.push(hocKy)}` : '';
  const { rows } = await coordinator.query(`
    SELECT lhp.MaLop, hp.TenHP, lhp.MaCoSo, lhp.HocKy,
           lhp.ThuTrongTuan, lhp.TietBD, lhp.TietKT,
           lhp.SiSoToiDa, lhp.SoDaDangKy, lhp.MaPhong
    FROM v_LopHocPhan_All lhp
    JOIN HocPhan hp ON lhp.MaHP = hp.MaHP
    WHERE lhp.MaGV = $1 ${hkCond}
    ORDER BY lhp.HocKy, lhp.ThuTrongTuan, lhp.TietBD`,
    params
  );
  return rows;
}

// Thống kê tải giảng dạy toàn trường trong 1 học kỳ
async function thongKeTaiGiangDay(hocKy) {
  const { rows } = await coordinator.query(`
    SELECT gv.MaGV, gv.HoTen, gv.MaCoSo, cs.TenCoSo,
           COUNT(lhp.MaLop)                    AS SoLop,
           SUM(lhp.TietKT - lhp.TietBD + 1)   AS TongSoTiet,
           SUM(lhp.SoDaDangKy)                 AS TongSVPhuTrach
    FROM v_LopHocPhan_All lhp
    JOIN v_GiangVien_All gv ON lhp.MaGV   = gv.MaGV
    JOIN CoSo cs             ON gv.MaCoSo  = cs.MaCoSo
    WHERE lhp.HocKy = $1
      AND lhp.ThuTrongTuan IS NOT NULL
    GROUP BY gv.MaGV, gv.HoTen, gv.MaCoSo, cs.TenCoSo
    ORDER BY TongSoTiet DESC`,
    [hocKy]
  );
  return rows;
}

module.exports = { phanCongGV, taoLopHocPhan, getLichDayGV, thongKeTaiGiangDay };
