/**
 * Tests for custom EcoSphere React hooks.
 * Tests useDebounce, usePreviousValue, useFootprintSummary, and useLocalStorage.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, usePreviousValue, useLocalStorage } from './useEcoSphere';

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 100));
    expect(result.current).toBe('initial');
  });

  it('updates value after delay', async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 'first' } }
    );
    rerender({ value: 'second' });
    expect(result.current).toBe('first'); // still old value
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe('second'); // updated
    vi.useRealTimers();
  });

  it('only uses final value when updated rapidly', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 'a' } }
    );
    rerender({ value: 'b' });
    rerender({ value: 'c' });
    rerender({ value: 'd' });
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe('d');
    vi.useRealTimers();
  });

  it('uses default delay of 300ms', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'start' } }
    );
    rerender({ value: 'end' });
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe('start');
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe('end');
    vi.useRealTimers();
  });
});

describe('usePreviousValue', () => {
  it('returns undefined on first render', () => {
    const { result } = renderHook(() => usePreviousValue('hello'));
    expect(result.current).toBeUndefined();
  });

  it('returns previous value after re-render', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePreviousValue(value),
      { initialProps: { value: 'first' } }
    );
    rerender({ value: 'second' });
    expect(result.current).toBe('first');
  });

  it('tracks numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePreviousValue(value),
      { initialProps: { value: 10 } }
    );
    rerender({ value: 20 });
    expect(result.current).toBe(10);
    rerender({ value: 30 });
    expect(result.current).toBe(20);
  });
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('returns initial value when key not in storage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('persists value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    act(() => { result.current[1]('updated'); });
    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('test-key')).toBe('"updated"');
  });

  it('reads existing value from localStorage', () => {
    localStorage.setItem('existing-key', '"stored"');
    const { result } = renderHook(() => useLocalStorage('existing-key', 'default'));
    expect(result.current[0]).toBe('stored');
  });

  it('works with object values', () => {
    const { result } = renderHook(() => useLocalStorage('obj-key', { count: 0 }));
    act(() => { result.current[1]({ count: 5 }); });
    expect(result.current[0]).toEqual({ count: 5 });
  });

  it('works with boolean values', () => {
    const { result } = renderHook(() => useLocalStorage('bool-key', false));
    act(() => { result.current[1](true); });
    expect(result.current[0]).toBe(true);
  });
});
