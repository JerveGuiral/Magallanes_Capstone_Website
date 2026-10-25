-- ===========================================================================
-- Admin-defined chatbot intents: sample questions
--
-- Lets staff add brand-new questions and answers in Admin → Chatbot Responses.
-- The chat server matches citizens' messages against these sample questions
-- itself (server/services/liveContent.js), so new topics work without editing
-- the Dialogflow agent. Rows without sample questions keep their old meaning:
-- a replacement reply for an existing agent intent.
--
-- Additive and idempotent; existing rows are untouched.
-- ===========================================================================

alter table public.intent_responses
  add column if not exists training_phrases text[] not null default '{}';

-- The Bisaya reply is optional: when blank, the chatbot uses the English one.
alter table public.intent_responses
  alter column response_bisaya set default '';
