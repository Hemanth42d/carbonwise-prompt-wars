/**
 * Custom React hooks for EcoSphere AI.
 *
 * Problem Statement Alignment:
 * - useFootprintSummary: Powers "understand" — aggregates footprint into digestible metrics
 * - useDebounce: Powers efficiency — prevents excessive state updates in search/input
 * - usePreviousValue: Powers trend analysis — compares current vs previous for insights
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAppStore } from '../../app/store';
import { roundToDecimals } from '../utils';
import { GLOBAL_AVERAGES } from '../constants';

/* ─── useDebounce ─── */

/**
 * Debounces a value — returns the value only after `delayMs` of inactivity.
 * Prevents excessive re-renders and API calls on rapid input changes.
 *
 * @param value - The value to debounce
 * @param delayMs - Delay in milliseconds (default: 300)
 *
 * @example
 * const debouncedSearch = useDebounce(searchQuery, 300);
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer); // cleanup prevents stale closure issues
  }, [value, delayMs]);

  return debouncedValue;
}

/* ─── usePreviousValue ─── */

/**
 * Returns the previous value of a variable.
 * Used for trend calculations — compare current footprint to previous period.
 *
 * @param value - The current value
 * @returns The value from the previous render
 */
export function usePreviousValue<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

/* ─── useFootprintSummary ─── */

/**
 * Aggregates footprint data into a digestible summary.
 *
 * PROBLEM STATEMENT: Helps individuals **understand** their carbon footprint
 * by computing key metrics, comparisons against global benchmarks, and
 * trend direction — all in a single, memoized hook.
 */
export function useFootprintSummary() {
  const { footprintData, user } = useAppStore();

  return useMemo(() => {
    if (!footprintData.length) {
      return {
        todayKg: 0,
        weeklyAvgKg: 0,
        monthlyTotalKg: 0,
        annualProjectedKg: 0,
        vsWorldAverage: 0,
        vsParisTarget: 0,
        trendDirection: 'stable' as 'improving' | 'stable' | 'worsening',
        streakDays: user?.streakDays ?? 0,
      };
    }

    const last7 = footprintData.slice(-7);
    const prev7 = footprintData.slice(-14, -7);
    const last30 = footprintData.slice(-30);

    const weeklyAvgKg = roundToDecimals(
      last7.reduce((s, d) => s + d.totalKg, 0) / last7.length,
      2
    );
    const prevWeekAvg = prev7.length
      ? prev7.reduce((s, d) => s + d.totalKg, 0) / prev7.length
      : weeklyAvgKg;

    const monthlyTotalKg = roundToDecimals(
      last30.reduce((s, d) => s + d.totalKg, 0),
      1
    );

    const annualProjectedKg = roundToDecimals(monthlyTotalKg * 12, 0);

    /* Compare to global benchmarks */
    const vsWorldAverage = roundToDecimals(
      ((annualProjectedKg - GLOBAL_AVERAGES.WORLD_ANNUAL_KG) / GLOBAL_AVERAGES.WORLD_ANNUAL_KG) * 100,
      1
    );
    const vsParisTarget = roundToDecimals(
      ((annualProjectedKg - GLOBAL_AVERAGES.PARIS_TARGET_ANNUAL_KG) / GLOBAL_AVERAGES.PARIS_TARGET_ANNUAL_KG) * 100,
      1
    );

    const trendDirection: 'improving' | 'stable' | 'worsening' =
      weeklyAvgKg < prevWeekAvg * 0.97
        ? 'improving'
        : weeklyAvgKg > prevWeekAvg * 1.03
          ? 'worsening'
          : 'stable';

    return {
      todayKg: footprintData[footprintData.length - 1]?.totalKg ?? 0,
      weeklyAvgKg,
      monthlyTotalKg,
      annualProjectedKg,
      vsWorldAverage,
      vsParisTarget,
      trendDirection,
      streakDays: user?.streakDays ?? 0,
    };
  }, [footprintData, user]);
}

/* ─── useLocalStorage ─── */

/**
 * Persists state to localStorage with a type-safe getter/setter.
 * Used for user preferences (dark mode, sidebar state).
 *
 * @param key - localStorage key
 * @param initialValue - Default value if key not found
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T): void => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* localStorage may be unavailable in private browsing */
      setStoredValue(value);
    }
  };

  return [storedValue, setValue];
}
