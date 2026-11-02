-- ===========================================================================
-- Magallanes LGU — downloadable forms, confidence in chat logs, private news drafts
--
-- Run this once in the Supabase dashboard: SQL Editor → New query → Run.
-- Every statement is idempotent, so running it twice is safe.
--
--   1. chatbot_session_logs gets a `confidence` column. FR-09 requires every
--      interaction to be stored with its confidence score; the chat server
--      writes Dialogflow's intent detection confidence (0–1) there.
--   2. downloadable_forms holds the forms citizens download from /forms
--      (FR-01, FR-07). Staff manage it in Admin → Downloadable Forms, and the
--      chatbot answers from it ("where can I get the business permit form?").
--   3. Unpublished news drafts stop being readable by the public. The pages
--      only hid them after downloading them; anyone could read a draft through
--      the API.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. chatbot_session_logs.confidence
-- ---------------------------------------------------------------------------
-- Nullable: rows logged before this change have no score, and a turn where
-- Dialogflow could not be reached has none either.

alter table public.chatbot_session_logs
  add column if not exists confidence real;

alter table public.chatbot_session_logs
  drop constraint if exists chatbot_session_logs_confidence_range;
alter table public.chatbot_session_logs
  add constraint chatbot_session_logs_confidence_range
  check (confidence is null or (confidence >= 0 and confidence <= 1));


-- ---------------------------------------------------------------------------
-- 2. downloadable_forms
-- ---------------------------------------------------------------------------

create table if not exists public.downloadable_forms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_bisaya text,
  description text,
  office text,
  file_url text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.downloadable_forms enable row level security;

grant select on public.downloadable_forms to anon;
grant select, insert, update, delete on public.downloadable_forms to authenticated;
-- The chat server reads it with the secret key (service_role) to answer forms questions.
grant select, insert, update, delete on public.downloadable_forms to service_role;

-- The public sees published forms only; a form saved as a draft stays private.
drop policy if exists "public can read published forms" on public.downloadable_forms;
create policy "public can read published forms"
  on public.downloadable_forms
  for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "authenticated can write" on public.downloadable_forms;
create policy "authenticated can write"
  on public.downloadable_forms
  for all
  to authenticated
  using (true)
  with check (true);


-- ---------------------------------------------------------------------------
-- 3. news_announcements — the public reads published posts only
-- ---------------------------------------------------------------------------
-- fix-schema-and-policies.sql gave every content table a "public can read"
-- policy with `using (true)`. On news it overrides "Public can view published
-- news", which already lets the public read published posts. Signed-in staff
-- keep reading drafts through "authenticated can write" (for all).

drop policy if exists "public can read" on public.news_announcements;

drop policy if exists "Public can view published news" on public.news_announcements;
create policy "Public can view published news"
  on public.news_announcements
  for select
  to anon, authenticated
  using (is_published = true);


-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename in ('downloadable_forms', 'news_announcements')
order by tablename, policyname;
