from TaskBase.logic import get_session
from sqlalchemy.orm import Session
from fastapi import Header, HTTPException, status
from settings import settings

async def require_delete_password(
    password: str = Header(..., alias="X-Delete-Password")
):
    if password != settings.ADMIN_DELETE_PASSWORD:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid password")


def get_db() -> Session:
    session = get_session()
    try:
        yield session
    finally:
        session.close()
