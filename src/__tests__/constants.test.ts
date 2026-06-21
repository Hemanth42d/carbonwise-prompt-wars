/**
 * Tests for shared constants — validates data integrity and completeness.
 */
import { describe, it, expect } from 'vitest';
import { EMISSION_FACTORS, ACTIVITY_CATEGORIES, USER_TIERS, GLOBAL_AVERAGES, SCORE_WEIGHTS } from '../shared/constants';

describe('EMISSION_FACTORS', () => {
  it('should have all positive values or zero for clean transport', () => {
    expect(EMISSION_FACTORS.CAR_PER_KM).toBeGreaterThan(0);
    expect(EMISSION_FACTORS.BIKE_PER_KM).toBe(0);
    expect(EMISSION_FACTORS.WALK_PER_KM).toBe(0);
  });

  it('should have car > electric car > train > bus', () => {
    expect(EMISSION_FACTORS.CAR_PER_KM).toBeGreaterThan(EMISSION_FACTORS.ELECTRIC_CAR_PER_KM);
    expect(EMISSION_FACTORS.ELECTRIC_CAR_PER_KM).toBeGreaterThan(EMISSION_FACTORS.TRAIN_PER_KM);
  });

  it('should have meat > fish > vegetarian > vegan', () => {
    expect(EMISSION_FACTORS.MEAL_MEAT).toBeGreaterThan(EMISSION_FACTORS.MEAL_FISH);
    expect(EMISSION_FACTORS.MEAL_FISH).toBeGreaterThan(EMISSION_FACTORS.MEAL_VEGETARIAN);
    expect(EMISSION_FACTORS.MEAL_VEGETARIAN).toBeGreaterThan(EMISSION_FACTORS.MEAL_VEGAN);
  });
});

describe('ACTIVITY_CATEGORIES', () => {
  it('should have all 7 categories', () => {
    const cats = Object.keys(ACTIVITY_CATEGORIES);
    expect(cats).toHaveLength(7);
    expect(cats).toContain('transportation');
    expect(cats).toContain('food');
    expect(cats).toContain('electricity');
  });

  it('should have icon, label, color for each', () => {
    Object.values(ACTIVITY_CATEGORIES).forEach((info) => {
      expect(info.label).toBeTruthy();
      expect(info.icon).toBeTruthy();
      expect(info.color).toMatch(/^#/);
    });
  });
});

describe('USER_TIERS', () => {
  it('should have 5 tiers', () => {
    expect(Object.keys(USER_TIERS)).toHaveLength(5);
  });

  it('should have increasing minScore', () => {
    const scores = Object.values(USER_TIERS).map((t) => t.minScore);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i - 1] ?? 0);
    }
  });
});

describe('GLOBAL_AVERAGES', () => {
  it('should have US > EU > World > Paris target', () => {
    expect(GLOBAL_AVERAGES.US_ANNUAL_KG).toBeGreaterThan(GLOBAL_AVERAGES.EU_ANNUAL_KG);
    expect(GLOBAL_AVERAGES.EU_ANNUAL_KG).toBeGreaterThan(GLOBAL_AVERAGES.WORLD_ANNUAL_KG);
    expect(GLOBAL_AVERAGES.WORLD_ANNUAL_KG).toBeGreaterThan(GLOBAL_AVERAGES.PARIS_TARGET_ANNUAL_KG);
  });
});

describe('SCORE_WEIGHTS', () => {
  it('should sum to 1.0', () => {
    const sum = Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 5);
  });
});
