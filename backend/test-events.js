import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function run() {
  console.log('--- Starting Events/Registrations API Tests ---');

  const now = Date.now();
  const user = {
    username: `user_${now}`,
    email: `user_${now}@example.com`,
    password: 'password123',
  };

  // 1) Register + login
  await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  }).catch(() => {});

  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, password: user.password }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) throw new Error(`Login failed: ${loginData?.message || loginRes.status}`);
  const token = loginData.token;
  console.log('Login:', token ? '✅ PASS' : '❌ FAIL');

  // 2) Create event should fail for non-admin
  const createRes = await fetch(`${BASE_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: 'Test Event',
      description: 'Event created by test script',
      date: new Date().toISOString(),
      price: 0,
      image: '/placeholder.svg',
      featured: true,
    }),
  });
  console.log('Create event (non-admin) should 403:', createRes.status === 403 ? '✅ PASS' : `❌ FAIL (${createRes.status})`);

  // 3) List events
  const listRes = await fetch(`${BASE_URL}/events`);
  const listData = await listRes.json();
  console.log('List events:', listRes.ok && Array.isArray(listData.events) ? '✅ PASS' : '❌ FAIL');

  // 4) If there is at least one free event, register for it
  const free = (listData.events || []).find((e) => Number(e.price) === 0);
  if (!free) {
    console.log('Register free event: ⚠️ SKIP (no free events in DB)');
    return;
  }

  const regRes = await fetch(`${BASE_URL}/registrations/events/${free.id}/register`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const regData = await regRes.json();
  console.log('Register free event:', regRes.status === 201 || regRes.status === 200 ? '✅ PASS' : '❌ FAIL', regData);

  const myRegsRes = await fetch(`${BASE_URL}/registrations/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const myRegs = await myRegsRes.json();
  console.log('Get my registrations:', myRegsRes.ok ? '✅ PASS' : '❌ FAIL');
}

run().catch((e) => {
  console.error('Test failed:', e.message);
  process.exit(1);
});

