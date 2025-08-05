from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from typing import Optional, List

from TaskBase.models import Employee, Task
from TaskBase.logic import add_employee, get_employee_score, get_employee_tasks, get_top_employees
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
    status_start: Optional[date] = None
    status_end: Optional[date] = None

@router.get("/")
def get_employees(db: Session = Depends(get_db)):
    return db.query(Employee).order_by(Employee.name).all()

@router.get("/top")
def top_employees(from_date: date, to_date: date, n: int = 3, db: Session = Depends(get_db)):
    top = get_top_employees(db, from_date, to_date, top_n=n)
    return [{"employee_id": e["employee"].id, "name": e["employee"].name, "score": e["score"]} for e in top]

@router.get("/search")
def search_employees(query: str, db: Session = Depends(get_db)):
    results = db.query(Employee).filter(Employee.name.ilike(f"%{query}%")).all()
    return results

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

@router.get("/{employee_id}/score")
def employee_score(employee_id: int, from_date: date, to_date: date, db: Session = Depends(get_db)):
    score = get_employee_score(db, employee_id, from_date, to_date)
    return {"employee_id": employee_id, "score": score}

@router.get("/{employee_id}/tasks")
def employee_tasks(employee_id: int, from_date: date, to_date: date, db: Session = Depends(get_db)):
    tasks = get_employee_tasks(db, employee_id, from_date, to_date)
    return tasks