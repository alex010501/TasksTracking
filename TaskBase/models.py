from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey, Date, Text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import date

Base = declarative_base()
engine = create_engine("sqlite:///data/taskbase.db", echo=False)
Session = sessionmaker(bind=engine)
session = Session()

# --------------------
# МОДЕЛИ
# --------------------

class Employee(Base):
    __tablename__ = 'employees'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    position = Column(String)
    department = Column(String)
    hireDate = Column(Date)

    tasks = relationship("Task", back_populates="assignee")

    @staticmethod
    def create(name: str, position: str = "", department: str = "", hDate: date = None):
        emp = Employee(name=name, position=position, department=department, hireDate=hDate)
        session.add(emp)
        session.commit()
        return emp

    def update(self, name=None, position=None, department=None):
        if name: self.name = name
        if position: self.position = position
        if department: self.department = department
        session.commit()


class Project(Base):
    __tablename__ = 'projects'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    startDate = Column(Date)
    endDate = Column(Date)

    tasks = relationship("Task", back_populates="project")

    @staticmethod
    def create(name: str, description: str = "", deadline: date = None):
        proj = Project(name=name, description=description, deadline=deadline)
        session.add(proj)
        session.commit()
        return proj

    def update(self, name=None, description=None, deadline=None):
        if name: self.name = name
        if description: self.description = description
        if deadline: self.deadline = deadline
        session.commit()


class Task(Base):
    __tablename__ = 'tasks'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    weight = Column(Integer, default=1)  # 1=легко, 2=средне, 4=сложно
    is_completed = Column(Boolean, default=False)
    completion_date = Column(Date)

    assignee_id = Column(Integer, ForeignKey('employees.id'), nullable=False)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=True)

    assignee = relationship("Employee", back_populates="tasks")
    project = relationship("Project", back_populates="tasks")

    @staticmethod
    def create(name: str, assignee_id: int, description: str = "", weight: int = 1,
               project_id: int = None, completion_date: date = None):
        task = Task(
            name=name,
            description=description,
            weight=weight,
            assignee_id=assignee_id,
            project_id=project_id,
            completion_date=completion_date
        )
        session.add(task)
        session.commit()
        return task

    def update(self, name=None, description=None, weight=None,
               is_completed=None, completion_date=None, project_id=None, assignee_id=None):
        if name: self.name = name
        if description: self.description = description
        if weight is not None: self.weight = weight
        if is_completed is not None: self.is_completed = is_completed
        if completion_date: self.completion_date = completion_date
        if project_id is not None: self.project_id = project_id
        if assignee_id is not None: self.assignee_id = assignee_id
        session.commit()
