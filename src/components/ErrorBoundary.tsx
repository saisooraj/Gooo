import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    if (this.props.fallback) return this.props.fallback(error, this.reset)

    return <DefaultErrorFallback error={error} reset={this.reset} />
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <p className="text-4xl">⚠️</p>
      <div className="space-y-1">
        <p className="text-sm font-medium text-t1">Something went wrong</p>
        <p className="max-w-sm text-sm text-t3">{error.message || 'An unexpected error occurred.'}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={reset}>
          Try again
        </Button>
        <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
          Reload page
        </Button>
      </div>
    </div>
  )
}
