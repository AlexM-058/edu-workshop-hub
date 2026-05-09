# Edu Workshop Hub

Edu Workshop Hub is a Docker-first monorepo with a Laravel API backend and a
React Vite frontend.

The product is a bilingual workshop management platform for teachers. Teachers
can discover educational workshops, enroll in them, join waiting lists, and
download participation documents. Referents organize workshops, manage
participants, mark attendance, and generate official documents. Admins manage
users, categories, translations, and platform-level audit data.

The project is designed to run the same way on macOS, Linux, and Windows. You
do not need to install PHP, Composer, Node, npm, PostgreSQL, or Laravel directly
on your machine.

## Product Scope

The platform supports three main layouts:

- `Professor` - browses workshops, enrolls, withdraws, tracks enrollment status,
  and downloads participation certificates after attendance is confirmed.
- `Referent` - creates and manages workshops, sets capacity, date and location,
  manages participant and waiting lists, marks attendance, and exports attendance
  lists.
- `Admin` - manages users, course categories, translations, and global platform
  activity.

Core features:

- Workshop catalog with active workshops.
- Enrollment and withdrawal flow.
- Automatic waiting list promotion when a confirmed participant withdraws.
- Bilingual interface: Romanian and German.
- Attendance management.
- Attendance list export as PDF or Excel.
- Participation certificate download after attendance confirmation.

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

Docker Compose starts three services:

| Service | Purpose | URL |
| --- | --- | --- |
| `frontend` | React Vite app | http://localhost:5173 |
| `backend` | Laravel API and default Laravel page | http://localhost:8000 |
| `db` | PostgreSQL database | Internal host: `db:5432` |

The database is intentionally not exposed on the host machine by default. This
avoids conflicts when another PostgreSQL server already uses port `5432`.

## First Setup

Clone the repository:

```bash
git clone https://github.com/AlexM-058/edu-workshop-hub.git
cd edu-workshop-hub
```

Start Docker Desktop or make sure Docker Engine is running.

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

Start the full stack:

```bash
docker compose up --build
```

Or run it in the background:

```bash
docker compose up --build -d
```

Open:

- React frontend: http://localhost:5173
- Laravel default page: http://localhost:8000
- Laravel API health endpoint: http://localhost:8000/api/health

The health endpoint should return:

```json
{"status":"ok","service":"backend"}
```

Stop the project:

```bash
docker compose down
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
- PostgreSQL service in Docker Compose.
- Backend health endpoint at `GET /api/health`.
- React starter screen that checks the backend health endpoint.
- CORS configured for the Vite frontend origin.
- Docker images for backend and frontend development.
- Project documentation under `docs/`.

## Troubleshooting

If Docker is not running:

```text
Cannot connect to the Docker daemon
```

Start Docker Desktop or Docker Engine, then run the command again.

If ports are already in use:

- Frontend uses host port `5173`.
- Backend uses host port `8000`.
- PostgreSQL does not use a host port by default.

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
- Design spec: `docs/superpowers/specs/2026-05-09-laravel-react-monorepo-design.md`
- Implementation plan: `docs/superpowers/plans/2026-05-09-laravel-react-monorepo.md`
