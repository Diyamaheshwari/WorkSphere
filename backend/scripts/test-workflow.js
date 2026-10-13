const axios = require('axios');

async function testWorkspaceWorkflow() {
  console.log('--- Testing Complete Workspace Workflow ---');
  const API = 'http://localhost:5000/api';

  try {
    // 1. Login as Manager
    console.log('1. Logging in as Manager...');
    const mgrLogin = await axios.post(`${API}/auth/login`, {
      email: 'manager@example.com',
      password: 'manager123',
    });
    const mgrToken = mgrLogin.data.token;
    console.log('✓ Manager logged in successfully.');

    // 2. Manager creates a project
    console.log('2. Manager creates a new project...');
    const projRes = await axios.post(
      `${API}/projects`,
      {
        title: 'Cloud Infrastructure Migration',
        description: 'Migrating legacy monolith to containerized microservices.',
        deadline: new Date(Date.now() + 10 * 86400000),
      },
      { headers: { Authorization: `Bearer ${mgrToken}` } }
    );
    const projectId = projRes.data.project._id;
    console.log('✓ Project created:', projRes.data.project.title);

    // 3. Manager assigns task to user
    console.log('3. Manager creates and assigns a task...');
    const userAccount = await axios.get(`${API}/users`, {
      headers: { Authorization: `Bearer ${mgrToken}` },
    });
    const alexUser = userAccount.data.users.find((u) => u.email === 'user@example.com');

    const taskRes = await axios.post(
      `${API}/tasks`,
      {
        title: 'Configure Kubernetes Cluster & Ingress',
        description: 'Setup Helm charts and SSL certificates.',
        project: projectId,
        assignedTo: alexUser._id,
        priority: 'high',
        dueDate: new Date(Date.now() + 3 * 86400000),
      },
      { headers: { Authorization: `Bearer ${mgrToken}` } }
    );
    const taskId = taskRes.data.task._id;
    console.log('✓ Task created and assigned:', taskRes.data.task.title);

    // 4. Login as User
    console.log('4. Logging in as User...');
    const userLogin = await axios.post(`${API}/auth/login`, {
      email: 'user@example.com',
      password: 'user123',
    });
    const userToken = userLogin.data.token;

    // 5. User moves task to in_progress (Simulating Kanban drag and drop)
    console.log('5. User moves task to in_progress (Kanban drag-and-drop)...');
    const updateTaskRes = await axios.put(
      `${API}/tasks/${taskId}`,
      { status: 'in_progress' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    console.log('✓ Task status updated to:', updateTaskRes.data.task.status);

    // 6. User adds comment
    console.log('6. User adds a comment to the task...');
    const commentRes = await axios.post(
      `${API}/tasks/${taskId}/comments`,
      { text: 'Terraform scripts tested; initiating ingress deployment.' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    console.log('✓ Comment posted successfully. Total comments:', commentRes.data.comments.length);

    // 7. Login as Admin
    console.log('7. Logging in as Admin...');
    const adminLogin = await axios.post(`${API}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123',
    });
    const adminToken = adminLogin.data.token;

    // 8. Admin promotes David to Manager
    const davidUser = userAccount.data.users.find((u) => u.email === 'david@example.com');
    if (davidUser) {
      console.log('8. Admin updates David role to manager...');
      const roleRes = await axios.put(
        `${API}/users/${davidUser._id}/role`,
        { role: 'manager' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      console.log('✓ Role updated:', roleRes.data.user.role);
    }

    // 9. Fetch Activity Timeline
    console.log('9. Fetching activity timeline logs...');
    const actRes = await axios.get(`${API}/activities?limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('✓ Recent activity timeline logs:');
    actRes.data.activities.forEach((a, i) => console.log(`   ${i + 1}. [${a.action}] ${a.details}`));

    console.log('\n=============================================');
    console.log('ALL WORKSPACE REAL-TIME OPERATIONS SUCCEEDED! 🎉');
    console.log('=============================================');
    process.exit(0);
  } catch (err) {
    console.error('Workflow test failed:', err.message, err.response?.data);
    process.exit(1);
  }
}

testWorkspaceWorkflow();
