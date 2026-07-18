const http = require('http');

const data = JSON.stringify({
  id: 'TEST-1',
  userName: 'Tester',
  userEmail: 'test@example.com',
  category: 'Test',
  event: 'Event',
  bookingDate: '2026-06-20',
  totalBill: '₹100',
  amount: '₹100',
  paymentMethod: 'UPI',
  status: 'Pending',
  items: []
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/registrations',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => (body += chunk));
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
  process.exit(1);
});

req.write(data);
req.end();
