-- Подписка на уведомления о времени намаза (Telegram-бот)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS namaz_notifications boolean NOT NULL DEFAULT false;
