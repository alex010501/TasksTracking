from TaskBase.models import Base, Employee, Project, SessionLocal
from TaskBase.logic import add_employee
from datetime import date

db = SessionLocal()

add_employee(db, "Сайбель Тимофей Александрович", "Разработчик", date(2025, 3, 24))

# Проверим всех
for emp in db.query(Employee).all():
    print(emp.id, emp.name, emp.position)

for proj in db.query(Project).all():
    print(proj.id, proj.name, proj.status)

db.close()