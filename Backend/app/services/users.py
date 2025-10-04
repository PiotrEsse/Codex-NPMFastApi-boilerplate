from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.db import models
from app.schemas.user import UserCreate


async def get_user_by_email(session: AsyncSession, email: str) -> models.User | None:
    result = await session.execute(select(models.User).where(models.User.email == email))
    return result.scalar_one_or_none()


async def create_user(session: AsyncSession, user_in: UserCreate) -> models.User:
    db_user = models.User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
    )
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    return db_user


async def update_user_password(session: AsyncSession, user: models.User, password: str) -> models.User:
    user.hashed_password = get_password_hash(password)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def activate_user(session: AsyncSession, user: models.User) -> models.User:
    user.is_active = True
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def get_user(session: AsyncSession, user_id: UUID) -> models.User | None:
    return await session.get(models.User, user_id)
