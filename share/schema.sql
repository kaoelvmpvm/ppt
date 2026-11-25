-- 健促 AI 健多多｜策略共創分享區
-- 於 Supabase 專案 SQL Editor 執行一次，無須自行建立伺服器。
-- 公開投稿僅允許 INSERT；任何人可 SELECT；UPDATE/DELETE 不對訪客開放。
-- 若擔心不當投稿，請使用 Supabase Dashboard 的 Table Editor 管理。

create extension if not exists pgcrypto;

create table if not exists public.strategy_shares (
  id uuid primary key default gen_random_uuid(),
  school_name varchar(80) not null check (char_length(btrim(school_name)) between 2 and 80),
  school_key text generated always as (lower(regexp_replace(btrim(school_name), '[[:space:]　]+', '', 'g'))) stored,
  topic varchar(50) not null default '正向心理健康促進',
  activity_code varchar(24) not null default '',
  activity_name varchar(120) not null check (char_length(btrim(activity_name)) between 2 and 120),
  activity_description varchar(3000) not null check (char_length(btrim(activity_description)) >= 12),
  target_audience varchar(600) not null default '',
  suggested_time varchar(600) not null default '',
  key_opinions varchar(600) not null default '',
  indicators varchar(600) not null default '',
  hps_focus varchar(300) not null default '',
  hps_evidence varchar(2000) not null default '',
  ophelia_focus varchar(300) not null default '',
  ophelia_evidence varchar(2000) not null default '',
  hps_success varchar(1500) not null default '',
  ophelia_success varchar(1500) not null default '',
  hps_pitfalls varchar(1500) not null default '',
  ophelia_pitfalls varchar(1500) not null default '',
  hps_collab varchar(1500) not null default '',
  ophelia_collab varchar(1500) not null default '',
  hps_check varchar(1500) not null default '',
  ophelia_check varchar(1500) not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_strategy_shares_date on public.strategy_shares(created_at desc);
create index if not exists idx_strategy_shares_school on public.strategy_shares(school_key);

alter table public.strategy_shares enable row level security;
revoke all on table public.strategy_shares from anon, authenticated;
grant select on table public.strategy_shares to anon, authenticated;
-- 僅允許公開前端寫入「內容欄位」，不能自行指定 id、school_key 或 created_at。
grant insert (
  school_name, topic, activity_code, activity_name, activity_description,
  target_audience, suggested_time, key_opinions, indicators,
  hps_focus, hps_evidence, ophelia_focus, ophelia_evidence,
  hps_success, ophelia_success, hps_pitfalls, ophelia_pitfalls,
  hps_collab, ophelia_collab, hps_check, ophelia_check
) on table public.strategy_shares to anon, authenticated;

-- 預留多次執行的可重複性
DROP POLICY IF EXISTS "public_read_strategy_shares" ON public.strategy_shares;
DROP POLICY IF EXISTS "public_insert_strategy_shares" ON public.strategy_shares;
create policy "public_read_strategy_shares"
  on public.strategy_shares for select to anon, authenticated using (true);
create policy "public_insert_strategy_shares"
  on public.strategy_shares for insert to anon, authenticated
  with check (char_length(btrim(school_name)) >= 2 AND char_length(btrim(activity_name)) >= 2 AND char_length(btrim(activity_description)) >= 12);

-- 本服務供研習課程使用：開放匿名投稿仍有垃圾內容或冒用學校的風險。
-- 正式大規模公開前，建議新增管理者審核、驗證/速率限制，或要求教師登入。
