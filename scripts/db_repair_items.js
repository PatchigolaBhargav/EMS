const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// load .env from backend
const dotenvPath = path.join(__dirname, '..', 'backend', '.env');
if (fs.existsSync(dotenvPath)) {
  const env = fs.readFileSync(dotenvPath, 'utf8');
  env.split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([^=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'event_management_db',
});

(async () => {
  try {
    const stamp = Date.now();
    const backupName = `registrations_backup_${stamp}`;
    console.log('Creating backup table', backupName);
    await pool.query(`CREATE TABLE ${backupName} AS TABLE registrations;`);

    // Find rows with string elements in items
    const q = `SELECT id, items FROM registrations
WHERE jsonb_typeof(items) = 'array'
  AND EXISTS (
    SELECT 1 FROM jsonb_array_elements(items) elem WHERE jsonb_typeof(elem) = 'string'
  );`;
    const res = await pool.query(q);
    console.log('Found', res.rowCount, 'rows needing repair.');

    for (const row of res.rows) {
      const id = row.id;
      let items = row.items;
      if (!Array.isArray(items)) {
        console.log('Skipping row (items not array):', id);
        continue;
      }
      const newItems = items.map(i => {
        if (typeof i === 'string') {
          try { return JSON.parse(i); } catch (e) {
            // try unescape common sequences
            let s = i.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            try { return JSON.parse(s); } catch (e2) { return i; }
          }
        }
        return i;
      });

      await pool.query('UPDATE registrations SET items = $1 WHERE id = $2', [JSON.stringify(newItems), id]);
      console.log('Repaired row', id, '->', JSON.stringify(newItems));
    }

    console.log('Repair complete. Verifying remaining problematic rows...');
    const check = await pool.query(q);
    console.log('Remaining problematic rows:', check.rowCount);

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Repair error:', err);
    process.exit(1);
  }
})();
