from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from routers import employees, projects, tasks, stats
from TaskBase import init_db
from TaskBase.logic import check_and_update_overdue_status
from TaskBase.models import SessionLocal

app = FastAPI(
    title="Task Tracking API"
)

init_db()

scheduler = AsyncIOScheduler()

def _overdue_job():
    """Синхронная джоба для APScheduler: сама открывает и закрывает сессию."""
    db = SessionLocal()
    try:
        check_and_update_overdue_status(db)
    finally:
        db.close()

@app.on_event("startup")
async def startup():
    # Разовая проверка при запуске
    _overdue_job()
    # Ежедневно в 00:10
    scheduler.add_job(
        _overdue_job,
        CronTrigger(hour=0, minute=10),
        id="overdue_daily",
        replace_existing=True,
        coalesce=True,
        max_instances=1,
    )
    scheduler.start()

@app.on_event("shutdown")
async def shutdown():
    scheduler.shutdown(wait=False)

# Роутеры уже содержат prefix и tags внутри себя
app.include_router(employees.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(stats.router)

# CORS только для локальной разработки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)