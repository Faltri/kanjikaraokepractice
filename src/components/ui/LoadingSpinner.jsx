import { cn } from '../../utils/helpers'

export default function LoadingSpinner({
    size = 'md',
    message = 'Loading...',
    showMessage = true,
    className = ''
}) {
    const sizes = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    }

    return (
        <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
            <div className={cn('relative', sizes[size])}>
                {/* Outer ring */}
                <div
                    className={cn(
                        'absolute inset-0 rounded-full',
                        'border-2 border-accent-cyan/30'
                    )}
                />

                {/* Spinning gradient ring */}
                <div
                    className={cn(
                        'absolute inset-0 rounded-full animate-spin',
                        'border-2 border-transparent',
                        'border-t-accent-cyan border-r-accent-pink'
                    )}
                    style={{ animationDuration: '1s' }}
                />

                {/* Inner glow */}
                <div
                    className={cn(
                        'absolute inset-2 rounded-full',
                        'bg-gradient-to-br from-accent-cyan/10 to-accent-pink/10',
                        'animate-pulse'
                    )}
                />
            </div>

            {showMessage && message && (
                <p className="text-sm text-text-secondary animate-pulse">
                    {message}
                </p>
            )}
        </div>
    )
}

export function LoadingOverlay({ message = 'Loading...' }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm">
            <LoadingSpinner size="lg" message={message} />
        </div>
    )
}

export function LoadingDots() {
    return (
        <span className="inline-flex gap-1">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </span>
    )
}
