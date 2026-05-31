-- ============================================================
-- SEED DATA — SITE B: CƠ SỞ ĐÀ NẴNG (port 5434)
-- Có các lớp DEMO đặc biệt:
--   L_B_001 (SiSo=2) — test đồng thời
--   L_B_005 (chưa có GV, Thứ 2 T2-4) — demo trùng lịch GV với L_B_001
--   L_B_006 (phòng B101, Thứ 2 T2-4) — demo trùng phòng với L_B_001
-- ============================================================

-- 1. PHÒNG HỌC (6 phòng)
INSERT INTO PhongHoc (MaPhong, TenPhong, SucChua, MaCoSo) VALUES
('B101', 'Phòng máy tính B101', 45, 'B'),
('B102', 'Phòng máy tính B102', 45, 'B'),
('B103', 'Giảng đường B103',    50, 'B'),
('B104', 'Giảng đường B104',    50, 'B'),
('B105', 'Phòng thực hành B105',30, 'B'),
('B106', 'Hội trường B106',     80, 'B')
ON CONFLICT (MaPhong) DO NOTHING;

-- 2. GIẢNG VIÊN (10 GV)
INSERT INTO GiangVien (MaGV, HoTen, MaKhoa, MaCoSo) VALUES
('GV_B_001', 'Phan Văn Long',     'CNTT', 'B'),
('GV_B_002', 'Lý Thị Minh',      'KTPM', 'B'),
('GV_B_003', 'Trương Văn Nam',    'HTTT', 'B'),
('GV_B_004', 'Đinh Thị Oanh',    'MMT',  'B'),
('GV_B_005', 'Hồ Văn Phong',     'ATTT', 'B'),
('GV_B_006', 'Lưu Thị Quỳnh',    'CNTT', 'B'),
('GV_B_007', 'Mai Văn Sơn',      'CNTT', 'B'),
('GV_B_008', 'Cao Thị Sen',      'KTPM', 'B'),
('GV_B_009', 'Tạ Văn Tùng',      'HTTT', 'B'),
('GV_B_010', 'Văn Thị Uyên',     'ATTT', 'B')
ON CONFLICT (MaGV) DO NOTHING;

-- 3. SINH VIÊN (55 SV)
INSERT INTO SinhVien (MaSV, HoTen, NgaySinh, MaCoSo, MaKhoa, NienKhoa) VALUES
-- NienKhoa 2021 — CNTT
('SV_B_001', 'Phan Văn An',       '2003-04-12', 'B', 'CNTT', '2021'),
('SV_B_002', 'Phan Thị Bình',     '2003-08-25', 'B', 'CNTT', '2021'),
('SV_B_003', 'Phan Văn Cường',    '2003-02-17', 'B', 'CNTT', '2021'),
('SV_B_004', 'Phan Thị Dung',     '2003-10-03', 'B', 'CNTT', '2021'),
('SV_B_005', 'Phan Văn Đức',      '2002-12-28', 'B', 'CNTT', '2021'),
('SV_B_006', 'Phan Thị Hoa',      '2002-05-19', 'B', 'CNTT', '2021'),
('SV_B_007', 'Phan Văn Hùng',     '2003-07-08', 'B', 'CNTT', '2021'),
('SV_B_008', 'Phan Thị Lan',      '2003-09-21', 'B', 'CNTT', '2021'),
('SV_B_009', 'Phan Văn Long',     '2002-01-14', 'B', 'CNTT', '2021'),
('SV_B_010', 'Phan Thị Mai',      '2003-03-30', 'B', 'CNTT', '2021'),
('SV_B_011', 'Phan Văn Minh',     '2003-06-05', 'B', 'CNTT', '2021'),
-- NienKhoa 2022 — CNTT
('SV_B_012', 'Vũ Văn Nam',        '2004-02-16', 'B', 'CNTT', '2022'),
('SV_B_013', 'Vũ Thị Ngân',       '2004-04-27', 'B', 'CNTT', '2022'),
('SV_B_014', 'Vũ Văn Phong',      '2004-08-10', 'B', 'CNTT', '2022'),
('SV_B_015', 'Vũ Thị Phương',     '2004-11-05', 'B', 'CNTT', '2022'),
('SV_B_016', 'Vũ Văn Quân',       '2004-03-22', 'B', 'CNTT', '2022'),
('SV_B_017', 'Vũ Thị Quỳnh',      '2004-07-14', 'B', 'CNTT', '2022'),
('SV_B_018', 'Vũ Văn Sơn',        '2004-09-28', 'B', 'CNTT', '2022'),
('SV_B_019', 'Vũ Thị Thảo',       '2003-12-07', 'B', 'CNTT', '2022'),
('SV_B_020', 'Vũ Văn Thắng',      '2004-05-18', 'B', 'CNTT', '2022'),
('SV_B_021', 'Vũ Thị Thu',        '2004-01-31', 'B', 'CNTT', '2022'),
('SV_B_022', 'Vũ Văn Trung',      '2004-06-09', 'B', 'CNTT', '2022'),
-- NienKhoa 2022 — KTPM
('SV_B_023', 'Đặng Văn Tùng',     '2004-10-14', 'B', 'KTPM', '2022'),
('SV_B_024', 'Đặng Thị Uyên',     '2004-04-26', 'B', 'KTPM', '2022'),
('SV_B_025', 'Đặng Văn Việt',     '2003-12-21', 'B', 'KTPM', '2022'),
('SV_B_026', 'Đặng Thị Vân',      '2004-08-08', 'B', 'KTPM', '2022'),
('SV_B_027', 'Đặng Văn Xuân',     '2004-02-15', 'B', 'KTPM', '2022'),
('SV_B_028', 'Đặng Thị Hương',    '2003-09-03', 'B', 'KTPM', '2022'),
('SV_B_029', 'Đặng Văn Yên',      '2004-12-17', 'B', 'KTPM', '2022'),
('SV_B_030', 'Đặng Thị Yến',      '2004-07-29', 'B', 'KTPM', '2022'),
('SV_B_031', 'Đặng Văn Hải',      '2003-05-11', 'B', 'KTPM', '2022'),
('SV_B_032', 'Đặng Thị Linh',     '2004-10-23', 'B', 'KTPM', '2022'),
('SV_B_033', 'Đặng Văn Lâm',      '2004-02-04', 'B', 'KTPM', '2022'),
-- NienKhoa 2023 — ATTT
('SV_B_034', 'Bùi Văn Mạnh',      '2005-04-19', 'B', 'ATTT', '2023'),
('SV_B_035', 'Bùi Thị Nhung',     '2005-08-26', 'B', 'ATTT', '2023'),
('SV_B_036', 'Bùi Văn Khoa',      '2005-01-13', 'B', 'ATTT', '2023'),
('SV_B_037', 'Bùi Thị Ngọc',      '2005-10-07', 'B', 'ATTT', '2023'),
('SV_B_038', 'Bùi Văn Đạt',       '2005-05-22', 'B', 'ATTT', '2023'),
('SV_B_039', 'Bùi Thị Châu',      '2005-12-04', 'B', 'ATTT', '2023'),
('SV_B_040', 'Bùi Văn Hưng',      '2005-07-16', 'B', 'ATTT', '2023'),
('SV_B_041', 'Bùi Thị Diệu',      '2005-09-28', 'B', 'ATTT', '2023'),
('SV_B_042', 'Bùi Văn Tuấn',      '2005-03-10', 'B', 'ATTT', '2023'),
('SV_B_043', 'Bùi Thị Hà',        '2005-01-25', 'B', 'ATTT', '2023'),
('SV_B_044', 'Bùi Văn Tài',       '2005-06-08', 'B', 'ATTT', '2023'),
-- NienKhoa 2024 — MMT
('SV_B_045', 'Đỗ Thị Thanh',      '2006-04-20', 'B', 'MMT',  '2024'),
('SV_B_046', 'Đỗ Văn Lực',        '2006-08-15', 'B', 'MMT',  '2024'),
('SV_B_047', 'Đỗ Thị Linh',       '2006-02-03', 'B', 'MMT',  '2024'),
('SV_B_048', 'Đỗ Văn Kiên',       '2006-10-18', 'B', 'MMT',  '2024'),
('SV_B_049', 'Đỗ Thị Khánh',      '2006-05-29', 'B', 'MMT',  '2024'),
('SV_B_050', 'Đỗ Văn Đạo',        '2006-01-07', 'B', 'MMT',  '2024'),
('SV_B_051', 'Đỗ Thị Bảo',        '2006-03-24', 'B', 'MMT',  '2024'),
('SV_B_052', 'Đỗ Văn Duy',        '2006-11-11', 'B', 'MMT',  '2024'),
('SV_B_053', 'Đỗ Thị Cúc',        '2006-07-06', 'B', 'MMT',  '2024'),
('SV_B_054', 'Đỗ Văn Phúc',       '2006-09-13', 'B', 'MMT',  '2024'),
('SV_B_055', 'Đỗ Thị Trang',      '2006-12-30', 'B', 'MMT',  '2024')
ON CONFLICT (MaSV) DO NOTHING;

-- 4. LỚP HỌC PHẦN (12 lớp)
-- GV_B_001 dạy L_B_001 (Thứ 2 T1-3) và L_B_003 (Thứ 3 T1-3) — không trùng
-- L_B_005 (NULL GV, Thứ 2 T2-4) — nếu phân công GV_B_001 sẽ TRÙNG với L_B_001
-- L_B_006 (phòng B101, Thứ 2 T2-4) — TRÙNG PHÒNG với L_B_001 (B101, Thứ 2 T1-3)
INSERT INTO LopHocPhan
    (MaLop, MaHP, MaGV, MaCoSo, MaPhong, HocKy, SiSoToiDa, SoDaDangKy, ThuTrongTuan, TietBD, TietKT)
VALUES
-- LỚP DEMO SĨ SỐ THẤP — dùng để test 30 SV đồng thời
('L_B_001', 'IT001', 'GV_B_001', 'B', 'B101', '20241',  2,  0, 2, 1, 3),
-- Lớp bình thường
('L_B_002', 'IT002', 'GV_B_002', 'B', 'B102', '20241', 40, 26, 2, 4, 6),
('L_B_003', 'IT003', 'GV_B_001', 'B', 'B103', '20241', 35, 21, 3, 1, 3),
('L_B_004', 'IT004', 'GV_B_003', 'B', 'B104', '20241', 35, 15, 3, 4, 6),
-- DEMO TRÙNG LỊCH GV: chưa có GV, Thứ 2 T2-4 → trùng với L_B_001 (Thứ 2 T1-3)
-- Nếu admin phân công GV_B_001 vào đây → bị từ chối (kiểm tra cross-site qua FDW)
('L_B_005', 'IT004', NULL,        'B', 'B104', '20241', 25,  0, 2, 2, 4),
-- DEMO TRÙNG PHÒNG: B101 Thứ 2 T2-4 → trùng phòng với L_B_001 (B101 Thứ 2 T1-3)
('L_B_006', 'IT005', NULL,        'B', 'B101', '20241', 20,  0, 2, 2, 4),
-- Lớp bình thường (tiếp)
('L_B_007', 'IT006', 'GV_B_004', 'B', 'B102', '20241', 35, 13, 4, 1, 3),
('L_B_008', 'IT007', 'GV_B_005', 'B', 'B103', '20241', 35, 10, 4, 4, 6),
-- DEMO SĨ SỐ: SiSo=2, đã có 1 chỗ
('L_B_009', 'IT008', 'GV_B_006', 'B', 'B104', '20241',  2,  1, 5, 1, 3),
-- Lớp bình thường (tiếp)
('L_B_010', 'IT009', 'GV_B_007', 'B', 'B101', '20241', 35, 16, 5, 4, 6),
('L_B_011', 'IT010', 'GV_B_008', 'B', 'B102', '20241', 35, 13, 6, 1, 3),
('L_B_012', 'IT011', 'GV_B_009', 'B', 'B103', '20241', 35, 11, 6, 4, 6)
ON CONFLICT (MaLop) DO NOTHING;

-- 5. ĐĂNG KÝ HỌC PHẦN (Site B)
-- L_B_001 (SiSo=2): để trống → chạy test POST /api/test/concurrent với maLop='L_B_001'

-- L_B_002 (Thứ 2 T4-6): 25 SV_B + 1 SV_A (đăng ký chéo cơ sở)
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_B_001','L_B_002'),('SV_B_002','L_B_002'),('SV_B_003','L_B_002'),
('SV_B_004','L_B_002'),('SV_B_005','L_B_002'),('SV_B_006','L_B_002'),
('SV_B_007','L_B_002'),('SV_B_008','L_B_002'),('SV_B_009','L_B_002'),
('SV_B_010','L_B_002'),('SV_B_011','L_B_002'),('SV_B_012','L_B_002'),
('SV_B_013','L_B_002'),('SV_B_014','L_B_002'),('SV_B_015','L_B_002'),
('SV_B_016','L_B_002'),('SV_B_017','L_B_002'),('SV_B_018','L_B_002'),
('SV_B_019','L_B_002'),('SV_B_020','L_B_002'),('SV_B_021','L_B_002'),
('SV_B_022','L_B_002'),('SV_B_023','L_B_002'),('SV_B_024','L_B_002'),
('SV_B_025','L_B_002'),
-- SV cơ sở A đăng ký chéo → phục vụ Q3
('SV_A_051','L_B_002')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_B_003 (Thứ 3 T1-3): 20 SV_B + 1 SV_A
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_B_001','L_B_003'),('SV_B_002','L_B_003'),('SV_B_003','L_B_003'),
('SV_B_004','L_B_003'),('SV_B_005','L_B_003'),('SV_B_006','L_B_003'),
('SV_B_007','L_B_003'),('SV_B_008','L_B_003'),('SV_B_009','L_B_003'),
('SV_B_010','L_B_003'),('SV_B_011','L_B_003'),('SV_B_012','L_B_003'),
('SV_B_013','L_B_003'),('SV_B_014','L_B_003'),('SV_B_015','L_B_003'),
('SV_B_016','L_B_003'),('SV_B_017','L_B_003'),('SV_B_018','L_B_003'),
('SV_B_019','L_B_003'),('SV_B_020','L_B_003'),
('SV_A_052','L_B_003')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_B_004 (Thứ 3 T4-6): 15 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_B_021','L_B_004'),('SV_B_022','L_B_004'),('SV_B_023','L_B_004'),
('SV_B_024','L_B_004'),('SV_B_025','L_B_004'),('SV_B_026','L_B_004'),
('SV_B_027','L_B_004'),('SV_B_028','L_B_004'),('SV_B_029','L_B_004'),
('SV_B_030','L_B_004'),('SV_B_031','L_B_004'),('SV_B_032','L_B_004'),
('SV_B_033','L_B_004'),('SV_B_034','L_B_004'),('SV_B_035','L_B_004')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_B_005 và L_B_006: để trống (chờ phân công GV — demo Phần 13)

-- L_B_007 (Thứ 4 T1-3): 12 SV_B + 1 SV_A
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_B_001','L_B_007'),('SV_B_002','L_B_007'),('SV_B_003','L_B_007'),
('SV_B_004','L_B_007'),('SV_B_005','L_B_007'),('SV_B_006','L_B_007'),
('SV_B_007','L_B_007'),('SV_B_008','L_B_007'),('SV_B_009','L_B_007'),
('SV_B_010','L_B_007'),('SV_B_011','L_B_007'),('SV_B_012','L_B_007'),
('SV_A_053','L_B_007')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_B_008 (Thứ 4 T4-6): 10 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_B_013','L_B_008'),('SV_B_014','L_B_008'),('SV_B_015','L_B_008'),
('SV_B_016','L_B_008'),('SV_B_017','L_B_008'),('SV_B_018','L_B_008'),
('SV_B_019','L_B_008'),('SV_B_020','L_B_008'),('SV_B_021','L_B_008'),
('SV_B_022','L_B_008')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_B_009 (Thứ 5 T1-3, SiSo=2): 1 SV — còn 1 chỗ
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_B_050','L_B_009')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_B_010 (Thứ 5 T4-6): 15 SV_B + 1 SV_A
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_B_025','L_B_010'),('SV_B_026','L_B_010'),('SV_B_027','L_B_010'),
('SV_B_028','L_B_010'),('SV_B_029','L_B_010'),('SV_B_030','L_B_010'),
('SV_B_031','L_B_010'),('SV_B_032','L_B_010'),('SV_B_033','L_B_010'),
('SV_B_034','L_B_010'),('SV_B_035','L_B_010'),('SV_B_036','L_B_010'),
('SV_B_037','L_B_010'),('SV_B_038','L_B_010'),('SV_B_039','L_B_010'),
('SV_A_054','L_B_010')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_B_011 (Thứ 6 T1-3): 13 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_B_040','L_B_011'),('SV_B_041','L_B_011'),('SV_B_042','L_B_011'),
('SV_B_043','L_B_011'),('SV_B_044','L_B_011'),('SV_B_045','L_B_011'),
('SV_B_046','L_B_011'),('SV_B_047','L_B_011'),('SV_B_048','L_B_011'),
('SV_B_049','L_B_011'),('SV_B_050','L_B_011'),('SV_B_051','L_B_011'),
('SV_B_052','L_B_011')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_B_012 (Thứ 6 T4-6): 10 SV_B + 1 SV_A
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_B_001','L_B_012'),('SV_B_002','L_B_012'),('SV_B_003','L_B_012'),
('SV_B_004','L_B_012'),('SV_B_005','L_B_012'),('SV_B_006','L_B_012'),
('SV_B_007','L_B_012'),('SV_B_008','L_B_012'),('SV_B_009','L_B_012'),
('SV_B_010','L_B_012'),
('SV_A_055','L_B_012')
ON CONFLICT (MaSV, MaLop) DO NOTHING;
