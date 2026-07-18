(async () => {
  try {
    const base = 'http://localhost:5001';
    const now = Date.now();
    const email = `smoke.test.${now}@example.com`;
    const password = 'SmokePass123';

    const hdr = (body) => ({ method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });

    const show = (title, obj) => {
      console.log(`== ${title} ==`);
      console.log(JSON.stringify(obj, null, 2));
    };

    // 1) Signup
    const signupRes = await fetch(base + '/api/signup', hdr({ fullname: 'Smoke Tester', email, phone: '0000000000', password }));
    const signupJson = await signupRes.json().catch(()=>null);
    show('signup', { status: signupRes.status, body: signupJson });

    // 2) Login
    const loginRes = await fetch(base + '/api/login', hdr({ email, password }));
    const loginJson = await loginRes.json().catch(()=>null);
    show('login', { status: loginRes.status, body: loginJson });

    // 3) Create registration
    const regId = `SMOKE-${now}`;
    const registration = {
      id: regId,
      userName: 'Smoke Tester',
      userEmail: email,
      category: 'SmokeTest',
      event: 'Smoke Event',
      bookingDate: new Date().toISOString().slice(0,10),
      totalBill: '₹100',
      amount: '₹100',
      paymentMethod: 'Card',
      status: 'Pending',
      items: []
    };

    const createRes = await fetch(base + '/api/registrations', hdr(registration));
    const createJson = await createRes.json().catch(()=>null);
    show('create-registration', { status: createRes.status, body: createJson });

    // 4) Fetch registrations for user
    const fetchRes = await fetch(base + `/api/registrations?userEmail=${encodeURIComponent(email)}`);
    const fetchJson = await fetchRes.json().catch(()=>null);
    show('fetch-registrations', { status: fetchRes.status, body: fetchJson });

    // 5) Update registration
    const updateRes = await fetch(base + `/api/registrations/${regId}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ status: 'Confirmed' }) });
    const updateJson = await updateRes.json().catch(()=>null);
    show('update-registration', { status: updateRes.status, body: updateJson });

    // 6) Delete registration
    const deleteRes = await fetch(base + `/api/registrations/${regId}`, { method: 'DELETE' });
    const deleteJson = await deleteRes.json().catch(()=>null);
    show('delete-registration', { status: deleteRes.status, body: deleteJson });

    console.log('SMOKE_TEST_DONE');
  } catch (err) {
    console.error('SMOKE_ERROR', err && err.stack ? err.stack : String(err));
    process.exit(1);
  }
})();
