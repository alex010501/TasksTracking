from sqlalchemy import Column, Integer, String, Date, ForeignKey, create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import datetime

DATABASE_URL = "sqlite:///./database.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    position = Column(String, nullable=True)
    start_date = Column(Date, nullable=False)
    status = Column(String, default="работает")  # работает / в отпуске / уволен
    status_start = Column(Date, nullable=True)
    status_end = Column(Date, nullable=True)


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    created_date = Column(Date, default=datetime.date.today)
    deadline = Column(Date, nullable=True)
    completed_date = Column(Date, nullable=True)
    status = Column(String, default="в работе")  # в работе / завершен / просрочено


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    created_date = Column(Date, default=datetime.date.today)
    deadline = Column(Date, nullable=False)
    completed_date = Column(Date, nullable=True)
    difficulty = Column(Integer, nullable=False)  # 1 - легко, 2 - средне, 4 - сложно
    status = Column(String, default="в работе")  # в работе / выполнено / просрочено
    executor_ids = Column(String, nullable=False)  # CSV
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
