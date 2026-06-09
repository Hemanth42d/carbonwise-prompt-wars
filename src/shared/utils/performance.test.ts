/**
 * Tests for performance utilities.
 * Validates debounce, throttle, memoize, and performance measurement.
 */
import { describe, it, expect, vi } from 'vitest';
import { debounce, throttle, memoize, measurePerformance, batchRead } from './performance';

describe('debounce', () => {
  it('delays function execution', async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 50);
    debounced();
    expect(fn).not.toHaveBeenCalled();
    await new Promise((r) => setTimeout(r, 60));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('only fires once for multiple rapid calls', async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 50);
    debounced();
    debounced();
    debounced();
    await new Promise((r) => setTimeout(r, 100));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('passes arguments correctly', async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 30);
    debounced(42, 'hello');
    await new Promise((r) => setTimeout(r, 50));
    expect(fn).toHaveBeenCalledWith(42, 'hello');
  });

  it('resets timer on each call', async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 50);
    debounced();
    await new Promise((r) => setTimeout(r, 30));
    debounced(); // reset timer
    await new Promise((r) => setTimeout(r, 30));
    expect(fn).not.toHaveBeenCalled(); // still waiting
    await new Promise((r) => setTimeout(r, 30));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('throttle', () => {
  it('calls function immediately on first invocation', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('ignores rapid subsequent calls within interval', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 1000);
    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('allows calls after interval expires', async () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 50);
    throttled();
    await new Promise((r) => setTimeout(r, 60));
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('passes arguments correctly', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 1000);
    throttled(1, 2, 3);
    expect(fn).toHaveBeenCalledWith(1, 2, 3);
  });
});

describe('memoize', () => {
  it('returns cached result for same args', () => {
    let callCount = 0;
    const expensive = memoize((x: number) => { callCount++; return x * 2; });
    expect(expensive(5)).toBe(10);
    expect(expensive(5)).toBe(10);
    expect(callCount).toBe(1);
  });

  it('recomputes for different args', () => {
    let callCount = 0;
    const fn = memoize((x: number) => { callCount++; return x * 3; });
    fn(1);
    fn(2);
    fn(3);
    expect(callCount).toBe(3);
  });

  it('handles multiple arguments', () => {
    const add = memoize((a: number, b: number) => a + b);
    expect(add(1, 2)).toBe(3);
    expect(add(1, 2)).toBe(3);
    expect(add(2, 3)).toBe(5);
  });

  it('evicts oldest entry when maxSize is reached', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x; }, 2);
    fn(1); // cache: {1}
    fn(2); // cache: {1, 2}
    fn(3); // cache full: evicts 1, cache: {2, 3}
    calls = 0;
    fn(1); // must recompute — was evicted
    expect(calls).toBe(1);
  });

  it('works with string arguments', () => {
    const fn = memoize((s: string) => s.toUpperCase());
    expect(fn('hello')).toBe('HELLO');
    expect(fn('hello')).toBe('HELLO');
  });
});

describe('measurePerformance', () => {
  it('returns the result of the function', () => {
    const result = measurePerformance('test-label', () => 42);
    expect(result).toBe(42);
  });

  it('works with non-numeric return types', () => {
    const result = measurePerformance('string-test', () => 'hello');
    expect(result).toBe('hello');
  });

  it('works with object return types', () => {
    const obj = { a: 1, b: 2 };
    const result = measurePerformance('obj-test', () => obj);
    expect(result).toBe(obj);
  });

  it('propagates exceptions from inner function', () => {
    expect(() =>
      measurePerformance('error-test', () => { throw new Error('inner error'); })
    ).toThrow('inner error');
  });
});

describe('batchRead', () => {
  it('schedules callback via requestAnimationFrame', async () => {
    const fn = vi.fn();
    batchRead(fn);
    expect(fn).not.toHaveBeenCalled(); // async
    await new Promise((r) => setTimeout(r, 50));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('executes callback with no arguments', async () => {
    let called = false;
    batchRead(() => { called = true; });
    await new Promise((r) => setTimeout(r, 50));
    expect(called).toBe(true);
  });
});
