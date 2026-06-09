/**
 * Core type definitions for EcoSphere AI platform.
 * Centralized types ensure type safety across the application.
 */

/* ─── User & Auth ─── */
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  joinedAt: string;
  sustainabilityScore: number;
  totalCarbonSaved: number;
  streakDays: number;
  badges: Badge[];
  goals: SustainabilityGoal[];
  tier: UserTier;
}

export type UserTier = 'seedling' | 'sprout' | 'sapling' | 'tree' | 'forest';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: BadgeCategory;
}

export type BadgeCategory = 'transport' | 'energy' | 'food' | 'waste' | 'community' | 'streak' | 'challenge';

/* ─── Carbon Activities ─── */
export interface CarbonActivity {
  id: string;
  userId: string;
  category: ActivityCategory;
  subcategory: string;
  description: string;
  carbonKg: number;
  date: string;
  metadata: Record<string, unknown>;
}

export type ActivityCategory =
  | 'transportation'
  | 'flights'
  | 'electricity'
  | 'food'
  | 'shopping'
  | 'water'
  | 'digital';

export interface ActivityCategoryInfo {
  label: string;
  icon: string;
  color: string;
  avgDailyKg: number;
}

/* ─── Tracking & Analytics ─── */
export interface DailyFootprint {
  date: string;
  totalKg: number;
  breakdown: Record<ActivityCategory, number>;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  totalKg: number;
  avgDailyKg: number;
  topCategory: ActivityCategory;
  changeFromLastWeek: number;
  insights: string[];
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalKg: number;
  avgDailyKg: number;
  breakdown: Record<ActivityCategory, number>;
  trend: 'improving' | 'stable' | 'worsening';
  aiSummary: string;
}

/* ─── Forecast ─── */
export interface ForecastPoint {
  date: string;
  predictedKg: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

export interface ForecastResult {
  period: '30d' | '6m' | '1y';
  points: ForecastPoint[];
  totalPredicted: number;
  trend: 'decreasing' | 'stable' | 'increasing';
  explanation: string;
  recommendations: string[];
}

/* ─── Simulator ─── */
export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  changes: SimulationChange[];
}

export interface SimulationChange {
  category: ActivityCategory;
  factor: number; // multiplier (0.0 = eliminate, 0.5 = halve, etc.)
  description: string;
}

export interface SimulationResult {
  scenarioId: string;
  currentAnnualKg: number;
  projectedAnnualKg: number;
  reductionKg: number;
  reductionPercent: number;
  costSavings: number;
  equivalentTrees: number;
  timeline: { month: string; currentKg: number; projectedKg: number }[];
  aiInsight: string;
}

/* ─── Challenges ─── */
export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: ActivityCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  durationDays: number;
  targetReductionKg: number;
  participants: number;
  xpReward: number;
  badge?: Badge;
  status: ChallengeStatus;
  progress: number;
  startDate?: string;
  endDate?: string;
}

export type ChallengeStatus = 'available' | 'active' | 'completed' | 'failed';

/* ─── Community ─── */
export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  totalCarbonSaved: number;
  avatar: string;
  isJoined: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  photoURL: string;
  score: number;
  carbonSaved: number;
  tier: UserTier;
}

/* ─── Goals ─── */
export interface SustainabilityGoal {
  id: string;
  title: string;
  description: string;
  targetKg: number;
  currentKg: number;
  deadline: string;
  status: 'active' | 'completed' | 'expired';
  category: ActivityCategory | 'overall';
}

/* ─── AI Coach ─── */
export interface CoachMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

export interface CoachConversation {
  id: string;
  messages: CoachMessage[];
  createdAt: string;
  title: string;
}

/* ─── Reports ─── */
export interface SustainabilityReport {
  id: string;
  title: string;
  period: string;
  generatedAt: string;
  type: 'weekly' | 'monthly' | 'annual';
  sustainabilityScore: number;
  totalEmissions: number;
  reduction: number;
  highlights: string[];
  recommendations: string[];
}

/* ─── Navigation ─── */
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}
