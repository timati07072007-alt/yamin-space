-- Yamin Space: таблица арабского словаря (1000+ слов)
-- Выполнить в Supabase SQL Editor или через MCP apply_migration

-- ─────────────────────────────────────────────
-- 1. Основная таблица слов
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.arabic_words (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  arabic          text NOT NULL CHECK (char_length(arabic) BETWEEN 1 AND 120),
  transliteration text NOT NULL CHECK (char_length(transliteration) BETWEEN 1 AND 200),
  translation_ru  text NOT NULL CHECK (char_length(translation_ru) BETWEEN 1 AND 300),
  audio_url       text,
  category        text NOT NULL DEFAULT 'general',
  difficulty      smallint NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  word_frequency  integer NOT NULL DEFAULT 0,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.arabic_words IS 'Арабский словарь для WebApp: написание, транскрипция, перевод, аудио';
COMMENT ON COLUMN public.arabic_words.audio_url IS 'Публичный URL из Supabase Storage (bucket: arabic-audio)';
COMMENT ON COLUMN public.arabic_words.difficulty IS '1=начальный, 5=продвинутый';
COMMENT ON COLUMN public.arabic_words.word_frequency IS 'Частотность для сортировки (чем выше — тем базовее)';

-- Уникальность: одно арабское слово + перевод (допускает омонимы с разным переводом)
CREATE UNIQUE INDEX IF NOT EXISTS arabic_words_arabic_translation_uq
  ON public.arabic_words (arabic, translation_ru);

CREATE INDEX IF NOT EXISTS arabic_words_category_idx
  ON public.arabic_words (category) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS arabic_words_difficulty_idx
  ON public.arabic_words (difficulty, word_frequency DESC);

-- Полнотекстовый поиск (русский + транскрипция)
CREATE INDEX IF NOT EXISTS arabic_words_fts_idx ON public.arabic_words
  USING gin (
    to_tsvector(
      'simple',
      coalesce(arabic, '') || ' ' ||
      coalesce(transliteration, '') || ' ' ||
      coalesce(translation_ru, '')
    )
  );

-- ─────────────────────────────────────────────
-- 2. Прогресс заучивания пользователя
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.arabic_word_progress (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  word_id         bigint NOT NULL REFERENCES public.arabic_words(id) ON DELETE CASCADE,
  ease_factor     numeric(4, 2) NOT NULL DEFAULT 2.50,
  interval_days   integer NOT NULL DEFAULT 0,
  repetitions     integer NOT NULL DEFAULT 0,
  next_review_at  timestamptz NOT NULL DEFAULT now(),
  last_result     text CHECK (last_result IN ('again', 'hard', 'good', 'easy')),
  xp_earned       integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, word_id)
);

CREATE INDEX IF NOT EXISTS arabic_word_progress_user_review_idx
  ON public.arabic_word_progress (user_id, next_review_at);

-- ─────────────────────────────────────────────
-- 3. Аудио для букв алфавита (28 файлов)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.arabic_letters_audio (
  letter_id       text PRIMARY KEY,
  letter_char     text NOT NULL,
  name_ru         text NOT NULL,
  audio_url       text NOT NULL,
  voice_provider  text NOT NULL DEFAULT 'elevenlabs',
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 4. RLS
-- ─────────────────────────────────────────────
ALTER TABLE public.arabic_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arabic_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arabic_letters_audio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS arabic_words_read ON public.arabic_words;
CREATE POLICY arabic_words_read ON public.arabic_words
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS arabic_letters_audio_read ON public.arabic_letters_audio;
CREATE POLICY arabic_letters_audio_read ON public.arabic_letters_audio
  FOR SELECT USING (true);

DROP POLICY IF EXISTS arabic_word_progress_own ON public.arabic_word_progress;
CREATE POLICY arabic_word_progress_own ON public.arabic_word_progress
  FOR ALL USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 5. Storage bucket (выполнить в Dashboard → Storage)
--    Имя: arabic-audio, public read
--    Путь файла: words/{word_id}.mp3, letters/{letter_id}.mp3
-- ─────────────────────────────────────────────

-- ─────────────────────────────────────────────
-- 6. Пример seed (3 слова — полный seed через scripts/seed-arabic-words.mjs)
-- ─────────────────────────────────────────────
INSERT INTO public.arabic_words (arabic, transliteration, translation_ru, category, difficulty, word_frequency)
VALUES
  ('كِتَاب', 'ки-таб', 'Книга', 'учёба', 1, 900),
  ('مَسْجِد', 'мас-джид', 'Мечеть', 'религия', 1, 850),
  ('سَلَام', 'са-лам', 'Мир / Привет', 'общее', 1, 950)
ON CONFLICT (arabic, translation_ru) DO NOTHING;

-- ─────────────────────────────────────────────
-- 7. Представление для API (удобная выборка)
-- ─────────────────────────────────────────────
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
