from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from dependencies import get_db
from TaskBase import logic
from TaskBase.schemas import DepartmentNameOut, ScoreOut

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/department_name", response_model=DepartmentNameOut)
def department_name(db: Session = Depends(get_db)):
    name = logic.get_department_name(db)
    return {"department_name": name or ""}

@router.get("/department_score", response_model=ScoreOut)
def department_score(from_date: str, to_date: str, db: Session = Depends(get_db)):
    score = logic.get_department_score(db, from_date, to_date)
    return {"score": int(score or 0)}