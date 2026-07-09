from __future__ import annotations

import asyncio
import logging
from typing import Any, Awaitable, Callable

from aiogram import BaseMiddleware, Bot, Dispatcher, F, Router
from aiogram.filters import Command, CommandStart
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    MenuButtonWebApp,
    Message,
    TelegramObject,
    WebAppInfo,
)

from config import Settings, load_settings
from users_sync import sync_user_to_supabase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = Router()


class SettingsMiddleware(BaseMiddleware):
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def __call__(
        self,
        handler: Callable[[TelegramObject, dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: dict[str, Any],
    ) -> Any:
        data["settings"] = self.settings
        return await handler(event, data)


def webapp_keyboard(settings: Settings) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🕌 Открыть Yamin Space",
                    web_app=WebAppInfo(url=settings.webapp_url),
                ),
            ],
        ],
    )


def is_admin(settings: Settings, username: str | None) -> bool:
    if not username:
        return False
    return username.lower().lstrip("@") == settings.admin_username.lower()


@router.message(CommandStart())
async def cmd_start(message: Message, settings: Settings) -> None:
    user = message.from_user
    if not user:
        return

    try:
        await sync_user_to_supabase(settings, user)
    except Exception as error:
        logger.exception("Failed to sync user on /start: %s", error)

    welcome = (
        "Ассаляму алейкум! 👋\n\n"
        "Добро пожаловать в <b>Yamin Space</b> — мусульманское пространство для обучения:\n"
        "• арабский язык и словарь\n"
        "• викторины и академия\n"
        "• библиотека книг и хадисов\n"
        "• тасбих и намаз по Бишкеку\n\n"
        "Нажмите кнопку ниже, чтобы открыть приложение. "
        "Также его можно запустить через кнопку меню слева от поля ввода."
    )

    await message.answer(
        welcome,
        parse_mode="HTML",
        reply_markup=webapp_keyboard(settings),
    )


@router.message(Command("app"))
async def cmd_app(message: Message, settings: Settings) -> None:
    await message.answer(
        "Откройте WebApp одним нажатием:",
        reply_markup=webapp_keyboard(settings),
    )


@router.message(Command("notify"), F.from_user)
async def cmd_notify(message: Message, settings: Settings, bot: Bot) -> None:
    user = message.from_user
    if not user or not is_admin(settings, user.username):
        await message.answer("Команда доступна только администратору.")
        return

    parts = (message.text or "").split(maxsplit=2)
    if len(parts) < 3:
        await message.answer("Формат: /notify <telegram_user_id> <текст сообщения>")
        return

    try:
        target_id = int(parts[1])
    except ValueError:
        await message.answer("user_id должен быть числом.")
        return

    text = parts[2].strip()
    if not text:
        await message.answer("Текст сообщения не может быть пустым.")
        return

    try:
        await bot.send_message(chat_id=target_id, text=text)
        await message.answer(f"✅ Отправлено пользователю {target_id}")
    except Exception as error:
        await message.answer(f"❌ Не удалось отправить: {error}")


@router.message(Command("broadcast"), F.from_user)
async def cmd_broadcast(message: Message, settings: Settings, bot: Bot) -> None:
    user = message.from_user
    if not user or not is_admin(settings, user.username):
        await message.answer("Команда доступна только администратору.")
        return

    text = (message.text or "").partition(" ")[2].strip()
    if not text:
        await message.answer("Формат: /broadcast <текст для всех пользователей>")
        return

    from broadcast import broadcast_message

    await message.answer("⏳ Запускаю рассылку...")
    result = await broadcast_message(settings, bot, text)
    await message.answer(
        f"Готово.\n"
        f"Всего: {result.total}\n"
        f"Успешно: {result.sent}\n"
        f"Ошибок: {result.failed}",
    )


async def main() -> None:
    settings = load_settings()
    bot = Bot(token=settings.bot_token)
    dispatcher = Dispatcher()
    dispatcher.update.middleware(SettingsMiddleware(settings))
    dispatcher.include_router(router)

    @dispatcher.startup()
    async def _on_startup() -> None:
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(
                text="🕌 Yamin Space",
                web_app=WebAppInfo(url=settings.webapp_url),
            ),
        )
        logger.info("Menu WebApp button set to %s", settings.webapp_url)

    logger.info("Yamin Space bot started (polling)")
    await dispatcher.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
