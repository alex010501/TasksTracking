from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from typing import Optional

from TaskBase.logic import (
    add_project_with_stages,
    get_filtered_projects,
    get_project_score,
    get_project_name,
    get_project_stages,
    get_stage_tasks,
)
from TaskBase.models import Project
from api.dependencies import get_db

router = APIRouter(prefix="/projects", tags=["Projects"])


class ProjectCreate(BaseModel):
    name: str
    description: str
    deadline: date


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    created_date: Optional[date] = None
    deadline: Optional[date] = None
    status: Optional[str] = None
    completed_date: Optional[date] = None


@router.get("/")
def get_projects(from_date: Optional[date] = None, to_date: Optional[date] = None, query: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    return get_filtered_projects(db,
                                 from_date=from_date,
                                 to_date=to_date,
                                 query=query,
                                 status=status)


@router.post("/")
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    return add_project_with_stages(db, data.name, data.description, data.deadline)


@router.put("/{project_id}")
def update_project(project_id: int, data: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(project, field, value)
    db.commit()
    return {"status": "updated"}


@router.get("/{project_id}/name")
def project_name(project_id: int, db: Session = Depends(get_db)):
    return {"name": get_project_name(db, project_id)}


@router.get("/{project_id}/score")
def project_score(project_id: int, from_date: date, to_date: date, db: Session = Depends(get_db)):
    return {"score": get_project_score(db, project_id, from_date, to_date)}


@router.get("/{project_id}/stages")
def api_get_project_stages(project_id: int, db: Session = Depends(get_db)):
    return get_project_stages(db, project_id)


@router.get("/{project_id}/{stage_id}/tasks")
def api_get_stage_tasks(project_id: int, stage_id: int, db: Session = Depends(get_db)):
    return get_stage_tasks(db, project_id, stage_id)