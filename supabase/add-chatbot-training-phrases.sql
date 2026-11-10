-- Training phrases added from Admin → Chatbot Reports ("Train" on a question Magi could not
-- answer). The chat server adds the phrase to the Dialogflow intent (or to an admin topic's
-- sample questions) and records it here:
--   - an audit trail: who taught Magi what, and when;
--   - the source for `npm run dialogflow:build`, which merges these phrases into the intents it
--     builds from code, so re-importing the ZIP does not wipe what staff added.
--
-- Only the chat server writes (with the secret key, which bypasses RLS); signed-in staff can read.
-- Safe to run more than once.

create table if not exists public.chatbot_training_phrases (
  id uuid primary key default gen_random_uuid(),
  phrase text not null check (char_length(phrase) between 2 and 256),
  intent_name text not null,
  -- 'dialogflow': added to the agent's intent (machine learning).
  -- 'admin_topic': added to a topic's sample questions in Admin → Chatbot Responses.
  target text not null default 'dialogflow' check (target in ('dialogflow', 'admin_topic')),
  language text check (language in ('english', 'bisaya')),
  -- The question as the resident typed it, when staff corrected it before adding.
  source_question text,
  added_by text,
  created_at timestamptz not null default now()
);

create index if not exists chatbot_training_phrases_created_at_idx
  on public.chatbot_training_phrases (created_at desc);

alter table public.chatbot_training_phrases enable row level security;

revoke all on public.chatbot_training_phrases from anon;
grant select on public.chatbot_training_phrases to authenticated;

drop policy if exists "authenticated can read training phrases" on public.chatbot_training_phrases;
create policy "authenticated can read training phrases"
  on public.chatbot_training_phrases
  for select
  to authenticated
  using (true);
