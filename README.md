# Tripser — Travel App Monorepo

A full-stack travel platform built with React + Tailwind (frontend), Node.js + Express (backend), and Supabase (database + auth).

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, TypeScript |
| Backend | Node.js, Express, TypeScript, tsx |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| AI | Google Gemini, Pinecone |
| Maps | Mapbox GL |

---

## Prerequisites

- **Node.js** v18+ — [download](https://nodejs.org)
- **npm** v9+
- **Supabase CLI** — `npm install -g supabase`
- A [Supabase](https://supabase.com) project (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)
- A [Mapbox](https://mapbox.com) token (optional — app works without it)

---

## Project Structure

```
tripser/
├── frontend/        # React + Vite + Tailwind
├── backend/         # Node.js + Express API
├── supabase/        # Migrations, Edge Functions, config
└── shared/          # Shared TypeScript types
```

---

## 1. Clone & Install

```bash
git clone https://github.com/your-username/tripser.git
cd tripser

# Install all workspace dependencies in one command
npm run install:all
```

---

## 2. Environment Variables

### Backend — `backend/.env`

Create this file (copy from `backend/.env.example`):

```bash
cp backend/.env.example backend/.env
```

Then fill in your values:

```bash
NODE_ENV=development
PORT=4000

# From: supabase.com → Project Settings → API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key   # never expose this to frontend

# From: aistudio.google.com
GEMINI_API_KEY=your-gemini-api-key

# From: pinecone.io → API Keys
PINECONE_API_KEY=your-pinecone-api-key

FRONTEND_URL=http://127.0.0.1:3000
```

### Frontend — `frontend/.env`

```bash
cp frontend/.env.example frontend/.env
```

```bash
# From: supabase.com → Project Settings → API
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-anon-key   # safe for browser, NOT the service role key

VITE_API_URL=http://127.0.0.1:3001

# Optional — from: mapbox.com → Tokens
VITE_MAPBOX_TOKEN=your-mapbox-token
```

> **Note:** Only `VITE_` prefixed variables are exposed to the browser. Never put `SUPABASE_SERVICE_KEY` in the frontend `.env`.

---

## 3. Database Setup

Apply the database schema to your Supabase project:

```bash
# Login to Supabase CLI
supabase login

# Link to your project (get project ref from supabase.com → Project Settings)
supabase link --project-ref your-project-ref

# Push migrations (creates all tables, RLS policies, triggers)
supabase db push
```

Or if running locally with Docker:

```bash
supabase start          # spins up local Supabase on Docker
supabase db reset       # applies all migrations + seed data
```

---

## 4. Run the App

```bash
# Run frontend + backend together
npm run dev

# Or run individually
npm run dev:frontend    # http://127.0.0.1:3000
npm run dev:backend     # http://127.0.0.1:4000
```

---

## 5. Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts frontend + backend in parallel |
| `npm run dev:frontend` | Starts only the React app |
| `npm run dev:backend` | Starts only the Express API |
| `npm run build` | Builds all workspaces for production |
| `npm run lint` | Runs linter across all workspaces |
| `npm run clean` | Deletes all `dist/` folders |
| `supabase db push` | Applies DB migrations to remote |
| `supabase functions deploy` | Deploys Edge Functions |

---

## 6. Deployment

### Frontend → Vercel

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add all `VITE_` environment variables in Vercel → Project Settings → Environment Variables
4. Deploy

### Backend → Railway / Render

1. Connect your GitHub repo
2. Set **Root Directory** to `backend`
3. Set **Start Command** to `npm run start`
4. Add all backend environment variables in the dashboard
5. Deploy

### Database → Supabase (already hosted)

```bash
supabase db push    # push any new migrations to production
```

---

## Troubleshooting

**`VITE_SUPABASE_URL` is undefined at runtime**
→ Make sure your `frontend/.env` file exists and variables start with `VITE_`. Restart the dev server after editing `.env`.

**Backend crashes on startup with env errors**
→ `env.ts` validates all required vars with zod. Check `backend/.env` has all required keys filled in (not just the `.env.example` placeholders).

**`supabase db push` fails**
→ Run `supabase login` and `supabase link --project-ref your-ref` first.

**Map not showing**
→ Add `VITE_MAPBOX_TOKEN` to `frontend/.env`. The app shows a placeholder image without it — this is expected.
