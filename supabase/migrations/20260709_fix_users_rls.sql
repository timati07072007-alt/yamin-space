-- users: RLS was enabled without policies → blocked inserts via anon/API fallback.
-- Writes go through Next.js API (service_role); client reads profiles via API too.
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
