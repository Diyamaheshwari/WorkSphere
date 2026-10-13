const axios = require('axios');

async function testApprovalFlow() {
  console.log('--- Testing WorkSphere Approval & Portal Workflow ---');
  const API = 'http://localhost:5000/api';

  try {
    // 1. New user registers
    const random = Date.now();
    const testEmail = `intern_${random}@example.com`;
    console.log(`1. Self-registering new employee: ${testEmail}...`);

    const regRes = await axios.post(`${API}/auth/register`, {
      name: 'Priya Sharma',
      email: testEmail,
      password: 'password123',
      department: 'Backend & Cloud Infrastructure',
      title: 'Backend Intern',
    });
    console.log('✓ Registered response isPending:', regRes.data.isPending);

    // 2. User attempts to login while pending
    console.log('2. Attempting to login while pending (expecting 403 with isPending)...');
    try {
      await axios.post(`${API}/auth/login`, {
        email: testEmail,
        password: 'password123',
      });
      console.error('❌ Failed: User was allowed to login while pending!');
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.isPending) {
        console.log('✓ Correctly blocked with pending status:', err.response.data.message);
      } else {
        console.error('Unexpected error:', err.response?.data);
      }
    }

    // 3. Manager logs in and views pending users
    console.log('3. Manager logs in to review pending users...');
    const mgrLogin = await axios.post(`${API}/auth/login`, {
      email: 'sarah@example.com',
      password: 'manager123',
    });
    const mgrToken = mgrLogin.data.token;

    const pendingRes = await axios.get(`${API}/users/pending`, {
      headers: { Authorization: `Bearer ${mgrToken}` },
    });
    console.log('✓ Total pending requests found by manager:', pendingRes.data.users.length);

    // 4. Admin logs in and approves the new user
    console.log('4. Admin logs in and approves Priya...');
    const adminLogin = await axios.post(`${API}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123',
    });
    const adminToken = adminLogin.data.token;

    const allPending = await axios.get(`${API}/users/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const priya = allPending.data.users.find((u) => u.email === testEmail);

    if (priya) {
      const approveRes = await axios.put(
        `${API}/users/${priya._id}/approve`,
        { role: 'user', department: 'Backend & Cloud Infrastructure', title: 'Backend Intern' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      console.log('✓ Approved user successfully:', approveRes.data.user.name, 'Status:', approveRes.data.user.status);
    }

    // 5. User logs in now that account is approved
    console.log('5. Priya attempts login after authorization...');
    const priyaLogin = await axios.post(`${API}/auth/login`, {
      email: testEmail,
      password: 'password123',
    });
    console.log('✓ Login successful! Token issued:', !!priyaLogin.data.token, 'Role:', priyaLogin.data.user.role);

    // 6. Test Priya fetching her personal dashboard
    const priyaDash = await axios.get(`${API}/dashboard/user`, {
      headers: { Authorization: `Bearer ${priyaLogin.data.token}` },
    });
    console.log('✓ Priya User Dashboard retrieved successfully. Stats:', priyaDash.data.stats);

    console.log('\n=============================================');
    console.log('WORKSPHERE APPROVAL & PORTAL WORKFLOW PASSED! 🎉');
    console.log('=============================================');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err.message, err.response?.data);
    process.exit(1);
  }
}

testApprovalFlow();
