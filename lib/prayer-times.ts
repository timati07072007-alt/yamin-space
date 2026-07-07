import {
  CalculationMethod,
  Coordinates,
  Madhab,
  PrayerTimes,
} from "adhan";

export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export interface PrayerSlot {
  name: PrayerName;
  label: string;
  labelGenitive: string;
  time: Date;
  timeLabel: string;
}

export interface PrayerSchedule {
  city: string;
  dateLabel: string;
  prayers: PrayerSlot[];
  currentPrayer: PrayerName | null;
  nextPrayer: PrayerName;
  nextPrayerTime: Date;
  countdownLabel: string;
  countdownMs: number;
}

export const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: "Фаджр",
  dhuhr: "Зухр",
  asr: "Аср",
  maghrib: "Магриб",
  isha: "Иша",
};

export const PRAYER_LABELS_GENITIVE: Record<PrayerName, string> = {
  fajr: "Фаджра",
  dhuhr: "Зухра",
  asr: "Асра",
  maghrib: "Магриба",
  isha: "Иши",
};

const BISHKEK_CITY = "Бишкек";
const BISHKEK_TIMEZONE = "Asia/Bishkek";
const BISHKEK_UTC_OFFSET_HOURS = 6;

const BISHKEK_COORDINATES = new Coordinates(42.8746, 74.5698);

const BISHKEK_CALCULATION = (() => {
  const params = CalculationMethod.Karachi();
  params.madhab = Madhab.Hanafi;
  return params;
})();

const PRAYER_ORDER: PrayerName[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

function getBishkekCalendarDate(reference: Date = new Date()): Date {
  const shifted = new Date(
    reference.getTime() +
      reference.getTimezoneOffset() * 60_000 +
      BISHKEK_UTC_OFFSET_HOURS * 3_600_000,
  );

  return new Date(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
    12,
    0,
    0,
    0,
  );
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: BISHKEK_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: BISHKEK_TIMEZONE,
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(date);
}

function buildPrayerSlots(prayerTimes: PrayerTimes): PrayerSlot[] {
  const times: Record<PrayerName, Date> = {
    fajr: prayerTimes.fajr,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
  };

  return PRAYER_ORDER.map((name) => ({
    name,
    label: PRAYER_LABELS[name],
    labelGenitive: PRAYER_LABELS_GENITIVE[name],
    time: times[name],
    timeLabel: formatTime(times[name]),
  }));
}

function createPrayerTimes(date: Date): PrayerTimes {
  return new PrayerTimes(BISHKEK_COORDINATES, date, BISHKEK_CALCULATION);
}

export function formatCountdown(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function getPrayerSchedule(now: Date = new Date()): PrayerSchedule {
  const calendarDate = getBishkekCalendarDate(now);
  const todayTimes = createPrayerTimes(calendarDate);
  const tomorrowTimes = createPrayerTimes(addDays(calendarDate, 1));

  const prayers = buildPrayerSlots(todayTimes);
  const fajrToday = prayers[0].time;
  const ishaToday = prayers[prayers.length - 1].time;

  let currentPrayer: PrayerName | null = null;
  let nextPrayer: PrayerName = "fajr";
  let nextPrayerTime = tomorrowTimes.fajr;

  if (now < fajrToday) {
    currentPrayer = "isha";
    nextPrayer = "fajr";
    nextPrayerTime = fajrToday;
  } else if (now >= ishaToday) {
    currentPrayer = "isha";
    nextPrayer = "fajr";
    nextPrayerTime = tomorrowTimes.fajr;
  } else {
    for (const prayer of prayers) {
      if (now >= prayer.time) {
        currentPrayer = prayer.name;
      }
    }

    const upcoming = prayers.find((prayer) => now < prayer.time);

    if (upcoming) {
      nextPrayer = upcoming.name;
      nextPrayerTime = upcoming.time;
    }
  }

  const countdownMs = Math.max(0, nextPrayerTime.getTime() - now.getTime());

  return {
    city: BISHKEK_CITY,
    dateLabel: formatDateLabel(now),
    prayers,
    currentPrayer,
    nextPrayer,
    nextPrayerTime,
    countdownLabel: `До ${PRAYER_LABELS_GENITIVE[nextPrayer]}`,
    countdownMs,
  };
}
