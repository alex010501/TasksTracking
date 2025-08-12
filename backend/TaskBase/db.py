from .models import Base, engine, SessionLocal
def init_db():
    Base.metadata.create_all(bind=engine)