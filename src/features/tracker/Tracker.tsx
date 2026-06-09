/**
 * Carbon Tracker — Log activities, view daily/weekly/monthly emissions,
 * and track trends across all carbon categories.
 */

import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useAppStore } from '../../app/store';
import { ACTIVITY_CATEGORIES, EMISSION_FACTORS } from '../../shared/constants';
import { formatCarbonAmount, roundToDecimals } from '../../shared/utils';
import type { ActivityCategory } from '../../shared/types';
import { format, parseISO } from 'date-fns';
import './Tracker.css';

type TimePeriod = 'daily' | 'weekly' | 'monthly';

interface ActivityFormData {
  category: ActivityCategory;
  subcategory: string;
  description: string;
  amount: number;
}

const SUBCATEGORIES: Record<ActivityCategory, { label: string; unit: string; factor: number }[]> = {
  transportation: [
    { label: 'Car (km)', unit: 'km', factor: EMISSION_FACTORS.CAR_PER_KM },
    { label: 'Bus (km)', unit: 'km', factor: EMISSION_FACTORS.BUS_PER_KM },
    { label: 'Train (km)', unit: 'km', factor: EMISSION_FACTORS.TRAIN_PER_KM },
    { label: 'Electric Car (km)', unit: 'km', factor: EMISSION_FACTORS.ELECTRIC_CAR_PER_KM },
    { label: 'Bicycle (km)', unit: 'km', factor: EMISSION_FACTORS.BIKE_PER_KM },
  ],
  flights: [
    { label: 'Short-haul (<1500km)', unit: 'km', factor: EMISSION_FACTORS.FLIGHT_SHORT_PER_KM },
    { label: 'Medium-haul (1500-4000km)', unit: 'km', factor: EMISSION_FACTORS.FLIGHT_MEDIUM_PER_KM },
    { label: 'Long-haul (>4000km)', unit: 'km', factor: EMISSION_FACTORS.FLIGHT_LONG_PER_KM },
  ],
  electricity: [
    { label: 'Grid Electricity (kWh)', unit: 'kWh', factor: EMISSION_FACTORS.ELECTRICITY_PER_KWH },
    { label: 'Natural Gas (kWh)', unit: 'kWh', factor: EMISSION_FACTORS.NATURAL_GAS_PER_KWH },
    { label: 'Solar (kWh)', unit: 'kWh', factor: EMISSION_FACTORS.SOLAR_PER_KWH },
  ],
  food: [
    { label: 'Meat Meal', unit: 'meals', factor: EMISSION_FACTORS.MEAL_MEAT },
    { label: 'Fish Meal', unit: 'meals', factor: EMISSION_FACTORS.MEAL_FISH },
    { label: 'Vegetarian Meal', unit: 'meals', factor: EMISSION_FACTORS.MEAL_VEGETARIAN },
    { label: 'Vegan Meal', unit: 'meals', factor: EMISSION_FACTORS.MEAL_VEGAN },
  ],
  shopping: [
    { label: 'Clothing Item', unit: 'items', factor: EMISSION_FACTORS.CLOTHING_ITEM },
    { label: 'Electronics', unit: 'items', factor: EMISSION_FACTORS.ELECTRONICS_ITEM },
    { label: 'Furniture', unit: 'items', factor: EMISSION_FACTORS.FURNITURE_ITEM },
  ],
  water: [
    { label: 'Water (liters)', unit: 'L', factor: EMISSION_FACTORS.WATER_PER_LITER },
    { label: 'Shower (minutes)', unit: 'min', factor: EMISSION_FACTORS.SHOWER_PER_MINUTE },
  ],
  digital: [
    { label: 'Streaming (hours)', unit: 'hrs', factor: EMISSION_FACTORS.STREAMING_PER_HOUR },
    { label: 'Cloud Storage (GB)', unit: 'GB', factor: EMISSION_FACTORS.CLOUD_STORAGE_PER_GB },
  ],
};

export const Tracker: React.FC = () => {
  const { footprintData, addActivity } = useAppStore();
  const [period, setPeriod] = useState<TimePeriod>('daily');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ActivityFormData>({
    category: 'transportation',
    subcategory: 'Car (km)',
    description: '',
    amount: 0,
  });

  const chartData = useMemo(() => {
    if (!footprintData.length) return [];
    switch (period) {
      case 'daily':
        return footprintData.slice(-14).map((d) => ({
          label: format(parseISO(d.date), 'MMM d'),
          value: roundToDecimals(d.totalKg, 1),
          ...d.breakdown,
        }));
      case 'weekly': {
        const weeks: { label: string; value: number }[] = [];
        for (let i = 0; i < footprintData.length; i += 7) {
          const chunk = footprintData.slice(i, i + 7);
          weeks.push({
            label: format(parseISO(chunk[0].date), 'MMM d'),
            value: roundToDecimals(chunk.reduce((s, d) => s + d.totalKg, 0), 1),
          });
        }
        return weeks.slice(-12);
      }
      case 'monthly': {
        const months: Map<string, number> = new Map();
        footprintData.forEach((d) => {
          const key = format(parseISO(d.date), 'MMM yyyy');
          months.set(key, (months.get(key) || 0) + d.totalKg);
        });
        return Array.from(months.entries()).map(([label, value]) => ({
          label,
          value: roundToDecimals(value, 1),
        }));
      }
    }
  }, [footprintData, period]);

  /* Category totals for the selected period */
  const categoryTotals = useMemo(() => {
    const periodData = period === 'daily'
      ? footprintData.slice(-1)
      : period === 'weekly'
        ? footprintData.slice(-7)
        : footprintData.slice(-30);

    const totals: Partial<Record<ActivityCategory, number>> = {};
    periodData.forEach((d) => {
      (Object.entries(d.breakdown) as [ActivityCategory, number][]).forEach(([cat, val]) => {
        totals[cat] = (totals[cat] || 0) + val;
      });
    });

    return Object.entries(totals)
      .map(([cat, val]) => ({
        category: cat as ActivityCategory,
        value: roundToDecimals(val!, 1),
        info: ACTIVITY_CATEGORIES[cat as ActivityCategory],
      }))
      .sort((a, b) => b.value - a.value);
  }, [footprintData, period]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subcats = SUBCATEGORIES[formData.category];
    const subcat = subcats.find((s) => s.label === formData.subcategory);
    const carbonKg = formData.amount * (subcat?.factor ?? 0);

    addActivity({
      category: formData.category,
      subcategory: formData.subcategory,
      description: formData.description || formData.subcategory,
      carbonKg: roundToDecimals(carbonKg, 2),
      date: new Date().toISOString(),
      metadata: { amount: formData.amount },
    });

    setShowForm(false);
    setFormData({ category: 'transportation', subcategory: 'Car (km)', description: '', amount: 0 });
  };

  return (
    <section className="tracker" aria-labelledby="tracker-title">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 id="tracker-title" className="page-title">Carbon Tracker</h1>
          <p className="page-subtitle">Track and monitor your daily carbon emissions across all categories.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '➕ Log Activity'}
        </button>
      </div>

      {/* Log Activity Form */}
      {showForm && (
        <form className="glass-card activity-form animate-slide-up" onSubmit={handleSubmit}>
          <h3 className="chart-title">Log New Activity</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="activity-category" className="form-label">Category</label>
              <select
                id="activity-category"
                className="input"
                value={formData.category}
                onChange={(e) => {
                  const cat = e.target.value as ActivityCategory;
                  setFormData({ ...formData, category: cat, subcategory: SUBCATEGORIES[cat][0].label });
                }}
              >
                {Object.entries(ACTIVITY_CATEGORIES).map(([key, info]) => (
                  <option key={key} value={key}>{info.icon} {info.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="activity-subcategory" className="form-label">Type</label>
              <select
                id="activity-subcategory"
                className="input"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              >
                {SUBCATEGORIES[formData.category].map((sub) => (
                  <option key={sub.label} value={sub.label}>{sub.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="activity-amount" className="form-label">
                Amount ({SUBCATEGORIES[formData.category].find((s) => s.label === formData.subcategory)?.unit || 'units'})
              </label>
              <input
                id="activity-amount"
                type="number"
                className="input"
                min="0"
                step="0.1"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="activity-description" className="form-label">Description (optional)</label>
              <input
                id="activity-description"
                type="text"
                className="input"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Morning commute"
              />
            </div>
          </div>

          {formData.amount > 0 && (
            <div className="form-preview">
              <span>Estimated emissions:</span>
              <strong className="form-preview-value">
                {formatCarbonAmount(
                  formData.amount * (SUBCATEGORIES[formData.category].find((s) => s.label === formData.subcategory)?.factor ?? 0)
                )}
              </strong>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={formData.amount <= 0}>
            Log Activity
          </button>
        </form>
      )}

      {/* Period Selector */}
      <div className="period-selector" role="tablist" aria-label="Time period selection">
        {(['daily', 'weekly', 'monthly'] as TimePeriod[]).map((p) => (
          <button
            key={p}
            role="tab"
            aria-selected={period === p}
            className={`period-btn ${period === p ? 'active' : ''}`}
            onClick={() => setPeriod(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card chart-card animate-fade-in">
        <h3 className="chart-title">
          {period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly'} Emissions
        </h3>
        <div className="chart-container" role="img" aria-label={`${period} carbon emissions chart`}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} unit=" kg" />
              <Tooltip
                contentStyle={{
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  borderRadius: '10px',
                  color: '#202124',
                }}
              />
              <Bar dataKey="value" name="CO₂e" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={`hsl(${160 + i * 8}, 70%, 50%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="category-breakdown">
        <h3 className="chart-title" style={{ marginBottom: 'var(--space-4)' }}>
          Category Breakdown ({period === 'daily' ? 'Today' : period === 'weekly' ? 'This Week' : 'This Month'})
        </h3>
        <div className="category-grid">
          {categoryTotals.map((cat) => (
            <div key={cat.category} className="glass-card category-card animate-fade-in">
              <div className="category-card-header">
                <span className="category-icon" style={{ background: `${cat.info.color}20` }} aria-hidden="true">
                  {cat.info.icon}
                </span>
                <span className="category-label">{cat.info.label}</span>
              </div>
              <div className="category-value">{formatCarbonAmount(cat.value)}</div>
              <div className="category-bar">
                <div
                  className="category-bar-fill"
                  style={{
                    width: `${Math.min(100, (cat.value / (categoryTotals[0]?.value || 1)) * 100)}%`,
                    background: cat.info.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
