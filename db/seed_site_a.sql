-- ============================================================
-- SEED DATA — SITE A: CƠ SỞ HÀ NỘI (port 5433)
-- ============================================================

-- 1. PHÒNG HỌC (6 phòng)
INSERT INTO PhongHoc (MaPhong, TenPhong, SucChua, MaCoSo) VALUES
('A101', 'Phòng máy tính A101', 45, 'A'),
('A102', 'Phòng máy tính A102', 45, 'A'),
('A103', 'Giảng đường A103',    50, 'A'),
('A104', 'Giảng đường A104',    50, 'A'),
('A105', 'Phòng thực hành A105',30, 'A'),
('A106', 'Hội trường A106',     80, 'A')
ON CONFLICT (MaPhong) DO NOTHING;

-- 2. GIẢNG VIÊN (10 GV)
INSERT INTO GiangVien (MaGV, HoTen, MaKhoa, MaCoSo) VALUES
('GV_A_001', 'Nguyễn Văn An',     'CNTT', 'A'),
('GV_A_002', 'Trần Thị Bình',     'KTPM', 'A'),
('GV_A_003', 'Lê Văn Cường',      'CNTT', 'A'),
('GV_A_004', 'Phạm Thị Dung',     'HTTT', 'A'),
('GV_A_005', 'Hoàng Văn Đức',     'MMT',  'A'),
('GV_A_006', 'Ngô Thị Phương',    'KTPM', 'A'),
('GV_A_007', 'Đỗ Văn Giang',      'ATTT', 'A'),
('GV_A_008', 'Vũ Thị Hoa',        'CNTT', 'A'),
('GV_A_009', 'Bùi Văn Khánh',     'CNTT', 'A'),
('GV_A_010', 'Dương Thị Linh',    'KTPM', 'A')
ON CONFLICT (MaGV) DO NOTHING;

-- 3. SINH VIÊN (55 SV)
INSERT INTO SinhVien (MaSV, HoTen, NgaySinh, MaCoSo, MaKhoa, NienKhoa) VALUES
-- NienKhoa 2021 — CNTT
('SV_A_001', 'Nguyễn Văn An',      '2003-03-15', 'A', 'CNTT', '2021'),
('SV_A_002', 'Nguyễn Thị Bình',    '2003-07-22', 'A', 'CNTT', '2021'),
('SV_A_003', 'Nguyễn Văn Cường',   '2003-01-10', 'A', 'CNTT', '2021'),
('SV_A_004', 'Nguyễn Thị Dung',    '2003-09-05', 'A', 'CNTT', '2021'),
('SV_A_005', 'Nguyễn Văn Đức',     '2002-11-20', 'A', 'CNTT', '2021'),
('SV_A_006', 'Nguyễn Thị Hoa',     '2002-04-14', 'A', 'CNTT', '2021'),
('SV_A_007', 'Nguyễn Văn Hùng',    '2003-06-30', 'A', 'CNTT', '2021'),
('SV_A_008', 'Nguyễn Thị Lan',     '2003-08-18', 'A', 'CNTT', '2021'),
('SV_A_009', 'Nguyễn Văn Long',    '2002-12-25', 'A', 'CNTT', '2021'),
('SV_A_010', 'Nguyễn Thị Mai',     '2003-02-08', 'A', 'CNTT', '2021'),
('SV_A_011', 'Nguyễn Văn Minh',    '2003-05-17', 'A', 'CNTT', '2021'),
-- NienKhoa 2022 — CNTT
('SV_A_012', 'Trần Văn Nam',       '2004-01-12', 'A', 'CNTT', '2022'),
('SV_A_013', 'Trần Thị Ngân',      '2004-03-28', 'A', 'CNTT', '2022'),
('SV_A_014', 'Trần Văn Phong',     '2004-07-15', 'A', 'CNTT', '2022'),
('SV_A_015', 'Trần Thị Phương',    '2004-10-02', 'A', 'CNTT', '2022'),
('SV_A_016', 'Trần Văn Quân',      '2004-02-19', 'A', 'CNTT', '2022'),
('SV_A_017', 'Trần Thị Quỳnh',     '2004-06-07', 'A', 'CNTT', '2022'),
('SV_A_018', 'Trần Văn Sơn',       '2004-08-23', 'A', 'CNTT', '2022'),
('SV_A_019', 'Trần Thị Thảo',      '2003-11-11', 'A', 'CNTT', '2022'),
('SV_A_020', 'Trần Văn Thắng',     '2004-04-30', 'A', 'CNTT', '2022'),
('SV_A_021', 'Trần Thị Thu',       '2004-01-25', 'A', 'CNTT', '2022'),
('SV_A_022', 'Trần Văn Trung',     '2004-05-13', 'A', 'CNTT', '2022'),
-- NienKhoa 2022 — KTPM
('SV_A_023', 'Lê Văn Tùng',        '2004-09-08', 'A', 'KTPM', '2022'),
('SV_A_024', 'Lê Thị Uyên',        '2004-03-21', 'A', 'KTPM', '2022'),
('SV_A_025', 'Lê Văn Việt',        '2003-12-16', 'A', 'KTPM', '2022'),
('SV_A_026', 'Lê Thị Vân',         '2004-07-04', 'A', 'KTPM', '2022'),
('SV_A_027', 'Lê Văn Xuân',        '2004-02-10', 'A', 'KTPM', '2022'),
('SV_A_028', 'Lê Thị Hương',       '2003-08-27', 'A', 'KTPM', '2022'),
('SV_A_029', 'Lê Văn Yên',         '2004-11-03', 'A', 'KTPM', '2022'),
('SV_A_030', 'Lê Thị Yến',         '2004-06-18', 'A', 'KTPM', '2022'),
('SV_A_031', 'Lê Văn Hải',         '2003-04-22', 'A', 'KTPM', '2022'),
('SV_A_032', 'Lê Thị Linh',        '2004-09-14', 'A', 'KTPM', '2022'),
('SV_A_033', 'Lê Văn Lâm',         '2004-01-08', 'A', 'KTPM', '2022'),
-- NienKhoa 2023 — ATTT
('SV_A_034', 'Phạm Văn Mạnh',      '2005-03-15', 'A', 'ATTT', '2023'),
('SV_A_035', 'Phạm Thị Nhung',     '2005-07-20', 'A', 'ATTT', '2023'),
('SV_A_036', 'Phạm Văn Khoa',      '2005-01-05', 'A', 'ATTT', '2023'),
('SV_A_037', 'Phạm Thị Ngọc',      '2005-09-11', 'A', 'ATTT', '2023'),
('SV_A_038', 'Phạm Văn Đạt',       '2005-04-28', 'A', 'ATTT', '2023'),
('SV_A_039', 'Phạm Thị Châu',      '2005-11-16', 'A', 'ATTT', '2023'),
('SV_A_040', 'Phạm Văn Hưng',      '2005-06-02', 'A', 'ATTT', '2023'),
('SV_A_041', 'Phạm Thị Diệu',      '2005-08-19', 'A', 'ATTT', '2023'),
('SV_A_042', 'Phạm Văn Tuấn',      '2005-02-07', 'A', 'ATTT', '2023'),
('SV_A_043', 'Phạm Thị Hà',        '2005-12-24', 'A', 'ATTT', '2023'),
('SV_A_044', 'Phạm Văn Tài',       '2005-05-30', 'A', 'ATTT', '2023'),
-- NienKhoa 2024 — HTTT & MMT
('SV_A_045', 'Hoàng Văn Khánh',    '2006-03-16', 'A', 'HTTT', '2024'),
('SV_A_046', 'Hoàng Thị Thanh',    '2006-07-23', 'A', 'HTTT', '2024'),
('SV_A_047', 'Hoàng Văn Lực',      '2006-01-09', 'A', 'HTTT', '2024'),
('SV_A_048', 'Hoàng Thị Linh',     '2006-09-17', 'A', 'HTTT', '2024'),
('SV_A_049', 'Hoàng Văn Kiên',     '2006-04-04', 'A', 'HTTT', '2024'),
('SV_A_050', 'Hoàng Thị Phúc',     '2006-11-28', 'A', 'HTTT', '2024'),
-- NienKhoa 2024 — MMT (nhóm đăng ký chéo cơ sở → phục vụ Q3)
('SV_A_051', 'Hoàng Văn Đạo',      '2006-02-14', 'A', 'MMT',  '2024'),
('SV_A_052', 'Hoàng Thị Bảo',      '2006-06-09', 'A', 'MMT',  '2024'),
('SV_A_053', 'Hoàng Văn Duy',      '2006-10-25', 'A', 'MMT',  '2024'),
('SV_A_054', 'Hoàng Thị Cúc',      '2006-03-12', 'A', 'MMT',  '2024'),
('SV_A_055', 'Hoàng Văn Phúc',     '2006-08-07', 'A', 'MMT',  '2024')
ON CONFLICT (MaSV) DO NOTHING;

-- 4. LỚP HỌC PHẦN (12 lớp — đầy đủ lịch học)
-- Cột: MaLop, MaHP, MaGV, MaCoSo, MaPhong, HocKy, SiSoToiDa, SoDaDangKy, ThuTrongTuan, TietBD, TietKT
INSERT INTO LopHocPhan
    (MaLop, MaHP, MaGV, MaCoSo, MaPhong, HocKy, SiSoToiDa, SoDaDangKy, ThuTrongTuan, TietBD, TietKT)
VALUES
-- Học kỳ 1 — 2024-2025
('L_A_001', 'IT001', 'GV_A_001', 'A', 'A101', '20241', 35, 20, 2, 1,  3),  -- Thứ 2 T1-3
('L_A_002', 'IT002', 'GV_A_002', 'A', 'A102', '20241', 35, 18, 2, 4,  6),  -- Thứ 2 T4-6
('L_A_003', 'IT003', 'GV_A_003', 'A', 'A103', '20241', 35, 15, 3, 1,  3),  -- Thứ 3 T1-3
('L_A_004', 'IT004', 'GV_A_004', 'A', 'A104', '20241', 35, 12, 3, 4,  6),  -- Thứ 3 T4-6
('L_A_005', 'IT005', 'GV_A_005', 'A', 'A105', '20241', 35, 10, 4, 1,  3),  -- Thứ 4 T1-3
('L_A_006', 'IT006', 'GV_A_006', 'A', 'A106', '20241', 35,  8, 4, 4,  6),  -- Thứ 4 T4-6
('L_A_007', 'IT007', 'GV_A_007', 'A', 'A101', '20241', 35, 10, 5, 1,  3),  -- Thứ 5 T1-3
('L_A_008', 'IT008', 'GV_A_008', 'A', 'A102', '20241', 35,  8, 5, 4,  6),  -- Thứ 5 T4-6
('L_A_009', 'IT009', 'GV_A_009', 'A', 'A103', '20241', 35, 12, 6, 1,  3),  -- Thứ 6 T1-3
('L_A_010', 'IT010', 'GV_A_010', 'A', 'A104', '20241', 35, 15, 6, 4,  6),  -- Thứ 6 T4-6
-- LỚP DEMO SĨ SỐ THẤP (SiSoToiDa=2 — dùng test đồng thời)
('L_A_011', 'IT015', 'GV_A_001', 'A', 'A105', '20241',  2,  1, 3, 7,  9),  -- Thứ 3 T7-9
('L_A_012', 'IT020', 'GV_A_002', 'A', 'A106', '20241',  2,  0, 5, 7,  9)   -- Thứ 5 T7-9 (trống)
ON CONFLICT (MaLop) DO NOTHING;

-- 5. ĐĂNG KÝ HỌC PHẦN (Site A)
-- L_A_001 (Thứ 2 T1-3): 20 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_A_001','L_A_001'),('SV_A_002','L_A_001'),('SV_A_003','L_A_001'),
('SV_A_004','L_A_001'),('SV_A_005','L_A_001'),('SV_A_006','L_A_001'),
('SV_A_007','L_A_001'),('SV_A_008','L_A_001'),('SV_A_009','L_A_001'),
('SV_A_010','L_A_001'),('SV_A_011','L_A_001'),('SV_A_012','L_A_001'),
('SV_A_013','L_A_001'),('SV_A_014','L_A_001'),('SV_A_015','L_A_001'),
('SV_A_016','L_A_001'),('SV_A_017','L_A_001'),('SV_A_018','L_A_001'),
('SV_A_019','L_A_001'),('SV_A_020','L_A_001')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_A_002 (Thứ 2 T4-6): 18 SV — cùng ngày nhưng khác tiết, được phép
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_A_001','L_A_002'),('SV_A_002','L_A_002'),('SV_A_003','L_A_002'),
('SV_A_004','L_A_002'),('SV_A_005','L_A_002'),('SV_A_006','L_A_002'),
('SV_A_007','L_A_002'),('SV_A_008','L_A_002'),('SV_A_009','L_A_002'),
('SV_A_010','L_A_002'),('SV_A_011','L_A_002'),('SV_A_012','L_A_002'),
('SV_A_013','L_A_002'),('SV_A_014','L_A_002'),('SV_A_015','L_A_002'),
('SV_A_016','L_A_002'),('SV_A_017','L_A_002'),('SV_A_018','L_A_002')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_A_003 (Thứ 3 T1-3): 15 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_A_021','L_A_003'),('SV_A_022','L_A_003'),('SV_A_023','L_A_003'),
('SV_A_024','L_A_003'),('SV_A_025','L_A_003'),('SV_A_026','L_A_003'),
('SV_A_027','L_A_003'),('SV_A_028','L_A_003'),('SV_A_029','L_A_003'),
('SV_A_030','L_A_003'),('SV_A_031','L_A_003'),('SV_A_032','L_A_003'),
('SV_A_033','L_A_003'),('SV_A_034','L_A_003'),('SV_A_035','L_A_003')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_A_004 (Thứ 3 T4-6): 12 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_A_001','L_A_004'),('SV_A_002','L_A_004'),('SV_A_003','L_A_004'),
('SV_A_004','L_A_004'),('SV_A_005','L_A_004'),('SV_A_006','L_A_004'),
('SV_A_007','L_A_004'),('SV_A_008','L_A_004'),('SV_A_009','L_A_004'),
('SV_A_010','L_A_004'),('SV_A_011','L_A_004'),('SV_A_012','L_A_004')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_A_005 (Thứ 4 T1-3): 10 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_A_036','L_A_005'),('SV_A_037','L_A_005'),('SV_A_038','L_A_005'),
('SV_A_039','L_A_005'),('SV_A_040','L_A_005'),('SV_A_041','L_A_005'),
('SV_A_042','L_A_005'),('SV_A_043','L_A_005'),('SV_A_044','L_A_005'),
('SV_A_045','L_A_005')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_A_006 (Thứ 4 T4-6): 8 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_A_001','L_A_006'),('SV_A_002','L_A_006'),('SV_A_003','L_A_006'),
('SV_A_004','L_A_006'),('SV_A_005','L_A_006'),('SV_A_006','L_A_006'),
('SV_A_007','L_A_006'),('SV_A_008','L_A_006')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_A_007 (Thứ 5 T1-3): 10 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_A_020','L_A_007'),('SV_A_021','L_A_007'),('SV_A_022','L_A_007'),
('SV_A_023','L_A_007'),('SV_A_024','L_A_007'),('SV_A_025','L_A_007'),
('SV_A_026','L_A_007'),('SV_A_027','L_A_007'),('SV_A_028','L_A_007'),
('SV_A_029','L_A_007')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_A_008 (Thứ 5 T4-6): 8 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_A_030','L_A_008'),('SV_A_031','L_A_008'),('SV_A_032','L_A_008'),
('SV_A_033','L_A_008'),('SV_A_034','L_A_008'),('SV_A_035','L_A_008'),
('SV_A_036','L_A_008'),('SV_A_037','L_A_008')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_A_009 (Thứ 6 T1-3): 12 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_A_039','L_A_009'),('SV_A_040','L_A_009'),('SV_A_041','L_A_009'),
('SV_A_042','L_A_009'),('SV_A_043','L_A_009'),('SV_A_044','L_A_009'),
('SV_A_045','L_A_009'),('SV_A_046','L_A_009'),('SV_A_047','L_A_009'),
('SV_A_048','L_A_009'),('SV_A_049','L_A_009'),('SV_A_050','L_A_009')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_A_010 (Thứ 6 T4-6): 15 SV
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_A_001','L_A_010'),('SV_A_002','L_A_010'),('SV_A_003','L_A_010'),
('SV_A_004','L_A_010'),('SV_A_005','L_A_010'),('SV_A_006','L_A_010'),
('SV_A_007','L_A_010'),('SV_A_008','L_A_010'),('SV_A_009','L_A_010'),
('SV_A_010','L_A_010'),('SV_A_011','L_A_010'),('SV_A_012','L_A_010'),
('SV_A_013','L_A_010'),('SV_A_014','L_A_010'),('SV_A_015','L_A_010')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_A_011 (Thứ 3 T7-9, SiSoToiDa=2): 1 SV — còn 1 chỗ để demo
INSERT INTO DangKy (MaSV, MaLop) VALUES
('SV_A_049','L_A_011')
ON CONFLICT (MaSV, MaLop) DO NOTHING;

-- L_A_012 (SiSoToiDa=2): để trống → demo test đồng thời
