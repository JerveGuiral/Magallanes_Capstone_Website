# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three audiences, in order of design priority:

1. **Residents of Magallanes, Agusan del Norte** — the primary public-facing audience. They check weather/health/public-notice advisories, look up frontline services (permits, clearances, civil registry, tax, health, social assistance), read news, review transparency/FOI disclosures, look up barangay and official information, and can ask the bilingual (English/Bisaya-Cebuano) chatbot instead of navigating the site.
2. **Municipal staff** — internal users who log into `/admin` (Supabase-authenticated) to publish news, manage barangay/official/office records, bids & awards, transparency disclosures, services, chatbot canned responses, and review chat logs and public messages.
3. **Academic capstone panel / evaluators** — thesis advisers and defense panelists assess the site as a demonstration of the student developer's e-governance system design, so credibility, polish, and coherence of the demo matter as much as end-user usability.

## Product Purpose

A prototype e-governance website for the Municipality of Magallanes, Agusan del Norte (Caraga region, Philippines), built as an undergraduate capstone project. It stands in for a real LGU web presence: a public informational site (advisories, services directory, news, transparency/FOI, officials, barangays, tourism, contact) paired with an admin CMS for municipal staff to manage that content, plus a bilingual AI chatbot (Dialogflow-backed, English and Bisaya/Cebuano) that answers resident questions about services, fees, and requirements. Success for this phase means a coherent, credible, fully working demo ready for final defense — not a live production deployment for the actual LGU.

## Positioning

Unlike a generic municipal template, this project pairs the public site with a working bilingual chatbot that detects and responds in Bisaya/Cebuano (the region's dominant language) as well as English, and normalizes Bisaya queries for the underlying Dialogflow NLU — a concrete accessibility mechanism most comparable capstone or small-LGU sites don't attempt.

## Operating Context

- Public site and admin CMS are one Vite/React/TypeScript SPA (`react-router-dom`), split into public routes and `/admin/*` routes gated by `AdminAuthContext`.
- Data persistence and auth run through Supabase (`src/lib/supabaseClient.ts`, `@supabase/supabase-js`); admin login is Supabase email/password auth (default demo admin: `admin@magallanes.gov.ph`).
- The chatbot has its own Node/Express backend (`server/`) integrating `@google-cloud/dialogflow`, with `services/languageDetect.js` (Bisaya marker-word detection + query normalization) and `services/responses.js` shaping replies; `ChatWidget.tsx` is the front-end entry point.
- A separate Python/FastAPI-style backend exists under `backend/` (Supabase client, `run.py`) — treat as secondary/experimental unless a task says otherwise; the Node/Express server is the chatbot's live backend.
- Content areas mirror real LGU structures: 8 named barangays (Poblacion, Caloc-an, Guiasan, Buhang, Marcos, Santo Niño, Santo Rosario, Taod-oy), an Executive/Sangguniang Bayan/Department Heads officials roster, BPLO/Civil Registry/Treasurer/RHU/MSWDO/BAC-style frontline services, and standard transparency disclosures (budget, AIP, debt service).
- Tourism section and a municipal map (`react-leaflet`, `MunicipalMap.tsx`) are part of the public site alongside the civic content.

## Capabilities and Constraints

- Confirmed functionality: public informational pages, advisory feed, services directory, news + news detail, tourism + tourism detail, transparency/FOI disclosures, bids & awards, officials directory, barangay directory, contact/office directory, site search (`SiteSearch.tsx`), bilingual chatbot widget; full admin CRUD-style management screens for each public content area plus chat log review, public message inbox, and chatbot canned-response management.
- Bisaya language handling is keyword/marker-based (not a full NLU model of its own) — it detects Bisaya via marker words and phrase patterns, then normalizes into English-equivalent queries before handing off to Dialogflow.
- Admin roles: single `role` field exists on the Supabase user object but the app does not yet branch UI/permissions by role — treat all authenticated admin users as having full CMS access unless a task says otherwise.
- Social links (`SOCIAL_LINKS` in `src/data/site.ts`) are intentionally empty placeholders; header/footer already filter out any account with a blank `href`, so this is expected, not a bug.

## Brand Commitments

- Municipality name and identity: "Municipality of Magallanes," Agusan del Norte, Caraga region. Local motif component (`BitaugMotif.tsx`) suggests a bitaug-tree-derived visual motif is already part of the intended identity — treat as an existing brand element to preserve/extend rather than reinvent, subject to confirmation during any visual-world work.
- No other binding visual, voice, or identity constraints were volunteered; treat typography, palette, and broader visual direction as open decisions for design work (out of scope for this file).

## Evidence on Hand

- All named entities are fabricated for the capstone demo and must stay clearly placeholder, not be dressed up as verified real-world facts: barangay captain names, the mayor/vice-mayor/SB/department-head roster in `src/data/government.ts`, sample advisories/news items, and disclosure line items are all synthetic (the source data file for barangays says so explicitly: captain names are "placeholder names for this project, not current officials").
- No real social media accounts, press materials, testimonials, or case studies exist — do not fabricate any.
- Household counts for barangays are noted in-code as estimated from 2020 census population ÷ ~4.5 per household — a stated estimation method, not a claimed official figure.

## Product Principles

1. Preserve the placeholder/demo nature of civic data — never make fabricated names, figures, or accounts read as verified real LGU facts.
2. Treat residents as the primary design audience day-to-day, but keep the demo legible and credible to an academic panel — clarity and polish read as rigor in a defense setting.
3. Keep the bilingual chatbot experience (English + Bisaya/Cebuano) a first-class, visible capability rather than a buried feature, since it's the project's clearest differentiator.
4. Admin CMS screens serve working municipal staff doing routine content upkeep — favor scannability and low-friction CRUD over marketing polish there (Operate mode), while public pages can carry more expressive design (Persuade/Read/Experience depending on surface).
5. This is a feature-complete capstone entering the polish phase — prioritize refinement, coherence, and defense-readiness over adding new functionality unless explicitly requested.

## Accessibility & Inclusion

No formal accessibility standard (e.g. WCAG level) was specified as a requirement. Bilingual language support (English/Bisaya-Cebuano) is a confirmed, deliberate inclusion feature for the chatbot; treat parity of language support as a soft requirement when touching chatbot-adjacent UI.
