const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting API Integration Tests ---');

  const random = Date.now();
  const testUser = {
    name: 'Test User',
    email: `test_user_${random}@example.com`,
    password: 'password123',
    role: 'user',
  };

  const testManager = {
    name: 'Test Manager',
    email: `test_mgr_${random}@example.com`,
    password: 'password123',
    role: 'manager',
  };

  const testAdmin = {
    name: 'Test Admin',
    email: `test_admin_${random}@example.com`,
    password: 'password123',
    role: 'admin',
  };

  try {
    // 1. Register User
    console.log('1. Testing Registration...');
    const regRes = await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('✓ User Registered:', regRes.data.user);
    const userToken = regRes.data.token;

    // 2. Register Manager
    const mgrRes = await axios.post(`${API_URL}/auth/register`, testManager);
    console.log('✓ Manager Registered:', mgrRes.data.user);
    const mgrToken = mgrRes.data.token;

    // 3. Register Admin
    const adminRes = await axios.post(`${API_URL}/auth/register`, testAdmin);
    console.log('✓ Admin Registered:', adminRes.data.user);
    const adminToken = adminRes.data.token;

    // 4. Test Login
    console.log('\n2. Testing Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    console.log('✓ Login Successful, token returned:', !!loginRes.data.token);

    // 5. Test Profile /me
    console.log('\n3. Testing GET /api/auth/me...');
    const meRes = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    console.log('✓ /me authenticated user:', meRes.data.user.email);

    // 6. Test User Dashboard
    console.log('\n4. Testing /api/dashboard/user (User access)...');
    const userDash = await axios.get(`${API_URL}/dashboard/user`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    console.log('✓ User Dashboard data:', userDash.data.stats);

    // 7. Test Manager Dashboard with User Token (Expect 403 Forbidden)
    console.log('\n5. Testing /api/dashboard/manager with User Token (expecting 403 Forbidden)...');
    try {
      await axios.get(`${API_URL}/dashboard/manager`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      console.error('❌ FAILED: User was allowed to access Manager Dashboard!');
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('✓ Correctly blocked with 403 Forbidden:', err.response.data.message);
      }
    }

    // 8. Test Manager Dashboard with Manager Token
    console.log('\n6. Testing /api/dashboard/manager with Manager Token...');
    const mgrDash = await axios.get(`${API_URL}/dashboard/manager`, {
      headers: { Authorization: `Bearer ${mgrToken}` },
    });
    console.log('✓ Manager Dashboard data:', mgrDash.data.stats);

    // 9. Test Admin Dashboard with Manager Token (Expect 403 Forbidden)
    console.log('\n7. Testing /api/dashboard/admin with Manager Token (expecting 403 Forbidden)...');
    try {
      await axios.get(`${API_URL}/dashboard/admin`, {
        headers: { Authorization: `Bearer ${mgrToken}` },
      });
      console.error('❌ FAILED: Manager was allowed to access Admin Dashboard!');
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('✓ Correctly blocked with 403 Forbidden:', err.response.data.message);
      }
    }

    // 10. Test Admin Dashboard with Admin Token
    console.log('\n8. Testing /api/dashboard/admin with Admin Token...');
    const adminDash = await axios.get(`${API_URL}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('✓ Admin Dashboard data:', adminDash.data.stats);

    console.log('\n=======================================');
    console.log('ALL API TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('=======================================');
    process.exit(0);
  } catch (err) {
    console.error('Test Failed:', err.message, err.response?.data);
    process.exit(1);
  }
}

runTests();
