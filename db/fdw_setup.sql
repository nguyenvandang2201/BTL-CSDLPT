-- ============================================================
-- CẤU HÌNH postgres_fdw — Chạy DUY NHẤT tại SITE A
-- Site A làm coordinator, kết nối sang Site B và C qua FDW
-- ============================================================

-- Bước 1: Kích hoạt extension
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- Bước 2: Khai báo foreign server
CREATE SERVER IF NOT EXISTS site_b
    FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (host 'site_b', port '5432', dbname 'campus');

CREATE SERVER IF NOT EXISTS site_c
    FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (host 'site_c', port '5432', dbname 'campus');

-- Bước 3: User mapping
CREATE USER MAPPING IF NOT EXISTS FOR postgres
    SERVER site_b
    OPTIONS (user 'postgres', password 'postgres');

CREATE USER MAPPING IF NOT EXISTS FOR postgres
    SERVER site_c
    OPTIONS (user 'postgres', password 'postgres');

-- Bước 4: Tạo schema chứa foreign tables
CREATE SCHEMA IF NOT EXISTS fdw_b;
CREATE SCHEMA IF NOT EXISTS fdw_c;

-- Bước 5: Import foreign schema (chỉ các bảng cục bộ, không import bảng chung)
IMPORT FOREIGN SCHEMA public
    LIMIT TO (SinhVien, GiangVien, PhongHoc, LopHocPhan, DangKy, NhatKyThaoTac)
    FROM SERVER site_b INTO fdw_b;

IMPORT FOREIGN SCHEMA public
    LIMIT TO (SinhVien, GiangVien, PhongHoc, LopHocPhan, DangKy, NhatKyThaoTac)
    FROM SERVER site_c INTO fdw_c;

-- ============================================================
-- VIEW GỘP — dùng trong truy vấn phân tán
-- Tạo tại Site A (coordinator) để JOIN cross-site
-- ============================================================

CREATE OR REPLACE VIEW v_DangKy_All AS
    SELECT *, 'A' AS site FROM public.DangKy
    UNION ALL
    SELECT *, 'B' AS site FROM fdw_b.DangKy
    UNION ALL
    SELECT *, 'C' AS site FROM fdw_c.DangKy;

CREATE OR REPLACE VIEW v_LopHocPhan_All AS
    SELECT *, 'A' AS site FROM public.LopHocPhan
    UNION ALL
    SELECT *, 'B' AS site FROM fdw_b.LopHocPhan
    UNION ALL
    SELECT *, 'C' AS site FROM fdw_c.LopHocPhan;

CREATE OR REPLACE VIEW v_SinhVien_All AS
    SELECT *, 'A' AS site FROM public.SinhVien
    UNION ALL
    SELECT *, 'B' AS site FROM fdw_b.SinhVien
    UNION ALL
    SELECT *, 'C' AS site FROM fdw_c.SinhVien;

CREATE OR REPLACE VIEW v_GiangVien_All AS
    SELECT *, 'A' AS site FROM public.GiangVien
    UNION ALL
    SELECT *, 'B' AS site FROM fdw_b.GiangVien
    UNION ALL
    SELECT *, 'C' AS site FROM fdw_c.GiangVien;

CREATE OR REPLACE VIEW v_PhongHoc_All AS
    SELECT *, 'A' AS site FROM public.PhongHoc
    UNION ALL
    SELECT *, 'B' AS site FROM fdw_b.PhongHoc
    UNION ALL
    SELECT *, 'C' AS site FROM fdw_c.PhongHoc;

-- ============================================================
-- KIỂM TRA KẾT NỐI
-- ============================================================

-- Chạy để xác nhận FDW hoạt động:
-- SELECT COUNT(*) FROM fdw_b.SinhVien;
-- SELECT COUNT(*) FROM fdw_c.LopHocPhan;
-- SELECT site, COUNT(*) FROM v_DangKy_All GROUP BY site;
