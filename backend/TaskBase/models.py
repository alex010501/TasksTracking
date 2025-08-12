# TaskBase/models.py
from __future__ import annotations
import os, datetime
from sqlalchemy import create_engine, Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from sqlalchemy.engine.url import make_url

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database.db")

# Для SQLite нужен check_same_thread=False, для остальных СУБД — нет
backend = make_url(DATABASE_URL).get_backend_name()
connect_args = {"check_same_thread": False} if backend == "sqlite" else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, future=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

# --- модели (без изменений по схеме) ---
class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    position = Column(String, nullable=True)
    start_date = Column(Date, nullable=False)

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    deadline = Column(Date, nullable=True)
    stages = relationship("ProjectStage", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="project")

class ProjectStage(Base):
    __tablename__ = "project_stages"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    project = relationship("Project", back_populates="stages")
    tasks = relationship("Task", back_populates="stage")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_date = Column(Date, nullable=False, default=datetime.date.today)  # default на ORM-уровне
    deadline = Column(Date, nullable=False)
    completed_date = Column(Date, nullable=True)
    difficulty = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default="в работе")
    executor_ids = Column(String, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    stage_id = Column(Integer, ForeignKey("project_stages.id"), nullable=True)
    project = relationship("Project", back_populates="tasks")
    stage = relationship("ProjectStage", back_populates="tasks")

def init_db() -> None:
    Base.metadata.create_all(bind=engine)