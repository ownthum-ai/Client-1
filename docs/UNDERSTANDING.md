# Ownthum — Project Understanding

## What is this project?

**Ownthum** is a private, full-stack real estate administrative dashboard built with Next.js (App Router). It is designed to manage a single real estate project end-to-end — from land acquisition and layout planning through to sales, CRM, construction tracking, finance, and staff operations. All data is stored **client-side** using Zustand's `persist` middleware (localStorage), meaning no backend server or database is required.

---

## Technology Stack

| Layer | Technology | Version (current) | Role |
|---|---|---|---|
| Framework | Next.js | 14.2.4 | App Router, SSR/SSG, routing |
| UI Library | React | 18.x | Component model |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 3.4.x | Utility-first CSS |
| State | Zustand | 5.x | Global store with localStorage persistence |
| Animations | Framer Motion | 12.x | Page/section motion primitives |
| 3D / WebGL | Three.js + @react-three/fiber + @react-three/drei | 0.183 / 9.x / 10.x | 3D components in lightswind library |
| Charts | Recharts | 3.x | Financial trend charts |
| Tables | @tanstack/react-table | 8.x | Data tables (sorting, pagination) |
| Server State | @tanstack/react-query | 5.x | (Available, used for async patterns) |
| Icons | @heroicons/react | 2.x | Outline icon set throughout the UI |
| Icons (alt) | lucide-react | 1.x | Secondary icon set |
| Fonts | geist, next/font/google | — | Geist Sans (body), Outfit (primary), Instrument Serif (accent) |
| UI Kit | lightswind | 3.x | Rich component library (carousels, animations, backgrounds) |
| Animation (GSAP) | gsap | 3.x | Timeline-based animations |
| Utility | clsx, tailwind-merge | 2.x / 3.x | Conditional class merging |
| Noise | simplex-noise | 4.x | Used in animated background effects |
| 3D Animations | react-flip-toolkit | 7.x | FLIP animation utilities |
| Linting | ESLint | 8.x | Code quality enforcement |
| Config | eslint-config-next | 14.x | Next.js ESLint ruleset |

---

## Project Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout — fonts, metadata, LayoutWrapper
│   ├── page.tsx            # Dashboard (home page)
│   ├── assets/             # Fixed Assets module
│   ├── brochure/           # Marketing brochure module
│   ├── broker/             # Broker CRM module
│   ├── construction/       # Construction phase tracking
│   ├── followup/           # Lead follow-up CRM
│   ├── forgot-password/    # Auth flow (PIN reset)
│   ├── land/               # Land purchase module
│   ├── layout/             # Plot layout planning
│   ├── login/              # PIN-based authentication
│   ├── material/           # Running material & stock
│   ├── payments/           # Payment ledger
│   ├── propertyholder/     # Property holder / land payment tracking
│   ├── query/              # Inbound queries
│   ├── salary/             # Staff salary & advances
│   ├── settings/           # App settings
│   ├── setup/              # First-run setup
│   ├── sitevisit/          # Site visit tracking
│   ├── weekend/            # Weekend social media posts
│   ├── error.tsx           # Error boundary
│   ├── global-error.tsx    # Global error boundary
│   └── not-found.tsx       # 404 page
│
├── components/
│   ├── ui/                 # Core design system components
│   │   ├── Badge.tsx       # Status/label badges
│   │   ├── Button.tsx      # Primary action button (v2 prop for variant)
│   │   ├── Card.tsx        # Content card container
│   │   ├── DataTable.tsx   # TanStack Table wrapper
│   │   ├── Input.tsx       # Form input (v2 variant)
│   │   ├── KPICard.tsx     # Key Performance Indicator card
│   │   ├── Label.tsx       # Form label
│   │   ├── Select.tsx      # Dropdown select
│   │   ├── Skeleton.tsx    # Loading skeleton
│   │   └── Textarea.tsx    # Multi-line input
│   │
│   ├── lightswind/         # Third-party lightswind component overrides & additions
│   │   └── *.tsx           # 100+ animation, UI, and 3D components
│   │
│   ├── skeletons/          # Module-specific loading states
│   ├── DashboardCharts.tsx # Recharts-based dashboard chart components
│   ├── GlobalPinModal.tsx  # Global PIN unlock modal
│   ├── LayoutWrapper.tsx   # App shell — auth guard, sidebar, topbar, routing
│   ├── PinGate.tsx         # Full-screen PIN lock gate
│   ├── ProfessionalPayslip.tsx  # Print-ready payslip
│   ├── ProfessionalReceipt.tsx  # Print-ready receipt
│   ├── Select.tsx          # Standalone select component
│   ├── Sidebar.tsx         # Left navigation sidebar
│   ├── Toggle.tsx          # Toggle switch
│   └── Topbar.tsx          # Top navigation bar
│
└── store/
    └── useStore.ts         # Single Zustand store (all app state + persist)
```

---

## State Management (Zustand)

The entire application state lives in **one Zustand store** (`src/store/useStore.ts`) with `persist` middleware. Data is stored in `localStorage` under a single key. This includes:

| Slice | Description |
|---|---|
| `queries` | Inbound lead enquiries |
| `payments` | Payment transactions |
| `siteVisits` | Site visit records |
| `followUps` | Lead follow-up pipeline with interaction history |
| `brokers` | Broker registry with commissions |
| `lands` | Land parcel purchases |
| `plots` | Individual plot statuses |
| `layouts` | Layout/scheme configurations |
| `constructionPhases` | Construction progress phases |
| `materialStock` | Material inventory |
| `materialTxns` | Material in/out transactions |
| `constructionCosts` | Direct construction expenses |
| `campaigns` | Marketing campaigns |
| `salaries` | Staff salary records |
| `salaryAdvances` | Salary advance records |
| `brokerCommissions` | Broker commission payouts |
| `assets` | Fixed asset registry |
| `propertyHolders` | Property holder payment schedules |
| `weekendPosts` | Social media weekend posts |
| `transmissionLogs` | WhatsApp/Meta broadcast logs |
| `activityFeed` | Real-time activity timeline |
| `isPinUnlocked` | Session PIN auth state |

---

## Authentication

The app uses a **PIN-based authentication** system (no external auth provider). On first load:
1. `LayoutWrapper` checks `isPinUnlocked` from the store.
2. If false (and not on `/login`, `/forgot-password`, or `/setup`), it renders `<PinGate />` — a full-screen PIN entry UI.
3. After correct PIN entry, `isPinUnlocked` is set to `true`.
4. The PIN and recovery credentials are stored in Zustand persist.

---

## Navigation Modules

| Section | Module | Path | Purpose |
|---|---|---|---|
| Overview | Dashboard | `/` | Executive KPI summary, P&L, activity feed |
| Project | Land Purchase | `/land` | Land parcel registry and payment tracking |
| Project | Planning Layout | `/layout` | Plot layout schemes and plot status grid |
| Project | Structure Layout | `/construction` | Construction phase progress |
| Marketing | Brochure | `/brochure` | Campaign/brochure management |
| Marketing | Weekend Posts | `/weekend` | Social media post scheduling |
| CRM | Site Visits | `/sitevisit` | Visitor log and follow-up scheduling |
| CRM | Follow-Up | `/followup` | Lead pipeline with interaction history |
| CRM | New Queries | `/query` | Inbound query management |
| CRM | Brokers | `/broker` | Broker registry and commission tracker |
| Finance | Payments | `/payments` | Payment ledger (white + cash) |
| Finance | Property Holder | `/propertyholder` | Land owner payment schedules |
| Finance | Staff Salary | `/salary` | Payroll and advances |
| Operations | Running Material | `/material` | Material stock and transaction log |
| Operations | Fixed Assets | `/assets` | Asset registry |

---

## Key Design Patterns

- **CSS Custom Properties**: All theme tokens (`--gold`, `--text`, `--border`, `--bg`, etc.) are defined as CSS variables in `globals.css` and referenced throughout components.
- **`"use client"` directive**: All interactive pages/components are client components; layouts may be server components.
- **`dynamic()` imports**: Heavy chart components (`DashboardCharts`) are lazy-loaded with `ssr: false` to avoid hydration mismatches.
- **Print support**: Payslip and receipt components are rendered as print-optimised layouts using media queries.
- **Framer Motion**: Page and section entry animations use `variants` with `staggerChildren`.
- **v2 prop pattern**: UI components like `Button` and `Input` accept a `v2={true}` prop to opt into a redesigned visual style.

---

## Build & Development

```bash
# Install dependencies
npm install

# Start development server (with Turbopack in Next.js 15+)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

---

## Data Persistence

All data is stored in the browser's `localStorage`. There is no database, no API, and no user accounts beyond the PIN system. Clearing site data in the browser will wipe all records.
