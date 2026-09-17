-- ===========================================================================
-- Magallanes LGU — schema and RLS fixes
--
-- Run this once in the Supabase dashboard: SQL Editor → New query → Run.
-- Every statement is idempotent, so running it twice is safe.
--
-- It fixes three things found during the functionality audit:
--   1. The public "Report a concern" form could not write to contact_messages
--      (RLS rejected the insert with code 42501).
--   2. transparency_documents has no is_archived column, so creating or
--      archiving a document failed.
--   3. Signed-in admins could not read chatbot_session_logs or contact_messages,
--      because no policy granted the `authenticated` role access.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. contact_messages — let the public file a report, but never read the inbox
-- ---------------------------------------------------------------------------
-- The form at /contact posts as the anonymous role. INSERT must be allowed;
-- SELECT must NOT be, or every citizen's report would be world-readable.

alter table public.contact_messages enable row level security;

drop policy if exists "anon can file a report" on public.contact_messages;
create policy "anon can file a report"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- Staff inbox: only signed-in admins may read and triage.
drop policy if exists "authenticated can read the inbox" on public.contact_messages;
create policy "authenticated can read the inbox"
  on public.contact_messages
  for select
  to authenticated
  using (true);

drop policy if exists "authenticated can triage the inbox" on public.contact_messages;
create policy "authenticated can triage the inbox"
  on public.contact_messages
  for update
  to authenticated
  using (true)
  with check (true);


-- ---------------------------------------------------------------------------
-- 2. transparency_documents — add the missing is_archived column
-- ---------------------------------------------------------------------------
-- The admin UI writes is_archived on create and on archive, and both the public
-- page and site search filter on it. The column simply was never created.

alter table public.transparency_documents
  add column if not exists is_archived boolean not null default false;


-- ---------------------------------------------------------------------------
-- 3. chatbot_session_logs — let admins read the transcripts
-- ---------------------------------------------------------------------------
-- The chat server writes these with the secret key (which bypasses RLS), so
-- only a read policy is needed. Anonymous visitors must stay blocked: these
-- rows contain whatever citizens typed into the chat widget.

alter table public.chatbot_session_logs enable row level security;

drop policy if exists "authenticated can read chat logs" on public.chatbot_session_logs;
create policy "authenticated can read chat logs"
  on public.chatbot_session_logs
  for select
  to authenticated
  using (true);


-- ---------------------------------------------------------------------------
-- 4. Public content — readable by everyone, writable only by admins
-- ---------------------------------------------------------------------------
-- Public SELECT already works on these tables. This block makes the admin CMS
-- able to write to them; without it, every create/update/delete in the console
-- fails with 42501 once you are signed in.

do $$
declare
  t text;
begin
  foreach t in array array[
    'news_announcements',
    'services',
    'barangays',
    'officials',
    'offices',
    'transparency_documents',
    'bids_awards',
    'intent_responses'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "public can read" on public.%I', t);
    execute format(
      'create policy "public can read" on public.%I for select to anon, authenticated using (true)', t);

    execute format('drop policy if exists "authenticated can write" on public.%I', t);
    execute format(
      'create policy "authenticated can write" on public.%I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;


-- ---------------------------------------------------------------------------
-- 5. Storage — let admins upload, let the public read
-- ---------------------------------------------------------------------------
-- FileUploadInput writes to the `public-documents` bucket. Create it if it is
-- missing and mark it public so transparency PDFs resolve for citizens.

insert into storage.buckets (id, name, public)
values ('public-documents', 'public-documents', true)
on conflict (id) do update set public = true;

drop policy if exists "public can read documents" on storage.objects;
create policy "public can read documents"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'public-documents');

drop policy if exists "authenticated can upload documents" on storage.objects;
create policy "authenticated can upload documents"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'public-documents');

drop policy if exists "authenticated can replace documents" on storage.objects;
create policy "authenticated can replace documents"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'public-documents')
  with check (bucket_id = 'public-documents');

drop policy if exists "authenticated can delete documents" on storage.objects;
create policy "authenticated can delete documents"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'public-documents');


-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- After running, this should list the policies created above.
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
