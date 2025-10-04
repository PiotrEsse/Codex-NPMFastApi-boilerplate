# FastAPI + React Full-Stack Boilerplate

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

