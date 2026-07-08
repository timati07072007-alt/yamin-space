-- AAA migration: gamification, avatars, chat, book pagination
-- Applied to Supabase project via MCP (20260708165230–20260708165248)

-- ── Users: profile & league fields ──────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS avatar_id text NOT NULL DEFAULT 'mosque',
  ADD COLUMN IF NOT EXISTS league_tier text NOT NULL DEFAULT 'bronze',
  ADD COLUMN IF NOT EXISTS weekly_xp integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS week_key text NOT NULL DEFAULT '';

-- ── Diamonds (server-only writes) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diamonds_balance (
  user_id bigint PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Leagues ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leagues (
  id text PRIMARY KEY,
  name_ru text NOT NULL,
  min_weekly_xp integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  color_hex text NOT NULL DEFAULT '#cd7f32'
);

INSERT INTO leagues (id, name_ru, min_weekly_xp, sort_order, color_hex) VALUES
  ('bronze',  'Бронза',   0,   1, '#cd7f32'),
  ('silver',  'Серебро',  150, 2, '#94a3b8'),
  ('gold',    'Золото',   400, 3, '#eab308'),
  ('emerald', 'Изумруд',  800, 4, '#10b981')
ON CONFLICT (id) DO NOTHING;

-- ── Halal avatars ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_avatars (
  id text PRIMARY KEY,
  label_ru text NOT NULL,
  emoji text NOT NULL,
  gradient_from text NOT NULL DEFAULT '#d1fae5',
  gradient_to text NOT NULL DEFAULT '#fef3c7',
  sort_order integer NOT NULL DEFAULT 0
);

INSERT INTO user_avatars (id, label_ru, emoji, gradient_from, gradient_to, sort_order) VALUES
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

-- ── Global chat ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS global_chat (
  id bigserial PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_id text NOT NULL DEFAULT 'mosque',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS global_chat_created_at_idx ON global_chat (created_at DESC);

-- ── Book pages (paginated reader) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS books_pages (
  id bigserial PRIMARY KEY,
  book_id bigint NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_number integer NOT NULL,
  content_html text NOT NULL DEFAULT '',
  illustration_url text,
  UNIQUE (book_id, page_number)
);

CREATE INDEX IF NOT EXISTS books_pages_book_id_idx ON books_pages (book_id, page_number);

-- ── RLS: read-only for anon/authenticated clients ───────────────────────────
ALTER TABLE diamonds_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS diamonds_select ON diamonds_balance;
CREATE POLICY diamonds_select ON diamonds_balance FOR SELECT USING (true);

DROP POLICY IF EXISTS leagues_read ON leagues;
CREATE POLICY leagues_read ON leagues FOR SELECT USING (true);

DROP POLICY IF EXISTS avatars_read ON user_avatars;
CREATE POLICY avatars_read ON user_avatars FOR SELECT USING (true);

DROP POLICY IF EXISTS chat_read ON global_chat;
CREATE POLICY chat_read ON global_chat FOR SELECT USING (true);

DROP POLICY IF EXISTS books_pages_read ON books_pages;
CREATE POLICY books_pages_read ON books_pages FOR SELECT USING (true);

-- No INSERT/UPDATE/DELETE policies → client cannot mutate diamonds or chat.
-- Writes go through Next.js API routes using service_role (createAdminSupabase).

-- ── Realtime for global chat ────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE global_chat;
