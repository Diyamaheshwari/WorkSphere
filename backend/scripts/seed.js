const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

dotenv.config();

const seedWorkSphere = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jwt_auth_db');
    console.log('Connected to MongoDB. Seeding WorkSphere Enterprise Workspace...');

    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Activity.deleteMany({}),
    ]);

    // 1. Create Admin
    const admin = await User.create({
      name: 'Ashish Tetarwal',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      department: 'Executive Leadership',
      title: 'VP of Engineering & Admin',
      status: 'active',
      isActive: true,
    });

    // 2. Create 4 Managers
    const managers = await User.create([
      {
        name: 'Sarah Jenkins',
        email: 'sarah@example.com',
        password: 'manager123',
        role: 'manager',
        department: 'Backend & Cloud Infrastructure',
        title: 'Backend Engineering Lead',
        status: 'active',
        isActive: true,
      },
      {
        name: 'Michael Chang',
        email: 'michael@example.com',
        password: 'manager123',
        role: 'manager',
        department: 'Product & Frontend Web',
        title: 'Frontend Product Lead',
        status: 'active',
        isActive: true,
      },
      {
        name: 'Elena Rostova',
        email: 'elena@example.com',
        password: 'manager123',
        role: 'manager',
        department: 'Product Design & UX',
        title: 'Head of User Experience',
        status: 'active',
        isActive: true,
      },
      {
        name: 'David Miller',
        email: 'david@example.com',
        password: 'manager123',
        role: 'manager',
        department: 'QA & Security Operations',
        title: 'QA & Security Lead',
        status: 'active',
        isActive: true,
      },
    ]);

    const [mgrBackend, mgrFrontend, mgrDesign, mgrQA] = managers;

    // 3. Create Team Members (4 to 5 per Manager)
    const backendMembers = await User.create([
      {
        name: 'Alex Rivera',
        email: 'user@example.com', // Primary demo user
        password: 'user123',
        role: 'user',
        department: 'Backend & Cloud Infrastructure',
        title: 'Senior Node.js Developer',
        manager: mgrBackend._id,
        status: 'active',
        isActive: true,
      },
      {
        name: 'Kavita Patel',
        email: 'kavita@example.com',
        password: 'user123',
        role: 'user',
        department: 'Backend & Cloud Infrastructure',
        title: 'Database Architect',
        manager: mgrBackend._id,
        status: 'active',
        isActive: true,
      },
      {
        name: 'Liam O’Connor',
        email: 'liam@example.com',
        password: 'user123',
        role: 'user',
        department: 'Backend & Cloud Infrastructure',
        title: 'DevOps & Kubernetes Engineer',
        manager: mgrBackend._id,
        status: 'active',
        isActive: true,
      },
      {
        name: 'Maya Lin',
        email: 'maya@example.com',
        password: 'user123',
        role: 'user',
        department: 'Backend & Cloud Infrastructure',
        title: 'API & Microservices Engineer',
        manager: mgrBackend._id,
        status: 'active',
        isActive: true,
      },
    ]);

    const frontendMembers = await User.create([
      {
        name: 'Johar Abbas',
        email: 'johar@example.com',
        password: 'user123',
        role: 'user',
        department: 'Product & Frontend Web',
        title: 'Senior React Developer',
        manager: mgrFrontend._id,
        status: 'active',
        isActive: true,
      },
      {
        name: 'Sophia Martinez',
        email: 'sophia@example.com',
        password: 'user123',
        role: 'user',
        department: 'Product & Frontend Web',
        title: 'Frontend UI Engineer',
        manager: mgrFrontend._id,
        status: 'active',
        isActive: true,
      },
      {
        name: 'Ethan Hunt',
        email: 'ethan@example.com',
        password: 'user123',
        role: 'user',
        department: 'Product & Frontend Web',
        title: 'Next.js & Performance Specialist',
        manager: mgrFrontend._id,
        status: 'active',
        isActive: true,
      },
      {
        name: 'Zoe Kravitz',
        email: 'zoe@example.com',
        password: 'user123',
        role: 'user',
        department: 'Product & Frontend Web',
        title: 'Design Systems Developer',
        manager: mgrFrontend._id,
        status: 'active',
        isActive: true,
      },
    ]);

    const designMembers = await User.create([
      {
        name: 'Andre Davis',
        email: 'andre@example.com',
        password: 'user123',
        role: 'user',
        department: 'Product Design & UX',
        title: 'Lead Product Designer',
        manager: mgrDesign._id,
        status: 'active',
        isActive: true,
      },
      {
        name: 'Chloe Bennett',
        email: 'chloe@example.com',
        password: 'user123',
        role: 'user',
        department: 'Product Design & UX',
        title: 'UX Researcher',
        manager: mgrDesign._id,
        status: 'active',
        isActive: true,
      },
      {
        name: 'Lucas Silva',
        email: 'lucas@example.com',
        password: 'user123',
        role: 'user',
        department: 'Product Design & UX',
        title: 'Design Systems & Motion Designer',
        manager: mgrDesign._id,
        status: 'active',
        isActive: true,
      },
      {
        name: 'Amara Walker',
        email: 'amara@example.com',
        password: 'user123',
        role: 'user',
        department: 'Product Design & UX',
        title: 'Visual & Brand Designer',
        manager: mgrDesign._id,
        status: 'active',
        isActive: true,
      },
    ]);

    const qaMembers = await User.create([
      {
        name: 'Ryan Gosling',
        email: 'ryan@example.com',
        password: 'user123',
        role: 'user',
        department: 'QA & Security Operations',
        title: 'Senior Automation QA Engineer',
        manager: mgrQA._id,
        status: 'active',
        isActive: true,
      },
      {
        name: 'Natalie Portman',
        email: 'natalie@example.com',
        password: 'user123',
        role: 'user',
        department: 'QA & Security Operations',
        title: 'Penetration Tester & AppSec Specialist',
        manager: mgrQA._id,
        status: 'active',
        isActive: true,
      },
      {
        name: 'Oscar Isaac',
        email: 'oscar@example.com',
        password: 'user123',
        role: 'user',
        department: 'QA & Security Operations',
        title: 'Performance & Load Testing Engineer',
        manager: mgrQA._id,
        status: 'active',
        isActive: true,
      },
      {
        name: 'Hannah Abbott',
        email: 'hannah@example.com',
        password: 'user123',
        role: 'user',
        department: 'QA & Security Operations',
        title: 'Manual & E2E Test Specialist',
        manager: mgrQA._id,
        status: 'active',
        isActive: true,
      },
    ]);

    // 4. Create 2 Pending Users (to demonstrate authorization approval workflow!)
    const pendingUsers = await User.create([
      {
        name: 'Jordan Belfort',
        email: 'pending@example.com',
        password: 'user123',
        role: 'user',
        department: 'Backend & Cloud Infrastructure',
        title: 'Junior Go/Rust Developer',
        manager: mgrBackend._id,
        status: 'pending',
        isActive: true,
      },
      {
        name: 'Rachel Green',
        email: 'rachel@example.com',
        password: 'user123',
        role: 'user',
        department: 'Product Design & UX',
        title: 'UI/UX Intern',
        manager: mgrDesign._id,
        status: 'pending',
        isActive: true,
      },
    ]);

    // 5. Create Projects
    const projects = await Project.create([
      {
        title: 'Payment Gateway & Stripe Webhooks',
        description: 'End-to-end tokenized payments, subscriptions, and invoice reconciliation.',
        department: 'Backend & Cloud Infrastructure',
        manager: mgrBackend._id,
        createdBy: mgrBackend._id,
        status: 'active',
        deadline: new Date(Date.now() + 5 * 86400000),
      },
      {
        title: 'WorkSphere Web Portal V2',
        description: 'Responsive SaaS dashboard with Tailwind CSS and Recharts analytics.',
        department: 'Product & Frontend Web',
        manager: mgrFrontend._id,
        createdBy: mgrFrontend._id,
        status: 'active',
        deadline: new Date(Date.now() + 12 * 86400000),
      },
      {
        title: 'Enterprise Design System & Tokenization',
        description: 'Unified typography, dark mode tokens, and accessible component library.',
        department: 'Product Design & UX',
        manager: mgrDesign._id,
        createdBy: mgrDesign._id,
        status: 'active',
        deadline: new Date(Date.now() + 8 * 86400000),
      },
      {
        title: 'Automated CI/CD Pipeline & SOC2 Security Audit',
        description: 'Vulnerability scanners, dynamic container testing, and compliance reports.',
        department: 'QA & Security Operations',
        manager: mgrQA._id,
        createdBy: mgrQA._id,
        status: 'active',
        deadline: new Date(Date.now() + 3 * 86400000),
      },
    ]);

    const [projPayment, projWeb, projDesign, projSec] = projects;

    // 6. Create Tasks across the 4 stages: todo, in_progress, review, completed
    // Matching Image 2 and Image 3 specifications
    const primaryUser = backendMembers[0]; // Alex Rivera (user@example.com)

    const tasks = await Task.create([
      // Primary User Tasks
      {
        title: 'Research User Pain Points',
        description: 'Gather insights from user interviews and quantitative surveys.',
        project: projWeb._id,
        assignedTo: primaryUser._id,
        createdBy: mgrBackend._id,
        manager: mgrBackend._id,
        status: 'todo',
        health: 'on_track',
        progress: 0,
        category: 'Planning',
        priority: 'medium',
        dueDate: new Date(Date.now() + 2 * 86400000),
      },
      {
        title: 'Define MVP Features',
        description: 'Align with stakeholders on core functionalities and scope.',
        project: projWeb._id,
        assignedTo: primaryUser._id,
        createdBy: mgrBackend._id,
        manager: mgrBackend._id,
        status: 'todo',
        health: 'on_track',
        progress: 0,
        category: 'Planning',
        priority: 'high',
        dueDate: new Date(Date.now() + 3 * 86400000),
      },
      {
        title: 'Create Wireframes for Dashboard',
        description: 'Focus on usability for data-heavy analytics interfaces.',
        project: projWeb._id,
        assignedTo: primaryUser._id,
        createdBy: mgrBackend._id,
        manager: mgrBackend._id,
        status: 'in_progress',
        health: 'at_risk',
        progress: 36,
        category: 'Design',
        priority: 'high',
        dueDate: new Date(Date.now() + 1 * 86400000),
      },
      {
        title: 'Backend API Development',
        description: 'Ensure endpoints are scalable, rate-limited, and secure.',
        project: projPayment._id,
        assignedTo: primaryUser._id,
        createdBy: mgrBackend._id,
        manager: mgrBackend._id,
        status: 'in_progress',
        health: 'on_track',
        progress: 36,
        category: 'Development',
        priority: 'medium',
        dueDate: new Date(Date.now() + 4 * 86400000),
      },
      {
        title: 'Code Review for Authentication Module',
        description: 'Inspect JWT rotation, refresh cookie logic, and bcrypt salts.',
        project: projPayment._id,
        assignedTo: primaryUser._id,
        createdBy: mgrBackend._id,
        manager: mgrBackend._id,
        status: 'review',
        health: 'on_track',
        progress: 90,
        category: 'Testing',
        priority: 'high',
        dueDate: new Date(Date.now() + 1 * 86400000),
      },
      {
        title: 'Set Up Continuous Integration (CI) Pipeline',
        description: 'Configure automated unit testing and linter checks on pull requests.',
        project: projSec._id,
        assignedTo: primaryUser._id,
        createdBy: mgrBackend._id,
        manager: mgrBackend._id,
        status: 'completed',
        health: 'on_track',
        progress: 100,
        category: 'Development',
        priority: 'high',
        completedAt: new Date(Date.now() - 86400000),
        dueDate: new Date(Date.now() - 86400000),
      },
      {
        title: 'Create Project Roadmap & Milestones',
        description: 'Deliver roadmap to stakeholders and receive sign-off for next phase.',
        project: projPayment._id,
        assignedTo: primaryUser._id,
        createdBy: mgrBackend._id,
        manager: mgrBackend._id,
        status: 'completed',
        health: 'on_track',
        progress: 100,
        category: 'Planning',
        priority: 'medium',
        completedAt: new Date(Date.now() - 2 * 86400000),
        dueDate: new Date(Date.now() - 2 * 86400000),
      },

      // Other Team Members Tasks
      {
        title: 'Usability Testing Feedback Analysis',
        description: 'Incorporate user testing findings from the first round of prototypes.',
        project: projDesign._id,
        assignedTo: designMembers[0]._id, // Andre Davis
        createdBy: mgrDesign._id,
        manager: mgrDesign._id,
        status: 'review',
        health: 'at_risk',
        progress: 80,
        category: 'Design',
        priority: 'high',
        dueDate: new Date(Date.now() + 2 * 86400000),
      },
      {
        title: 'Finalise Design System Guidelines',
        description: 'Review color tokens, contrast accessibility, and component states.',
        project: projDesign._id,
        assignedTo: designMembers[1]._id,
        createdBy: mgrDesign._id,
        manager: mgrDesign._id,
        status: 'review',
        health: 'on_track',
        progress: 72,
        category: 'Design',
        priority: 'medium',
        dueDate: new Date(Date.now() + 3 * 86400000),
      },
      {
        title: 'Draft Marketing Content for Product Launch',
        description: 'Align technical copy with feature release schedule.',
        project: projWeb._id,
        assignedTo: frontendMembers[0]._id, // Johar Abbas
        createdBy: mgrFrontend._id,
        manager: mgrFrontend._id,
        status: 'in_progress',
        health: 'behind',
        progress: 13,
        category: 'Documentation',
        priority: 'medium',
        dueDate: new Date(Date.now() - 86400000), // Overdue!
      },
      {
        title: 'Automated E2E Cypress Suite',
        description: 'Test checkout and user registration flows end-to-end.',
        project: projSec._id,
        assignedTo: qaMembers[0]._id,
        createdBy: mgrQA._id,
        manager: mgrQA._id,
        status: 'in_progress',
        health: 'on_track',
        progress: 45,
        category: 'Testing',
        priority: 'high',
        dueDate: new Date(Date.now() + 4 * 86400000),
      },
    ]);

    // 7. Initial Activities
    await Activity.create([
      {
        user: admin._id,
        action: 'COMPANY_INIT',
        details: 'Admin configured WorkSphere Enterprise Workspace with 4 core divisions',
      },
      {
        user: mgrBackend._id,
        action: 'PROJECT_CREATED',
        details: 'Sarah Jenkins created project "Payment Gateway & Stripe Webhooks"',
        project: projPayment._id,
      },
      {
        user: mgrBackend._id,
        action: 'TASK_CREATED',
        details: 'Sarah Jenkins assigned task "Backend API Development" to Alex Rivera',
        task: tasks[3]._id,
      },
      {
        user: primaryUser._id,
        action: 'TASK_STATUS_UPDATED',
        details: 'Alex Rivera completed "Set Up Continuous Integration (CI) Pipeline"',
        task: tasks[5]._id,
      },
      {
        user: pendingUsers[0]._id,
        action: 'USER_REGISTERED',
        details: 'Jordan Belfort registered for Backend Team (Pending Approval)',
      },
    ]);

    console.log('===========================================================');
    console.log('✓ WorkSphere Workspace Seeded Successfully with Enterprise Data!');
    console.log('===========================================================');
    console.log('1. Admin:');
    console.log('   - Ashish Tetarwal:    admin@example.com    / admin123');
    console.log('2. 4 Division Managers:');
    console.log('   - Sarah Jenkins:      sarah@example.com    / manager123 (Backend Lead)');
    console.log('   - Michael Chang:      michael@example.com  / manager123 (Frontend Lead)');
    console.log('   - Elena Rostova:      elena@example.com    / manager123 (Design Lead)');
    console.log('   - David Miller:       david@example.com    / manager123 (QA & Sec Lead)');
    console.log('3. Primary Demo User:');
    console.log('   - Alex Rivera:        user@example.com     / user123 (Backend Team)');
    console.log('4. Pending Approval Accounts:');
    console.log('   - Jordan Belfort:     pending@example.com  / user123 (Needs approval)');
    console.log('===========================================================');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedWorkSphere();
