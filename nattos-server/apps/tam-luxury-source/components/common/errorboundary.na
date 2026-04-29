
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends React.Component<Props, State> {
  // Explicitly declare state
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-transparent text-white p-8 overflow-y-auto">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold mb-4 text-red-500">System Critical Error</h1>
          <p className="text-gray-400 mb-8 max-w-lg text-center font-mono text-sm">
            {this.state.error?.message || 'Một lỗi không xác định đã xảy ra trong Shard. Vui lòng tải lại hệ thống.'}
          </p>

          {(this.state.error || this.state.errorInfo) && (
            <details className="mb-8 w-full max-w-3xl bg-white/5 border border-white/10 rounded-xl overflow-hidden text-left">
              <summary className="px-4 py-3 cursor-pointer text-xs font-mono text-amber-500 hover:bg-white/5 transition-colors uppercase tracking-widest flex justify-between items-center select-none">
                <span>View Stack Trace (Debug Info)</span>
                <span className="text-[10px]">▼</span>
              </summary>
              <div className="p-4 bg-black border-t border-white/10 max-h-96 overflow-y-auto no-scrollbar">
                <p className="text-[11px] text-red-400 font-bold mb-2 uppercase border-b border-red-900/30 pb-2">Error Stack:</p>
                <pre className="text-[10px] text-gray-400 font-mono whitespace-pre-wrap leading-relaxed mb-6">
                   {this.state.error?.stack || 'No error stack available.'}
                </pre>
                
                <p className="text-[11px] text-indigo-400 font-bold mb-2 uppercase border-b border-indigo-900/30 pb-2">Component Stack:</p>
                <pre className="text-[10px] text-gray-400 font-mono whitespace-pre-wrap leading-relaxed">
                   {this.state.errorInfo?.componentStack || 'No component stack available.'}
                </pre>
              </div>
            </details>
          )}

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-black font-black uppercase rounded-xl hover:bg-gray-200 transition-all text-xs tracking-widest shadow-xl"
          >
            Khởi động lại Terminal
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
