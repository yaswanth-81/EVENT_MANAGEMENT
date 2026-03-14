import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting Auth API Tests ---');
  
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'password123'
  };

  try {
    // 1. Check Health
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log('Health Check:', healthRes.status === 200 ? '✅ PASS' : '❌ FAIL', healthData);

    // 2. Register
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const registerData = await registerRes.json();
    console.log('Register Check:', registerRes.status === 201 ? '✅ PASS' : '❌ FAIL', registerData);

    // 3. Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    const loginData = await loginRes.json();
    console.log('Login Check:', loginRes.status === 200 && loginData.token ? '✅ PASS' : '❌ FAIL');
    if (loginData.token) {
        console.log('JWT Token successfully received.');
    } else {
        console.log('Response:', loginData);
    }

  } catch (error) {
    console.error('Test execution failed:', error.message);
    console.log('Make sure your backend server is running (node server.js)');
  }
}

runTests();
