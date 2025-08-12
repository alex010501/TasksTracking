from __future__ import annotations
from datetime import date
from typing import Optional, List
from pydantic import BaseModel

# pydantic v2/v1 совместимость "from_orm"
try:
    from pydantic import ConfigDict
    ORM_CFG = {"from_attributes": True}
    def as_model(m: BaseModel, obj):  # v2
        return m.model_validate(obj, from_attributes=True)
except Exception:
    ORM_CFG = {}
    def as_model(m: BaseModel, obj):  # v1
        return m.from_orm(obj)

# ---------- Employees ----------
class EmployeeBase(BaseModel):
    name: str
    position: Optional[str] = None
    start_date: date
    status: Optional[str] = None
    status_start: Optional[date] = None
    status_end: Optional[date] = None

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[str] = None
    start_date: Optional[date] = None
    status: Optional[str] = None
    status_start: Optional[date] = None
    status_end: Optional[date] = None

class EmployeeOut(EmployeeBase):
    id: int
    try:
        model_config = ConfigDict(**ORM_CFG)  # type: ignore
    except Exception:
        class Config:
            orm_mode = True

# ---------- Projects ----------
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    deadline: Optional[date] = None
    status: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[date] = None
    status: Optional[str] = None
    completed_date: Optional[date] = None

class ProjectOut(ProjectBase):
    id: int
    try:
        model_config = ConfigDict(**ORM_CFG)  # type: ignore
    except Exception:
        class Config:
            orm_mode = True

# ---------- Stages ----------
class StageOut(BaseModel):
    id: int
    name: str
    project_id: Optional[int] = None
    try:
        model_config = ConfigDict(**ORM_CFG)  # type: ignore
    except Exception:
        class Config:
            orm_mode = True

# ---------- Tasks ----------
class TaskBase(BaseModel):
    name: str
    description: Optional[str] = ""
    created_date: Optional[date] = None
    deadline: date
    completed_date: Optional[date] = None
    difficulty: int
    status: str
    executor_ids: List[int] = []
    project_id: Optional[int] = None
    stage_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    created_date: Optional[date] = None
    deadline: Optional[date] = None
    completed_date: Optional[date] = None
    difficulty: Optional[int] = None
    status: Optional[str] = None
    executor_ids: Optional[List[int]] = None
    project_id: Optional[int] = None
    stage_id: Optional[int] = None

class TaskOut(TaskBase):
    id: int
    try:
        model_config = ConfigDict(**ORM_CFG)  # type: ignore
    except Exception:
        class Config:
            orm_mode = True

# ---------- Stats / misc ----------
class ScoreOut(BaseModel):
    score: int

class DepartmentNameOut(BaseModel):
    department_name: str

class ScoredEmployee(BaseModel):
    employee_id: int
    name: str
    score: int