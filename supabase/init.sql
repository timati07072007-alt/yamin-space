-- Yamin Space: полная инициализация схемы Supabase (DDL)
-- Выполните ПЕРВЫМ, затем seed-скрипты (knowledge-schema, seed-books-expanded, localize-latin-content и др.).
-- Идempotent: безопасно запускать повторно (CREATE IF NOT EXISTS).

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Пользователи (Telegram WebApp)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.users (
  id bigint PRIMARY KEY,
  username text,
  first_name text NOT NULL,
  display_name text,
  avatar_id text NOT NULL DEFAULT 'mosque',
  xp integer NOT NULL DEFAULT 0,
  coins integer NOT NULL DEFAULT 0,
  title text NOT NULL DEFAULT 'Искатель',
  league_tier text NOT NULL DEFAULT 'bronze',
  weekly_xp integer NOT NULL DEFAULT 0,
  week_key text NOT NULL DEFAULT '',
  last_seen timestamptz NOT NULL DEFAULT now(),
  namaz_notifications boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. Геймификация, лиги, чат
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.leagues (
  id text PRIMARY KEY,
  name_ru text NOT NULL,
  min_weekly_xp integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  color_hex text NOT NULL DEFAULT '#cd7f32'
);

CREATE TABLE IF NOT EXISTS public.user_avatars (
  id text PRIMARY KEY,
  label_ru text NOT NULL,
  emoji text NOT NULL,
  gradient_from text NOT NULL DEFAULT '#d1fae5',
  gradient_to text NOT NULL DEFAULT '#fef3c7',
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.diamonds_balance (
  user_id bigint PRIMARY KEY REFERENCES public.users (id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.global_chat (
  id bigserial PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_id text NOT NULL DEFAULT 'mosque',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS global_chat_created_at_idx
  ON public.global_chat (created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. Викторины и тесты
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.quizzes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL DEFAULT 'easy'
    CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.questions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  quiz_id bigint NOT NULL REFERENCES public.quizzes (id) ON DELETE CASCADE,
  question_text text NOT NULL,
  options text[] NOT NULL,
  correct_option_index integer NOT NULL,
  xp_reward integer NOT NULL DEFAULT 10,
  coins_reward integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT questions_options_not_empty CHECK (array_length(options, 1) >= 2),
  CONSTRAINT questions_correct_index_in_range CHECK (
    correct_option_index >= 0
    AND correct_option_index < array_length(options, 1)
  )
);

CREATE INDEX IF NOT EXISTS questions_quiz_id_idx ON public.questions (quiz_id);

CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  question_id bigint NOT NULL REFERENCES public.questions (id) ON DELETE CASCADE,
  selected_option_index integer NOT NULL,
  is_correct boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quiz_answers_unique UNIQUE (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS quiz_answers_user_idx ON public.quiz_answers (user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. Библиотека и хадисы
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.books (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text NOT NULL,
  author text NOT NULL,
  description text NOT NULL DEFAULT '',
  category_age text NOT NULL DEFAULT 'adults'
    CHECK (category_age IN ('children', 'teens', 'adults')),
  content_url text,
  content_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS books_category_idx ON public.books (category_age);

CREATE TABLE IF NOT EXISTS public.hadiths (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  text_ru text NOT NULL,
  author text NOT NULL,
  collection text NOT NULL,
  authenticity text NOT NULL DEFAULT 'sahih'
    CHECK (authenticity IN ('sahih', 'hasan', 'daif')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.books_pages (
  id bigserial PRIMARY KEY,
  book_id bigint NOT NULL REFERENCES public.books (id) ON DELETE CASCADE,
  page_number integer NOT NULL,
  content_html text NOT NULL DEFAULT '',
  illustration_url text,
  UNIQUE (book_id, page_number)
);

CREATE INDEX IF NOT EXISTS books_pages_book_id_idx
  ON public.books_pages (book_id, page_number);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. Арабский словарь (arabic_words — не «words»)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.arabic_words (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  arabic text NOT NULL CHECK (char_length(arabic) BETWEEN 1 AND 120),
  transliteration text NOT NULL CHECK (char_length(transliteration) BETWEEN 1 AND 200),
  translation_ru text NOT NULL CHECK (char_length(translation_ru) BETWEEN 1 AND 300),
  audio_url text,
  category text NOT NULL DEFAULT 'general',
  difficulty smallint NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  word_frequency integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS arabic_words_arabic_translation_uq
  ON public.arabic_words (arabic, translation_ru);

CREATE INDEX IF NOT EXISTS arabic_words_category_idx
  ON public.arabic_words (category)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS arabic_words_difficulty_idx
  ON public.arabic_words (difficulty, word_frequency DESC);

CREATE TABLE IF NOT EXISTS public.arabic_word_progress (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  word_id bigint NOT NULL REFERENCES public.arabic_words (id) ON DELETE CASCADE,
  ease_factor numeric(4, 2) NOT NULL DEFAULT 2.50,
  interval_days integer NOT NULL DEFAULT 0,
  repetitions integer NOT NULL DEFAULT 0,
  next_review_at timestamptz NOT NULL DEFAULT now(),
  last_result text CHECK (last_result IN ('again', 'hard', 'good', 'easy')),
  xp_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, word_id)
);

CREATE INDEX IF NOT EXISTS arabic_word_progress_user_review_idx
  ON public.arabic_word_progress (user_id, next_review_at);

CREATE TABLE IF NOT EXISTS public.arabic_letters_audio (
  letter_id text PRIMARY KEY,
  letter_char text NOT NULL,
  name_ru text NOT NULL,
  audio_url text NOT NULL,
  voice_provider text NOT NULL DEFAULT 'elevenlabs',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE VIEW public.arabic_words_public AS
SELECT
  id,
  arabic,
  transliteration,
  translation_ru,
  audio_url,
  category,
  difficulty,
  word_frequency
FROM public.arabic_words
WHERE is_active = true;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. Пользовательский тасбих
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_custom_dhikr (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 80),
  transliteration text NOT NULL CHECK (char_length(transliteration) BETWEEN 2 AND 200),
  target_count integer NOT NULL DEFAULT 33 CHECK (target_count BETWEEN 1 AND 9999),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_custom_dhikr_user_id_idx
  ON public.user_custom_dhikr (user_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. Справочные данные (лиги, аватары)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO public.leagues (id, name_ru, min_weekly_xp, sort_order, color_hex) VALUES
  ('bronze',  'Бронза',   0,   1, '#cd7f32'),
  ('silver',  'Серебро',  150, 2, '#94a3b8'),
  ('gold',    'Золото',   400, 3, '#eab308'),
  ('emerald', 'Изумруд',  800, 4, '#10b981')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_avatars (id, label_ru, emoji, gradient_from, gradient_to, sort_order) VALUES
  ('mosque',      'Мечеть',       '🕌', '#d1fae5', '#a7f3d0', 1),
  ('crescent',    'Полумесяц',    '🌙', '#e0e7ff', '#c7d2fe', 2),
  ('star',        'Звезда',       '⭐', '#fef3c7', '#fde68a', 3),
  ('book',        'Коран',        '📖', '#ecfccb', '#d9f99d', 4),
  ('prayer',      'Намаз',        '🤲', '#fce7f3', '#fbcfe8', 5),
  ('lantern',     'Фонарь',       '🏮', '#ffedd5', '#fed7aa', 6),
  ('mountain',    'Гора',         '⛰️', '#e0f2fe', '#bae6fd', 7),
  ('palm',        'Пальма',       '🌴', '#dcfce7', '#bbf7d0', 8),
  ('compass',     'Компас',       '🧭', '#f0fdf4', '#bbf7d0', 9),
  ('heart',       'Сердце',       '💚', '#ecfdf5', '#a7f3d0', 10),
  ('sparkle',     'Сияние',       '✨', '#fffbeb', '#fef08a', 11),
  ('calligraphy', 'Каллиграфия',  '📜', '#faf5ff', '#e9d5ff', 12)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. RLS (чтение для клиента)
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.diamonds_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arabic_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arabic_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arabic_letters_audio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_custom_dhikr ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hadiths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS diamonds_select ON public.diamonds_balance;
CREATE POLICY diamonds_select ON public.diamonds_balance FOR SELECT USING (true);

DROP POLICY IF EXISTS leagues_read ON public.leagues;
CREATE POLICY leagues_read ON public.leagues FOR SELECT USING (true);

DROP POLICY IF EXISTS avatars_read ON public.user_avatars;
CREATE POLICY avatars_read ON public.user_avatars FOR SELECT USING (true);

DROP POLICY IF EXISTS chat_read ON public.global_chat;
CREATE POLICY chat_read ON public.global_chat FOR SELECT USING (true);

DROP POLICY IF EXISTS books_pages_read ON public.books_pages;
CREATE POLICY books_pages_read ON public.books_pages FOR SELECT USING (true);

DROP POLICY IF EXISTS books_read ON public.books;
CREATE POLICY books_read ON public.books FOR SELECT USING (true);

DROP POLICY IF EXISTS hadiths_read ON public.hadiths;
CREATE POLICY hadiths_read ON public.hadiths FOR SELECT USING (true);

DROP POLICY IF EXISTS quizzes_read ON public.quizzes;
CREATE POLICY quizzes_read ON public.quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS questions_read ON public.questions;
CREATE POLICY questions_read ON public.questions FOR SELECT USING (true);

DROP POLICY IF EXISTS arabic_words_read ON public.arabic_words;
CREATE POLICY arabic_words_read ON public.arabic_words
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS arabic_letters_audio_read ON public.arabic_letters_audio;
CREATE POLICY arabic_letters_audio_read ON public.arabic_letters_audio
  FOR SELECT USING (true);

DROP POLICY IF EXISTS arabic_word_progress_own ON public.arabic_word_progress;
CREATE POLICY arabic_word_progress_own ON public.arabic_word_progress
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS user_custom_dhikr_read ON public.user_custom_dhikr;
CREATE POLICY user_custom_dhikr_read ON public.user_custom_dhikr FOR SELECT USING (true);

-- Realtime для чата (игнорируем, если уже добавлено)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.global_chat;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
