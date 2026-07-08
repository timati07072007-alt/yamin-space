"use client";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-[#faf6ee] antialiased">
        <main className="flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-sm rounded-[2rem] border border-red-200 bg-red-50/80 p-6 text-center shadow-lg">
            <h1 className="text-lg font-semibold text-red-700">
              Критическая ошибка
            </h1>
            <p className="mt-2 text-sm text-red-500">
              {error.message || "Приложение не смогло запуститься."}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-4 rounded-3xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
            >
              Перезагрузить
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
