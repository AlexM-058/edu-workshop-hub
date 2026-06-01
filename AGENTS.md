# Agent Guidelines

These instructions apply to AI agents and developers working in this repository.

## Project Overview

Edu Workshop Hub is a Docker-first monorepo for a bilingual workshop management
platform for teachers.

The application has three user-facing roles:

- Professor: browses workshops, enrolls, joins waiting lists, downloads
  participation certificates.
- Referent: creates workshops, manages participants and attendance, exports
  attendance lists.
- Admin: manages users, categories, translations, and audit data.

## Instruction Sources

Before making changes, read the smallest relevant set of local documentation:

- `README.md` for setup and commands.
- `docs/business-analysis.md` for product requirements.
- `docs/project-brief.md` for product scope and workflows.
- `docs/superpowers/specs/2026-05-09-laravel-react-monorepo-design.md` for the
  current technical design.
- Any subsystem README added under `backend/`, `frontend/`, `docker/`, or `docs/`.

Do not bulk-read unrelated docs when the task is scoped to one subsystem.

## Project Structure

```text
backend/              Laravel API application
frontend/             React Vite application
docker/               Docker development images and config
docs/                 Product and technical documentation
docker-compose.yml    Local development stack
```

## Docker-First Rule

The standard workflow must work the same on macOS, Linux, and Windows.

Do not require host installations of PHP, Composer, Node, npm, PostgreSQL, or
Laravel for normal development.

Use Docker Compose commands:

```bash
docker compose up --build
docker compose run --rm backend php artisan test
docker compose run --rm --no-deps frontend npm run build
docker compose run --rm backend php artisan migrate
```

If a new command is added to the docs, provide the Docker Compose version.

## Backend Guidelines

Backend code lives in `backend/`.

Expected conventions:

- Keep HTTP routes thin.
- Put business logic in services or action classes as features grow.
- Keep role and permission checks explicit.
- Add feature tests for API behavior.
- Use migrations for schema changes.
- Keep `.env.example` safe and complete.

Important current endpoint:

```text
GET /api/health
```

Expected response:

```json
{"status":"ok","service":"backend"}
```

## Frontend Guidelines

Frontend code lives in `frontend/`.

Expected conventions:

- Keep API calls centralized under `src/lib/`.
- Keep reusable UI under `src/components/`.
- Keep route-level or page-level UI under `src/pages/` when routes are added.
- Tailwind and the Vite Tailwind plugin are build-time tooling and belong in
  `frontend/package.json` `devDependencies`, not runtime `dependencies`.
- Use clear loading, error, and normal states for data-fetching UI.
- Inline error states should be visible in the page, not only as toasts.
- Avoid duplicated CTAs in headers and empty states.
- Keep the interface usable on desktop and tablet.

Current frontend API entrypoint:

```text
frontend/src/lib/api.js
```

Current frontend i18n conventions:

- Supported UI locales are Romanian (`ro`) and German (`de`), not English.
- The language selector must switch between `ro` and `de`.
- The selected language is persisted in `localStorage` under
  `eduCraftLocale`; unsupported browser or stored locales must fall back to
  Romanian.
- Keep Romanian and German translation dictionaries synchronized when adding
  user-facing labels.
- Demo routes currently live under `/demo/*`; keep the TODO in
  `frontend/src/App.jsx` until authenticated role-based routes replace those
  public prototype paths.

## Testing Guidelines

Prefer a TDD-style loop for behavior changes:

1. Add or update a focused failing test.
2. Run the specific test and confirm the failure.
3. Implement the smallest change that makes it pass.
4. Run the relevant suite.

Minimum checks before claiming work is complete:

```bash
docker compose run --rm backend php artisan test
docker compose run --rm --no-deps frontend npm run build
```

For UI changes, also open:

```text
http://localhost:5173
```

For backend route changes, also verify:

```bash
curl http://localhost:8000/api/health
```

## Documentation Guidelines

Update documentation when behavior, setup, commands, or product scope changes.

Useful locations:

- `README.md` for public setup and project overview.
- `docs/business-analysis.md` for BA requirements.
- `docs/project-brief.md` for product scope.
- `docs/common-issues.md` for user-facing troubleshooting.
- `docs/onboarding.md` for contributor onboarding.

## Review Protocol

Classify changes by risk before final review:

- Low risk: docs copy, comments, formatting, non-behavioral text.
- Medium risk: routine frontend/backend logic, tests, local Docker config.
- High risk: auth, roles/permissions, data migrations, waiting-list promotion,
  document generation, production deployment, or security-sensitive changes.

For medium or high risk changes, explicitly check:

- Tests cover the changed behavior.
- Role access is correct.
- Error states are user-visible.
- Docker-first commands still work.
- Documentation is still accurate.

## Product Gotchas

- Waiting list promotion must preserve first-come, first-served order.
- A professor may download a participation certificate only after attendance is
  confirmed by a referent.
- Romanian and German language support should be considered when naming UI
  labels and statuses.
- Revenue figures in the referent prototype are placeholders only. Revenue is
  outside the current Referent product scope unless the product brief is updated.
- PostgreSQL is internal to Docker Compose as `db:5432`; do not expose host
  port `5432` unless there is a concrete reason.
- Backend Docker uses PHP 8.4 because the installed Laravel dependencies require
  PHP `>=8.4`.

## Commit Guidelines

Use Conventional Commit-style messages when possible:

- `feat: add workshop catalog`
- `fix: correct waiting list promotion`
- `docs: update setup guide`
- `test: cover enrollment withdrawal`
- `chore: update docker config`

Keep commits focused and avoid mixing unrelated product, infrastructure, and
formatting changes.
