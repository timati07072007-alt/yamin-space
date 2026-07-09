from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")


@dataclass(frozen=True)
class Settings:
    bot_token: str
    webapp_url: str
    sync_api_url: str
    supabase_url: str | None
    supabase_service_role_key: str | None
    admin_username: str


def load_settings() -> Settings:
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    webapp_url = os.getenv("WEBAPP_URL", "https://yamin-space.vercel.app").strip().rstrip("/")
    sync_api_url = os.getenv(
        "SYNC_API_URL",
        f"{webapp_url}/api/user/sync",
    ).strip()
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "").strip() or None
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip() or None
    admin_username = os.getenv("ADMIN_USERNAME", "netxght_v").strip().lstrip("@")

    if not bot_token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is missing. Create bot/.env from bot/.env.example")

    return Settings(
        bot_token=bot_token,
        webapp_url=webapp_url,
        sync_api_url=sync_api_url,
        supabase_url=supabase_url,
        supabase_service_role_key=service_key,
        admin_username=admin_username,
    )
