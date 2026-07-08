"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <main className="flex min-h-full flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl border border-red-400/20 bg-red-950/40 p-6 text-center backdrop-blur-xl">
        <h1 className="text-lg font-semibold text-red-300">
          Что-то пошло не так
        </h1>
        <p className="mt-2 text-sm text-red-400/80">
          {error.message || "Произошла непредвиденная ошибка."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/20"
        >
          Попробовать снова
        </button>
      </div>
    </main>
  );
}
