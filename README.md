# Magallanes Municipal Information Website with Bitoy, the AI chatbot

The municipal website of Magallanes, Agusan del Norte, with **Bitoy**, a bilingual (English and Bisaya) chatbot
embedded on every page. Capstone project of Jimuel N. Amuto, Jerve S. Guiral and Ma. Ereca Albiba (BS Information
Technology), advised by Mary Jun M. Palima and Ronald O. Monzon.

## How it works

```
Browser ── React website (Vite) ───────────── Supabase (PostgreSQL, Auth, Storage)
   │                                              ▲
   └── chat widget ── POST /api/chat ── Chat server (Node.js + Express) ── Dialogflow ES
```

| Part | Where | What it does |
|---|---|---|
| Website | `src/` | Public pages (news, services, downloadable forms, officials, offices, barangays, bids, transparency, tourism, report a concern) and the admin portal at `/admin`. Reads and writes Supabase directly, protected by Supabase Auth and Row-Level Security. |
| Chat server | `server/` | Receives each chat message, detects English or Bisaya, sends the question to Dialogflow ES, applies the conversation memory and the rules in `server/services/`, picks the answer, and logs the exchange. |
| Database | Supabase | Website content, chat logs (`chatbot_session_logs`) and staff-edited chatbot answers (`intent_responses`). SQL scripts in `supabase/`. |
| NLU | Dialogflow ES agent | Intent recognition. The intents and training phrases are defined in code (`server/services/*.js`) and built into `dialogflow/magallanes-intents.zip`. |

How Bitoy picks an answer, in order:

1. An answer staff edited in **Admin → Chatbot Responses**.
2. An answer built from what is posted on the website right now (`server/services/liveContent.js`): news,
   services, forms, officials, offices, barangays, bids and transparency documents.
3. The agent's built-in answer for the recognised intent, in the visitor's language (`server/services/responses.js`
   and the topic modules).
4. If nothing matched: a request to rephrase.

Dialogflow ES does not support Cebuano, so Bisaya is handled by the chat server: it detects the language and
rewrites Bisaya questions before they reach the agent (`server/services/languageDetect.js`), and every answer has
a Bisaya version. Conversation memory lasts 20 minutes of inactivity.

`backend/` is an early Flask prototype that only reads the news list; the running system does not use it.

## Running it locally

Requires Node.js 20 or newer.

1. `npm install`
2. Copy `.env.example` to `.env` and fill in the Supabase and Dialogflow values. Put the Dialogflow service-account
   key at `credentials/dialogflow-service-account.json`. Never commit either.
3. `npm run dev:all` starts the website (http://localhost:5173) and the chat server (http://localhost:3001) together.

New database? Run the scripts in `supabase/` in the Supabase SQL Editor, `fix-schema-and-policies.sql` first and
`add-forms-and-log-confidence.sql` last.

## Scripts

| Command | Does |
|---|---|
| `npm run dev:all` | Website and chat server together |
| `npm run dev` / `npm run server` | Only the website / only the chat server |
| `npm run build` | Production build of the website into `dist/` |
| `npm run lint` | ESLint |
| `npm test` | Offline checks of the answers built from website content |
| `npm run evaluate` | Chatbot evaluation against the running chat server (below) |
| `npm run dialogflow:build` | Rebuilds `dialogflow/magallanes-intents.zip`; import it in the Dialogflow console with **Import from ZIP** (never Restore) |
| `npm run images` | Regenerates the optimised images in `public/img/` from `assets-src/` |

## Evaluating the chatbot

`npm run evaluate` asks the 100 questions in `evaluation/test-set.json` (50 English, 50 Bisaya, 25 inquiry
categories) and three multi-turn conversations, then writes a report to `evaluation/results/`: accuracy, macro
precision, recall and F1, language detection, confidence, response times, a per-intent table and every wrong answer.

Before asking anything it checks that no test question copies or nearly copies one of the agent's training phrases,
so the score measures questions the bot has not been trained on. Keep it that way: when you improve the bot, do not
add the test questions to the training phrases.

## Deployment

The website runs on Vercel and the chat server on Render; see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
