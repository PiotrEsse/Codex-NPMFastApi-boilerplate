from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import security
from app.core.config import settings
from app.core.security import AuthenticationError
from app.schemas import auth as auth_schemas
from app.schemas import user as user_schemas
from app.services import users as user_service


async def register_user(
    session: AsyncSession, payload: auth_schemas.RegisterRequest
) -> auth_schemas.Token:
    existing_user = await user_service.get_user_by_email(session, payload.email)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user_in = user_schemas.UserCreate(
        email=payload.email, password=payload.password, full_name=payload.full_name
    )
    await user_service.create_user(session, user_in)
    return await login_user(session, auth_schemas.LoginRequest(email=payload.email, password=payload.password))


async def login_user(
    session: AsyncSession, payload: auth_schemas.LoginRequest
) -> auth_schemas.Token:
    user = await user_service.get_user_by_email(session, payload.email)
    if not user or not security.verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")

    return _issue_tokens(user.email)


def _issue_tokens(subject: str) -> auth_schemas.Token:
    access_token = security.create_access_token(subject)
    refresh_token = security.create_refresh_token(subject)
    return auth_schemas.Token(access_token=access_token, refresh_token=refresh_token)


def refresh_tokens(refresh_token: str) -> auth_schemas.Token:
    try:
        payload = security.decode_token(refresh_token, secret=settings.jwt_refresh_secret_key)
    except AuthenticationError as exc:  # pragma: no cover - defensive guard
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from exc

    subject = payload.get("sub")
    if subject is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    return _issue_tokens(subject)
