from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.db import models
from app.schemas.user import UserCreate, UserUpdate


async def get_user_by_email(session: AsyncSession, email: str) -> models.User | None:
    result = await session.execute(select(models.User).where(models.User.email == email))
    return result.scalar_one_or_none()


async def create_user(session: AsyncSession, user_in: UserCreate) -> models.User:
    db_user = models.User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_active=user_in.is_active,
        is_superuser=user_in.is_superuser,
    )
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    return db_user


async def update_user(session: AsyncSession, user: models.User, payload: UserUpdate) -> models.User:
    if payload.email is not None:
        user.email = payload.email
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.is_superuser is not None:
        user.is_superuser = payload.is_superuser
    if payload.password:
        user.hashed_password = get_password_hash(payload.password)

    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def get_user(session: AsyncSession, user_id: UUID) -> models.User | None:
    return await session.get(models.User, user_id)


async def list_users(session: AsyncSession) -> list[models.User]:
    result = await session.execute(select(models.User).order_by(models.User.created_at))
    return list(result.scalars())


async def delete_user(session: AsyncSession, user: models.User) -> None:
    await session.execute(delete(models.User).where(models.User.id == user.id))
    await session.commit()
