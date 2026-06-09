/**
 * Tests for AI Coach service — keyword matching and response quality.
 */
import { describe, it, expect } from 'vitest';
import { getCoachResponse, generateChallengeDescription, generateReportSummary } from '../services/aiCoach';

describe('getCoachResponse', () => {
  it('should return reduction plan for "reduce" keyword', async () => {
    const res = await getCoachResponse('How can I reduce my footprint?');
    expect(res.content).toContain('Reduction Plan');
    expect(res.suggestions.length).toBeGreaterThan(0);
  });

  it('should return comparison for "compare" keyword', async () => {
    const res = await getCoachResponse('How do I compare to others?');
    expect(res.content).toContain('Compare');
    expect(res.suggestions.length).toBeGreaterThan(0);
  });

  it('should return weekly plan for "plan" keyword', async () => {
    const res = await getCoachResponse('Create a weekly plan');
    expect(res.content).toContain('Plan');
    expect(res.suggestions.length).toBeGreaterThan(0);
  });

  it('should return forecast for "forecast" keyword', async () => {
    const res = await getCoachResponse('Show me my forecast');
    expect(res.content).toContain('Forecast');
    expect(res.suggestions.length).toBeGreaterThan(0);
  });

  it('should return default for unmatched input', async () => {
    const res = await getCoachResponse('hello');
    expect(res.content).toBeTruthy();
    expect(res.suggestions.length).toBeGreaterThan(0);
  });
});

describe('generateChallengeDescription', () => {
  it('should return transportation description', () => {
    const desc = generateChallengeDescription('transportation');
    expect(desc).toContain('transportation');
  });

  it('should return default for unknown category', () => {
    const desc = generateChallengeDescription('unknown');
    expect(desc).toContain('personalized');
  });
});

describe('generateReportSummary', () => {
  it('should generate positive summary for reduction', () => {
    const summary = generateReportSummary(100, 15, 'transportation');
    expect(summary).toContain('encouraging');
    expect(summary).toContain('15.0%');
  });

  it('should generate neutral summary for no reduction', () => {
    const summary = generateReportSummary(100, 0, 'food');
    expect(summary).toContain('insightful');
  });
});
