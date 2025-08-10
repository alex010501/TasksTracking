from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from routers import employees, projects, tasks, stats
from TaskBase import init_db
from TaskBase.logic import check_and_update_overdue_status

app = FastAPI(
    title="Task Tracking API"
)

init_db()

scheduler = AsyncIOScheduler()

@app.on_event("startup")
async def startup():
    # 1) единоразово на запуске
    await run_in_threadpool(check_and_update_overdue_status)

    # 2) дальше — по расписанию
    scheduler.add_job(
        check_and_update_overdue_status,
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

app.include_router(employees.router, tags=["Employees"])
app.include_router(projects.router, tags=["Projects"])
app.include_router(tasks.router, tags=["Tasks"])
app.include_router(stats.router, tags=["Statistics"])

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)