from dotenv import load_dotenv
import os
load_dotenv()
DEPARTMENT_NAME = os.getenv("DEPARTMENT_NAME", "Отдел не указан")