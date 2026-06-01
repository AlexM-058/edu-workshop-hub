# Common Issues

This project is Docker-first. Do not install PHP, Composer, Node, npm,
PostgreSQL, or Laravel on the host machine for normal development.

## Dashboard Routes Redirect To Landing Page

Symptom: visiting `/dashboard/professor` or `/dashboard/referent` directly
redirects to `/`.

Cause: The dashboard routes are protected by a client-side session guard
(`src/components/RequireAuth.jsx`). A session is written to `sessionStorage`
only when a role is selected through the login modal on the landing page.
Direct URL access or a new tab will always redirect because `sessionStorage`
is tab-scoped.

This is intentional. The session guard is a **prototype mock** — it uses
`src/lib/auth.js` backed by `sessionStorage`. When backend Google OAuth is
implemented, replace `login`, `logout`, and `getSession` in `src/lib/auth.js`
with real session/token logic. The guard itself (`RequireAuth.jsx`) does not
need to change.

## Docker Compose Hangs On `php:8.4-cli`

Symptom:

```text
load metadata for docker.io/library/php:8.4-cli
```

Cause:

The backend image is built from `php:8.4-cli`. If that image is not available
locally yet, Docker must download it from Docker Hub before the backend can be
built. On a new machine this can look like the project is stuck.

Fix:

```bash
docker pull php:8.4-cli
docker compose up --build
```

If the pull fails, check that Docker Desktop or Docker Engine is running and
that the machine can reach Docker Hub.

## pgAdmin Fails With `network not found` On Windows

Symptom:

```text
Error response from daemon: failed to set up container networking: network ... not found
```

Cause:

A Docker Desktop race condition on Windows where the auto-generated default
network ID becomes stale between creation and the moment the pgAdmin container
tries to attach to it.

Fix:

```bash
docker compose down -v
docker network prune
docker compose --profile dev up --build
```

The project uses an explicit `appnet` bridge network to avoid this issue, but
if it recurs after an abrupt Docker Desktop restart, the prune above clears any
orphaned network state.

## pgAdmin: First Login And Server Connection

Open http://localhost:5050 and log in with:

- **Email:** `admin@admin.com`
- **Password:** `secret`

To connect to the project database, right-click *Servers* → **Register →
Server** and fill in:

| Field | Value |
| --- | --- |
| Name | `edu-workshop-hub` |
| Host | `db` |
| Port | `5432` |
| Database | `edu_workshop_hub` |
| Username | `edu_workshop_hub` |
| Password | `secret` |

## Tables Not Visible In pgAdmin

Migrations must be run explicitly after the database container is healthy.
If the tables are missing, run:

```bash
docker compose run --rm backend php artisan migrate
```

Then refresh the *Tables* node in pgAdmin (right-click → Refresh).

## First Setup Checklist

Run these commands from the repository root:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose pull
docker pull php:8.4-cli
docker compose run --rm backend composer install
docker compose run --rm frontend npm install
docker compose run --rm backend php artisan key:generate
docker compose run --rm backend php artisan migrate
docker compose --profile dev up --build
```

Then verify the backend:

```bash
curl http://localhost:8000/api/health
```

Expected response:

```json
{"status":"ok","service":"backend"}
```
