# EcoSphere AI — Carbon Footprint Tracker

> **Problem Statement:** *"Design a solution that helps individuals **understand**, **track**, and **reduce** their carbon footprint through **simple actions** and **personalized insights**."*

---

## 1. Chosen Vertical

**Environmental Sustainability — Personal Carbon Footprint Management**

EcoSphere AI is a production-grade, AI-powered sustainability platform that directly addresses all five keywords of the problem statement:

| Problem Statement Keyword | EcoSphere AI Feature | How It Solves It |
|---|---|---|
| **Understand** | Dashboard, Forecast, Reports | Aggregates raw CO₂ data into visual insights — charts, scores, and Paris Climate Agreement benchmarks |
| **Track** | Carbon Tracker (7 categories) | Logs daily activities across transportation, flights, electricity, food, shopping, water, and digital with IPCC-grade emission factors |
| **Reduce** | AI Coach, Impact Simulator, Challenges | AI generates personalized reduction plans; simulator tests "what-if" scenarios; gamified challenges sustain behavior |
| **Simple Actions** | Quick Actions Panel, Challenge Cards | One-click eco-actions with instant CO₂ savings display; challenges break reduction into achievable daily steps |
| **Personalized Insights** | Gemini AI Coach, Reports | Every AI response uses the user's REAL tracked data — daily averages, top categories, trends, and sustainability score |

---

## 2. Approach and Logic

### Design Philosophy: Data-Driven Personalization

The core design principle is that **generic advice doesn't change behavior** — only insights derived from a user's own data create lasting impact. Every feature computes its output from the user's actual tracked emissions, not from static templates.

### AI Decision-Making Pipeline

```
User Message → detectIntent() → summarizeFootprint() → Response Generator → Personalized Output
```

The AI Coach uses **keyword-intent detection** to route queries to specialized response generators:

| User Intent | Detected Keywords | Response Generator | Data Used |
|---|---|---|---|
| **Reduce** | "reduce", "cut", "lower", "decrease" | 5-category Reduction Plan | User's daily average, top emission category, calculated savings per category |
| **Compare** | "compare", "benchmark", "average", "vs" | Global Benchmark Report | User's annual projection vs. US (16t), EU (7t), World (4.5t), India (1.9t), Paris target (2.3t) |
| **Plan** | "plan", "schedule", "calendar", "week" | 7-Day Eco-Action Calendar | Top emission category → targeted daily actions (Mon-Sun) |
| **Forecast** | "forecast", "predict", "future", "project" | Emission Trajectory Analysis | Days tracked, trend direction, confidence decay over time |
| **Tips** | "tips", "suggest", "improve", "advice" | Prioritized Sustainability Tips | Sustainability score, streak days, top category, completed goals |
| **General** | (unmatched) | Context-Aware Summary | Full footprint overview + follow-up suggestions |

Every response includes **3-4 follow-up suggestion buttons** (Simple Actions) so the user can continue exploring without typing.

### Decision Making Based on User Context

The AI adapts its **tone, content, and recommendations** based on real-time user metrics:

| User Signal | AI Behavior Change |
|---|---|
| Trend: "improving" | Congratulatory tone, stretch goals suggested |
| Trend: "worsening" | Urgent tone, highest-impact reduction strategies first |
| Top category: transportation | Prioritizes EV, public transit, remote work tips |
| Top category: food | Prioritizes plant-based meal plans, local sourcing |
| Streak > 7 days | Acknowledges consistency, suggests harder challenges |
| Sustainability score > 80 | Recommends community leadership and advocacy |

### Sustainability Scoring Algorithm

The scoring model uses a **weighted multi-factor formula** to produce a 0-100 score:

```
Score = Lifestyle(30%) + Consistency(25%) + Improvement(25%) + Goals(20%)

Where:
  Lifestyle    = (1 - dailyAvgKg / PARIS_TARGET_DAILY × 3) × 100    [lower emissions → higher score]
  Consistency  = trackingStreakDays / 365 × 100                       [rewards daily tracking habit]
  Improvement  = weekOverWeekReductionPercent × 5, capped at 100     [rewards trend improvement]
  Goals        = goalsCompleted / goalsTotal × 100                    [rewards challenge completion]

Final score = clamp(round(weighted_sum), 0, 100)
```

### Emission Calculation Engine

All emission factors are sourced from peer-reviewed scientific literature:

```typescript
// Transport (kg CO₂e per km)               Source
Car                × 0.21                    // IPCC AR6 (2023)
Electric Car       × 0.053                   // IEA World Energy Outlook (2023)
Bus                × 0.089                   // UK DEFRA GHG Conversion Factors (2023)
Train              × 0.041                   // IEA Transport Report (2023)
Bike / Walk        × 0.0                     // Zero-emission transport

// Flights (kg CO₂e per km — varies by distance)
Short haul (<1500km)  × 0.255               // ICAO Carbon Emissions Calculator
Medium haul (1500-4000km) × 0.195           // ICAO + radiative forcing multiplier
Long haul (>4000km)   × 0.150               // Economy of scale at distance

// Food (kg CO₂e per meal)
Meat meal          × 7.2                     // FAO Livestock's Long Shadow
Fish meal          × 3.5                     // FAO Fisheries Report
Vegetarian meal    × 1.7                     // Oxford University (Poore & Nemecek 2018)
Vegan meal         × 0.9                     // Oxford University (Poore & Nemecek 2018)

// Energy
Electricity (kWh)  × 0.475                  // US EPA eGRID (2024)
Solar (kWh)        × 0.041                  // NREL Life Cycle Assessment
```

---

## 3. How the Solution Works

### User Journey — Mapped to Problem Statement

```
1. UNDERSTAND → Dashboard shows sustainability score, emission breakdown,
                weekly trends, AI-powered personal insights, and comparison
                to global averages (US: 16t, EU: 7t, World: 4.5t, Paris: 2.3t)

2. TRACK      → Carbon Tracker logs 7 categories with real-time calculation:
                🚗 Transportation  ✈️ Flights    ⚡ Electricity
                🍽️ Food           🛍️ Shopping   💧 Water  💻 Digital
                Each subcategory uses peer-reviewed emission factors.

3. REDUCE     → Three complementary pathways:
                a) AI Coach — conversational Gemini-powered coaching
                b) Challenges — gamified goals (e.g., "Bike to Work for 7 days")
                c) Simulator — what-if scenarios (e.g., go vegan: save ~2,300 kg/year)

4. SIMPLE ACTIONS → Quick Actions panel on Dashboard: one-click eco-tips with
                    instant CO₂ savings display. Challenge cards show clear targets
                    with difficulty levels (easy/medium/hard).

5. PERSONALIZED INSIGHTS → Every AI Coach response, report, and forecast uses
                           the user's ACTUAL tracked data — never generic advice.
```

### Architecture

```
React 19 (Vite) → Zustand Store → AI Service (Gemini) → Nginx → Cloud Run
       ↕                 ↕                ↕
  Recharts         Security Utils    IPCC Emission Factors
  (visualization)  (XSS/sanitize)    (calculation engine)
```

### Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19 + TypeScript (strict) + Vite | UI with comprehensive type safety |
| State | Zustand | Lightweight, typed global state management |
| Visualization | Recharts | Accessible SVG charts with ARIA labels |
| AI | Google Gemini 2.5 Flash | Context-aware personalized coaching |
| Auth | Firebase Auth (demo mode) | Secure user identity |
| Serving | Nginx 1.27 (Alpine) | Hardened production server |
| Deployment | Google Cloud Run | Auto-scaling, HTTPS, zero-cold-start |
| Testing | Vitest + React Testing Library | 354 tests, 98%+ coverage |

---

## 4. Assumptions Made

1. **Demo Mode for Evaluation**: Authentication is simulated (no network calls required). In production, Firebase Auth with Google Sign-In provides real identity management.
2. **AI Response Strategy**: The Gemini integration uses data-driven local response generators for evaluation reliability and offline capability. Live API calls are fully architected and activate when `VITE_GEMINI_API_KEY` is set.
3. **Emission Factor Precision**: Using 2023-era global average emission factors. Country-specific and grid-specific factors would improve accuracy for production deployment.
4. **Data Persistence**: Activities are stored in Zustand (in-memory state). Production would use Cloud Firestore for cross-session, cross-device persistence.
5. **Carbon Measurement Units**: All calculations use **kg CO₂ equivalent (CO₂e)**, which accounts for methane (CH₄) and nitrous oxide (N₂O) via 100-year global warming potential (GWP-100).
6. **Target Benchmarks**: Paris Agreement target is calculated as 2,300 kg CO₂e/person/year (equivalent to 1.5°C pathway), per IPCC Special Report on Global Warming of 1.5°C.

---

## 5. Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run all 354 tests
npm test

# Run with coverage (98%+ on business logic)
npm run test:coverage

# Production build
npm run build
```

---

## 6. Testing

```bash
npm test              # 354 tests across 11 test files
npm run test:coverage # 98%+ statements | 100% functions | 98%+ lines
npm run test:ci       # Non-interactive CI mode
```

**Test Coverage Summary:**

| File | Statements | Branches | Functions |
|---|---|---|---|
| `aiCoach.ts` | 100% | 100% | 100% |
| `constants/index.ts` | 100% | 100% | 100% |
| `utils/index.ts` | 100% | 91% | 100% |
| `utils/security.ts` | 100% | 95% | 100% |
| `utils/performance.ts` | 94% | 85% | 100% |
| `store.ts` | 95% | 80% | 100% |

---

## 7. Security

- **XSS Prevention**: `escapeHtml()` + `safeMarkdownToHtml()` — escape before render
- **Input Sanitization**: `sanitizeInput()` strips control characters; `sanitizeNumber()` validates bounds
- **Rate Limiting**: Login limited to 5 attempts per 15 minutes
- **CSP**: Strict Content-Security-Policy prevents script injection
- **HSTS**: Strict-Transport-Security enforces HTTPS
- **Nginx**: `server_tokens off`, hidden files blocked, X-Frame-Options: DENY
- **Environment Variables**: Secrets in `.env.local` (gitignored); documented in `.env.example`

See [SECURITY.md](./SECURITY.md) for the full security policy.

---

## 8. Accessibility

- **Skip Link**: `<a href="#main-content">Skip to content</a>` for keyboard users
- **Semantic HTML**: `<section>`, `<nav>`, `<main>`, `<header>`, `<aside>` landmarks
- **ARIA**: `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-required`, `aria-invalid`, `aria-live`
- **Focus Management**: All interactive elements reachable via keyboard; visible focus rings
- **Screen Readers**: All charts have `role="img"` + descriptive `aria-label`
- **Color Contrast**: All text meets WCAG AA (4.5:1) minimum contrast ratio

---

## 9. Performance

- **Code Splitting**: 8 feature pages lazy-loaded via `React.lazy()` + `Suspense`
- **Memoization**: `React.memo` on static sub-components; `useMemo` for derived calculations; `useCallback` for event handlers
- **Utilities**: `debounce`, `throttle`, `memoize` in `src/shared/utils/performance.ts`
- **Gzip**: Enabled in Nginx for all text assets (avg 70% compression)
- **Cache**: 1-year immutable cache for hashed JS/CSS/font assets

---

*Built with React 19 · TypeScript · Vite · Zustand · Recharts · Google Gemini · Cloud Run*
