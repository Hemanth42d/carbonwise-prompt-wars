/**
 * Unit tests for the Zustand application store.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../app/store';

describe('AppStore', () => {
  beforeEach(() => {
    useAppStore.getState().logout();
  });

  describe('Authentication', () => {
    it('should start unauthenticated', () => {
      const s = useAppStore.getState();
      expect(s.isAuthenticated).toBe(false);
      expect(s.user).toBeNull();
    });

    it('should authenticate on login', async () => {
      useAppStore.getState().login();
      await new Promise((r) => setTimeout(r, 1000));
      const s = useAppStore.getState();
      expect(s.isAuthenticated).toBe(true);
      expect(s.user?.displayName).toBe('Alex Green');
    });

    it('should clear state on logout', async () => {
      useAppStore.getState().login();
      await new Promise((r) => setTimeout(r, 1000));
      useAppStore.getState().logout();
      const s = useAppStore.getState();
      expect(s.isAuthenticated).toBe(false);
      expect(s.user).toBeNull();
    });

    it('should populate demo data on login', async () => {
      useAppStore.getState().login();
      await new Promise((r) => setTimeout(r, 1000));
      const s = useAppStore.getState();
      expect(s.footprintData.length).toBeGreaterThan(0);
      expect(s.challenges.length).toBeGreaterThan(0);
      expect(s.leaderboard.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation', () => {
    it('should default to dashboard', () => {
      expect(useAppStore.getState().activeSection).toBe('dashboard');
    });

    it('should update active section', () => {
      useAppStore.getState().setActiveSection('tracker');
      expect(useAppStore.getState().activeSection).toBe('tracker');
    });

    it('should toggle sidebar', () => {
      expect(useAppStore.getState().sidebarCollapsed).toBe(false);
      useAppStore.getState().toggleSidebar();
      expect(useAppStore.getState().sidebarCollapsed).toBe(true);
    });
  });

  describe('Activity Tracking', () => {
    it('should add a new activity', () => {
      useAppStore.getState().addActivity({
        category: 'transportation', subcategory: 'Car',
        description: 'Commute', carbonKg: 4.2,
        date: '2026-06-09T10:00:00Z', metadata: {},
      });
      const s = useAppStore.getState();
      expect(s.activities).toHaveLength(1);
      const activity = s.activities[0];
      expect(activity).toBeDefined();
      expect(activity!.carbonKg).toBe(4.2);
      expect(activity!.id).toBeTruthy();
    });
  });

  describe('Challenges', () => {
    it('should join a challenge', async () => {
      useAppStore.getState().login();
      await new Promise((r) => setTimeout(r, 1000));
      const ch = useAppStore.getState().challenges.find((c) => c.status === 'available');
      useAppStore.getState().joinChallenge(ch!.id);
      const updated = useAppStore.getState().challenges.find((c) => c.id === ch!.id);
      expect(updated?.status).toBe('active');
    });
  });

  describe('Community', () => {
    it('should join a group', async () => {
      useAppStore.getState().login();
      await new Promise((r) => setTimeout(r, 1000));
      const g = useAppStore.getState().communityGroups.find((g) => !g.isJoined);
      useAppStore.getState().joinGroup(g!.id);
      const updated = useAppStore.getState().communityGroups.find((x) => x.id === g!.id);
      expect(updated?.isJoined).toBe(true);
    });
  });

  describe('Chat', () => {
    it('should add messages', () => {
      useAppStore.getState().addChatMessage('Hello', 'user');
      const s = useAppStore.getState();
      expect(s.chatMessages).toHaveLength(1);
      expect(s.chatMessages[0]!.role).toBe('user');
    });

    it('should toggle loading', () => {
      useAppStore.getState().setChatLoading(true);
      expect(useAppStore.getState().isChatLoading).toBe(true);
    });
  });

  describe('Theme', () => {
    it('should toggle dark mode', () => {
      const initial = useAppStore.getState().darkMode;
      useAppStore.getState().toggleDarkMode();
      expect(useAppStore.getState().darkMode).toBe(!initial);
    });
  });
});
