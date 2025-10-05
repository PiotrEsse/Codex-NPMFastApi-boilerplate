# Backend (FastAPI)

This directory contains the FastAPI backend application. It is intentionally simple to set up inside the devcontainer environment without relying on Poetry or other advanced tooling.

## Prerequisites

- Python 3.12 (already available in the devcontainer)
- PostgreSQL and Redis services (already available in the provided Docker stack)

## Setup

1. **Install dependencies**

   ```bash
   cd Backend
   pip install -r requirements.txt
   ```

2. **Configure environment**

   Copy `.env.example` to `.env` and adjust values as needed.

   ```bash
   cp app/.env.example app/.env
   ```

3. **Run database migrations**

   ```bash
   alembic upgrade head
   ```

4. **Start the development server**

   ```bash
   uvicorn app.main:app --reload
   ```

   The API will be available at `http://localhost:8000` by default.

## Project Layout

```
Backend/
├── app/
│   ├── core/          # configuration, security utilities
│   ├── db/            # database engine, session, models
│   ├── routers/       # API routers (auth, users, health)
│   ├── schemas/       # Pydantic models
│   ├── services/      # business logic services
│   ├── dependencies.py
│   └── main.py
├── alembic/           # migrations
├── tests/             # pytest scaffolding
└── requirements.txt
```

## User Management API

The `/users` router now exposes superuser-only management endpoints in addition to the existing `/users/me` profile route:

- `GET /users/` – list all users (requires superuser)
- `POST /users/` – create a new user with optional activation and superuser flags
- `PATCH /users/{user_id}` – update profile details, roles, activation state, or reset the password
- `DELETE /users/{user_id}` – remove a user

Passwords are hashed with Argon2 via Passlib. Installing dependencies with `pip install -r requirements.txt` pulls in the required `argon2-cffi` backend automatically.

## Testing

Run pytest from the `Backend/` directory:

```bash
pytest
```

## Environment Variables

See [`app/.env.example`](app/.env.example) for all available configuration values and defaults.

