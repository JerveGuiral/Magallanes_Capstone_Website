-- ===========================================================================
-- Magallanes LGU — fix #2: contact_messages insert policy
--
-- Run in Supabase: SQL Editor → New query → Run.
--
-- Why this is needed even though fix-schema-and-policies.sql already ran:
-- that script only dropped policies by the exact names it was about to create.
-- contact_messages still rejects the public form with 42501, and the rest of
-- that migration verifiably applied, so the table must carry a pre-existing
-- policy under some other name. A RESTRICTIVE policy ANDs with every permissive
-- one, so a single leftover `restrictive ... with check (false)` silently
-- defeats any new policy no matter how permissive it is.
--
-- This script therefore drops EVERY policy on the table by enumerating
-- pg_policies, then recreates exactly the three the application needs.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Show what is on the table right now (read this in the Results pane)
-- ---------------------------------------------------------------------------
select
  policyname,
  cmd,
  permissive,          -- 'RESTRICTIVE' here is the likely culprit
  roles,
  qual        as using_expression,
  with_check  as with_check_expression
from pg_policies
where schemaname = 'public'
  and tablename  = 'contact_messages'
order by policyname;


-- ---------------------------------------------------------------------------
-- 2. Drop every existing policy on the table, whatever it is called
-- ---------------------------------------------------------------------------
do $$
declare
  p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'contact_messages'
  loop
    execute format('drop policy %I on public.contact_messages', p.policyname);
    raise notice 'dropped policy: %', p.policyname;
  end loop;
end $$;


-- ---------------------------------------------------------------------------
-- 3. Recreate a clean, minimal set
-- ---------------------------------------------------------------------------
alter table public.contact_messages enable row level security;

-- Make sure the table-level grants exist. RLS cannot allow what GRANT forbids,
-- and a table created outside the dashboard sometimes lacks these.
grant insert on public.contact_messages to anon;
grant select, insert, update on public.contact_messages to authenticated;

-- The public form at /contact posts as `anon`. Insert only — never select.
create policy "public may file a report"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- The staff inbox. Signed-in admins read and triage; the public never can.
create policy "staff may read the inbox"
  on public.contact_messages
  for select
  to authenticated
  using (true);

create policy "staff may triage the inbox"
  on public.contact_messages
  for update
  to authenticated
  using (true)
  with check (true);


-- ---------------------------------------------------------------------------
-- 4. Self-test — proves the policy works as the anon role, then cleans up
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    set local role anon;
    insert into public.contact_messages (name, email, message, is_read, is_archived)
    values ('__selftest__', 'selftest@local', 'policy self-test', false, false);
    reset role;

    delete from public.contact_messages where name = '__selftest__';
    raise notice '✅ SELF-TEST PASSED — anon can file a report, row cleaned up.';
  exception
    when others then
      reset role;
      raise notice '❌ SELF-TEST FAILED — % (%)', sqlerrm, sqlstate;
  end;
end $$;


-- ---------------------------------------------------------------------------
-- 5. Confirm the final state
-- ---------------------------------------------------------------------------
select policyname, cmd, permissive, roles
from pg_policies
where schemaname = 'public' and tablename = 'contact_messages'
order by cmd, policyname;
