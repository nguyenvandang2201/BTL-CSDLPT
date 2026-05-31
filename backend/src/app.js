'use strict';
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/dangky',    require('./routes/registration'));
app.use('/api/hocphan',   require('./routes/courses'));
app.use('/api/thongke',   require('./routes/stats'));
app.use('/api/lich',      require('./routes/schedule'));
app.use('/api/admin',     require('./routes/admin'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Error handler ─────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = parseInt(process.env.PORT || '4000', 10);
app.listen(PORT, () => {
  console.log(`[backend] listening on port ${PORT}`);
  console.log(`[backend] sites: A=${process.env.SITE_A_HOST} B=${process.env.SITE_B_HOST} C=${process.env.SITE_C_HOST}`);
});

module.exports = app;
