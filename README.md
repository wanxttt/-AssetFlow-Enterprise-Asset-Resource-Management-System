# AssetFlow ERP

AssetFlow is a modern Enterprise Asset and Resource Management System built with a robust monorepo architecture. It is designed to handle full-lifecycle asset tracking, allocations, resource booking, maintenance kanban workflows, and auditing.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React, Tailwind CSS v4, Shadcn UI
- **Backend:** NestJS, TypeScript
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Infrastructure:** Docker & Docker Compose
- **Architecture:** Monorepo (Workspaces)

### Project Structure

```
assetflow-erp/
├── apps/
│   ├── frontend/       # Next.js web application
│   └── backend/        # NestJS API & Prisma schema
├── docker/             # Docker Compose configurations (PostgreSQL)
├── packages/           # Shared libraries (if applicable)
└── README.md
```

## Core Modules

1. **Dashboard:** High-level metrics and recent activity overview.
2. **Organization Setup:** Manage departments, hierarchy, and employees.
3. **Asset Directory:** Centralized repository for all hardware and furniture.
4. **Allocation & Transfer:** Transfer guardrails (blocks double-allocations) and assignment tracking.
5. **Resource Booking:** Conflict-detection system for bookable spaces (e.g., Conference Rooms).
6. **Maintenance Kanban:** State-machine driven ticketing (Pending -> Approved -> Assigned -> In Progress -> Resolved).
7. **Audit:** Discrepancy reporting and verification cycles.
8. **Reports & Notifications:** Data visualization and real-time alerts.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- Docker Desktop (for PostgreSQL database)

### 1. Database Setup
Start the PostgreSQL container:
```bash
cd docker
docker-compose up -d
```

### 2. Backend Setup
Navigate to the backend, generate the Prisma client, and start the NestJS server.
```bash
cd apps/backend
npm install
npx prisma migrate dev --name init
npm run start:dev
```
*The backend API will run on `http://localhost:3005` (or as configured in `.env`).*

### 3. Frontend Setup
In a new terminal window, navigate to the frontend and start the Next.js development server.
```bash
cd apps/frontend
npm install
npm run dev
```
*The frontend application will be available at `http://localhost:3001` (or 3000 depending on availability).*

## Design Decisions

- **Double-Allocation Block:** The system explicitly prevents assets from being directly re-allocated if they are already in an `Allocated` state, mandating a formal Transfer Request workflow.
- **Custom Prisma Output:** The Prisma client is generated into a shared `generated/prisma` directory to ensure seamless path resolution across the monorepo tooling without circular dependencies.
- **Strict Prefixing:** The NestJS backend relies on a global `/api` prefix to prevent route collision with frontend paths when deployed.
