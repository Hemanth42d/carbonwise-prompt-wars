/**
 * Error Boundary — Catches runtime errors in React component tree
 * and renders a user-friendly fallback with recovery options.
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // In production, send to error reporting service
    console.error('[EcoSphere AI] Runtime error caught:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="error-boundary"
          role="alert"
          aria-live="assertive"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            padding: '2rem',
            textAlign: 'center',
            gap: '1rem',
          }}
        >
          <span style={{ fontSize: '3rem' }} aria-hidden="true">⚠️</span>
          <h2 style={{ margin: 0, color: '#202124' }}>
            {this.props.fallbackMessage || 'Something went wrong'}
          </h2>
          <p style={{ color: '#5f6368', maxWidth: '400px' }}>
            An unexpected error occurred. You can try again or reload the page.
          </p>
          {this.state.error && (
            <details style={{ color: '#5f6368', fontSize: '0.85rem', maxWidth: '600px' }}>
              <summary>Error Details</summary>
              <pre style={{ textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={this.handleReset}
              style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
            >
              Try Again
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={this.handleReload}
              style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
