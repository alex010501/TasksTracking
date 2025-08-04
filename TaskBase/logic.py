from datetime import datetime, date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from TaskBase.models import Base, Employee, Task, Project
import math

engine = create_engine("sqlite:///database.db", echo=False)
Session = sessionmaker(bind=engine)


def get_session():
    return Session()


def calculate_task_score(task: Task) -> int:
    if not task.completed_date:
        return 0

    planned_days = (task.deadline - task.created_date).days
    actual_days = (task.completed_date - task.created_date).days

    if actual_days <= planned_days:
        return task.difficulty
    if planned_days <= 0 or actual_days <= 0:
        return 0

    efficiency = planned_days / actual_days
    return math.floor(task.difficulty * efficiency)


def parse_executor_ids(task: Task) -> list[int]:
    if not task.executor_ids:
        return []
    return [int(eid) for eid in task.executor_ids.split(",") if eid.strip().isdigit()]


def get_project_score(session, project_id: int, from_date: date, to_date: date) -> int:
    tasks = session.query(Task).filter(
        Task.project_id == project_id,
        Task.completed_date != None,
        Task.completed_date >= from_date,
        Task.completed_date <= to_date
    ).all()
    return sum(calculate_task_score(task) for task in tasks)


def get_employee_score(session, employee_id: int, from_date: date, to_date: date) -> int:
    tasks = session.query(Task).filter(
        Task.completed_date != None,
        Task.completed_date >= from_date,
        Task.completed_date <= to_date
    ).all()

    total = 0
    for task in tasks:
        if employee_id in parse_executor_ids(task):
            total += calculate_task_score(task)
    return total


def get_department_score(session, from_date: date, to_date: date) -> int:
    employees = session.query(Employee).all()
    return sum(get_employee_score(session, emp.id, from_date, to_date) for emp in employees)


def get_tasks_in_period(session, from_date: date, to_date: date):
    return session.query(Task).filter(
        Task.created_date >= from_date,
        Task.created_date <= to_date
    ).all()

def get_projects_in_period(session, from_date: date, to_date: date):
    return session.query(Project).filter(
        Project.created_date >= from_date,
        Project.created_date <= to_date
    ).all()

def get_top_employees(session, from_date: date, to_date: date, top_n: int = 3):
    employees = session.query(Employee).all()
    scored = [
        {
            "employee": emp,
            "score": get_employee_score(session, emp.id, from_date, to_date)
        }
        for emp in employees
    ]
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_n]

def get_all_employees(session):
    employees = session.query(Employee).order_by(Employee.name).all()
    return employees

def create_default_project_if_not_exists(session) -> int:
    """Создает проект 'Прочие задачи', если он ещё не создан"""
    project = session.query(Project).filter(Project.name == "Прочие задачи").first()
    if not project:
        project = Project(name="Прочие задачи", deadline=None)
        session.add(project)
        session.commit()
    return project.id

def add_employee(session, name: str, position: str, start_date: date) -> Employee:
    employee = Employee(name=name, position=position, start_date=start_date)
    session.add(employee)
    session.commit()
    return employee


def add_project(session, name: str, deadline: date | None = None) -> Project:
    project = Project(name=name, deadline=deadline)
    session.add(project)
    session.commit()
    return project


def add_task(session,
             name: str,
             deadline: date,
             difficulty: int,
             executor_ids: list[int],
             project_id: int | None = None) -> Task:
    from TaskBase.models import Task
    import datetime

    if not project_id:
        project_id = create_default_project_if_not_exists(session)

    task = Task(
        name=name,
        created_date=datetime.date.today(),
        deadline=deadline,
        difficulty=difficulty,
        status="в работе",
        executor_ids=",".join(map(str, executor_ids)),
        project_id=project_id
    )
    session.add(task)
    session.commit()
    return task

def update_task_status(session, task_id: int, status: str = "выполнено") -> None:
    task = session.query(Task).get(task_id)
    if not task:
        return
    task.status = status
    if status == "выполнено":
        task.completed_date = datetime.today().date()
    session.commit()

def update_project_status(session, project_id: int, status: str = "завершен") -> None:
    project = session.query(Project).get(project_id)
    if not project:
        return
    project.status = status
    if status == "завершен":
        project.completed_date = datetime.today().date()
    session.commit()
    
def check_and_update_overdue_status(session) -> None:
    today = datetime.today().date()

    # Обновить задачи
    overdue_tasks = session.query(Task).filter(
        Task.status == "в работе",
        Task.deadline < today
    ).all()
    for task in overdue_tasks:
        task.status = "просрочено"

    # Обновить проекты
    overdue_projects = session.query(Project).filter(
        Project.status == "в работе",
        Project.deadline != None,
        Project.deadline < today
    ).all()
    for proj in overdue_projects:
        proj.status = "просрочено"

    session.commit()
