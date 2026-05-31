'use strict';
const express = require('express');
const router  = express.Router();
const { dangKy, huyDangKy, getDangKySV, demoDongThoi } = require('../services/registrationService');
const { coordinator } = require('../db');

// POST /api/dangky — Body: { maSV, maLop, useLock? }
router.post('/', async (req, res) => {
  try {
    const { maSV, maLop, useLock = true } = req.body;
    if (!maSV || !maLop) return res.status(400).json({ error: 'Thieu maSV hoac maLop' });

    const result = await dangKy(maSV, maLop, useLock);
    if (result.success) return res.status(201).json(result);

    const statusMap = {
      HET_CHO:          409,
      TRUNG_LICH:       409,
      DA_DANG_KY:       409,
      LOP_KHONG_TON_TAI: 404,
    };
    return res.status(statusMap[result.reason] || 400).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/dangky/:maDK — Query: ?maSV=xxx
router.delete('/:maDK', async (req, res) => {
  try {
    const { maDK } = req.params;
    const { maSV } = req.query;
    if (!maSV) return res.status(400).json({ error: 'Thieu maSV trong query string' });

    const result = await huyDangKy(parseInt(maDK, 10), maSV);
    if (result.success) return res.json(result);

    const statusMap = { DA_HUY_TRUOC: 409, KHONG_TIM_THAY: 404 };
    return res.status(statusMap[result.reason] || 400).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dangky/sv/:maSV — Danh sách đăng ký của SV
router.get('/sv/:maSV', async (req, res) => {
  try {
    const rows = await getDangKySV(req.params.maSV, { coordinator });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/dangky/demo-dongthoi — Body: { maLop, soLuong?, useLock? }
router.post('/demo-dongthoi', async (req, res) => {
  try {
    const { maLop, soLuong = 30, useLock = true } = req.body;
    if (!maLop) return res.status(400).json({ error: 'Thieu maLop' });

    const result = await demoDongThoi(maLop, parseInt(soLuong, 10), useLock);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
