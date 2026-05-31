-- ============================================================
-- DỮ LIỆU DÙNG CHUNG — Chạy trên CẢ 3 SITE
-- CoSo, Khoa, ChuongTrinhDaoTao, HocPhan
-- ============================================================

-- 1. CƠ SỞ ĐÀO TẠO
INSERT INTO CoSo (MaCoSo, TenCoSo, DiaChi, ThanhPho) VALUES
('A', 'Cơ sở Hà Nội',       '144 Xuân Thủy, Cầu Giấy',          'Hà Nội'),
('B', 'Cơ sở Đà Nẵng',      '101 Nguyễn Lương Bằng, Liên Chiểu', 'Đà Nẵng'),
('C', 'Cơ sở TP. Hồ Chí Minh', '11 Nguyễn Đình Chiểu, Phú Nhuận', 'TP. Hồ Chí Minh')
ON CONFLICT (MaCoSo) DO NOTHING;

-- 2. KHOA
INSERT INTO Khoa (MaKhoa, TenKhoa) VALUES
('CNTT', 'Công nghệ thông tin'),
('KTPM', 'Kỹ thuật phần mềm'),
('ATTT', 'An toàn thông tin'),
('HTTT', 'Hệ thống thông tin'),
('MMT',  'Mạng máy tính')
ON CONFLICT (MaKhoa) DO NOTHING;

-- 3. CHƯƠNG TRÌNH ĐÀO TẠO
INSERT INTO ChuongTrinhDaoTao (MaCTDT, TenCT, MaKhoa) VALUES
('CT001', 'Kỹ sư Công nghệ thông tin',  'CNTT'),
('CT002', 'Kỹ sư Kỹ thuật phần mềm',   'KTPM'),
('CT003', 'Kỹ sư An toàn thông tin',    'ATTT'),
('CT004', 'Kỹ sư Hệ thống thông tin',   'HTTT'),
('CT005', 'Kỹ sư Mạng máy tính',        'MMT')
ON CONFLICT (MaCTDT) DO NOTHING;

-- 4. HỌC PHẦN (20 môn — nhân bản cả 3 site)
INSERT INTO HocPhan (MaHP, TenHP, SoTinChi, MaKhoa) VALUES
('IT001', 'Lập trình cơ bản',                  3, 'CNTT'),
('IT002', 'Cấu trúc dữ liệu và giải thuật',    3, 'CNTT'),
('IT003', 'Cơ sở dữ liệu',                     3, 'CNTT'),
('IT004', 'Hệ điều hành',                       3, 'CNTT'),
('IT005', 'Mạng máy tính',                      3, 'MMT'),
('IT006', 'Lập trình hướng đối tượng',          3, 'KTPM'),
('IT007', 'Phát triển ứng dụng web',            3, 'KTPM'),
('IT008', 'Bảo mật thông tin',                  3, 'ATTT'),
('IT009', 'Trí tuệ nhân tạo',                   3, 'CNTT'),
('IT010', 'Lập trình di động',                  3, 'KTPM'),
('IT011', 'Phân tích và thiết kế hệ thống',    3, 'HTTT'),
('IT012', 'Quản trị cơ sở dữ liệu',            3, 'CNTT'),
('IT013', 'Kiểm thử phần mềm',                  3, 'KTPM'),
('IT014', 'Điện toán đám mây',                  3, 'MMT'),
('IT015', 'Máy học',                             3, 'CNTT'),
('IT016', 'Kiến trúc phần mềm',                 3, 'KTPM'),
('IT017', 'An toàn mạng',                        3, 'ATTT'),
('IT018', 'Khai phá dữ liệu',                   3, 'HTTT'),
('IT019', 'Lập trình nhúng',                     2, 'MMT'),
('IT020', 'Cơ sở dữ liệu phân tán',            3, 'CNTT')
ON CONFLICT (MaHP) DO NOTHING;
