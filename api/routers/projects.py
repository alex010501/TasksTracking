from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from typing import Optional, List

from TaskBase.logic import add_project, get_project_score, get_project_tasks, filter_projects, get_projects_in_period
from TaskBase.models import Project
from api.dependencies import get_db

router = APIRouter(prefix="/projects", tags=["Projects"])

class ProjectCreate(BaseModel):
    name: str
    deadline: date

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    deadline: Optional[date] = None
    status: Optional[str] = None
    completed_date: Optional[date] = None

@router.get("/")
def projects_in_period(from_date: date, to_date: date, db: Session = Depends(get_db)):
    projects = get_projects_in_period(db, from_date, to_date)
    return [{"id": p.id, "name": p.name, "status": p.status} for p in projects]

@router.post("/")
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    project = add_project(db, data.name, data.deadline)
    return {"id": project.id, "name": project.name}

@router.put("/{project_id}")
def update_project(project_id: int, data: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(project, field, value)
    db.commit()
    return {"status": "updated"}

@router.get("/{project_id}/score")
def project_score(project_id: int, from_date: date, to_date: date, db: Session = Depends(get_db)):
    score = get_project_score(db, project_id, from_date, to_date)
    return {"project_id": project_id, "score": score}

@router.get("/{project_id}/tasks")
def project_tasks(project_id: int, db: Session = Depends(get_db)):
    tasks = get_project_tasks(db, project_id)
    return [{"id": t.id, "name": t.name, "status": t.status} for t in tasks]

@router.get("/search")
def search_projects(query: str, status: Optional[str] = None, db: Session = Depends(get_db)):
    projects = filter_projects(db, query=query, status=status)
    return [{"id": p.id, "name": p.name, "status": p.status} for p in projects]