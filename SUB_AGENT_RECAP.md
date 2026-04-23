# GantangFinder — Project Recap for Sub-Agent

## 📋 Project Overview

**Nama:** GantangFinder  
**Deskripsi:** Platform jadwal lomba burung kicau Indonesia  
**Target:** Komunitas burung kicau Indonesia (Gen Z aesthetic)  
**Repo:** https://github.com/mluthfikhalil-cmd/GantangFinder  
**Deploy:** https://gantang-finder.vercel.app  
**Tech Stack:** Next.js 16, Supabase, TypeScript, Tailwind CSS v4

---

## 🏗️ Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Framework | Next.js 16.2.4 (App Router, Turbopack) |
| Database | Supabase (PostgreSQL) |
| Auth | Email + bcrypt hashed passwords |
| Styling | Tailwind CSS v4 + CSS Variables |
| Fonts | Plus Jakarta Sans |
| API | Next.js Route Handlers |

**Key Dependencies:**
```json
{
  "@supabase/supabase-js": "^2.103.3",
  "bcryptjs": "^3.0.3",
  "next": "16.2.4",
  "react": "19.2.4",
  "tailwindcss": "^4"
}
```

---

## 📁 Project Structure

```
GantangFinder/
├── app/
│   ├── page.tsx                    # Homepage (event listing + filters)
│   ├── layout.tsx                  # Root layout (dark mode theme)
│   ├── globals.css                 # Gen Z UI (dark, glassmorphism, violet-coral gradient)
│   ├── components/
│   │   ├── types.ts               # Shared types, constants, level colors
│   │   ├── EventCard.tsx          # Glassmorphism event card
│   │   ├── EventsPage.tsx         # Event listing component
│   │   ├── AddEventModal.tsx     # Add event form modal
│   │   ├── WatchlistModal.tsx    # Bookmark/watchlist modal
│   │   └── SkeletonCard.tsx      # Loading skeleton
│   ├── actions/                   # Server Actions
│   │   ├── feedActions.ts        # Community feed actions
│   │   ├── registerUser.ts       # User registration
│   │   ├── roosterActions.ts     # Rooster (ayam) actions
│   │   ├── roosterManagerActions.ts
│   │   └── generatePoster.ts     # Poster generation
│   ├── api/                       # Route Handlers
│   │   ├── birds/route.ts
│   │   ├── bird-events/route.ts
│   │   ├── login/route.ts
│   │   ├── register/route.ts
│   │   ├── users/route.ts
│   │   ├── organizers/route.ts
│   │   └── event-participants/route.ts
│   ├── feed/page.tsx             # Community feed
│   ├── birds/page.tsx            # Bird types listing
│   ├── leaderboard/page.tsx      # Leaderboard
│   ├── events/[id]/page.tsx      # Event detail
│   ├── roosters/[id]/page.tsx    # Rooster detail
│   ├── login/page.tsx             # Login page
│   ├── register/page.tsx         # Register page
│   ├── admin/page.tsx             # Admin page
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard home
│   │   └── events/[id]/participants/page.tsx  # Event participants (organizer)
│   └── my-registrations/page.tsx  # User's registrations
├── lib/
│   └── supabase.ts               # Supabase client config
├── supabase/migrations/          # DB migrations
│   ├── 001_organizers.sql
│   ├── 002_users.sql
│   ├── 003_birds.sql
│   ├── 003_create_event_participants.sql
│   ├── 004_event_participants.sql
│   ├── 004_event_participants_rls.sql
│   ├── 005_community_feed.sql
│   └── 006_rooster_manager.sql
├── .env.local                    # Environment variables (NOT committed)
├── DEPLOYMENT.md                 # Deployment guide
├── AGENTS.md                     # Next.js agent rules
└── package.json
```

---

## 🎨 UI Design System (Gen Z Aesthetic)

**Default Theme:** Dark Mode  
**Accent Colors:** Violet (#8B5CF6) → Coral (#F472B6) gradient

### CSS Variables (di globals.css):
```css
--bg-primary: #0D0D0D          /* Deep charcoal */
--bg-secondary: #171717
--text-primary: #F9FAFB
--text-secondary: #A1A1AA
--accent-primary: #8B5CF6      /* Violet */
--accent-secondary: #F472B6     /* Coral */
--accent-gradient: linear-gradient(135deg, #8B5CF6, #F472B6)
--glass-bg: rgba(255,255,255,0.05)
--glass-border: rgba(255,255,255,0.1)
--radius: 20px
--radius-sm: 14px
```

### Typography:
- Font Family: **Plus Jakarta Sans**
- Weights: 400, 500, 600, 700, 800
- Gen Z feel: bold headings, medium body

### Key UI Patterns:
- **Glassmorphism Cards:** `background: var(--glass-bg); backdrop-filter: blur(20px)`
- **Gradient Buttons:** `background: var(--accent-gradient)`
- **Glow Effects:** `box-shadow: 0 0 40px var(--accent-glow)`
- **Hover animations:** cubic-bezier spring feel

---

## 🗄️ Database Schema (Supabase)

### Tables:
1. **users** — id, email, password_hash, name, created_at
2. **organizers** — id, user_id, name, logo_url, description, contact, created_at
3. **birds** — id, organizer_id, name, species, age, owner_id, created_at
4. **events** — id, organizer_id, name, location, city, date, bird_types[], level, cage_rules, photo_result_url, is_featured, featured_until, contact, registration_fee, created_at
5. **event_participants** — id, event_id, user_id, registered_at (NEW - registration system)
6. **community_feed** — id, user_id, content, image_url, created_at
7. **roosters** — id, organizer_id, name, breed, owner_name, created_at ( ayamADuLA)

### RLS Policies:
- Organizers only see/edit their own data
- Users can view events, register for events
- Participants visible to organizers of that event

---

## 🔐 Authentication

- Email + Password (bcrypt hashed)
- Session via Supabase cookie/JWT
- Login: `POST /api/login`
- Register: `POST /api/register`
- Protected routes check user session

---

## 📱 Pages & Features

### Public Pages:
| Page | Feature |
|------|---------|
| `/` | Homepage — event listing, search, filter (kicau/merpati/rooster), countdown badges |
| `/events/[id]` | Event detail — organizer info, registration CTA, WA link |
| `/feed` | Community feed — post update, foto hasil |
| `/birds` | Bird types listing |
| `/leaderboard` | Leaderboard |
| `/roosters/[id]` | Rooster detail |

### Auth Pages:
| Page | Feature |
|------|---------|
| `/login` | Login form |
| `/register` | Register form |

### Authenticated Pages:
| Page | Feature |
|------|---------|
| `/my-registrations` | User's event registrations |
| `/dashboard` | Organizer dashboard |
| `/dashboard/events/[id]/participants` | Event participants list (for organizer) |

### Admin:
| Page | Feature |
|------|---------|
| `/admin` | Admin panel |

---

## 🔌 API Endpoints

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/birds` | GET | List all birds |
| `/api/bird-events` | GET | List all events |
| `/api/login` | POST | User login |
| `/api/register` | POST | User register |
| `/api/users` | GET | Get users list |
| `/api/organizers` | GET | List organizers |
| `/api/event-participants` | GET/POST | Registration CRUD |

---

## 👥 Users & Roles

1. **Guest** — Can browse events, feed, birds
2. **User** — Can register for events, view own registrations
3. **Organizer** — Can create/edit events, view participants
4. **Admin** — Full access

---

## 📌 Current Progress

### ✅ Completed:
- Gen Z UI redesign (dark mode, glassmorphism, violet-coral)
- Event listing with search/filter
- Event detail page
- User auth (login/register)
- Registration system (`event_participants` table + RLS)
- Community feed
- Leaderboard
- Organizer dashboard + participants management
- My Registrations page
- Rooster management
- Supabase migrations with RLS policies

### 🚧 In Progress:
- UI polish (ongoing Gen Z refinement)
- Bottom navigation bar

### ❌ Todo:
- Push notification / reminder for registered events
- Image upload for events
- Event search by date range
- User profile page
- Rating/review system
- Payment integration for registration fee
- Analytics dashboard for organizers

---

## 🚀 Deployment Guide

```bash
# 1. Local development
cd GantangFinder
npm install
npm run dev

# 2. Build for production
npm run build

# 3. Push to GitHub
git add -A
git commit -m "your message"
git push origin main

# 4. Deploy to Vercel
# https://vercel.com/dashboard/lils-projects-776e7e74/gantang-finder
```

### Required Environment Variables (.env.local):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
```

### Supabase Migrations:
Run migrations di Supabase SQL Editor:
1. `supabase/migrations/004_event_participants_rls.sql` — RLS policies

---

## 🛠️ Working Rules

1. **Before coding:** Always read existing code first, don't overwrite without checking
2. **Design workflow:** Layout → Theme → Animation → Implementation (SuperDesign)
3. **Communication:** Bahasa Indonesia
4. **Build before push:** Always run `npm run build` before committing
5. **No secrets in code:** Use `.env.local` for sensitive data
6. **Gen Z aesthetic:** Dark mode default, violet-coral gradient, glassmorphism
7. **Test locally first** before pushing

---

## 💬 Notes from Main Agent

- Design direction: **Gen Z aesthetic, elegant, not AI-looking**
- User prefers **dark mode** as default
- Remove generic/AI-looking decorative elements
- Animations: subtle spring/bouncy feel, not distracting
- Bottom nav bar is currently being refined
- Registration system just deployed — might need monitoring

---

*Generated: 2026-04-23*  
*Source: Main Agent — GantangFinder Project*