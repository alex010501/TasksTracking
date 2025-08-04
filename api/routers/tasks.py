from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import date
from typing import List, Optional

from TaskBase.models import Task
from TaskBase.logic import add_task, calculate_task_score
from api.dependencies import get_db

router = APIRouter(prefix="/tasks", tags=["Tasks"])

class TaskCreate(BaseModel):
    name: str
    difficulty: int = Field(..., ge=1, le=4)
    deadline: date
    executor_ids: List[int]
    project_id: Optional[int] = None

class TaskUpdate(BaseModel):
    name: Optional[str] = None
    difficulty: Optional[int] = Field(None, ge=1, le=4)
    deadline: Optional[date] = None
    status: Optional[str] = None
    completed_date: Optional[date] = None
    executor_ids: Optional[List[int]] = None

@router.post("/")
def create_task(data: TaskCreate, db: Session = Depends(get_db)):
    task = add_task(
        db,
        name=data.name,
        difficulty=data.difficulty,
        deadline=data.deadline,
        executor_ids=data.executor_ids,
        project_id=data.project_id
    )
    return {"id": task.id, "name": task.name}

@router.put("/{task_id}")
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    return {"status": "updated"}

@router.get("/{task_id}/score")
def task_score(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    score = calculate_task_score(task)
    return {"task_id": task_id, "score": score}

@router.get("/search")
def search_tasks(query: str, db: Session = Depends(get_db)):
    results = db.query(Task).filter(Task.name.ilike(f"%{query}%")).all()
    return [{"id": t.id, "name": t.name, "status": t.status} for t in results]