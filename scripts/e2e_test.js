const http = require('http');

const post = (path, data) => new Promise((resolve, reject) => {
  const d = JSON.stringify(data);
  const opts = {
    hostname: 'localhost',
    port: 5001,
    path,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(d) }
  };
  const req = http.request(opts, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => resolve({ status: res.statusCode, body }));
  });
  req.on('error', e => reject(e));
  req.write(d);
  req.end();
});

(async () => {
  try {
    console.log('1) Signup test');
    const email = `e2e.user${Date.now()}@test.local`;
    const signup = await post('/api/signup', { fullname: 'E2E User', email, phone: '9999999999', password: 'Test1234' });
    console.log('signup status', signup.status, signup.body);

    console.log('\n2) Login test');
    const login = await post('/api/login', { email, password: 'Test1234' });
    console.log('login status', login.status, login.body);

    console.log('\n3) Registration with object items');
    const reg1 = {
      id: 'E2E-OBJ-' + Date.now(),
      userName: 'E2E User',
      userEmail: email,
      category: 'E2E',
      event: 'Test Event',
      bookingDate: new Date().toISOString().slice(0,10),
      totalBill: '₹1000',
      amount: '₹1000',
      paymentMethod: 'UPI',
      status: 'Pending',
      items: [{ category: '🍳 BREAKFAST', name: 'Idli' }, { category: '🍱 LUNCH', name: 'Veg Biryani' }]
    };
    const r1 = await post('/api/registrations', reg1);
    console.log('reg1 status', r1.status, r1.body);

    console.log('\n4) Registration with stringified items');
    const reg2 = { ...reg1, id: 'E2E-STR-' + Date.now(), items: [JSON.stringify({ category: '🍳 BREAKFAST', name: 'Dosa' })] };
    const r2 = await post('/api/registrations', reg2);
    console.log('reg2 status', r2.status, r2.body);

    process.exit(0);
  } catch (err) {
    console.error('E2E error', err);
    process.exit(1);
  }
})();
