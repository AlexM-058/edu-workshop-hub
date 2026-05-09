# Edu Workshop Hub

Monorepo for the Edu Workshop Hub platform.

## Structure

- `backend/` - Laravel API application
- `frontend/` - React Vite SPA
- `docker/` - Docker development images and config
- `docs/` - project documentation, specs, and plans

## Requirements

- Docker
- Docker Compose

No host PHP, Composer, Node, or npm installation is required for the standard
development workflow.

## Local Development

Install dependencies through containers:

```bash
docker compose run --rm backend composer install
docker compose run --rm frontend npm install
```

Run the full stack:

```bash
docker compose up
```

Run only the backend and database:

```bash
docker compose up backend db
```

Run only the frontend:

```bash
docker compose up frontend
```

Default local URLs:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Backend health: http://localhost:8000/api/health

## Environment Files

Backend:

```bash
cp backend/.env.example backend/.env
```

Frontend:

```bash
cp frontend/.env.example frontend/.env
```

Docker entrypoints create missing local environment files automatically when
possible, but copying them explicitly makes configuration clearer.

## Common Commands

Run backend tests:

```bash
docker compose run --rm backend php artisan test
```

Run frontend build:

```bash
docker compose run --rm frontend npm run build
```

Run database migrations:

```bash
docker compose run --rm backend php artisan migrate
```
