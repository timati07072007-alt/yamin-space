/** Координаты Каабы (Мекка). */
const KAABA_LATITUDE = 21.4225;
const KAABA_LONGITUDE = 39.8262;

/** Бишкек — локация по умолчанию, чтобы компас работал без GPS. */
export const DEFAULT_LOCATION: GeoPoint = {
  latitude: 42.87,
  longitude: 74.59,
};

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Азимут на Каабу относительно истинного севера (0..360°).
 * Формула начального азимута ортодромии (great-circle initial bearing).
 */
export function calculateQiblaBearing(point: GeoPoint): number {
  const lat1 = toRadians(point.latitude);
  const lat2 = toRadians(KAABA_LATITUDE);
  const deltaLng = toRadians(KAABA_LONGITUDE - point.longitude);

  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  const bearing = toDegrees(Math.atan2(y, x));

  return (bearing + 360) % 360;
}

const GEOLOCATION_TIMEOUT_MS = 5000;

/**
 * Пытается получить геопозицию пользователя; при отказе или таймауте
 * тихо откатывается на Бишкек.
 */
export function resolveUserLocation(): Promise<GeoPoint> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(DEFAULT_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        resolve(DEFAULT_LOCATION);
      },
      {
        enableHighAccuracy: false,
        timeout: GEOLOCATION_TIMEOUT_MS,
        maximumAge: 10 * 60 * 1000,
      },
    );
  });
}
