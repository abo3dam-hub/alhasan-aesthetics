import { Component, type ReactNode } from "react";

/**
 * ErrorBoundary — prevents a single component's render error (e.g. a Convex
 * query that doesn't exist on a not-yet-deployed backend) from crashing the
 * whole page. Renders `fallback` (default: nothing) when a child throws.
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(err: unknown) {
    console.warn("[ErrorBoundary] Caught render error:", err instanceof Error ? err.message : err);
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}