/**
 * Co-located tests for the AI Coach service.
 * Tests keyword matching, response quality, and content generation.
 */
import { describe, it, expect } from 'vitest';
import { getCoachResponse, generateChallengeDescription, generateReportSummary } from './aiCoach';

describe('getCoachResponse — keyword matching', () => {
  it('returns reduction plan for "reduce"', async () => {
    const r = await getCoachResponse('How can I reduce my footprint?');
    expect(r.content).toContain('Reduction Plan');
    expect(r.suggestions.length).toBeGreaterThan(0);
  });
  it('returns reduction plan for "cut"', async () => {
    const r = await getCoachResponse('I want to cut my emissions');
    expect(r.content).toContain('Reduction Plan');
  });
  it('returns reduction plan for "lower"', async () => {
    const r = await getCoachResponse('how do I lower carbon?');
    expect(r.content).toContain('Reduction Plan');
  });
  it('returns comparison for "compare"', async () => {
    const r = await getCoachResponse('How do I compare to others?');
    expect(r.content).toContain('Compare');
  });
  it('returns comparison for "average"', async () => {
    const r = await getCoachResponse('Am I above the average?');
    expect(r.content).toContain('Compare');
  });
  it('returns comparison for "benchmark"', async () => {
    const r = await getCoachResponse('What is my benchmark?');
    expect(r.content).toContain('Compare');
  });
  it('returns weekly plan for "plan"', async () => {
    const r = await getCoachResponse('Create a plan for me');
    expect(r.content).toContain('Plan');
  });
  it('returns weekly plan for "schedule"', async () => {
    const r = await getCoachResponse('Give me a schedule');
    expect(r.content).toContain('Plan');
  });
  it('returns forecast for "forecast"', async () => {
    const r = await getCoachResponse('Show me my forecast');
    expect(r.content).toContain('Forecast');
  });
  it('returns forecast for "predict"', async () => {
    const r = await getCoachResponse('Can you predict my future emissions?');
    expect(r.content).toContain('Forecast');
  });
  it('returns default for unmatched input', async () => {
    const r = await getCoachResponse('hello there');
    expect(r.content).toBeTruthy();
    expect(r.suggestions.length).toBeGreaterThan(0);
  });
  it('all responses have non-empty content', async () => {
    const messages = ['reduce', 'compare', 'plan', 'forecast', 'hello'];
    for (const m of messages) {
      const r = await getCoachResponse(m);
      expect(r.content.length).toBeGreaterThan(10);
      expect(Array.isArray(r.suggestions)).toBe(true);
    }
  }, 10000);
});

describe('generateChallengeDescription', () => {
  it('returns transportation-specific description', () => {
    const d = generateChallengeDescription('transportation');
    expect(d.toLowerCase()).toContain('transportation');
  });
  it('returns food-specific description', () => {
    const d = generateChallengeDescription('food');
    expect(d.toLowerCase()).toContain('nutrition');
  });
  it('returns energy-specific description', () => {
    const d = generateChallengeDescription('energy');
    expect(d.toLowerCase()).toContain('energy');
  });
  it('returns personalized default for unknown category', () => {
    const d = generateChallengeDescription('unknown-category');
    expect(d.toLowerCase()).toContain('personalized');
  });
  it('returns non-empty string for all categories', () => {
    ['transportation', 'food', 'energy', 'anything'].forEach((cat) => {
      expect(generateChallengeDescription(cat).length).toBeGreaterThan(10);
    });
  });
});

describe('generateReportSummary', () => {
  it('uses "encouraging" for positive reduction', () => {
    expect(generateReportSummary(100, 15, 'transportation')).toContain('encouraging');
  });
  it('includes reduction percentage in output', () => {
    expect(generateReportSummary(100, 15, 'food')).toContain('15.0%');
  });
  it('uses "insightful" for zero/negative reduction', () => {
    expect(generateReportSummary(100, 0, 'energy')).toContain('insightful');
  });
  it('mentions top category', () => {
    expect(generateReportSummary(100, 5, 'transportation')).toContain('transportation');
  });
  it('includes total emissions value', () => {
    expect(generateReportSummary(250.5, 5, 'food')).toContain('250.5');
  });
  it('mentions Gemini AI for personalization cue', () => {
    expect(generateReportSummary(100, 5, 'food')).toContain('Gemini AI');
  });
});
