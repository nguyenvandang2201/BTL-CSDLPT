'use strict';
const express = require('express');
const router  = express.Router();
const {
  soSVTheoCoSo,
  hocPhanDongNhat,
  dangKyCheoCoso,
  tyLeLapDay,
  soLopTheoKhoaVaCoSo,
  lichDayGiangVien,
} = require('../services/queryService');

// Q1 — GET /api/thongke/sv-theo-coso
router.get('/sv-theo-coso', async (_req, res) => {
  try { res.json(await soSVTheoCoSo()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Q2 — GET /api/thongke/hocphan-dong-nhat
router.get('/hocphan-dong-nhat', async (_req, res) => {
  try { res.json(await hocPhanDongNhat()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Q3 — GET /api/thongke/dangky-cheo-coso
router.get('/dangky-cheo-coso', async (_req, res) => {
  try { res.json(await dangKyCheoCoso()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Q4 — GET /api/thongke/ty-le-lap-day
router.get('/ty-le-lap-day', async (_req, res) => {
  try { res.json(await tyLeLapDay()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Q5 — GET /api/thongke/lop-theo-khoa-coso
router.get('/lop-theo-khoa-coso', async (_req, res) => {
  try { res.json(await soLopTheoKhoaVaCoSo()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Q6 — GET /api/thongke/lich-day-gv?maGV=xxx&hocKy=20241
router.get('/lich-day-gv', async (req, res) => {
  try {
    const { maGV, hocKy } = req.query;
    res.json(await lichDayGiangVien(maGV || null, hocKy || null));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tổng hợp tất cả — GET /api/thongke/all?hocKy=20241
router.get('/all', async (req, res) => {
  try {
    const { hocKy } = req.query;
    const [q1, q2, q3, q4, q5, q6] = await Promise.all([
      soSVTheoCoSo(),
      hocPhanDongNhat(),
      dangKyCheoCoso(),
      tyLeLapDay(),
      soLopTheoKhoaVaCoSo(),
      lichDayGiangVien(null, hocKy || null),
    ]);
    res.json({ q1, q2, q3, q4, q5, q6 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
