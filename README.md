# EduCraft Workshop Hub

EduCraft Workshop Hub is a bilingual workshop management platform for an
educational environment. It helps participants discover and join workshops,
teachers manage attendance and exports, and admins supervise users and platform
configuration.

The project is built as a Docker-first monorepo with a Laravel API backend,
React/Vite frontend, PostgreSQL database, Clerk authentication, and Brevo email
notifications.

## Live Application

- Frontend: https://edu-workshop-hub.vercel.app
- Backend API: https://edu-workshop-hub.onrender.com
- Backend health check: https://edu-workshop-hub.onrender.com/api/health

## What The Application Does

EduCraft centralizes the full lifecycle of educational workshops:

1. Admins configure access and manage the platform.
2. Teachers create and publish workshops.
3. Participants browse the catalog and enroll.
4. Full workshops use a waiting list.
5. Teachers confirm attendance manually or through QR check-in.
6. The system generates attendance exports and participation certificates.
7. Notifications are sent for relevant events such as teacher role access,
   enrollment confirmations, and waiting list promotion.

The interface supports Romanian and German. The selected language is stored in
the browser and reused across the application.

## Roles

The application has three canonical technical roles: `attender`, `teacher`, and
`admin`.

In product/UI language:

- `attender` is the participant who attends workshops.
- `teacher` is the organizer/referent who creates workshops and manages
  attendance.
- `admin` is the platform supervisor.

Some older docs, seed data, and compatibility routes may still mention
`professor` and `referent`. Those map to:

- `professor` -> `attender`
- `referent` -> `teacher`

## Role Capabilities

### Attender / Participant

An attender can:

- Sign in with Google through Clerk.
- Browse the public workshop catalog.
- Open workshop detail pages.
- Enroll in published workshops.
- Join the waiting list when a workshop is full.
- Withdraw from a registration.
- See current registrations and status.
- Scan a QR code to confirm attendance on mobile.
- Download a participation certificate after attendance is confirmed.
- View personal history, resources, and profile.

Important routes:

- `/catalog`
- `/workshops/:id`
- `/demo/dashboard/attender`
- `/attendance/check-in`
- `/demo/history`
- `/demo/certificates`
- `/demo/profile`

### Teacher / Referent

A teacher can:

- Access the teacher dashboard.
- Create draft or published workshops.
- Edit workshop details.
- Configure title, description, category, date, location, and capacity.
- View owned workshops.
- View participant and waiting list data.
- Mark attendance.
- Generate a QR attendance check-in code.
- Export attendance lists as CSV or PDF.
- Trigger certificate availability by confirming attendance.

Important routes:

- `/demo/dashboard/teacher`
- `/demo/dashboard/teacher/workshops`
- `/demo/dashboard/teacher/workshops/new`
- `/demo/dashboard/teacher/workshops/:id/participants`
- `/demo/dashboard/teacher/analytics`

### Admin

An admin can:

- Access the admin portal.
- View platform-level dashboard data.
- Manage users and roles.
- Invite users to become teachers.
- Manage workshops globally.
- Manage categories and platform settings.
- View audit/system activity screens.
- Access shared certificate/resources/profile areas.

Important routes:

- `/demo/admin/dashboard`
- `/demo/admin/users`
- `/demo/admin/workshops`
- `/demo/admin/settings`
- `/demo/admin/audit`

## Core Features

- Google authentication through Clerk.
- Role-based route protection.
- Admin-defined teacher invitations.
- Environment-configured admin email promotion.
- Public workshop catalog.
- Workshop creation and editing.
- Bilingual workshop title and description fields.
- Category support.
- Enrollment and withdrawal flow.
- Waiting list support.
- Automatic waiting list promotion when a confirmed participant withdraws.
- Email notifications through Brevo.
- Attendance management by teacher/admin.
- QR-based attendance check-in for mobile devices.
- Participation certificates.
- Attendance export as CSV and PDF.
- Romanian/German language switching.
- Docker-based local development.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite |
| Backend | Laravel, PHP 8.4 |
| Database | PostgreSQL 16 |
| Auth | Clerk + Google OAuth |
| Email | Brevo |
| Hosting | Vercel frontend, Render backend/database |
| Local runtime | Docker Compose |

## Repository Structure

```text
edu-workshop-hub/
  backend/              Laravel API application
  frontend/             React Vite application
  docker/               Docker images and entrypoints
  docs/                 Product and technical documentation
  docker-compose.yml    Local development stack
```

## Local Services

| Service | Purpose | Local URL |
| --- | --- | --- |
| `frontend` | React Vite app | http://localhost:5173 |
| `backend` | Laravel API | http://localhost:8000 |
| `db` | PostgreSQL database | Internal: `db:5432` |
| `pgadmin` | Database GUI, dev profile only | http://localhost:5050 |

PostgreSQL is intentionally not exposed on host port `5432`. Containers connect
to it internally through Docker Compose as `db:5432`.

## First Setup

Clone the repository:

```bash
git clone https://github.com/AlexM-058/edu-workshop-hub.git
cd edu-workshop-hub
```

Create local environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Install dependencies through Docker:

```bash
docker compose run --rm backend composer install
docker compose run --rm --no-deps frontend npm install
```

Generate the Laravel app key:

```bash
docker compose run --rm backend php artisan key:generate
```

Run migrations:

```bash
docker compose run --rm backend php artisan migrate
```

Optional demo data:

```bash
docker compose run --rm backend php artisan db:seed
```

## Run Locally

Start frontend, backend, and database:

```bash
docker compose up --build
```

Open:

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Health check: http://localhost:8000/api/health

Expected health response:

```json
{"status":"ok","service":"backend"}
```

Start with pgAdmin:

```bash
docker compose --profile dev up --build
```

Stop services:

```bash
docker compose down
```

Stop services and delete local data volumes:

```bash
docker compose down -v
```

## Environment Variables

### Backend

Backend environment file:

```text
backend/.env
```

Important local values:

```dotenv
APP_NAME="EduCraft"
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
FRONTEND_URLS=http://localhost:5173,http://127.0.0.1:5173

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=edu_workshop_hub
DB_USERNAME=edu_workshop_hub
DB_PASSWORD=secret

CLERK_SECRET_KEY=
CLERK_ISSUER=
CLERK_JWKS_URL=
CLERK_AUTHORIZED_PARTIES=http://localhost:5173
EDUCRAFT_ADMIN_EMAILS=

MAIL_MAILER=brevo
BREVO_API_KEY=
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
QUEUE_CONNECTION=database
```

For production on Render, `QUEUE_CONNECTION=sync` is recommended unless a
separate queue worker service is configured.

`EDUCRAFT_ADMIN_EMAILS` is a comma-separated list of emails that should be
promoted to admin during user sync, for example:

```dotenv
EDUCRAFT_ADMIN_EMAILS=admin@example.com,second.admin@example.com
```

### Frontend

Frontend environment file:

```text
frontend/.env
```

Important values:

```dotenv
VITE_API_URL=http://localhost:8000/api
VITE_CLERK_PUBLISHABLE_KEY=
```

For production on Vercel:

```dotenv
VITE_API_URL=https://edu-workshop-hub.onrender.com/api
VITE_CLERK_PUBLISHABLE_KEY=pk_...
```

Only `VITE_*` values are exposed to the browser bundle. Do not put backend
secrets in frontend environment variables.

## Development Commands

Run all backend tests:

```bash
docker compose run --rm backend php artisan test
```

Run a focused backend test:

```bash
docker compose run --rm backend php artisan test --filter=TeacherWorkshopsTest
```

Build the frontend:

```bash
docker compose run --rm --no-deps frontend npm run build
```

Install a backend package:

```bash
docker compose run --rm backend composer require vendor/package
```

Install a frontend package:

```bash
docker compose run --rm --no-deps frontend npm install package-name
```

Open a backend shell:

```bash
docker compose run --rm backend sh
```

Open a frontend shell:

```bash
docker compose run --rm --no-deps frontend sh
```

Reset and reseed the local database:

```bash
docker compose run --rm backend php artisan migrate:fresh --seed
```

## Main API Endpoints

Public:

- `GET /api/health`
- `GET /api/workshops`
- `GET /api/workshops/{workshop}`

Auth:

- `GET /api/auth/me`
- `POST /api/auth/teacher-invitation-notice/seen`

Attender:

- `GET /api/attender/registrations`
- `GET /api/attender/stats`
- `POST /api/workshops/{workshop}/enroll`
- `DELETE /api/attender/registrations/{registration}`
- `GET /api/attender/registrations/{registration}/certificate`
- `POST /api/attender/attendance/check-in`

Teacher:

- `GET /api/teacher/workshops`
- `GET /api/teacher/stats`
- `POST /api/teacher/workshops`
- `PUT /api/teacher/workshops/{workshop}`
- `GET /api/teacher/workshops/{workshop}/participants`
- `PATCH /api/teacher/registrations/{registration}/attendance`
- `POST /api/teacher/workshops/{workshop}/attendance-qr`
- `GET /api/teacher/workshops/{workshop}/attendance-list?format=csv`
- `GET /api/teacher/workshops/{workshop}/attendance-list?format=pdf`

Admin:

- `GET /api/admin/users`
- `GET /api/admin/stats`
- `POST /api/admin/teacher-invitations`
- `PATCH /api/admin/users/{user}/role`
- `DELETE /api/admin/users/{user}`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/{category}`
- `DELETE /api/admin/categories/{category}`
- `DELETE /api/admin/workshops/{workshop}`

## Deployment

The deployed project is split across two platforms:

- Vercel serves the React frontend.
- Render hosts the Laravel backend and PostgreSQL database.

Production URLs:

- Frontend: https://edu-workshop-hub.vercel.app
- Backend: https://edu-workshop-hub.onrender.com

Required production configuration:

- Vercel frontend must have `VITE_API_URL` pointing to the Render API.
- Vercel frontend must have `VITE_CLERK_PUBLISHABLE_KEY`.
- Render backend must have Clerk secret/issuer/JWKS config.
- Render backend must have `CLERK_AUTHORIZED_PARTIES` containing the Vercel
  frontend URL.
- Render backend must have Brevo email config for notifications.
- Render backend should use `QUEUE_CONNECTION=sync` unless a worker exists.

## Troubleshooting

If Docker is not running:

```text
Cannot connect to the Docker daemon
```

Start Docker Desktop or Docker Engine, then run the command again.

If ports are already in use:

- Frontend uses host port `5173`.
- Backend uses host port `8000`.
- pgAdmin uses host port `5050` when using the `dev` profile.

If the frontend cannot reach the backend, check:

```bash
curl http://localhost:8000/api/health
```

If authentication fails with an invalid token or authorized party error, confirm:

- frontend URL is listed in `CLERK_AUTHORIZED_PARTIES`
- Clerk issuer and JWKS URL match the active Clerk instance
- Vercel preview URLs are added if testing preview deployments

If emails do not send in production, confirm:

- `MAIL_MAILER=brevo`
- `BREVO_API_KEY` is set on Render
- `MAIL_FROM_ADDRESS` is verified/allowed by Brevo
- `QUEUE_CONNECTION=sync` is set, unless a queue worker is running

If dependencies look broken, reinstall through Docker:

```bash
docker compose run --rm backend composer install
docker compose run --rm --no-deps frontend npm install
```

## Documentation

- Business analysis: `docs/business-analysis.md`
- Product brief: `docs/project-brief.md`
- Common issues: `docs/common-issues.md`
- Technical design: `docs/superpowers/specs/2026-05-09-laravel-react-monorepo-design.md`
