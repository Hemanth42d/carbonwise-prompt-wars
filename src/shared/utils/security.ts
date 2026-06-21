/**
 * Security utilities for input sanitization and XSS prevention.
 * All user-facing inputs should pass through these guards.
 */

/** HTML entity map for safe character escaping */
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

const HTML_ESCAPE_REGEX = /[&<>"'/`]/g;

/**
 * Escape HTML special characters to prevent XSS injection.
 * Use this on any user-provided string before rendering as HTML.
 */
export function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') return '';
  return unsafe.replace(HTML_ESCAPE_REGEX, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Sanitize user input by trimming whitespace and removing
 * control characters while preserving normal unicode.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  // Remove control characters (U+0000-U+001F except \n \r \t) 
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

/**
 * Validate and sanitize numeric inputs within bounds.
 * Returns the clamped, finite number or the provided default.
 */
export function sanitizeNumber(
  value: unknown,
  min: number,
  max: number,
  defaultValue: number
): number {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (!Number.isFinite(num)) return defaultValue;
  return Math.min(max, Math.max(min, num));
}

/**
 * Validate an email address against a standard pattern.
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email) && email.length <= 254;
}

/**
 * Rate limiter for client-side action throttling.
 * Returns true if the action should be allowed, false if rate-limited.
 */
export function createRateLimiter(maxAttempts: number, windowMs: number) {
  const attempts: number[] = [];

  return {
    tryAction(): boolean {
      const now = Date.now();
      // Remove expired attempts
      while (attempts.length > 0 && (attempts[0] ?? now) < now - windowMs) {
        attempts.shift();
      }
      if (attempts.length >= maxAttempts) {
        return false;
      }
      attempts.push(now);
      return true;
    },
    reset(): void {
      attempts.length = 0;
    },
  };
}

/**
 * Safe markdown-to-HTML converter that escapes user content first.
 * Only applies formatting to pre-defined markdown patterns.
 */
export function safeMarkdownToHtml(text: string): string {
  if (typeof text !== 'string') return '';

  // First escape all HTML in the raw text
  let safe = escapeHtml(text);

  // Then apply safe markdown transformations on escaped content
  safe = safe
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\| (.+)$/gm, (match) => {
      const cells = match.split('|').filter(Boolean).map((c) => c.trim());
      return `<div class="md-table-row">${cells.map((c) => `<span>${c}</span>`).join('')}</div>`;
    })
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/\n/g, '<br />');

  return safe;
}
