from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import (
    get_current_active_superuser,
    get_current_user,
    get_db_session,
)
from app.schemas.user import UserAdminCreate, UserAdminUpdate, UserRead
from app.services import users as user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
async def read_current_user(current_user=Depends(get_current_user)):
    return current_user


@router.get("/", response_model=list[UserRead])
async def list_users(
    session: AsyncSession = Depends(get_db_session),
    _: None = Depends(get_current_active_superuser),
):
    return await user_service.list_users(session)


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserAdminCreate,
    session: AsyncSession = Depends(get_db_session),
    _: None = Depends(get_current_active_superuser),
):
    existing_user = await user_service.get_user_by_email(session, payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    return await user_service.create_user(session, payload)


@router.patch("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: UUID,
    payload: UserAdminUpdate,
    session: AsyncSession = Depends(get_db_session),
    _: None = Depends(get_current_active_superuser),
):
    user = await user_service.get_user(session, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.email and payload.email != user.email:
        existing_user = await user_service.get_user_by_email(session, payload.email)
        if existing_user and existing_user.id != user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

    return await user_service.update_user(session, user, payload)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    _: None = Depends(get_current_active_superuser),
):
    user = await user_service.get_user(session, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    await user_service.delete_user(session, user)
