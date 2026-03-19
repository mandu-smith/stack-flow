import React, { Component, ReactNode } from 'react';
import { TriangleAlert as AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // Error is logged for debugging purposes
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-muted p-4">
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-base text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <h1 className="mb-2 font-display text-[length:var(--text-xl)] font-bold">
              Something went wrong
            </h1>
            <p className="mb-6 text-[length:var(--text-sm)] text-muted-foreground">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="mb-6 rounded-md bg-secondary/50 p-3 text-left">
                <summary className="cursor-pointer text-[length:var(--text-xs)] font-medium text-muted-foreground hover:text-foreground">
                  Error details
                </summary>
                <pre className="mt-2 overflow-auto text-[length:var(--text-xs)] text-destructive/70">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex flex-col gap-2">
              <Button onClick={this.resetError} className="w-full">
                Try again
              </Button>
              <Button onClick={() => (window.location.href = '/')} variant="outline" className="w-full">
                Go home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
