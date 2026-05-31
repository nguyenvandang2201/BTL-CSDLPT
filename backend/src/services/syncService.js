'use strict';
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
      const ph  = vals.map((_, i) => `$${i + 1}`).join(', ');
      const upd = cols.slice(1).map(c => `${c} = EXCLUDED.${c}`).join(', ');
      await pools[site].query(
        `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${ph})
         ON CONFLICT (${cols[0]}) DO UPDATE SET ${upd}`,
        vals
      );
    }
  }
}

module.exports = { broadcastWrite, resyncTable };
