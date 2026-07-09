from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import httpx
from aiogram.types import User as TelegramUser

from config import Settings

logger = logging.getLogger(__name__)


def telegram_user_payload(user: TelegramUser) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "id": user.id,
        "first_name": user.first_name,
    }
    if user.username:
        payload["username"] = user.username
    if user.last_name:
        payload["last_name"] = user.last_name
    if user.language_code:
        payload["language_code"] = user.language_code
    if user.is_premium is not None:
        payload["is_premium"] = user.is_premium
    return payload


def _supabase_headers(settings: Settings) -> dict[str, str]:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError(
            "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required",
        )
    return {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": "application/json",
    }


def _rest_base(settings: Settings) -> str:
    return f"{settings.supabase_url.rstrip('/')}/rest/v1"


async def sync_user_direct(settings: Settings, user: TelegramUser) -> None:
    headers = _supabase_headers(settings)
    now = datetime.now(timezone.utc).isoformat()
    base = _rest_base(settings)

    async with httpx.AsyncClient(timeout=30.0) as client:
        existing = await client.get(
            f"{base}/users",
            headers=headers,
            params={"id": f"eq.{user.id}", "select": "id"},
        )
        existing.raise_for_status()
        rows = existing.json()

        if not rows:
            insert = {
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "display_name": user.first_name,
                "last_seen": now,
            }
            response = await client.post(f"{base}/users", headers=headers, json=insert)
            response.raise_for_status()

            diamonds = await client.get(
                f"{base}/diamonds_balance",
                headers=headers,
                params={"user_id": f"eq.{user.id}", "select": "user_id"},
            )
            diamonds.raise_for_status()
            if not diamonds.json():
                await client.post(
                    f"{base}/diamonds_balance",
                    headers=headers,
                    json={"user_id": user.id, "balance": 0},
                )
        else:
            patch = {
                "username": user.username,
                "first_name": user.first_name,
                "last_seen": now,
            }
            response = await client.patch(
                f"{base}/users",
                headers=headers,
                params={"id": f"eq.{user.id}"},
                json=patch,
            )
            response.raise_for_status()

    logger.info("Synced user %s (%s) to Supabase (direct)", user.id, user.username or user.first_name)


async def sync_user_via_api(settings: Settings, user: TelegramUser) -> None:
    payload = telegram_user_payload(user)

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(settings.sync_api_url, json=payload)
        response.raise_for_status()
        body = response.json()

    if "error" in body and body.get("user") is None:
        raise RuntimeError(body["error"])

    logger.info("Synced user %s (%s) to Supabase (API)", user.id, user.username or user.first_name)


async def sync_user_to_supabase(settings: Settings, user: TelegramUser) -> None:
    if settings.supabase_url and settings.supabase_service_role_key:
        await sync_user_direct(settings, user)
        return

    await sync_user_via_api(settings, user)


async def fetch_all_user_ids(settings: Settings) -> list[int]:
    headers = _supabase_headers(settings)
    url = f"{_rest_base(settings)}/users"

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(
            url,
            headers=headers,
            params={"select": "id", "order": "id.asc"},
        )
        response.raise_for_status()
        rows = response.json()

    return [int(row["id"]) for row in rows if row.get("id") is not None]


async def get_namaz_notifications(settings: Settings, user_id: int) -> bool:
    headers = _supabase_headers(settings)
    url = f"{_rest_base(settings)}/users"

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            url,
            headers=headers,
            params={"id": f"eq.{user_id}", "select": "namaz_notifications"},
        )
        response.raise_for_status()
        rows = response.json()

    if not rows:
        return False

    return bool(rows[0].get("namaz_notifications"))


async def set_namaz_notifications(
    settings: Settings,
    user_id: int,
    enabled: bool,
) -> None:
    headers = _supabase_headers(settings)
    url = f"{_rest_base(settings)}/users"

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.patch(
            url,
            headers=headers,
            params={"id": f"eq.{user_id}"},
            json={"namaz_notifications": enabled},
        )
        response.raise_for_status()


async def fetch_namaz_subscriber_ids(settings: Settings) -> list[int]:
    headers = _supabase_headers(settings)
    url = f"{_rest_base(settings)}/users"

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(
            url,
            headers=headers,
            params={
                "select": "id",
                "namaz_notifications": "eq.true",
                "order": "id.asc",
            },
        )
        response.raise_for_status()
        rows = response.json()

    return [int(row["id"]) for row in rows if row.get("id") is not None]
