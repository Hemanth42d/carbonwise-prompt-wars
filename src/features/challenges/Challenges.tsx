/**
 * Smart Sustainability Challenges — AI-generated challenges with
 * badges, progress tracking, and difficulty levels.
 */

import React, { useState } from 'react';
import { useAppStore } from '../../app/store';
import { ACTIVITY_CATEGORIES } from '../../shared/constants';
import type { Challenge, ChallengeStatus } from '../../shared/types';
import './Challenges.css';

type FilterTab = 'all' | 'available' | 'active' | 'completed';

export const Challenges: React.FC = () => {
  const { challenges, joinChallenge } = useAppStore();
  const [filter, setFilter] = useState<FilterTab>('all');

  const filteredChallenges = challenges.filter((ch) => {
    if (filter === 'all') return true;
    return ch.status === filter;
  });

  const stats = {
    total: challenges.length,
    active: challenges.filter((c) => c.status === 'active').length,
    completed: challenges.filter((c) => c.status === 'completed').length,
    totalXP: challenges.filter((c) => c.status === 'completed').reduce((s, c) => s + c.xpReward, 0),
  };

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'easy': return 'tag-success';
      case 'medium': return 'tag-warning';
      case 'hard': return 'tag-danger';
      default: return 'tag-info';
    }
  };

  return (
    <section className="challenges" aria-labelledby="challenges-title">
      <div className="page-header">
        <h1 id="challenges-title" className="page-title">Sustainability Challenges</h1>
        <p className="page-subtitle">
          AI-powered challenges personalized to your lifestyle. Complete them to earn badges and XP.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid-4 challenges-stats animate-fade-in">
        <div className="stat-card">
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Total Challenges</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: 'var(--color-info)' }}>{stats.active}</div>
          <div className="stat-card-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: 'var(--color-success)' }}>{stats.completed}</div>
          <div className="stat-card-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: 'var(--color-warning)' }}>{stats.totalXP}</div>
          <div className="stat-card-label">Total XP Earned</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="period-selector" role="tablist" aria-label="Challenge filter">
        {(['all', 'available', 'active', 'completed'] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={filter === tab}
            className={`period-btn ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Challenge Cards */}
      <div className="challenge-grid">
        {filteredChallenges.map((ch) => (
          <article key={ch.id} className={`glass-card challenge-card animate-fade-in ${ch.status}`}>
            <div className="challenge-header">
              <span className="challenge-icon" aria-hidden="true">{ch.icon}</span>
              <div className="challenge-meta">
                <span className={`tag ${getDifficultyColor(ch.difficulty)}`}>{ch.difficulty}</span>
                <span className="tag tag-info">{ch.durationDays} days</span>
              </div>
            </div>

            <h3 className="challenge-title">{ch.title}</h3>
            <p className="challenge-desc">{ch.description}</p>

            <div className="challenge-info">
              <span className="challenge-info-item">
                {ACTIVITY_CATEGORIES[ch.category]?.icon} {ACTIVITY_CATEGORIES[ch.category]?.label}
              </span>
              <span className="challenge-info-item">
                🎯 Save {ch.targetReductionKg}kg CO₂
              </span>
              <span className="challenge-info-item">
                👥 {ch.participants.toLocaleString()} participants
              </span>
              <span className="challenge-info-item">
                ⭐ {ch.xpReward} XP
              </span>
            </div>

            {ch.status === 'active' && (
              <div className="challenge-progress">
                <div className="challenge-progress-header">
                  <span>Progress</span>
                  <span>{ch.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${ch.progress}%` }} />
                </div>
              </div>
            )}

            {ch.status === 'completed' && (
              <div className="challenge-completed-badge">
                <span>✅ Completed</span>
                <span>+{ch.xpReward} XP earned</span>
              </div>
            )}

            {ch.status === 'available' && (
              <button
                className="btn btn-primary challenge-join-btn"
                onClick={() => joinChallenge(ch.id)}
              >
                🚀 Join Challenge
              </button>
            )}
          </article>
        ))}
      </div>

      {filteredChallenges.length === 0 && (
        <div className="empty-state glass-card">
          <span className="empty-icon" aria-hidden="true">🔍</span>
          <p>No challenges found for this filter.</p>
        </div>
      )}
    </section>
  );
};
