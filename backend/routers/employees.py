from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from dependencies import get_db
from TaskBase import logic
from TaskBase.schemas import (
    EmployeeOut, EmployeeCreate, EmployeeUpdate,
    ScoredEmployee, ScoreOut
)

router = APIRouter(prefix="/employees", tags=["employees"])

# --- list ---
@router.get("/", response_model=List[EmployeeOut])
@router.get("", response_model=List[EmployeeOut], include_in_schema=False)
def list_employees(db: Session = Depends(get_db)):
    rows = logic.get_all_employees(db)
    return [EmployeeOut.model_validate(r, from_attributes=True) if hasattr(EmployeeOut, "model_validate") else EmployeeOut.from_orm(r) for r in rows]

# --- get by id ---
@router.get("/{employee_id}", response_model=EmployeeOut)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    row = logic.get_employee_by_id(db, employee_id)
    if not row:
        raise HTTPException(status_code=404, detail="Employee not found")
    return EmployeeOut.model_validate(row, from_attributes=True) if hasattr(EmployeeOut, "model_validate") else EmployeeOut.from_orm(row)

# --- search ---
@router.get("/search", response_model=List[EmployeeOut])
def search_employees(query: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    rows = logic.search_employees(db, query)
    return [EmployeeOut.model_validate(r, from_attributes=True) if hasattr(EmployeeOut, "model_validate") else EmployeeOut.from_orm(r) for r in rows]

# --- create ---
@router.post("/", response_model=EmployeeOut)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    row = logic.add_employee(
        db,
        name=payload.name,
        position=payload.position,
        start_date=payload.start_date,
        status=payload.status,
        status_start=payload.status_start,
        status_end=payload.status_end,
    )
    return EmployeeOut.model_validate(row, from_attributes=True) if hasattr(EmployeeOut, "model_validate") else EmployeeOut.from_orm(row)

# --- update ---
@router.put("/{employee_id}", response_model=EmployeeOut)
def update_employee(employee_id: int, payload: EmployeeUpdate, db: Session = Depends(get_db)):
    row = logic.update_employee(db, employee_id, **payload.dict(exclude_unset=True))
    if not row:
        raise HTTPException(status_code=404, detail="Employee not found")
    return EmployeeOut.model_validate(row, from_attributes=True) if hasattr(EmployeeOut, "model_validate") else EmployeeOut.from_orm(row)

# --- score for employee ---
@router.get("/{employee_id}/score", response_model=ScoreOut)
def employee_score(employee_id: int, from_date: str, to_date: str, db: Session = Depends(get_db)):
    score = logic.get_employee_score(db, employee_id, from_date, to_date)
    return {"score": int(score or 0)}

# --- tasks for employee (period) ---
@router.get("/{employee_id}/tasks", response_model=List[dict])  # возвращаем сырой Task JSON (фронту так удобнее)
def employee_tasks(employee_id: int, from_date: str, to_date: str, db: Session = Depends(get_db)):
    # Вернём как есть из логики (там уже сериализация под фронт)
    return logic.get_employee_tasks(db, employee_id, from_date, to_date) or []

# --- top employees ---
@router.get("/top", response_model=List[ScoredEmployee])
def top_employees(from_date: str, to_date: str, n: int = 3, db: Session = Depends(get_db)):
    data = logic.get_top_employees(db, from_date, to_date, n) or []
    out: List[ScoredEmployee] = []
    for item in data:
        if isinstance(item, dict):
            out.append(ScoredEmployee(
                employee_id=item.get("employee_id") or (item.get("employee") or {}).get("id") or 0,
                name=item.get("name") or (item.get("employee") or {}).get("name") or "",
                score=int(item.get("score") or 0),
            ))
        else:
            out.append(ScoredEmployee(
                employee_id=getattr(item, "employee_id", 0),
                name=getattr(item, "name", ""),
                score=int(getattr(item, "score", 0)),
            ))
    return out