'use strict';
const express = require('express');
const router  = express.Router();
const { pools, getPoolBySite } = require('../db');
const { resyncTable } = require('../services/syncService');

// ── Nhật ký thao tác ─────────────────────────────────────────────────────────

// GET /api/admin/log?site=A&limit=100&hanhDong=DANG_KY
router.get('/log', async (req, res) => {
  try {
    const { site, hanhDong, maSV, maLop, limit = 100 } = req.query;
    const conditions = [];
    const params     = [];

    if (hanhDong) { params.push(hanhDong); conditions.push(`HanhDong=$${params.length}`); }
    if (maSV)     { params.push(maSV);     conditions.push(`MaSV=$${params.length}`); }
    if (maLop)    { params.push(maLop);    conditions.push(`MaLop=$${params.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    params.push(parseInt(limit, 10));
    const limitClause = `LIMIT $${params.length}`;

    // Đọc từ 1 site cụ thể hoặc gộp từ tất cả
    if (site) {
      const pool = getPoolBySite(site);
      const { rows } = await pool.query(
        `SELECT * FROM NhatKyThaoTac ${where} ORDER BY ThoiGian DESC ${limitClause}`,
        params
      );
      return res.json(rows);
    }

    // Gộp log từ cả 3 site
    const allRows = [];
    for (const [s, pool] of Object.entries(pools)) {
      try {
        const { rows } = await pool.query(
          `SELECT *, '${s}' AS site_nguon FROM NhatKyThaoTac ${where} ORDER BY ThoiGian DESC ${limitClause}`,
          params
        );
        allRows.push(...rows);
      } catch (_) {}
    }
    allRows.sort((a, b) => new Date(b.thoigian) - new Date(a.thoigian));
    res.json(allRows.slice(0, parseInt(limit, 10)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Đồng bộ dữ liệu catalog ──────────────────────────────────────────────────

// POST /api/admin/sync-catalog — Body: { table?, sourceSite? }
// Dùng để đồng bộ lại các bảng replicated (HocPhan, CoSo, Khoa, ChuongTrinhDaoTao)
router.post('/sync-catalog', async (req, res) => {
  try {
    const allowedTables = ['HocPhan', 'CoSo', 'Khoa', 'ChuongTrinhDaoTao'];
    const { table, sourceSite = 'A' } = req.body;

    const tables = table ? [table] : allowedTables;
    const invalid = tables.filter(t => !allowedTables.includes(t));
    if (invalid.length) return res.status(400).json({ error: `Bang khong hop le: ${invalid.join(', ')}` });

    const results = {};
    for (const t of tables) {
      try {
        await resyncTable(t, sourceSite);
        results[t] = 'ok';
      } catch (err) {
        results[t] = err.message;
      }
    }
    res.json({ done: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Kiểm tra trạng thái kết nối 3 site ───────────────────────────────────────

// GET /api/admin/health
router.get('/health', async (_req, res) => {
  try {
    const status = {};
    for (const [site, pool] of Object.entries(pools)) {
      try {
        const { rows } = await pool.query('SELECT NOW() AS ts, current_database() AS db');
        status[site] = { ok: true, ts: rows[0].ts, db: rows[0].db };
      } catch (err) {
        status[site] = { ok: false, error: err.message };
      }
    }
    const allOk = Object.values(status).every(s => s.ok);
    res.status(allOk ? 200 : 503).json({ allOk, sites: status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Demo deadlock ─────────────────────────────────────────────────────────────

// POST /api/admin/demo-deadlock — Body: { lopA?, lopB? }
// Tạo 2 transaction cố tình khóa ngược nhau → PostgreSQL sẽ abort 1 bên
router.post('/demo-deadlock', async (req, res) => {
  try {
    const { lopA = 'L_A_001', lopB = 'L_A_002' } = req.body;
    const pool = getPoolBySite('A');
    const [c1, c2] = await Promise.all([pool.connect(), pool.connect()]);
    const log = [];

    try {
      await c1.query('BEGIN');
      await c2.query('BEGIN');
      log.push('c1 BEGIN, c2 BEGIN');

      await c1.query(`SELECT * FROM LopHocPhan WHERE MaLop=$1 FOR UPDATE`, [lopA]);
      log.push(`c1 LOCK ${lopA}`);

      await c2.query(`SELECT * FROM LopHocPhan WHERE MaLop=$1 FOR UPDATE`, [lopB]);
      log.push(`c2 LOCK ${lopB}`);

      // c1 cố lock lopB (đang bị c2 giữ) và c2 cố lock lopA (đang bị c1 giữ)
      const [r1, r2] = await Promise.allSettled([
        c1.query(`SELECT * FROM LopHocPhan WHERE MaLop=$1 FOR UPDATE`, [lopB]),
        c2.query(`SELECT * FROM LopHocPhan WHERE MaLop=$1 FOR UPDATE`, [lopA]),
      ]);

      const deadlockVictim = r1.status === 'rejected' ? 'c1' : r2.status === 'rejected' ? 'c2' : 'none';
      log.push(`deadlock victim: ${deadlockVictim}`);
      log.push(`c1: ${r1.status}${r1.reason ? ' — ' + r1.reason.message : ''}`);
      log.push(`c2: ${r2.status}${r2.reason ? ' — ' + r2.reason.message : ''}`);

      res.json({ message: 'Demo deadlock hoan thanh', log });
    } finally {
      await c1.query('ROLLBACK').catch(() => {});
      await c2.query('ROLLBACK').catch(() => {});
      c1.release();
      c2.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
