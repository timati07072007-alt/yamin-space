-- Yamin Space: схема образовательного блока (викторины)
-- Выполни этот скрипт в Supabase Dashboard -> SQL Editor.

-- 1. Темы викторин
create table if not exists public.quizzes (
  id bigint generated always as identity primary key,
  title text not null,
  category text not null,
  difficulty text not null default 'easy'
    check (difficulty in ('easy', 'medium', 'hard')),
  created_at timestamptz not null default now()
);

-- 2. Вопросы
create table if not exists public.questions (
  id bigint generated always as identity primary key,
  quiz_id bigint not null references public.quizzes (id) on delete cascade,
  question_text text not null,
  options text[] not null,
  correct_option_index int not null,
  xp_reward int not null default 10,
  coins_reward int not null default 5,
  created_at timestamptz not null default now(),
  constraint options_not_empty check (array_length(options, 1) >= 2),
  constraint correct_index_in_range
    check (correct_option_index >= 0 and correct_option_index < array_length(options, 1))
);

create index if not exists questions_quiz_id_idx on public.questions (quiz_id);

-- 3. Ответы пользователей (защита от повторного фарма наград)
create table if not exists public.quiz_answers (
  id bigint generated always as identity primary key,
  user_id bigint not null references public.users (id) on delete cascade,
  question_id bigint not null references public.questions (id) on delete cascade,
  selected_option_index int not null,
  is_correct boolean not null,
  created_at timestamptz not null default now(),
  constraint quiz_answers_unique unique (user_id, question_id)
);

create index if not exists quiz_answers_user_idx on public.quiz_answers (user_id);

-- 4. Тестовые данные
insert into public.quizzes (title, category, difficulty) values
  ('Основы Ислама', 'Акыда', 'easy'),
  ('История Пророков', 'Сира', 'medium')
on conflict do nothing;

insert into public.questions
  (quiz_id, question_text, options, correct_option_index, xp_reward, coins_reward)
values
  (1, 'Сколько столпов Ислама?',
    array['Три', 'Пять', 'Семь', 'Девять'], 1, 10, 5),
  (1, 'Как называется ежедневная пятикратная молитва?',
    array['Закят', 'Саум', 'Намаз', 'Хадж'], 2, 10, 5),
  (1, 'В каком месяце мусульмане соблюдают пост?',
    array['Шавваль', 'Рамадан', 'Раджаб', 'Мухаррам'], 1, 10, 5),
  (2, 'Кто был первым Пророком?',
    array['Нух (а.с.)', 'Ибрахим (а.с.)', 'Адам (а.с.)', 'Муса (а.с.)'], 2, 15, 8),
  (2, 'Какой Пророк построил ковчег?',
    array['Нух (а.с.)', 'Юнус (а.с.)', 'Юсуф (а.с.)', 'Иса (а.с.)'], 0, 15, 8)
on conflict do nothing;
