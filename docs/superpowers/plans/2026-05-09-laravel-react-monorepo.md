# Laravel React Monorepo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the initial monorepo skeleton with a Laravel API backend, React Vite frontend, documentation, Docker development setup, and no unrelated MVP files.

**Architecture:** The repository root coordinates two independent applications: `backend/` for the Laravel API and `frontend/` for the React Vite SPA. Docker provides the portable local runtime for PHP, Composer, Node, npm, Vite, and PostgreSQL so macOS, Linux, and Windows developers use the same commands.

**Tech Stack:** Laravel, PHP 8.4, React, Vite, Node 24, PostgreSQL 16, Docker Compose.

---

## File Structure

- Delete: `railway-csv-mvp/`
- Modify: `README.md` root project guide
- Modify: `.gitignore` root ignore rules
- Create: `backend/` Laravel application
- Create: `frontend/` React Vite application
- Create: `docker/backend/Dockerfile` PHP backend development image
- Create: `docker/backend/entrypoint.sh` backend startup helper
- Create: `docker/frontend/Dockerfile` Node frontend development image
- Create: `docker/postgres/init/.gitkeep` tracked database init directory marker
- Create: `docker-compose.yml` local development orchestration
- Keep: `docs/superpowers/specs/2026-05-09-laravel-react-monorepo-design.md`
- Keep: `docs/superpowers/plans/2026-05-09-laravel-react-monorepo.md`

## Task 1: Clean Repository Root

**Files:**
- Delete: `railway-csv-mvp/`
- Modify: `README.md`
- Modify: `.gitignore`

- [ ] **Step 1: Remove the unrelated MVP directory**

Run:

```bash
rm -rf railway-csv-mvp
```

Expected: `railway-csv-mvp/` no longer exists.

- [ ] **Step 2: Replace root README with project scaffold guide**

Write `README.md`:

```markdown
# Edu Workshop Hub

Monorepo for the Edu Workshop Hub platform.

## Structure

- `backend/` - Laravel API application
- `frontend/` - React Vite SPA
- `docker/` - Docker development images and config
- `docs/` - project documentation, specs, and plans

## Local Development

The frontend runs through Docker, so host Node/npm versions do not matter:

```bash
docker compose up frontend
```

The backend also runs through Docker, so PHP and Composer do not need to be
installed globally:

```bash
docker compose up backend db
```

Run the full stack:

```bash
docker compose up
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
```

- [ ] **Step 3: Update root `.gitignore`**

Write `.gitignore`:

```gitignore
.DS_Store

# Dependencies
backend/vendor/
frontend/node_modules/

# Environment files
backend/.env
frontend/.env

# Build output
frontend/dist/

# Laravel generated files
backend/storage/*.key
backend/storage/framework/cache/data/*
backend/storage/framework/sessions/*
backend/storage/framework/views/*
backend/storage/logs/*.log

# Docker/local data
.docker-data/
```

- [ ] **Step 4: Verify cleanup**

Run:

```bash
test ! -d railway-csv-mvp
git status --short
```

Expected: no `railway-csv-mvp/` files remain except as deletions in Git status.

## Task 2: Scaffold Laravel Backend

**Files:**
- Create: `backend/`
- Modify: `backend/routes/api.php`
- Modify: `backend/tests/Feature/HealthTest.php`
- Modify: `backend/.env.example`

- [ ] **Step 1: Create Laravel project using Composer through Docker**

Run:

```bash
docker run --rm -v "$PWD":/app -w /app composer:2 create-project laravel/laravel backend
```

Expected: `backend/artisan`, `backend/composer.json`, and `backend/routes/` exist.

- [ ] **Step 2: Add health endpoint test**

Write `backend/tests/Feature/HealthTest.php`:

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthTest extends TestCase
{
    public function test_health_endpoint_returns_ok_response(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertOk()
            ->assertJson([
                'status' => 'ok',
                'service' => 'backend',
            ]);
    }
}
```

- [ ] **Step 3: Run backend test and confirm it fails before route exists**

Run:

```bash
docker run --rm -v "$PWD/backend":/app -w /app composer:2 php artisan test --filter=HealthTest
```

Expected: FAIL because `/api/health` is not implemented yet.

- [ ] **Step 4: Add the health API route**

Write or update `backend/routes/api.php` so it contains:

```php
<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'backend',
    ]);
});
```

- [ ] **Step 5: Configure backend example environment for Docker**

Update the database and URL fields in `backend/.env.example`:

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

- [ ] **Step 6: Run backend test and confirm it passes**

Run:

```bash
docker run --rm -v "$PWD/backend":/app -w /app composer:2 php artisan test --filter=HealthTest
```

Expected: PASS for `HealthTest`.

- [ ] **Step 7: Commit backend scaffold**

Run:

```bash
git add backend README.md .gitignore
git commit -m "Scaffold Laravel backend"
```

Expected: commit succeeds.

## Task 3: Scaffold React Vite Frontend

**Files:**
- Create: `frontend/`
- Create: `frontend/.env.example`
- Modify: `frontend/src/App.jsx`
- Create: `frontend/src/lib/api.js`
- Modify: `frontend/src/App.css`
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Create React Vite project through Docker**

Run:

```bash
docker run --rm -v "$PWD":/app -w /app node:24-alpine sh -lc "npm create vite@latest frontend -- --template react"
```

Expected: `frontend/package.json`, `frontend/src/main.jsx`, and `frontend/src/App.jsx` exist.

- [ ] **Step 2: Install frontend dependencies through Docker**

Run:

```bash
docker run --rm -v "$PWD/frontend":/app -w /app node:24-alpine npm install
```

Expected: `frontend/node_modules/` and `frontend/package-lock.json` exist.

- [ ] **Step 3: Add frontend API environment example**

Write `frontend/.env.example`:

```dotenv
VITE_API_URL=http://localhost:8000/api
```

- [ ] **Step 4: Add API client**

Write `frontend/src/lib/api.js`:

```js
const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export async function getHealth() {
  const response = await fetch(`${apiBaseUrl}/health`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Backend responded with ${response.status}`);
  }

  const payload = await response.json();

  if (payload.status !== 'ok' || payload.service !== 'backend') {
    throw new Error('Backend health response is invalid');
  }

  return payload;
}
```

- [ ] **Step 5: Add starter application UI**

Write `frontend/src/App.jsx`:

```jsx
import { useEffect, useState } from 'react';
import './App.css';
import { getHealth } from './lib/api';

function App() {
  const [healthState, setHealthState] = useState({
    status: 'loading',
    message: 'Checking backend connection...',
  });

  useEffect(() => {
    let isMounted = true;

    getHealth()
      .then((payload) => {
        if (!isMounted) return;
        setHealthState({
          status: 'online',
          message: `${payload.service} is ${payload.status}`,
        });
      })
      .catch((error) => {
        if (!isMounted) return;
        setHealthState({
          status: 'offline',
          message: error.message,
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="status-panel">
        <p className="eyebrow">Edu Workshop Hub</p>
        <h1>Learning operations workspace</h1>
        <p className="summary">
          Laravel API and React Vite are split into focused applications inside
          one repository.
        </p>
        <div className={`status-pill status-pill--${healthState.status}`}>
          <span aria-hidden="true" />
          {healthState.message}
        </div>
      </section>
    </main>
  );
}

export default App;
```

- [ ] **Step 6: Add starter styles**

Write `frontend/src/App.css`:

```css
.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 48px 24px;
  background: #f5f7fb;
  color: #172033;
}

.status-panel {
  width: min(720px, 100%);
  border: 1px solid #d8deea;
  border-radius: 8px;
  background: #ffffff;
  padding: 40px;
  box-shadow: 0 16px 40px rgb(23 32 51 / 8%);
}

.eyebrow {
  margin: 0 0 12px;
  color: #4b6bfb;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.5rem);
  line-height: 1.05;
}

.summary {
  margin: 20px 0 28px;
  max-width: 56ch;
  color: #536072;
  font-size: 1.05rem;
  line-height: 1.65;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  border-radius: 999px;
  padding: 0 16px;
  border: 1px solid #d8deea;
  background: #f9fbff;
  color: #334155;
  font-weight: 700;
}

.status-pill span {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #f59e0b;
}

.status-pill--online span {
  background: #22c55e;
}

.status-pill--offline span {
  background: #ef4444;
}
```

Write `frontend/src/index.css`:

```css
:root {
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  color: #172033;
  background: #f5f7fb;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}
```

- [ ] **Step 7: Build frontend through Docker**

Run:

```bash
docker run --rm -v "$PWD/frontend":/app -w /app node:24-alpine npm run build
```

Expected: Vite build succeeds and creates `frontend/dist/`.

- [ ] **Step 8: Commit frontend scaffold**

Run:

```bash
git add frontend README.md .gitignore
git commit -m "Scaffold React Vite frontend"
```

Expected: commit succeeds.

## Task 4: Add Docker Development Setup

**Files:**
- Create: `docker/backend/Dockerfile`
- Create: `docker/backend/entrypoint.sh`
- Create: `docker/frontend/Dockerfile`
- Create: `docker/postgres/init/.gitkeep`
- Create: `docker-compose.yml`
- Modify: `README.md`

- [ ] **Step 1: Add backend Dockerfile**

Write `docker/backend/Dockerfile`:

```dockerfile
FROM php:8.4-cli

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY docker/backend/entrypoint.sh /usr/local/bin/backend-entrypoint
RUN chmod +x /usr/local/bin/backend-entrypoint

EXPOSE 8000

ENTRYPOINT ["backend-entrypoint"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
```

- [ ] **Step 2: Add backend entrypoint**

Write `docker/backend/entrypoint.sh`:

```sh
#!/bin/sh
set -e

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi

if [ ! -d vendor ]; then
  composer install
fi

if [ -f artisan ] && ! grep -q '^APP_KEY=base64:' .env; then
  php artisan key:generate --force
fi

exec "$@"
```

- [ ] **Step 3: Add frontend Dockerfile**

Write `docker/frontend/Dockerfile`:

```dockerfile
FROM node:24-alpine

WORKDIR /app

EXPOSE 5173

CMD ["sh", "-c", "npm install && npm run dev -- --host 0.0.0.0"]
```

- [ ] **Step 4: Add Compose file**

Write `docker-compose.yml`:

```yaml
services:
  backend:
    build:
      context: .
      dockerfile: docker/backend/Dockerfile
    working_dir: /var/www/html
    volumes:
      - ./backend:/var/www/html
    ports:
      - "8000:8000"
    environment:
      APP_ENV: local
      APP_URL: http://localhost:8000
      FRONTEND_URL: http://localhost:5173
      DB_CONNECTION: pgsql
      DB_HOST: db
      DB_PORT: 5432
      DB_DATABASE: edu_workshop_hub
      DB_USERNAME: edu_workshop_hub
      DB_PASSWORD: secret
    depends_on:
      - db

  frontend:
    build:
      context: .
      dockerfile: docker/frontend/Dockerfile
    working_dir: /app
    volumes:
      - ./frontend:/app
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:8000/api
    depends_on:
      - backend

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: edu_workshop_hub
      POSTGRES_USER: edu_workshop_hub
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./docker/postgres/init:/docker-entrypoint-initdb.d

volumes:
  postgres-data:
```

- [ ] **Step 5: Add tracked database init directory marker**

Run:

```bash
mkdir -p docker/postgres/init
touch docker/postgres/init/.gitkeep
```

Expected: `docker/postgres/init/.gitkeep` exists.

- [ ] **Step 6: Validate Docker Compose config**

Run:

```bash
docker compose config
```

Expected: Compose renders a valid configuration without errors.

- [ ] **Step 7: Commit Docker setup**

Run:

```bash
git add docker docker-compose.yml README.md
git commit -m "Add Docker development setup"
```

Expected: commit succeeds.

## Task 5: Final Verification

**Files:**
- Modify if needed: `README.md`
- Modify if needed: `backend/routes/api.php`
- Modify if needed: `frontend/src/lib/api.js`

- [ ] **Step 1: Run backend tests through Docker Compose**

Run:

```bash
docker compose run --rm backend php artisan test --filter=HealthTest
```

Expected: PASS for `HealthTest`.

- [ ] **Step 2: Run frontend build through Docker**

Run:

```bash
docker run --rm -v "$PWD/frontend":/app -w /app node:24-alpine npm run build
```

Expected: Vite build succeeds.

- [ ] **Step 3: Start full stack**

Run:

```bash
docker compose up --build
```

Expected:

- Backend listens on `http://localhost:8000`.
- Frontend listens on `http://localhost:5173`.
- PostgreSQL listens on the internal Compose host `db:5432`.

- [ ] **Step 4: Check backend health endpoint**

Run in another shell while Compose is running:

```bash
curl http://localhost:8000/api/health
```

Expected:

```json
{"status":"ok","service":"backend"}
```

- [ ] **Step 5: Commit final docs or fixes**

Run:

```bash
git status --short
git add README.md backend frontend docker docker-compose.yml .gitignore
git commit -m "Verify monorepo skeleton"
```

Expected: commit succeeds if verification required final file changes. If there
are no changes, skip the commit.
