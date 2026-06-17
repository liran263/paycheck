import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#f9f9ff] p-6 text-center font-display" dir="rtl">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-red-100 flex flex-col gap-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
              <span className="material-icons-outlined text-4xl" style={{ fontSize: '40px' }}>warning</span>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800">אופס! משהו השתבש</h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                האפליקציה נתקלה בשגיאה לא צפויה. להלן פרטי השגיאה:
              </p>
            </div>

            <div className="bg-red-50/50 rounded-2xl p-4 text-right border border-red-100 overflow-x-auto max-h-40">
              <p className="text-red-700 font-mono text-xs font-bold whitespace-pre-wrap break-all">
                {this.state.error?.toString()}
              </p>
              {this.state.errorInfo && (
                <p className="text-zinc-500 font-mono text-[10px] mt-2 whitespace-pre-wrap break-all">
                  {this.state.errorInfo.componentStack}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleGoHome}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-md shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer border-0"
              >
                חזרה למסך הבית
              </button>
              
              <button
                onClick={this.handleReset}
                className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl active:scale-95 transition-all cursor-pointer border-0"
              >
                איפוס נתונים מקומיים (במקרה של קריסה חוזרת)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
