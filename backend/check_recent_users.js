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
    const result = await pool.query('SELECT email, created_at FROM users ORDER BY created_at DESC LIMIT 5');
    console.log('RECENT_USERS:');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await pool.end();
  }
})();
