from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db_session

router = APIRouter(tags=["health"])


@router.get("/health", summary="Service health check")
async def healthcheck(session: AsyncSession = Depends(get_db_session)):
    await session.execute(text("SELECT 1"))
    return {"status": "ok"}
