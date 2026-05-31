# KẾ HOẠCH THỰC HIỆN BÀI TẬP LỚN — BẢN ĐẦY ĐỦ v2
## Môn: Cơ sở dữ liệu phân tán
## Đề tài 3 — Hệ thống đăng ký học phần nhiều cơ sở (multi-campus)

---

## MỤC LỤC

- **Phần 1**  — Chọn kiến trúc & công nghệ
- **Phần 2**  — Thiết kế lược đồ toàn cục + `schema.sql` *(cập nhật: thêm cột lịch học)*
- **Phần 3**  — Phân mảnh & cấp phát dữ liệu
- **Phần 4**  — Sao chép dữ liệu (Replication) & lý do
- **Phần 5**  — Xử lý đăng ký đồng thời *(cập nhật: thêm kiểm tra trùng lịch)*
- **Phần 6**  — Truy vấn phân tán (≥ 5) + cấu hình FDW *(cập nhật: thêm Q6 lịch GV)*
- **Phần 7**  — Yêu cầu nâng cao
- **Phần 8**  — Frontend *(cập nhật: thêm màn hình lịch học & phân công)*
- **Phần 9**  — Dữ liệu mẫu & nhật ký *(cập nhật: thêm seed lịch học)*
- **Phần 10** — Docker, triển khai & Git repo
- **Phần 11** — Đánh giá hiệu năng (điểm cộng)
- **Phần 12** — Xử lý trùng lịch *(MỚI)*
- **Phần 13** — Phân lịch dạy Giảng viên *(MỚI)*

---

# PHẦN 1 — CHỌN KIẾN TRÚC & CÔNG NGHỆ

## 1.1. Kiến trúc đề xuất

Chạy **3 instance PostgreSQL độc lập** bằng Docker (mỗi instance = 1 cơ sở đào tạo). Dùng **`postgres_fdw`** để site này truy vấn bảng của site kia bằng SQL thật.

```
                    ┌─────────────────────────┐
                    │   Frontend (Web UI)     │  ← giao diện đăng ký trực quan
                    │   HTML/JS hoặc React    │
                    └───────────┬─────────────┘
                                │ REST API
                    ┌───────────▼──────────────┐
                    │   Backend / Coordinator  │  ← định tuyến truy vấn,
                    │   Node.js Express + pg   │     điều phối transaction,
                    └───┬──────────┬───────────┘     ghi nhật ký
            ┌───────────┘          │─────────────────┐
   ┌────────▼────────┐  ┌──────────▼──────┐      ┌───▼─────────────┐
   │ Site A (Cơ sở 1)│  │ Site B (Cơ sở 2)│      │ Site C (Cơ sở 3)│
   │ PostgreSQL :5433│  │ PostgreSQL :5434│      │ PostgreSQL :5435│
   └─────────────────┘  └─────────────────┘      └─────────────────┘
      ▲   postgres_fdw liên kết 3 site (truy vấn phân tán thật)  ▲
      └──────────────────────────────────────────────────────────┘
```

Mỗi site chứa:

```
Site A (port 5433)        Site B (port 5434)        Site C (port 5435)
─────────────────────     ─────────────────────     ─────────────────────
SinhVien_A                SinhVien_B                SinhVien_C
GiangVien_A               GiangVien_B               GiangVien_C
LopHocPhan_A              LopHocPhan_B              LopHocPhan_C
  (có cột lịch học)         (có cột lịch học)         (có cột lịch học)
DangKy_A                  DangKy_B                  DangKy_C
PhongHoc_A                PhongHoc_B                PhongHoc_C
─────────────────────     ─────────────────────     ─────────────────────
HocPhan (replica)         HocPhan (replica)         HocPhan (replica)
CoSo    (replica)         CoSo    (replica)         CoSo    (replica)
Khoa    (replica)         Khoa    (replica)         Khoa    (replica)
─────────────────────     ─────────────────────     ─────────────────────
     ▲  FDW link sang B,C      ▲  FDW link sang A,C      ▲  FDW link sang A,B
```

## 1.2. Công cụ & môi trường
- **DBMS:** PostgreSQL 16 (3 container)
- **Backend:** Node.js + Express + thư viện `pg`
- **Frontend:** HTML/JS thuần + Fetch API
- **Đóng gói:** Docker Compose
- **Quản lý mã:** GitHub
- **Vẽ ERD:** dbdiagram.io hoặc draw.io
- **Test đồng thời:** `Promise.all` trong Node.js

---

# PHẦN 2 — THIẾT KẾ LƯỢC ĐỒ TOÀN CỤC (GLOBAL SCHEMA)

## 2.1. Các quan hệ (tóm tắt)

```
CoSo(MaCoSo PK, TenCoSo, DiaChi, ThanhPho)
Khoa(MaKhoa PK, TenKhoa)
ChuongTrinhDaoTao(MaCTDT PK, TenCT, MaKhoa→Khoa)
HocPhan(MaHP PK, TenHP, SoTinChi, MaKhoa→Khoa)        ← DANH MỤC DÙNG CHUNG → nhân bản
GiangVien(MaGV PK, HoTen, MaKhoa→Khoa, MaCoSo→CoSo)
SinhVien(MaSV PK, HoTen, NgaySinh, MaCoSo→CoSo, MaKhoa→Khoa, NienKhoa)
PhongHoc(MaPhong PK, TenPhong, SucChua, MaCoSo→CoSo)
LopHocPhan(MaLop PK, MaHP→HocPhan, MaGV→GiangVien, MaCoSo→CoSo,
           MaPhong→PhongHoc, HocKy, SiSoToiDa, SoDaDangKy,
           ThuTrongTuan, TietBD, TietKT)               ← THÊM MỚI: cột lịch học
DangKy(MaDK PK, MaSV, MaLop→LopHocPhan, ThoiGianDK, TrangThai)
NhatKyThaoTac(MaLog PK, MaSV, MaLop, HanhDong, KetQua, ThoiGian, SiteXuLy, GhiChu)
```

> **Thay đổi so với v1:** Bảng `LopHocPhan` được bổ sung 3 cột lịch học:
> - `ThuTrongTuan` (2=Thứ 2 … 7=Thứ 7)
> - `TietBD` — tiết bắt đầu (1–15)
> - `TietKT` — tiết kết thúc (1–15)
>
> Ba cột này là nền tảng cho Phần 12 (xử lý trùng lịch) và Phần 13 (phân lịch GV).

## 2.2. File `db/schema.sql` đầy đủ

```sql
-- ============================================================
-- BẢNG DÙNG CHUNG (nhân bản lên cả 3 site)
-- ============================================================
CREATE TABLE CoSo (
    MaCoSo   CHAR(1)      PRIMARY KEY,
    TenCoSo  VARCHAR(100) NOT NULL,
    DiaChi   VARCHAR(200),
    ThanhPho VARCHAR(100)
);

CREATE TABLE Khoa (
    MaKhoa  VARCHAR(10)  PRIMARY KEY,
    TenKhoa VARCHAR(100) NOT NULL
);

CREATE TABLE ChuongTrinhDaoTao (
    MaCTDT  VARCHAR(10)  PRIMARY KEY,
    TenCT   VARCHAR(150) NOT NULL,
    MaKhoa  VARCHAR(10)  REFERENCES Khoa(MaKhoa)
);

CREATE TABLE HocPhan (
    MaHP      VARCHAR(10)  PRIMARY KEY,
    TenHP     VARCHAR(150) NOT NULL,
    SoTinChi  SMALLINT     NOT NULL CHECK (SoTinChi BETWEEN 1 AND 10),
    MaKhoa    VARCHAR(10)  REFERENCES Khoa(MaKhoa)
);

-- ============================================================
-- BẢNG CỤC BỘ (mỗi site chỉ chứa dữ liệu CỦA cơ sở mình)
-- ============================================================
CREATE TABLE SinhVien (
    MaSV     VARCHAR(12)  PRIMARY KEY,
    HoTen    VARCHAR(100) NOT NULL,
    NgaySinh DATE,
    MaCoSo   CHAR(1)      NOT NULL REFERENCES CoSo(MaCoSo),
    MaKhoa   VARCHAR(10)  REFERENCES Khoa(MaKhoa),
    NienKhoa CHAR(4)
);

CREATE TABLE GiangVien (
    MaGV   VARCHAR(10)  PRIMARY KEY,
    HoTen  VARCHAR(100) NOT NULL,
    MaKhoa VARCHAR(10)  REFERENCES Khoa(MaKhoa),
    MaCoSo CHAR(1)      NOT NULL REFERENCES CoSo(MaCoSo)
);

CREATE TABLE PhongHoc (
    MaPhong  VARCHAR(10)  PRIMARY KEY,
    TenPhong VARCHAR(50)  NOT NULL,
    SucChua  SMALLINT     NOT NULL,
    MaCoSo   CHAR(1)      NOT NULL REFERENCES CoSo(MaCoSo)
);

CREATE TABLE LopHocPhan (
    MaLop        VARCHAR(15)  PRIMARY KEY,
    MaHP         VARCHAR(10)  NOT NULL REFERENCES HocPhan(MaHP),
    MaGV         VARCHAR(10)  REFERENCES GiangVien(MaGV),
    MaCoSo       CHAR(1)      NOT NULL REFERENCES CoSo(MaCoSo),
    MaPhong      VARCHAR(10)  REFERENCES PhongHoc(MaPhong),
    HocKy        VARCHAR(10)  NOT NULL,
    SiSoToiDa    SMALLINT     NOT NULL,
    SoDaDangKy   SMALLINT     NOT NULL DEFAULT 0,

    -- THÊM MỚI: Thông tin lịch học
    -- ThuTrongTuan: 2=Thứ 2, 3=Thứ 3, ..., 7=Thứ 7
    ThuTrongTuan SMALLINT     CHECK (ThuTrongTuan BETWEEN 2 AND 7),
    TietBD       SMALLINT     CHECK (TietBD BETWEEN 1 AND 15),
    TietKT       SMALLINT     CHECK (TietKT BETWEEN 1 AND 15),

    CONSTRAINT chk_siso CHECK (SoDaDangKy <= SiSoToiDa),
    CONSTRAINT chk_tiet CHECK (
        TietKT IS NULL OR TietBD IS NULL OR TietKT >= TietBD
    )
);

CREATE TABLE DangKy (
    MaDK       SERIAL       PRIMARY KEY,
    MaSV       VARCHAR(12)  NOT NULL,
    MaLop      VARCHAR(15)  NOT NULL REFERENCES LopHocPhan(MaLop),
    ThoiGianDK TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    TrangThai  VARCHAR(10)  NOT NULL DEFAULT 'DangKy'
                            CHECK (TrangThai IN ('DangKy', 'DaHuy')),
    CONSTRAINT uq_sv_lop UNIQUE (MaSV, MaLop)
);

CREATE TABLE NhatKyThaoTac (
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
-- INDEX — hỗ trợ JOIN, thống kê, và kiểm tra trùng lịch
-- ============================================================
CREATE INDEX idx_dk_malop     ON DangKy(MaLop);
CREATE INDEX idx_lhp_mahp     ON LopHocPhan(MaHP);
CREATE INDEX idx_sv_macoso    ON SinhVien(MaCoSo);
CREATE INDEX idx_lhp_macoso   ON LopHocPhan(MaCoSo);

-- Index mới: hỗ trợ kiểm tra trùng lịch (Phần 12 & 13)
CREATE INDEX idx_lhp_lich     ON LopHocPhan(HocKy, ThuTrongTuan, TietBD, TietKT);
CREATE INDEX idx_lhp_gv_hocky ON LopHocPhan(MaGV, HocKy);
CREATE INDEX idx_lhp_phong    ON LopHocPhan(MaPhong, HocKy, ThuTrongTuan);
```

## 2.3. Ràng buộc nghiệp vụ

| Ràng buộc | Ý nghĩa | Cấp thực thi |
|-----------|---------|-------------|
| `CHECK (SoDaDangKy <= SiSoToiDa)` | Không bao giờ vượt sĩ số | DB |
| `UNIQUE(MaSV, MaLop)` | Không đăng ký trùng lớp | DB |
| `CHECK (TietKT >= TietBD)` | Tiết kết thúc >= tiết bắt đầu | DB |
| Không trùng lịch SV | SV không đăng ký 2 lớp cùng thứ cùng tiết | Ứng dụng + FDW |
| Không trùng lịch GV | GV không dạy 2 lớp cùng thứ cùng tiết | Ứng dụng + FDW |
| Không trùng lịch phòng | Phòng không bị xếp 2 lớp cùng lúc | Ứng dụng |

> **Vì sao ràng buộc lịch không đặt ở cấp DB?** Kiểm tra trùng lịch của SV yêu cầu so sánh dữ liệu qua nhiều site (SV cơ sở A đăng ký lớp cơ sở B — DangKy ở 2 site khác nhau). PostgreSQL không thể tạo `CHECK CONSTRAINT` spanning cross-site foreign tables, nên thực thi ở tầng ứng dụng qua FDW. Đây là câu phản biện hay — chuẩn bị câu trả lời này.

## 2.4. Việc cần làm
- [ ] Vẽ ERD (thêm 3 cột lịch vào `LopHocPhan`)
- [ ] Viết `schema.sql` theo mẫu trên
- [ ] Giải thích trong báo cáo: vì sao ràng buộc lịch đặt ở tầng ứng dụng

---

# PHẦN 3 — PHÂN MẢNH & CẤP PHÁT DỮ LIỆU

## 3.1. Phân mảnh ngang (Horizontal Fragmentation) theo `MaCoSo`

| Quan hệ | Mảnh A | Mảnh B | Mảnh C | Điều kiện mảnh |
|---------|:------:|:------:|:------:|----------------|
| SinhVien | ✔ | ✔ | ✔ | `MaCoSo = 'A'` / `'B'` / `'C'` |
| GiangVien | ✔ | ✔ | ✔ | `MaCoSo = 'A'` / `'B'` / `'C'` |
| PhongHoc | ✔ | ✔ | ✔ | `MaCoSo = 'A'` / `'B'` / `'C'` |
| LopHocPhan | ✔ | ✔ | ✔ | lớp mở tại cơ sở nào → site đó |
| DangKy | ✔ | ✔ | ✔ | theo `MaCoSo` của **lớp** |

## 3.2. Quyết định thiết kế then chốt — `DangKy` đặt ở site nào?

Bản ghi `DangKy` đặt **cùng site với `LopHocPhan`**, không đặt ở site của SV.

**Lý do:** ràng buộc sĩ số phải kiểm tra và khóa cục bộ tại nơi giữ chỗ — tránh 2PC phức tạp và overbooking khi mạng trễ.

**Hệ quả với kiểm tra lịch:** Khi SV cơ sở A đăng ký lớp cơ sở B, `DangKy` nằm ở Site B. Để kiểm tra lịch của SV đó, cần đọc tất cả `DangKy` có `MaSV=...` trên cả 3 site (qua FDW). Đây là truy vấn phân tán thật sự — xem Phần 12.

## 3.3. Dữ liệu nhân bản (Replication)

| Quan hệ | Lý do nhân bản |
|---------|---------------|
| HocPhan | Mọi site cần tra cứu khi mở lớp & đăng ký |
| CoSo | Bảng tra cứu nhỏ, dùng khắp nơi |
| Khoa | Tham chiếu nhỏ, dùng trong JOIN và thống kê |
| ChuongTrinhDaoTao | Dùng chung toàn trường |

## 3.4. Bảng cấp phát tổng hợp (Allocation)

| Mảnh / Bảng | Site A | Site B | Site C | Loại |
|-------------|:------:|:------:|:------:|------|
| SinhVien (`MaCoSo='A'`) | **Chủ** | — | — | Cục bộ |
| SinhVien (`MaCoSo='B'`) | — | **Chủ** | — | Cục bộ |
| SinhVien (`MaCoSo='C'`) | — | — | **Chủ** | Cục bộ |
| LopHocPhan / DangKy / PhongHoc / GiangVien | (tương tự theo `MaCoSo`) | | | Cục bộ |
| HocPhan | Bản sao | Bản sao | Bản sao | Nhân bản |
| CoSo, Khoa, ChuongTrinhDaoTao | Bản sao | Bản sao | Bản sao | Nhân bản |

→ Mô hình **phân mảnh ngang + nhân bản một phần (partial replication)**.

## 3.5. Việc cần làm
- [ ] Vẽ sơ đồ phân bố dữ liệu
- [ ] Viết bảng phân mảnh + bảng cấp phát vào báo cáo
- [ ] Giải thích phương án cấp phát

---

# PHẦN 4 — SAO CHÉP DỮ LIỆU (REPLICATION) & LÝ DO

## 4.1. Nội dung trình bày trong báo cáo
- **Cái gì được nhân bản:** HocPhan, CoSo, Khoa, ChuongTrinhDaoTao
- **Vì sao:** đọc nhiều / ghi rất ít, dùng chung toàn trường
- **Mô hình nhất quán:** Eventual consistency với đồng bộ định kỳ

## 4.2. Triển khai `syncService.js`

```javascript
const { pools } = require('../db');

async function broadcastWrite(sql, params = []) {
  const siteKeys = Object.keys(pools);
  const results = await Promise.allSettled(
    siteKeys.map(site => pools[site].query(sql, params))
  );
  const failed = siteKeys.filter((_, i) => results[i].status === 'rejected');
  return { allOk: failed.length === 0, failed };
}

async function resyncTable(tableName, sourceSite = 'A') {
  const { rows } = await pools[sourceSite].query(`SELECT * FROM ${tableName}`);
  const targets = Object.keys(pools).filter(s => s !== sourceSite);
  for (const site of targets) {
    for (const row of rows) {
      const cols = Object.keys(row);
      const vals = Object.values(row);
      const ph   = vals.map((_, i) => `$${i + 1}`).join(', ');
      const upd  = cols.slice(1).map(c => `${c} = EXCLUDED.${c}`).join(', ');
      await pools[site].query(
        `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${ph})
         ON CONFLICT (${cols[0]}) DO UPDATE SET ${upd}`, vals
      );
    }
  }
}

module.exports = { broadcastWrite, resyncTable };
```

## 4.3. Việc cần làm
- [ ] `syncService.js` với `broadcastWrite` và `resyncTable`
- [ ] Mục báo cáo "Dữ liệu sao chép và lý do"

---

# PHẦN 5 — XỬ LÝ ĐĂNG KÝ ĐỒNG THỜI (TRÁI TIM ĐỒ ÁN)

> **Cập nhật v2:** Luồng đăng ký nay có thêm bước kiểm tra trùng lịch TRƯỚC khi thực hiện transaction khóa sĩ số.

## 5.1. Luồng đăng ký đầy đủ (đã bổ sung kiểm tra lịch)

```
Yêu cầu đăng ký (maSV, maLop)
         │
         ▼
  [1] Tìm site của lớp
         │
         ▼
  [2] Kiểm tra trùng lịch SV (Phần 12) — qua FDW, ngoài transaction
   ├── Trùng lịch → Từ chối (TRUNG_LICH_SV)
   └── OK
         │
         ▼
  [3] BEGIN transaction tại site lớp
         │
         ▼
  [4] SELECT ... FOR UPDATE (khóa hàng LopHocPhan)
         │
         ▼
  [5] SoDaDangKy >= SiSoToiDa? → ROLLBACK → Từ chối (HET_CHO)
         │ Còn chỗ
         ▼
  [6] INSERT DangKy + UPDATE SoDaDangKy
         │
         ▼
  [7] COMMIT
         │
         ▼
  [8] Ghi NhatKyThaoTac (ngoài transaction)
```

> **Lý do kiểm tra lịch TRƯỚC transaction:** Kiểm tra lịch đọc dữ liệu từ nhiều site (FDW) — không nên giữ khóa `FOR UPDATE` trong khi đang chờ FDW. Kiểm tra lịch ở ngoài, chỉ mở transaction khi cần ghi.

## 5.2. Kịch bản tranh chấp cần dựng

> Lớp `L_B_001` có **SiSoToiDa = 2**, đang trống. **30 SV cùng bấm đăng ký.** Đảm bảo **đúng 2 người thành công**, không bao giờ vượt sĩ số.

## 5.3. Code lõi — `src/services/registrationService.js`

```javascript
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

async function dangKy(maSV, maLop, useLock = true) {
  const found = await findSiteByLop(maLop);
  if (!found) return { success: false, reason: 'LOP_KHONG_TON_TAI' };

  const { pool, site } = found;

  // [BƯỚC MỚI] Kiểm tra trùng lịch trước khi mở transaction
  const conflict = await checkSVScheduleConflict(maSV, maLop);
  if (conflict.hasConflict) {
    await ghiNhatKy({
      pool, maSV, maLop, hanhDong: 'DANG_KY',
      ketQua: 'TRUNG_LICH', siteXuLy: site,
      ghiChu: `Trung lich lop ${conflict.conflictLop}`,
    });
    return { success: false, reason: 'TRUNG_LICH', detail: conflict };
  }

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
      await ghiNhatKy({ pool, maSV, maLop, hanhDong:'DANG_KY', ketQua:'HET_CHO', siteXuLy:site });
      return { success: false, reason: 'HET_CHO' };
    }

    if (!useLock) await new Promise(r => setTimeout(r, 30));

    await client.query('INSERT INTO DangKy(MaSV,MaLop) VALUES($1,$2)', [maSV, maLop]);
    await client.query('UPDATE LopHocPhan SET SoDaDangKy=SoDaDangKy+1 WHERE MaLop=$1', [maLop]);
    await client.query('COMMIT');

    await ghiNhatKy({
      pool, maSV, maLop, hanhDong:'DANG_KY',
      ketQua:'THANH_CONG', siteXuLy:site,
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

async function demoDongThoi(maLop, soLuong = 30, useLock = true) {
  const found = await findSiteByLop(maLop);
  if (!found) return { error: 'Lop khong ton tai' };

  await found.pool.query('UPDATE LopHocPhan SET SoDaDangKy=0 WHERE MaLop=$1', [maLop]);
  await found.pool.query('DELETE FROM DangKy WHERE MaLop=$1', [maLop]);

  const svList = Array.from({ length: soLuong }, (_, i) =>
    `DEMO_SV_${String(i+1).padStart(3,'0')}`
  );

  const t0 = Date.now();
  const results = await Promise.allSettled(
    svList.map(maSV => dangKy(maSV, maLop, useLock))
  );
  const elapsed = Date.now() - t0;

  const stats = { thanhCong:0, hetCho:0, trungLich:0, loi:0 };
  results.forEach(r => {
    if (r.status === 'rejected') { stats.loi++; return; }
    if (r.value.success)                        stats.thanhCong++;
    else if (r.value.reason === 'HET_CHO')      stats.hetCho++;
    else if (r.value.reason === 'TRUNG_LICH')   stats.trungLich++;
    else                                         stats.loi++;
  });

  const { rows } = await found.pool.query(
    `SELECT SiSoToiDa, SoDaDangKy,
       (SELECT COUNT(*) FROM DangKy WHERE MaLop=$1 AND TrangThai='DangKy') AS count_actual
     FROM LopHocPhan WHERE MaLop=$1`, [maLop]
  );
  const db = rows[0];
  return {
    maLop, soLuong, useLock, thoiGian: `${elapsed}ms`, ketQua: stats,
    kiemTra: {
      soChoToiDa: parseInt(db.sisotoida),
      soDaDangKy: parseInt(db.sodadangky),
      soThucTe:   parseInt(db.count_actual),
      tinhTrang:  parseInt(db.count_actual) > parseInt(db.sisotoida) ? 'QUA_CHO' : 'DUNG',
    }
  };
}

module.exports = { dangKy, huyDangKy, demoDongThoi };
```

## 5.4. Việc cần làm
- [ ] `registrationService.js` — tích hợp `checkSVScheduleConflict` trước transaction
- [ ] Test 30 request đồng thời (useLock=true → đúng 2 thành công)
- [ ] Demo race condition (useLock=false → quá chỗ)
- [ ] Ảnh chụp kết quả before/after đưa vào báo cáo

---

# PHẦN 6 — TRUY VẤN PHÂN TÁN (≥ 5)

> **Cập nhật v2:** Thêm **Q6** (lịch dạy GV toàn trường) và cập nhật FDW view để bao gồm `v_GiangVien_All`.

## 6.1. Cấu hình `db/fdw_setup.sql` (chạy trên Site A)

```sql
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

CREATE SERVER site_b FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (host 'site_b', port '5432', dbname 'campus');
CREATE SERVER site_c FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (host 'site_c', port '5432', dbname 'campus');

CREATE USER MAPPING FOR postgres SERVER site_b
    OPTIONS (user 'postgres', password 'postgres');
CREATE USER MAPPING FOR postgres SERVER site_c
    OPTIONS (user 'postgres', password 'postgres');

IMPORT FOREIGN SCHEMA public
    LIMIT TO (SinhVien, LopHocPhan, DangKy, GiangVien, PhongHoc)
    FROM SERVER site_b INTO fdw_b;
IMPORT FOREIGN SCHEMA public
    LIMIT TO (SinhVien, LopHocPhan, DangKy, GiangVien, PhongHoc)
    FROM SERVER site_c INTO fdw_c;

-- VIEW gộp — dùng trong truy vấn phân tán
CREATE VIEW v_DangKy_All AS
    SELECT *, 'A' AS site FROM public.DangKy
    UNION ALL SELECT *, 'B' AS site FROM fdw_b.DangKy
    UNION ALL SELECT *, 'C' AS site FROM fdw_c.DangKy;

CREATE VIEW v_LopHocPhan_All AS
    SELECT *, 'A' AS site FROM public.LopHocPhan
    UNION ALL SELECT *, 'B' AS site FROM fdw_b.LopHocPhan
    UNION ALL SELECT *, 'C' AS site FROM fdw_c.LopHocPhan;

CREATE VIEW v_SinhVien_All AS
    SELECT *, 'A' AS site FROM public.SinhVien
    UNION ALL SELECT *, 'B' AS site FROM fdw_b.SinhVien
    UNION ALL SELECT *, 'C' AS site FROM fdw_c.SinhVien;

-- THÊM MỚI: dùng cho Q6 và kiểm tra trùng lịch GV
CREATE VIEW v_GiangVien_All AS
    SELECT *, 'A' AS site FROM public.GiangVien
    UNION ALL SELECT *, 'B' AS site FROM fdw_b.GiangVien
    UNION ALL SELECT *, 'C' AS site FROM fdw_c.GiangVien;
```

## 6.2. Sáu truy vấn — bảng tổng quan

| # | Truy vấn | Nguồn dữ liệu | Cách tổng hợp |
|---|----------|---------------|---------------|
| Q1 | Số SV đăng ký theo từng cơ sở | DangKy + LopHocPhan (3 site) | COUNT theo `MaCoSo` của lớp |
| Q2 | Học phần đông đăng ký nhất toàn trường | DangKy + LopHocPhan + HocPhan | UNION → GROUP BY `MaHP` |
| Q3 | SV đăng ký chéo cơ sở | SinhVien + LopHocPhan (cross-site) | JOIN `MaCoSo` khác nhau |
| Q4 | Tỷ lệ lấp đầy các lớp toàn hệ thống | LopHocPhan (3 site) | `SoDaDangKy/SiSoToiDa` |
| Q5 | Số lớp mở theo khoa / theo cơ sở | LopHocPhan + HocPhan + Khoa | COUNT GROUP BY |
| Q6 | Lịch dạy GV toàn trường *(MỚI)* | LopHocPhan + GiangVien (3 site) | GROUP BY `MaGV`, lọc thứ/tiết |

## 6.3. Code — `src/services/queryService.js`

```javascript
const { coordinator } = require('../db');

async function soSVTheoCoSo() {
  const { rows } = await coordinator.query(`
    SELECT lhp.MaCoSo, cs.TenCoSo, COUNT(dk.MaDK) AS SoLuotDangKy
    FROM v_DangKy_All dk
    JOIN v_LopHocPhan_All lhp ON dk.MaLop = lhp.MaLop
    JOIN CoSo cs ON lhp.MaCoSo = cs.MaCoSo
    WHERE dk.TrangThai = 'DangKy'
    GROUP BY lhp.MaCoSo, cs.TenCoSo
    ORDER BY SoLuotDangKy DESC`);
  return rows;
}

async function hocPhanDongNhat() {
  const { rows } = await coordinator.query(`
    SELECT hp.MaHP, hp.TenHP, hp.SoTinChi, COUNT(dk.MaDK) AS TongDangKy
    FROM v_DangKy_All dk
    JOIN v_LopHocPhan_All lhp ON dk.MaLop = lhp.MaLop
    JOIN HocPhan hp ON lhp.MaHP = hp.MaHP
    WHERE dk.TrangThai = 'DangKy'
    GROUP BY hp.MaHP, hp.TenHP, hp.SoTinChi
    ORDER BY TongDangKy DESC LIMIT 5`);
  return rows;
}

async function dangKyCheoCoso() {
  const { rows } = await coordinator.query(`
    SELECT sv.MaSV, sv.HoTen, sv.MaCoSo AS CoSoNha,
           lhp.MaCoSo AS CoSoLop, hp.TenHP, lhp.MaLop
    FROM v_DangKy_All dk
    JOIN v_LopHocPhan_All lhp ON dk.MaLop = lhp.MaLop
    JOIN v_SinhVien_All sv ON dk.MaSV = sv.MaSV
    JOIN HocPhan hp ON lhp.MaHP = hp.MaHP
    WHERE dk.TrangThai = 'DangKy' AND sv.MaCoSo <> lhp.MaCoSo
    ORDER BY sv.MaCoSo, sv.MaSV`);
  return rows;
}

async function tyLeLapDay() {
  const { rows } = await coordinator.query(`
    SELECT lhp.MaLop, hp.TenHP, lhp.MaCoSo, lhp.SoDaDangKy, lhp.SiSoToiDa,
           ROUND(lhp.SoDaDangKy * 100.0 / NULLIF(lhp.SiSoToiDa,0),1) AS TyLe_Pct
    FROM v_LopHocPhan_All lhp
    JOIN HocPhan hp ON lhp.MaHP = hp.MaHP
    ORDER BY TyLe_Pct DESC`);
  return rows;
}

async function soLopTheoKhoaVaCoSo() {
  const { rows } = await coordinator.query(`
    SELECT k.TenKhoa, lhp.MaCoSo, COUNT(*) AS SoLop
    FROM v_LopHocPhan_All lhp
    JOIN HocPhan hp ON lhp.MaHP = hp.MaHP
    JOIN Khoa k ON hp.MaKhoa = k.MaKhoa
    GROUP BY k.TenKhoa, lhp.MaCoSo
    ORDER BY k.TenKhoa, lhp.MaCoSo`);
  return rows;
}

// Q6 — Lịch dạy GV toàn trường (MỚI)
async function lichDayGiangVien(maGV = null, hocKy = null) {
  const conditions = [];
  const params = [];
  if (maGV)  { params.push(maGV);  conditions.push(`lhp.MaGV=$${params.length}`); }
  if (hocKy) { params.push(hocKy); conditions.push(`lhp.HocKy=$${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await coordinator.query(`
    SELECT gv.MaGV, gv.HoTen AS TenGV, gv.MaCoSo AS CoSoGV,
           lhp.MaLop, hp.TenHP, lhp.MaCoSo AS CoSoLop,
           lhp.HocKy, lhp.ThuTrongTuan, lhp.TietBD, lhp.TietKT,
           lhp.SiSoToiDa, lhp.SoDaDangKy
    FROM v_LopHocPhan_All lhp
    JOIN v_GiangVien_All gv ON lhp.MaGV = gv.MaGV
    JOIN HocPhan hp ON lhp.MaHP = hp.MaHP
    ${where}
    ORDER BY gv.MaGV, lhp.ThuTrongTuan, lhp.TietBD`, params);
  return rows;
}

module.exports = {
  soSVTheoCoSo, hocPhanDongNhat, dangKyCheoCoso,
  tyLeLapDay, soLopTheoKhoaVaCoSo, lichDayGiangVien,
};
```

## 6.4. REST API endpoints

| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/api/lop-hoc-phan` | Danh sách lớp (lọc theo cơ sở, học kỳ) |
| GET | `/api/lop-hoc-phan/:maLop` | Chi tiết 1 lớp + lịch học |
| POST | `/api/dang-ky` | Đăng ký học phần (có kiểm tra lịch) |
| PATCH | `/api/dang-ky/huy` | Hủy đăng ký |
| GET | `/api/dang-ky/:maSV` | Danh sách đăng ký của SV |
| GET | `/api/stats/sv-theo-coso` | Q1 |
| GET | `/api/stats/hoc-phan-dong-nhat` | Q2 |
| GET | `/api/stats/dang-ky-cheo-coso` | Q3 |
| GET | `/api/stats/ty-le-lap-day` | Q4 |
| GET | `/api/stats/lop-theo-khoa-coso` | Q5 |
| GET | `/api/stats/lich-day-gv` | Q6 — lịch GV toàn trường |
| GET | `/api/lich/sv/:maSV` | Lịch học SV (cảnh báo trùng) |
| GET | `/api/lich/gv/:maGV` | Lịch dạy GV (đơn lẻ) |
| GET | `/api/lich/phong/:maPhong` | Lịch sử dụng phòng |
| POST | `/api/lich/phan-cong-gv` | Phân công GV (có kiểm tra xung đột) |
| POST | `/api/lich/tao-lop` | Tạo lớp học phần mới |
| GET | `/api/lich/tai-giang-day` | Thống kê tải giảng dạy |
| GET | `/api/log` | Nhật ký thao tác |
| POST | `/api/admin/sync-catalog` | Đồng bộ HocPhan replica |
| POST | `/api/test/concurrent` | Test đồng thời 30 SV |

## 6.5. Việc cần làm
- [ ] `fdw_setup.sql` + VIEW gộp (thêm `v_GiangVien_All`)
- [ ] `queryService.js` — 6 hàm Q1–Q6
- [ ] Routes tương ứng cho từng endpoint

---

# PHẦN 7 — YÊU CẦU NÂNG CAO (chọn ≥ 1, nên làm 2)

| Lựa chọn | Độ khó | Khuyến nghị |
|----------|--------|-------------|
| Mô phỏng **deadlock** / xung đột cập nhật | Trung bình | **Nên làm** |
| **So sánh phân mảnh theo cơ sở vs theo khoa** | Thấp | **Nên làm** |
| Đánh giá ảnh hưởng **replication** | Trung bình | Tốt cho điểm cộng |
| Cơ chế khi 1 site **mất kết nối** | Trung bình–cao | Ấn tượng nếu demo được |

## 7.1. Demo deadlock

```javascript
async function demoDeadlock() {
  const pool = getPoolBySite('A');
  const [c1, c2] = await Promise.all([pool.connect(), pool.connect()]);
  await c1.query('BEGIN'); await c2.query('BEGIN');
  await c1.query("SELECT * FROM LopHocPhan WHERE MaLop='L_A_001' FOR UPDATE");
  await c2.query("SELECT * FROM LopHocPhan WHERE MaLop='L_A_002' FOR UPDATE");
  const [r1, r2] = await Promise.allSettled([
    c1.query("SELECT * FROM LopHocPhan WHERE MaLop='L_A_002' FOR UPDATE"),
    c2.query("SELECT * FROM LopHocPhan WHERE MaLop='L_A_001' FOR UPDATE"),
  ]);
  console.log('T1:', r1.status, r1.reason?.message ?? 'OK');
  console.log('T2:', r2.status, r2.reason?.message ?? 'OK');
  await Promise.allSettled([c1.query('ROLLBACK'), c2.query('ROLLBACK')]);
  c1.release(); c2.release();
}
```

## 7.2. Việc cần làm
- [ ] Chọn & cài đặt ≥ 1 (nên 2) nội dung nâng cao
- [ ] Mục riêng trong báo cáo + bằng chứng

---

# PHẦN 8 — FRONTEND (GIAO DIỆN TRỰC QUAN)

> **Cập nhật v2:** Thêm 3 màn hình mới: Lịch học SV, Lịch dạy GV, Phân công GV.

## 8.1. Cấu trúc trang

```
frontend/
├── index.html
├── pages/
│   ├── login.html
│   ├── courses.html          ← danh sách lớp + cột Thứ/Tiết
│   ├── my-registrations.html
│   ├── my-schedule.html      ← lịch học SV dạng lưới TKB (THÊM MỚI)
│   ├── gv-schedule.html      ← lịch dạy GV dạng lưới TKB (THÊM MỚI)
│   ├── assign-gv.html        ← phân công GV, Admin (THÊM MỚI)
│   ├── stats.html            ← 6 tab Q1–Q6
│   └── log.html
├── js/
│   ├── api.js
│   ├── courses.js
│   ├── registration.js
│   ├── schedule.js           ← renderTKBGrid, findConflicts (THÊM MỚI)
│   └── stats.js
└── css/style.css
```

## 8.2. Các màn hình tối thiểu

- **Login:** nhập `MaSV` / chọn vai trò (SV / GV / Admin)
- **Danh sách lớp:** badge A/B/C · sĩ số thanh progress · **cột Thứ/Tiết** · nút Đăng ký
- **Đăng ký của tôi:** bảng lớp + nút Hủy
- **Lịch học SV** *(MỚI):* lưới TKB (Thứ 2–7 × Tiết 1–15), tô màu ô có lớp, **cảnh báo đỏ nếu trùng**
- **Lịch dạy GV** *(MỚI):* chọn GV + học kỳ, lưới TKB, bảng tải giảng dạy (số lớp, tổng tiết)
- **Phân công GV (Admin)** *(MỚI):* bảng lớp + dropdown chọn GV + nút Phân công → hiện kết quả ngay
- **Thống kê:** 6 tab Q1–Q6
- **Nhật ký:** bảng log + nút **"Chạy 30 SV đồng thời"**

## 8.3. Hiển thị lịch học — `js/schedule.js`

```javascript
const THU_LABELS = ['','','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];

function renderTKBGrid(lopList, containerId) {
  const container = document.getElementById(containerId);
  const rows = [];
  // Tạo 5 nhóm tiết (1-3, 4-6, 7-9, 10-12, 13-15)
  for (let nhom = 0; nhom < 5; nhom++) {
    const tietStart = nhom * 3 + 1;
    const tietEnd   = nhom * 3 + 3;
    const cells = THU_LABELS.slice(2).map((_, thuIdx) => {
      const thu = thuIdx + 2;
      const lop = lopList.find(l =>
        l.thutrongtuan == thu &&
        l.tietbd <= tietEnd && l.tietkt >= tietStart
      );
      if (!lop) return `<td></td>`;
      const cls = lop.hasConflict ? 'lop-badge conflict' : 'lop-badge';
      return `<td><div class="${cls}">${lop.malop}<br><small>${lop.tenhp ?? ''}</small></div></td>`;
    }).join('');
    rows.push(`<tr><td class="tiet-label">Tiết ${tietStart}–${tietEnd}</td>${cells}</tr>`);
  }

  container.innerHTML = `
    <table class="tkb-table">
      <thead><tr><th>Tiết</th>${THU_LABELS.slice(2).map(t=>`<th>${t}</th>`).join('')}</tr></thead>
      <tbody>${rows.join('')}</tbody>
    </table>`;
}

function findConflicts(lopList) {
  const conflicts = [];
  for (let i = 0; i < lopList.length; i++)
    for (let j = i + 1; j < lopList.length; j++) {
      const a = lopList[i], b = lopList[j];
      if (a.thutrongtuan === b.thutrongtuan &&
          a.tietbd <= b.tietkt && a.tietkt >= b.tietbd)
        conflicts.push({ lop1: a.malop, lop2: b.malop });
    }
  return conflicts;
}
```

## 8.4. Việc cần làm
- [ ] 3 màn hình mới (my-schedule, gv-schedule, assign-gv)
- [ ] `schedule.js` với `renderTKBGrid` và `findConflicts`
- [ ] Danh sách lớp hiển thị cột Thứ/Tiết
- [ ] Cảnh báo trùng lịch khi đăng ký (toast đỏ)
- [ ] Trang thống kê 6 tab Q1–Q6

---

# PHẦN 9 — DỮ LIỆU MẪU & NHẬT KÝ THAO TÁC

> **Cập nhật v2:** Seed data bao gồm `ThuTrongTuan`, `TietBD`, `TietKT` cho tất cả lớp học phần. Có cặp lớp trùng lịch để test.

## 9.1. Dữ liệu mẫu
- 3 cơ sở, 4–5 khoa, ~20 học phần (nhân bản 3 site)
- Mỗi site: 5–6 phòng, 8–10 GV, ≥ 50 SV, 10–12 lớp học phần **có đầy đủ lịch**
- **2–3 lớp `SiSoToiDa=2`** → demo tranh chấp chỗ
- **Cặp lớp trùng lịch cùng GV** → demo xung đột phân công (Phần 13)
- **Cặp lớp trùng lịch cùng phòng** → demo xung đột phòng (Phần 12)
- Vài SV cơ sở A đăng ký lớp Site B → phục vụ Q3

## 9.2. Ví dụ seed `LopHocPhan` với lịch học

```sql
-- db/seed_site_b.sql (trích)
INSERT INTO LopHocPhan
  (MaLop,MaHP,MaGV,MaCoSo,MaPhong,HocKy,SiSoToiDa,SoDaDangKy,ThuTrongTuan,TietBD,TietKT)
VALUES
  -- Lớp bình thường
  ('L_B_001','IT001','GV_B_001','B','B101','20241', 2, 0, 2, 1, 3),
  ('L_B_002','IT002','GV_B_002','B','B102','20241',40, 0, 2, 4, 6),
  ('L_B_003','IT003','GV_B_001','B','B103','20241',35, 0, 3, 1, 3),

  -- DEMO TEST TRÙNG LỊCH:
  -- L_B_005 chưa có GV → dùng để test phân công GV_B_001
  -- GV_B_001 đã dạy Thứ 2 tiết 1-3 (L_B_001) → L_B_005 Thứ 2 tiết 2-4 bị trùng
  ('L_B_005','IT004',NULL,'B','B104','20241',25, 0, 2, 2, 4),

  -- L_B_006 dùng B101 Thứ 2 tiết 2-4 → trùng phòng với L_B_001
  ('L_B_006','IT005',NULL,'B','B101','20241',20, 0, 2, 2, 4);
```

## 9.3. File seed
- `db/seed_site_a.sql`, `db/seed_site_b.sql`, `db/seed_site_c.sql`
- Mỗi file có comment rõ: "LỚP DEMO SĨ SỐ", "LỚP DEMO TRÙNG LỊCH"

## 9.4. Việc cần làm
- [ ] 3 file seed có đầy đủ `ThuTrongTuan, TietBD, TietKT`
- [ ] Seed cặp lớp trùng lịch để test Phần 12 & 13
- [ ] HocPhan/CoSo/Khoa giống nhau 3 site

---

# PHẦN 10 — DOCKER, TRIỂN KHAI & GIT REPO

## 10.1. `docker-compose.yml`

```yaml
version: '3.9'
services:
  site_a:
    image: postgres:16
    container_name: site_a
    environment: { POSTGRES_DB: campus, POSTGRES_PASSWORD: postgres }
    ports: ["5433:5432"]
    volumes: ["pg_a:/var/lib/postgresql/data"]
  site_b:
    image: postgres:16
    container_name: site_b
    environment: { POSTGRES_DB: campus, POSTGRES_PASSWORD: postgres }
    ports: ["5434:5432"]
    volumes: ["pg_b:/var/lib/postgresql/data"]
  site_c:
    image: postgres:16
    container_name: site_c
    environment: { POSTGRES_DB: campus, POSTGRES_PASSWORD: postgres }
    ports: ["5435:5432"]
    volumes: ["pg_c:/var/lib/postgresql/data"]
  backend:
    build: ./backend
    ports: ["4000:4000"]
    depends_on: [site_a, site_b, site_c]
  frontend:
    image: nginx:alpine
    ports: ["3000:80"]
    volumes: ["./frontend:/usr/share/nginx/html:ro"]
volumes: { pg_a: {}, pg_b: {}, pg_c: {} }
```

## 10.2. Script khởi động (README)

```bash
docker-compose up -d
sleep 5
for SITE in a b c; do
  docker exec -i site_$SITE psql -U postgres -d campus < db/schema.sql
  docker exec -i site_$SITE psql -U postgres -d campus < db/seed_site_$SITE.sql
done
docker exec -i site_a psql -U postgres -d campus < db/fdw_setup.sql
node backend/src/concurrency_test.js
# Mo giao dien: http://localhost:3000
```

## 10.3. Cấu trúc repo

```
do-an-csdl-phan-tan/
├── README.md
├── docker-compose.yml
├── db/
│   ├── schema.sql
│   ├── seed_site_a.sql | seed_site_b.sql | seed_site_c.sql
│   ├── fdw_setup.sql
│   └── distributed_queries.sql
├── backend/
│   ├── Dockerfile | package.json
│   └── src/
│       ├── db.js | app.js
│       └── services/
│           ├── registrationService.js
│           ├── scheduleConflictService.js   ← THÊM MỚI
│           ├── teachingScheduleService.js   ← THÊM MỚI
│           ├── queryService.js
│           └── syncService.js
│       └── routes/
│           ├── registration.js
│           ├── schedule.js                  ← THÊM MỚI
│           ├── courses.js | stats.js | admin.js
├── frontend/
│   ├── pages/
│   │   ├── my-schedule.html                ← THÊM MỚI
│   │   ├── gv-schedule.html                ← THÊM MỚI
│   │   └── assign-gv.html                  ← THÊM MỚI
│   └── js/
│       └── schedule.js                     ← THÊM MỚI
├── docs/ ERD.png | kien_truc.png | Bao_cao.pdf
└── logs/ log demo dong thoi
```

---

# PHẦN 11 — ĐÁNH GIÁ HIỆU NĂNG (ĐIỂM CỘNG)

| Kịch bản | Latency TB | Throughput |
|----------|:----------:|:----------:|
| Đăng ký cùng site (A→A) | ? ms | ? |
| Đăng ký khác site (A→B) | ? ms | ? |
| Kiểm tra lịch cùng site | ? ms | ? |
| Kiểm tra lịch qua FDW (3 site) | ? ms | ? |
| Truy vấn phân tán (FDW) | ? ms | ? |
| 30 concurrent trên lớp 2 chỗ | ? ms | ? |

- [ ] Script đo hiệu năng
- [ ] Bảng kết quả + nhận xét vào báo cáo

---

# PHẦN 12 — XỬ LÝ TRÙNG LỊCH (MỚI)

## 12.1. Các loại xung đột cần phát hiện

| Loại | Mô tả | Khi nào kiểm tra |
|------|-------|-----------------|
| **SV — lịch cá nhân** | SV đã có lớp X, tiết giao nhau với lớp mới | Lúc đăng ký học phần |
| **Phòng học** | Phòng đã có lớp Y, tiết giao nhau | Lúc admin tạo/sửa lớp |
| **Giảng viên** | GV đã dạy lớp Z, tiết giao nhau | Lúc admin phân công GV (Phần 13) |

## 12.2. Công thức phát hiện trùng lịch (interval overlap)

Hai lớp A và B trùng lịch khi và chỉ khi:
```
A.ThuTrongTuan = B.ThuTrongTuan
AND A.TietBD <= B.TietKT
AND A.TietKT >= B.TietBD
```
Điều kiện KHÔNG trùng: `A.TietKT < B.TietBD OR A.TietBD > B.TietKT`

## 12.3. Thách thức phân tán

Khi SV cơ sở A đăng ký lớp cơ sở B, các lớp SV đã đăng ký trước có thể ở Site A, B, hoặc C. Cần tổng hợp lịch qua cả 3 site (FDW) trước khi kiểm tra — đây là trường hợp truy vấn phân tán thực sự và là lập luận tốt cho báo cáo.

## 12.4. Code — `src/services/scheduleConflictService.js`

```javascript
const { coordinator, pools } = require('../db');

// Lấy lịch của lớp học phần (tìm trên mọi site)
async function getLopSchedule(maLop) {
  for (const pool of Object.values(pools)) {
    try {
      const { rows } = await pool.query(
        `SELECT MaLop, MaGV, MaPhong, HocKy, ThuTrongTuan, TietBD, TietKT
         FROM LopHocPhan WHERE MaLop = $1`, [maLop]
      );
      if (rows.length) return rows[0];
    } catch (_) {}
  }
  return null;
}

// Kiểm tra trùng lịch SV — phân tán qua FDW tại Site A
async function checkSVScheduleConflict(maSV, maLopMoi) {
  const lopMoi = await getLopSchedule(maLopMoi);
  if (!lopMoi || !lopMoi.thutrongtuan) return { hasConflict: false };

  const { rows } = await coordinator.query(`
    SELECT lhp.MaLop, lhp.ThuTrongTuan, lhp.TietBD, lhp.TietKT, hp.TenHP
    FROM v_DangKy_All dk
    JOIN v_LopHocPhan_All lhp ON dk.MaLop = lhp.MaLop
    JOIN HocPhan hp ON lhp.MaHP = hp.MaHP
    WHERE dk.MaSV      = $1
      AND dk.TrangThai  = 'DangKy'
      AND dk.MaLop     <> $2
      AND lhp.HocKy     = $3
      AND lhp.ThuTrongTuan IS NOT NULL
  `, [maSV, maLopMoi, lopMoi.hocky]);

  for (const lop of rows) {
    if (lop.thutrongtuan === lopMoi.thutrongtuan &&
        lop.tietbd <= lopMoi.tietkt &&
        lop.tietkt >= lopMoi.tietbd) {
      return {
        hasConflict: true,
        conflictLop: lop.malop,
        conflictHP:  lop.tenhp,
        thu: lopMoi.thutrongtuan,
        tietBD: lopMoi.tietbd,
        tietKT: lopMoi.tietkt,
      };
    }
  }
  return { hasConflict: false };
}

// Kiểm tra trùng lịch PHONG — cục bộ tại site của phòng
async function checkPhongConflict(maPhong, hocKy, thu, tietBD, tietKT, maLopExclude = null) {
  if (!maPhong || !thu) return { hasConflict: false };
  for (const pool of Object.values(pools)) {
    try {
      const chk = await pool.query('SELECT 1 FROM PhongHoc WHERE MaPhong=$1', [maPhong]);
      if (!chk.rows.length) continue;
      const { rows } = await pool.query(`
        SELECT MaLop FROM LopHocPhan
        WHERE MaPhong     = $1 AND HocKy = $2 AND ThuTrongTuan = $3
          AND TietBD     <= $5 AND TietKT >= $4
          AND ($6::VARCHAR IS NULL OR MaLop <> $6)
      `, [maPhong, hocKy, thu, tietBD, tietKT, maLopExclude]);
      if (rows.length) return { hasConflict: true, conflictLop: rows[0].malop };
      return { hasConflict: false };
    } catch (_) {}
  }
  return { hasConflict: false };
}

// Kiểm tra trùng lịch GV — qua FDW (GV có thể dạy nhiều site)
async function checkGVConflict(maGV, hocKy, thu, tietBD, tietKT, maLopExclude = null) {
  if (!maGV || !thu) return { hasConflict: false };
  const { rows } = await coordinator.query(`
    SELECT MaLop, MaCoSo FROM v_LopHocPhan_All
    WHERE MaGV = $1 AND HocKy = $2 AND ThuTrongTuan = $3
      AND TietBD <= $5 AND TietKT >= $4
      AND ($6::VARCHAR IS NULL OR MaLop <> $6)
  `, [maGV, hocKy, thu, tietBD, tietKT, maLopExclude]);
  if (rows.length) return { hasConflict: true, conflictLop: rows[0].malop, coSo: rows[0].macoso };
  return { hasConflict: false };
}

module.exports = { getLopSchedule, checkSVScheduleConflict, checkPhongConflict, checkGVConflict };
```

## 12.5. API endpoints lịch học — `routes/schedule.js` (phần SV & phòng)

```javascript
const express = require('express');
const router  = express.Router();
const { coordinator, pools } = require('../db');

// GET /api/lich/sv/:maSV?hocKy=20241
router.get('/sv/:maSV', async (req, res) => {
  try {
    const { maSV } = req.params;
    const { hocKy } = req.query;
    const params = [maSV];
    const hkCond = hocKy ? `AND lhp.HocKy=$${params.push(hocKy)}` : '';

    const { rows } = await coordinator.query(`
      SELECT lhp.MaLop, hp.TenHP, lhp.MaCoSo, lhp.ThuTrongTuan, lhp.TietBD, lhp.TietKT
      FROM v_DangKy_All dk
      JOIN v_LopHocPhan_All lhp ON dk.MaLop = lhp.MaLop
      JOIN HocPhan hp ON lhp.MaHP = hp.MaHP
      WHERE dk.MaSV = $1 AND dk.TrangThai = 'DangKy' ${hkCond}
      ORDER BY lhp.ThuTrongTuan, lhp.TietBD
    `, params);

    // Đánh dấu ô trùng lịch
    const withConflict = rows.map(lop => {
      const conflict = rows.find(o =>
        o.malop !== lop.malop &&
        o.thutrongtuan === lop.thutrongtuan &&
        o.tietbd <= lop.tietkt && o.tietkt >= lop.tietbd
      );
      return { ...lop, hasConflict: !!conflict, conflictWith: conflict?.malop };
    });
    res.json(withConflict);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/lich/phong/:maPhong?hocKy=20241
router.get('/phong/:maPhong', async (req, res) => {
  try {
    const { maPhong } = req.params;
    const { hocKy } = req.query;
    for (const pool of Object.values(pools)) {
      const chk = await pool.query('SELECT 1 FROM PhongHoc WHERE MaPhong=$1', [maPhong]);
      if (!chk.rows.length) continue;
      const params = [maPhong];
      const hkCond = hocKy ? `AND lhp.HocKy=$${params.push(hocKy)}` : '';
      const { rows } = await pool.query(`
        SELECT lhp.MaLop, hp.TenHP, gv.HoTen AS TenGV,
               lhp.ThuTrongTuan, lhp.TietBD, lhp.TietKT
        FROM LopHocPhan lhp
        JOIN HocPhan hp ON lhp.MaHP = hp.MaHP
        LEFT JOIN GiangVien gv ON lhp.MaGV = gv.MaGV
        WHERE lhp.MaPhong = $1 ${hkCond}
        ORDER BY lhp.ThuTrongTuan, lhp.TietBD
      `, params);
      return res.json(rows);
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

## 12.6. SQL demo trong pgAdmin

```sql
-- Demo: Kiểm tra SV có trùng lịch khi đăng ký lớp Thứ 2 tiết 1-3 không?
WITH lich_moi AS (SELECT 2 AS thu, 1 AS tiet_bd, 3 AS tiet_kt, '20241' AS hoc_ky)
SELECT dk.MaSV, lhp.MaLop, lhp.ThuTrongTuan, lhp.TietBD, lhp.TietKT, hp.TenHP
FROM v_DangKy_All dk
JOIN v_LopHocPhan_All lhp ON dk.MaLop = lhp.MaLop
JOIN HocPhan hp ON lhp.MaHP = hp.MaHP
CROSS JOIN lich_moi lm
WHERE dk.MaSV = 'SV_A_001'
  AND dk.TrangThai = 'DangKy'
  AND lhp.HocKy = lm.hoc_ky
  AND lhp.ThuTrongTuan = lm.thu
  AND lhp.TietBD <= lm.tiet_kt
  AND lhp.TietKT >= lm.tiet_bd;
-- Trống = không trùng; có hàng = trùng lịch

-- Xem tất cả cặp lớp trùng phòng (cục bộ tại Site B)
SELECT a.MaLop AS LopA, b.MaLop AS LopB, a.MaPhong, a.ThuTrongTuan,
       a.TietBD AS TietBD_A, a.TietKT AS TietKT_A,
       b.TietBD AS TietBD_B, b.TietKT AS TietKT_B
FROM LopHocPhan a
JOIN LopHocPhan b ON a.MaPhong = b.MaPhong AND a.HocKy = b.HocKy
                  AND a.ThuTrongTuan = b.ThuTrongTuan
                  AND a.TietBD <= b.TietKT AND a.TietKT >= b.TietBD
                  AND a.MaLop < b.MaLop
WHERE a.MaPhong IS NOT NULL;
```

## 12.7. Nội dung viết vào báo cáo
- Mô tả 3 loại xung đột + công thức interval overlap
- Giải thích vì sao kiểm tra lịch SV cần FDW (phân tán)
- Giải thích vì sao ràng buộc đặt ở tầng ứng dụng, không phải DB constraint
- Screenshot: UI cảnh báo trùng lịch khi đăng ký
- Kết quả query SQL trong pgAdmin

## 12.8. Checklist Phần 12
- [ ] `scheduleConflictService.js` — 4 hàm đầy đủ
- [ ] Tích hợp `checkSVScheduleConflict` vào `registrationService.js`
- [ ] `routes/schedule.js` — endpoint lịch SV + lịch phòng
- [ ] Đăng ký route trong `app.js`
- [ ] Seed data có lớp trùng lịch để test
- [ ] UI cảnh báo trùng lịch (toast đỏ trên trang đăng ký + màu đỏ trên TKB)
- [ ] SQL demo trong pgAdmin — chụp màn hình cho báo cáo

---

# PHẦN 13 — PHÂN LỊCH DẠY GIẢNG VIÊN (MỚI)

## 13.1. Nghiệp vụ phân lịch dạy

Cuối mỗi học kỳ, admin cần:
1. **Tạo lớp học phần** (Học kỳ, Học phần, Phòng, Thứ/Tiết, Sĩ số)
2. **Phân công GV** cho lớp — kiểm tra GV không bị trùng lịch kể cả ở cơ sở khác
3. **Xem toàn bộ lịch dạy** của GV trong học kỳ
4. **Thống kê tải giảng dạy** (GV dạy bao nhiêu tiết, bao nhiêu lớp)

> **Tính phân tán:** GV cơ sở A có thể được mời dạy lớp cơ sở B. Kiểm tra trùng lịch GV phải tra cứu qua cả 3 site (FDW).

## 13.2. Luồng phân công GV

```
Admin chọn: Lớp + Giảng viên
         │
         ▼
  [1] Lấy lịch của lớp (ThuTrongTuan, TietBD, TietKT, HocKy)
         │
         ▼
  [2] Tra cứu lịch GV toàn trường qua FDW (v_LopHocPhan_All)
   ├── Trùng thứ + tiết → Từ chối + thông báo "GV đã dạy lớp X tại cơ sở Y"
   └── OK
         │
         ▼
  [3] UPDATE LopHocPhan SET MaGV = ? WHERE MaLop = ?
      (chỉ tại site của lớp — không cần distributed transaction)
         │
         ▼
  [4] Ghi log phân công
```

> **Không cần 2PC:** UPDATE MaGV chỉ xảy ra tại 1 site. Tính phân tán thể hiện ở bước [2] — kiểm tra GV có đang dạy ở site nào khác không.

## 13.3. Code — `src/services/teachingScheduleService.js`

```javascript
const { coordinator, pools } = require('../db');
const { getLopSchedule, checkGVConflict, checkPhongConflict } = require('./scheduleConflictService');

// Phân công GV vào lớp (có kiểm tra trùng lịch toàn trường)
async function phanCongGV(maLop, maGV) {
  const lop = await getLopSchedule(maLop);
  if (!lop) return { success: false, reason: 'LOP_KHONG_TON_TAI' };

  if (lop.thutrongtuan) {
    const gvConflict = await checkGVConflict(
      maGV, lop.hocky, lop.thutrongtuan, lop.tietbd, lop.tietkt, maLop
    );
    if (gvConflict.hasConflict) {
      return {
        success: false, reason: 'TRUNG_LICH_GV',
        detail: {
          maGV, conflictLop: gvConflict.conflictLop, coSo: gvConflict.coSo,
          message: `GV dang day lop ${gvConflict.conflictLop} tai co so ${gvConflict.coSo}`,
        }
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

// Tạo lớp học phần mới (Admin) — kiểm tra phòng + GV trước khi tạo
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

// Xem lịch dạy của GV (toàn trường, qua FDW)
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
    ORDER BY lhp.HocKy, lhp.ThuTrongTuan, lhp.TietBD
  `, params);
  return rows;
}

// Thống kê tải giảng dạy toàn trường
async function thongKeTaiGiangDay(hocKy) {
  const { rows } = await coordinator.query(`
    SELECT gv.MaGV, gv.HoTen, gv.MaCoSo,
           COUNT(lhp.MaLop)                    AS SoLop,
           SUM(lhp.TietKT - lhp.TietBD + 1)   AS TongSoTiet,
           SUM(lhp.SoDaDangKy)                 AS TongSVPhuTrach
    FROM v_LopHocPhan_All lhp
    JOIN v_GiangVien_All gv ON lhp.MaGV = gv.MaGV
    WHERE lhp.HocKy = $1
    GROUP BY gv.MaGV, gv.HoTen, gv.MaCoSo
    ORDER BY TongSoTiet DESC
  `, [hocKy]);
  return rows;
}

module.exports = { phanCongGV, taoLopHocPhan, getLichDayGV, thongKeTaiGiangDay };
```

## 13.4. REST API — bổ sung vào `routes/schedule.js`

```javascript
const { phanCongGV, taoLopHocPhan, getLichDayGV, thongKeTaiGiangDay }
  = require('../services/teachingScheduleService');

// POST /api/lich/phan-cong-gv — Body: { maLop, maGV }
router.post('/phan-cong-gv', async (req, res) => {
  try {
    const { maLop, maGV } = req.body;
    if (!maLop || !maGV) return res.status(400).json({ error: 'Thieu maLop hoac maGV' });
    const result = await phanCongGV(maLop, maGV);
    // 200=OK, 409=Conflict (trùng lịch)
    res.status(result.success ? 200 : 409).json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/lich/tao-lop
router.post('/tao-lop', async (req, res) => {
  try {
    const result = await taoLopHocPhan(req.body);
    res.status(result.success ? 201 : 409).json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/lich/gv/:maGV?hocKy=20241
router.get('/gv/:maGV', async (req, res) => {
  try {
    const result = await getLichDayGV(req.params.maGV, req.query.hocKy);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/lich/tai-giang-day?hocKy=20241
router.get('/tai-giang-day', async (req, res) => {
  try {
    if (!req.query.hocKy) return res.status(400).json({ error: 'Thieu hocKy' });
    const result = await thongKeTaiGiangDay(req.query.hocKy);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
```

## 13.5. SQL demo trong pgAdmin

```sql
-- Xem tất cả cặp GV trùng lịch toàn trường (qua FDW tại Site A)
SELECT a.MaGV, gv.HoTen,
       a.MaLop AS LopA, a.MaCoSo AS CoSoA,
       b.MaLop AS LopB, b.MaCoSo AS CoSoB,
       a.ThuTrongTuan, a.TietBD, a.TietKT
FROM v_LopHocPhan_All a
JOIN v_LopHocPhan_All b ON a.MaGV = b.MaGV AND a.HocKy = b.HocKy
                        AND a.ThuTrongTuan = b.ThuTrongTuan
                        AND a.TietBD <= b.TietKT AND a.TietKT >= b.TietBD
                        AND a.MaLop < b.MaLop
JOIN v_GiangVien_All gv ON a.MaGV = gv.MaGV
WHERE a.MaGV IS NOT NULL
ORDER BY a.MaGV, a.ThuTrongTuan;
-- Kết quả trống = không có GV nào trùng lịch = hệ thống hoạt động đúng

-- Thống kê tải GV học kỳ 20241
SELECT gv.HoTen, gv.MaCoSo,
       COUNT(lhp.MaLop)                    AS SoLop,
       SUM(lhp.TietKT - lhp.TietBD + 1)   AS TongSoTiet,
       SUM(lhp.SoDaDangKy)                 AS TongSV
FROM v_LopHocPhan_All lhp
JOIN v_GiangVien_All gv ON lhp.MaGV = gv.MaGV
WHERE lhp.HocKy = '20241'
GROUP BY gv.MaGV, gv.HoTen, gv.MaCoSo
ORDER BY TongSoTiet DESC;
```

## 13.6. Nội dung viết vào báo cáo
- Mô tả nghiệp vụ phân lịch dạy (4 bước: tạo lớp → phân công → xem lịch → thống kê tải)
- Giải thích luồng phân công GV — nhấn mạnh bước kiểm tra qua FDW
- Bảng thống kê tải giảng dạy (kết quả truy vấn)
- Screenshot: UI phân công GV + cảnh báo trùng lịch (HTTP 409)

## 13.7. Checklist Phần 13
- [ ] `teachingScheduleService.js` — 4 hàm đầy đủ
- [ ] Thêm 4 route vào `routes/schedule.js`
- [ ] Đăng ký `routes/schedule.js` trong `app.js`
- [ ] Seed lớp học phần có đầy đủ ThuTrongTuan/TietBD/TietKT
- [ ] Seed 1–2 cặp lớp "cố tình trùng lịch GV" để test
- [ ] UI trang phân công GV (assign-gv.html)
- [ ] UI trang lịch dạy GV (gv-schedule.html) với lưới TKB
- [ ] Chạy SQL "cặp GV trùng lịch" → kết quả trống (chụp màn hình)
- [ ] Chạy SQL "thống kê tải GV" → bảng kết quả (chụp màn hình)

---

