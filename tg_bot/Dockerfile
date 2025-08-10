FROM python:3.11-slim

ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=300 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# 1) ставим зависимости (кэшируется)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2) затем код бота
COPY . .

# Если боту нужно ходить на backend внутри docker-сети — удобный дефолт:
ENV API_BASE=http://backend:8000

# Запуск (подставь свой файл/модуль, если отличается)
CMD ["python", "bot.py"]