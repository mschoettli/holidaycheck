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

Set users in Dockge's stack environment. User 1 is required:

```env
HOLIDAYCHECK_USER_1_EMAIL=demo@holiday.test
HOLIDAYCHECK_USER_1_PASSWORD=holiday

HOLIDAYCHECK_USER_2_EMAIL=admin@example.com
HOLIDAYCHECK_USER_2_PASSWORD=change-me
```

## Users

Users are configured only through environment variables. Use `.env` locally or Dockge's environment editor on your server:

```env
HOLIDAYCHECK_USER_1_EMAIL=demo@holiday.test
HOLIDAYCHECK_USER_1_PASSWORD=holiday

HOLIDAYCHECK_USER_2_EMAIL=admin@example.com
HOLIDAYCHECK_USER_2_PASSWORD=change-me
```

The app reads `HOLIDAYCHECK_USER_1_EMAIL` / `HOLIDAYCHECK_USER_1_PASSWORD` through `HOLIDAYCHECK_USER_5_EMAIL` / `HOLIDAYCHECK_USER_5_PASSWORD`. User 1 is required. For production, replace the demo passwords before starting the container.

## Local Run Without Docker

```bash
HOST=127.0.0.1 HOLIDAYCHECK_USER_1_EMAIL="demo@holiday.test" HOLIDAYCHECK_USER_1_PASSWORD="holiday" npm start
```

The app listens on port `3000` by default.
