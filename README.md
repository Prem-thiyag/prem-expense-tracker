# Prem Expense Tracker

A multi-tenant personal finance dashboard: import bank statements, categorise spending automatically, set monthly budgets, and analyse habits over time. FastAPI + PostgreSQL on the backend, React + TypeScript on the frontend. All data is scoped to the authenticated user.

**[DOCUMENTATION.md](DOCUMENTATION.md) is the source of truth** — architecture, full API reference, database schema, business logic, local setup, and deployment. This file is the summary.

## Features

| Area | Description |
|---|---|
| Dashboard | Monthly KPIs (total spend, daily average, projected spend), cumulative spending trend, top-category donut, recent transactions |
| Transactions | Full CRUD, filterable by date range / account / category / type / keyword, paginated, multi-tag |
| Statement import | Upload CSV, Excel (`.xls`/`.xlsx`), or PDF statements from HDFC, ICICI, SBI, or Paytm. Bank and header row are auto-detected, duplicates are rejected by a content-derived key, and rows are categorised on the way in |
| Budgets | Per-category monthly limits with pacing, plus suggestions derived from the last 3 months when there is no prior budget |
| Budget alerts | Raised at 75%, 90%, and 100% of a category limit |
| Analytics | Spending velocity vs. history, habit identifier, category distribution, monthly breakdown, daily heatmap, budget vs. spend |
| Merchants | Maps raw UPI/narration strings to named merchants — unmapped transactions are clustered by UPI handle for bulk naming, fuzzy matches arrive as reviewable suggestions, and a rescan sweeps the backlog |
| Subscriptions | Declared recurring bills with upcoming/overdue tracking and mark-paid/undo (Bill Radar) |
| Assistant | Read-only chat panel over the user's own data, with streamed replies and voice input |
| Tag scoping | Any tag can hide its transactions from the Dashboard, Analytics, and/or Budgets independently — configured per tag, not hardcoded by name |
| Theming | Token-based design system driving every screen; light/dark persisted per device and applied before first paint |
| Auth | JWT registration and login, Remember Me (30-day token), in-app password change, session countdown, auto-logout on expiry |

## Tech Stack

| Backend | Frontend |
|---|---|
| Python 3.11 | React 19 + TypeScript 5.8 |
| FastAPI + Uvicorn | Vite 7 |
| SQLAlchemy 2 (ORM) | Tailwind CSS 3 |
| PostgreSQL | Axios |
| Alembic (migrations) | Recharts |
| Pydantic / pydantic-settings | react-router-dom 7 |
| python-jose + passlib/bcrypt (JWT, hashing) | lucide-react, react-select |
| Pandas, openpyxl, xlrd (CSV/Excel) | dayjs, react-hot-toast |
| pdfplumber (PDF statements) | html2canvas |
| RapidFuzz / thefuzz (fuzzy matching) | |
| slowapi (rate limiting) | |

Assistant chat runs on Groq with an NVIDIA fallback; voice transcription is Groq Whisper. Both keys are optional — a missing key degrades that one capability rather than failing startup.

## Deployment

| Layer | Host |
|---|---|
| Frontend | Vercel |
| Backend | Render (Docker, `Dockerfile.backend`) |
| Database | Supabase (PostgreSQL) |

In local development the Vite dev server proxies `/api` to `http://localhost:8000`, so the backend URL is never exposed to the browser and there are no CORS issues.

## Project Structure

A monorepo holding the backend and frontend.

```
prem-expense-tracker/
├── backend/                        # FastAPI application
│   ├── alembic/versions/           # DB migrations (0001 … 0004)
│   ├── tests/                      # pytest suite (parsing, merchant matching)
│   ├── scripts/                    # One-off maintenance scripts
│   ├── requirements.txt
│   └── app/
│       ├── main.py                 # App entrypoint, CORS, security headers, rate limiting
│       ├── api/                    # Route handlers (one file per domain)
│       ├── core/                   # Config, JWT/hashing, DI, rate limiter, validators
│       ├── crud/                   # Database operations, all user-scoped
│       ├── models/                 # SQLAlchemy ORM models
│       ├── schemas/                # Pydantic request/response schemas
│       └── services/               # Business logic
│           ├── parsing/            # CSV/Excel/PDF statement parsers
│           └── assistant/          # Read-only assistant: tools, providers, prompts
│
├── frontend/                       # React + TypeScript SPA
│   ├── vite.config.ts              # Vite config with the /api proxy
│   ├── tailwind.config.js          # Design tokens
│   ├── vercel.json                 # SPA rewrite rule
│   └── src/
│       ├── api/                    # Central Axios client — the only file making HTTP calls
│       ├── auth/                   # Login, Register, ProtectedRoute
│       ├── theme/                  # Light/dark context
│       ├── components/             # Navbar, month control, ui/ primitives
│       ├── Dashboard/  Expenses/  Budgets/  Analytics/
│       ├── Merchants/  Settings/  Profile/
│       ├── Assistant/              # Chat panel
│       ├── Wrapped/                # Story overlay
│       ├── types/                  # TypeScript interfaces
│       ├── utils/                  # Formatters, category icon registry
│       └── App.tsx                 # Routing
│
├── DOCUMENTATION.md
└── Dockerfile.backend
```

## Local Development

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate                    # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
# Set DATABASE_URL and SECRET_KEY in backend/.env
alembic upgrade head
uvicorn app.main:app --reload            # http://localhost:8000

# Frontend
cd frontend
npm install
npm run dev                              # http://localhost:5173
```

`DATABASE_URL` has no hardcoded fallback — the app refuses to start without it. `alembic upgrade head` is required after creating a fresh database. Interactive API docs are served at `http://localhost:8000/docs`.

See [DOCUMENTATION.md](DOCUMENTATION.md) for the full setup, including the local vs. Supabase database options and the complete environment variable reference.

## Security

- **Password storage** — bcrypt one-way hashing; plaintext is never stored. One strength policy (`app/core/validators.py`) is enforced at every entry point.
- **Authentication** — JWT bearer tokens on every protected endpoint, verified by a single FastAPI dependency.
- **Data isolation** — every query filters on `user_id`, so cross-user access is not reachable through the API.
- **Transport and headers** — CORS is restricted to an explicit origin list (no wildcard); responses carry `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy`.
- **Rate limiting** — slowapi caps the auth endpoints (registration and password operations at 5/hour, login at 5/minute) and the assistant's chat and transcribe endpoints, keyed per user.
- **Error handling** — unhandled exceptions are logged with a request ID and returned as a generic message, so internals never leak to the client.
- **Assistant** — read-only by construction: it has no write tools, and `user_id` is closed over from the JWT rather than being a model-supplied parameter. Merchant matching is entirely local, with no third-party calls, because raw transaction descriptions are financial PII.
