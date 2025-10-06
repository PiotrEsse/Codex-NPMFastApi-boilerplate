from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None


class UserCreate(UserBase):
    password: str
    is_active: bool = True
    is_superuser: bool = False


class UserRead(UserBase):
    id: UUID
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None
    password: str | None = None
    is_active: bool | None = None
    is_superuser: bool | None = None


class UserAdminCreate(UserCreate):
    pass


class UserAdminUpdate(UserUpdate):
    pass
