# TaskBase/logic.py
from __future__ import annotations

from datetime import date, datetime
from typing import Iterable, List, Optional, Sequence, Dict, Any

from sqlalchemy import and_, or_, func
from sqlalchemy.orm import Session

from TaskBase.models import (
    SessionLocal,
    Employee,
    Project,
    ProjectStage,
    Task,
)

# ----------------- utils -----------------

def get_session() -> Session:
    return SessionLocal()

def _parse_date(d: Optional[str | date]) -> Optional[date]:
    if d is None:
        return None
    if isinstance(d, date):
        return d
    return date.fromisoformat(d)

def _csv_to_list(csv: Optional[str]) -> List[int]:
    if not csv:
        return []
    out: List[int] = []
    for x in str(csv).split(","):
        x = x.strip()
        if not x:
            continue
        try:
            v = int(x)
            if v not in out:
                out.append(v)
        except ValueError:
            continue
    return out

def _list_to_csv(iterable: Iterable[int]) -> str:
    uniq: List[int] = []
    for x in iterable or []:
        try:
            v = int(x)
            if v not in uniq:
                uniq.append(v)
        except (TypeError, ValueError):
            continue
    return ",".join(str(v) for v in uniq)

def _serialize_task(t: Task) -> Dict[str, Any]:
    return {
        "id": t.id,
        "name": t.name,
        "description": (t.description or ""),
        "created_date": t.created_date.isoformat() if isinstance(t.created_date, date) else str(t.created_date or ""),
        "deadline": t.deadline.isoformat() if isinstance(t.deadline, date) else str(t.deadline or ""),
        "completed_date": t.completed_date.isoformat() if isinstance(t.completed_date, date) else (t.completed_date or None),
        "difficulty": int(t.difficulty or 0),
        "status": t.status or "в работе",
        "executor_ids": _csv_to_list(t.executor_ids),
        "project_id": t.project_id,
        "stage_id": t.stage_id,
    }

# ----------------- Employees -----------------

def get_all_employees(session: Session) -> List[Employee]:
    return session.query(Employee).order_by(Employee.id.asc()).all()

def get_employee_by_id(session: Session, employee_id: int) -> Optional[Employee]:
    return session.get(Employee, employee_id)

def search_employees(session: Session, query: str) -> List[Employee]:
    q = f"%{query.strip()}%"
    # кросс-SQLite регистр: lower(name) like lower(q)
    return (
        session.query(Employee)
        .filter(func.lower(Employee.name).like(func.lower(q)))
        .order_by(Employee.id.asc())
        .all()
    )

def add_employee(
    session: Session,
    name: str,
    position: Optional[str] = None,
    start_date: date | str = None,
    status: Optional[str] = None,
    status_start: Optional[date | str] = None,
    status_end: Optional[date | str] = None,
) -> Employee:
    emp = Employee(
        name=name.strip(),
        position=(position or None),
        start_date=_parse_date(start_date) or date.today(),
    )
    # если в модели есть поля статуса — заполним
    try:
        emp.status = status
        emp.status_start = _parse_date(status_start)
        emp.status_end = _parse_date(status_end)
    except Exception:
        pass
    session.add(emp)
    session.commit()
    session.refresh(emp)
    return emp

def update_employee(session: Session, employee_id: int, **fields) -> Optional[Employee]:
    emp = session.get(Employee, employee_id)
    if not emp:
        return None
    for k in ("name", "position"):
        if k in fields and fields[k] is not None:
            setattr(emp, k, fields[k].strip() if isinstance(fields[k], str) else fields[k])
    if "start_date" in fields and fields["start_date"] is not None:
        emp.start_date = _parse_date(fields["start_date"])
    for k in ("status", "status_start", "status_end"):
        if k in fields:
            try:
                setattr(emp, k, _parse_date(fields[k]) if k.endswith("_start") or k.endswith("_end") else fields[k])
            except Exception:
                pass
    session.commit()
    session.refresh(emp)
    return emp

def get_employee_tasks(session: Session, employee_id: int, from_date: date | str, to_date: date | str) -> List[Dict[str, Any]]:
    fd = _parse_date(from_date) or date.min
    td = _parse_date(to_date) or date.max
    tasks: List[Task] = (
        session.query(Task)
        .filter(
            or_(
                Task.executor_ids == str(employee_id),
                Task.executor_ids.like(f"{employee_id},%"),
                Task.executor_ids.like(f"%,{employee_id},%"),
                Task.executor_ids.like(f"%,{employee_id}"),
            ),
            Task.created_date >= fd,
            Task.created_date <= td,
        )
        .order_by(Task.id.asc())
        .all()
    )
    return [_serialize_task(t) for t in tasks]

def _task_score(t: Task) -> int:
    return int(t.difficulty or 0) if (t.status or "").lower() == "выполнено" else 0

def get_employee_score(session: Session, employee_id: int, from_date: date | str, to_date: date | str) -> int:
    fd = _parse_date(from_date) or date.min
    td = _parse_date(to_date) or date.max
    tasks: List[Task] = (
        session.query(Task)
        .filter(
            or_(
                Task.executor_ids == str(employee_id),
                Task.executor_ids.like(f"{employee_id},%"),
                Task.executor_ids.like(f"%,{employee_id},%"),
                Task.executor_ids.like(f"%,{employee_id}"),
            ),
            Task.created_date >= fd,
            Task.created_date <= td,
        )
        .all()
    )
    return sum(_task_score(t) for t in tasks)

def get_top_employees(session: Session, from_date: date | str, to_date: date | str, limit: int = 5) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    emps = session.query(Employee).all()
    for emp in emps:
        s = get_employee_score(session, emp.id, from_date, to_date)
        out.append({"employee_id": emp.id, "name": emp.name, "score": int(s)})
    out.sort(key=lambda x: x["score"], reverse=True)
    return out[: max(0, limit)]

# ----------------- Projects & stages -----------------

def add_project(session: Session, name: str, description: Optional[str] = None, deadline: Optional[date | str] = None) -> Project:
    p = Project(
        name=name.strip(),
        description=(description or None),
        deadline=_parse_date(deadline),
    )
    session.add(p)
    session.commit()
    session.refresh(p)
    return p

def update_project(session: Session, project_id: int, **fields) -> Optional[Project]:
    p = session.get(Project, project_id)
    if not p:
        return None
    if "name" in fields and fields["name"] is not None:
        p.name = fields["name"].strip()
    if "description" in fields:
        p.description = fields["description"]
    if "deadline" in fields and fields["deadline"] is not None:
        p.deadline = _parse_date(fields["deadline"])
    if "status" in fields:
        try:
            p.status = fields["status"]
        except Exception:
            pass
    if "completed_date" in fields and fields["completed_date"] is not None:
        try:
            p.completed_date = _parse_date(fields["completed_date"])
        except Exception:
            pass
    session.commit()
    session.refresh(p)
    return p

def get_projects(session: Session, from_date: Optional[date | str] = None, to_date: Optional[date | str] = None,
                 query: Optional[str] = None, status: Optional[str] = None) -> List[Project]:
    q = session.query(Project)
    if query:
        like = f"%{query.strip()}%"
        q = q.filter(func.lower(Project.name).like(func.lower(like)))
    if status:
        # поле status может отсутствовать; пробуем безопасно
        try:
            q = q.filter(Project.status == status)
        except Exception:
            pass
    fd = _parse_date(from_date) if from_date else None
    td = _parse_date(to_date) if to_date else None
    if fd and td:
        # проекты с задачами в периоде ИЛИ по дедлайну
        q = (
            q.join(Task, Task.project_id == Project.id, isouter=True)
            .filter(
                or_(
                    and_(Task.id.isnot(None), Task.created_date >= fd, Task.created_date <= td),
                    and_(Project.deadline.isnot(None), Project.deadline >= fd, Project.deadline <= td),
                )
            )
            .distinct()
        )
    return q.order_by(Project.id.asc()).all()

def get_project_name(session: Session, project_id: int) -> Optional[str]:
    p = session.get(Project, project_id)
    return p.name if p else None

def get_project_stages(session: Session, project_id: int) -> List[ProjectStage]:
    return (
        session.query(ProjectStage)
        .filter(ProjectStage.project_id == project_id)
        .order_by(ProjectStage.id.asc())
        .all()
    )

def get_stage_tasks(session: Session, project_id: int, stage_id: int) -> List[Dict[str, Any]]:
    rows: List[Task] = (
        session.query(Task)
        .filter(Task.project_id == project_id, Task.stage_id == stage_id)
        .order_by(Task.id.asc())
        .all()
    )
    return [_serialize_task(t) for t in rows]

def get_project_score(session: Session, project_id: int, from_date: date | str, to_date: date | str) -> int:
    fd = _parse_date(from_date) or date.min
    td = _parse_date(to_date) or date.max
    tasks: List[Task] = (
        session.query(Task)
        .filter(Task.project_id == project_id, Task.created_date >= fd, Task.created_date <= td)
        .all()
    )
    return sum(_task_score(t) for t in tasks)

def search_project_tasks(session: Session, from_date: Optional[date | str] = None, to_date: Optional[date | str] = None,
                         query: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
    q = session.query(Task).filter(Task.project_id.isnot(None))
    fd = _parse_date(from_date) if from_date else None
    td = _parse_date(to_date) if to_date else None
    if fd:
        q = q.filter(Task.created_date >= fd)
    if td:
        q = q.filter(Task.created_date <= td)
    if status:
        q = q.filter(Task.status == status)
    if query:
        like = f"%{query.strip()}%"
        q = q.filter(func.lower(Task.name).like(func.lower(like)))
    rows = q.order_by(Task.id.asc()).all()
    return [_serialize_task(t) for t in rows]

# ----------------- Tasks -----------------

def add_task(
    session: Session,
    name: str,
    description: Optional[str],
    deadline: date | str,
    difficulty: int,
    executor_ids: List[int],
    project_id: Optional[int] = None,
    stage_id: Optional[int] = None,
    created_date: Optional[date | str] = None,
    status: Optional[str] = None,
    completed_date: Optional[date | str] = None,
) -> Task:
    task = Task(
        name=name.strip(),
        description=(description or ""),
        created_date=_parse_date(created_date) or date.today(),
        deadline=_parse_date(deadline) or date.today(),
        completed_date=_parse_date(completed_date) if completed_date else None,
        difficulty=int(difficulty),
        status=status or "в работе",
        executor_ids=_list_to_csv(executor_ids),
        project_id=project_id,
        stage_id=stage_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

def update_task(session: Session, task_id: int, **fields) -> Optional[Task]:
    t = session.get(Task, task_id)
    if not t:
        return None
    if "name" in fields and fields["name"] is not None:
        t.name = fields["name"].strip()
    if "description" in fields and fields["description"] is not None:
        t.description = fields["description"]
    if "created_date" in fields and fields["created_date"] is not None:
        t.created_date = _parse_date(fields["created_date"])
    if "deadline" in fields and fields["deadline"] is not None:
        t.deadline = _parse_date(fields["deadline"])
    if "completed_date" in fields:
        t.completed_date = _parse_date(fields["completed_date"]) if fields["completed_date"] else None
    if "difficulty" in fields and fields["difficulty"] is not None:
        t.difficulty = int(fields["difficulty"])
    if "status" in fields and fields["status"] is not None:
        t.status = fields["status"]
    if "executor_ids" in fields and fields["executor_ids"] is not None:
        if isinstance(fields["executor_ids"], str):
            t.executor_ids = fields["executor_ids"]
        else:
            t.executor_ids = _list_to_csv(fields["executor_ids"])
    if "project_id" in fields:
        t.project_id = fields["project_id"]
    if "stage_id" in fields:
        t.stage_id = fields["stage_id"]
    session.commit()
    session.refresh(t)
    return t

def get_task_score(session: Session, task_id: int) -> int:
    t = session.get(Task, task_id)
    if not t:
        return 0
    return _task_score(t)

def search_unassigned_tasks(session: Session, from_date: Optional[date | str] = None, to_date: Optional[date | str] = None,
                            query: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
    q = session.query(Task).filter(Task.project_id.is_(None), Task.stage_id.is_(None))
    fd = _parse_date(from_date) if from_date else None
    td = _parse_date(to_date) if to_date else None
    if fd:
        q = q.filter(Task.created_date >= fd)
    if td:
        q = q.filter(Task.created_date <= td)
    if status:
        q = q.filter(Task.status == status)
    if query:
        like = f"%{query.strip()}%"
        q = q.filter(func.lower(Task.name).like(func.lower(like)))
    rows = q.order_by(Task.id.asc()).all()
    return [_serialize_task(t) for t in rows]

# ----------------- Department stats (простейшие-заглушки) -----------------

def get_department_name(session: Session) -> str:
    # при желании — брать из настроек; сейчас просто возвращаем строку
    return "Отдел"

def get_department_score(session: Session, from_date: date | str, to_date: date | str) -> int:
    fd = _parse_date(from_date) or date.min
    td = _parse_date(to_date) or date.max
    tasks: List[Task] = (
        session.query(Task)
        .filter(Task.created_date >= fd, Task.created_date <= td)
        .all()
    )
    return sum(_task_score(t) for t in tasks)

def check_and_update_overdue_status(session: Session) -> None:
    """Помечает просроченные задачи статусом 'просрочено', если они ещё не выполнены."""
    today = date.today()
    (
        session.query(Task)
        .filter(Task.status != "выполнено", Task.deadline < today)
        .update({"status": "просрочено"}, synchronize_session=False)
    )
    session.commit()