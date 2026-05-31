-- ============================================================
-- SEED DATA — SITE C: CƠ SỞ TP. HỒ CHÍ MINH (port 5435)
-- ============================================================

-- 1. PHÒNG HỌC (6 phòng)
INSERT INTO PhongHoc (MaPhong, TenPhong, SucChua, MaCoSo) VALUES
('C101', 'Phòng máy tính C101', 45, 'C'),
('C102', 'Phòng máy tính C102', 45, 'C'),
('C103', 'Giảng đường C103',    50, 'C'),
('C104', 'Giảng đường C104',    50, 'C'),
('C105', 'Phòng thực hành C105',30, 'C'),
('C106', 'Hội trường C106',     80, 'C')
ON CONFLICT (MaPhong) DO NOTHING;

-- 2. GIẢNG VIÊN (10 GV)
INSERT INTO GiangVien (MaGV, HoTen, MaKhoa, MaCoSo) VALUES
('GV_C_001', 'Kiều Văn Việt',     'CNTT', 'C'),
('GV_C_002', 'Đặng Thị Xanh',    'KTPM', 'C'),
('GV_C_003', 'Nguyễn Văn Yên',   'CNTT', 'C'),
('GV_C_004', 'Trần Thị Zung',    'MMT',  'C'),
('GV_C_005', 'Lê Văn Anh',       'KTPM', 'C'),
('GV_C_006', 'Phạm Thị Bảo',     'ATTT', 'C'),
('GV_C_007', 'Hoàng Văn Cát',    'CNTT', 'C'),
('GV_C_008', 'Ngô Thị Dịu',      'HTTT', 'C'),
('GV_C_009', 'Đỗ Văn Êm',        'CNTT', 'C'),
('GV_C_010', 'Vũ Thị Phúc',      'KTPM', 'C')
ON CONFLICT (MaGV) DO NOTHING;

-- 3. SINH VIÊN (55 SV)
INSERT INTO SinhVien (MaSV, HoTen, NgaySinh, MaCoSo, MaKhoa, NienKhoa) VALUES
-- NienKhoa 2021 — CNTT
('SV_C_001', 'Đinh Văn An',       '2003-05-20', 'C', 'CNTT', '2021'),
('SV_C_002', 'Đinh Thị Bình',     '2003-09-14', 'C', 'CNTT', '2021'),
('SV_C_003', 'Đinh Văn Cường',    '2003-03-08', 'C', 'CNTT', '2021'),
('SV_C_004', 'Đinh Thị Dung',     '2003-11-22', 'C', 'CNTT', '2021'),
('SV_C_005', 'Đinh Văn Đức',      '2002-01-17', 'C', 'CNTT', '2021'),
('SV_C_006', 'Đinh Thị Hoa',      '2002-06-04', 'C', 'CNTT', '2021'),
('SV_C_007', 'Đinh Văn Hùng',     '2003-08-29', 'C', 'CNTT', '2021'),
('SV_C_008', 'Đinh Thị Lan',      '2003-10-13', 'C', 'CNTT', '2021'),
('SV_C_009', 'Đinh Văn Long',     '2002-02-25', 'C', 'CNTT', '2021'),
('SV_C_010', 'Đinh Thị Mai',      '2003-04-07', 'C', 'CNTT', '2021'),
('SV_C_011', 'Đinh Văn Minh',     '2003-07-18', 'C', 'CNTT', '2021'),
-- NienKhoa 2022 — CNTT
('SV_C_012', 'Hồ Văn Nam',        '2004-01-30', 'C', 'CNTT', '2022'),
('SV_C_013', 'Hồ Thị Ngân',       '2004-05-15', 'C', 'CNTT', '2022'),
('SV_C_014', 'Hồ Văn Phong',      '2004-09-03', 'C', 'CNTT', '2022'),
('SV_C_015', 'Hồ Thị Phương',     '2004-12-18', 'C', 'CNTT', '2022'),
('SV_C_016', 'Hồ Văn Quân',       '2004-04-01', 'C', 'CNTT', '2022'),
('SV_C_017', 'Hồ Thị Quỳnh',      '2004-08-16', 'C', 'CNTT', '2022'),
('SV_C_018', 'Hồ Văn Sơn',        '2004-10-29', 'C', 'CNTT', '2022'),
('SV_C_019', 'Hồ Thị Thảo',       '2004-01-12', 'C', 'CNTT', '2022'),
('SV_C_020', 'Hồ Văn Thắng',      '2004-06-23', 'C', 'CNTT', '2022'),
('SV_C_021', 'Hồ Thị Thu',        '2004-02-08', 'C', 'CNTT', '2022'),
('SV_C_022', 'Hồ Văn Trung',      '2004-07-19', 'C', 'CNTT', '2022'),
-- NienKhoa 2022 — KTPM
('SV_C_023', 'Lưu Văn Tùng',      '2004-11-04', 'C', 'KTPM', '2022'),
('SV_C_024', 'Lưu Thị Uyên',      '2004-04-27', 'C', 'KTPM', '2022'),
('SV_C_025', 'Lưu Văn Việt',      '2003-01-10', 'C', 'KTPM', '2022'),
('SV_C_026', 'Lưu Thị Vân',       '2004-08-21', 'C', 'KTPM', '2022'),
('SV_C_027', 'Lưu Văn Xuân',      '2004-03-14', 'C', 'KTPM', '2022'),
('SV_C_028', 'Lưu Thị Hương',     '2003-10-05', 'C', 'KTPM', '2022'),
('SV_C_029', 'Lưu Văn Yên',       '2004-01-28', 'C', 'KTPM', '2022'),
('SV_C_030', 'Lưu Thị Yến',       '2004-08-09', 'C', 'KTPM', '2022'),
('SV_C_031', 'Lưu Văn Hải',       '2003-06-22', 'C', 'KTPM', '2022'),
('SV_C_032', 'Lưu Thị Linh',      '2004-11-16', 'C', 'KTPM', '2022'),
('SV_C_033', 'Lưu Văn Lâm',       '2004-03-01', 'C', 'KTPM', '2022'),
-- NienKhoa 2023 — ATTT
('SV_C_034', 'Mai Văn Mạnh',      '2005-05-08', 'C', 'ATTT', '2023'),
('SV_C_035', 'Mai Thị Nhung',     '2005-09-21', 'C', 'ATTT', '2023'),
('SV_C_036', 'Mai Văn Khoa',      '2005-02-14', 'C', 'ATTT', '2023'),
('SV_C_037', 'Mai Thị Ngọc',      '2005-10-28', 'C', 'ATTT', '2023'),
('SV_C_038', 'Mai Văn Đạt',       '2005-06-03', 'C', 'ATTT', '2023'),
('SV_C_039', 'Mai Thị Châu',      '2005-01-17', 'C', 'ATTT', '2023'),
('SV_C_040', 'Mai Văn Hưng',      '2005-08-30', 'C', 'ATTT', '2023'),
('SV_C_041', 'Mai Thị Diệu',      '2005-10-12', 'C', 'ATTT', '2023'),
('SV_C_042', 'Mai Văn Tuấn',      '2005-04-25', 'C', 'ATTT', '2023'),
('SV_C_043', 'Mai Thị Hà',        '2005-02-08', 'C', 'ATTT', '2023'),
('SV_C_044', 'Mai Văn Tài',       '2005-07-21', 'C', 'ATTT', '2023'),
-- NienKhoa 2024 — HTTT
('SV_C_045', 'Cao Văn Khánh',     '2006-05-04', 'C', 'HTTT', '2024'),
('SV_C_046', 'Cao Thị Thanh',     '2006-09-17', 'C', 'HTTT', '2024'),
('SV_C_047', 'Cao Văn Lực',       '2006-02-22', 'C', 'HTTT', '2024'),
('SV_C_048', 'Cao Thị Linh',      '2006-10-08', 'C', 'HTTT', '2024'),
('SV_C_049', 'Cao Văn Kiên',      '2006-06-19', 'C', 'HTTT', '2024'),
('SV_C_050', 'Cao Thị Phúc',      '2006-01-31', 'C', 'HTTT', '2024'),
('SV_C_051', 'Cao Văn Đạo',       '2006-04-14', 'C', 'HTTT', '2024'),
('SV_C_052', 'Cao Thị Bảo',       '2006-12-07', 'C', 'HTTT', '2024'),
('SV_C_053', 'Cao Văn Duy',       '2006-07-20', 'C', 'MMT',  '2024'),
('SV_C_054', 'Cao Thị Cúc',       '2006-03-05', 'C', 'MMT',  '2024'),
('SV_C_055', 'Cao Văn Phúc',      '2006-08-18', 'C', 'MMT',  '2024')
ON CONFLICT (MaSV) DO NOTHING;

-- 4. LỚP HỌC PHẦN (12 lớp)
-- GV_C_001 dạy L_C_001 (Thứ 2 T1-3) và L_C_011 (Thứ 3 T7-9) — không trùng
-- GV_C_002 dạy L_C_002 (Thứ 2 T4-6) và L_C_012 (Thứ 4 T7-9) — không trùng
INSERT INTO LopHocPhan
    (MaLop, MaHP, MaGV, MaCoSo, MaPhong, HocKy, SiSoToiDa, SoDaDangKy, ThuTrongTuan, TietBD, TietKT)
VALUES
('L_C_001', 'IT001', 'GV_C_001', 'C', 'C101', '20241', 35, 20, 2, 1, 3),
('L_C_002', 'IT002', 'GV_C_002', 'C', 'C102', '20241', 35, 18, 2, 4, 6),
('L_C_003', 'IT003', 'GV_C_003', 'C', 'C103', '20241', 35, 15, 3, 1, 3),
('L_C_004', 'IT005', 'GV_C_004', 'C', 'C104', '20241', 35, 12, 3, 4, 6),
('L_C_005', 'IT006', 'GV_C_005', 'C', 'C105', '20241', 35, 10, 4, 1, 3),
('L_C_006', 'IT007', 'GV_C_006', 'C', 'C106', '20241', 35,  8, 4, 4, 6),
('L_C_007', 'IT008', 'GV_C_007', 'C', 'C101', '20241', 35, 10, 5, 1, 3),
('L_C_008', 'IT009', 'GV_C_008', 'C', 'C102', '20241', 35,  8, 5, 4, 6),
('L_C_009', 'IT012', 'GV_C_009', 'C', 'C103', '20241', 35, 12, 6, 1, 3),
('L_C_010', 'IT013', 'GV_C_010', 'C', 'C104', '20241', 35, 15, 6, 4, 6),
-- LỚP DEMO SĨ SỐ THẤP
('L_C_011', 'IT015', 'GV_C_001', 'C', 'C105', '20241',  2,  1, 3, 7, 9),
('L_C_012', 'IT016', 'GV_C_002', 'C', 'C106', '20241', 35, 10, 4, 7, 9)
ON CONFLICT (MaLop) DO NOTHING;

-- 5. ĐĂNG KÝ HỌC PHẦN (Site C)

-- L_C_001 (Thứ 2 T1-3): 20 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_C_001','L_C_001'),('SV_C_002','L_C_001'),('SV_C_003','L_C_001'),
('SV_C_004','L_C_001'),('SV_C_005','L_C_001'),('SV_C_006','L_C_001'),
('SV_C_007','L_C_001'),('SV_C_008','L_C_001'),('SV_C_009','L_C_001'),
('SV_C_010','L_C_001'),('SV_C_011','L_C_001'),('SV_C_012','L_C_001'),
('SV_C_013','L_C_001'),('SV_C_014','L_C_001'),('SV_C_015','L_C_001'),
('SV_C_016','L_C_001'),('SV_C_017','L_C_001'),('SV_C_018','L_C_001'),
('SV_C_019','L_C_001'),('SV_C_020','L_C_001')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_C_002 (Thứ 2 T4-6): 18 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_C_001','L_C_002'),('SV_C_002','L_C_002'),('SV_C_003','L_C_002'),
('SV_C_004','L_C_002'),('SV_C_005','L_C_002'),('SV_C_006','L_C_002'),
('SV_C_007','L_C_002'),('SV_C_008','L_C_002'),('SV_C_009','L_C_002'),
('SV_C_010','L_C_002'),('SV_C_011','L_C_002'),('SV_C_012','L_C_002'),
('SV_C_013','L_C_002'),('SV_C_014','L_C_002'),('SV_C_015','L_C_002'),
('SV_C_016','L_C_002'),('SV_C_017','L_C_002'),('SV_C_018','L_C_002')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_C_003 (Thứ 3 T1-3): 15 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_C_021','L_C_003'),('SV_C_022','L_C_003'),('SV_C_023','L_C_003'),
('SV_C_024','L_C_003'),('SV_C_025','L_C_003'),('SV_C_026','L_C_003'),
('SV_C_027','L_C_003'),('SV_C_028','L_C_003'),('SV_C_029','L_C_003'),
('SV_C_030','L_C_003'),('SV_C_031','L_C_003'),('SV_C_032','L_C_003'),
('SV_C_033','L_C_003'),('SV_C_034','L_C_003'),('SV_C_035','L_C_003')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_C_004 (Thứ 3 T4-6): 12 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_C_001','L_C_004'),('SV_C_002','L_C_004'),('SV_C_003','L_C_004'),
('SV_C_004','L_C_004'),('SV_C_005','L_C_004'),('SV_C_006','L_C_004'),
('SV_C_007','L_C_004'),('SV_C_008','L_C_004'),('SV_C_009','L_C_004'),
('SV_C_010','L_C_004'),('SV_C_011','L_C_004'),('SV_C_012','L_C_004')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_C_005 (Thứ 4 T1-3): 10 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_C_036','L_C_005'),('SV_C_037','L_C_005'),('SV_C_038','L_C_005'),
('SV_C_039','L_C_005'),('SV_C_040','L_C_005'),('SV_C_041','L_C_005'),
('SV_C_042','L_C_005'),('SV_C_043','L_C_005'),('SV_C_044','L_C_005'),
('SV_C_045','L_C_005')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_C_006 (Thứ 4 T4-6): 8 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_C_001','L_C_006'),('SV_C_002','L_C_006'),('SV_C_003','L_C_006'),
('SV_C_004','L_C_006'),('SV_C_005','L_C_006'),('SV_C_006','L_C_006'),
('SV_C_007','L_C_006'),('SV_C_008','L_C_006')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_C_007 (Thứ 5 T1-3): 10 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_C_020','L_C_007'),('SV_C_021','L_C_007'),('SV_C_022','L_C_007'),
('SV_C_023','L_C_007'),('SV_C_024','L_C_007'),('SV_C_025','L_C_007'),
('SV_C_026','L_C_007'),('SV_C_027','L_C_007'),('SV_C_028','L_C_007'),
('SV_C_029','L_C_007')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_C_008 (Thứ 5 T4-6): 8 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_C_030','L_C_008'),('SV_C_031','L_C_008'),('SV_C_032','L_C_008'),
('SV_C_033','L_C_008'),('SV_C_034','L_C_008'),('SV_C_035','L_C_008'),
('SV_C_036','L_C_008'),('SV_C_037','L_C_008')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_C_009 (Thứ 6 T1-3): 12 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_C_039','L_C_009'),('SV_C_040','L_C_009'),('SV_C_041','L_C_009'),
('SV_C_042','L_C_009'),('SV_C_043','L_C_009'),('SV_C_044','L_C_009'),
('SV_C_045','L_C_009'),('SV_C_046','L_C_009'),('SV_C_047','L_C_009'),
('SV_C_048','L_C_009'),('SV_C_049','L_C_009'),('SV_C_050','L_C_009')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_C_010 (Thứ 6 T4-6): 15 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_C_001','L_C_010'),('SV_C_002','L_C_010'),('SV_C_003','L_C_010'),
('SV_C_004','L_C_010'),('SV_C_005','L_C_010'),('SV_C_006','L_C_010'),
('SV_C_007','L_C_010'),('SV_C_008','L_C_010'),('SV_C_009','L_C_010'),
('SV_C_010','L_C_010'),('SV_C_011','L_C_010'),('SV_C_012','L_C_010'),
('SV_C_013','L_C_010'),('SV_C_014','L_C_010'),('SV_C_015','L_C_010')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_C_011 (Thứ 3 T7-9, SiSo=2): 1 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_C_049','L_C_011')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_C_012 (Thứ 4 T7-9): 10 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_C_001','L_C_012'),('SV_C_002','L_C_012'),('SV_C_003','L_C_012'),
('SV_C_004','L_C_012'),('SV_C_005','L_C_012'),('SV_C_006','L_C_012'),
('SV_C_007','L_C_012'),('SV_C_008','L_C_012'),('SV_C_009','L_C_012'),
('SV_C_010','L_C_012')
ON CONFLICT (MaSV, MaLop) DO NOTHING;
