# WorkSphere — Modern Enterprise Workspace Management Platform

A SaaS-grade **MERN Stack** company and team management platform built with **Midnight Navy + Indigo Blue + Slate White** enterprise design, 3-tier Role-Based Access Control (**User**, **Manager**, **Admin**), **Account Authorization Approval Workflow**, an **Action Path 4-Column Kanban Board**, and **Recharts Analytics**.

---

## 🎨 Enterprise Design System (Matching Provided Reference UI)

- **Color Theme**:
  - **Sidebar**: Midnight Navy `#172554` (Fixed desktop navigation, collapsible mobile drawer)
  - **Primary Actions**: Indigo Blue `#4F46E5`
  - **Page Background**: Slate White `#F8FAFC`
  - **Cards & Surfaces**: Clean White `#FFFFFF` with thin subtle borders (`border-slate-200/80`)
  - **Status Accents**:
    - Completed / Done: Emerald `#10B981`
    - In Progress: Blue `#3B82F6` / Amber `#F59E0B`
    - Review: Purple `#8B5CF6`
    - Overdue / Behind / At Risk: Rose `#EF4444`
- **Iconography**: Lucide React (`lucide-react`)
- **Visual Analytics**: Recharts (`recharts`) for Area Charts, Bar Charts, Donut Charts, and horizontal category progress bars.

---

## 🏢 Company Structure (4 Divisions & Teams)

The database comes pre-configured with **4 Division Managers** and **18+ active employees**:

| Division | Manager | Manager Email / Password | Team Size | Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Backend & Cloud Infrastructure** | **Sarah Jenkins** | `sarah@example.com` / `manager123` | 5 Engineers | Microservices, Node.js, Kubernetes, Databases |
| **Product & Frontend Web** | **Michael Chang** | `michael@example.com` / `manager123` | 5 Engineers | React.js, Next.js, Design Systems, Performance |
| **Product Design & UX** | **Elena Rostova** | `elena@example.com` / `manager123` | 4 Designers | Figma, UI Tokens, User Research, Usability |
| **QA & Security Operations** | **David Miller** | `david@example.com` / `manager123` | 4 Specialists | Automation, Penetration Testing, CI/CD, SOC2 |

- **Executive Administrator**: **Ashish Tetarwal** (`admin@example.com` / `admin123`) with full oversight across all divisions.
- **Primary Demo User**: **Alex Rivera** (`user@example.com` / `user123`) — Backend Team.

---

## 🔐 Controlled Registration & Approval Workflow

1. **Self-Registration**:
   - New employees create accounts via the `/register` portal, selecting their Department and Division Lead (Manager).
   - Accounts are created with status: **`pending`**.
2. **Access Guard**:
   - When pending users attempt to log in, they are blocked with a clear notice: *"Your account is pending authorization by your Division Manager or Workspace Administrator."*
3. **Manager & Admin Authorization**:
   - Both Managers and Admins have an **Approvals** tab with pending counters.
   - One-click **Authorize & Activate** activates the account and grants workspace access.
   - One-click **Reject** blocks unauthorized requests.

---

## 🖥️ The 3 Redesigned Portals

### 1. 👑 Admin Dashboard (Company-Wide Control Center)
- **Top KPI Cards**: Total Employees, Active Managers, Company Task Completion Rate, Pending Approvals.
- **Tab 1 — Analytics & Reports (Matching Reference Image 1)**:
  - 4 KPI cards: 94.2% Completion Rate, 2.4h Response Time, 18.5 Velocity, 87% Sprint Success.
  - Monthly Progress 6-month area trend chart.
  - Team Efficiency Trend bar chart.
  - Tasks by Category horizontal progress bars (Development, Design, Testing, Documentation, Planning).
  - Quick Insights (Best Day, Velocity Up, At-Risk projects).
  - Productivity Trends donut chart.
- **Tab 2 — Division Manager Performance Comparison**:
  - Live table comparing all 4 Managers: tasks assigned, completed, overdue, team size, completion rate, and efficiency rating.
- **Tab 3 — Workspace 4-Column Board**:
  - Full company Action Path Kanban board.
- **Tab 4 — Employee Directory & Access Approvals**:
  - Authorize/Reject pending users.
  - Role management (promote to User, Manager, or Admin) and account deactivation.
- **Tab 5 — Security & Audit Logs**:
  - Immutable chronological event trail.

---

### 2. 👔 Manager Dashboard (Team Operations Workspace)
- **Header**: Division selector, `+ Project` button, `+ Assign Task` button.
- **KPI Cards**: Division Team Size, Completion Rate %, In Progress/Review, Overdue tasks.
- **Tab 1 — Team Action Path Kanban Board (Matching Reference Image 2)**:
  - 4 Columns: **Todo List**, **In Progress**, **Review**, **Done**.
  - Team member avatar selector + Priority filter + `+ Create Task`.
  - Rich cards with At Risk / On Track tags, task descriptions, and horizontal progress bars (0%, 36%, 72%, 90%, 100%).
  - Native HTML5 Drag and Drop between all 4 stages.
- **Tab 2 — Team Analytics & Member Performance (Matching Reference Image 1)**:
  - Division charts + individual member workload table (tasks assigned, completed, overdue, and completion rate).
- **Tab 3 — Team Members & Pending Approvals**:
  - Division roster + pending authorization requests to join their team.
- **Tab 4 — Division Projects**:
  - Projects, deadlines, and milestone deliverables.

---

### 3. 👤 User Dashboard (Personal Work Center)
- **Welcome Header (Matching Reference Image 3)**:
  - *"Good morning, {name}! Let's make today productive!"*
  - 4 Metric Pills: **✔ 12 Completed**, **🎯 5 Pending**, **🔥 2 Overdue**, **🚀 3 In Progress**.
- **Tab 1 — My Action Path Board (Matching Reference Image 2)**:
  - Personal 4-column drag-and-drop board for assigned work.
  - Progress sliders, task comments, priority tags, and health status.
- **Tab 2 — Today's Deliverables (Matching Reference Image 3 list)**:
  - Checkbox list of project deliverables with due badges ("Due: Today • 11:00 AM").
  - Upcoming project initiatives.
- **Tab 3 — My Performance Analytics**:
  - Personal completion rate and velocity metrics.

---

## ⚡ Running Locally

Both services are running live:
- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **Database**: Local MongoDB (`mongodb://127.0.0.1:27017/jwt_auth_db`)

---

## 🔑 One-Click Test Accounts

| Role | Email | Password | Division / Capabilities |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@example.com` | `admin123` | Full workspace control, Manager comparison, Directory, Audit logs |
| **👔 Manager 1** | `sarah@example.com` | `manager123` | Backend & Cloud Lead (Sarah Jenkins) |
| **👔 Manager 2** | `michael@example.com` | `manager123` | Product & Frontend Lead (Michael Chang) |
| **👔 Manager 3** | `elena@example.com` | `manager123` | Product Design & UX Lead (Elena Rostova) |
| **👔 Manager 4** | `david@example.com` | `manager123` | QA & Security Operations Lead (David Miller) |
| **👤 User** | `user@example.com` | `user123` | Senior Engineer (Alex Rivera) |
| **⏳ Pending User** | `pending@example.com` | `user123` | Jordan Belfort (Tests the authorization guard!) |
