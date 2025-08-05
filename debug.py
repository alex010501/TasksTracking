from TaskBase.models import Base, Employee, Project, SessionLocal
from TaskBase.logic import add_employee
from datetime import date

db = SessionLocal()

# add_employee(db, "Макровец Владимир Вячеславович", "Руководитель отдела", date(2025, 1, 1))
# add_employee(db, "Лященко Леонид Алексеевич", "Младший инженер-робототехник", date(2025, 2, 14))
# add_employee(db, "Сайбель Тимофей Александрович", "Разработчик", date(2025, 3, 24))
# add_employee(db, "Мазурин Александр Алексеевич", "Инженер-робототехник", date(2025, 4, 9))
# add_employee(db, "Финягин Даниил Николаевич", "Инженер-робототехник", date(2025, 6, 10))

# Проверим всех
for emp in db.query(Employee).all():
    print(emp.id, emp.name, emp.position)

for proj in db.query(Project).all():
    print(proj.id, proj.name, proj.status)

db.close()