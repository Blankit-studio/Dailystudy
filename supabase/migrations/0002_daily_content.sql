-- ============================================================
--  Daily Study — support for daily AI-generated content
-- ============================================================

-- Track when a card was added and where it came from.
alter table public.cards
  add column if not exists created_at timestamptz not null default now();
alter table public.cards
  add column if not exists origin text not null default 'seed';

-- Tag sentences with their origin and the date they were generated for.
alter table public.sentences
  add column if not exists origin text not null default 'seed';
alter table public.sentences
  add column if not exists for_date date;

create index if not exists idx_sentences_for_date
  on public.sentences (source_lang, target_lang, for_date);
create index if not exists idx_cards_created
  on public.cards (created_at);
