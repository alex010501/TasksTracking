from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from typing import Optional, List

from TaskBase.models import Employee
from TaskBase.logic import add_employee, get_employee_score, get_all_employees
from api.dependencies import get_db

router = APIRouter(prefix="/employees", tags=["Employees"])

class EmployeeCreate(BaseModel):
    name: str
    position: str
    date_started: date

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[str] = None
    status: Optional[str] = None
    vacation_start: Optional[date] = None
    vacation_end: Optional[date] = None
    fired_date: Optional[date] = None

@router.post("/")
def create_employee(data: EmployeeCreate, db: Session = Depends(get_db)):
    employee = add_employee(db, data.name, data.position, data.date_started)
    return {"id": employee.id, "name": employee.name}

@router.put("/{employee_id}")
def update_employee(employee_id: int, data: EmployeeUpdate, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(emp, field, value)
    db.commit()
    return {"status": "updated"}

@router.get("/")
def list_employees(db: Session = Depends(get_db)):
    employees = get_all_employees(db)
    return [{"id": e.id, "name": e.name} for e in employees]

@router.get("/{employee_id}/score")
def employee_score(employee_id: int, from_date: date, to_date: date, db: Session = Depends(get_db)):
    score = get_employee_score(db, employee_id, from_date, to_date)
    return {"employee_id": employee_id, "score": score}

@router.get("/search")
def search_employees(query: str, db: Session = Depends(get_db)):
    results = db.query(Employee).filter(Employee.name.ilike(f"%{query}%")).all()
    return [{"id": e.id, "name": e.name, "position": e.position} for e in results]