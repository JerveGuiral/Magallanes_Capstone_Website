# Deploying the Magallanes website and Bitoy

The site runs as two services:

| Part | Host | What it is |
|---|---|---|
| Website | **Vercel** (free) | The React site, built with `npm run build` (`vercel.json`) |
| Chat server | **Render** (free) | `server/index.js`, the Express server between the site and Dialogflow (`render.yaml`) |

The database (Supabase) and the chatbot agent (Dialogflow) are already online and stay as they are.

Deploy the chat server first: the website needs its address.

## Before you start

- The latest code is pushed to GitHub (`JerveGuiral/Magallanes_Capstone_Website`). Both hosts deploy from a branch: use
  `main` after merging, or pick `chatbot-and-site-updates`.
- Have these ready (from your local `.env` and `credentials/` folder, **never commit them**):
  - the Dialogflow service-account file `credentials/dialogflow-service-account.json`
  - `SUPABASE_URL` and `SUPABASE_SECRET_KEY` (chat server)
  - `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (website)

## 1. Chat server on Render

1. Sign in at render.com with GitHub, then **New → Blueprint** and choose the repository. Render reads `render.yaml`
   and proposes the `magallanes-chat` web service.
2. Fill in the secret values it asks for:
   - `GOOGLE_CREDENTIALS_JSON`: open `credentials/dialogflow-service-account.json` and paste its whole content.
   - `SUPABASE_URL`, `SUPABASE_SECRET_KEY`: from your `.env`.
   - `ALLOWED_ORIGINS`: leave empty for now; you fill it in step 3.
3. Click **Apply**. When the deploy finishes, open `https://<your-service>.onrender.com/api/health`. It should show
   `"status":"ok"` and `"credentialsConfigured":true`.

## 2. Website on Vercel

1. Sign in at vercel.com with GitHub, then **Add New → Project** and import the repository. Vercel detects Vite and
   uses `vercel.json`.
2. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`: from your `.env`.
   - `VITE_API_URL`: the Render address from step 1, e.g. `https://magallanes-chat.onrender.com` (no trailing slash).
   - `VITE_OFFICIAL_SITE`: `false` (see "Making it the official site" below).
3. Click **Deploy**. You get an address like `https://magallanes.vercel.app`.

## 3. Connect the two

1. In Render, set `ALLOWED_ORIGINS` to the Vercel address, e.g. `https://magallanes.vercel.app` (comma-separate
   several, such as a custom domain later). Save; Render redeploys.
2. This also turns on the per-visitor limit of 20 chat messages a minute, which protects the Dialogflow quota.

## 4. Keep the chat server awake for demos

Render's free server sleeps after 15 minutes without visits, and the first reply after that takes up to a minute.
The website already pings it when a page loads. Before a demo or the defense:

- Open the site a minute early, or
- Create a free monitor at uptimerobot.com that requests `https://<your-service>.onrender.com/api/health` every
  10 minutes. It keeps the server awake around the clock.

## 5. Check it works

On a phone, open the Vercel address and confirm:

- The pages load, including a direct link such as `/officials` (refresh it too).
- **Ask Bitoy** answers in English and Bisaya, for example "Kinsa ang mayor sa Magallanes?".
- The Admin portal signs in and its lists load.

If Bitoy says it can't reach the assistant: check `VITE_API_URL` on Vercel (redeploy after changing it),
`ALLOWED_ORIGINS` on Render, and `/api/health`.

## Updating the site

Push to the deployed branch. Vercel and Render rebuild automatically. After changing Dialogflow intents, run
`npm run dialogflow:build` and import `dialogflow/magallanes-intents.zip` in the Dialogflow console (**Import from
ZIP**, not Restore).

## Making it the official site

Until the LGU formally adopts the site, keep `VITE_OFFICIAL_SITE=false`. The site then says it is a capstone project
in the top bar and footer, and asks search engines not to index it, so a shared link is never mistaken for the
municipality's official website.

When the LGU adopts it:

1. The LGU registers a `.gov.ph` domain through DICT and adds it in Vercel (**Settings → Domains**).
2. Add the new domain to `ALLOWED_ORIGINS` on Render.
3. Set `VITE_OFFICIAL_SITE=true` on Vercel and redeploy.
4. Upgrade the Dialogflow agent from the Trial to the Essentials edition. The trial allows about 180 chat queries a
   minute for the whole site, which a town-wide audience can exceed.
