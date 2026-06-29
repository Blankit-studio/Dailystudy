-- ============================================================
--  Daily Study — additional selectable languages
-- ============================================================
-- Adding a row here is all that is needed to support a new language:
-- it becomes selectable in Settings, and the AI generator resolves its
-- name from this table when creating content.

insert into public.languages (code, name_native, name_ko, flag) values
  ('de', 'Deutsch',           '독일어',       '🇩🇪'),
  ('it', 'Italiano',          '이탈리아어',   '🇮🇹'),
  ('pt', 'Português',         '포르투갈어',   '🇵🇹'),
  ('ru', 'Русский',           '러시아어',     '🇷🇺'),
  ('vi', 'Tiếng Việt',        '베트남어',     '🇻🇳'),
  ('th', 'ไทย',               '태국어',       '🇹🇭'),
  ('id', 'Bahasa Indonesia',  '인도네시아어', '🇮🇩')
on conflict (code) do nothing;
