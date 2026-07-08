"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Languages, Volume2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

import {
  ARABIC_ALPHABET,
  pickGameOptions,
  speakArabicLetter,
  type ArabicLetter,
} from "@/lib/arabic-alphabet";

type GameState = "idle" | "answered";

export function ArabicSection() {
  const [activeLetter, setActiveLetter] = useState<number | null>(null);
  const [gameIndex, setGameIndex] = useState(0);
  const [gameOptions, setGameOptions] = useState<ArabicLetter[]>([]);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [pickedName, setPickedName] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);

  const targetLetter = ARABIC_ALPHABET[gameIndex];

  const gamePrompt = useMemo(() => {
    if (!targetLetter) {
      return "";
    }

    return `Найди букву «${targetLetter.name}» (${targetLetter.transliteration})`;
  }, [targetLetter]);

  function startRound(index = gameIndex) {
    setGameOptions(pickGameOptions(index));
    setGameState("idle");
    setPickedName(null);
  }

  function beginGame() {
    const index = Math.floor(Math.random() * ARABIC_ALPHABET.length);
    setGameIndex(index);
    setScore(0);
    setRound(1);
    startRound(index);
  }

  function handleLetterClick(letter: ArabicLetter, index: number) {
    setActiveLetter(index);
    speakArabicLetter(letter.speech);
  }

  function handleGamePick(letter: ArabicLetter) {
    if (gameState === "answered" || !targetLetter) {
      return;
    }

    setPickedName(letter.name);
    setGameState("answered");

    const correct = letter.char === targetLetter.char;

    if (correct) {
      setScore((value) => value + 1);
    }

    window.setTimeout(() => {
      if (round >= 5) {
        setGameOptions([]);
        return;
      }

      const nextIndex = Math.floor(Math.random() * ARABIC_ALPHABET.length);
      setGameIndex(nextIndex);
      setRound((value) => value + 1);
      startRound(nextIndex);
    }, 900);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-400">
          Алфавит · нажми для озвучки
        </p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {ARABIC_ALPHABET.map((letter, index) => (
            <motion.button
              key={`${letter.char}-${index}`}
              type="button"
              onClick={() => handleLetterClick(letter, index)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-2.5 transition-colors ${
                activeLetter === index
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-stone-200/80 bg-white/70 text-stone-700 hover:border-emerald-200"
              }`}
            >
              <span dir="rtl" lang="ar" className="text-2xl leading-none">
                {letter.char}
              </span>
              <span className="text-[10px] font-medium">{letter.name}</span>
              <span className="text-[9px] text-stone-400">
                {letter.transliteration}
              </span>
            </motion.button>
          ))}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[10px] text-stone-400">
          <Volume2 className="h-3 w-3" />
          Озвучка через голос браузера (ar-SA)
        </p>
      </div>

      <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50/80 via-white to-emerald-50/60 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-100/80 text-emerald-700">
            <Languages className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-800">
              Мини-игра: найди букву
            </p>
            <p className="text-xs text-stone-400">
              {gameOptions.length > 0
                ? `Раунд ${round} · счёт ${score}`
                : "5 раундов — проверь себя"}
            </p>
          </div>
        </div>

        {gameOptions.length === 0 ? (
          <motion.button
            type="button"
            onClick={beginGame}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-3xl border border-emerald-300 bg-emerald-100/80 px-4 py-3 text-sm font-semibold text-emerald-800"
          >
            Начать игру
          </motion.button>
        ) : (
          <>
            <p className="mb-3 text-sm text-stone-600">{gamePrompt}</p>
            <div className="mb-3 text-center">
              <span
                dir="rtl"
                lang="ar"
                className="inline-block rounded-2xl border border-stone-200 bg-white px-6 py-3 text-4xl text-stone-800"
              >
                {targetLetter?.char}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {gameOptions.map((option) => {
                const isPicked = pickedName === option.name;
                const isCorrect =
                  gameState === "answered" &&
                  option.char === targetLetter?.char;
                const isWrong =
                  gameState === "answered" && isPicked && !isCorrect;

                let className =
                  "border-stone-200/80 bg-white/80 text-stone-700 hover:border-emerald-200";

                if (isCorrect) {
                  className =
                    "border-emerald-300 bg-emerald-50 text-emerald-800";
                } else if (isWrong) {
                  className = "border-red-300 bg-red-50 text-red-700";
                }

                return (
                  <motion.button
                    key={option.name}
                    type="button"
                    onClick={() => handleGamePick(option)}
                    disabled={gameState === "answered"}
                    whileHover={
                      gameState === "idle" ? { scale: 1.02 } : undefined
                    }
                    whileTap={
                      gameState === "idle" ? { scale: 0.98 } : undefined
                    }
                    className={`flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 text-sm font-medium ${className}`}
                  >
                    {option.name}
                    {isCorrect && <CheckCircle2 className="h-4 w-4" />}
                    {isWrong && <XCircle className="h-4 w-4" />}
                  </motion.button>
                );
              })}
            </div>

            {round >= 5 && gameState === "answered" && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-center text-sm font-medium text-emerald-700"
              >
                Игра окончена! Результат: {score} из 5
              </motion.p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
