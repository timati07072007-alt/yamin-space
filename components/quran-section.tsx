"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Pause,
  Play,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  fetchSurahContent,
  fetchSurahList,
  getSurahAudioUrl,
  type Surah,
  type SurahContent,
} from "@/lib/quran";

interface QuranSectionProps {
  query: string;
}

function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;

  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function SurahAudioPlayer({ surahNumber }: { surahNumber: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio(getSurahAudioUrl(surahNumber));
    audio.preload = "none";
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [surahNumber]);

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setIsBuffering(true);
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.warn("[Quran] Audio playback failed:", error);
    } finally {
      setIsBuffering(false);
    }
  }, [isPlaying]);

  const seek = useCallback((value: number) => {
    const audio = audioRef.current;

    if (audio && Number.isFinite(audio.duration)) {
      audio.currentTime = value;
      setCurrentTime(value);
    }
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
      <motion.button
        type="button"
        onClick={() => void togglePlayback()}
        whileTap={{ scale: 0.92 }}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-emerald-950 shadow-[0_0_24px_-4px_rgba(16,185,129,0.7)]"
      >
        {isBuffering ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="ml-0.5 h-5 w-5" />
        )}
      </motion.button>

      <div className="flex-1">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={1}
          value={currentTime}
          onChange={(event) => seek(Number(event.target.value))}
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-emerald-400"
        />
        <div className="mt-1 flex justify-between text-[10px] text-zinc-500 tabular-nums">
          <span>{formatAudioTime(currentTime)}</span>
          <span>{duration ? formatAudioTime(duration) : "--:--"}</span>
        </div>
      </div>
    </div>
  );
}

function SurahReader({
  surah,
  onBack,
}: {
  surah: Surah;
  onBack: () => void;
}) {
  const [content, setContent] = useState<SurahContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Компонент монтируется заново для каждой суры (key в AnimatePresence),
  // поэтому сбрасывать стейт вручную не нужно.
  useEffect(() => {
    let cancelled = false;

    fetchSurahContent(surah.number)
      .then((loaded) => {
        if (!cancelled) {
          setContent(loaded);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error ? cause.message : "Не удалось загрузить суру",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [surah.number]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.25 }}
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-3 flex items-center gap-1.5 text-xs font-medium text-emerald-300 transition-colors hover:text-emerald-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Все суры
      </button>

      <div className="mb-4 text-center">
        <p className="text-2xl font-semibold text-zinc-50">{surah.arabicName}</p>
        <p className="mt-1 text-sm text-zinc-400">
          {surah.number}. {surah.englishName} · {surah.ayahCount} аятов
        </p>
      </div>

      <SurahAudioPlayer surahNumber={surah.number} />

      <div className="mt-4">
        {error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!content && !error && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Загружаем текст суры...
          </div>
        )}

        {content && (
          <ul className="space-y-3">
            {content.ayahs.map((ayah) => (
              <li
                key={ayah.numberInSurah}
                className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3.5"
              >
                <p
                  dir="rtl"
                  lang="ar"
                  className="text-right text-xl leading-loose text-zinc-100"
                >
                  {ayah.arabic}
                </p>
                <p className="mt-2 border-t border-white/5 pt-2 text-sm leading-relaxed text-zinc-400">
                  <span className="mr-1.5 text-xs font-semibold text-emerald-400/80 tabular-nums">
                    {ayah.numberInSurah}.
                  </span>
                  {ayah.russian}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

export function QuranSection({ query }: QuranSectionProps) {
  const [surahs, setSurahs] = useState<Surah[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSurah, setActiveSurah] = useState<Surah | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchSurahList()
      .then((list) => {
        if (!cancelled) {
          setSurahs(list);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Не удалось загрузить список сур",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (!surahs) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Загружаем список сур...
      </div>
    );
  }

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? surahs.filter(
        (surah) =>
          surah.englishName.toLowerCase().includes(normalized) ||
          surah.translationName.toLowerCase().includes(normalized) ||
          surah.arabicName.includes(query.trim()) ||
          String(surah.number) === normalized,
      )
    : surahs;

  return (
    <AnimatePresence mode="wait">
      {activeSurah ? (
        <SurahReader
          key={`reader-${activeSurah.number}`}
          surah={activeSurah}
          onBack={() => setActiveSurah(null)}
        />
      ) : (
        <motion.ul
          key="list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="max-h-[26rem] space-y-1.5 overflow-y-auto pr-1"
        >
          {filtered.length === 0 && (
            <li className="py-8 text-center text-sm text-zinc-500">
              Ничего не найдено
            </li>
          )}
          {filtered.map((surah) => (
            <li key={surah.number}>
              <button
                type="button"
                onClick={() => setActiveSurah(surah)}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-3.5 py-2.5 text-left transition-colors hover:border-emerald-400/25 hover:bg-emerald-500/10"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-xs font-semibold text-emerald-300 tabular-nums">
                  {surah.number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-zinc-200">
                    {surah.englishName}
                  </span>
                  <span className="block truncate text-xs text-zinc-500">
                    {surah.translationName} · {surah.ayahCount} аятов
                  </span>
                </span>
                <span className="shrink-0 text-lg text-zinc-300" lang="ar">
                  {surah.arabicName}
                </span>
              </button>
            </li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  );
}
