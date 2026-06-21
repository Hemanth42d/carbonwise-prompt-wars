/**
 * Login Page — Premium authentication screen with animated background,
 * feature showcase, and demo login functionality.
 */

import React, { memo } from 'react';
import { useAppStore } from '../../app/store';
import './Login.css';

/**
 * Login component for authentication and entry to the platform.
 * @returns {React.ReactElement} The Login UI component.
 */
export const Login: React.FC = memo(() => {
  const { login, isLoading } = useAppStore();

  return (
    <main className="login-page" role="main">
      {/* Animated Background */}
      <div className="login-bg" aria-hidden="true">
        <div className="login-glow glow-1" />
        <div className="login-glow glow-2" />
        <div className="login-glow glow-3" />
        <div className="login-grid" />
      </div>

      <div className="login-container">
        {/* Left - Branding */}
        <div className="login-branding">
          <div className="login-logo">
            <span className="login-logo-icon animate-float">🌿</span>
            <h1 className="login-logo-text">EcoSphere AI</h1>
          </div>
          <p className="login-tagline">
            Your AI-powered personal sustainability assistant
          </p>
          <div className="login-features">
            {[
              { icon: '🤖', title: 'AI Sustainability Coach', desc: 'Powered by Gemini 2.5 Flash' },
              { icon: '📊', title: 'Carbon Tracking', desc: '7 categories • daily/weekly/monthly' },
              { icon: '📈', title: 'Predictive Forecasting', desc: '30-day, 6-month, 1-year predictions' },
              { icon: '🔬', title: 'Impact Simulator', desc: 'Test what-if scenarios instantly' },
              { icon: '🏆', title: 'Smart Challenges', desc: 'AI-generated sustainability goals' },
              { icon: '👥', title: 'Community Impact', desc: 'Leaderboards & group challenges' },
            ].map((f, i) => (
              <div key={i} className="login-feature animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="login-feature-icon" aria-hidden="true">{f.icon}</span>
                <div>
                  <strong>{f.title}</strong>
                  <span>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Login Card */}
        <div className="login-card glass-card">
          <div className="login-card-header">
            <h2>Welcome to EcoSphere AI</h2>
            <p>Start your sustainability journey today</p>
          </div>

          <div className="login-card-body">
            <button
              className="login-btn google-btn"
              onClick={login}
              disabled={isLoading}
              aria-label="Sign in with Google"
            >
              <svg viewBox="0 0 24 24" className="google-icon" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>

            <div className="login-divider">
              <span>or</span>
            </div>

            <button
              className="login-btn demo-btn"
              onClick={login}
              disabled={isLoading}
            >
              🚀 {isLoading ? 'Loading demo...' : 'Try Demo Account'}
            </button>

            <p className="login-disclaimer">
              Demo mode uses simulated data. In production, this integrates with
              Firebase Auth and Google Cloud services.
            </p>
          </div>

          {/* Cloud Services Badge */}
          <div className="login-cloud-badges">
            <span className="cloud-badge">Google Cloud</span>
            <span className="cloud-badge">Firebase</span>
            <span className="cloud-badge">Gemini AI</span>
            <span className="cloud-badge">BigQuery</span>
          </div>
        </div>
      </div>
    </main>
  );
});
Login.displayName = 'Login';
