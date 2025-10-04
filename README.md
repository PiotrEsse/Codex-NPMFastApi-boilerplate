# FastAPI + React Full-Stack Boilerplate


This repository is a universal starter kit for projects that need a FastAPI backend and a React (Vite + TypeScript) frontend living side-by-side inside the same VS Code devcontainer. It is tuned for the provided Docker stack (Python 3.12, Node.js 20, PostgreSQL, Redis) so you can focus on building features instead of wiring infrastructure.

## What You Get

- **Production-ready authentication flow** – FastAPI endpoints for register/login/refresh, JWT access + refresh tokens, password hashing, and a persisted session on the frontend.
- **Async SQLAlchemy setup** – PostgreSQL-backed user model, Alembic migrations, and pytest scaffolding for future tests.
- **Typed React frontend** – Vite, React Router, React Query, Tailwind CSS, and an auth-aware dashboard with protected routing.
- **Developer ergonomics** – Simple `requirements.txt` + `npm install` workflow, `.env.example` templates, and docs in each app to guide setup.

## Repository Layout

```
./
├── Backend/      # FastAPI project (see Backend/README.md)
├── Frontend/     # React + Vite project (see Frontend/README.md)
└── README.md     # This overview
```

### Backend Highlights
- Located in [`Backend/`](Backend/README.md) with a clear separation between configuration, database models, services, and routers.
- Ships with an initial Alembic migration that creates the `users` table and a `/health` endpoint that checks database connectivity.
- Includes pytest setup (`Backend/tests`) and environment configuration via `.env` (copy from `Backend/app/.env.example`).

### Frontend Highlights
- Located in [`Frontend/`](Frontend/README.md) and bootstrapped with Vite for fast dev experience.
- Authentication context manages tokens, persists sessions, and automatically refreshes access tokens through Axios interceptors.
- Prebuilt pages: Login, Register, and a protected Dashboard consuming the `/users/me` endpoint.

## Quick Start

1. **Open the repository inside your VS Code devcontainer.** The container already has Python, Node.js, PostgreSQL, and Redis running via the provided Docker stack.
2. **Prepare the backend.**
   ```bash
   cd Backend
   cp app/.env.example app/.env
   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app.main:app --reload
   ```
   The API is available at `http://localhost:8000`.
3. **Prepare the frontend (in a new terminal).**
   ```bash
   cd Frontend
   cp .env.example .env
   npm install
   npm run dev
   ```
   The frontend is served at `http://localhost:5173`.
4. **Login and explore.** Register a new user, then sign in to reach the protected dashboard. The frontend will keep your session active by refreshing tokens in the background.

## Next Steps for Your Project

- Add new routers, models, and services in the backend to match your domain.
- Extend the frontend with additional pages, components, and API hooks.
- Introduce CI/CD, linting, type checking, or containerized deployment as needed.

For detailed configuration options, troubleshooting tips, and architecture notes, consult the READMEs inside the [`Backend`](Backend/README.md) and [`Frontend`](Frontend/README.md) directories.
=======
This repository provides a batteries-included starting point for new full-stack projects using FastAPI on the backend and React (Vite + TypeScript) on the frontend. The structure is designed for use with VS Code devcontainers and a Docker stack that already includes PostgreSQL and Redis.

## Project Structure

```
./
├── Backend/
│   ├── app/
│   │   ├── core/
│   │   ├── db/
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── services/
│   ├── alembic/
│   ├── tests/
│   └── requirements.txt
├── Frontend/
│   ├── public/
│   └── src/
└── README.md (this file)
```

## Getting Started

1. Open the repository inside your VS Code devcontainer.
2. Follow the backend and frontend setup steps in their respective README files:
   - [Backend/README.md](Backend/README.md)
   - [Frontend/README.md](Frontend/README.md)

## Features

- FastAPI backend with JWT-based authentication and PostgreSQL persistence.
- React (Vite + TypeScript) frontend with React Query, React Router, and a simple authenticated dashboard.
- Shared authentication flow (login, register, token refresh, and `/users/me`).
- Alembic migrations and pytest scaffolding ready for extension.

## Next Steps

- Extend models and routers to match your application's domain.
- Add CI/CD workflows, linting, or additional tooling as needed.
- Configure production deployment (Docker, cloud services, etc.).


