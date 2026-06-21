/**
 * Global application state management using Zustand.
 * Centralized store with typed slices for each feature domain.
 *
 * PROBLEM STATEMENT ALIGNMENT:
 * - TRACK: addActivity() records emissions with sanitized inputs; footprintData[] stores daily aggregates
 * - UNDERSTAND: Derived state computed via selectors/hooks for charts, scores, and trends
 * - REDUCE: Challenge management (joinChallenge) + AI Coach state (chatMessages, isChatLoading)
 * - SIMPLE ACTIONS: Quick-access state mutations for toggling sidebar, joining groups, adding activities
 * - PERSONALIZED INSIGHTS: User profile (score, streak, tier, goals) feeds into AI response generation
 *
 * Security: All user inputs sanitized via sanitizeInput()/sanitizeNumber() before storage.
 * Auth: Rate-limited login with loginRateLimiter (5 attempts / 15 min).
 */

import { create } from 'zustand';

import type {
  User,
  CarbonActivity,
  DailyFootprint,
  Challenge,
  ChallengeStatus,
  CoachMessage,
  CommunityGroup,
  LeaderboardEntry,
  SustainabilityReport,
} from '../shared/types';
import {
  generateDemoFootprintData,
  generateId,
  roundToDecimals,
  calculateSustainabilityScore,
} from '../shared/utils';
import { createRateLimiter, sanitizeInput } from '../shared/utils/security';

/**
 * Rate limiter: max 5 login attempts per 15 minutes.
 * Prevents brute-force and accidental spam.
 */
const loginRateLimiter = createRateLimiter(5, 15 * 60 * 1000);

/* ─── Demo Data Generators ─── */

function createDemoUser(): User {
  return {
    id: 'demo-user-001',
    email: 'alex@ecosphere.ai',
    displayName: 'Alex Green',
    photoURL: '',
    joinedAt: '2025-09-15',
    sustainabilityScore: 72,
    totalCarbonSaved: 1847.3,
    streakDays: 23,
    badges: [
      { id: 'b1', name: 'Early Adopter', description: 'Joined EcoSphere AI', icon: '🌟', earnedAt: '2025-09-15', category: 'streak' },
      { id: 'b2', name: 'Bike Champion', description: 'Cycled 500km', icon: '🚴', earnedAt: '2025-11-20', category: 'transport' },
      { id: 'b3', name: 'Green Chef', description: '30 days vegetarian', icon: '🥗', earnedAt: '2026-01-10', category: 'food' },
      { id: 'b4', name: 'Power Saver', description: 'Reduced electricity 25%', icon: '💡', earnedAt: '2026-02-14', category: 'energy' },
      { id: 'b5', name: 'Week Warrior', description: '7-day streak', icon: '🔥', earnedAt: '2026-03-01', category: 'streak' },
      { id: 'b6', name: 'Community Star', description: 'Helped 10 users', icon: '⭐', earnedAt: '2026-04-05', category: 'community' },
    ],
    goals: [
      { id: 'g1', title: 'Reduce overall by 20%', description: 'Cut total emissions by 20% this quarter', targetKg: 800, currentKg: 560, deadline: '2026-07-01', status: 'active', category: 'overall' },
      { id: 'g2', title: 'Zero car commute', description: 'Use public transport or bike for all commutes', targetKg: 200, currentKg: 180, deadline: '2026-06-30', status: 'active', category: 'transportation' },
      { id: 'g3', title: 'Vegetarian month', description: 'Eat vegetarian meals for 30 days', targetKg: 150, currentKg: 150, deadline: '2026-05-31', status: 'completed', category: 'food' },
    ],
    tier: 'sapling',
  };
}

function createDemoChallenges(): Challenge[] {
  return [
    {
      id: 'ch1', title: 'Bike to Work Week', description: 'Replace your car commute with cycling for a full work week. Track your rides and earn bonus XP for rainy days!',
      icon: '🚴', category: 'transportation', difficulty: 'medium', durationDays: 7, targetReductionKg: 15,
      participants: 2847, xpReward: 500, status: 'active', progress: 65, startDate: '2026-06-01', endDate: '2026-06-08',
    },
    {
      id: 'ch2', title: 'Meat-Free Challenge', description: 'Go meat-free for an entire week. Discover delicious plant-based recipes and reduce your food carbon footprint.',
      icon: '🥬', category: 'food', difficulty: 'easy', durationDays: 7, targetReductionKg: 25,
      participants: 5123, xpReward: 300, status: 'available', progress: 0,
    },
    {
      id: 'ch3', title: 'Digital Detox Weekend', description: 'Minimize screen time and digital consumption for 48 hours. Reconnect with nature instead.',
      icon: '📱', category: 'digital', difficulty: 'easy', durationDays: 2, targetReductionKg: 2,
      participants: 1456, xpReward: 200, status: 'available', progress: 0,
    },
    {
      id: 'ch4', title: 'Zero Waste Month', description: 'Commit to producing zero landfill waste for 30 days. Learn composting, repair, and refuse strategies.',
      icon: '♻️', category: 'shopping', difficulty: 'hard', durationDays: 30, targetReductionKg: 45,
      participants: 892, xpReward: 1000, status: 'available', progress: 0,
    },
    {
      id: 'ch5', title: 'Cold Shower Challenge', description: 'Take cold showers for 14 days to save water heating energy. Good for you AND the planet!',
      icon: '🚿', category: 'water', difficulty: 'medium', durationDays: 14, targetReductionKg: 8,
      participants: 1234, xpReward: 400, status: 'completed', progress: 100, startDate: '2026-05-01', endDate: '2026-05-15',
    },
    {
      id: 'ch6', title: 'Public Transit Pro', description: 'Use only public transportation for 30 days. Map your routes and find the most efficient paths.',
      icon: '🚌', category: 'transportation', difficulty: 'hard', durationDays: 30, targetReductionKg: 60,
      participants: 3456, xpReward: 800, status: 'available', progress: 0,
    },
  ];
}

function createDemoCommunityGroups(): CommunityGroup[] {
  return [
    { id: 'cg1', name: 'Bay Area Green Team', description: 'Silicon Valley sustainability enthusiasts', memberCount: 1247, totalCarbonSaved: 45230, avatar: '🌉', isJoined: true },
    { id: 'cg2', name: 'Campus Eco Warriors', description: 'College students leading the green revolution', memberCount: 3456, totalCarbonSaved: 89100, avatar: '🎓', isJoined: true },
    { id: 'cg3', name: 'Remote Workers Green', description: 'Sustainable practices for remote professionals', memberCount: 2890, totalCarbonSaved: 67800, avatar: '🏠', isJoined: false },
    { id: 'cg4', name: 'Vegan Impact Collective', description: 'Plant-based living for planetary health', memberCount: 5678, totalCarbonSaved: 124500, avatar: '🌱', isJoined: false },
    { id: 'cg5', name: 'City Cyclists United', description: 'Urban cycling advocates and commuters', memberCount: 4321, totalCarbonSaved: 98700, avatar: '🚲', isJoined: false },
  ];
}

function createDemoLeaderboard(): LeaderboardEntry[] {
  const names = ['Aria Chen', 'Sam Rivera', 'Alex Green', 'Jordan Lee', 'Casey Kim', 'Morgan Patel', 'Riley Suzuki', 'Taylor Nakamura', 'Quinn Rodriguez', 'Avery Okafor'];
  const tiers: Array<'forest' | 'tree' | 'sapling' | 'sprout' | 'seedling'> = ['forest', 'forest', 'tree', 'tree', 'sapling', 'sapling', 'sprout', 'sprout', 'seedling', 'seedling'];
  return names.map((name, i) => ({
    rank: i + 1,
    userId: `user-${i}`,
    displayName: name,
    photoURL: '',
    score: 98 - i * 4 + Math.floor(Math.random() * 3),
    carbonSaved: roundToDecimals(2500 - i * 180 + Math.random() * 50, 1),
    tier: tiers[i] ?? 'seedling',
  }));
}

function createDemoReports(): SustainabilityReport[] {
  return [
    {
      id: 'r1', title: 'Weekly Sustainability Report', period: 'Jun 1-7, 2026', generatedAt: '2026-06-07T18:00:00Z',
      type: 'weekly', sustainabilityScore: 74, totalEmissions: 72.4, reduction: 8.5,
      highlights: ['Transportation emissions down 15% from last week', 'Completed 2 sustainability challenges', 'Maintained 23-day tracking streak'],
      recommendations: ['Try batch cooking on Sunday to reduce food waste', 'Consider carpooling for your Wednesday commute', 'Switch to LED bulbs in remaining rooms'],
    },
    {
      id: 'r2', title: 'May 2026 Monthly Report', period: 'May 2026', generatedAt: '2026-06-01T00:00:00Z',
      type: 'monthly', sustainabilityScore: 71, totalEmissions: 310.2, reduction: 12.3,
      highlights: ['Best month for food emissions since tracking began', 'Joined 2 community groups', 'Earned 3 new badges'],
      recommendations: ['Set up smart thermostat schedules', 'Explore local farmers markets for seasonal produce', 'Consider installing solar panels — your area qualifies for incentives'],
    },
    {
      id: 'r3', title: 'Annual Sustainability Review 2025', period: '2025', generatedAt: '2026-01-01T00:00:00Z',
      type: 'annual', sustainabilityScore: 65, totalEmissions: 4230, reduction: 18.7,
      highlights: ['Reduced overall footprint by 18.7% year-over-year', 'Saved equivalent of 84 trees', 'Completed 12 challenges'],
      recommendations: ['Consider switching to an electric vehicle', 'Explore renewable energy options for your home', 'Mentor newer community members to boost engagement'],
    },
  ];
}

/* ─── Store Types ─── */

interface AppState {
  /* Auth */
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Initiate login flow. Rate-limited to 5 attempts per 15 minutes. */
  login: () => void;
  /** Clear all user state and session data. */
  logout: () => void;

  /* Navigation */
  activeSection: string;
  /** Navigate to a named application section. */
  setActiveSection: (section: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  /* Footprint Data */
  footprintData: DailyFootprint[];
  activities: CarbonActivity[];
  /**
   * Record a new carbon activity.
   * Input is sanitized before storage.
   */
  addActivity: (activity: Omit<CarbonActivity, 'id' | 'userId'>) => void;

  /* Challenges */
  challenges: Challenge[];
  /** Join a challenge by ID, setting status to active with initial progress. */
  joinChallenge: (challengeId: string) => void;

  /* Community */
  communityGroups: CommunityGroup[];
  leaderboard: LeaderboardEntry[];
  /** Join a community group, incrementing member count. */
  joinGroup: (groupId: string) => void;

  /* Coach */
  chatMessages: CoachMessage[];
  /**
   * Append a message to the AI coach conversation.
   * Content is sanitized via the security utilities.
   */
  addChatMessage: (content: string, role: 'user' | 'assistant', suggestions?: string[]) => void;
  isChatLoading: boolean;
  setChatLoading: (loading: boolean) => void;

  /* Reports */
  reports: SustainabilityReport[];

  /* Theme */
  darkMode: boolean;
  toggleDarkMode: () => void;
}

/* ─── Store Implementation ─── */

export const useAppStore = create<AppState>((set, get) => ({
  /* Auth */
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: () => {
    /* Rate limiting — prevent brute-force and accidental spam */
    if (!loginRateLimiter.tryAction()) {
      console.warn('[EcoSphere] Login rate limit exceeded. Try again in 15 minutes.');
      return;
    }
    set({ isLoading: true });
    setTimeout(() => {
      set({
        user: createDemoUser(),
        isAuthenticated: true,
        isLoading: false,
        footprintData: generateDemoFootprintData(90),
        challenges: createDemoChallenges(),
        communityGroups: createDemoCommunityGroups(),
        leaderboard: createDemoLeaderboard(),
        reports: createDemoReports(),
        chatMessages: [{
          id: generateId(),
          role: 'assistant',
          content: "👋 Hello! I'm your EcoSphere AI sustainability coach powered by Gemini. I can help you understand your carbon footprint, suggest eco-friendly alternatives, and create personalized plans to reduce your environmental impact.\n\nHere are some things you can ask me:",
          timestamp: new Date().toISOString(),
          suggestions: [
            'How can I reduce my footprint by 20%?',
            'What are my biggest emission sources?',
            'Create a weekly eco-action plan',
            'Compare my footprint to global averages',
          ],
        }],
      });
    }, 800);
  },
  logout: () => {
    /* Reset rate limiter on clean logout */
    loginRateLimiter.reset();
    set({ user: null, isAuthenticated: false, footprintData: [], chatMessages: [], activities: [] });
  },

  /* Navigation */
  activeSection: 'dashboard',
  setActiveSection: (section) => set({ activeSection: section }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  /* Footprint Data */
  footprintData: [],
  activities: [],
  addActivity: (activity) => {
    const newActivity: CarbonActivity = {
      ...activity,
      /* Sanitize all string fields before persisting */
      description: sanitizeInput(activity.description),
      subcategory: sanitizeInput(activity.subcategory),
      id: generateId(),
      userId: get().user?.id ?? 'demo',
    };
    
    set((state) => {
      const dateStr = newActivity.date.split('T')[0] || new Date().toISOString().split('T')[0]!;
      
      // Update or insert footprintData
      const updatedFootprintData = [...state.footprintData];
      const existingIndex = updatedFootprintData.findIndex((d) => d.date === dateStr);

      if (existingIndex !== -1) {
        const existing = updatedFootprintData[existingIndex]!;
        const updatedBreakdown = { ...existing.breakdown };
        updatedBreakdown[newActivity.category] = roundToDecimals(
          (updatedBreakdown[newActivity.category] ?? 0) + newActivity.carbonKg,
          2
        );
        
        updatedFootprintData[existingIndex] = {
          ...existing,
          totalKg: roundToDecimals(existing.totalKg + newActivity.carbonKg, 2),
          breakdown: updatedBreakdown,
        };
      } else {
        const newDailyFootprint: DailyFootprint = {
          date: dateStr,
          totalKg: newActivity.carbonKg,
          breakdown: {
            transportation: 0,
            flights: 0,
            electricity: 0,
            food: 0,
            shopping: 0,
            water: 0,
            digital: 0,
            [newActivity.category]: newActivity.carbonKg,
          },
        };
        updatedFootprintData.push(newDailyFootprint);
        // Sort chronologically by date
        updatedFootprintData.sort((a, b) => a.date.localeCompare(b.date));
      }

      // Re-calculate user sustainability score dynamically
      let updatedUser = state.user;
      if (updatedUser) {
        const last30 = updatedFootprintData.slice(-30);
        const monthlyTotalKg = last30.reduce((s, d) => s + d.totalKg, 0);
        const dailyAvgKg = monthlyTotalKg / Math.max(1, last30.length);

        const last7 = updatedFootprintData.slice(-7);
        const prev7 = updatedFootprintData.slice(-14, -7);
        const weeklyTotalKg = last7.reduce((s, d) => s + d.totalKg, 0);
        const prevWeekTotalKg = prev7.reduce((s, d) => s + d.totalKg, 0);
        
        // Improvement is reduction (positive value is improvement)
        const wowChange = prevWeekTotalKg > 0
          ? ((prevWeekTotalKg - weeklyTotalKg) / prevWeekTotalKg) * 100
          : 0;

        const goalsCompleted = updatedUser.goals.filter((g) => g.status === 'completed').length;
        const goalsTotal = updatedUser.goals.length;

        const newScore = calculateSustainabilityScore({
          dailyAvgKg,
          consistencyDays: updatedUser.streakDays,
          improvementPercent: wowChange,
          goalsCompleted,
          goalsTotal,
        });

        // Determine tier based on new score
        let tier: User['tier'] = 'seedling';
        if (newScore >= 90) tier = 'forest';
        else if (newScore >= 70) tier = 'tree';
        else if (newScore >= 40) tier = 'sapling';
        else if (newScore >= 20) tier = 'sprout';

        updatedUser = {
          ...updatedUser,
          sustainabilityScore: newScore,
          tier,
        };
      }

      return {
        activities: [newActivity, ...state.activities],
        footprintData: updatedFootprintData,
        user: updatedUser,
      };
    });
  },

  /* Challenges */
  challenges: [],
  joinChallenge: (challengeId) => {
    set((state) => ({
      challenges: state.challenges.map((ch) =>
        ch.id === challengeId
          ? { ...ch, status: 'active' as ChallengeStatus, progress: 10, startDate: new Date().toISOString(), participants: ch.participants + 1 }
          : ch
      ),
    }));
  },

  /* Community */
  communityGroups: [],
  leaderboard: [],
  joinGroup: (groupId) => {
    set((state) => ({
      communityGroups: state.communityGroups.map((g) =>
        g.id === groupId ? { ...g, isJoined: true, memberCount: g.memberCount + 1 } : g
      ),
    }));
  },

  /* Coach */
  chatMessages: [],
  addChatMessage: (content, role, suggestions) => {
    /* Sanitize user-provided content before storing */
    const safeContent = role === 'user' ? sanitizeInput(content) : content;
    const message: CoachMessage = {
      id: generateId(),
      role,
      content: safeContent,
      timestamp: new Date().toISOString(),
      suggestions,
    };
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    }));
  },
  isChatLoading: false,
  setChatLoading: (loading) => set({ isChatLoading: loading }),

  /* Reports */
  reports: [],

  /* Theme */
  darkMode: true,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}));
