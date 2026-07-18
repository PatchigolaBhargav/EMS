const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

(async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || undefined,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        fullname TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id TEXT PRIMARY KEY,
        user_name TEXT NOT NULL,
        user_email TEXT NOT NULL,
        category TEXT,
        event TEXT,
        booking_date DATE,
        total_bill TEXT,
        amount TEXT,
        payment_method TEXT,
        status TEXT,
        items JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const usersCount = await pool.query('SELECT COUNT(*)::int AS count FROM users');
    const regsCount = await pool.query('SELECT COUNT(*)::int AS count FROM registrations');

    console.log(JSON.stringify({ success: true, users: usersCount.rows[0].count, registrations: regsCount.rows[0].count }));
  } catch (err) {
    console.error(JSON.stringify({ success: false, error: err.message }));
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
