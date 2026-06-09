# Security Policy — EcoSphere AI

## Overview

EcoSphere AI takes security seriously. This document outlines the security measures implemented in the platform and how to report vulnerabilities.

## Security Measures Implemented

### 1. Input Sanitization & XSS Prevention
- All user inputs pass through `sanitizeInput()` before storage (strips control characters, trims whitespace)
- All content rendered as HTML uses `safeMarkdownToHtml()` which escapes HTML entities **before** applying markdown formatting
- `escapeHtml()` converts `& < > " ' / \`` to safe HTML entities
- No raw `dangerouslySetInnerHTML` without prior escaping

### 2. Rate Limiting
- Login attempts are rate-limited to **5 per 15 minutes** via `createRateLimiter(5, 900000)`
- Rate limiter auto-resets on clean logout
- Prevents brute-force and accidental spam

### 3. Content Security Policy (CSP)
Enforced via Nginx headers:
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob:;
  connect-src 'self' https://*.googleapis.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self'
```

### 4. HTTP Security Headers
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
X-XSS-Protection: 0  (disabled in favour of CSP)
```

### 5. Server Hardening
- `server_tokens off` — Nginx version not disclosed
- Hidden files (`.htaccess`, `.env`) blocked via `location ~ /\.`
- No directory listing enabled

### 6. Environment Variables
- Secrets stored in `.env.local` (gitignored)
- `.env.example` documents all required variables without actual values
- No secrets committed to version control

### 7. Dependency Security
```bash
npm audit          # Check for known vulnerabilities
npm audit fix      # Auto-fix where possible
```

### 8. Type Safety
- TypeScript `strict` mode prevents null dereference and implicit `any`
- `noUnusedLocals`, `noUnusedParameters` enforce clean code
- `verbatimModuleSyntax` prevents unintended re-exports

---

## Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **Do NOT open a public GitHub issue**
2. Email the maintainer directly (see package.json `author` field)
3. Include: description, reproduction steps, potential impact
4. Allow 48 hours for acknowledgement

We will acknowledge all valid reports and credit responsible disclosures.

---

## Security Checklist for Contributors

Before submitting a PR, verify:

- [ ] No user input is rendered as HTML without `escapeHtml()` first
- [ ] All form inputs use `sanitizeInput()` or `sanitizeNumber()`
- [ ] No API keys, tokens, or secrets in source code
- [ ] New dependencies checked with `npm audit`
- [ ] Environment variables documented in `.env.example`
- [ ] New endpoints behind rate limiting if applicable
