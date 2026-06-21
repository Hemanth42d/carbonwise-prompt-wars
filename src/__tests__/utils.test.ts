/**
 * Unit tests for carbon calculation utilities.
 * Tests pure functions with no side effects for maximum coverage.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTransportEmissions,
  calculateFlightEmissions,
  calculateMealEmissions,
  calculateSustainabilityScore,
  formatCarbonAmount,
  formatPercent,
  formatDate,
  kgToTrees,
  kgToDrivingKm,
  roundToDecimals,
  clamp,
  getWeekRange,
  getDaysBetween,
  generateId,
  generateDemoFootprintData,
  generateDemoForecast,
  generateSimulationResult,
} from '../shared/utils';

/* ─── Transport Emissions ─── */

describe('calculateTransportEmissions', () => {
  it('should calculate car emissions correctly', () => {
    const result = calculateTransportEmissions(10, 'car');
    expect(result).toBe(2.1); // 10km * 0.21 kg/km
  });

  it('should calculate bus emissions correctly', () => {
    const result = calculateTransportEmissions(10, 'bus');
    expect(result).toBe(0.89); // 10km * 0.089 kg/km
  });

  it('should calculate train emissions correctly', () => {
    const result = calculateTransportEmissions(10, 'train');
    expect(result).toBe(0.41); // 10km * 0.041 kg/km
  });

  it('should return 0 for bike', () => {
    expect(calculateTransportEmissions(100, 'bike')).toBe(0);
  });

  it('should return 0 for walking', () => {
    expect(calculateTransportEmissions(100, 'walk')).toBe(0);
  });

  it('should calculate electric car emissions', () => {
    const result = calculateTransportEmissions(10, 'electric_car');
    expect(result).toBe(0.53); // 10km * 0.053 kg/km
  });

  it('should handle zero distance', () => {
    expect(calculateTransportEmissions(0, 'car')).toBe(0);
  });

  it('should handle large distances', () => {
    const result = calculateTransportEmissions(1000, 'car');
    expect(result).toBe(210); // 1000 * 0.21
  });
});

/* ─── Flight Emissions ─── */

describe('calculateFlightEmissions', () => {
  it('should use short-haul factor for < 1500km', () => {
    const result = calculateFlightEmissions(1000);
    expect(result).toBe(255); // 1000 * 0.255
  });

  it('should use medium-haul factor for 1500-4000km', () => {
    const result = calculateFlightEmissions(2000);
    expect(result).toBe(390); // 2000 * 0.195
  });

  it('should use long-haul factor for > 4000km', () => {
    const result = calculateFlightEmissions(5000);
    expect(result).toBe(750); // 5000 * 0.150
  });

  it('should handle boundary at 1500km (uses short-haul)', () => {
    const result = calculateFlightEmissions(1499);
    expect(result).toBeCloseTo(382.25, 0);
  });

  it('should handle zero distance', () => {
    expect(calculateFlightEmissions(0)).toBe(0);
  });
});

/* ─── Meal Emissions ─── */

describe('calculateMealEmissions', () => {
  it('should return correct emissions for meat meal', () => {
    expect(calculateMealEmissions('meat')).toBe(7.2);
  });

  it('should return correct emissions for vegetarian meal', () => {
    expect(calculateMealEmissions('vegetarian')).toBe(1.7);
  });

  it('should return correct emissions for vegan meal', () => {
    expect(calculateMealEmissions('vegan')).toBe(0.9);
  });

  it('should return correct emissions for fish meal', () => {
    expect(calculateMealEmissions('fish')).toBe(3.5);
  });

  it('should show vegan < vegetarian < fish < meat', () => {
    const vegan = calculateMealEmissions('vegan');
    const vegetarian = calculateMealEmissions('vegetarian');
    const fish = calculateMealEmissions('fish');
    const meat = calculateMealEmissions('meat');
    expect(vegan).toBeLessThan(vegetarian);
    expect(vegetarian).toBeLessThan(fish);
    expect(fish).toBeLessThan(meat);
  });
});

/* ─── Sustainability Score ─── */

describe('calculateSustainabilityScore', () => {
  it('should return a score between 0 and 100', () => {
    const score = calculateSustainabilityScore({
      dailyAvgKg: 10,
      consistencyDays: 30,
      improvementPercent: 5,
      goalsCompleted: 2,
      goalsTotal: 5,
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should give higher score for lower daily emissions', () => {
    const lowEmission = calculateSustainabilityScore({
      dailyAvgKg: 2, consistencyDays: 30, improvementPercent: 5, goalsCompleted: 2, goalsTotal: 5,
    });
    const highEmission = calculateSustainabilityScore({
      dailyAvgKg: 20, consistencyDays: 30, improvementPercent: 5, goalsCompleted: 2, goalsTotal: 5,
    });
    expect(lowEmission).toBeGreaterThan(highEmission);
  });

  it('should reward higher consistency', () => {
    const consistent = calculateSustainabilityScore({
      dailyAvgKg: 10, consistencyDays: 365, improvementPercent: 5, goalsCompleted: 2, goalsTotal: 5,
    });
    const inconsistent = calculateSustainabilityScore({
      dailyAvgKg: 10, consistencyDays: 7, improvementPercent: 5, goalsCompleted: 2, goalsTotal: 5,
    });
    expect(consistent).toBeGreaterThan(inconsistent);
  });

  it('should handle zero goals without error', () => {
    const score = calculateSustainabilityScore({
      dailyAvgKg: 10, consistencyDays: 30, improvementPercent: 5, goalsCompleted: 0, goalsTotal: 0,
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should return integer value', () => {
    const score = calculateSustainabilityScore({
      dailyAvgKg: 10, consistencyDays: 30, improvementPercent: 5, goalsCompleted: 2, goalsTotal: 5,
    });
    expect(Number.isInteger(score)).toBe(true);
  });
});

/* ─── Formatting ─── */

describe('formatCarbonAmount', () => {
  it('should format small amounts in kg', () => {
    expect(formatCarbonAmount(5.2)).toBe('5.2kg CO₂e');
  });

  it('should format 1000+ as tonnes', () => {
    expect(formatCarbonAmount(1500)).toBe('1.5t CO₂e');
  });

  it('should handle zero', () => {
    expect(formatCarbonAmount(0)).toBe('0kg CO₂e');
  });

  it('should round to 1 decimal', () => {
    expect(formatCarbonAmount(5.678)).toBe('5.7kg CO₂e');
  });

  it('should format exactly 1000 as tonnes', () => {
    expect(formatCarbonAmount(1000)).toBe('1t CO₂e');
  });
});

describe('formatPercent', () => {
  it('should add + for positive values', () => {
    expect(formatPercent(5.3)).toBe('+5.3%');
  });

  it('should include - for negative values', () => {
    expect(formatPercent(-3.2)).toBe('-3.2%');
  });

  it('should handle zero', () => {
    expect(formatPercent(0)).toBe('+0%');
  });
});

describe('formatDate', () => {
  it('should format date string with default format', () => {
    const result = formatDate('2026-06-09');
    expect(result).toBe('Jun 9, 2026');
  });

  it('should accept custom format', () => {
    const result = formatDate('2026-06-09', 'yyyy-MM-dd');
    expect(result).toBe('2026-06-09');
  });
});

/* ─── Conversion Utilities ─── */

describe('kgToTrees', () => {
  it('should convert kg to tree equivalents', () => {
    expect(kgToTrees(22)).toBe(1);
    expect(kgToTrees(44)).toBe(2);
  });

  it('should round to nearest integer', () => {
    expect(kgToTrees(10)).toBe(0);
    expect(kgToTrees(33)).toBe(2);
  });

  it('should handle zero', () => {
    expect(kgToTrees(0)).toBe(0);
  });
});

describe('kgToDrivingKm', () => {
  it('should convert kg CO2 to driving distance', () => {
    const km = kgToDrivingKm(2.1);
    expect(km).toBe(10);
  });

  it('should handle zero', () => {
    expect(kgToDrivingKm(0)).toBe(0);
  });
});

/* ─── Math Helpers ─── */

describe('roundToDecimals', () => {
  it('should round to specified decimals', () => {
    expect(roundToDecimals(3.14159, 2)).toBe(3.14);
    expect(roundToDecimals(3.14159, 0)).toBe(3);
    expect(roundToDecimals(3.14159, 4)).toBe(3.1416);
  });

  it('should handle negative numbers', () => {
    expect(roundToDecimals(-3.14, 1)).toBe(-3.1);
  });

  it('should handle zero', () => {
    expect(roundToDecimals(0, 2)).toBe(0);
  });
});

describe('clamp', () => {
  it('should clamp value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('should handle edge values', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

/* ─── Date Helpers ─── */

describe('getWeekRange', () => {
  it('should return week start and end dates', () => {
    const range = getWeekRange('2026-06-09'); // Tuesday
    expect(range.start).toBe('2026-06-08');
    expect(range.end).toBe('2026-06-14');
  });
});

describe('getDaysBetween', () => {
  it('should return days between two dates', () => {
    expect(getDaysBetween('2026-06-01', '2026-06-10')).toBe(9);
  });

  it('should return 0 for same date', () => {
    expect(getDaysBetween('2026-06-01', '2026-06-01')).toBe(0);
  });
});

describe('generateId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should return a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
});

/* ─── Demo Data Generators ─── */

describe('generateDemoFootprintData', () => {
  it('should generate correct number of days', () => {
    const data = generateDemoFootprintData(30);
    expect(data).toHaveLength(30);
  });

  it('should have valid structure for each day', () => {
    const data = generateDemoFootprintData(7);
    data.forEach((day) => {
      expect(day.date).toBeTruthy();
      expect(day.totalKg).toBeGreaterThan(0);
      expect(day.breakdown).toBeDefined();
      expect(day.breakdown.transportation).toBeDefined();
      expect(day.breakdown.food).toBeDefined();
      expect(day.breakdown.electricity).toBeDefined();
    });
  });

  it('should generate dates in chronological order', () => {
    const data = generateDemoFootprintData(10);
    for (let i = 1; i < data.length; i++) {
      expect(new Date(data[i]!.date).getTime()).toBeGreaterThan(
        new Date(data[i - 1]!.date).getTime()
      );
    }
  });

  it('should have all required categories in breakdown', () => {
    const data = generateDemoFootprintData(5);
    const requiredCategories = ['transportation', 'flights', 'electricity', 'food', 'shopping', 'water', 'digital'];
    data.forEach((day) => {
      requiredCategories.forEach((cat) => {
        expect(day.breakdown).toHaveProperty(cat);
      });
    });
  });
});

describe('generateDemoForecast', () => {
  it('should generate correct number of forecast points', () => {
    const historical = generateDemoFootprintData(30);
    const forecast = generateDemoForecast(historical, 30);
    expect(forecast).toHaveLength(30);
  });

  it('should have valid forecast structure', () => {
    const historical = generateDemoFootprintData(30);
    const forecast = generateDemoForecast(historical, 10);
    forecast.forEach((point) => {
      expect(point.date).toBeTruthy();
      expect(point.predictedKg).toBeGreaterThan(0);
      expect(point.lowerBound).toBeLessThanOrEqual(point.predictedKg);
      expect(point.upperBound).toBeGreaterThanOrEqual(point.predictedKg);
      expect(point.confidence).toBeGreaterThanOrEqual(0);
      expect(point.confidence).toBeLessThanOrEqual(1);
    });
  });

  it('should have decreasing confidence over time', () => {
    const historical = generateDemoFootprintData(30);
    const forecast = generateDemoForecast(historical, 30);
    expect(forecast[0]!.confidence).toBeGreaterThan(
      forecast[forecast.length - 1]!.confidence
    );
  });
});

describe('generateSimulationResult', () => {
  it('should calculate correct reduction', () => {
    const result = generateSimulationResult('test', 1000, 20);
    expect(result.reductionKg).toBe(200);
    expect(result.reductionPercent).toBe(20);
    expect(result.projectedAnnualKg).toBe(800);
  });

  it('should generate 12-month timeline', () => {
    const result = generateSimulationResult('test', 1000, 20);
    expect(result.timeline).toHaveLength(12);
  });

  it('should calculate tree equivalents', () => {
    const result = generateSimulationResult('test', 1000, 50);
    expect(result.equivalentTrees).toBeGreaterThan(0);
  });

  it('should calculate cost savings', () => {
    const result = generateSimulationResult('test', 1000, 50);
    expect(result.costSavings).toBeGreaterThan(0);
  });

  it('should include AI insight text', () => {
    const result = generateSimulationResult('test', 1000, 50);
    expect(result.aiInsight).toBeTruthy();
    expect(result.aiInsight.length).toBeGreaterThan(10);
  });
});
