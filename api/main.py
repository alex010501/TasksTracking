from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import employees, projects, tasks, stats
from TaskBase import init_db

app = FastAPI(title="Task Tracking API")

init_db()

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