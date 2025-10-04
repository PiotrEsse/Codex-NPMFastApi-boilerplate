from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthenticationError(Exception):
    """Raised when a token cannot be decoded or is invalid."""


def create_token(
    *, subject: str, expires_delta: timedelta, secret: str, algorithm: str
) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, secret, algorithm=algorithm)


def create_access_token(subject: str, expires_minutes: Optional[int] = None) -> str:
    minutes = expires_minutes or settings.access_token_expire_minutes
    return create_token(
        subject=subject,
        expires_delta=timedelta(minutes=minutes),
        secret=settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def create_refresh_token(subject: str, expires_minutes: Optional[int] = None) -> str:
    minutes = expires_minutes or settings.refresh_token_expire_minutes
    return create_token(
        subject=subject,
        expires_delta=timedelta(minutes=minutes),
        secret=settings.jwt_refresh_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def decode_token(token: str, *, secret: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, secret, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise AuthenticationError("Could not validate credentials") from exc
