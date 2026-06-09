/**
 * Co-located tests for security utilities.
 * Tests XSS prevention, input sanitization, and rate limiting.
 */
import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  sanitizeInput,
  sanitizeNumber,
  isValidEmail,
  createRateLimiter,
  safeMarkdownToHtml,
} from './security';

describe('escapeHtml', () => {
  it('escapes script tags', () => {
    const result = escapeHtml('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });
  it('escapes double quotes', () => expect(escapeHtml('"test"')).toBe('&quot;test&quot;'));
  it('escapes single quotes', () => expect(escapeHtml("'test'")).toBe('&#x27;test&#x27;'));
  it('escapes ampersand', () => expect(escapeHtml('a & b')).toBe('a &amp; b'));
  it('escapes forward slash', () => expect(escapeHtml('a/b')).toBe('a&#x2F;b'));
  it('preserves safe text', () => expect(escapeHtml('Hello 123 CO₂')).toBe('Hello 123 CO₂'));
  it('returns empty for empty string', () => expect(escapeHtml('')).toBe(''));
  it('handles null gracefully', () => expect(escapeHtml(null as unknown as string)).toBe(''));
  it('handles undefined gracefully', () => expect(escapeHtml(undefined as unknown as string)).toBe(''));
  it('escapes img onerror XSS', () => {
    expect(escapeHtml('<img onerror="alert(1)">')).not.toContain('<img');
  });
});

describe('sanitizeInput', () => {
  it('trims whitespace', () => expect(sanitizeInput('  hello  ')).toBe('hello'));
  it('removes null bytes', () => expect(sanitizeInput('hello\x00world')).toBe('helloworld'));
  it('removes bell character', () => expect(sanitizeInput('test\x07data')).toBe('testdata'));
  it('removes form feed', () => expect(sanitizeInput('a\x0Cb')).toBe('ab'));
  it('preserves newlines', () => expect(sanitizeInput('line1\nline2')).toBe('line1\nline2'));
  it('preserves tabs', () => expect(sanitizeInput('col1\tcol2')).toBe('col1\tcol2'));
  it('handles non-string', () => expect(sanitizeInput(42 as unknown as string)).toBe(''));
  it('handles empty string', () => expect(sanitizeInput('')).toBe(''));
  it('preserves emoji', () => expect(sanitizeInput('Hello 🌿')).toBe('Hello 🌿'));
  it('preserves unicode', () => expect(sanitizeInput('CO₂ émissions')).toBe('CO₂ émissions'));
});

describe('sanitizeNumber', () => {
  it('passes through valid number in range', () => expect(sanitizeNumber(50, 0, 100, 0)).toBe(50));
  it('clamps below min to min', () => expect(sanitizeNumber(-5, 0, 100, 0)).toBe(0));
  it('clamps above max to max', () => expect(sanitizeNumber(150, 0, 100, 0)).toBe(100));
  it('returns default for NaN string', () => expect(sanitizeNumber('abc', 0, 100, 50)).toBe(50));
  it('returns default for NaN', () => expect(sanitizeNumber(NaN, 0, 100, 50)).toBe(50));
  it('returns default for Infinity', () => expect(sanitizeNumber(Infinity, 0, 100, 50)).toBe(50));
  it('returns default for -Infinity', () => expect(sanitizeNumber(-Infinity, 0, 100, 50)).toBe(50));
  it('parses valid string number', () => expect(sanitizeNumber('42', 0, 100, 0)).toBe(42));
  it('handles 0 correctly', () => expect(sanitizeNumber(0, 0, 100, 50)).toBe(0));
  it('handles exact min boundary', () => expect(sanitizeNumber(0, 0, 100, 50)).toBe(0));
  it('handles exact max boundary', () => expect(sanitizeNumber(100, 0, 100, 50)).toBe(100));
});

describe('isValidEmail', () => {
  it('accepts standard email', () => expect(isValidEmail('user@example.com')).toBe(true));
  it('accepts subdomain email', () => expect(isValidEmail('user@mail.example.org')).toBe(true));
  it('accepts plus-addressed email', () => expect(isValidEmail('user+tag@example.com')).toBe(true));
  it('rejects missing @', () => expect(isValidEmail('notanemail')).toBe(false));
  it('rejects missing domain', () => expect(isValidEmail('user@')).toBe(false));
  it('rejects missing local part', () => expect(isValidEmail('@domain.com')).toBe(false));
  it('rejects empty string', () => expect(isValidEmail('')).toBe(false));
  it('handles non-string', () => expect(isValidEmail(42 as unknown as string)).toBe(false));
});

describe('createRateLimiter', () => {
  it('allows actions within limit', () => {
    const limiter = createRateLimiter(3, 5000);
    expect(limiter.tryAction()).toBe(true);
    expect(limiter.tryAction()).toBe(true);
    expect(limiter.tryAction()).toBe(true);
  });
  it('blocks after limit exceeded', () => {
    const limiter = createRateLimiter(2, 30000);
    limiter.tryAction();
    limiter.tryAction();
    expect(limiter.tryAction()).toBe(false);
  });
  it('reset allows actions again', () => {
    const limiter = createRateLimiter(1, 30000);
    limiter.tryAction();
    expect(limiter.tryAction()).toBe(false);
    limiter.reset();
    expect(limiter.tryAction()).toBe(true);
  });
  it('allows action again after window expires', async () => {
    const limiter = createRateLimiter(1, 100); // 100ms window
    limiter.tryAction(); // fill limit
    expect(limiter.tryAction()).toBe(false); // rate limited
    await new Promise((r) => setTimeout(r, 120)); // wait for window to expire
    expect(limiter.tryAction()).toBe(true); // expired attempts cleaned, allowed
  }, 2000);

  it('limit of 1 allows exactly 1 action', () => {
    const limiter = createRateLimiter(1, 30000);
    expect(limiter.tryAction()).toBe(true);
    expect(limiter.tryAction()).toBe(false);
  });
});

describe('safeMarkdownToHtml', () => {
  it('escapes XSS script tags before formatting', () => {
    expect(safeMarkdownToHtml('<script>alert("xss")</script>')).not.toContain('<script>');
  });
  it('escapes img onerror XSS', () => {
    expect(safeMarkdownToHtml('<img onerror="alert(1)">')).not.toContain('<img');
  });
  it('applies bold formatting', () => expect(safeMarkdownToHtml('**bold**')).toContain('<strong>bold</strong>'));
  it('applies italic formatting', () => expect(safeMarkdownToHtml('*italic*')).toContain('<em>italic</em>'));
  it('applies h3 heading', () => expect(safeMarkdownToHtml('## Heading')).toContain('<h3>Heading</h3>'));
  it('applies h4 heading', () => expect(safeMarkdownToHtml('### Sub')).toContain('<h4>Sub</h4>'));
  it('applies list items', () => expect(safeMarkdownToHtml('- item')).toContain('<li>item</li>'));
  it('applies ordered list', () => expect(safeMarkdownToHtml('1. first')).toContain('<li>first</li>'));
  it('handles empty string', () => expect(safeMarkdownToHtml('')).toBe(''));
  it('handles non-string', () => expect(safeMarkdownToHtml(null as unknown as string)).toBe(''));
  it('converts newlines to br', () => expect(safeMarkdownToHtml('line1\nline2')).toContain('<br />'));
  it('escapes & before rendering', () => expect(safeMarkdownToHtml('A & B')).toContain('&amp;'));
  it('renders markdown table row with | separator', () => {
    const result = safeMarkdownToHtml('| Col1 | Col2 |');
    expect(result).toContain('md-table-row');
    expect(result).toContain('<span>');
  });
});
