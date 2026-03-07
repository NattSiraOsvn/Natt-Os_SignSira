import React from "react";

interface State { hasError: boolean; error?: Error }

class ErrorBoundary extends React.Component<{ children: React.ReactNode; fallback?: React.ReactNode }, State> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error("[NATT-OS ErrorBoundary]", error, info); }
  render() {
    if (this.state.hasError) return this.props.fallback ?? (
      <div className="flex items-center justify-center h-full bg-black text-red-500 font-mono text-sm p-8">
        <div>
          <p className="font-black uppercase tracking-widest text-red-400 mb-2">⚠️ CELL ERROR</p>
          <p className="text-xs text-gray-500">{this.state.error?.message ?? "Unknown error"}</p>
        </div>
      </div>
    );
    return this.props.children;
  }
}

export default ErrorBoundary;
