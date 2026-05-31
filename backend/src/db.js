'use strict';
require('dotenv').config();
const { Pool } = require('pg');

function makePool(prefix) {
  return new Pool({
    host:     process.env[`${prefix}_HOST`]     || 'localhost',
    port:     parseInt(process.env[`${prefix}_PORT`] || '5432', 10),
    database: process.env[`${prefix}_DB`]       || 'campus',
    user:     process.env[`${prefix}_USER`]     || 'postgres',
    password: process.env[`${prefix}_PASSWORD`] || 'postgres',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

const pools = {
  A: makePool('SITE_A'),
  B: makePool('SITE_B'),
  C: makePool('SITE_C'),
};

// Site A đóng vai coordinator — có FDW views (v_DangKy_All, v_LopHocPhan_All, …)
const coordinator = pools.A;

function getPoolBySite(site) {
  const p = pools[site && site.toUpperCase()];
  if (!p) throw new Error(`Unknown site: ${site}`);
  return p;
}

module.exports = { pools, coordinator, getPoolBySite };
