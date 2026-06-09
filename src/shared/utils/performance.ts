/**
 * Performance utilities for EcoSphere AI.
 * Provides memoization helpers, debouncing, and performance monitoring.
 */

/**
 * Creates a debounced version of a function that delays invocation
 * until after `delayMs` milliseconds have elapsed since the last call.
 * Used for search inputs and resize handlers.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): void => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delayMs);
  };
}

/**
 * Creates a throttled version of a function that invokes at most once
 * per `intervalMs` milliseconds. Used for scroll and resize events.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  intervalMs: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>): void => {
    const now = Date.now();
    if (now - lastCall >= intervalMs) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Simple in-memory memoization for pure functions.
 * Caches results by serializing arguments as the cache key.
 *
 * @param fn - Pure function to memoize
 * @param maxSize - Maximum cache entries before oldest is evicted (default: 50)
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  maxSize = 50
): T {
  const cache = new Map<string, unknown>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    const result = fn(...args);
    /* Evict oldest entry if cache is full */
    if (cache.size >= maxSize) {
      cache.delete(cache.keys().next().value as string);
    }
    cache.set(key, result);
    return result as ReturnType<T>;
  }) as T;
}

/**
 * Measures the execution time of a synchronous function.
 * Only active in development — no-ops in production.
 *
 * @param label - Name for the performance measurement
 * @param fn - Function to measure
 */
export function measurePerformance<T>(label: string, fn: () => T): T {
  if (import.meta.env.PROD) return fn();

  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (duration > 16) {
    console.warn(`[EcoSphere Performance] "${label}" took ${duration.toFixed(2)}ms (> 16ms frame budget)`);
  }

  return result;
}

/**
 * Batch DOM reads to avoid layout thrashing.
 * Schedules a callback in the next animation frame.
 */
export function batchRead(callback: () => void): void {
  requestAnimationFrame(callback);
}
