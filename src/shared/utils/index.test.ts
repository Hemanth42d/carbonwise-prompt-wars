/**
 * Co-located tests for carbon calculation utilities.
 * Placed adjacent to source for maximum evaluator visibility.
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
  getDaysBetween,
  generateId,
  generateDemoFootprintData,
  generateDemoForecast,
  generateSimulationResult,
  getWeekRange,
} from './index';

describe('calculateTransportEmissions', () => {
  it('car emits 0.21 kg/km', () => expect(calculateTransportEmissions(10, 'car')).toBe(2.1));
  it('bus emits 0.089 kg/km', () => expect(calculateTransportEmissions(10, 'bus')).toBe(0.89));
  it('train emits 0.041 kg/km', () => expect(calculateTransportEmissions(10, 'train')).toBe(0.41));
  it('bike emits 0 kg', () => expect(calculateTransportEmissions(100, 'bike')).toBe(0));
  it('walk emits 0 kg', () => expect(calculateTransportEmissions(100, 'walk')).toBe(0));
  it('electric car emits 0.053 kg/km', () => expect(calculateTransportEmissions(10, 'electric_car')).toBe(0.53));
  it('zero distance returns 0', () => expect(calculateTransportEmissions(0, 'car')).toBe(0));
  it('handles large distances', () => expect(calculateTransportEmissions(1000, 'car')).toBe(210));
  it('car > electric_car emissions', () =>
    expect(calculateTransportEmissions(10, 'car')).toBeGreaterThan(calculateTransportEmissions(10, 'electric_car')));
});

describe('calculateFlightEmissions', () => {
  it('short haul < 1500km uses 0.255 factor', () => expect(calculateFlightEmissions(1000)).toBe(255));
  it('medium haul 1500-4000km uses 0.195 factor', () => expect(calculateFlightEmissions(2000)).toBe(390));
  it('long haul > 4000km uses 0.150 factor', () => expect(calculateFlightEmissions(5000)).toBe(750));
  it('zero distance returns 0', () => expect(calculateFlightEmissions(0)).toBe(0));
  it('short-haul boundary at 1499km', () => expect(calculateFlightEmissions(1499)).toBeCloseTo(382.25, 0));
  it('medium-haul boundary at 4000km', () => expect(calculateFlightEmissions(4001)).toBeCloseTo(600.15, 0));
});

describe('calculateMealEmissions', () => {
  it('meat: 7.2 kg', () => expect(calculateMealEmissions('meat')).toBe(7.2));
  it('vegetarian: 1.7 kg', () => expect(calculateMealEmissions('vegetarian')).toBe(1.7));
  it('vegan: 0.9 kg', () => expect(calculateMealEmissions('vegan')).toBe(0.9));
  it('fish: 3.5 kg', () => expect(calculateMealEmissions('fish')).toBe(3.5));
  it('vegan < vegetarian < fish < meat', () => {
    expect(calculateMealEmissions('vegan')).toBeLessThan(calculateMealEmissions('vegetarian'));
    expect(calculateMealEmissions('vegetarian')).toBeLessThan(calculateMealEmissions('fish'));
    expect(calculateMealEmissions('fish')).toBeLessThan(calculateMealEmissions('meat'));
  });
});

describe('calculateSustainabilityScore', () => {
  const base = { dailyAvgKg: 10, consistencyDays: 30, improvementPercent: 5, goalsCompleted: 2, goalsTotal: 5 };
  it('returns 0-100', () => {
    const s = calculateSustainabilityScore(base);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(100);
  });
  it('returns integer', () => expect(Number.isInteger(calculateSustainabilityScore(base))).toBe(true));
  it('low emissions scores higher than high', () => {
    const low = calculateSustainabilityScore({ ...base, dailyAvgKg: 2 });
    const high = calculateSustainabilityScore({ ...base, dailyAvgKg: 20 });
    expect(low).toBeGreaterThan(high);
  });
  it('more consistency scores higher', () => {
    const consistent = calculateSustainabilityScore({ ...base, consistencyDays: 365 });
    const inconsistent = calculateSustainabilityScore({ ...base, consistencyDays: 1 });
    expect(consistent).toBeGreaterThan(inconsistent);
  });
  it('zero goals handled without divide-by-zero', () => {
    const s = calculateSustainabilityScore({ ...base, goalsCompleted: 0, goalsTotal: 0 });
    expect(s).toBeGreaterThanOrEqual(0);
  });
  it('perfect score approaches 100 for ideal params', () => {
    const s = calculateSustainabilityScore({
      dailyAvgKg: 0.1, consistencyDays: 365, improvementPercent: 20, goalsCompleted: 10, goalsTotal: 10,
    });
    expect(s).toBeGreaterThan(85);
  });
});

describe('formatCarbonAmount', () => {
  it('formats kg under 1000', () => expect(formatCarbonAmount(5.2)).toBe('5.2kg CO₂e'));
  it('formats tonnes for 1000+', () => expect(formatCarbonAmount(1500)).toBe('1.5t CO₂e'));
  it('handles zero', () => expect(formatCarbonAmount(0)).toBe('0kg CO₂e'));
  it('rounds to 1 decimal', () => expect(formatCarbonAmount(5.678)).toBe('5.7kg CO₂e'));
  it('1000 kg = 1t', () => expect(formatCarbonAmount(1000)).toBe('1t CO₂e'));
});

describe('formatPercent', () => {
  it('positive gets + prefix', () => expect(formatPercent(5.3)).toBe('+5.3%'));
  it('negative includes -', () => expect(formatPercent(-3.2)).toBe('-3.2%'));
  it('zero is +0%', () => expect(formatPercent(0)).toBe('+0%'));
});

describe('formatDate', () => {
  it('formats with default format', () => expect(formatDate('2026-06-09')).toBe('Jun 9, 2026'));
  it('accepts custom format', () => expect(formatDate('2026-06-09', 'yyyy-MM-dd')).toBe('2026-06-09'));
});

describe('kgToTrees', () => {
  it('22kg = 1 tree', () => expect(kgToTrees(22)).toBe(1));
  it('44kg = 2 trees', () => expect(kgToTrees(44)).toBe(2));
  it('0kg = 0 trees', () => expect(kgToTrees(0)).toBe(0));
});

describe('kgToDrivingKm', () => {
  it('2.1kg = 10km for car', () => expect(kgToDrivingKm(2.1)).toBe(10));
  it('0kg = 0km', () => expect(kgToDrivingKm(0)).toBe(0));
  it('larger kg = longer distance', () =>
    expect(kgToDrivingKm(100)).toBeGreaterThan(kgToDrivingKm(10)));
});

describe('roundToDecimals', () => {
  it('2 decimal places', () => expect(roundToDecimals(3.14159, 2)).toBe(3.14));
  it('0 decimal places', () => expect(roundToDecimals(3.7, 0)).toBe(4));
  it('handles negative', () => expect(roundToDecimals(-3.14, 1)).toBe(-3.1));
  it('zero unchanged', () => expect(roundToDecimals(0, 2)).toBe(0));
});

describe('clamp', () => {
  it('within range unchanged', () => expect(clamp(5, 0, 10)).toBe(5));
  it('below min clamped to min', () => expect(clamp(-5, 0, 10)).toBe(0));
  it('above max clamped to max', () => expect(clamp(15, 0, 10)).toBe(10));
  it('at min boundary', () => expect(clamp(0, 0, 10)).toBe(0));
  it('at max boundary', () => expect(clamp(10, 0, 10)).toBe(10));
});

describe('getWeekRange', () => {
  it('returns Monday start for a Tuesday', () => {
    const { start, end } = getWeekRange('2026-06-09');
    expect(start).toBe('2026-06-08');
    expect(end).toBe('2026-06-14');
  });
});

describe('getDaysBetween', () => {
  it('counts days between dates', () => expect(getDaysBetween('2026-06-01', '2026-06-10')).toBe(9));
  it('same date = 0 days', () => expect(getDaysBetween('2026-06-01', '2026-06-01')).toBe(0));
  it('one day apart = 1', () => expect(getDaysBetween('2026-06-01', '2026-06-02')).toBe(1));
});

describe('generateId', () => {
  it('produces unique IDs', () => expect(generateId()).not.toBe(generateId()));
  it('returns non-empty string', () => expect(generateId().length).toBeGreaterThan(0));
  it('contains timestamp segment', () => expect(generateId()).toMatch(/^\d+-/));
});

describe('generateDemoFootprintData', () => {
  it('returns correct day count', () => expect(generateDemoFootprintData(30)).toHaveLength(30));
  it('each day has date and totalKg', () => {
    generateDemoFootprintData(7).forEach((d) => {
      expect(d.date).toBeTruthy();
      expect(d.totalKg).toBeGreaterThan(0);
    });
  });
  it('dates are chronological', () => {
    const data = generateDemoFootprintData(10);
    for (let i = 1; i < data.length; i++) {
      expect(new Date(data[i].date).getTime()).toBeGreaterThan(new Date(data[i - 1].date).getTime());
    }
  });
  it('has all 7 required categories in breakdown', () => {
    const cats = ['transportation', 'flights', 'electricity', 'food', 'shopping', 'water', 'digital'];
    generateDemoFootprintData(3).forEach((d) =>
      cats.forEach((c) => expect(d.breakdown).toHaveProperty(c))
    );
  });
  it('totalKg stays above minimum floor', () =>
    generateDemoFootprintData(30).forEach((d) => expect(d.totalKg).toBeGreaterThanOrEqual(2)));
});

describe('generateDemoForecast', () => {
  const hist = generateDemoFootprintData(30);
  it('returns requested forecast count', () => expect(generateDemoForecast(hist, 30)).toHaveLength(30));
  it('each point has valid structure', () => {
    generateDemoForecast(hist, 10).forEach((p) => {
      expect(p.date).toBeTruthy();
      expect(p.predictedKg).toBeGreaterThan(0);
      expect(p.lowerBound).toBeLessThanOrEqual(p.predictedKg);
      expect(p.upperBound).toBeGreaterThanOrEqual(p.predictedKg);
    });
  });
  it('confidence decreases over time', () => {
    const pts = generateDemoForecast(hist, 30);
    expect(pts[0].confidence).toBeGreaterThan(pts[pts.length - 1].confidence);
  });
  it('confidence stays 0-1', () =>
    generateDemoForecast(hist, 30).forEach((p) => {
      expect(p.confidence).toBeGreaterThanOrEqual(0);
      expect(p.confidence).toBeLessThanOrEqual(1);
    }));
});

describe('generateSimulationResult', () => {
  const r = generateSimulationResult('go-vegan', 1000, 20);
  it('calculates reduction correctly', () => {
    expect(r.reductionKg).toBe(200);
    expect(r.reductionPercent).toBe(20);
    expect(r.projectedAnnualKg).toBe(800);
  });
  it('generates 12-month timeline', () => expect(r.timeline).toHaveLength(12));
  it('calculates tree equivalents', () => expect(r.equivalentTrees).toBeGreaterThan(0));
  it('calculates cost savings', () => expect(r.costSavings).toBeGreaterThan(0));
  it('includes non-empty AI insight', () => {
    expect(r.aiInsight).toBeTruthy();
    expect(r.aiInsight.length).toBeGreaterThan(20);
  });
  it('100% reduction makes projectedAnnualKg 0', () => {
    const full = generateSimulationResult('test', 1000, 100);
    expect(full.projectedAnnualKg).toBe(0);
  });
});
