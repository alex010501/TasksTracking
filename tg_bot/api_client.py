import requests
from datetime import date, timedelta

API_BASE_URL = "http://localhost:8080"

def get_employee_by_telegram_id(telegram_id: int):
    return requests.get(f"{API_BASE_URL}/api/employees/by_telegram/{telegram_id}").json()

def get_employee_rating(employee_id: int, year: int, month: int):
    return requests.get(f"{API_BASE_URL}/api/employee/{employee_id}/score?year={year}&month={month}").json()

def get_employee_tasks(employee_id: int, from_date: str, to_date: str):
    return requests.get(
        f"{API_BASE_URL}/api/tasks/employee/{employee_id}?from={from_date}&to={to_date}"
    ).json()

def get_current_week_dates():
    today = date.today()
    start = today - timedelta(days=today.weekday())
    end = start + timedelta(days=6)
    return start.isoformat(), end.isoformat()

def get_current_year_month():
    today = date.today()
    return today.year, today.month
