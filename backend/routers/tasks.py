from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import date
from typing import List, Optional

from TaskBase.models import Task
from TaskBase.logic import add_task, calculate_task_score, filter_tasks_in_period
from dependencies import get_db

router = APIRouter(prefix="/tasks", tags=["Tasks"])

class TaskCreate(BaseModel):
    name: str
    description: str
    difficulty: int = Field(..., ge=1, le=4)
    deadline: date
    executor_ids: List[int]
    project_id: Optional[int] = None
    stage_id: Optional[int] = None

class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[int] = Field(None, ge=1, le=4)
    created_date: Optional[date] = None
    deadline: Optional[date] = None
    status: Optional[str] = None
    completed_date: Optional[date] = None
    executor_ids: Optional[List[int]] = None

@router.get("/")
def tasks_in_period(from_date: Optional[date] = None, to_date: Optional[date] = None, query: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    tasks = filter_tasks_in_period(db,
                                   from_date=from_date,
                                   to_date=to_date,
                                   query=query,
                                   status=status)
    unlinked = [t for t in tasks if t.project_id is None]
    return unlinked

@router.post("/")
def create_task(data: TaskCreate, db: Session = Depends(get_db)):
    task = add_task(
        db,
        name=data.name,
        description=data.description,
        difficulty=data.difficulty,
        deadline=data.deadline,
        executor_ids=data.executor_ids,
        project_id=data.project_id,
        stage_id=data.stage_id
    )
    return {"id": task.id, "name": task.name}

@router.put("/{task_id}")
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for field, value in data.dict(exclude_unset=True).items():
        # если поле executor_ids — преобразуем список в строку
        if field == "executor_ids" and isinstance(value, list):
            value = ",".join(str(i) for i in value)
        setattr(task, field, value)

    db.commit()
    return {"status": "updated"}

@router.get("/{task_id}/score")
def task_score(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    score = calculate_task_score(task)
    return {"score": score}