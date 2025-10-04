# Frontend (React + Vite)

The frontend is a Vite + React + TypeScript application styled with Tailwind CSS. It communicates with the FastAPI backend for authentication and user information.

## Prerequisites

- Node.js 20 (available in the devcontainer)

## Setup

1. **Install dependencies**

   ```bash
   cd Frontend
   npm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env` and adjust the API base URL if needed.

   ```bash
   cp .env.example .env
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

   The app will be served on `http://localhost:5173` by default.

4. **Run tests**

   ```bash
   npm run test
   ```

## Project Layout

```
Frontend/
├── public/
└── src/
    ├── api/
    ├── auth/
    ├── components/
    ├── pages/
    └── main.tsx
```

## Environment Variables

See [`.env.example`](.env.example) for configuration options.

