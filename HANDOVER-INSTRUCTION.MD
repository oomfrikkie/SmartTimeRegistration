# SmartTimeRegistration — Team Handover Document

## Project Overview

SmartTimeRegistration is a web-based time and project tracking system for teams. It allows organizations to manage projects, assign team members to work packages, log work hours, and track project budgets. Core features include:

- User accounts with email/password and Microsoft SSO login
- Project creation with budget and subsidy tracking
- Work packages within projects, with per-member hour allocation
- Event/time logging (manual entry or iCal/ICS calendar import)
- Project invitation system via email
- Role-based access: Project Manager and Employee
- Excel export of project data

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11 (TypeScript), TypeORM, PostgreSQL |
| Frontend | React 19 (JSX), Vite 7, React Router 6 |
| Auth | JWT (Passport.js) + Azure MSAL (Microsoft SSO) |
| Email | Nodemailer with Mailtrap (sandbox SMTP) |
| Containers | Docker |
| API Docs | Swagger at `http://localhost:3000/api` |

---

## Repository Structure

```
SmartTimeRegistration/
├── backend/                # NestJS API server
│   └── src/
│       ├── account/        # User accounts, auth, password reset
│       ├── auth/           # JWT strategy and guards
│       ├── project/        # Project CRUD and member management
│       ├── workpackage/    # Work package management
│       ├── projectmember/  # Project team members and roles
│       ├── event/          # Time tracking events
│       ├── invitation/     # Project invitation system
│       └── import/         # iCal/ICS calendar import
├── frontend/               # React Vite frontend
│   ├── components/         # Reusable UI components
│   └── pages/              # Route-level pages
├── .env                    # Environment variables (create from template below)
└── HANDOVER-INSTRUCTION.MD # This document
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+ (or Docker)
- npm

### 1. Clone and Install

```bash
git clone <https://github.com/oomfrikkie/SmartTimeRegistration>
cd SmartTimeRegistration

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with the following values:

```env
# Database
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=mydb
POSTGRES_HOST=localhost          # Use 'postgres' if running via Docker
POSTGRES_PORT=5432

# Backend
PORT=3000
NODE_ENV=development

# Frontend URL (used for email links)
FRONTEND_URL=http://localhost:5173

# Email (Mailtrap sandbox — create a free account at mailtrap.io)
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=587
MAIL_USER=<your-mailtrap-user>
MAIL_PASS=<your-mailtrap-password>
MAIL_FROM="SmartTimeReg <noreply@smarttimereg.com>"
```

### 3. Set Up the Database

Create a PostgreSQL database named `mydb`. The app uses TypeORM with `synchronize: false`, so you need to create the schema manually. The easiest approach during development is to temporarily set `synchronize: true` in `backend/src/app.module.ts`, start the server once to generate all tables, then set it back to `false`.

```sql
CREATE DATABASE mydb;
```

### 4. Run the Application

**Backend** (port 3000):
```bash
cd backend
npm run start:dev
```

**Frontend** (port 5173):
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Running with Docker

Both services have Dockerfiles. If a `docker-compose.yml` is present:

```bash
docker-compose up -d
```

This starts the backend, frontend, and PostgreSQL container together. The PostgreSQL host in `.env` should be set to `postgres` when using Docker.

---

## Key URLs

| URL | Purpose |
|-----|---------|
| `http://localhost:5173` | Frontend application |
| `http://localhost:3000` | Backend API |
| `http://localhost:3000/api` | Swagger API documentation |

---

## Authentication

The app supports two login methods:

1. **Email/Password** — standard registration and login flow
2. **Microsoft SSO** — via Azure MSAL

Azure MSAL credentials are hardcoded in `frontend/src/main.jsx`:
- `CLIENT_ID`: `f68133ef-fbb5-4a26-a51d-b0b76bbd7aec`
- `TENANT_ID`: `7e0609fe-cffc-471d-8777-264f711051f6`

If the Azure app registration is changed, update these values.

JWT tokens are stored in `localStorage` on the frontend and sent as `Authorization: Bearer <token>` headers with API requests.

---

## API Overview

All endpoints are documented in Swagger at `http://localhost:3000/api`. Protected routes require a valid JWT token.

| Module | Base Path | Notes |
|--------|-----------|-------|
| Account | `/account` | Registration, login, password reset |
| Projects | `/projects` | CRUD, member management, budget |
| Work Packages | `/workpackage` | CRUD within a project |
| Events | `/event` | Time entries per account/project |
| Invitations | `/invitation` | Send/accept/decline project invites |
| Calendar Import | `/import` | POST an ICS URL to import events |

---

## Database Schema (Key Entities)

| Table | Description |
|-------|-------------|
| `account` | User accounts (email, password hash, name) |
| `project` | Projects with budget, subsidy, status, dates |
| `work_package` | Work packages within a project |
| `project_member` | Composite key (project_id, account_id), role, assigned hours |
| `project_member_work_package` | Work package assignments for members |
| `event` | Time tracking entries (name, date, hours, location) |
| `project_invitation` | Invitations with status (PENDING/ACCEPTED/DECLINED) |
| `account_token` | Password reset tokens |

### Entity Relationships

```
Account ──< ProjectMember >── Project ──< WorkPackage
                │                              │
                └──< ProjectMemberWorkPackage >┘

Account ──< Event
Project ──< ProjectInvitation
Account ──< AccountToken
```

---

## Running Tests

```bash
cd backend

# Unit tests
npm run test

# Unit tests with coverage
npm run test:cov

# End-to-end tests (requires test database — see .env.test)
npm run test:e2e
```

Test environment variables are in `backend/.env.test` and `.env.test`.

---

## Email Setup (Mailtrap)

The project uses Mailtrap as a sandbox SMTP server for development — emails are intercepted and visible in your Mailtrap inbox rather than sent to real addresses.

1. Create a free account at mailtrap.io
2. Go to your Inbox → SMTP settings
3. Copy the credentials into `.env` (`MAIL_USER`, `MAIL_PASS`)

Features that send emails:
- Password reset links
- Project invitation notifications

---

## Calendar Import (iCal / ICS)

The app can import events directly from a public iCal URL (e.g. an Outlook or Google Calendar feed).

### How It Works

Send a `POST` request to `/import` with the following body:

```json
{
  "icsUrl": "https://example.com/calendar.ics",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "account_id": 1
}
```

The backend fetches the ICS file, parses all events within the date range, and saves them as time entries for the given account.

### What Gets Extracted Per Event

| Field | Source |
|-------|--------|
| `name` | Event summary/title |
| `date` | Event start date |
| `start_time` / `end_time` | Event start and end times |
| `total_hours` | Calculated from duration |
| `location` | Location field |
| `is_online` | Detected if location/description mentions "Teams" |
| `is_series` | Detected if event has a recurrence rule (`RRULE`) |
| `attendees` | Required participants from the event |
| `project_name` | Extracted from the first part of the title before ` - ` (e.g. `"Project Alpha - Meeting"` → `"Project Alpha"`) |
| `package_name` | Extracted from description if it matches patterns like `WP1`, `Work Package 2`, `Package: design` |

### Getting Your iCal URL

- **Outlook / Microsoft 365**: Go to Calendar → Settings → Shared calendars → Publish, copy the ICS link
- **Google Calendar**: Settings → your calendar → "Secret address in iCal format"

> The URL must be publicly accessible. The backend fetches it server-side, so private/authenticated calendar URLs will not work.