-- ============================================================
--  Daily Study — initial schema
-- ============================================================

-- Languages -------------------------------------------------
create table if not exists public.languages (
  code        text primary key,
  name_native text not null,
  name_ko     text not null,
  flag        text
);

-- Profiles (1:1 with auth.users) ----------------------------
create table if not exists public.profiles (
  id                   uuid primary key references auth.users (id) on delete cascade,
  display_name         text,
  ui_language          text not null default 'ko',
  learning_source_lang text not null default 'ko' references public.languages (code),
  learning_target_lang text not null default 'en' references public.languages (code),
  created_at           timestamptz not null default now()
);

-- Decks (a set of cards for one source→target pair) ---------
create table if not exists public.decks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  source_lang text not null references public.languages (code),
  target_lang text not null references public.languages (code),
  level       text,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

-- Cards (vocabulary / expressions) --------------------------
create table if not exists public.cards (
  id              uuid primary key default gen_random_uuid(),
  deck_id         uuid not null references public.decks (id) on delete cascade,
  term            text not null,
  reading         text,
  meaning         text not null,
  example         text,
  example_meaning text,
  sort_order      int  not null default 0
);

-- Sentences (daily sentence / conversation practice) --------
create table if not exists public.sentences (
  id          uuid primary key default gen_random_uuid(),
  source_lang text not null references public.languages (code),
  target_lang text not null references public.languages (code),
  level       text,
  text_target text not null,
  reading     text,
  text_source text not null,
  day_index   int,
  created_at  timestamptz not null default now()
);

-- Per-user SRS progress -------------------------------------
create table if not exists public.user_cards (
  user_id          uuid not null references auth.users (id) on delete cascade,
  card_id          uuid not null references public.cards (id) on delete cascade,
  ease             real not null default 2.5,
  interval_days    int  not null default 0,
  repetitions      int  not null default 0,
  due_date         date not null default current_date,
  last_reviewed_at timestamptz,
  status           text not null default 'new',
  primary key (user_id, card_id)
);

-- Daily activity log (streaks & statistics) ----------------
create table if not exists public.study_logs (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  studied_on        date not null default current_date,
  cards_reviewed    int  not null default 0,
  sentences_studied int  not null default 0,
  created_at        timestamptz not null default now(),
  unique (user_id, studied_on)
);

create index if not exists idx_decks_langs      on public.decks (source_lang, target_lang);
create index if not exists idx_cards_deck        on public.cards (deck_id);
create index if not exists idx_sentences_langs   on public.sentences (source_lang, target_lang, day_index);
create index if not exists idx_user_cards_due    on public.user_cards (user_id, due_date);
create index if not exists idx_study_logs_user   on public.study_logs (user_id, studied_on);

-- ============================================================
--  Row Level Security
-- ============================================================
alter table public.languages  enable row level security;
alter table public.profiles    enable row level security;
alter table public.decks       enable row level security;
alter table public.cards       enable row level security;
alter table public.sentences   enable row level security;
alter table public.user_cards  enable row level security;
alter table public.study_logs  enable row level security;

-- Public, read-only content --------------------------------
drop policy if exists "languages are readable by everyone" on public.languages;
create policy "languages are readable by everyone"
  on public.languages for select using (true);

drop policy if exists "decks are readable by everyone" on public.decks;
create policy "decks are readable by everyone"
  on public.decks for select using (true);

drop policy if exists "cards are readable by everyone" on public.cards;
create policy "cards are readable by everyone"
  on public.cards for select using (true);

drop policy if exists "sentences are readable by everyone" on public.sentences;
create policy "sentences are readable by everyone"
  on public.sentences for select using (true);

-- Profiles: owner only -------------------------------------
drop policy if exists "users can view own profile" on public.profiles;
create policy "users can view own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- user_cards: owner only -----------------------------------
drop policy if exists "users manage own card progress" on public.user_cards;
create policy "users manage own card progress"
  on public.user_cards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- study_logs: owner only -----------------------------------
drop policy if exists "users manage own study logs" on public.study_logs;
create policy "users manage own study logs"
  on public.study_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
--  Auto-create a profile row for every new auth user
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
