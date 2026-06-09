/**
 * Application-wide constants for EcoSphere AI.
 * No magic numbers — all values are named and documented.
 */

import type { ActivityCategory, ActivityCategoryInfo, UserTier } from '../types';

/* ─── Carbon Emission Factors (kg CO2e) ─── */
export const EMISSION_FACTORS = {
  /* Transportation */
  CAR_PER_KM: 0.21,
  BUS_PER_KM: 0.089,
  TRAIN_PER_KM: 0.041,
  BIKE_PER_KM: 0,
  WALK_PER_KM: 0,
  ELECTRIC_CAR_PER_KM: 0.053,

  /* Flights */
  FLIGHT_SHORT_PER_KM: 0.255, // < 1500km
  FLIGHT_MEDIUM_PER_KM: 0.195, // 1500-4000km
  FLIGHT_LONG_PER_KM: 0.150, // > 4000km

  /* Electricity */
  ELECTRICITY_PER_KWH: 0.475,
  SOLAR_PER_KWH: 0.041,
  NATURAL_GAS_PER_KWH: 0.185,

  /* Food */
  MEAL_MEAT: 7.2,
  MEAL_VEGETARIAN: 1.7,
  MEAL_VEGAN: 0.9,
  MEAL_FISH: 3.5,

  /* Water */
  WATER_PER_LITER: 0.000298,
  SHOWER_PER_MINUTE: 0.0119,

  /* Shopping */
  CLOTHING_ITEM: 10,
  ELECTRONICS_ITEM: 50,
  FURNITURE_ITEM: 75,

  /* Digital */
  STREAMING_PER_HOUR: 0.036,
  EMAIL_PER_MESSAGE: 0.004,
  CLOUD_STORAGE_PER_GB: 0.01,
} as const;

/* ─── Activity Categories ─── */
export const ACTIVITY_CATEGORIES: Record<ActivityCategory, ActivityCategoryInfo> = {
  transportation: {
    label: 'Transportation',
    icon: '🚗',
    color: '#4285F4',
    avgDailyKg: 4.6,
  },
  flights: {
    label: 'Flights',
    icon: '✈️',
    color: '#1a73e8',
    avgDailyKg: 1.2,
  },
  electricity: {
    label: 'Electricity',
    icon: '⚡',
    color: '#FBBC05',
    avgDailyKg: 3.8,
  },
  food: {
    label: 'Food',
    icon: '🍽️',
    color: '#34A853',
    avgDailyKg: 5.2,
  },
  shopping: {
    label: 'Shopping',
    icon: '🛍️',
    color: '#EA4335',
    avgDailyKg: 2.1,
  },
  water: {
    label: 'Water',
    icon: '💧',
    color: '#4fc3f7',
    avgDailyKg: 0.4,
  },
  digital: {
    label: 'Digital',
    icon: '💻',
    color: '#9aa0a6',
    avgDailyKg: 0.3,
  },
};

/* ─── User Tiers ─── */
export const USER_TIERS: Record<UserTier, { label: string; minScore: number; icon: string; color: string }> = {
  seedling: { label: 'Seedling', minScore: 0, icon: '🌱', color: '#86efac' },
  sprout: { label: 'Sprout', minScore: 20, icon: '🌿', color: '#4ade80' },
  sapling: { label: 'Sapling', minScore: 40, icon: '🌳', color: '#22c55e' },
  tree: { label: 'Tree', minScore: 70, icon: '🌲', color: '#16a34a' },
  forest: { label: 'Forest Guardian', minScore: 90, icon: '🏔️', color: '#15803d' },
};

/* ─── Global Averages ─── */
export const GLOBAL_AVERAGES = {
  WORLD_ANNUAL_KG: 4700,
  US_ANNUAL_KG: 14700,
  EU_ANNUAL_KG: 6800,
  INDIA_ANNUAL_KG: 1900,
  PARIS_TARGET_ANNUAL_KG: 2300,
} as const;

/* ─── API Endpoints ─── */
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/* ─── UI Constants ─── */
export const ANIMATION_DURATION_MS = 300;
export const DEBOUNCE_DELAY_MS = 500;
export const ITEMS_PER_PAGE = 20;
export const MAX_CHAT_MESSAGES = 100;
export const CHART_COLORS = [
  '#4285F4', '#34A853', '#FBBC05', '#EA4335',
  '#1a73e8', '#137333', '#e37400', '#c5221f',
];

/* ─── Sustainability Score Weights ─── */
export const SCORE_WEIGHTS = {
  LIFESTYLE: 0.30,
  CONSISTENCY: 0.25,
  IMPROVEMENTS: 0.25,
  GOAL_COMPLETION: 0.20,
} as const;
