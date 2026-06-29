-- ============================================================
--  Daily Study — per-user difficulty level
-- ============================================================

alter table public.profiles
  add column if not exists learning_level text not null default 'beginner';

-- Give every existing piece of content a concrete level so level
-- filtering shows it. Legacy AI content used level 'daily'.
update public.decks
  set level = 'beginner'
  where level = 'daily' or level is null;
update public.sentences
  set level = 'beginner'
  where level = 'daily' or level is null;
