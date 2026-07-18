const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 5000;

const useFakeDb = process.env.SKIP_DB === 'true';
let pool;
const fakeDb = { users: [], registrations: [] };

const emailTransporter = (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS)
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : null;

if (!useFakeDb) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
  });
  console.log('Backend using Postgres DB at', process.env.PGHOST + ':' + process.env.PGPORT, 'database', process.env.PGDATABASE);
} else {
  pool = null;
  console.warn('Backend using in-memory SKIP_DB fallback. Data will NOT persist to Postgres.');
}

const sendMail = async ({ to, subject, text, html }) => {
  if (!emailTransporter) {
    console.warn('Email transporter not configured; skipping email to', to);
    return false;
  }
  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
};

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running. Use /api endpoints for requests.');
});

const runQuery = async (text, params) => {
  if (useFakeDb) {
    const t = String(text).trim().toLowerCase();
    if (t.startsWith('create table')) return [];

    if (t.startsWith('select * from users where lower(email)')) {
      const email = params[0];
      const found = fakeDb.users.find(u => u.email === email);
      return found ? [found] : [];
    }

    if (t.startsWith('insert into users')) {
      const [fullname, email, phone, password] = params;
      const newUser = { id: fakeDb.users.length + 1, fullname, email, phone, password, created_at: new Date().toISOString() };
      fakeDb.users.push(newUser);
      return [];
    }

    if (t.startsWith('select * from registrations')) {
      if (t.includes('where lower(user_email) = $1 and status = $2')) {
        const [userEmail, status] = params;
        return fakeDb.registrations.filter(r => r.user_email === userEmail && r.status === status);
      }
      if (t.includes('where lower(user_email) = $1')) {
        const [userEmail] = params;
        return fakeDb.registrations.filter(r => r.user_email === userEmail);
      }
      if (t.includes('where status = $1')) {
        const [status] = params;
        return fakeDb.registrations.filter(r => r.status === status);
      }
      return fakeDb.registrations;
    }

    if (t.startsWith('insert into registrations')) {
      const [id, user_name, user_email, category, event, booking_date, total_bill, amount, payment_method, status, items] = params;
      const reg = { id, user_name, user_email, category, event, booking_date, total_bill, amount, payment_method, status, items, created_at: new Date().toISOString() };
      fakeDb.registrations.push(reg);
      return [];
    }

    if (t.startsWith('select * from registrations where id = $1')) {
      const id = params[0];
      return fakeDb.registrations.filter(r => r.id === id);
    }

    if (t.startsWith('delete from registrations')) {
      const id = params[0];
      const idx = fakeDb.registrations.findIndex(r => r.id === id);
      if (idx === -1) return [];
      const removed = fakeDb.registrations.splice(idx, 1);
      return [{ id: removed[0].id }];
    }

    if (t.startsWith('update registrations set')) {
      const id = params[10] || params[params.length - 1];
      const reg = fakeDb.registrations.find(r => r.id === id);
      if (reg) {
        Object.assign(reg, {
          user_name: params[0],
          user_email: params[1],
          category: params[2],
          event: params[3],
          booking_date: params[4],
          total_bill: params[5],
          amount: params[6],
          payment_method: params[7],
          status: params[8],
          items: params[9],
        });
      }
      return [];
    }

    return [];
  }

  const result = await pool.query(text, params);
  return result.rows;
};

const ensureTables = async () => {
  await runQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      fullname TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      password TEXT NOT NULL,
      reset_token TEXT,
      reset_expires TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await runQuery(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;
  `);

  await runQuery(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMPTZ;
  `);

  await runQuery(`
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
};

const findUser = async (email) => {
  const normalized = email.trim().toLowerCase();
  const rows = await runQuery('SELECT * FROM users WHERE lower(email) = $1', [normalized]);
  return rows[0] || null;
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/debug', async (req, res) => {
  try {
    const status = {
      useFakeDb,
      pgHost: process.env.PGHOST,
      pgPort: process.env.PGPORT,
      pgDatabase: process.env.PGDATABASE,
      port,
      nodeEnv: process.env.NODE_ENV || 'development',
    };

    if (useFakeDb) {
      status.userCount = fakeDb.users.length;
      status.registrationCount = fakeDb.registrations.length;
      status.message = 'Running in SKIP_DB in-memory mode. Data is not persisted to Postgres.';
    } else {
      try {
        const userCountRes = await runQuery('SELECT COUNT(*)::int AS count FROM users', []);
        const registrationCountRes = await runQuery('SELECT COUNT(*)::int AS count FROM registrations', []);
        status.userCount = userCountRes[0]?.count ?? 0;
        status.registrationCount = registrationCountRes[0]?.count ?? 0;
        status.message = 'Connected to Postgres.';
      } catch (error) {
        status.message = 'Failed to query Postgres. See error details.';
        status.error = error.message;
      }
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Debug check failed.', error: error.message });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const { fullname, email, phone, password } = req.body || {};
    if (!fullname || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'fullname, email, phone, and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await findUser(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'This email is already registered.' });
    }

    await runQuery(
      'INSERT INTO users (fullname, email, phone, password) VALUES ($1, $2, $3, $4)',
      [fullname, normalizedEmail, phone, password]
    );

    await sendMail({
      to: normalizedEmail,
      subject: 'EventHub registration successful',
      text: `Hello ${fullname},\n\nThank you for registering at EventHub. Your account is now active.\n\nIf you have any questions, reply to this email.\n\nBest regards,\nEventHub Team`,
      html: `<p>Hello <strong>${fullname}</strong>,</p><p>Thank you for registering at <strong>EventHub</strong>. Your account is now active.</p><p>If you need help, reply to this email.</p><p>Best regards,<br/>EventHub Team</p>`,
    });

    res.json({ success: true, message: 'User registered successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Signup failed.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === 'admin@gmail.com' && password === 'Admin123') {
      return res.json({ success: true, user: { fullname: 'System Admin', email: normalizedEmail, role: 'admin' } });
    }

    if (normalizedEmail === 'patchigollabhargav@gmail.com' && password === 'Bhargav@2005') {
      return res.json({ success: true, user: { fullname: 'Bhargav', email: normalizedEmail, role: 'user' } });
    }

    const found = await findUser(normalizedEmail);
    if (!found || found.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    res.json({ success: true, user: { ...found, role: 'user' } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const found = await findUser(normalizedEmail);

    if (!found && normalizedEmail !== 'admin@gmail.com' && normalizedEmail !== 'patchigollabhargav@gmail.com') {
      return res.status(404).json({ success: false, message: 'Email not found.' });
    }

    const resetToken = Math.random().toString(36).slice(2, 12).toUpperCase();
    const resetExpires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

    if (found) {
      await runQuery(
        'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE lower(email) = $3',
        [resetToken, resetExpires.toISOString(), normalizedEmail]
      );
    }

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

    await sendMail({
      to: normalizedEmail,
      subject: 'EventHub password reset request',
      text: `You requested a password reset. Click this link to change your password:\n${resetLink}\n\nIf you did not request this, ignore this message.`,
      html: `<p>You requested a password reset.</p><p>Click this link to change your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, ignore this message.</p>`,
    });

    res.json({ success: true, message: 'Password reset instructions sent to your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Password recovery failed.' });
  }
});

app.post('/api/change-password', async (req, res) => {
  try {
    const { email, newPassword, token } = req.body || {};
    if (!email || !newPassword || !token) {
      return res.status(400).json({ success: false, message: 'Email, token, and newPassword are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const found = await findUser(normalizedEmail);

    if (!found) {
      return res.status(404).json({ success: false, message: 'Email not found.' });
    }

    const rows = await runQuery('SELECT reset_token, reset_expires FROM users WHERE lower(email) = $1', [normalizedEmail]);
    const row = rows[0];
    if (!row || row.reset_token !== token || !row.reset_expires || new Date(row.reset_expires) < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    await runQuery('UPDATE users SET password = $1, reset_token = NULL, reset_expires = NULL WHERE lower(email) = $2', [newPassword, normalizedEmail]);
    await sendMail({
      to: normalizedEmail,
      subject: 'Your EventHub password has been changed',
      text: `Hello,\n\nYour password has been successfully updated. If you did not make this change, contact support immediately.`,
      html: `<p>Hello,</p><p>Your password has been successfully updated.</p><p>If you did not make this change, contact support immediately.</p>`,
    });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Password change failed.' });
  }
});

app.get('/api/registrations', async (req, res) => {
  try {
    const { userEmail, status } = req.query;
    let queryText = 'SELECT * FROM registrations';
    const params = [];

    if (userEmail && status) {
      queryText += ' WHERE lower(user_email) = $1 AND status = $2';
      params.push(userEmail.trim().toLowerCase(), status);
    } else if (userEmail) {
      queryText += ' WHERE lower(user_email) = $1';
      params.push(userEmail.trim().toLowerCase());
    } else if (status) {
      queryText += ' WHERE status = $1';
      params.push(status);
    }

    const rows = await runQuery(queryText, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to load registrations.' });
  }
});

app.post('/api/registrations', async (req, res) => {
  try {
    const registration = req.body;
    if (!registration || !registration.userEmail || !registration.id) {
      return res.status(400).json({ success: false, message: 'Registration id and userEmail are required.' });
    }

    // Normalize items: Accept array of objects or array of JSON strings.
    const safeParse = (val) => {
      try {
        return JSON.parse(val);
      } catch (e) {
        return val;
      }
    };

    let itemsValue = [];
    if (Array.isArray(registration.items)) {
      itemsValue = registration.items.map(i => (typeof i === 'string' ? safeParse(i) : i));
    } else if (registration.items) {
      // If items is a stringified JSON array, try parse it
      if (typeof registration.items === 'string') {
        try {
          const parsed = JSON.parse(registration.items);
          if (Array.isArray(parsed)) itemsValue = parsed;
          else itemsValue = [parsed];
        } catch (e) {
          itemsValue = [registration.items];
        }
      } else {
        itemsValue = [registration.items];
      }
    }

    console.log('Inserting registration with items:', itemsValue);
    console.log('itemsValue type:', typeof itemsValue, 'isArray:', Array.isArray(itemsValue));

    await runQuery(
      `INSERT INTO registrations (
        id, user_name, user_email, category, event, booking_date,
        total_bill, amount, payment_method, status, items
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        registration.id,
        registration.userName,
        registration.userEmail.trim().toLowerCase(),
        registration.category,
        registration.event,
        registration.bookingDate || null,
        registration.totalBill,
        registration.amount,
        registration.paymentMethod,
        registration.status,
        JSON.stringify(itemsValue)
      ]
    );

    res.json({ success: true, registration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to save registration.' });
  }
});

// Temporary test endpoint to create a sample registration (used by automated tests)
app.get('/api/test-register', async (req, res) => {
  try {
    const now = Date.now();
    const sample = {
      id: `AUTO-TEST-${now}`,
      userName: 'Automated Tester',
      userEmail: 'auto.test@example.com',
      category: 'Automation',
      event: 'Test Event',
      bookingDate: new Date().toISOString().slice(0,10),
      totalBill: '₹0',
      amount: '₹0',
      paymentMethod: 'None',
      status: 'Pending',
      items: []
    };

    await runQuery(
      `INSERT INTO registrations (
        id, user_name, user_email, category, event, booking_date,
        total_bill, amount, payment_method, status, items
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        sample.id,
        sample.userName,
        sample.userEmail,
        sample.category,
        sample.event,
        sample.bookingDate || null,
        sample.totalBill,
        sample.amount,
        sample.paymentMethod,
        sample.status,
        sample.items || []
      ]
    );

    res.json({ success: true, sample });
  } catch (error) {
    console.error('Test register error:', error);
    res.status(500).json({ success: false, message: 'Test registration failed.' });
  }
});

app.put('/api/registrations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const existingRows = await runQuery('SELECT * FROM registrations WHERE id = $1', [id]);
    if (!existingRows.length) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    const existing = existingRows[0];
    const updated = {
      ...existing,
      ...updates,
      items: updates.items !== undefined ? updates.items : existing.items,
    };

    await runQuery(
      `UPDATE registrations SET
         user_name = $1,
         user_email = $2,
         category = $3,
         event = $4,
         booking_date = $5,
         total_bill = $6,
         amount = $7,
         payment_method = $8,
         status = $9,
         items = $10
       WHERE id = $11`,
      [
        updated.user_name,
        updated.user_email,
        updated.category,
        updated.event,
        updated.booking_date,
        updated.total_bill,
        updated.amount,
        updated.payment_method,
        updated.status,
        updated.items,
        id
      ]
    );

    res.json({ success: true, registration: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update registration.' });
  }
});

app.delete('/api/registrations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await runQuery('DELETE FROM registrations WHERE id = $1 RETURNING id', [id]);
    if (!result.length) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }
    res.json({ success: true, message: 'Registration deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete registration.' });
  }
});

const start = async () => {
  try {
    await ensureTables();
    app.listen(port, () => {
      console.log(`Backend server listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

start();
