# holidaycheck

Bilingual holiday and shopping checklist app with Docker-based user management.

## Run From GitHub

```bash
git clone <your-github-repo-url>
cd holidaycheck
docker compose up --build
```

Open `http://localhost:3000`.

## Users

Users are configured directly in `docker-compose.yml`:

```yaml
environment:
  HOLIDAYCHECK_USERS: "demo@holiday.test:holiday,admin@example.com:change-me"
```

Format: `email:password,email2:password2`.

For production, replace the demo passwords before starting the container.

## Local Run Without Docker

```bash
HOST=127.0.0.1 HOLIDAYCHECK_USERS="demo@holiday.test:holiday" npm start
```

The app listens on port `3000` by default.
