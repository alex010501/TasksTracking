import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.enums import ParseMode
from aiogram.types import Message
from config import BOT_TOKEN
from api_client import (
    get_employee_by_telegram_id,
    get_employee_rating,
    get_employee_tasks,
    get_current_week_dates,
    get_current_year_month,
)

load_dotenv()
DEPARTMENT_NAME = os.getenv("TG_BOT_TOKEN", "_")
bot = Bot(token=BOT_TOKEN, parse_mode=ParseMode.HTML)
dp = Dispatcher()

@dp.message(commands=["start"])
async def cmd_start(message: Message):
    await message.answer("Привет! Я бот технического отдела. Используй /me, /rating или /tasks.")

@dp.message(commands=["me"])
async def cmd_me(message: Message):
    data = get_employee_by_telegram_id(message.from_user.id)
    if "id" not in data:
        await message.answer("Вы не зарегистрированы в системе.")
        return

    text = f"<b>{data['name']}</b>\nДолжность: {data.get('position', '—')}\nСтатус: {data['status']}"
    await message.answer(text)

@dp.message(commands=["rating"])
async def cmd_rating(message: Message):
    emp = get_employee_by_telegram_id(message.from_user.id)
    if "id" not in emp:
        await message.answer("Вы не зарегистрированы.")
        return

    year, month = get_current_year_month()
    score_data = get_employee_rating(emp["id"], year, month)
    score = score_data.get("score", "—")
    await message.answer(f"Ваш рейтинг за {month:02d}.{year}: <b>{score}</b> баллов.")

@dp.message(commands=["tasks"])
async def cmd_tasks(message: Message):
    emp = get_employee_by_telegram_id(message.from_user.id)
    if "id" not in emp:
        await message.answer("Вы не зарегистрированы.")
        return

    start, end = get_current_week_dates()
    tasks = get_employee_tasks(emp["id"], start, end)
    if not tasks:
        await message.answer("На эту неделю задач нет.")
        return

    text = "<b>Ваши задачи на эту неделю:</b>\n"
    for t in tasks:
        text += f"• {t['name']} (до {t['deadline']}) — <i>{t['status']}</i>\n"
    await message.answer(text)

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())