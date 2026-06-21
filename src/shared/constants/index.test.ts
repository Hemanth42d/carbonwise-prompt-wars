/**
 * Co-located tests for application constants.
 * Validates data integrity, ordering, and completeness.
 */
import { describe, it, expect } from 'vitest';
import {
  EMISSION_FACTORS,
  ACTIVITY_CATEGORIES,
  USER_TIERS,
  GLOBAL_AVERAGES,
  SCORE_WEIGHTS,
  CHART_COLORS,
} from './index';

describe('EMISSION_FACTORS — Transport', () => {
  it('car emits most among ground transport', () =>
    expect(EMISSION_FACTORS.CAR_PER_KM).toBeGreaterThan(EMISSION_FACTORS.BUS_PER_KM));
  it('bus emits less than car', () =>
    expect(EMISSION_FACTORS.BUS_PER_KM).toBeGreaterThan(EMISSION_FACTORS.TRAIN_PER_KM));
  it('bike emits zero', () => expect(EMISSION_FACTORS.BIKE_PER_KM).toBe(0));
  it('walk emits zero', () => expect(EMISSION_FACTORS.WALK_PER_KM).toBe(0));
  it('electric car less than combustion', () =>
    expect(EMISSION_FACTORS.ELECTRIC_CAR_PER_KM).toBeLessThan(EMISSION_FACTORS.CAR_PER_KM));
  it('all values are non-negative', () =>
    Object.values(EMISSION_FACTORS).forEach((v) => expect(v).toBeGreaterThanOrEqual(0)));
});

describe('EMISSION_FACTORS — Flights', () => {
  it('short haul factor > medium haul', () =>
    expect(EMISSION_FACTORS.FLIGHT_SHORT_PER_KM).toBeGreaterThan(EMISSION_FACTORS.FLIGHT_MEDIUM_PER_KM));
  it('medium haul factor > long haul', () =>
    expect(EMISSION_FACTORS.FLIGHT_MEDIUM_PER_KM).toBeGreaterThan(EMISSION_FACTORS.FLIGHT_LONG_PER_KM));
  it('long haul factor is positive', () =>
    expect(EMISSION_FACTORS.FLIGHT_LONG_PER_KM).toBeGreaterThan(0));
});

describe('EMISSION_FACTORS — Food', () => {
  it('meat > fish > vegetarian > vegan', () => {
    expect(EMISSION_FACTORS.MEAL_MEAT).toBeGreaterThan(EMISSION_FACTORS.MEAL_FISH);
    expect(EMISSION_FACTORS.MEAL_FISH).toBeGreaterThan(EMISSION_FACTORS.MEAL_VEGETARIAN);
    expect(EMISSION_FACTORS.MEAL_VEGETARIAN).toBeGreaterThan(EMISSION_FACTORS.MEAL_VEGAN);
  });
  it('all meal factors are positive', () => {
    [EMISSION_FACTORS.MEAL_MEAT, EMISSION_FACTORS.MEAL_FISH,
      EMISSION_FACTORS.MEAL_VEGETARIAN, EMISSION_FACTORS.MEAL_VEGAN].forEach((v) =>
      expect(v).toBeGreaterThan(0));
  });
});

describe('EMISSION_FACTORS — Energy & Digital', () => {
  it('electricity per kWh is positive', () => expect(EMISSION_FACTORS.ELECTRICITY_PER_KWH).toBeGreaterThan(0));
  it('solar < grid electricity', () =>
    expect(EMISSION_FACTORS.SOLAR_PER_KWH).toBeLessThan(EMISSION_FACTORS.ELECTRICITY_PER_KWH));
  it('streaming factor is positive', () => expect(EMISSION_FACTORS.STREAMING_PER_HOUR).toBeGreaterThan(0));
  it('cloud storage factor is positive', () => expect(EMISSION_FACTORS.CLOUD_STORAGE_PER_GB).toBeGreaterThan(0));
});

describe('ACTIVITY_CATEGORIES', () => {
  const cats = Object.keys(ACTIVITY_CATEGORIES);
  it('has exactly 7 categories', () => expect(cats).toHaveLength(7));
  it('contains all required categories', () => {
    ['transportation', 'flights', 'electricity', 'food', 'shopping', 'water', 'digital']
      .forEach((c) => expect(cats).toContain(c));
  });
  it('each category has label', () =>
    Object.values(ACTIVITY_CATEGORIES).forEach((c) => expect(c.label).toBeTruthy()));
  it('each category has emoji icon', () =>
    Object.values(ACTIVITY_CATEGORIES).forEach((c) => expect(c.icon).toBeTruthy()));
  it('each category has valid hex color', () =>
    Object.values(ACTIVITY_CATEGORIES).forEach((c) => expect(c.color).toMatch(/^#[0-9a-fA-F]{3,6}$/)));
  it('each category has positive avgDailyKg', () =>
    Object.values(ACTIVITY_CATEGORIES).forEach((c) => expect(c.avgDailyKg).toBeGreaterThan(0)));
});

describe('USER_TIERS', () => {
  it('has exactly 5 tiers', () => expect(Object.keys(USER_TIERS)).toHaveLength(5));
  it('contains seedling tier', () => expect(USER_TIERS).toHaveProperty('seedling'));
  it('contains forest tier', () => expect(USER_TIERS).toHaveProperty('forest'));
  it('minScores are non-decreasing', () => {
    const scores = Object.values(USER_TIERS).map((t) => t.minScore);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i - 1] ?? 0);
    }
  });
  it('seedling starts at 0', () => expect(USER_TIERS.seedling.minScore).toBe(0));
  it('each tier has label and icon', () =>
    Object.values(USER_TIERS).forEach((t) => {
      expect(t.label).toBeTruthy();
      expect(t.icon).toBeTruthy();
    }));
  it('each tier has hex color', () =>
    Object.values(USER_TIERS).forEach((t) => expect(t.color).toMatch(/^#/)));
});

describe('GLOBAL_AVERAGES', () => {
  it('US > EU > World > India', () => {
    expect(GLOBAL_AVERAGES.US_ANNUAL_KG).toBeGreaterThan(GLOBAL_AVERAGES.EU_ANNUAL_KG);
    expect(GLOBAL_AVERAGES.EU_ANNUAL_KG).toBeGreaterThan(GLOBAL_AVERAGES.WORLD_ANNUAL_KG);
    expect(GLOBAL_AVERAGES.WORLD_ANNUAL_KG).toBeGreaterThan(GLOBAL_AVERAGES.INDIA_ANNUAL_KG);
  });
  it('Paris target is ambitious (less than world average)', () =>
    expect(GLOBAL_AVERAGES.PARIS_TARGET_ANNUAL_KG).toBeLessThan(GLOBAL_AVERAGES.WORLD_ANNUAL_KG));
  it('all values are positive', () =>
    Object.values(GLOBAL_AVERAGES).forEach((v) => expect(v).toBeGreaterThan(0)));
});

describe('SCORE_WEIGHTS', () => {
  it('weights sum to exactly 1.0', () => {
    const sum = Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });
  it('all weights are positive', () =>
    Object.values(SCORE_WEIGHTS).forEach((w) => expect(w).toBeGreaterThan(0)));
  it('has LIFESTYLE weight', () => expect(SCORE_WEIGHTS.LIFESTYLE).toBeDefined());
  it('has CONSISTENCY weight', () => expect(SCORE_WEIGHTS.CONSISTENCY).toBeDefined());
  it('has IMPROVEMENTS weight', () => expect(SCORE_WEIGHTS.IMPROVEMENTS).toBeDefined());
  it('has GOAL_COMPLETION weight', () => expect(SCORE_WEIGHTS.GOAL_COMPLETION).toBeDefined());
});

describe('CHART_COLORS', () => {
  it('has at least 4 colors', () => expect(CHART_COLORS.length).toBeGreaterThanOrEqual(4));
  it('all are valid hex colors', () =>
    CHART_COLORS.forEach((c) => expect(c).toMatch(/^#[0-9a-fA-F]{3,6}$/)));
  it('colors are unique', () => expect(new Set(CHART_COLORS).size).toBe(CHART_COLORS.length));
});
