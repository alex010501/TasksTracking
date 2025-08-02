from datetime import date
from sqlalchemy import and_, func
from TaskBase.models import session, Task, Project, Employee


def task_in_time(task: Task) -> bool:
    """Проверка, выполнена ли задача в срок (до дедлайна проекта, если есть)."""
    if not task.is_completed or not task.completion_date:
        return False
    if task.project and task.project.deadline:
        return task.completion_date <= task.project.deadline
    return True


def get_employee_efficiency(employee_id: int, start_date: date, end_date: date) -> int:
    """Считает эффективность сотрудника за период."""
    tasks = session.query(Task).filter(
        Task.assignee_id == employee_id,
        Task.is_completed == True,
        Task.completion_date >= start_date,
        Task.completion_date <= end_date
    ).all()

    return sum(task.weight for task in tasks if task_in_time(task))


def get_project_efficiency(project_id: int, start_date: date, end_date: date) -> int:
    """Считает суммарную эффективность всех сотрудников по проекту."""
    tasks = session.query(Task).filter(
        Task.project_id == project_id,
        Task.is_completed == True,
        Task.completion_date >= start_date,
        Task.completion_date <= end_date
    ).all()

    return sum(task.weight for task in tasks if task_in_time(task))


def get_department_efficiency(start_date: date, end_date: date) -> dict:
    """Считает эффективность всех сотрудников по отделу."""
    employees = session.query(Employee).all()
    return {
        emp.name: get_employee_efficiency(emp.id, start_date, end_date)
        for emp in employees
    }