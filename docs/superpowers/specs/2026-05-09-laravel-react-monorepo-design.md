# Laravel React Monorepo Design

## Context

The repository will be reset around the real product skeleton. The existing
`railway-csv-mvp/` directory is an unrelated experiment and will be removed
during implementation.

The project will use a monorepo layout with a Laravel API backend and a
separate React Vite frontend. Supporting project documentation and Docker
configuration will live at the repository root.

## Goals

- Create a clean Laravel backend in `backend/`.
- Create a clean React Vite frontend in `frontend/`.
- Add project documentation in `docs/`.
- Add Docker configuration in `docker/` and root Compose files.
- Keep backend and frontend independently runnable in development.
- Prepare a simple API contract between the frontend and backend.

## Non-Goals

- Implement product features beyond the starter health/API wiring.
- Add authentication in the initial skeleton.
- Add production deployment automation beyond Docker-ready structure.
- Preserve the existing Railway CSV MVP.

## Repository Structure

```text
edu-workshop-hub/
  backend/              Laravel API application
  frontend/             React Vite SPA
  docs/                 Project documentation and specs
  docker/               Docker service definitions and config
  docker-compose.yml    Local development orchestration
  README.md             Root setup and development guide
```

## Backend Design

The backend will be a standard Laravel application scoped to `backend/`.

Responsibilities:

- Expose API routes from `routes/api.php`.
- Provide a health endpoint for local and Docker verification.
- Configure CORS for the Vite dev origin.
- Own database migrations, models, controllers, policies, and API resources.
- Keep web routes minimal unless the product later needs server-rendered pages.

Initial expected endpoint:

```text
GET /api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "backend"
}
```

## Frontend Design

The frontend will be a standalone React Vite app scoped to `frontend/`.

Responsibilities:

- Render the client application from `src/main.jsx`.
- Keep route-level UI in `src/pages/`.
- Keep reusable UI in `src/components/`.
- Centralize API calls in `src/lib/api.js`.
- Read the backend URL from `VITE_API_URL`.

Initial UI:

- Show the project name.
- Call `GET /api/health`.
- Display backend connection status.

## Docker Design

Docker files will be prepared for local development, not final production.

Planned services:

- `backend`: PHP/Laravel runtime.
- `frontend`: Node/Vite runtime.
- `db`: database service, likely PostgreSQL unless implementation constraints
  favor MySQL.

The root `docker-compose.yml` will make the common local workflow explicit. The
plain local workflow without Docker will remain supported.

## Documentation Design

The root README will explain:

- Project structure.
- Local setup without Docker.
- Local setup with Docker.
- Backend and frontend development commands.
- Environment file setup.

The `docs/` directory will contain:

- Design specs under `docs/superpowers/specs/`.
- Future architecture notes and product documents.

## Data Flow

```text
React Vite frontend
  -> HTTP requests through src/lib/api.js
  -> Laravel API routes under /api
  -> Laravel controllers/services
  -> Database when features require persistence
```

The frontend will not call the database directly. Backend API responses define
the contract consumed by React.

## Error Handling

The initial frontend API client will handle:

- Backend unavailable.
- Non-2xx HTTP responses.
- Unexpected response shapes.

The backend health endpoint will return a stable JSON response suitable for
manual checks, frontend checks, and Docker health checks.

## Testing And Verification

Initial verification should include:

- Laravel test or route check for `GET /api/health`.
- Frontend build check.
- Optional Docker Compose boot check after the base images are configured.

The skeleton is considered complete when:

- `backend/` and `frontend/` exist and run independently.
- The frontend can call the backend health endpoint.
- Root documentation explains setup.
- Docker files are present for local development.
- The unrelated MVP directory is removed.

