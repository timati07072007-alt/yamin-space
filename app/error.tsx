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
      <div className="w-full max-w-sm rounded-[2rem] border border-red-200 bg-red-50/80 p-6 text-center backdrop-blur-xl">
        <h1 className="text-lg font-semibold text-red-700">
          Что-то пошло не так
        </h1>
        <p className="mt-2 text-sm text-red-500">
          {error.message || "Произошла непредвиденная ошибка."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-3xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
        >
          Попробовать снова
        </button>
      </div>
    </main>
  );
}
