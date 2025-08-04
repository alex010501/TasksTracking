from .models import Base, engine, SessionLocal
from dotenv import load_dotenv
import os

load_dotenv()
DEPARTMENT_NAME = os.getenv("DEPARTMENT_NAME", "Отдел не указан")

def init_db():
    """Создаёт таблицы в БД, если они не существуют."""
    Base.metadata.create_all(bind=engine)
