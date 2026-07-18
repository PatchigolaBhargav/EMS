const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '12345',
  database: 'event_management_db',
});

(async () => {
  try {
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
    console.log('TABLES:', tables.rows);
    const userCount = await pool.query("SELECT COUNT(*)::int AS count FROM users");
    console.log('USER_COUNT:', userCount.rows);
    const regCount = await pool.query("SELECT COUNT(*)::int AS count FROM registrations");
    console.log('REGISTRATION_COUNT:', regCount.rows);
  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await pool.end();
  }
})();
