(async () => {
  try {
    const base = 'http://localhost:5001';
    const endpoints = ['/api/health', '/api/test-register', '/api/registrations'];
    for (const ep of endpoints) {
      const res = await fetch(base + ep);
      const json = await res.json();
      console.log(`== ${ep} ==`);
      console.log(JSON.stringify(json, null, 2));
    }
  } catch (err) {
    console.error('FETCH_ERROR', err && err.stack ? err.stack : String(err));
    process.exit(1);
  }
})();
