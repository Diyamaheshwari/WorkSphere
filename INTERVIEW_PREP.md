# WorkSphere — MERN Stack Technical Interview Guide

Use this guide to speak confidently and naturally about your architecture, design choices, and business logic during your intern interview.

---

## 🎤 1. How to Introduce WorkSphere (30-Second Elevator Pitch)

> "I built **WorkSphere**, an enterprise-grade company and team management platform using the MERN stack. Unlike basic college CRUD projects, it follows a modern SaaS architecture designed around a **Midnight Navy and Slate White** design system with Lucide icons and Recharts analytics.
> 
> The platform organizes a company into 4 division leads and their engineering teams, enforcing a multi-tiered Role-Based Access Control structure:
> 1. **Executive Admins** monitor company-wide velocity, compare division manager performance, govern user roles, and review security audit logs.
> 2. **Division Managers** run team operations using a 4-column Action Path Kanban board, delegate tasks, track member workload, and authorize new team members.
> 3. **Users** work from a personal command center with drag-and-drop workflow updates, deadline tracking, and discussion threads.
> 
> A key security feature is the **Controlled Account Authorization flow**: self-registered users cannot enter the workspace until their designated division manager or an admin formally authorizes their account."

---

## 💡 2. Explaining the Key Architectural Features

### 1. How does the Controlled Account Approval Workflow work?
> "In `backend/models/User.js`, every user has a `status` field (`'pending'`, `'active'`, `'rejected'`, `'disabled'`).
> - When an employee self-registers via `/api/auth/register`, their account is created with `status: 'pending'`.
> - When they attempt to log in, `authController.loginUser` intercepts the request: if `status === 'pending'`, the server responds with HTTP `403` and `{ isPending: true }`.
> - The frontend displays a dedicated informative alert explaining that their Division Manager or Administrator must authorize access.
> - In the Admin or Manager portal under **Approvals**, the manager reviews the request and clicks **Authorize & Activate** (`PUT /api/users/:id/approve`), which transitions their status to `'active'` and unlocks full workspace access."

### 2. How did you build the 4-Stage Action Path Board?
> "I built the Action Path board matching the 4 standard industry stages: **Todo List**, **In Progress**, **Review**, and **Done**.
> - It uses native HTML5 Drag and Drop (`onDragStart`, `onDragOver`, `onDrop`), storing the task ID in `e.dataTransfer`.
> - When dropped over a column, it updates local state optimistically and triggers `PUT /api/tasks/:id` with the new status.
> - Each card visualizes completion through a dynamic progress bar (0% to 100%), health indicator pills (**On Track**, **At Risk**, **Behind**), and integrated comment threads."

### 3. How did you structure the Division Managers and Teams?
> "In MongoDB, each User document stores an optional `manager` reference (an `ObjectId` pointing to their division lead) and their `department`.
> - We have 4 division managers: Backend & Cloud, Frontend Web, Product Design, and QA/Security.
> - When a manager logs in, their dashboard automatically scopes team members and tasks to their division, while the Admin has company-wide oversight across all 4 teams."

### 4. How did you compute the Analytics & Manager Performance comparison?
> "I used **MongoDB Aggregation Pipelines** (`Task.aggregate` and `User.aggregate`):
> - In `backend/controllers/dashboardController.js`, we group tasks by their assigned manager or division and calculate the sum of total tasks, completed tasks, and overdue tasks.
> - On the frontend, we render these metrics using **Recharts** for monthly trend area charts, efficiency bar charts, and category breakdown bars."

---

## 📌 3. Quick Reference for Theory Questions

- **Why Midnight Navy sidebar + light content?**
  "It provides strong visual hierarchy, anchors the navigation, and gives the app an authoritative enterprise look while keeping data tables and charts clean and readable on a slate white canvas."
- **Why JWT over server sessions?**
  "JWTs are stateless and horizontally scalable. The token is verified on each request via the `protect` middleware using cryptographic signature verification without requiring a centralized session store."
- **How does password security work?**
  "`bcryptjs` hashes passwords with 10 salt rounds inside a Mongoose `pre('save')` hook, ensuring rainbow tables cannot reverse passwords even if two users share the same phrase."
