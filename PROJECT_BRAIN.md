# VibeCraft — Project Brain & Knowledge Base

> **Single Source of Truth (SSOT)** for project architecture, design system, database schemas, deployment pipelines, resolved bug histories, and future engineering roadmaps.

---

## 1. Executive Overview

* **Project Name**: VibeCraft
* **Tagline**: Unforgettable Events, Orchestrated by AI
* **Mission**: A luxury, full-stack event planning assistant tailored for high-stakes weddings, milestone birthdays, and community festivals. It delivers instant AI-generated budget allocations, minute-by-minute run-of-show timelines, tactical vendor checklists, and thematic mood palettes, fully synchronized with PostgreSQL.
* **Repository**: [`https://github.com/Myparadox-creator/VibeCraft.git`](https://github.com/Myparadox-creator/VibeCraft.git)
* **Production Deployment**: Vercel (`https://vibecraft-supabase.vercel.app`)
* **Active Supabase Project**: `ibcspikwlsivwsacqzpf` (`https://ibcspikwlsivwsacqzpf.supabase.co`)

---

## 2. Technical Stack & Architecture

### Frontend & Core
* **Framework**: Next.js 14.2.15 (App Router with Server & Client Components)
* **Language**: TypeScript 5.6.3
* **Styling**: Tailwind CSS 3.4.14 with dark luxury aesthetic (Zinc-950 foundation, amber/gold accents, violet/purple neon glows)
* **Icons**: `lucide-react`
* **Data Visualization**: `recharts` (Pie charts, distribution bars)
* **Micro-Interactions**: `canvas-confetti`, `framer-motion`
* **Validation**: `zod`

### Backend, Database & Security
* **Database**: Supabase PostgreSQL with multi-tenant Row Level Security (RLS)
* **Auth**: `@supabase/ssr` with Cookie-based server sessions, JWT validation, and Next.js `middleware.ts` session refreshment
* **Demo / Fallback Mode**: Client-side localStorage persistence with graceful degradation so users can explore without immediate account creation

### Generative AI Pipeline
* **Engine**: Google Gemini API (`@google/generative-ai`, model: `gemini-1.5-flash`)
* **Dual Pipeline**:
  1. *Live Gemini AI*: Structured JSON schema generation via prompt engineering for budget breakdowns, phases, and creative concepts.
  2. *Procedural Fallback Planner*: Deterministic mathematical and heuristic event generator ensuring 100% uptime even without an API key or under network disruption.

---

## 3. Directory & File Structure

```text
vibecraft/
├── public/                     # Static brand assets & SVG banners
│   └── vibecraft-banner.svg
├── src/
│   ├── app/                    # Next.js App Router routes
│   │   ├── api/ai/             # AI planning & chat endpoints (/plan, /chat)
│   │   ├── auth/               # Login, Signup, Callback (/callback, /login, /signup)
│   │   ├── dashboard/          # Event management dashboard & creation wizard (/new)
│   │   ├── events/[id]/        # Event drilldown: overview, budget, timeline, vendors, ideas
│   │   ├── layout.tsx          # Root layout with Dark luxury background & Toast providers
│   │   ├── page.tsx            # High-conversion luxury landing page
│   │   └── globals.css         # Custom animations & Tailwind base directives
│   ├── components/             # Reusable UI components
│   │   ├── landing/            # Hero, showcases, testimonials, feature grids
│   │   ├── navigation/         # Navbar, EventSelector, SupabaseConnectModal
│   │   └── ui/                 # Button, Card, Input, Progress, Modal primitives
│   ├── context/                # EventContext.tsx (Global state, Supabase sync & LocalStorage)
│   ├── lib/
│   │   ├── gemini/             # Gemini API client, system prompts & fallbacks
│   │   ├── supabase/           # client.ts, server.ts, middleware.ts with URL auto-sanitization
│   │   ├── mock-data.ts        # Luxury seed events for weddings, birthdays & festivals
│   │   └── utils.ts            # Class merge (clsx + tailwind-merge) & currency formatters
│   ├── types/                  # TypeScript interfaces (event.ts, database.ts)
│   └── middleware.ts           # Route protection & Supabase session sync
├── supabase/
│   └── schema.sql              # Production DDL schema, tables & RLS policies
├── .env.example                # Template for environment variables
├── .env.local                  # Local development environment credentials
├── next.config.mjs             # Next.js production build configuration & aliases
├── package.json                # Project dependencies & build scripts
├── tsconfig.json               # TypeScript compiler options
└── vercel.json                 # Vercel deployment framework configuration
```

---

## 4. Database Schema & RLS Policies (`supabase/schema.sql`)

### Tables
1. **`profiles`**: User metadata, full name, avatar, timestamps (`id` references `auth.users`).
2. **`events`**: Core event table (`id`, `user_id`, `title`, `event_type`, `date`, `total_budget`, `currency`, `location`, `guest_count`, `vibe_summary`, `color_palette`).
3. **`budget_items`**: Line-item financial breakdown (`id`, `event_id`, `user_id`, `category`, `name`, `allocated_amount`, `actual_cost`, `is_paid`, `notes`).
4. **`timeline_milestones`**: Chronological milestone tracker (`id`, `event_id`, `user_id`, `phase`, `title`, `timeframe`, `status`, `order_index`).
5. **`vendors_tasks`**: Actionable vendor tasks (`id`, `event_id`, `user_id`, `category`, `name`, `status`, `estimated_cost`, `actual_cost`, `notes`).

### Security Architecture
* **Row Level Security (RLS)** is enabled on all tables.
* Every policy uses `auth.uid() = user_id`, guaranteeing multi-tenant data isolation.
* Unauthenticated requests cannot read or write private user event data.

---

## 5. Environment Variables Reference

| Variable Name | Required | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Supabase Project REST/Auth Base URL (`https://<project-ref>.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Supabase Public Anonymous API Key for browser & client requests. |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for live GenAI planning and co-pilot chat. |

---

## 6. Resolved Challenges & Engineering Insights

| Issue / Error | Root Cause | Engineering Solution |
| :--- | :--- | :--- |
| **Google Font Build Failure** | `next/font/google` threw `ENOTFOUND fonts.googleapis.com` in sandboxed/restricted environments. | Replaced with robust system font stack (`font-sans` with Inter/SF Pro fallbacks) in `globals.css` & `layout.tsx`. |
| **Path Alias `@/*` Resolution** | Webpack failed to resolve custom module alias paths. | Explicitly registered `baseUrl: "."` and `"paths": { "@/*": ["./src/*"] }` in `tsconfig.json` + fallback alias in `next.config.mjs`. |
| **Malformed Supabase URL** | User copied the `/rest/v1` REST URL instead of the base project URL, causing Supabase auth requests to fail. | Built `normalizeSupabaseUrl()` in `src/lib/supabase/client.ts` to automatically strip `/rest/v1`, `/auth/v1`, and trailing slashes. |
| **Vercel 404 & "No framework detected"** | Project was imported via an external Supabase template that configured Framework Preset to "Other", executing a 41ms empty build. | Set Framework Preset to `Next.js` and simplified `vercel.json` to allow native `@vercel/next` zero-config handling. |
| **Vercel In-Flight 404 Confusion** | User checked URL while Next.js compilation was still running (first 40s); Vercel served old deployment. | Verified deployment completion logs (`Generating static pages (11/11)`), leading to successful 200 OK production response. |

---

## 7. Future Engineering Roadmap

### Phase 1: Security & Penetration Testing (Strix Pentest)
- [ ] Automated security scanning of URL parameters and query strings.
- [ ] Row Level Security (RLS) bypass audit on API routes.
- [ ] Strict CORS headers and Content Security Policy (CSP) configuration.
- [ ] Rate limiting on `/api/ai/plan` and `/api/ai/chat` endpoints.

### Phase 2: Collaboration & Realtime Features
- [ ] Supabase Realtime channel subscriptions for live collaborative planning (e.g., couple/co-planners editing budget simultaneously).
- [ ] Shared event invite links with granular view/edit permission tokens.

### Phase 3: Export & Integrations
- [ ] Export run-of-show timeline to `.ics` / Google Calendar.
- [ ] One-click PDF generation for vendor briefs and budget summaries.
- [ ] Stripe integration for direct vendor deposit tracking.

---

## 8. Common Developer Workflows

* **Start Local Dev**: `npm run dev` (Runs at `http://localhost:3000`)
* **Local Production Build**: `npm run build`
* **Run TypeScript Check**: `npx tsc --noEmit`
* **Trigger Production Deploy**: `git push origin main` (Vercel automatically triggers a build upon push)
