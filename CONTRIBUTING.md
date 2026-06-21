# Contributing to EcoSphere AI

Thank you for your interest in contributing to EcoSphere AI! This document provides guidelines and standards for contributing to this sustainability platform.

## Code of Conduct

Please be respectful and constructive in all interactions. We are building a platform to help the environment — let's keep that spirit in our collaboration.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/<your-username>/carbon-footprint-challenge.git
cd carbon-footprint-challenge

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build
```

## Project Structure

```
src/
├── app/                    # Global state (Zustand store)
├── features/               # Feature modules (one folder per page)
│   ├── auth/               # Login
│   ├── challenges/         # Gamified challenges
│   ├── coach/              # AI Coach (Gemini)
│   ├── community/          # Leaderboard + groups
│   ├── dashboard/          # Main overview
│   ├── forecast/           # Predictive analytics
│   ├── reports/            # Sustainability reports
│   ├── simulator/          # What-if scenarios
│   └── tracker/            # Activity logger
├── services/               # External service integrations
├── shared/                 # Shared code
│   ├── components/         # Reusable components
│   ├── constants/          # Named constants (no magic numbers)
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Pure utility functions
└── styles/                 # Global styles
```

## Coding Standards

### TypeScript
- **Strict mode** is enabled — all code must pass `tsc` with `strict: true`
- Use `type` imports for type-only imports: `import type { User } from './types'`
- No `any` types unless explicitly suppressed with `// eslint-disable-next-line`
- All functions must have JSDoc comments with `@param` and `@returns`

### React
- Use **functional components** with `React.FC` typing
- Memoize components with `React.memo` and add `.displayName`
- Use `useMemo` for derived calculations, `useCallback` for event handlers
- All hooks must be called unconditionally (no hooks after early returns)

### CSS
- Use **CSS custom properties** from `index.css` — no hardcoded colors
- Use **CSS classes** — avoid inline `style` attributes
- Follow BEM-like naming: `.component-element--modifier`
- Mobile-first responsive design with media queries

### Security
- All user inputs must pass through `sanitizeInput()` before storage
- All HTML rendering uses `safeMarkdownToHtml()` (escape-first approach)
- No API keys or secrets in source code
- Rate limit any user-triggered actions

### Testing
- All business logic must have unit tests
- Use `vitest` with `describe/it/expect` patterns
- Maintain 95%+ coverage on business logic files
- Integration tests go in `src/__tests__/`

## Pull Request Process

1. Create a feature branch from `main`
2. Ensure all tests pass: `npm test`
3. Ensure no lint errors: `npm run lint`
4. Ensure TypeScript compiles: `npm run build`
5. Write clear commit messages following conventional commits
6. Submit a PR with a description of changes

## Commit Message Format

```
type(scope): description

feat(coach): add context-aware AI responses
fix(dashboard): resolve conditional hook error
test(utils): add edge case for carbon calculation
docs(readme): update architecture diagram
```

## License

By contributing, you agree that your contributions will be licensed under the project's license.
