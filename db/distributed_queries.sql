-- ============================================================
-- 6 TRUY VẤN PHÂN TÁN — Chạy tại Site A (coordinator)
-- Yêu cầu fdw_setup.sql đã được thực thi
-- ============================================================

-- ============================================================
-- Q1: Số sinh viên đăng ký theo từng cơ sở
--     Nguồn: DangKy + LopHocPhan từ 3 site
-- ============================================================
SELECT
    lhp.MaCoSo,
    cs.TenCoSo,
    COUNT(dk.MaDK)   AS SoLuotDangKy,
    COUNT(DISTINCT dk.MaSV) AS SoSVDangKy
FROM v_DangKy_All dk
JOIN v_LopHocPhan_All lhp ON dk.MaLop = lhp.MaLop
JOIN CoSo cs ON lhp.MaCoSo = cs.MaCoSo
WHERE dk.TrangThai = 'DangKy'
GROUP BY lhp.MaCoSo, cs.TenCoSo
ORDER BY SoLuotDangKy DESC;

-- ============================================================
-- Q2: Top 5 học phần đông đăng ký nhất toàn trường
--     Nguồn: DangKy + LopHocPhan + HocPhan (3 site)
-- ============================================================
SELECT
    hp.MaHP,
    hp.TenHP,
    hp.SoTinChi,
    k.TenKhoa,
    COUNT(dk.MaDK) AS TongDangKy
FROM v_DangKy_All dk
JOIN v_LopHocPhan_All lhp ON dk.MaLop = lhp.MaLop
JOIN HocPhan hp ON lhp.MaHP = hp.MaHP
JOIN Khoa k ON hp.MaKhoa = k.MaKhoa
WHERE dk.TrangThai = 'DangKy'
GROUP BY hp.MaHP, hp.TenHP, hp.SoTinChi, k.TenKhoa
ORDER BY TongDangKy DESC
LIMIT 5;

-- ============================================================
-- Q3: Sinh viên đăng ký chéo cơ sở
--     (SV của cơ sở này đăng ký lớp ở cơ sở khác)
--     Nguồn: DangKy + LopHocPhan + SinhVien (cross-site)
-- ============================================================
SELECT
    sv.MaSV,
    sv.HoTen          AS TenSV,
    sv.MaCoSo          AS CoSoNha,
    cs_nha.TenCoSo     AS TenCoSoNha,
    lhp.MaCoSo         AS CoSoLop,
    cs_lop.TenCoSo     AS TenCoSoLop,
    hp.TenHP,
    lhp.MaLop,
    lhp.HocKy
FROM v_DangKy_All dk
JOIN v_LopHocPhan_All lhp  ON dk.MaLop   = lhp.MaLop
JOIN v_SinhVien_All sv     ON dk.MaSV    = sv.MaSV
JOIN HocPhan hp            ON lhp.MaHP   = hp.MaHP
JOIN CoSo cs_nha           ON sv.MaCoSo  = cs_nha.MaCoSo
JOIN CoSo cs_lop           ON lhp.MaCoSo = cs_lop.MaCoSo
WHERE dk.TrangThai = 'DangKy'
  AND sv.MaCoSo <> lhp.MaCoSo
ORDER BY sv.MaCoSo, sv.MaSV;

-- ============================================================
-- Q4: Tỷ lệ lấp đầy các lớp học phần toàn hệ thống
--     Nguồn: LopHocPhan từ 3 site
-- ============================================================
SELECT
    lhp.site         AS Site,
    lhp.MaLop,
    hp.TenHP,
    lhp.MaCoSo,
    cs.TenCoSo,
    lhp.HocKy,
    lhp.SoDaDangKy   AS DaDangKy,
    lhp.SiSoToiDa    AS SiSoToiDa,
    ROUND(lhp.SoDaDangKy * 100.0 / NULLIF(lhp.SiSoToiDa, 0), 1) AS TyLePct,
    CASE
        WHEN lhp.SoDaDangKy >= lhp.SiSoToiDa THEN 'Đầy'
        WHEN lhp.SoDaDangKy * 1.0 / NULLIF(lhp.SiSoToiDa, 0) >= 0.8 THEN 'Gần đầy'
        ELSE 'Còn chỗ'
    END AS TrangThai
FROM v_LopHocPhan_All lhp
JOIN HocPhan hp ON lhp.MaHP = hp.MaHP
JOIN CoSo cs    ON lhp.MaCoSo = cs.MaCoSo
ORDER BY TyLePct DESC;

-- ============================================================
-- Q5: Số lớp mở theo khoa và theo cơ sở
--     Nguồn: LopHocPhan + HocPhan + Khoa (3 site)
-- ============================================================
SELECT
    k.TenKhoa,
    lhp.MaCoSo,
    cs.TenCoSo,
    COUNT(*)                          AS SoLop,
    SUM(lhp.SiSoToiDa)               AS TongSiSo,
    SUM(lhp.SoDaDangKy)              AS TongDaDangKy,
    ROUND(
        SUM(lhp.SoDaDangKy) * 100.0 / NULLIF(SUM(lhp.SiSoToiDa), 0),
    1)                                AS TyLeTBPct
FROM v_LopHocPhan_All lhp
JOIN HocPhan hp ON lhp.MaHP   = hp.MaHP
JOIN Khoa k     ON hp.MaKhoa  = k.MaKhoa
JOIN CoSo cs    ON lhp.MaCoSo = cs.MaCoSo
GROUP BY k.TenKhoa, lhp.MaCoSo, cs.TenCoSo
ORDER BY k.TenKhoa, lhp.MaCoSo;

-- ============================================================
-- Q6: Lịch dạy giảng viên toàn trường (MỚI — v2)
--     Nguồn: LopHocPhan + GiangVien từ 3 site
-- ============================================================
SELECT
    gv.MaGV,
    gv.HoTen          AS TenGV,
    gv.MaCoSo          AS CoSoGV,
    cs_gv.TenCoSo      AS TenCoSoGV,
    lhp.MaLop,
    hp.TenHP,
    lhp.MaCoSo         AS CoSoLop,
    cs_lop.TenCoSo     AS TenCoSoLop,
    lhp.HocKy,
    lhp.ThuTrongTuan,
    lhp.TietBD,
    lhp.TietKT,
    (lhp.TietKT - lhp.TietBD + 1) AS SoTiet,
    lhp.SiSoToiDa,
    lhp.SoDaDangKy
FROM v_LopHocPhan_All lhp
JOIN v_GiangVien_All gv ON lhp.MaGV   = gv.MaGV
JOIN HocPhan hp          ON lhp.MaHP   = hp.MaHP
JOIN CoSo cs_gv          ON gv.MaCoSo  = cs_gv.MaCoSo
JOIN CoSo cs_lop         ON lhp.MaCoSo = cs_lop.MaCoSo
WHERE lhp.ThuTrongTuan IS NOT NULL
ORDER BY gv.MaGV, lhp.ThuTrongTuan, lhp.TietBD;

-- ============================================================
-- DEMO: Kiểm tra GV trùng lịch toàn trường (Phần 13)
-- Kết quả trống = hệ thống hoạt động đúng
-- ============================================================
SELECT
    a.MaGV,
    gv.HoTen,
    a.MaLop AS LopA, a.MaCoSo AS CoSoA,
    b.MaLop AS LopB, b.MaCoSo AS CoSoB,
    a.ThuTrongTuan,
    a.TietBD AS TietBD_A, a.TietKT AS TietKT_A,
    b.TietBD AS TietBD_B, b.TietKT AS TietKT_B
FROM v_LopHocPhan_All a
JOIN v_LopHocPhan_All b
    ON  a.MaGV = b.MaGV
    AND a.HocKy = b.HocKy
    AND a.ThuTrongTuan = b.ThuTrongTuan
    AND a.TietBD <= b.TietKT
    AND a.TietKT >= b.TietBD
    AND a.MaLop < b.MaLop
JOIN v_GiangVien_All gv ON a.MaGV = gv.MaGV
WHERE a.MaGV IS NOT NULL
ORDER BY a.MaGV, a.ThuTrongTuan;

-- ============================================================
-- DEMO: Cặp lớp trùng phòng (Phần 12)
-- Chỉ kiểm tra cục bộ từng site
-- ============================================================
SELECT
    a.MaLop AS LopA, b.MaLop AS LopB,
    a.MaPhong,
    a.ThuTrongTuan,
    a.TietBD AS BD_A, a.TietKT AS KT_A,
    b.TietBD AS BD_B, b.TietKT AS KT_B
FROM LopHocPhan a
JOIN LopHocPhan b
    ON  a.MaPhong = b.MaPhong
    AND a.HocKy = b.HocKy
    AND a.ThuTrongTuan = b.ThuTrongTuan
    AND a.TietBD <= b.TietKT
    AND a.TietKT >= b.TietBD
    AND a.MaLop < b.MaLop
WHERE a.MaPhong IS NOT NULL;

-- ============================================================
-- DEMO: Thống kê tải giảng dạy học kỳ 20241
-- ============================================================
SELECT
    gv.HoTen,
    gv.MaCoSo,
    cs.TenCoSo,
    COUNT(lhp.MaLop)                  AS SoLop,
    SUM(lhp.TietKT - lhp.TietBD + 1) AS TongSoTiet,
    SUM(lhp.SoDaDangKy)               AS TongSVPhuTrach
FROM v_LopHocPhan_All lhp
JOIN v_GiangVien_All gv ON lhp.MaGV   = gv.MaGV
JOIN CoSo cs             ON gv.MaCoSo  = cs.MaCoSo
WHERE lhp.HocKy = '20241'
  AND lhp.ThuTrongTuan IS NOT NULL
GROUP BY gv.MaGV, gv.HoTen, gv.MaCoSo, cs.TenCoSo
ORDER BY TongSoTiet DESC;
