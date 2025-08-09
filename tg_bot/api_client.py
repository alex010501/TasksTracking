import os
import requests
from datetime import date, timedelta

API_BASE_URL = "http://127.0.0.1:8080"
os.environ["NO_PROXY"] = "localhost,127.0.0.1"

def safe_json_get(url):
    try:
        response = requests.get(url, proxies={"http": None, "https": None})
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"[ERROR] {url} — {e}")
        print(f"[TEXT] {response.text}")
        return None

def get_all_employees():
    return safe_json_get(f"{API_BASE_URL}/employees/") or []

def get_employee(employee_id: int):
    return safe_json_get(f"{API_BASE_URL}/employees/{employee_id}") or {}

def get_employee_rating(employee_id: int, from_date: str, to_date: str):
    return safe_json_get(
        f"{API_BASE_URL}/employees/{employee_id}/score?from_date={from_date}&to_date={to_date}"
    ) or {}

def get_employee_tasks(employee_id: int, from_date: str, to_date: str):
    return safe_json_get(
        f"{API_BASE_URL}/employees/{employee_id}/tasks?from_date={from_date}&to_date={to_date}"
    ) or []

def get_current_week_dates():
    today = date.today()
    start = today - timedelta(days=today.weekday())
    end = start + timedelta(days=6)
    return start.isoformat(), end.isoformat()

def get_current_year_month():
    today = date.today()
    return today.year, today.month