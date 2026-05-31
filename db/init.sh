#!/bin/bash
# ============================================================
# Script khởi tạo DB — chạy sau khi docker-compose up -d
# Dùng trên Linux/Mac. Trên Windows dùng lệnh PowerShell trong README.md
# ============================================================
set -e

echo "==> Chờ các container sẵn sàng..."
sleep 10

echo "==> [1/5] Tạo schema trên 3 site..."
for SITE in a b c; do
  docker exec -i "site_$SITE" psql -U postgres -d campus < schema.sql
  echo "    site_$SITE: schema OK"
done

echo "==> [2/5] Seed dữ liệu dùng chung (CoSo, Khoa, HocPhan)..."
for SITE in a b c; do
  docker exec -i "site_$SITE" psql -U postgres -d campus < seed_common.sql
  echo "    site_$SITE: common seed OK"
done

echo "==> [3/5] Seed dữ liệu cục bộ từng site..."
docker exec -i site_a psql -U postgres -d campus < seed_site_a.sql
echo "    site_a: local seed OK"
docker exec -i site_b psql -U postgres -d campus < seed_site_b.sql
echo "    site_b: local seed OK"
docker exec -i site_c psql -U postgres -d campus < seed_site_c.sql
echo "    site_c: local seed OK"

echo "==> [4/5] Cấu hình FDW tại Site A..."
docker exec -i site_a psql -U postgres -d campus < fdw_setup.sql
echo "    FDW OK"

echo "==> [5/5] Kiểm tra kết nối FDW..."
docker exec -i site_a psql -U postgres -d campus \
  -c "SELECT site, COUNT(*) AS so_lop FROM v_LopHocPhan_All GROUP BY site ORDER BY site;"

echo ""
echo "==> KHỞI TẠO HOÀN TẤT!"
echo "    Frontend: http://localhost:3000"
echo "    API:      http://localhost:4000/api"
