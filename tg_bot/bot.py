import asyncio
import os
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, types, Router
from aiogram.enums import ParseMode
from aiogram.filters import Command
from aiogram.client.default import DefaultBotProperties
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery, BotCommand
from api_client import (
    get_all_employees,
    get_employee,
    get_employee_rating,
    get_employee_tasks,
    get_current_week_dates,
    get_current_year_month,
)
from typing import Any, Mapping

ALLOWED_STATUSES = {"в работе", "просрочено"}

load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN", "_")

bot = Bot(
    token=BOT_TOKEN,
    default=DefaultBotProperties(parse_mode=ParseMode.HTML)
)
dp = Dispatcher()
router = Router()

def field(obj, key, default=None):
    """Безопасно достаём поле как из dict, так и из ORM-объекта."""
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)

@router.message(Command("start"))
async def cmd_start(message: types.Message):
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="👥 Сотрудники", callback_data="show_employees")]
        ]
    )
    await message.answer("Добро пожаловать! Используйте кнопку ниже:", reply_markup=keyboard)

@router.callback_query(lambda c: c.data == "show_employees")
async def handle_employees_button(callback: CallbackQuery):
    await list_employees(callback.message)

@router.message(Command("employees"))
async def list_employees(message: types.Message):
    employees = get_all_employees()
    if not employees:
        await message.answer("Сотрудников не найдено.")
        return

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=emp["name"], callback_data=f"emp_{emp['id']}")]
            for emp in employees
        ]
    )
    await message.answer("Выберите сотрудника:", reply_markup=keyboard)

@router.callback_query(lambda c: c.data.startswith("emp_"))
async def show_employee_info(callback: CallbackQuery):
    emp_id = int(callback.data.split("_")[1])
    emp = get_employee(emp_id)
    if not emp:
        await callback.message.answer("Сотрудник не найден.")
        return

    year, month = get_current_year_month()
    from_date = f"{year}-{month:02d}-01"
    to_date = f"{year}-{month:02d}-31"

    score_data = get_employee_rating(emp_id, from_date, to_date) or {}
    score = score_data.get("score", "—")

    start_week, end_week = get_current_week_dates()
    tasks = get_employee_tasks(emp_id, start_week, end_week) or []

    # показываем только "в работе" и "просрочено"
    tasks = [t for t in tasks if field(t, "status") in ALLOWED_STATUSES]

    months = [
        "", "январь", "февраль", "март", "апрель", "май", "июнь",
        "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"
    ]
    month_name = months[month]

    text = (
        f"<b>👤 {field(emp,'name','—')}</b>\n"
        f"<b>📌 Должность:</b> {field(emp,'position','—')}\n"
        f"<b>📊 Статус:</b> {field(emp,'status','—')}\n"
        f"<b>🏆 Баллы за {month_name} {year}:</b> <b>{score}</b>\n\n"
        f"<b>📅 Задачи на текущую неделю:</b>\n"
    )

    if tasks:
        for t in tasks:
            text += (
                f"\n<b>• {field(t,'name','—')}</b>\n"
                f"🗓️ Дедлайн: {field(t,'deadline','—')}\n"
                f"📈 Сложность: {field(t,'difficulty','—')}\n"
                f"📍 Статус: <i>{field(t,'status','—')}</i>\n"
                f"📝 {field(t,'description','—')}\n"
            )
    else:
        text += "— задач нет"

    await callback.message.edit_text(text)

async def main():
    dp.include_router(router)

    await bot.set_my_commands([
        BotCommand(command="start", description="Запуск бота"),
        BotCommand(command="employees", description="Список сотрудников"),
    ])

    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
