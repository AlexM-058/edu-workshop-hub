# Common Issues

This project is Docker-first. Do not install PHP, Composer, Node, npm,
PostgreSQL, or Laravel on the host machine for normal development.

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
docker compose up --build
```

Then verify the backend:

```bash
curl http://localhost:8000/api/health
```

Expected response:

```json
{"status":"ok","service":"backend"}
```
