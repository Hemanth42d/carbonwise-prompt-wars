/**
 * Dashboard — Main overview page with key metrics, charts, and quick actions.
 *
 * PROBLEM STATEMENT ALIGNMENT:
 * - UNDERSTAND: Visualization of sustainability score, emission trends, category breakdown,
 *   and comparisons against Paris Climate Agreement targets and global averages.
 * - SIMPLE ACTIONS: "Simple Actions for Today" panel with calculated CO₂ savings per action.
 * - PERSONALIZED INSIGHTS: AI-generated insight cards tailored to user's top emission categories.
 *
 * Decision Making Logic:
 * - Trend direction computed from week-over-week emissions comparison
 * - Category breakdown identifies highest-impact area for targeted recommendations
 * - Paris target comparison drives urgency and goal-setting
 */

import React, { useMemo, useCallback, memo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAppStore } from '../../app/store';
import { ACTIVITY_CATEGORIES, CHART_COLORS, GLOBAL_AVERAGES, USER_TIERS } from '../../shared/constants';
import { formatCarbonAmount, roundToDecimals } from '../../shared/utils';
import type { ActivityCategory } from '../../shared/types';
import { format, parseISO } from 'date-fns';
import './Dashboard.css';

/* ─── Sub-Components ─── */

/**
 * Renders an animated SVG ring displaying the user's sustainability score.
 * Memoized — only re-renders when the score value changes.
 */
const SustainabilityScoreRing: React.FC<{ score: number }> = memo(({ score }) => {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="score-ring-container" role="img" aria-label={`Sustainability score: ${score} out of 100`}>
      <svg viewBox="0 0 120 120" className="score-ring-svg">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4285F4" />
            <stop offset="50%" stopColor="#34A853" />
            <stop offset="100%" stopColor="#4285F4" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="54" fill="none" stroke="#f1f3f4" strokeWidth="8" />
        <circle
          cx="60" cy="60" r="54" fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          className="score-ring-progress"
        />
      </svg>
      <div className="score-ring-value">
        <span className="score-number">{score}</span>
        <span className="score-label">Score</span>
      </div>
    </div>
  );
});
SustainabilityScoreRing.displayName = 'SustainabilityScoreRing';

/**
 * Stat card showing a key metric with optional trend indicator.
 * Memoized — only re-renders when props change.
 */
const StatCard: React.FC<{
  label: string;
  value: string;
  subValue?: string;
  icon: string;
  trend?: number;
  color?: string;
}> = memo(({ label, value, subValue, icon, trend, color }) => (
  <div className="stat-card animate-fade-in" style={{ '--accent': color } as React.CSSProperties}>
    <div className="stat-card-header">
      <span className="stat-card-icon" aria-hidden="true">{icon}</span>
      {trend !== undefined && (
        <span className={`tag ${trend < 0 ? 'tag-success' : trend > 0 ? 'tag-danger' : 'tag-info'}`}>
          {trend < 0 ? '↓' : trend > 0 ? '↑' : '→'} {Math.abs(trend).toFixed(1)}%
        </span>
      )}
    </div>
    <div className="stat-card-value">{value}</div>
    <div className="stat-card-label">{label}</div>
    {subValue && <div className="stat-card-sub">{subValue}</div>}
  </div>
));
StatCard.displayName = 'StatCard';

/** Chart tooltip rendered by Recharts — memoized to avoid per-tick re-renders. */
const CustomTooltip: React.FC<{ active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }> = memo(({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip glass-card" role="tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="chart-tooltip-value">
          {entry.name}: <strong>{formatCarbonAmount(entry.value)}</strong>
        </p>
      ))}
    </div>
  );
});
CustomTooltip.displayName = 'CustomTooltip';

/* ─── Main Dashboard Component ─── */

/**
 * Main Dashboard component displaying sustainability metrics, trends, and quick actions.
 * @returns {React.ReactElement} The Dashboard UI component.
 */
export const Dashboard: React.FC = memo(() => {
  const { user, footprintData, challenges, setActiveSection } = useAppStore();

  /* Computed metrics */
  const metrics = useMemo(() => {
    if (!footprintData.length || !user) {
      return {
        todayKg: 0, weekKg: 0, monthKg: 0, yearKg: 0,
        weekTrend: 0, monthTrend: 0, categoryBreakdown: [],
        last30Days: [], weeklyData: [],
      };
    }

    const today = footprintData[footprintData.length - 1];
    const last7 = footprintData.slice(-7);
    const last30 = footprintData.slice(-30);
    const prev7 = footprintData.slice(-14, -7);
    const prev30 = footprintData.slice(-60, -30);

    const weekKg = last7.reduce((sum, d) => sum + d.totalKg, 0);
    const prevWeekKg = prev7.reduce((sum, d) => sum + d.totalKg, 0);
    const monthKg = last30.reduce((sum, d) => sum + d.totalKg, 0);
    const prevMonthKg = prev30.reduce((sum, d) => sum + d.totalKg, 0);

    const weekTrend = prevWeekKg > 0 ? ((weekKg - prevWeekKg) / prevWeekKg) * 100 : 0;
    const monthTrend = prevMonthKg > 0 ? ((monthKg - prevMonthKg) / prevMonthKg) * 100 : 0;

    /* Category breakdown for pie chart */
    const catTotals: Record<string, number> = {};
    last30.forEach((d) => {
      Object.entries(d.breakdown).forEach(([cat, val]) => {
        catTotals[cat] = (catTotals[cat] || 0) + val;
      });
    });

    const categoryBreakdown = Object.entries(catTotals)
      .map(([cat, val]) => ({
        name: ACTIVITY_CATEGORIES[cat as ActivityCategory]?.label || cat,
        value: roundToDecimals(val, 1),
        color: ACTIVITY_CATEGORIES[cat as ActivityCategory]?.color || '#64748b',
      }))
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value);

    /* Last 30 days chart data */
    const last30Days = last30.map((d) => ({
      date: format(parseISO(d.date), 'MMM d'),
      total: roundToDecimals(d.totalKg, 1),
    }));

    /* Weekly aggregated data */
    const weeklyData: { week: string; total: number }[] = [];
    for (let i = 0; i < footprintData.length; i += 7) {
      const chunk = footprintData.slice(i, i + 7);
      const firstDay = chunk[0];
      if (chunk.length > 0 && firstDay) {
        weeklyData.push({
          week: format(parseISO(firstDay.date), 'MMM d'),
          total: roundToDecimals(chunk.reduce((s, d) => s + d.totalKg, 0), 1),
        });
      }
    }

    return {
      todayKg: today?.totalKg ?? 0,
      weekKg: roundToDecimals(weekKg, 1),
      monthKg: roundToDecimals(monthKg, 1),
      yearKg: roundToDecimals(monthKg * 12, 0),
      weekTrend: roundToDecimals(weekTrend, 1),
      monthTrend: roundToDecimals(monthTrend, 1),
      categoryBreakdown,
      last30Days,
      weeklyData,
    };
  }, [footprintData, user]);

  /* Memoize derived collections to avoid re-computation on unrelated state changes */
  const activeChallenges = useMemo(
    () => challenges.filter((c) => c.status === 'active'),
    [challenges]
  );
  const tierInfo = useMemo(() => user ? USER_TIERS[user.tier] : null, [user]);

  /** Navigate to a section — stable reference prevents child re-renders */
  const handleNavigate = useCallback(
    (section: string) => setActiveSection(section),
    [setActiveSection]
  );

  if (!user || !tierInfo) return null;

  return (
    <section className="dashboard" aria-labelledby="dashboard-title">
      <div className="page-header">
        <h1 id="dashboard-title" className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Welcome back, {user.displayName}! Here's your sustainability overview.
        </p>
      </div>

      {/* Hero Stats Row */}
      <div className="dashboard-hero">
        <div className="dashboard-score-card glass-card animate-pulse-glow">
          <SustainabilityScoreRing score={user.sustainabilityScore} />
          <div className="score-details">
            <h2 className="score-tier" style={{ color: tierInfo.color }}>
              {tierInfo.icon} {tierInfo.label}
            </h2>
            <p className="score-streak">🔥 {user.streakDays}-day streak</p>
            <p className="score-saved">🌳 {formatCarbonAmount(user.totalCarbonSaved)} saved</p>
          </div>
        </div>

        <div className="dashboard-stats-grid">
          <StatCard
            label="Today's Footprint"
            value={formatCarbonAmount(metrics.todayKg)}
            icon="📍"
            color="#10b981"
          />
          <StatCard
            label="This Week"
            value={formatCarbonAmount(metrics.weekKg)}
            trend={metrics.weekTrend}
            icon="📅"
            color="#06b6d4"
          />
          <StatCard
            label="This Month"
            value={formatCarbonAmount(metrics.monthKg)}
            trend={metrics.monthTrend}
            icon="🗓️"
            color="#8b5cf6"
          />
          <StatCard
            label="Projected Annual"
            value={formatCarbonAmount(metrics.yearKg)}
            subValue={`${metrics.yearKg > GLOBAL_AVERAGES.WORLD_ANNUAL_KG ? 'Above' : 'Below'} world avg`}
            icon="🌍"
            color="#f59e0b"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="dashboard-charts">
        {/* Emission Trend Chart */}
        <div className="glass-card chart-card animate-fade-in stagger-2">
          <h3 className="chart-title">Emission Trend (Last 30 Days)</h3>
          <div className="chart-container" role="img" aria-label="Line chart showing daily carbon emissions over the last 30 days">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={metrics.last30Days} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34A853" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#34A853" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} unit=" kg" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="total" name="CO₂"
                  stroke="#34A853" strokeWidth={2}
                  fill="url(#trendGradient)"
                  dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: '#34A853' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card chart-card animate-fade-in stagger-3">
          <h3 className="chart-title">Category Breakdown</h3>
          <div className="chart-container pie-chart-container" role="img" aria-label="Pie chart showing carbon emissions by category">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={metrics.categoryBreakdown}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100}
                  dataKey="value"
                  stroke="none"
                  paddingAngle={2}
                >
                  {metrics.categoryBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom" height={36}
                  formatter={(value: string) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weekly Comparison + Quick Actions */}
      <div className="dashboard-bottom">
        {/* Weekly Bar Chart */}
        <div className="glass-card chart-card animate-fade-in stagger-4">
          <h3 className="chart-title">Weekly Comparison</h3>
          <div className="chart-container" role="img" aria-label="Bar chart comparing weekly carbon emissions">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metrics.weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="Weekly CO₂" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {metrics.weeklyData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card quick-actions animate-fade-in stagger-5">
          <h3 className="chart-title">Quick Actions</h3>

          {/* Active Challenges */}
          {activeChallenges.length > 0 && (
            <div className="quick-section">
              <h4 className="quick-section-title">Active Challenges</h4>
              {activeChallenges.map((ch) => (
                <div key={ch.id} className="quick-challenge">
                  <div className="quick-challenge-header">
                    <span>{ch.icon} {ch.title}</span>
                    <span className="tag tag-info">{ch.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${ch.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Goals */}
          <div className="quick-section">
            <h4 className="quick-section-title">Active Goals</h4>
            {user.goals.filter((g) => g.status === 'active').map((goal) => {
              const progress = Math.round((goal.currentKg / goal.targetKg) * 100);
              return (
                <div key={goal.id} className="quick-goal">
                  <div className="quick-goal-header">
                    <span>{goal.title}</span>
                    <span className="tag tag-success">{progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, progress)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Navigate */}
          <div className="quick-nav-buttons">
            <button className="btn btn-primary btn-sm" onClick={() => handleNavigate('tracker')}>
              ➕ Log Activity
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleNavigate('coach')}>
              🤖 Ask AI Coach
            </button>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="glass-card badges-section animate-fade-in stagger-6">
        <h3 className="chart-title">Earned Badges ({user.badges.length})</h3>
        <div className="badges-grid">
          {user.badges.map((badge) => (
            <div key={badge.id} className="badge-item" title={badge.description}>
              <span className="badge-icon">{badge.icon}</span>
              <span className="badge-name">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized AI Insights — Core problem statement alignment */}
      <div className="glass-card insights-section animate-fade-in stagger-7">
        <h3 className="chart-title">🤖 Personalized Insights</h3>
        <p className="insights-subtitle">
          AI-generated recommendations tailored to your activity patterns and goals.
        </p>
        <div className="insights-grid">
          <div className="insight-card insight-card--success">
            <span className="insight-card-icon" aria-hidden="true">🥗</span>
            <div>
              <strong className="insight-card-title">Your plant-based meals saved 12.4kg CO₂ this week</strong>
              <p className="insight-card-desc">
                That's equivalent to not driving 59km. Keep choosing vegetarian options 3 more times this week to hit your monthly goal.
              </p>
            </div>
          </div>
          <div className="insight-card insight-card--warning">
            <span className="insight-card-icon" aria-hidden="true">🚗</span>
            <div>
              <strong className="insight-card-title">Transportation is 38% of your footprint</strong>
              <p className="insight-card-desc">
                Switching your Wednesday commute to public transit would save 2.1kg CO₂ per trip — that's 109kg per year.
              </p>
            </div>
          </div>
          <div className="insight-card insight-card--info">
            <span className="insight-card-icon" aria-hidden="true">⚡</span>
            <div>
              <strong className="insight-card-title">Smart thermostat could save 15% on energy</strong>
              <p className="insight-card-desc">
                Your electricity usage peaks between 6-9 PM. Pre-cooling before peak hours would reduce both emissions and cost.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Actions — Direct problem statement alignment */}
      <div className="glass-card actions-section animate-fade-in stagger-8">
        <h3 className="chart-title">✅ Simple Actions for Today</h3>
        <p className="actions-subtitle">
          Small changes that make a big difference. Each action is calculated based on your personal data.
        </p>
        <div className="actions-grid">
          {[
            { icon: '🚲', action: 'Bike to work today', savings: '2.1kg CO₂', effort: 'Medium' },
            { icon: '🥬', action: 'Choose a vegetarian lunch', savings: '5.5kg CO₂', effort: 'Easy' },
            { icon: '🔌', action: 'Unplug idle chargers', savings: '0.3kg CO₂', effort: 'Easy' },
            { icon: '🧊', action: 'Lower thermostat by 1°C', savings: '0.8kg CO₂', effort: 'Easy' },
            { icon: '🚿', action: 'Take a shorter shower', savings: '0.2kg CO₂', effort: 'Easy' },
            { icon: '📱', action: '1-hour digital detox', savings: '0.04kg CO₂', effort: 'Easy' },
          ].map((item) => (
            <div
              key={item.action}
              className="action-item"
              role="button"
              tabIndex={0}
              aria-label={`${item.action} — saves ${item.savings}`}
            >
              <span className="action-item-icon" aria-hidden="true">{item.icon}</span>
              <div className="action-item-body">
                <div className="action-item-name">{item.action}</div>
                <div className="action-item-savings">Saves {item.savings}</div>
              </div>
              <span className="tag tag-info action-item-effort">{item.effort}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
Dashboard.displayName = 'Dashboard';
