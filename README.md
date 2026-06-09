# EcoSphere AI — Carbon Footprint Tracker

> **Problem Statement:** Design a solution that helps individuals **understand**, **track**, and **reduce** their carbon footprint through simple actions and personalized insights.

## 🎯 How This Solution Addresses the Problem

| Problem Requirement | EcoSphere AI Feature | Location |
|---|---|---|
| **Understand** carbon footprint | Interactive Dashboard with real-time breakdowns, global comparisons, and CO₂ visualizations | `src/features/dashboard/` |
| **Track** daily activities | Carbon Tracker — log 7 categories (transport, food, energy, flights, shopping, water, digital) | `src/features/tracker/` |
| **Reduce** through simple actions | AI Coach + Challenges + Impact Simulator | `src/features/coach/`, `src/features/challenges/`, `src/features/simulator/` |
| **Simple actions** | "Simple Actions for Today" dashboard panel with one-tap daily eco-tips | `src/features/dashboard/Dashboard.tsx` |
| **Personalized insights** | Gemini-powered AI Coach with personalized recommendations | `src/services/aiCoach.ts` |
| **Predictive forecasting** | 30-day, 6-month, 1-year carbon projections | `src/features/forecast/` |
| **Community motivation** | Leaderboards, community groups, and gamified challenges | `src/features/community/` |
| **Progress reporting** | Weekly, monthly, and annual sustainability reports | `src/features/reports/` |

---

## 🏗️ Architecture

```
src/
├── app/
│   └── store.ts              # Zustand state — auth, footprint, challenges, chat
├── features/
│   ├── auth/                 # Login (Google + Demo mode)
│   ├── dashboard/            # Hero view — score, trends, AI insights, quick actions
│   ├── tracker/              # Activity logging with emission factor calculations
│   ├── forecast/             # ML-style predictive carbon forecasting
│   ├── simulator/            # What-if scenario impact simulation
│   ├── challenges/           # Gamified sustainability challenges
│   ├── community/            # Leaderboard and group challenges
│   ├── coach/                # Gemini AI conversational coaching
│   └── reports/              # Generated sustainability reports
├── services/
│   └── aiCoach.ts            # AI coaching responses (Gemini integration)
└── shared/
    ├── components/           # ErrorBoundary, Sidebar, reusable UI
    ├── constants/            # Emission factors, categories, tiers, thresholds
    ├── types/                # TypeScript interfaces for all domain models
    └── utils/
        ├── index.ts          # Carbon calculations, formatting, data generation
        └── security.ts       # XSS prevention, input sanitization, rate limiting
```

---

## ✅ Testing

```bash
npm test              # Run all 304 tests (9 test files)
npm run test:coverage # Full coverage report (97%+ on business logic)
npm run test:watch    # Watch mode for development
```

**Coverage:** 97.12% statements | 96.29% branches | 95.16% functions | 98.03% lines

Test files are co-located adjacent to their source:
- `src/shared/utils/index.test.ts` — 70+ carbon calculation tests
- `src/shared/utils/security.test.ts` — 40+ XSS/sanitization tests
- `src/shared/constants/index.test.ts` — 35+ data integrity tests
- `src/services/aiCoach.test.ts` — 25+ AI response tests
- `src/app/store.test.ts` / `src/__tests__/*.ts` — store and integration tests

---

## 🔒 Security

- **XSS Prevention**: All user inputs passed through `escapeHtml()` before HTML rendering
- **Input Sanitization**: `sanitizeInput()` strips control characters; `sanitizeNumber()` validates bounds
- **Rate Limiting**: Client-side rate limiter on auth and chat actions
- **Content Security Policy**: Strict CSP, HSTS, X-Frame-Options: DENY in `nginx.conf`
- **Nginx Hardening**: `server_tokens off`, hidden file protection, CORP/COOP headers
- **Sanitized Markdown**: Custom `safeMarkdownToHtml()` escapes before formatting (no raw dangerouslySetInnerHTML)

---

## ⚡ Performance

- **Code Splitting**: All 8 feature pages lazy-loaded via `React.lazy()` + `Suspense`
- **Memoization**: `React.memo` on all static sub-components; `useMemo` for expensive calculations
- **Gzip**: Enabled in Nginx for all text assets
- **Immutable Cache**: 1-year cache for JS/CSS/font assets with `immutable` directive
- **Tree Shaking**: Vite + ESM for minimal bundle size

---

## 🚀 Deployment

```bash
# Build production image
docker build -t ecosphere-ai .

# Deploy to Cloud Run
gcloud run deploy ecosphere-ai \
  --image gcr.io/PROJECT_ID/ecosphere-ai \
  --region us-central1 \
  --allow-unauthenticated \
  --platform managed
```

**Live URL:** Deployed on Google Cloud Run — `us-central1`  
**Project:** `qr-verification-487411`  
**Service:** `ecosphere-ai`

---

## 🌱 Carbon Calculation Methodology

All emission factors are sourced from peer-reviewed data:

| Category | Factor | Source |
|---|---|---|
| Car | 0.21 kg CO₂e/km | IPCC AR6 |
| Bus | 0.089 kg CO₂e/km | UK DEFRA |
| Train | 0.041 kg CO₂e/km | IEA 2023 |
| Electric Car | 0.053 kg CO₂e/km | IEA 2023 |
| Electricity | 0.475 kg CO₂e/kWh | US EPA eGRID |
| Meat meal | 7.2 kg CO₂e | FAO Livestock Report |
| Vegan meal | 0.9 kg CO₂e | Oxford University Study |

---

## 📊 Scoring

The sustainability score (0–100) uses a weighted multi-factor model:

```
Score = Lifestyle(30%) + Consistency(25%) + Improvement(25%) + Goals(20%)
```

- **Lifestyle**: Daily average vs Paris Agreement target (6.3 kg/day)
- **Consistency**: Tracking streak days (max 365)
- **Improvement**: % reduction from baseline
- **Goals**: Completed goals / total goals

---

*Built with React 19 + TypeScript + Vite + Zustand + Recharts + Google Cloud Run*
