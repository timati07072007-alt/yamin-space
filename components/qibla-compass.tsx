"use client";

import { motion, useSpring, type MotionValue } from "framer-motion";
import { Compass, LocateFixed, Navigation } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useCompass } from "@/hooks/use-compass";
import {
  calculateQiblaBearing,
  DEFAULT_LOCATION,
  resolveUserLocation,
  type GeoPoint,
} from "@/lib/qibla";

const glassCard =
  "w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/40 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl";

const DIAL_DEGREES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

const CARDINAL_LABELS: Record<number, string> = {
  0: "С",
  90: "В",
  180: "Ю",
  270: "З",
};

/**
 * Пружинное вращение с разворотом угла в непрерывную величину,
 * чтобы стрелка не делала полный оборот при переходе через 359° → 0°.
 */
function useSpringAngle(target: number): MotionValue<number> {
  const rotation = useSpring(target, {
    stiffness: 55,
    damping: 14,
    mass: 0.6,
  });

  useEffect(() => {
    const current = rotation.get();
    const delta = ((target - (current % 360) + 540) % 360) - 180;
    rotation.set(current + delta);
  }, [target, rotation]);

  return rotation;
}

export function QiblaCompass() {
  const { heading, permission, isActive, requestAccess } = useCompass();
  const [location, setLocation] = useState<GeoPoint>(DEFAULT_LOCATION);
  const [isCustomLocation, setIsCustomLocation] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void resolveUserLocation().then((resolved) => {
      if (cancelled) {
        return;
      }

      setLocation(resolved);
      setIsCustomLocation(
        resolved.latitude !== DEFAULT_LOCATION.latitude ||
          resolved.longitude !== DEFAULT_LOCATION.longitude,
      );
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const qiblaBearing = useMemo(
    () => calculateQiblaBearing(location),
    [location],
  );

  const deviceHeading = heading ?? 0;

  // Лимб вращается против курса устройства, стрелка Киблы — на азимут Киблы
  // относительно текущего направления телефона.
  const dialRotation = useSpringAngle(-deviceHeading);
  const needleRotation = useSpringAngle(qiblaBearing - deviceHeading);

  const relativeAngle = ((qiblaBearing - deviceHeading) % 360 + 360) % 360;
  const isAligned = isActive && (relativeAngle <= 5 || relativeAngle >= 355);

  return (
    <section className={glassCard}>
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
          <Compass className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-100">
            Компас Киблы
          </h2>
          <p className="text-xs text-zinc-500">
            {isCustomLocation ? "По вашей геопозиции" : "Бишкек (по умолчанию)"}
            {" · "}
            {Math.round(qiblaBearing)}° от севера
          </p>
        </div>
        {isCustomLocation && (
          <LocateFixed className="h-4 w-4 text-emerald-400/70" />
        )}
      </div>

      <div className="flex flex-col items-center px-5 py-6">
        <div className="relative h-64 w-64">
          <motion.div
            style={{ rotate: dialRotation }}
            className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.03]"
          >
            {DIAL_DEGREES.map((degree) => {
              const label = CARDINAL_LABELS[degree];

              return (
                <div
                  key={degree}
                  className="absolute inset-0"
                  style={{ transform: `rotate(${degree}deg)` }}
                >
                  <div
                    className={`absolute left-1/2 top-2 -translate-x-1/2 ${
                      label
                        ? "h-3.5 w-0.5 bg-emerald-300/80"
                        : "h-2.5 w-px bg-white/25"
                    }`}
                  />
                  {label ? (
                    <span
                      className={`absolute left-1/2 top-7 -translate-x-1/2 text-xs font-semibold ${
                        degree === 0 ? "text-emerald-300" : "text-zinc-400"
                      }`}
                      style={{ transform: `translateX(-50%) rotate(${-degree}deg)` }}
                    >
                      {label}
                    </span>
                  ) : (
                    <span
                      className="absolute left-1/2 top-6 -translate-x-1/2 text-[9px] text-zinc-600 tabular-nums"
                      style={{ transform: `translateX(-50%) rotate(${-degree}deg)` }}
                    >
                      {degree}
                    </span>
                  )}
                </div>
              );
            })}
          </motion.div>

          <motion.div style={{ rotate: needleRotation }} className="absolute inset-0">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
              <div
                className={`h-24 w-1.5 rounded-full bg-gradient-to-t transition-colors duration-300 ${
                  isAligned
                    ? "from-emerald-500/40 to-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.6)]"
                    : "from-amber-500/40 to-amber-300"
                }`}
              />
              <div
                className={`absolute -top-1.5 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[7px] border-b-[12px] border-x-transparent transition-colors duration-300 ${
                  isAligned ? "border-b-emerald-300" : "border-b-amber-300"
                }`}
              />
            </div>
          </motion.div>

          <div
            className={`absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors duration-300 ${
              isAligned
                ? "border-emerald-300 bg-emerald-500/50"
                : "border-white/40 bg-zinc-800"
            }`}
          />
        </div>

        <div className="mt-5 w-full">
          {permission === "granted" && isActive ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-center text-sm transition-colors duration-300 ${
                isAligned
                  ? "border-emerald-400/40 bg-emerald-500/15 font-semibold text-emerald-200"
                  : "border-white/5 bg-white/5 text-zinc-400"
              }`}
            >
              {isAligned
                ? "Вы направлены на Киблу"
                : `Поверните телефон: Кибла в ${Math.round(relativeAngle)}°`}
            </div>
          ) : permission === "granted" && !isActive ? (
            <p className="text-center text-xs text-zinc-500">
              Ждём данные сенсора... Поводите телефоном восьмёркой для
              калибровки.
            </p>
          ) : permission === "denied" ? (
            <p className="text-center text-xs text-red-400/80">
              Доступ к датчикам отклонён. Разрешите доступ к движению в
              настройках браузера.
            </p>
          ) : permission === "unsupported" ? (
            <p className="text-center text-xs text-zinc-500">
              Датчик ориентации недоступен. Стрелка показывает азимут Киблы
              ({Math.round(qiblaBearing)}°) от севера.
            </p>
          ) : (
            <motion.button
              type="button"
              onClick={() => void requestAccess()}
              disabled={permission === "requesting"}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/25 bg-gradient-to-r from-emerald-500/80 to-emerald-600/80 px-4 py-3.5 text-sm font-semibold text-emerald-50 shadow-[0_8px_32px_-8px_rgba(16,185,129,0.5)] transition-colors hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-60"
            >
              <Navigation className="h-4 w-4" />
              {permission === "requesting"
                ? "Запрашиваем доступ..."
                : "Включить компас"}
            </motion.button>
          )}
        </div>
      </div>
    </section>
  );
}
