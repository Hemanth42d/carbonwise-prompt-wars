/**
 * Tests for security utilities — XSS prevention, input sanitization, rate limiting.
 */
import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  sanitizeInput,
  sanitizeNumber,
  isValidEmail,
  createRateLimiter,
  safeMarkdownToHtml,
} from '../shared/utils/security';

describe('escapeHtml', () => {
  it('should escape angle brackets', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).not.toContain('<script>');
    expect(escapeHtml('<img onerror="alert(1)">')).not.toContain('<img');
  });

  it('should escape quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
    expect(escapeHtml("'hello'")).toBe('&#x27;hello&#x27;');
  });

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('should handle non-string input', () => {
    expect(escapeHtml(null as unknown as string)).toBe('');
    expect(escapeHtml(undefined as unknown as string)).toBe('');
  });

  it('should preserve safe content', () => {
    expect(escapeHtml('Hello World 123')).toBe('Hello World 123');
    expect(escapeHtml('CO₂ emissions')).toBe('CO₂ emissions');
  });
});

describe('sanitizeInput', () => {
  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('should remove control characters', () => {
    expect(sanitizeInput('hello\x00world')).toBe('helloworld');
    expect(sanitizeInput('test\x07data')).toBe('testdata');
  });

  it('should preserve newlines and tabs', () => {
    expect(sanitizeInput('line1\nline2')).toBe('line1\nline2');
  });

  it('should handle non-string input', () => {
    expect(sanitizeInput(42 as unknown as string)).toBe('');
  });
});

describe('sanitizeNumber', () => {
  it('should clamp within bounds', () => {
    expect(sanitizeNumber(50, 0, 100, 0)).toBe(50);
    expect(sanitizeNumber(-5, 0, 100, 0)).toBe(0);
    expect(sanitizeNumber(150, 0, 100, 0)).toBe(100);
  });

  it('should return default for NaN', () => {
    expect(sanitizeNumber('abc', 0, 100, 50)).toBe(50);
    expect(sanitizeNumber(NaN, 0, 100, 50)).toBe(50);
  });

  it('should return default for Infinity', () => {
    expect(sanitizeNumber(Infinity, 0, 100, 50)).toBe(50);
  });

  it('should parse string numbers', () => {
    expect(sanitizeNumber('42', 0, 100, 0)).toBe(42);
  });
});

describe('isValidEmail', () => {
  it('should accept valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.user@domain.org')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('should handle non-string input', () => {
    expect(isValidEmail(42 as unknown as string)).toBe(false);
  });
});

describe('createRateLimiter', () => {
  it('should allow actions within limit', () => {
    const limiter = createRateLimiter(3, 1000);
    expect(limiter.tryAction()).toBe(true);
    expect(limiter.tryAction()).toBe(true);
    expect(limiter.tryAction()).toBe(true);
  });

  it('should block after limit exceeded', () => {
    const limiter = createRateLimiter(2, 10000);
    limiter.tryAction();
    limiter.tryAction();
    expect(limiter.tryAction()).toBe(false);
  });

  it('should reset correctly', () => {
    const limiter = createRateLimiter(1, 10000);
    limiter.tryAction();
    expect(limiter.tryAction()).toBe(false);
    limiter.reset();
    expect(limiter.tryAction()).toBe(true);
  });
});

describe('safeMarkdownToHtml', () => {
  it('should escape XSS in markdown', () => {
    const result = safeMarkdownToHtml('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
  });

  it('should apply bold formatting safely', () => {
    const result = safeMarkdownToHtml('**bold text**');
    expect(result).toContain('<strong>bold text</strong>');
  });

  it('should apply heading formatting', () => {
    const result = safeMarkdownToHtml('## Heading');
    expect(result).toContain('<h3>Heading</h3>');
  });

  it('should handle empty input', () => {
    expect(safeMarkdownToHtml('')).toBe('');
  });
});
