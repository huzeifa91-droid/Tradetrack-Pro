import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Try to parse JSON error if it's from Firestore
    let detailedInfo = null;
    try {
      detailedInfo = JSON.parse(error.message);
    } catch (e) {
      detailedInfo = error.message;
    }

    this.setState({
      errorInfo: typeof detailedInfo === 'object' ? JSON.stringify(detailedInfo, null, 2) : String(detailedInfo)
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface-100 text-text-100 flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-2xl w-full bg-surface-200 border border-border-subtle rounded-[2rem] p-6 sm:p-10 shadow-2xl space-y-6 sm:space-y-8">
            <div className="flex items-center gap-4 text-red-500">
              <div className="p-3 bg-red-500/10 rounded-2xl">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">Something went wrong</h1>
            </div>

            <div className="space-y-4">
              <p className="text-text-200 text-sm sm:text-base leading-relaxed">
                The application encountered an unexpected error. This might be due to a connection issue or a configuration problem.
              </p>
              
              {this.state.errorInfo && (
                <div className="bg-surface-300/50 rounded-2xl p-4 sm:p-6 border border-border-subtle overflow-auto max-h-[30vh]">
                  <pre className="text-[10px] sm:text-xs font-mono text-red-400 whitespace-pre-wrap">
                    {this.state.errorInfo}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-[0.98]"
              >
                <RefreshCw className="w-5 h-5" />
                Reload Application
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="flex-1 bg-surface-300 text-text-100 py-4 rounded-2xl font-bold hover:bg-surface-300/80 transition-all active:scale-[0.98]"
              >
                Reset & Reload
              </button>
            </div>
            
            <p className="text-center text-[10px] sm:text-xs text-text-200 font-medium">
              If the problem persists, please contact support with the error details above.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
