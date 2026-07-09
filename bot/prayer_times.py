from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from zoneinfo import ZoneInfo

import httpx

BISHKEK_TZ = ZoneInfo("Asia/Bishkek")
MUFTIYAT_BISHKEK_URL = "https://muftiyat.kg/ru/api/v1/calendar/1/"

PRAYER_LABELS: dict[str, str] = {
    "fajr": "Фаджр",
    "dhuhr": "Зухр",
    "asr": "Аср",
    "maghrib": "Магриб",
    "isha": "Иша",
}


@dataclass(frozen=True)
class PrayerTime:
    key: str
    label: str
    time_hm: str


async def fetch_bishkek_prayer_times(
    client: httpx.AsyncClient | None = None,
) -> list[PrayerTime]:
    owns_client = client is None
    if owns_client:
        client = httpx.AsyncClient(timeout=20.0)

    try:
        response = await client.get(MUFTIYAT_BISHKEK_URL)
        response.raise_for_status()
        payload = response.json()
        day = payload["prayertimes"][0]

        return [
            PrayerTime(key=key, label=label, time_hm=str(day[key]))
            for key, label in PRAYER_LABELS.items()
        ]
    finally:
        if owns_client and client is not None:
            await client.aclose()


def bishkek_now_hm() -> str:
    return datetime.now(BISHKEK_TZ).strftime("%H:%M")


def bishkek_today_key() -> str:
    return datetime.now(BISHKEK_TZ).strftime("%Y-%m-%d")
