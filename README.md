# Hệ thống Đăng ký Học phần Đa cơ sở

**Môn:** Cơ sở dữ liệu phân tán — Đề tài 3  
**Kiến trúc:** 3 PostgreSQL site + Node.js backend + HTML/JS frontend + postgres_fdw

---

## Yêu cầu môi trường

- Docker Desktop (>= 24)
- Docker Compose (>= 2)
- Node.js >= 20 (chỉ cần nếu chạy ngoài Docker)

---

## Khởi động nhanh

```bash
# 1. Build và khởi động toàn bộ hệ thống
docker-compose up -d --build

# 2. Chờ các container healthy (~10 giây), sau đó khởi tạo DB
docker exec -i site_a psql -U postgres -d campus < db/schema.sql
docker exec -i site_b psql -U postgres -d campus < db/schema.sql
docker exec -i site_c psql -U postgres -d campus < db/schema.sql

docker exec -i site_a psql -U postgres -d campus < db/seed_common.sql
docker exec -i site_b psql -U postgres -d campus < db/seed_common.sql
docker exec -i site_c psql -U postgres -d campus < db/seed_common.sql

docker exec -i site_a psql -U postgres -d campus < db/seed_site_a.sql
docker exec -i site_b psql -U postgres -d campus < db/seed_site_b.sql
docker exec -i site_c psql -U postgres -d campus < db/seed_site_c.sql

docker exec -i site_a psql -U postgres -d campus < db/fdw_setup.sql

# 3. Mở giao diện
# Frontend: http://localhost:3000
# API:      http://localhost:4000/api
```

---

## Script khởi tạo 1 lệnh (PowerShell)

```powershell
docker-compose up -d --build
Start-Sleep -Seconds 15

foreach ($site in @('a','b','c')) {
    Get-Content db/schema.sql     | docker exec -i "site_$site" psql -U postgres -d campus
    Get-Content db/seed_common.sql | docker exec -i "site_$site" psql -U postgres -d campus
    Get-Content "db/seed_site_$site.sql" | docker exec -i "site_$site" psql -U postgres -d campus
}
Get-Content db/fdw_setup.sql | docker exec -i site_a psql -U postgres -d campus
```

---

## Cổng dịch vụ

| Dịch vụ | Cổng | Ghi chú |
|---------|------|---------|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 4000 | http://localhost:4000/api |
| Site A (Cơ sở 1) | 5433 | PostgreSQL |
| Site B (Cơ sở 2) | 5434 | PostgreSQL |
| Site C (Cơ sở 3) | 5435 | PostgreSQL |

---

## Demo đồng thời

```bash
# Test 30 SV đăng ký cùng lúc (có khóa)
curl -X POST http://localhost:4000/api/test/concurrent \
  -H "Content-Type: application/json" \
  -d '{"maLop":"L_B_001","soLuong":30,"useLock":true}'

# Test không có khóa (race condition)
curl -X POST http://localhost:4000/api/test/concurrent \
  -H "Content-Type: application/json" \
  -d '{"maLop":"L_B_001","soLuong":30,"useLock":false}'
```

---

## Cấu trúc dự án

```
├── docker-compose.yml
├── db/
│   ├── schema.sql            — lược đồ toàn cục
│   ├── seed_common.sql       — dữ liệu dùng chung (3 site)
│   ├── seed_site_a/b/c.sql   — dữ liệu cục bộ từng site
│   ├── fdw_setup.sql         — cấu hình postgres_fdw tại Site A
│   └── distributed_queries.sql — 6 truy vấn phân tán demo
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── db.js
│       ├── services/
│       │   ├── registrationService.js
│       │   ├── scheduleConflictService.js
│       │   ├── teachingScheduleService.js
│       │   ├── queryService.js
│       │   └── syncService.js
│       ├── routes/
│       │   ├── registration.js
│       │   ├── courses.js
│       │   ├── stats.js
│       │   ├── schedule.js
│       │   └── admin.js
│       └── concurrency_test.js
├── frontend/
│   ├── index.html
│   ├── pages/
│   │   ├── login.html
│   │   ├── courses.html
│   │   ├── my-registrations.html
│   │   ├── my-schedule.html
│   │   ├── gv-schedule.html
│   │   ├── assign-gv.html
│   │   ├── stats.html
│   │   └── log.html
│   ├── js/
│   │   ├── api.js
│   │   ├── courses.js
│   │   ├── registration.js
│   │   ├── schedule.js
│   │   └── stats.js
│   └── css/style.css
└── docs/
    └── ERD.png
```

---

## Kiến trúc phân tán

```
                   ┌─────────────────────────┐
                   │   Frontend (Web UI)     │
                   │   HTML/JS — port 3000   │
                   └───────────┬─────────────┘
                               │ REST API
                   ┌───────────▼──────────────┐
                   │   Backend / Coordinator  │
                   │   Node.js — port 4000    │
                   └───┬──────────┬───────────┘
           ┌───────────┘          │           └───────────────┐
  ┌────────▼────────┐  ┌──────────▼──────┐      ┌────────────▼────┐
  │ Site A — :5433  │  │ Site B — :5434  │      │ Site C — :5435  │
  │ PostgreSQL 16   │  │ PostgreSQL 16   │      │ PostgreSQL 16   │
  │ (coordinator)   │  │                 │      │                 │
  └─────────────────┘  └─────────────────┘      └─────────────────┘
       ▲  postgres_fdw liên kết 3 site (truy vấn phân tán thật)  ▲
       └──────────────────────────────────────────────────────────┘
```
