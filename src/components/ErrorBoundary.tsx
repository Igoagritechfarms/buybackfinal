import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches React component errors and displays graceful fallback UI
 * Prevents entire app from crashing due to component errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env['NODE_ENV'] === 'development') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }
    // TODO: Send error to logging service (Sentry, etc.)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-agri-earth-50 px-4">
            <div className="max-w-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4">
                <AlertCircle size={32} />
              </div>
              <h1 className="text-2xl font-bold text-agri-earth-900 mb-2">Oops! Something went wrong</h1>
              <p className="text-agri-earth-500 mb-6">
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
              </p>
              {process.env['NODE_ENV'] === 'development' && this.state.error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-mono text-red-600 text-left break-words">{this.state.error.message}</p>
                </div>
              )}
              <button onClick={this.handleReset} className="btn-primary inline-flex items-center gap-2">
                <RefreshCw size={16} /> Try Again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
