-- ============================================================
-- LƯỢC ĐỒ TOÀN CỤC — Hệ thống đăng ký học phần đa cơ sở
-- Chạy trên CẢ 3 SITE trước khi seed dữ liệu
-- ============================================================

-- ============================================================
-- BẢNG DÙNG CHUNG (nhân bản lên cả 3 site)
-- ============================================================
CREATE TABLE IF NOT EXISTS CoSo (
    MaCoSo   CHAR(1)      PRIMARY KEY,
    TenCoSo  VARCHAR(100) NOT NULL,
    DiaChi   VARCHAR(200),
    ThanhPho VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS Khoa (
    MaKhoa  VARCHAR(10)  PRIMARY KEY,
    TenKhoa VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS ChuongTrinhDaoTao (
    MaCTDT  VARCHAR(10)  PRIMARY KEY,
    TenCT   VARCHAR(150) NOT NULL,
    MaKhoa  VARCHAR(10)  REFERENCES Khoa(MaKhoa)
);

CREATE TABLE IF NOT EXISTS HocPhan (
    MaHP      VARCHAR(10)  PRIMARY KEY,
    TenHP     VARCHAR(150) NOT NULL,
    SoTinChi  SMALLINT     NOT NULL CHECK (SoTinChi BETWEEN 1 AND 10),
    MaKhoa    VARCHAR(10)  REFERENCES Khoa(MaKhoa)
);

-- ============================================================
-- BẢNG CỤC BỘ (mỗi site chỉ chứa dữ liệu CỦA cơ sở mình)
-- ============================================================
CREATE TABLE IF NOT EXISTS SinhVien (
    MaSV     VARCHAR(12)  PRIMARY KEY,
    HoTen    VARCHAR(100) NOT NULL,
    NgaySinh DATE,
    MaCoSo   CHAR(1)      NOT NULL REFERENCES CoSo(MaCoSo),
    MaKhoa   VARCHAR(10)  REFERENCES Khoa(MaKhoa),
    NienKhoa CHAR(4)
);

CREATE TABLE IF NOT EXISTS GiangVien (
    MaGV   VARCHAR(10)  PRIMARY KEY,
    HoTen  VARCHAR(100) NOT NULL,
    MaKhoa VARCHAR(10)  REFERENCES Khoa(MaKhoa),
    MaCoSo CHAR(1)      NOT NULL REFERENCES CoSo(MaCoSo)
);

CREATE TABLE IF NOT EXISTS PhongHoc (
    MaPhong  VARCHAR(10)  PRIMARY KEY,
    TenPhong VARCHAR(50)  NOT NULL,
    SucChua  SMALLINT     NOT NULL,
    MaCoSo   CHAR(1)      NOT NULL REFERENCES CoSo(MaCoSo)
);

CREATE TABLE IF NOT EXISTS LopHocPhan (
    MaLop        VARCHAR(15)  PRIMARY KEY,
    MaHP         VARCHAR(10)  NOT NULL REFERENCES HocPhan(MaHP),
    MaGV         VARCHAR(10)  REFERENCES GiangVien(MaGV),
    MaCoSo       CHAR(1)      NOT NULL REFERENCES CoSo(MaCoSo),
    MaPhong      VARCHAR(10)  REFERENCES PhongHoc(MaPhong),
    HocKy        VARCHAR(10)  NOT NULL,
    SiSoToiDa    SMALLINT     NOT NULL,
    SoDaDangKy   SMALLINT     NOT NULL DEFAULT 0,

    -- Thông tin lịch học: ThuTrongTuan 2=Thứ 2 ... 7=Thứ 7
    ThuTrongTuan SMALLINT     CHECK (ThuTrongTuan BETWEEN 2 AND 7),
    TietBD       SMALLINT     CHECK (TietBD BETWEEN 1 AND 15),
    TietKT       SMALLINT     CHECK (TietKT BETWEEN 1 AND 15),

    CONSTRAINT chk_siso CHECK (SoDaDangKy <= SiSoToiDa),
    CONSTRAINT chk_tiet CHECK (
        TietKT IS NULL OR TietBD IS NULL OR TietKT >= TietBD
    )
);

CREATE TABLE IF NOT EXISTS DangKy (
    MaDK       SERIAL       PRIMARY KEY,
    MaSV       VARCHAR(12)  NOT NULL,
    MaLop      VARCHAR(15)  NOT NULL REFERENCES LopHocPhan(MaLop),
    ThoiGianDK TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    TrangThai  VARCHAR(10)  NOT NULL DEFAULT 'DangKy'
                            CHECK (TrangThai IN ('DangKy', 'DaHuy')),
    CONSTRAINT uq_sv_lop UNIQUE (MaSV, MaLop)
);

CREATE TABLE IF NOT EXISTS NhatKyThaoTac (
    MaLog    SERIAL       PRIMARY KEY,
    MaSV     VARCHAR(12),
    MaLop    VARCHAR(15),
    HanhDong VARCHAR(20)  NOT NULL,
    KetQua   VARCHAR(20)  NOT NULL,
    ThoiGian TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    SiteXuLy CHAR(1)      NOT NULL,
    GhiChu   TEXT
);

-- ============================================================
-- INDEX
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_dk_malop     ON DangKy(MaLop);
CREATE INDEX IF NOT EXISTS idx_dk_masv      ON DangKy(MaSV);
CREATE INDEX IF NOT EXISTS idx_lhp_mahp     ON LopHocPhan(MaHP);
CREATE INDEX IF NOT EXISTS idx_lhp_macoso   ON LopHocPhan(MaCoSo);
CREATE INDEX IF NOT EXISTS idx_sv_macoso    ON SinhVien(MaCoSo);

-- Index hỗ trợ kiểm tra trùng lịch (Phần 12 & 13)
CREATE INDEX IF NOT EXISTS idx_lhp_lich     ON LopHocPhan(HocKy, ThuTrongTuan, TietBD, TietKT);
CREATE INDEX IF NOT EXISTS idx_lhp_gv_hocky ON LopHocPhan(MaGV, HocKy);
CREATE INDEX IF NOT EXISTS idx_lhp_phong    ON LopHocPhan(MaPhong, HocKy, ThuTrongTuan);
