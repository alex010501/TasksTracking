from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from dependencies import get_db
from TaskBase import logic
from TaskBase.schemas import ProjectOut, ProjectCreate, ProjectUpdate, StageOut, ScoreOut

router = APIRouter(prefix="/projects", tags=["projects"])

# --- list ---
@router.get("/", response_model=List[ProjectOut])
@router.get("", response_model=List[ProjectOut], include_in_schema=False)
def list_projects(
    db: Session = Depends(get_db),
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    query: Optional[str] = None,
    status: Optional[str] = None,
):
    rows = logic.get_projects(db, from_date, to_date, query, status)
    return [ProjectOut.model_validate(r, from_attributes=True) if hasattr(ProjectOut, "model_validate") else ProjectOut.from_orm(r) for r in rows]

# --- create ---
@router.post("/", response_model=ProjectOut)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    row = logic.add_project(db, name=payload.name, description=payload.description, deadline=payload.deadline)
    return ProjectOut.model_validate(row, from_attributes=True) if hasattr(ProjectOut, "model_validate") else ProjectOut.from_orm(row)

# --- update ---
@router.put("/{project_id}", response_model=ProjectOut)
def update_project(project_id: int, payload: ProjectUpdate, db: Session = Depends(get_db)):
    row = logic.update_project(db, project_id, **payload.dict(exclude_unset=True))
    if not row:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectOut.model_validate(row, from_attributes=True) if hasattr(ProjectOut, "model_validate") else ProjectOut.from_orm(row)

# --- stages of project ---
@router.get("/{project_id}/stages", response_model=List[StageOut])
def project_stages(project_id: int, db: Session = Depends(get_db)):
    stages = logic.get_project_stages(db, project_id)
    return [StageOut.model_validate(s, from_attributes=True) if hasattr(StageOut, "model_validate") else StageOut.from_orm(s) for s in stages]

# --- tasks in a stage ---
@router.get("/{project_id}/{stage_id}/tasks", response_model=List[dict])
def stage_tasks(project_id: int, stage_id: int, db: Session = Depends(get_db)):
    return logic.get_stage_tasks(db, project_id, stage_id) or []

# --- project name ---
@router.get("/{project_id}/name", response_model=dict)
def project_name(project_id: int, db: Session = Depends(get_db)):
    name = logic.get_project_name(db, project_id)
    if not name:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"name": name}

# --- project score for period ---
@router.get("/{project_id}/score", response_model=ScoreOut)
def project_score(project_id: int, from_date: str, to_date: str, db: Session = Depends(get_db)):
    score = logic.get_project_score(db, project_id, from_date, to_date)
    return {"score": int(score or 0)}

# --- search tasks linked to projects (for Tasks page "showLinked") ---
@router.get("/task_search", response_model=List[dict])
def search_project_linked_tasks(
    db: Session = Depends(get_db),
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    query: Optional[str] = None,
    status: Optional[str] = None,
):
    return logic.search_project_tasks(db, from_date, to_date, query, status) or []