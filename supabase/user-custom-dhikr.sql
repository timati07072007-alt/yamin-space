-- Custom user dhikr targets for tasbih counter
CREATE TABLE IF NOT EXISTS public.user_custom_dhikr (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 80),
  transliteration text NOT NULL CHECK (char_length(transliteration) BETWEEN 2 AND 200),
  target_count integer NOT NULL DEFAULT 33 CHECK (target_count BETWEEN 1 AND 9999),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_custom_dhikr_user_id_idx
  ON public.user_custom_dhikr (user_id, created_at DESC);

ALTER TABLE public.user_custom_dhikr ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_custom_dhikr_read ON public.user_custom_dhikr;
CREATE POLICY user_custom_dhikr_read ON public.user_custom_dhikr FOR SELECT USING (true);
