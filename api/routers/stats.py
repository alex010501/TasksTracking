from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from typing import List

from TaskBase.logic import get_department_score, get_top_employees, get_tasks_in_period, get_projects_in_period
from TaskBase.models import Task, Project
from TaskBase import DEPARTMENT_NAME
from api.dependencies import get_db

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("/department_score")
def department_score(from_date: date, to_date: date, db: Session = Depends(get_db)):
    score = get_department_score(db, from_date, to_date)
    return {"score": score}

@router.get("/top_employees")
def top_employees(from_date: date, to_date: date, n: int = 3, db: Session = Depends(get_db)):
    top = get_top_employees(db, from_date, to_date, top_n=n)
    return [{"employee_id": e["employee"].id, "name": e["employee"].name, "score": e["score"]} for e in top]

@router.get("/tasks")
def tasks_in_period(from_date: date, to_date: date, db: Session = Depends(get_db)):
    tasks = get_tasks_in_period(db, from_date, to_date)
    return [{"id": t.id, "name": t.name, "status": t.status} for t in tasks]

@router.get("/projects")
def projects_in_period(from_date: date, to_date: date, db: Session = Depends(get_db)):
    projects = get_projects_in_period(db, from_date, to_date)
    return [{"id": p.id, "name": p.name, "status": p.status} for p in projects]

@router.get("/department_name")
def get_department_name():
    return {"name": DEPARTMENT_NAME}