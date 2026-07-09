from __future__ import annotations

import asyncio
import logging
from typing import TYPE_CHECKING

import httpx
from aiogram.exceptions import TelegramAPIError
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from bot.prayer_times import bishkek_now_hm, bishkek_today_key, fetch_bishkek_prayer_times
from bot.users_sync import fetch_namaz_subscriber_ids

if TYPE_CHECKING:
    from aiogram import Bot

    from bot.config import Settings

logger = logging.getLogger(__name__)

_scheduler: AsyncIOScheduler | None = None
_sent_today: dict[str, set[str]] = {}
_check_lock = asyncio.Lock()


async def _notify_subscribers(settings: Settings, bot: Bot, prayer_label: str) -> None:
    message = f"Время намаза {prayer_label} наступило"
    user_ids = await fetch_namaz_subscriber_ids(settings)

    if not user_ids:
        logger.info("Namaz %s: no subscribers", prayer_label)
        return

    sent = 0
    failed = 0
    for user_id in user_ids:
        try:
            await bot.send_message(chat_id=user_id, text=message)
            sent += 1
        except TelegramAPIError as error:
            failed += 1
            logger.warning("Namaz notify failed for %s: %s", user_id, error)

        await asyncio.sleep(0.05)

    logger.info("Namaz %s notifications: sent=%s failed=%s", prayer_label, sent, failed)


async def check_namaz_and_notify(settings: Settings, bot: Bot) -> None:
    async with _check_lock:
        today = bishkek_today_key()
        current_hm = bishkek_now_hm()

        if _sent_today and today not in _sent_today:
            _sent_today.clear()
        sent_keys = _sent_today.setdefault(today, set())

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                prayers = await fetch_bishkek_prayer_times(client)
        except Exception as error:
            logger.exception("Failed to fetch Bishkek prayer times: %s", error)
            return

        for prayer in prayers:
            if prayer.time_hm != current_hm or prayer.key in sent_keys:
                continue

            sent_keys.add(prayer.key)
            await _notify_subscribers(settings, bot, prayer.label)


def start_namaz_scheduler(settings: Settings, bot: Bot) -> AsyncIOScheduler:
    global _scheduler

    if _scheduler is not None:
        return _scheduler

    scheduler = AsyncIOScheduler(timezone="Asia/Bishkek")
    scheduler.add_job(
        check_namaz_and_notify,
        trigger="cron",
        minute="*",
        args=[settings, bot],
        id="namaz_check",
        replace_existing=True,
        coalesce=True,
        max_instances=1,
    )
    scheduler.start()
    _scheduler = scheduler
    logger.info("Namaz notification scheduler started (Asia/Bishkek, every minute)")
    return scheduler


def stop_namaz_scheduler() -> None:
    global _scheduler

    if _scheduler is None:
        return

    _scheduler.shutdown(wait=False)
    _scheduler = None
    logger.info("Namaz notification scheduler stopped")
