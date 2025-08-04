from TaskBase.logic import get_session
from sqlalchemy.orm import Session

def get_db() -> Session:
    session = get_session()
    try:
        yield session
    finally:
        session.close()
