/**
 * AI Impact Simulator — Test "what-if" scenarios to visualize
 * carbon reduction, cost savings, and long-term impact.
 */

import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAppStore } from '../../app/store';
import { generateSimulationResult, formatCarbonAmount, kgToTrees, roundToDecimals } from '../../shared/utils';
import type { SimulationScenario, SimulationResult } from '../../shared/types';
import './Simulator.css';

const SCENARIOS: SimulationScenario[] = [
  {
    id: 'no-car', name: 'Go Car-Free', description: 'Replace all car trips with public transit, cycling, or walking.',
    icon: '🚗', changes: [{ category: 'transportation', factor: 0.2, description: 'Eliminate 80% of car emissions' }],
  },
  {
    id: 'vegetarian', name: 'Go Vegetarian', description: 'Switch from meat-based to a full vegetarian diet.',
    icon: '🥬', changes: [{ category: 'food', factor: 0.35, description: 'Reduce food emissions by 65%' }],
  },
  {
    id: 'vegan', name: 'Go Vegan', description: 'Adopt a completely plant-based diet for maximum food impact.',
    icon: '🌱', changes: [{ category: 'food', factor: 0.2, description: 'Reduce food emissions by 80%' }],
  },
  {
    id: 'solar', name: 'Switch to Solar', description: 'Install solar panels and switch to renewable electricity.',
    icon: '☀️', changes: [{ category: 'electricity', factor: 0.15, description: 'Reduce electricity emissions by 85%' }],
  },
  {
    id: 'ev', name: 'Electric Vehicle', description: 'Switch from a gas car to an electric vehicle.',
    icon: '⚡', changes: [{ category: 'transportation', factor: 0.4, description: 'Reduce transport emissions by 60%' }],
  },
  {
    id: 'remote', name: 'Work Remote', description: 'Eliminate daily commute by working from home full-time.',
    icon: '🏠', changes: [{ category: 'transportation', factor: 0.5, description: 'Cut commute emissions by 50%' }],
  },
  {
    id: 'flights', name: 'No Flights', description: 'Replace all flights with ground transportation or virtual meetings.',
    icon: '✈️', changes: [{ category: 'flights', factor: 0, description: 'Eliminate all flight emissions' }],
  },
  {
    id: 'minimalist', name: 'Minimalist Shopping', description: 'Reduce shopping to essentials only — buy second-hand.',
    icon: '🛍️', changes: [{ category: 'shopping', factor: 0.25, description: 'Reduce shopping emissions by 75%' }],
  },
];

export const Simulator: React.FC = () => {
  const { footprintData } = useAppStore();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [activeScenarios, setActiveScenarios] = useState<Set<string>>(new Set());

  const currentAnnualKg = useMemo(() => {
    if (!footprintData.length) return 4500;
    const last30 = footprintData.slice(-30);
    const monthlyAvg = last30.reduce((s, d) => s + d.totalKg, 0);
    return roundToDecimals(monthlyAvg * 12, 0);
  }, [footprintData]);

  const toggleScenario = (id: string) => {
    setActiveScenarios((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setSelectedScenario(id);
  };

  const combinedResult = useMemo(() => {
    if (activeScenarios.size === 0) return null;

    let totalReductionPercent = 0;
    activeScenarios.forEach((id) => {
      const scenario = SCENARIOS.find((s) => s.id === id);
      if (scenario) {
        scenario.changes.forEach((change) => {
          totalReductionPercent += (1 - change.factor) * 20; // approximate
        });
      }
    });

    totalReductionPercent = Math.min(90, totalReductionPercent);
    return generateSimulationResult('combined', currentAnnualKg, totalReductionPercent);
  }, [activeScenarios, currentAnnualKg]);

  const singleResult = useMemo(() => {
    if (!selectedScenario) return null;
    const scenario = SCENARIOS.find((s) => s.id === selectedScenario);
    if (!scenario) return null;
    const reductionPercent = scenario.changes.reduce((sum, ch) => sum + (1 - ch.factor) * 25, 0);
    return generateSimulationResult(selectedScenario, currentAnnualKg, Math.min(85, reductionPercent));
  }, [selectedScenario, currentAnnualKg]);

  const displayResult = combinedResult || singleResult;

  return (
    <section className="simulator" aria-labelledby="simulator-title">
      <div className="page-header">
        <h1 id="simulator-title" className="page-title">Impact Simulator</h1>
        <p className="page-subtitle">
          Test "what-if" scenarios to see how lifestyle changes could reduce your carbon footprint.
        </p>
      </div>

      {/* Current Baseline */}
      <div className="glass-card simulator-baseline animate-fade-in">
        <div className="baseline-info">
          <span className="baseline-label">Your Current Annual Footprint</span>
          <span className="baseline-value">{formatCarbonAmount(currentAnnualKg)}</span>
        </div>
        <div className="baseline-comparison">
          <span className="baseline-vs">vs World Average: {formatCarbonAmount(4700)}</span>
        </div>
      </div>

      {/* Scenario Grid */}
      <h3 className="section-title">Select Scenarios to Simulate</h3>
      <div className="scenario-grid">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            className={`glass-card scenario-card ${activeScenarios.has(scenario.id) ? 'active' : ''}`}
            onClick={() => toggleScenario(scenario.id)}
            aria-pressed={activeScenarios.has(scenario.id)}
          >
            <span className="scenario-icon" aria-hidden="true">{scenario.icon}</span>
            <span className="scenario-name">{scenario.name}</span>
            <span className="scenario-desc">{scenario.description}</span>
            {activeScenarios.has(scenario.id) && (
              <span className="scenario-check" aria-label="Selected">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      {displayResult && (
        <div className="simulator-results animate-slide-up">
          {/* Impact Summary */}
          <div className="grid-4" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="stat-card">
              <div className="stat-card-icon" aria-hidden="true">📉</div>
              <div className="stat-card-value text-success">-{formatCarbonAmount(displayResult.reductionKg)}</div>
              <div className="stat-card-label">Annual Reduction</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" aria-hidden="true">📊</div>
              <div className="stat-card-value text-success">-{displayResult.reductionPercent}%</div>
              <div className="stat-card-label">Percent Reduction</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" aria-hidden="true">💰</div>
              <div className="stat-card-value">${displayResult.costSavings}</div>
              <div className="stat-card-label">Est. Cost Savings</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" aria-hidden="true">🌳</div>
              <div className="stat-card-value">{displayResult.equivalentTrees}</div>
              <div className="stat-card-label">Equivalent Trees</div>
            </div>
          </div>

          {/* Comparison Chart */}
          <div className="glass-card chart-card">
            <h3 className="chart-title">Monthly Impact Comparison</h3>
            <div className="chart-container" role="img" aria-label="Chart comparing current vs projected monthly emissions">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={displayResult.timeline} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EA4335" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#EA4335" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34A853" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#34A853" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} unit=" kg" />
                  <Tooltip
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #dadce0',
                      borderRadius: '10px',
                      color: '#202124',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone" dataKey="currentKg" name="Current"
                    stroke="#EA4335" strokeWidth={2}
                    fill="url(#currentGrad)"
                    dot={false}
                  />
                  <Area
                    type="monotone" dataKey="projectedKg" name="After Changes"
                    stroke="#34A853" strokeWidth={2}
                    fill="url(#projectedGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insight */}
          <div className="glass-card ai-insight animate-fade-in">
            <div className="ai-insight-header">
              <span className="ai-badge">🤖 Gemini AI Analysis</span>
            </div>
            <p className="ai-insight-text">{displayResult.aiInsight}</p>
            <p className="ai-insight-text" style={{ color: 'var(--text-muted)' }}>
              These projections are based on your historical data and standard emission factors.
              Actual results may vary based on location, lifestyle, and energy grid composition.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
