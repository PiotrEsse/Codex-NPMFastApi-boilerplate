from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.core.config import settings
from app.db.session import engine
from app.routers import auth, health, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        yield
    finally:
        await engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(title=settings.project_name, lifespan=lifespan)

    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

    allow_origins = settings.backend_cors_origins or ["*"]
    allow_credentials = settings.cors_allow_credentials
    if "*" in allow_origins:
        allow_origins = ["*"]
        allow_credentials = False

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=allow_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(auth.router)
    app.include_router(users.router)

    return app


app = create_app()
