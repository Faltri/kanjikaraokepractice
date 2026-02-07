import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Button from './Button'
import Card from './Card'

class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        // ErrorBoundary should always log errors, even in production
        console.error('ErrorBoundary caught an error:', error, errorInfo)
        this.setState({
            error,
            errorInfo
        })
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
        // Optionally reload the page for a clean state
        if (this.props.resetOnError) {
            window.location.reload()
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
                    <Card variant="dark" className="max-w-2xl w-full">
                        <div className="text-center space-y-6 py-8">
                            <div className="flex justify-center">
                                <div className="p-4 rounded-full bg-accent-pink/20">
                                    <AlertTriangle size={48} className="text-accent-pink" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-text-primary">
                                    Something went wrong
                                </h1>
                                <p className="text-text-secondary">
                                    An unexpected error occurred. Don't worry, your data is safe.
                                </p>
                            </div>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="text-left bg-bg-tertiary/50 p-4 rounded-xl border border-white/10">
                                    <p className="text-sm font-mono text-accent-pink mb-2">
                                        {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo && (
                                        <details className="text-xs text-text-muted">
                                            <summary className="cursor-pointer hover:text-text-secondary mb-2">
                                                Stack Trace
                                            </summary>
                                            <pre className="overflow-auto max-h-48 text-xs">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 justify-center">
                                <Button
                                    onClick={this.handleReset}
                                    variant="neon"
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw size={18} />
                                    Try Again
                                </Button>
                                <Button
                                    onClick={() => (window.location.href = '/')}
                                    variant="ghost"
                                    className="flex items-center gap-2"
                                >
                                    <Home size={18} />
                                    Go Home
                                </Button>
                            </div>

                            <p className="text-xs text-text-muted pt-4">
                                If this problem persists, please check your browser console for details.
                            </p>
                        </div>
                    </Card>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
