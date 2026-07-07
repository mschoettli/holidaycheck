# holidaycheck

Bilingual holiday and shopping checklist app with Docker-based user management.

## Run From GitHub

```bash
git clone <your-github-repo-url>
cd holidaycheck
cp .env.example .env
docker compose up --build
```

Open `http://localhost:3000`.

## Dockge

Use this repository URL in Dockge:

```text
https://github.com/mschoettli/holidaycheck.git
```

The compose file builds directly from GitHub:

```yaml
build:
  context: https://github.com/mschoettli/holidaycheck.git#main
  dockerfile: Dockerfile
```

Create a separate `.env` file for the stack. User 1 is required:

```env
HOLIDAYCHECK_PORT=3000
SESSION_TTL_SECONDS=86400

HOLIDAYCHECK_USER_1_NAME=demo
HOLIDAYCHECK_USER_1_PASSWORD=holiday

HOLIDAYCHECK_USER_2_NAME=admin
HOLIDAYCHECK_USER_2_PASSWORD=change-me
```

## Users

Users are configured only through the separate `.env` file referenced by `env_file` in `docker-compose.yml`:

```env
HOLIDAYCHECK_USER_1_NAME=demo
HOLIDAYCHECK_USER_1_PASSWORD=holiday

HOLIDAYCHECK_USER_2_NAME=admin
HOLIDAYCHECK_USER_2_PASSWORD=change-me
```

The app reads `HOLIDAYCHECK_USER_1_NAME` / `HOLIDAYCHECK_USER_1_PASSWORD` through `HOLIDAYCHECK_USER_5_NAME` / `HOLIDAYCHECK_USER_5_PASSWORD`. User 1 is required. For production, replace the demo passwords before starting the container. Do not commit your real `.env`.

## Local Run Without Docker

```bash
HOST=127.0.0.1 HOLIDAYCHECK_USER_1_NAME="demo" HOLIDAYCHECK_USER_1_PASSWORD="holiday" npm start
```

The app listens on port `3000` by default.
