from .models import Base, engine

def init_db():
    """Создаёт таблицы в БД, если они не существуют."""
    Base.metadata.create_all(engine)