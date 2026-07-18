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
    console.log('Connecting to', process.env.PGHOST, process.env.PGPORT, process.env.PGDATABASE);

    const q1 = `SELECT id, items FROM registrations
WHERE jsonb_typeof(items) = 'array'
  AND EXISTS (
    SELECT 1 FROM jsonb_array_elements(items) elem WHERE jsonb_typeof(elem) = 'string'
  );`;

    const q2 = `SELECT id, items::text as items_text FROM registrations WHERE items::text LIKE '%\\\\"%';`;

    const res1 = await pool.query(q1);
    console.log('Query 1 - rows with string elements in items:', res1.rowCount);
    res1.rows.forEach(r => console.log(r.id, JSON.stringify(r.items)));

    const res2 = await pool.query(q2);
    console.log('Query 2 - rows with escaped quotes in items text:', res2.rowCount);
    res2.rows.forEach(r => console.log(r.id, r.items_text));

    await pool.end();
  } catch (err) {
    console.error('Error running checks:', err.message || err);
    process.exit(1);
  }
})();
