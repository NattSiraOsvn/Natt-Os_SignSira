import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  // Explicitly declare state and props to satisfy TypeScript checks
  public state: State = {
    hasError: false
  };
  readonly props: Readonly<Props>;

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#020202] text-white p-8">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold mb-4 text-red-500">System Critical Error</h1>
          <p className="text-gray-400 mb-8 max-w-lg text-center font-mono text-sm">
            {this.state.error?.message || 'Một lỗi không xác định đã xảy ra trong Shard. Vui lòng tải lại hệ thống.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-black font-black uppercase rounded-xl hover:bg-gray-200 transition-all text-xs tracking-widest"
          >
            Khởi động lại Terminal
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
