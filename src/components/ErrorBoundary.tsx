import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "משהו השתבש. אנא נסו לרענן את העמוד.";
      
      try {
        // Check if it's a Firestore error JSON
        const firestoreError = JSON.parse(this.state.error?.message || "");
        if (firestoreError.error) {
          errorMessage = `שגיאת מערכת: ${firestoreError.error}. אנא וודאו שאתם מחוברים ושיש לכם הרשאות מתאימות.`;
        }
      } catch (e) {
        // Not a JSON error, use default
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-brand-cream p-6">
          <div className="max-w-md w-full bg-white border border-brand-gold/10 p-12 text-center shadow-2xl">
            <h2 className="text-3xl font-serif mb-4 text-brand-black">אופס!</h2>
            <p className="text-brand-black/60 mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-brand-black text-white text-xs tracking-widest uppercase hover:bg-brand-gold transition-all"
            >
              רענון עמוד
            </button>
          </div>
        </div>
      );
    }

    const { children } = (this as any).props;
    return children;
  }
}
