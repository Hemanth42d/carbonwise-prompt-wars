/**
 * Tests for AI Coach Service — context-aware sustainability coaching.
 * Validates intent detection, data summarization, and response personalization.
 */
import { describe, it, expect } from 'vitest';
import {
  getCoachResponse,
  detectIntent,
  summarizeFootprint,
  generateChallengeDescription,
  generateReportSummary,
} from './aiCoach';
import type { UserContext } from './aiCoach';
import type { DailyFootprint, ActivityCategory, User } from '../shared/types';

/* ─── Test Helpers ─── */

function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'test-user',
    email: 'test@eco.ai',
    displayName: 'Test User',
    photoURL: '',
    joinedAt: '2025-09-15',
    sustainabilityScore: 72,
    totalCarbonSaved: 1200,
    streakDays: 15,
    badges: [],
    goals: [
      { id: 'g1', title: 'Reduce 20%', description: '', targetKg: 100, currentKg: 50, deadline: '2026-12-01', status: 'active', category: 'overall' },
      { id: 'g2', title: 'Vegan month', description: '', targetKg: 50, currentKg: 50, deadline: '2026-05-01', status: 'completed', category: 'food' },
    ],
    tier: 'sapling',
    ...overrides,
  };
}

function createMockFootprint(days: number): DailyFootprint[] {
  const data: DailyFootprint[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const totalKg = 8 + Math.sin(i / 7) * 2;
    const breakdown: Record<ActivityCategory, number> = {
      transportation: totalKg * 0.35,
      flights: 0,
      electricity: totalKg * 0.2,
      food: totalKg * 0.3,
      shopping: totalKg * 0.05,
      water: totalKg * 0.03,
      digital: totalKg * 0.07,
    };
    data.push({
      date: date.toISOString().slice(0, 10),
      totalKg,
      breakdown,
    });
  }
  return data;
}

function createMockContext(): UserContext {
  return {
    user: createMockUser(),
    footprintData: createMockFootprint(90),
  };
}

/* ─── Intent Detection Tests ─── */

describe('detectIntent', () => {
  it('detects "reduce" intent', () => {
    expect(detectIntent('How can I reduce my footprint?')).toBe('reduce');
  });

  it('detects "reduce" from synonym "cut"', () => {
    expect(detectIntent('help me cut emissions')).toBe('reduce');
  });

  it('detects "reduce" from synonym "lower"', () => {
    expect(detectIntent('I want to lower my carbon')).toBe('reduce');
  });

  it('detects "compare" intent', () => {
    expect(detectIntent('Compare me to global averages')).toBe('compare');
  });

  it('detects "compare" from "benchmark"', () => {
    expect(detectIntent('Show me benchmarks')).toBe('compare');
  });

  it('detects "plan" intent', () => {
    expect(detectIntent('Create a weekly plan')).toBe('plan');
  });

  it('detects "plan" from "schedule"', () => {
    expect(detectIntent('Help me schedule eco actions')).toBe('plan');
  });

  it('detects "forecast" intent', () => {
    expect(detectIntent('What is my carbon forecast?')).toBe('forecast');
  });

  it('detects "forecast" from "predict"', () => {
    expect(detectIntent('predict my future emissions')).toBe('forecast');
  });

  it('detects "tips" intent', () => {
    expect(detectIntent('Give me some tips')).toBe('tips');
  });

  it('detects "tips" from "suggest"', () => {
    expect(detectIntent('Can you suggest improvements?')).toBe('tips');
  });

  it('falls back to "general" for unmatched', () => {
    expect(detectIntent('Hello there!')).toBe('general');
  });

  it('is case-insensitive', () => {
    expect(detectIntent('REDUCE MY FOOTPRINT')).toBe('reduce');
  });
});

/* ─── Data Summarization Tests ─── */

describe('summarizeFootprint', () => {
  it('returns defaults for empty data', () => {
    const summary = summarizeFootprint([]);
    expect(summary.daysTracked).toBe(0);
    expect(summary.dailyAvgKg).toBeGreaterThan(0);
  });

  it('computes correct daily average', () => {
    const data = createMockFootprint(30);
    const summary = summarizeFootprint(data);
    expect(summary.dailyAvgKg).toBeGreaterThan(0);
    expect(summary.daysTracked).toBe(30);
  });

  it('identifies the top emission category', () => {
    const data = createMockFootprint(30);
    const summary = summarizeFootprint(data);
    expect(['transportation', 'food', 'electricity']).toContain(summary.topCategory);
    expect(summary.topCategoryPercent).toBeGreaterThan(0);
    expect(summary.topCategoryPercent).toBeLessThanOrEqual(100);
  });

  it('calculates annual projection', () => {
    const data = createMockFootprint(30);
    const summary = summarizeFootprint(data);
    expect(summary.annualProjectedKg).toBeGreaterThan(summary.monthlyTotalKg);
    expect(summary.annualProjectedKg).toBe(Math.round(summary.monthlyTotalKg * 12));
  });

  it('detects trend direction', () => {
    const data = createMockFootprint(30);
    const summary = summarizeFootprint(data);
    expect(['improving', 'stable', 'worsening']).toContain(summary.trendDirection);
  });
});

/* ─── Context-Aware Response Tests ─── */

describe('getCoachResponse', () => {
  const ctx = createMockContext();

  it('returns reduction plan for "reduce" keyword', async () => {
    const response = await getCoachResponse('How can I reduce my footprint?', ctx);
    expect(response.content).toContain('Reduction Plan');
    expect(response.content).toContain('kg'); // contains actual data
    expect(response.suggestions).toHaveLength(4);
  });

  it('returns personalized comparison for "compare"', async () => {
    const response = await getCoachResponse('Compare me to others', ctx);
    expect(response.content).toContain('How You Compare');
    expect(response.content).toContain('US Average');
    expect(response.content).toContain('Paris Target');
  });

  it('returns weekly plan for "plan"', async () => {
    const response = await getCoachResponse('Create a weekly plan', ctx);
    expect(response.content).toContain('Weekly Eco-Plan');
    expect(response.content).toContain('Monday');
  });

  it('returns forecast for "forecast"', async () => {
    const response = await getCoachResponse('What is my forecast?', ctx);
    expect(response.content).toContain('Forecast');
    expect(response.content).toContain('Days of Data');
  });

  it('returns tips for "suggest"', async () => {
    const response = await getCoachResponse('Can you suggest improvements?', ctx);
    expect(response.content).toContain('Sustainability Tips');
    expect(response.content).toContain('score');
  });

  it('returns context-aware default for unmatched', async () => {
    const response = await getCoachResponse('Hello!', ctx);
    expect(response.content).toContain('Footprint Summary');
    expect(response.suggestions.length).toBeGreaterThan(0);
  });

  it('works without user context (graceful degradation)', async () => {
    const response = await getCoachResponse('reduce my footprint');
    expect(response.content.length).toBeGreaterThan(50);
    expect(response.suggestions.length).toBeGreaterThan(0);
  });

  it('all responses have non-empty content and suggestions', async () => {
    const intents = ['reduce', 'compare', 'plan', 'forecast', 'suggest', 'hello'];
    for (const msg of intents) {
      const res = await getCoachResponse(msg, ctx);
      expect(res.content.length).toBeGreaterThan(50);
      expect(res.suggestions.length).toBeGreaterThanOrEqual(3);
    }
  }, 15000);

  it('personalizes response with user streak data', async () => {
    const customCtx: UserContext = {
      user: createMockUser({ streakDays: 30 }),
      footprintData: createMockFootprint(90),
    };
    const response = await getCoachResponse('reduce my footprint', customCtx);
    expect(response.content).toContain('30-day streak');
  });

  it('includes user sustainability score in tips', async () => {
    const response = await getCoachResponse('give me tips', ctx);
    expect(response.content).toContain('72');
  });
});

/* ─── Utility Function Tests ─── */

describe('generateChallengeDescription', () => {
  it('returns transportation description', () => {
    const desc = generateChallengeDescription('transportation');
    expect(desc).toContain('commute patterns');
  });

  it('returns food description', () => {
    const desc = generateChallengeDescription('food');
    expect(desc).toContain('dietary tracking');
  });

  it('returns energy description', () => {
    const desc = generateChallengeDescription('energy');
    expect(desc).toContain('energy usage');
  });

  it('returns default for unknown category', () => {
    const desc = generateChallengeDescription('unknown');
    expect(desc).toContain('personalized');
  });
});

describe('generateReportSummary', () => {
  it('generates encouraging summary for positive reduction', () => {
    const summary = generateReportSummary(300, 15.5, 'transportation');
    expect(summary).toContain('encouraging');
    expect(summary).toContain('15.5%');
    expect(summary).toContain('transportation');
  });

  it('generates insightful summary for zero reduction', () => {
    const summary = generateReportSummary(500, 0, 'food');
    expect(summary).toContain('insightful');
    expect(summary).toContain('areas identified');
  });

  it('includes total emissions in summary', () => {
    const summary = generateReportSummary(123.4, 5, 'electricity');
    expect(summary).toContain('123.4');
  });
});
