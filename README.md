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

The stack starts without a separate `.env` file because `docker-compose.yml` contains safe demo defaults. Change users in Dockge by setting this stack environment variable:

```env
HOLIDAYCHECK_USERS=demo@holiday.test:holiday,admin@example.com:change-me
```

## Users

Users are configured through `HOLIDAYCHECK_USERS`, either in `.env`, in Dockge's environment editor, or directly in `docker-compose.yml`:

```env
HOLIDAYCHECK_USERS=demo@holiday.test:holiday,admin@example.com:change-me
```

Format: `email:password,email2:password2`.

For production, replace the demo passwords before starting the container.

## Local Run Without Docker

```bash
HOST=127.0.0.1 HOLIDAYCHECK_USERS="demo@holiday.test:holiday" npm start
```

The app listens on port `3000` by default.
