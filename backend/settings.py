from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # пароль для удаления (передаётся в заголовке X-Delete-Password)
    ADMIN_DELETE_PASSWORD: str = Field(min_length=1)

    # название подразделения (у тебя в compose задано кириллицей — ок)
    DEPARTMENT_NAME: str = "Технический блок"

    # абсолютный путь в контейнере: /db/database.db
    DATABASE_URL: str = "sqlite:////db/database.db"

    # .env опционально, переменные из docker-compose перекроют .env
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

settings = Settings()
