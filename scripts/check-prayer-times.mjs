import {
  CalculationParameters,
  Coordinates,
  Madhab,
  PrayerTimes,
} from "adhan";

const coords = new Coordinates(42.8746, 74.5698);

const fmt = (d) =>
  new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Asia/Bishkek",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);

const official = {
  "2026-01-15": "Fajr 06:49  Sunrise 08:29  Dhuhr 13:11  Asr 16:11  Maghrib 17:58  Isha 19:21",
  "2026-06-08": "Fajr 03:08  Sunrise 05:23  Dhuhr 13:01  Asr 18:19  Maghrib 20:45  Isha 22:32",
  "2026-07-08": "Fajr 03:17  Sunrise 05:30  Dhuhr 13:07  Asr 18:24  Maghrib 20:49  Isha 22:35",
};

const params = new CalculationParameters(null, 18, 16);
params.madhab = Madhab.Hanafi;
params.adjustments = { fajr: -1, sunrise: -1, dhuhr: -1, asr: 1, maghrib: 7, isha: 0 };

for (const key of Object.keys(official)) {
  const [y, m, d] = key.split("-").map(Number);
  const pt = new PrayerTimes(coords, new Date(y, m - 1, d, 12), params);
  console.log(key);
  console.log("  оф.:", official[key]);
  console.log(
    `  выч: Fajr ${fmt(pt.fajr)}  Sunrise ${fmt(pt.sunrise)}  Dhuhr ${fmt(pt.dhuhr)}  Asr ${fmt(pt.asr)}  Maghrib ${fmt(pt.maghrib)}  Isha ${fmt(pt.isha)}`,
  );
}
