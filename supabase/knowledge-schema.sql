-- Yamin Space: раздел знаний (книги и хадисы)
-- Выполни этот скрипт в Supabase Dashboard -> SQL Editor.

-- 1. Книги
create table if not exists public.books (
  id bigint generated always as identity primary key,
  title text not null,
  author text not null,
  description text not null default '',
  category_age text not null default 'adults'
    check (category_age in ('children', 'teens', 'adults')),
  content_url text,
  content_text text,
  created_at timestamptz not null default now()
);

create index if not exists books_category_idx on public.books (category_age);

-- 2. Хадисы
create table if not exists public.hadiths (
  id bigint generated always as identity primary key,
  text_ru text not null,
  author text not null,
  collection text not null,
  authenticity text not null default 'sahih'
    check (authenticity in ('sahih', 'hasan', 'daif')),
  created_at timestamptz not null default now()
);

-- 3. Тестовые данные: книги
insert into public.books (title, author, description, category_age, content_url) values
  ('Мой первый намаз', 'Абдуррахман аль-Кари',
   'Красочное пособие, которое учит детей совершать намаз шаг за шагом.',
   'children', null),
  ('Истории Пророков для малышей', 'Умм Убайда',
   'Добрые пересказы историй Пророков простым языком для самых маленьких.',
   'children', null),
  ('Путь юного мусульманина', 'Идрис Галяутдин',
   'Об исламском этикете, дружбе и характере — для подростков.',
   'teens', null),
  ('40 хадисов ан-Навави с пояснениями', 'Имам ан-Навави',
   'Классический сборник из сорока хадисов с доступными комментариями.',
   'teens', null),
  ('Крепость мусульманина', 'Саид аль-Кахтани',
   'Сборник дуа и азкаров на каждый день из Корана и Сунны.',
   'adults', null),
  ('Жизнеописание Пророка ﷺ', 'Сафи ар-Рахман аль-Мубаракфури',
   '«Запечатанный нектар» — подробная сира Посланника Аллаха ﷺ.',
   'adults', null)
on conflict do nothing;

-- 4. Тестовые данные: хадисы
insert into public.hadiths (text_ru, author, collection, authenticity) values
  ('Поистине, дела оцениваются только по намерениям, и каждому человеку достанется лишь то, что он намеревался обрести.',
   'Умар ибн аль-Хаттаб (р.а.)', 'Сахих аль-Бухари, 1', 'sahih'),
  ('Не уверует никто из вас по-настоящему, пока не станет желать брату своему того же, чего желает самому себе.',
   'Анас ибн Малик (р.а.)', 'Сахих аль-Бухари, 13', 'sahih'),
  ('Лучший из вас тот, кто изучает Коран и обучает ему других.',
   'Усман ибн Аффан (р.а.)', 'Сахих аль-Бухари, 5027', 'sahih'),
  ('Улыбка твоя, обращённая к брату твоему, — милостыня.',
   'Абу Зарр (р.а.)', 'Джами ат-Тирмизи, 1956', 'hasan'),
  ('Стремление к знанию — обязанность каждого мусульманина.',
   'Анас ибн Малик (р.а.)', 'Сунан Ибн Маджа, 224', 'hasan'),
  ('Кто указал на благое, тому полагается такая же награда, как и совершившему его.',
   'Абу Масуд аль-Ансари (р.а.)', 'Сахих Муслим, 1893', 'sahih')
on conflict do nothing;
