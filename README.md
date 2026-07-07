# holidaycheck

Bilingual holiday and shopping checklist app with Docker-based user management.

Each user has a separate JSON data file in the app data volume. Checklist changes are saved automatically.

## Run From GitHub

```bash
git clone <your-github-repo-url>
cd holidaycheck
cp .env.example .env
docker compose up --build
```

Open `http://localhost:3000`.

## Data Storage

The Docker stack stores user data in the named volume `holidaycheck_data` mounted at `/app/data`.

Each configured user gets a separate database file. The app saves automatically after trip, category, or checklist changes.

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
HOLIDAYCHECK_LANGUAGE=de
TZ=Europe/Zurich
WATCHTOWER_SCHEDULE=0 0 4 * * *
WATCHTOWER_HTTP_API_TOKEN=holidaycheck-update-token
DOCKER_API_VERSION=1.44

HOLIDAYCHECK_USER_1_NAME=Admin
HOLIDAYCHECK_USER_1_PASSWORD=Change-this-password!2026

HOLIDAYCHECK_USER_2_NAME=
HOLIDAYCHECK_USER_2_PASSWORD=
```

## Users

Users are configured only through the separate `.env` file referenced by `env_file` in `docker-compose.yml`:

```env
HOLIDAYCHECK_USER_1_NAME=Admin
HOLIDAYCHECK_USER_1_PASSWORD=Change-this-password!2026

HOLIDAYCHECK_USER_2_NAME=
HOLIDAYCHECK_USER_2_PASSWORD=
```

The app reads `HOLIDAYCHECK_USER_1_NAME` / `HOLIDAYCHECK_USER_1_PASSWORD` through `HOLIDAYCHECK_USER_5_NAME` / `HOLIDAYCHECK_USER_5_PASSWORD`. User 1 is required. Usernames and passwords are exact and may contain uppercase, lowercase, numbers, and special characters. For production, replace the demo passwords before starting the container. Do not commit your real `.env`.

Legacy `HOLIDAYCHECK_USER_1_EMAIL` style variables are still accepted as usernames so older Dockge stacks do not crash, but the clean setup should use `NAME`.

## Language

Set the app language in the separate `.env` file:

```env
HOLIDAYCHECK_LANGUAGE=de
```

Allowed values are `de` and `en`. The language switch is intentionally not shown in the UI.

## Watchtower

The compose stack includes Watchtower with label mode enabled. It checks for updates every day at 04:00 by default and cleans old images after updating.

The update icon in the app checks the current commit against GitHub `main`. If an update is available, a red dot appears. Clicking `Update laden` calls the internal Watchtower HTTP API with `WATCHTOWER_HTTP_API_TOKEN`.

If Watchtower logs `client version 1.25 is too old`, keep `DOCKER_API_VERSION=1.44` in the stack `.env`. The Watchtower service is limited to three failed restarts so it does not loop endlessly if Docker rejects the API version.

Watchtower updates registry images, not raw Git build contexts. This repository therefore includes a GitHub Actions workflow that publishes:

```text
ghcr.io/mschoettli/holidaycheck:latest
```

If the GHCR package is private, log in to `ghcr.io` on the Docker host or make the package public in GitHub Packages. Dockge can still rebuild directly from the GitHub context, while Watchtower can update from GHCR once the image exists.

## Dockge Troubleshooting

If Dockge logs still say `Set HOLIDAYCHECK_USER_1_EMAIL`, the running image is old. Pull the latest repository state in Dockge and force a rebuild/recreate of the stack. The current container logs start with `holidaycheck dockge-github-main`. If the old message repeats, remove the old `holidaycheck` container/image in Dockge and deploy again so the GitHub build context is fetched fresh.

The current app no longer exits when the user env is missing. It keeps running and shows a login setup error until the separate `.env` file is fixed.

Make sure the separate `.env` file belongs to the Dockge stack and contains at least:

```env
HOLIDAYCHECK_USER_1_NAME=Admin
HOLIDAYCHECK_USER_1_PASSWORD=Change-this-password!2026
```

## Local Run Without Docker

```bash
HOST=127.0.0.1 HOLIDAYCHECK_USER_1_NAME="Admin" HOLIDAYCHECK_USER_1_PASSWORD="Change-this-password!2026" npm start
```

The app listens on port `3000` by default.
