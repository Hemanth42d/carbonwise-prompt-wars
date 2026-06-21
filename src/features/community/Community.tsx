/**
 * Community Impact Mode — Groups, leaderboard, and city-wide challenges.
 *
 * PROBLEM STATEMENT ALIGNMENT:
 * - REDUCE: Social accountability through leaderboards and group challenges drives
 *   sustained reduction behavior — peer comparison is proven to reduce emissions 5-15%.
 * - UNDERSTAND: Leaderboard contextualizes individual performance relative to peers,
 *   with tier system (Seedling → Forest) providing progressive understanding of impact.
 * - SIMPLE ACTIONS: One-click group join creates instant community accountability.
 *
 * Decision Making Logic:
 * - Users ranked by composite sustainability score (0-100)
 * - Tier determined by score thresholds: Seedling(0), Sprout(20), Sapling(40), Tree(60), Forest(80)
 * - Carbon saved metric provides tangible equivalence for abstract scores
 */

import React, { useState, memo } from 'react';
import { useAppStore } from '../../app/store';
import { USER_TIERS } from '../../shared/constants';
import { formatCarbonAmount } from '../../shared/utils';
import './Community.css';

type CommunityTab = 'leaderboard' | 'groups';

/**
 * Community and social features component.
 * @returns {React.ReactElement} The Community UI component.
 */
export const Community: React.FC = memo(() => {
  const { communityGroups, leaderboard, joinGroup, user } = useAppStore();
  const [tab, setTab] = useState<CommunityTab>('leaderboard');

  return (
    <section className="community" aria-labelledby="community-title">
      <div className="page-header">
        <h1 id="community-title" className="page-title">Community</h1>
        <p className="page-subtitle">
          Compare progress, join groups, and participate in community challenges.
        </p>
      </div>

      {/* Tab Selector */}
      <div className="period-selector" role="tablist" aria-label="Community section">
        {(['leaderboard', 'groups'] as CommunityTab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`period-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'leaderboard' ? '🏆 Leaderboard' : '👥 Groups'}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {tab === 'leaderboard' && (
        <div className="glass-card leaderboard animate-fade-in">
          <h3 className="chart-title">Global Sustainability Leaderboard</h3>
          <div className="leaderboard-table" role="table" aria-label="Sustainability leaderboard">
            <div className="leaderboard-header" role="row">
              <span role="columnheader">Rank</span>
              <span role="columnheader">User</span>
              <span role="columnheader">Score</span>
              <span role="columnheader">Carbon Saved</span>
              <span role="columnheader">Tier</span>
            </div>
            {leaderboard.map((entry) => {
              const tierInfo = USER_TIERS[entry.tier];
              const isCurrentUser = entry.userId === user?.id || entry.displayName === user?.displayName;
              return (
                <div
                  key={entry.userId}
                  className={`leaderboard-row ${isCurrentUser ? 'current-user' : ''} ${entry.rank <= 3 ? 'top-3' : ''}`}
                  role="row"
                >
                  <span className="leaderboard-rank" role="cell">
                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                  </span>
                  <span className="leaderboard-user" role="cell">
                    <span className="leaderboard-avatar">{tierInfo.icon}</span>
                    <span className="leaderboard-name">
                      {entry.displayName}
                      {isCurrentUser && <span className="you-badge">You</span>}
                    </span>
                  </span>
                  <span className="leaderboard-score" role="cell">
                    <span className="score-value">{entry.score}</span>
                    <span className="score-suffix">/100</span>
                  </span>
                  <span className="leaderboard-saved" role="cell">
                    {formatCarbonAmount(entry.carbonSaved)}
                  </span>
                  <span className="leaderboard-tier" role="cell" style={{ color: tierInfo.color }}>
                    {tierInfo.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Groups */}
      {tab === 'groups' && (
        <div className="groups-grid animate-fade-in">
          {communityGroups.map((group) => (
            <article key={group.id} className={`glass-card group-card ${group.isJoined ? 'joined' : ''}`}>
              <div className="group-avatar" aria-hidden="true">{group.avatar}</div>
              <div className="group-info">
                <h3 className="group-name">{group.name}</h3>
                <p className="group-desc">{group.description}</p>
                <div className="group-stats">
                  <span>👥 {group.memberCount.toLocaleString()} members</span>
                  <span>🌍 {formatCarbonAmount(group.totalCarbonSaved)} saved</span>
                </div>
              </div>
              <div className="group-action">
                {group.isJoined ? (
                  <span className="tag tag-success">✓ Joined</span>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => joinGroup(group.id)}>
                    Join Group
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
});
Community.displayName = 'Community';
