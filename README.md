# Edu Workshop Hub

Edu Workshop Hub is a Docker-first monorepo with a Laravel API backend and a
React Vite frontend.

The product is a bilingual workshop management platform for teachers. Attenders
can discover educational workshops, enroll in them, join waiting lists, and
download participation documents. Teachers organize workshops, manage
participants, mark attendance, and generate official documents. Admins manage
users, categories, translations, and platform-level audit data.

The project is designed to run the same way on macOS, Linux, and Windows. You
do not need to install PHP, Composer, Node, npm, PostgreSQL, or Laravel directly
on your machine.

## Product Scope

The platform supports three main layouts:

- `Attender` - browses workshops, enrolls, withdraws, tracks enrollment status,
  and downloads participation certificates after attendance is confirmed.
- `Teacher` - creates and manages workshops, sets capacity, date and location,
  manages participant and waiting lists, marks attendance, and exports attendance
  lists.
- `Admin` - manages users, course categories, translations, and global platform
  activity.

Core features:

- Workshop catalog with active workshops.
- Enrollment and withdrawal flow.
- Automatic waiting list promotion when a confirmed participant withdraws.
- Bilingual interface: Romanian and German.
- Frontend language preference persists in browser `localStorage` and falls
  back to Romanian for unsupported locales.
- Attendance management.
- Attendance list export as PDF or Excel.
- Participation certificate download after attendance confirmation.

Current prototype notes:

- Canonical demo dashboards use `/demo/dashboard/professor` and
  `/demo/dashboard/referent`; legacy dashboard URLs may redirect or be deprecated.
  to those paths.
- Revenue values shown in teacher-facing prototype screens are placeholders;
  revenue management is not part of the current Teacher scope.

## Tech Stack

- Backend: Laravel, PHP 8.4
- Frontend: React, Vite
- Database: PostgreSQL 16
- Runtime: Docker Compose

## Requirements

Install:

- Docker Desktop on macOS or Windows
- Docker Engine and Docker Compose on Linux
- Git

Recommended:

- VS Code or another code editor
- A terminal with Git available

## Project Structure

```text
edu-workshop-hub/
  backend/              Laravel API application
  frontend/             React Vite application
  docker/               Docker images and service config
  docs/                 Project documentation, specs, and plans
  docker-compose.yml    Local development stack
```

## Services

Docker Compose runs four services:

| Service | Purpose | URL | Profile |
| --- | --- | --- | --- |
| `frontend` | React Vite app | http://localhost:5173 | default |
| `backend` | Laravel API | http://localhost:8000 | default |
| `db` | PostgreSQL 16 database | Internal: `db:5432` | default |
| `pgadmin` | pgAdmin 4 v9.15 database GUI | http://localhost:5050 | `dev` |

The database port `5432` is intentionally not exposed on the host. This avoids
conflicts with any local PostgreSQL installation. pgAdmin connects to `db:5432`
internally over the `appnet` bridge network.

`pgadmin` uses the `dev` profile and does not start with a plain
`docker compose up`. Use `--profile dev` to include it (see below).

## First Setup

Clone the repository:

```bash
git clone https://github.com/AlexM-058/edu-workshop-hub.git
cd edu-workshop-hub
```

Start Docker Desktop or make sure Docker Engine is running.

Pull the base Docker images. This makes first setup failures easier to spot
before dependency installation starts:

```bash
docker compose pull
docker pull php:8.4-cli
```

Create local environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Install backend and frontend dependencies through Docker:

```bash
docker compose run --rm backend composer install
docker compose run --rm frontend npm install
```

Generate the Laravel application key if it was not generated already:

```bash
docker compose run --rm backend php artisan key:generate
```

Run database migrations:

```bash
docker compose run --rm backend php artisan migrate
```

## Run The Project

Start the default stack (frontend, backend, db):

```bash
docker compose up --build
```

Start the full dev stack including pgAdmin:

```bash
docker compose --profile dev up --build
```

Or run either variant in the background with `-d`:

```bash
docker compose --profile dev up --build -d
```

Open:

- React frontend: http://localhost:5173
- Laravel API: http://localhost:8000
- Laravel API health endpoint: http://localhost:8000/api/health
- pgAdmin 4 (dev profile only): http://localhost:5050

The health endpoint should return:

```json
{"status":"ok","service":"backend"}
```

Current authenticated API endpoints include:

- `GET /api/auth/me` - syncs the signed-in Clerk user to the local user table.
- `GET /api/workshops` - returns published workshops for the public catalog.
- `GET /api/workshops/{workshop}` - returns a single published workshop.
- `POST /api/workshops/{workshop}/enroll` - allows attenders to enroll in a published workshop or join its waiting list.
- `POST /api/teacher/workshops` - allows `teacher` and `admin` users to create draft or published workshops.
- `POST /api/admin/teacher-invitations` - allows admins to prepare teacher role invitations.

Stop the project (keeps volumes):

```bash
docker compose down
```

Stop and wipe all data volumes:

```bash
docker compose down -v
```

## Development Commands

Run Laravel tests:

```bash
docker compose run --rm backend php artisan test
```

Run only the backend health test:

```bash
docker compose run --rm backend php artisan test --filter=HealthTest
```

Seed the database with demo data:

```bash
docker compose run --rm backend php artisan db:seed
```

Reset the database and reseed (wipes all data):

```bash
docker compose run --rm backend php artisan migrate:fresh --seed
```

Demo accounts created by the seeder:

| Role      | Email                         | clerk_id              |
| --------- | ----------------------------- | --------------------- |
| Admin     | admin@edu-workshop.dev        | user_dev_admin        |
| Referent  | referent@edu-workshop.dev     | user_dev_referent     |
| Referent  | referent2@edu-workshop.dev    | user_dev_referent2    |
| Professor | professor@edu-workshop.dev    | user_dev_professor    |
| Professor | professor2@edu-workshop.dev   | user_dev_professor2   |
| Professor | professor3@edu-workshop.dev   | user_dev_professor3   |


Run the frontend production build:

```bash
docker compose run --rm --no-deps frontend npm run build
```

Install a backend Composer package:

```bash
docker compose run --rm backend composer require vendor/package
```

Install a frontend npm package:

```bash
docker compose run --rm --no-deps frontend npm install package-name
```

Open a shell inside the backend container:

```bash
docker compose run --rm backend sh
```

Open a shell inside the frontend container:

```bash
docker compose run --rm --no-deps frontend sh
```

## Environment

Backend environment file:

```text
backend/.env
```

Important backend values:

```dotenv
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=edu_workshop_hub
DB_USERNAME=edu_workshop_hub
DB_PASSWORD=secret
```

Frontend environment file:

```text
frontend/.env
```

Important frontend value:

```dotenv
VITE_API_URL=http://localhost:8000/api
```

## What Has Been Built So Far

- Docker-first monorepo structure.
- Laravel backend in `backend/`.
- React Vite frontend in `frontend/`.
- PostgreSQL 16 service with `healthcheck` in Docker Compose.
- Explicit `appnet` bridge network shared by all services.
- pgAdmin 4 service available under the `dev` profile at http://localhost:5050.
- Backend health endpoint at `GET /api/health`.
- React starter screen that checks the backend health endpoint.
- CORS configured for the Vite frontend origin.
- Docker images for backend and frontend development.
- Database schema implemented via Laravel migrations:
  - `users` (Google OAuth, first/last name, role)
  - `workshops` (bilingual title/description, capacity, denormalized `occupied_slots`)
  - `registrations` (enrollment status, attendance flag, unique per professor/workshop)
  - `certificates` (PDF path, linked to registration)
  - `sessions` (required by `SESSION_DRIVER=database`, supports OAuth redirect flow)
- Project documentation under `docs/`.
- Clerk-based authentication with role sync.
- API endpoints implemented:
  - `GET /api/health` — public health check
  - `GET /api/workshops` — public catalog (paginated, active only)
  - `GET /api/workshops/{id}` — public workshop detail
  - `GET /api/auth/me` — authenticated user profile sync
  - `GET /api/teacher/workshops` — referent's own workshops (auth: referent/admin)
  - `GET /api/teacher/stats` — referent aggregated stats (auth: referent/admin)
  - `GET /api/attender/registrations` — professor's registrations (auth: professor/admin)
  - `GET /api/attender/stats` — professor aggregated stats (auth: professor/admin)
  - `POST /api/admin/teacher-invitations` — invite a referent (auth: admin)
- Demo seed data with 6 users, 7 workshops, 10 registrations, and 2 certificates.


## Troubleshooting

If Docker is not running:

```text
Cannot connect to the Docker daemon
```

Start Docker Desktop or Docker Engine, then run the command again.

If `docker compose up --build` appears stuck while loading metadata for
`php:8.4-cli`, pull the backend base image explicitly and restart:

```bash
docker pull php:8.4-cli
docker compose up --build
```

This usually means Docker is still downloading the PHP image from Docker Hub, or
Docker Desktop has a temporary network/authentication issue.

If ports are already in use:

- Frontend uses host port `5173`.
- Backend uses host port `8000`.
- pgAdmin uses host port `5050` (dev profile only).
- PostgreSQL does not use a host port by default.

If pgAdmin fails to start with a `network not found` error on Windows, the
Docker networking layer may have a stale state. Run:

```bash
docker compose down -v
docker network prune
docker compose --profile dev up --build
```

If the frontend says the backend is offline, check the backend health endpoint:

```bash
curl http://localhost:8000/api/health
```

If dependencies look broken, reinstall them through Docker:

```bash
docker compose run --rm backend composer install
docker compose run --rm --no-deps frontend npm install
```

If you need a clean restart:

```bash
docker compose down
docker compose up --build
```

## Documentation

- Business analysis: `docs/business-analysis.md`
- Product brief draft: `docs/project-brief.md`
- Common issues: `docs/common-issues.md`
- Design spec: `docs/superpowers/specs/2026-05-09-laravel-react-monorepo-design.md`
- Implementation plan: `docs/superpowers/plans/2026-05-09-laravel-react-monorepo.md`
