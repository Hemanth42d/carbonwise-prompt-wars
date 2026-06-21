# Architecture — EcoSphere AI

## Problem Statement → Feature Mapping

> "Design a solution that helps individuals **understand**, **track**, and **reduce** their carbon footprint through **simple actions** and **personalized insights**."

Every architectural layer maps directly to a keyword in the problem statement:

```
┌─────────────────────────────────────────────────────────┐
│  UNDERSTAND: Dashboard, Forecast, Reports               │
│  Visualization → comprehension → awareness              │
│  Charts, scores, Paris Agreement benchmarks             │
├─────────────────────────────────────────────────────────┤
│  TRACK: Tracker, Activities Store                       │
│  7 categories, IPCC/DEFRA emission factors, history     │
│  Real-time CO₂e calculation before submission           │
├─────────────────────────────────────────────────────────┤
│  REDUCE: Simulator, Challenges, AI Coach                │
│  What-if scenarios, gamified goals, AI recommendations  │
│  Data-driven reduction plans from user's actual data    │
├─────────────────────────────────────────────────────────┤
│  SIMPLE ACTIONS: Dashboard Quick Actions + Challenges   │
│  One-tap eco-tips with instant CO₂ impact calculation   │
│  Challenge cards with clear targets and difficulty      │
├─────────────────────────────────────────────────────────┤
│  PERSONALIZED INSIGHTS: AI Coach (Gemini), Reports      │
│  User-specific data → tailored recommendations          │
│  Never generic — always computed from tracked data      │
└─────────────────────────────────────────────────────────┘
```

## Clean Architecture Layers

```
Presentation Layer (React 19 Components)
    ↕ [props / hooks]
Application Layer (Zustand Store + Custom Hooks)
    ↕ [pure functions]
Domain Layer (Types + Business Logic Utils)
    ↕ [constants / emission factors]
Infrastructure Layer (AI Service + Nginx)
```

## AI Decision-Making Architecture

```
User Input
    ↓
detectIntent() — keyword matching (reduce/compare/plan/forecast/tips/general)
    ↓
summarizeFootprint() — aggregates DailyFootprint[] into:
    • dailyAvgKg, topCategory, trendDirection
    • annualProjectedKg, monthlyTotalKg
    • weekOverWeek comparison
    ↓
Response Generator — one of 6 specialized generators:
    • generateReduceResponse() — 5-category reduction plan with kg savings
    • generateCompareResponse() — benchmark vs US/EU/World/India/Paris
    • generatePlanResponse() — 7-day eco-action calendar
    • generateForecastResponse() — trajectory with confidence bounds
    • generateTipsResponse() — prioritized tips by user's top category
    • generateGeneralResponse() — context-aware summary
    ↓
Output: { content: string, suggestions: string[] }
    • content: Markdown-formatted, XSS-sanitized via safeMarkdownToHtml()
    • suggestions: 3-4 follow-up prompts for one-click interaction (Simple Actions)
```

## State Management

Uses **Zustand** with a single global store for:
- Auth state (user, isAuthenticated, isLoading)
- Navigation (activeSection, sidebarCollapsed)
- Domain data (footprintData, activities, challenges, leaderboard)
- Coach/AI (chatMessages, isChatLoading)
- UI (darkMode)

## Performance Architecture

```
Code Splitting:     All 8 feature pages → lazy loaded via React.lazy()
Memoization:        React.memo on all sub-components
                    useMemo for all derived calculations
                    useCallback for all event handlers
Debouncing:         useDebounce hook for search/input
Compression:        Nginx gzip for all text assets
Cache:              1-year immutable cache for hashed JS/CSS
```

## Security Architecture

```
Input → sanitizeInput() → Store → escapeHtml() → Render
                                     ↓
                              safeMarkdownToHtml()
                              (escape THEN format)
```

Rate limiting:
```
User action → loginRateLimiter.tryAction()
              ├── true  → proceed
              └── false → warn + block (5 attempts / 15 min)
```

## Testing Architecture

```
src/
├── shared/utils/index.test.ts       — 70+ unit tests (carbon math)
├── shared/utils/security.test.ts    — 40+ security tests (XSS, sanitization)
├── shared/utils/performance.test.ts — 20+ perf tests (debounce, throttle, memo)
├── shared/constants/index.test.ts   — 35+ data integrity tests
├── shared/hooks/useEcoSphere.test.ts — 20+ hook tests (renderHook)
├── services/aiCoach.test.ts         — 25+ AI response tests
└── __tests__/                       — integration tests (store, utils)
    ├── store.test.ts
    ├── utils.test.ts
    ├── aiCoach.test.ts
    ├── constants.test.ts
    └── security.test.ts
```

Coverage: 98%+ statements | 93%+ branches | 100% functions | 98%+ lines

## Deployment Architecture

```
GitHub Repo
    │
    ▼ (push)
Cloud Build (cloudbuild.yaml)
    │ npm test (354 tests)
    │ docker build (2-stage)
    │   Stage 1: node:22-alpine → npm ci + vitest + vite build
    │   Stage 2: nginx:1.27-alpine → serve /dist
    ▼
Cloud Run (ecosphere-ai, us-central1)
    │ Port 8080
    │ Auto-scaling (0-10 instances)
    │ Public HTTPS endpoint
    ▼
End User Browser
```
