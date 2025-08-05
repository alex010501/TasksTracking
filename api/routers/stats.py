from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from typing import List

from TaskBase import DEPARTMENT_NAME
from TaskBase.logic import get_department_score
from TaskBase.models import Task, Project
from api.dependencies import get_db

router = APIRouter(prefix="/stats", tags=["Statistics"])

@router.get("/department_name")
def department_name():
    return {"name": DEPARTMENT_NAME}

@router.get("/department_score")
def department_score(from_date: date, to_date: date, db: Session = Depends(get_db)):
    score = get_department_score(db, from_date, to_date)
    return {"score": score}