'use strict';
const { pools } = require('../db');
const { checkSVScheduleConflict } = require('./scheduleConflictService');

async function findSiteByLop(maLop) {
  for (const [site, pool] of Object.entries(pools)) {
    try {
      const { rows } = await pool.query(
        'SELECT MaLop FROM LopHocPhan WHERE MaLop = $1', [maLop]
      );
      if (rows.length) return { site, pool };
    } catch (_) {}
  }
  return null;
}

async function ghiNhatKy({ pool, maSV, maLop, hanhDong, ketQua, siteXuLy, ghiChu }) {
  try {
    await pool.query(
      `INSERT INTO NhatKyThaoTac(MaSV,MaLop,HanhDong,KetQua,SiteXuLy,GhiChu)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [maSV, maLop, hanhDong, ketQua, siteXuLy, ghiChu ?? null]
    );
  } catch (_) {}
}

// Đăng ký học phần — luồng đầy đủ với kiểm tra trùng lịch + SELECT FOR UPDATE
async function dangKy(maSV, maLop, useLock = true) {
  const found = await findSiteByLop(maLop);
  if (!found) return { success: false, reason: 'LOP_KHONG_TON_TAI' };

  const { pool, site } = found;

  // [1] Kiểm tra trùng lịch SV qua FDW — TRƯỚC khi mở transaction
  const conflict = await checkSVScheduleConflict(maSV, maLop);
  if (conflict.hasConflict) {
    await ghiNhatKy({
      pool, maSV, maLop, hanhDong: 'DANG_KY',
      ketQua: 'TRUNG_LICH', siteXuLy: site,
      ghiChu: `Trung lich lop ${conflict.conflictLop}`,
    });
    return { success: false, reason: 'TRUNG_LICH', detail: conflict };
  }

  // [2] Transaction tại site của lớp
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const selectSQL = useLock
      ? 'SELECT SiSoToiDa, SoDaDangKy FROM LopHocPhan WHERE MaLop=$1 FOR UPDATE'
      : 'SELECT SiSoToiDa, SoDaDangKy FROM LopHocPhan WHERE MaLop=$1';

    const { rows } = await client.query(selectSQL, [maLop]);
    if (!rows.length) {
      await client.query('ROLLBACK');
      return { success: false, reason: 'LOP_KHONG_TON_TAI' };
    }

    const { sisotoida, sodadangky } = rows[0];
    if (parseInt(sodadangky) >= parseInt(sisotoida)) {
      await client.query('ROLLBACK');
      await ghiNhatKy({ pool, maSV, maLop, hanhDong: 'DANG_KY', ketQua: 'HET_CHO', siteXuLy: site });
      return { success: false, reason: 'HET_CHO' };
    }

    // Thêm độ trễ nhân tạo để race condition rõ ràng hơn khi demo không dùng lock
    if (!useLock) await new Promise(r => setTimeout(r, 30));

    await client.query('INSERT INTO DangKy(MaSV,MaLop) VALUES($1,$2)', [maSV, maLop]);
    await client.query('UPDATE LopHocPhan SET SoDaDangKy=SoDaDangKy+1 WHERE MaLop=$1', [maLop]);
    await client.query('COMMIT');

    await ghiNhatKy({
      pool, maSV, maLop, hanhDong: 'DANG_KY',
      ketQua: 'THANH_CONG', siteXuLy: site,
      ghiChu: useLock ? 'co_khoa' : 'khong_khoa',
    });
    return { success: true, site, maSV, maLop };

  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    if (err.code === '23505') return { success: false, reason: 'DA_DANG_KY' };
    throw err;
  } finally {
    client.release();
  }
}

// Hủy đăng ký — tìm bản ghi DangKy trên tất cả site
async function huyDangKy(maDK, maSV) {
  for (const [site, pool] of Object.entries(pools)) {
    const { rows } = await pool.query(
      'SELECT MaDK, MaLop, TrangThai FROM DangKy WHERE MaDK=$1 AND MaSV=$2',
      [maDK, maSV]
    );
    if (!rows.length) continue;
    if (rows[0].trangthai === 'DaHuy') return { success: false, reason: 'DA_HUY_TRUOC' };

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("UPDATE DangKy SET TrangThai='DaHuy' WHERE MaDK=$1", [maDK]);
      await client.query(
        'UPDATE LopHocPhan SET SoDaDangKy=GREATEST(SoDaDangKy-1,0) WHERE MaLop=$1',
        [rows[0].malop]
      );
      await client.query('COMMIT');
      await ghiNhatKy({ pool, maSV, maLop: rows[0].malop, hanhDong: 'HUY_DANG_KY', ketQua: 'THANH_CONG', siteXuLy: site });
      return { success: true };
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }
  return { success: false, reason: 'KHONG_TIM_THAY' };
}

// Lấy danh sách đăng ký của SV — dùng coordinator (FDW)
async function getDangKySV(maSV, { coordinator }) {
  const { rows } = await coordinator.query(
    `SELECT dk.MaDK, dk.MaLop, dk.TrangThai, dk.ThoiGianDK,
            lhp.MaHP, hp.TenHP, hp.SoTinChi, lhp.MaCoSo, lhp.HocKy,
            lhp.ThuTrongTuan, lhp.TietBD, lhp.TietKT
     FROM v_DangKy_All dk
     JOIN v_LopHocPhan_All lhp ON dk.MaLop = lhp.MaLop
     JOIN HocPhan hp ON lhp.MaHP = hp.MaHP
     WHERE dk.MaSV = $1
     ORDER BY dk.ThoiGianDK DESC`,
    [maSV]
  );
  return rows;
}

// Demo đồng thời — reset lớp rồi gửi soLuong request cùng lúc
async function demoDongThoi(maLop, soLuong = 30, useLock = true) {
  const found = await findSiteByLop(maLop);
  if (!found) return { error: 'Lop khong ton tai' };

  await found.pool.query('UPDATE LopHocPhan SET SoDaDangKy=0 WHERE MaLop=$1', [maLop]);
  await found.pool.query('DELETE FROM DangKy WHERE MaLop=$1', [maLop]);

  const svList = Array.from({ length: soLuong }, (_, i) =>
    `DEMO_SV_${String(i + 1).padStart(3, '0')}`
  );

  const t0 = Date.now();
  const results = await Promise.allSettled(
    svList.map(maSV => dangKy(maSV, maLop, useLock))
  );
  const elapsed = Date.now() - t0;

  const stats = { thanhCong: 0, hetCho: 0, trungLich: 0, loi: 0 };
  results.forEach(r => {
    if (r.status === 'rejected')              { stats.loi++;        return; }
    if (r.value.success)                       stats.thanhCong++;
    else if (r.value.reason === 'HET_CHO')     stats.hetCho++;
    else if (r.value.reason === 'TRUNG_LICH')  stats.trungLich++;
    else                                        stats.loi++;
  });

  const { rows } = await found.pool.query(
    `SELECT SiSoToiDa, SoDaDangKy,
       (SELECT COUNT(*) FROM DangKy WHERE MaLop=$1 AND TrangThai='DangKy') AS count_actual
     FROM LopHocPhan WHERE MaLop=$1`,
    [maLop]
  );
  const db = rows[0];
  return {
    maLop, soLuong, useLock, thoiGian: `${elapsed}ms`, ketQua: stats,
    kiemTra: {
      soChoToiDa: parseInt(db.sisotoida),
      soDaDangKy: parseInt(db.sodadangky),
      soThucTe:   parseInt(db.count_actual),
      tinhTrang:  parseInt(db.count_actual) > parseInt(db.sisotoida) ? 'QUA_CHO' : 'DUNG',
    },
  };
}

module.exports = { dangKy, huyDangKy, getDangKySV, demoDongThoi };
