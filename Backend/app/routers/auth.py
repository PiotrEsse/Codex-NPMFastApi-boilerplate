from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db_session
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, Token
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token)
async def register(payload: RegisterRequest, session: AsyncSession = Depends(get_db_session)):
    return await auth_service.register_user(session, payload)


@router.post("/login", response_model=Token)
async def login(payload: LoginRequest, session: AsyncSession = Depends(get_db_session)):
    return await auth_service.login_user(session, payload)


@router.post("/refresh", response_model=Token)
async def refresh(payload: RefreshRequest):
    return auth_service.refresh_tokens(payload.refresh_token)
