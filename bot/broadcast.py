from __future__ import annotations

import argparse
import asyncio
import logging
from dataclasses import dataclass

from aiogram import Bot
from aiogram.exceptions import TelegramAPIError

from bot.config import Settings, load_settings
from bot.users_sync import fetch_all_user_ids

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class BroadcastResult:
    total: int
    sent: int
    failed: int


async def broadcast_message(
    settings: Settings,
    bot: Bot,
    text: str,
    *,
    user_ids: list[int] | None = None,
    delay_seconds: float = 0.05,
) -> BroadcastResult:
    targets = user_ids if user_ids is not None else await fetch_all_user_ids(settings)

    sent = 0
    failed = 0

    for user_id in targets:
        try:
            await bot.send_message(chat_id=user_id, text=text)
            sent += 1
        except TelegramAPIError as error:
            failed += 1
            logger.warning("Failed to send to %s: %s", user_id, error)

        if delay_seconds > 0:
            await asyncio.sleep(delay_seconds)

    return BroadcastResult(total=len(targets), sent=sent, failed=failed)


def parse_user_ids(raw: str | None) -> list[int]:
    if not raw:
        return []
    return [int(part.strip()) for part in raw.split(",") if part.strip()]


async def run_cli() -> None:
    parser = argparse.ArgumentParser(description="Yamin Space — рассылка уведомлений в Telegram")
    parser.add_argument("message", nargs="?", help="Текст сообщения")
    parser.add_argument("--all", action="store_true", help="Отправить всем user_id из Supabase")
    parser.add_argument("--user", type=int, help="Отправить одному Telegram user_id")
    parser.add_argument("--ids", type=str, help="Список id через запятую: 123,456")
    args = parser.parse_args()

    if not args.message:
        parser.error("Укажите текст сообщения")

    settings = load_settings()
    bot = Bot(token=settings.bot_token)

    try:
        if args.user:
            user_ids = [args.user]
        elif args.ids:
            user_ids = parse_user_ids(args.ids)
        elif args.all:
            user_ids = None
        else:
            parser.error("Укажите --all, --user или --ids")

        result = await broadcast_message(settings, bot, args.message, user_ids=user_ids)
        print(f"total={result.total} sent={result.sent} failed={result.failed}")
    finally:
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(run_cli())
