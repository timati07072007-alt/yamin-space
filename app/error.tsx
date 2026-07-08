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
    <main className="flex min-h-full flex-1 items-center justify-center bg-zinc-100 p-6">
      <div className="w-full max-w-sm rounded-3xl border border-red-200 bg-white p-6 text-center shadow-lg">
        <h1 className="text-lg font-semibold text-red-800">
          Что-то пошло не так
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          {error.message || "Произошла непредвиденная ошибка."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Попробовать снова
        </button>
      </div>
    </main>
  );
}
