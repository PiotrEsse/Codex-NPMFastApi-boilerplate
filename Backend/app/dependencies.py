from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import AuthenticationError, decode_token
from app.db.session import get_session
from app.schemas.auth import TokenPayload
from app.services.users import get_user_by_email

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_db_session() -> AsyncSession:
    async for session in get_session():
        yield session


async def get_current_user(
    token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_db_session)
):
    try:
        payload = decode_token(token, secret=settings.jwt_secret_key)
        token_data = TokenPayload(**payload)
    except AuthenticationError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials") from exc

    user = await get_user_by_email(session, token_data.sub)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")

    return user


async def get_current_active_superuser(current_user=Depends(get_current_user)):
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    return current_user
