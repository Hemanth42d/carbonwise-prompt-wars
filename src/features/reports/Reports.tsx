/**
 * AI Sustainability Reports — View and generate downloadable reports
 * with weekly summaries, monthly reviews, and annual overviews.
 */

import React, { useState } from 'react';
import { useAppStore } from '../../app/store';
import { formatCarbonAmount, formatDate } from '../../shared/utils';
import type { SustainabilityReport } from '../../shared/types';
import './Reports.css';

export const Reports: React.FC = () => {
  const { reports, user } = useAppStore();
  const [selectedReport, setSelectedReport] = useState<SustainabilityReport | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = (type: string) => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      alert(`${type} report generation simulated. In production, this generates a PDF via Gemini + Cloud Storage.`);
    }, 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weekly': return '📅';
      case 'monthly': return '🗓️';
      case 'annual': return '📊';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weekly': return 'tag-info';
      case 'monthly': return 'tag-success';
      case 'annual': return 'tag-warning';
      default: return 'tag-info';
    }
  };

  return (
    <section className="reports" aria-labelledby="reports-title">
      <div className="page-header">
        <h1 id="reports-title" className="page-title">Sustainability Reports</h1>
        <p className="page-subtitle">
          AI-generated reports with insights, recommendations, and downloadable summaries.
        </p>
      </div>

      {/* Generate Buttons */}
      <div className="report-generate glass-card animate-fade-in">
        <h3 className="chart-title">Generate New Report</h3>
        <p className="report-generate-desc">
          Gemini AI will analyze your data and generate a comprehensive sustainability report.
        </p>
        <div className="report-generate-buttons">
          <button
            className="btn btn-secondary"
            onClick={() => handleGenerate('Weekly')}
            disabled={generating}
          >
            📅 Weekly Summary
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleGenerate('Monthly')}
            disabled={generating}
          >
            🗓️ Monthly Review
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleGenerate('Annual')}
            disabled={generating}
          >
            📊 Annual Report
          </button>
        </div>
        {generating && (
          <div className="generating-indicator">
            <div className="typing-indicator">
              <span /><span /><span />
            </div>
            <span>Gemini is generating your report...</span>
          </div>
        )}
      </div>

      {/* Report List */}
      <div className="report-grid">
        {reports.map((report) => (
          <article
            key={report.id}
            className={`glass-card report-card animate-fade-in ${selectedReport?.id === report.id ? 'selected' : ''}`}
            onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
            role="button"
            tabIndex={0}
            aria-expanded={selectedReport?.id === report.id}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedReport(selectedReport?.id === report.id ? null : report);
              }
            }}
          >
            <div className="report-card-header">
              <span className="report-icon" aria-hidden="true">{getTypeIcon(report.type)}</span>
              <div className="report-card-meta">
                <h3 className="report-card-title">{report.title}</h3>
                <div className="report-card-details">
                  <span className={`tag ${getTypeColor(report.type)}`}>{report.type}</span>
                  <span className="report-date">{report.period}</span>
                </div>
              </div>
            </div>

            <div className="report-card-stats">
              <div className="report-stat">
                <span className="report-stat-value">{report.sustainabilityScore}</span>
                <span className="report-stat-label">Score</span>
              </div>
              <div className="report-stat">
                <span className="report-stat-value">{formatCarbonAmount(report.totalEmissions)}</span>
                <span className="report-stat-label">Emissions</span>
              </div>
              <div className="report-stat">
                <span className="report-stat-value" style={{ color: 'var(--color-success)' }}>
                  -{report.reduction}%
                </span>
                <span className="report-stat-label">Reduction</span>
              </div>
            </div>

            {/* Expanded Content */}
            {selectedReport?.id === report.id && (
              <div className="report-expanded animate-fade-in">
                <div className="divider" />

                <div className="report-section">
                  <h4>📌 Highlights</h4>
                  <ul className="report-list">
                    {report.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>

                <div className="report-section">
                  <h4>🎯 AI Recommendations</h4>
                  <ul className="report-list recommendations">
                    {report.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="report-actions">
                  <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); handleGenerate('PDF'); }}>
                    📥 Download PDF
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={(e) => e.stopPropagation()}>
                    📤 Share Report
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="empty-state glass-card">
          <span className="empty-icon" aria-hidden="true">📄</span>
          <p>No reports generated yet. Click above to create your first report.</p>
        </div>
      )}
    </section>
  );
};
