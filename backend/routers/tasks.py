from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from dependencies import get_db
from TaskBase import logic
from TaskBase.schemas import TaskCreate, TaskUpdate, TaskOut, ScoreOut

router = APIRouter(prefix="/tasks", tags=["tasks"])

# --- list unassigned (для страницы "Задачи" когда showLinked=false) ---
@router.get("/", response_model=List[dict])
@router.get("", response_model=List[dict], include_in_schema=False)
def search_unassigned(
    db: Session = Depends(get_db),
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    query: Optional[str] = None,
    status: Optional[str] = None,
):
    return logic.search_unassigned_tasks(db, from_date, to_date, query, status) or []

# --- create task ---
@router.post("/", response_model=TaskOut)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    row = logic.add_task(
        db,
        name=payload.name,
        description=payload.description or "",
        created_date=payload.created_date,  # может быть None — логика подставит today
        deadline=payload.deadline,
        completed_date=payload.completed_date,
        difficulty=payload.difficulty,
        status=payload.status,
        executor_ids=payload.executor_ids,
        project_id=payload.project_id,
        stage_id=payload.stage_id,
    )
    if not row:
        raise HTTPException(status_code=500, detail="Task not created")
    return TaskOut.model_validate(row, from_attributes=True) if hasattr(TaskOut, "model_validate") else TaskOut.from_orm(row)

# --- update task ---
@router.put("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    row = logic.update_task(db, task_id, **payload.dict(exclude_unset=True))
    if not row:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskOut.model_validate(row, from_attributes=True) if hasattr(TaskOut, "model_validate") else TaskOut.from_orm(row)

# --- score for task ---
@router.get("/{task_id}/score", response_model=ScoreOut)
def task_score(task_id: int, db: Session = Depends(get_db)):
    score = logic.get_task_score(db, task_id)
    return {"score": int(score or 0)}