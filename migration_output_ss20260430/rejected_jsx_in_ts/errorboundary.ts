
import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children?: ReactNode;
  showReset?: boolean;
}

interface State {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('Shard Error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ error: null, errorInfo: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 sm:p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-12">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-sm sm:text-base">!</span>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">SHARD TERMINAL</h1>
                  <p className="text-xs text-gray-400 font-mono mt-1">error DETECTED</p>
                </div>
              </div>
              <div className="text-xs sm:text-sm font-mono text-gray-400 bg-gray-800 px-3 py-2 rounded-lg">
                CODE: 0x{(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0').toUpperCase()}
              </div>
            </div>

            {/* Error Content */}
            <div className="glass-panel p-4 sm:p-6 md:p-8 mb-6">
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">Critical System Error</h2>
                <p className="text-gray-400 mb-4 text-sm sm:text-base">
                  The Shard interface has encountered a fatal error and needs to restart.
                </p>
                
                <div className="bg-black/50 rounded-lg p-3 sm:p-4 mb-6 font-mono text-xs sm:text-sm overflow-x-auto">
                  <div className="text-red-400 mb-2">error DETAILS:</div>
                  <div className="text-gray-300 whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <div className="mt-4 text-gray-400 text-xs">
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - Responsive Stack */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {this.props.showReset !== false && (
                  <button
                    onClick={this.resetError}
                    className="flex-1 sm:flex-none px-4 py-3 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm sm:text-base">Restart Interface</span>
                  </button>
                )}
                
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 sm:flex-none px-4 py-3 sm:px-6 sm:py-3 bg-gray-800 border border-gray-700 text-white font-semibold rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-sm sm:text-base">Reload Terminal</span>
                </button>
                
                <button
                  onClick={() => window.history.back()}
                  className="flex-1 sm:flex-none px-4 py-3 sm:px-6 sm:py-3 bg-gray-800/50 border border-gray-700 text-white font-semibold rounded-lg hover:bg-gray-700 transition"
                >
                  <span className="text-sm sm:text-base">Go Back</span>
                </button>
              </div>
            </div>

            {/* Technical Info - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="glass-panel p-3 sm:p-4">
                <div className="text-gray-400 mb-1">Timestamp</div>
                <div className="font-mono truncate">{new Date().toISOString()}</div>
              </div>
              <div className="glass-panel p-3 sm:p-4">
                <div className="text-gray-400 mb-1">User Agent</div>
                <div className="font-mono truncate">{navigator.userAgent.substring(0, 30)}...</div>
              </div>
              <div className="glass-panel p-3 sm:p-4">
                <div className="text-gray-400 mb-1">Platform</div>
                <div className="font-mono">{navigator.platform}</div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 sm:mt-8 text-center text-gray-500 text-xs sm:text-sm">
              <p>Shard Terminal v2.1 • Neural Analytics Framework • © 2024 natt-os</p>
              <p className="mt-2">
                Need help? Contact{' '}
                <a href="mailto:support@natt-os.com" className="text-blue-400 hover:text-blue-300">
                  support@natt-os.com
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
