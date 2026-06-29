-- ============================================================
--  Daily Study — AI-generated reports (reset summary & weekly)
-- ============================================================

create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users (id) on delete cascade, -- null = global/system report
  kind         text not null,            -- 'reset' | 'weekly'
  period_start date,
  period_end   date,
  title        text not null,
  body         text not null,
  stats        jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists idx_reports_user_created
  on public.reports (user_id, created_at desc);
create index if not exists idx_reports_kind_created
  on public.reports (kind, created_at desc);

alter table public.reports enable row level security;

-- Readable: a user's own reports, plus global (user_id is null) reports.
-- Inserts happen via the service-role key (cron / reset), which bypasses RLS.
drop policy if exists "reports readable by owner or global" on public.reports;
create policy "reports readable by owner or global"
  on public.reports for select
  using (user_id is null or auth.uid() = user_id);
