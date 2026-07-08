"use client";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-zinc-100 antialiased">
        <main className="flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-sm rounded-3xl border border-red-200 bg-white p-6 text-center shadow-lg">
            <h1 className="text-lg font-semibold text-red-800">
              Критическая ошибка
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              {error.message || "Приложение не смогло запуститься."}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-4 rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            >
              Перезагрузить
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
