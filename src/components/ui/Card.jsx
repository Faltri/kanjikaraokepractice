import { cn } from '../../utils/helpers'

export default function Card({
    children,
    className = '',
    variant = 'default',
    hover = false,
    padding = 'md',
    ...props
}) {
    const variants = {
        default: 'glass',
        dark: 'glass-dark',
        solid: 'bg-bg-secondary',
        neon: 'glass neon-border-cyan'
    }

    const paddings = {
        none: '',
        sm: 'p-3',
        md: 'p-4 sm:p-6',
        lg: 'p-6 sm:p-8'
    }

    return (
        <div
            className={cn(
                'rounded-2xl',
                variants[variant],
                paddings[padding],
                hover && 'card-hover cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export function CardHeader({ children, className = '' }) {
    return (
        <div className={cn('mb-4', className)}>
            {children}
        </div>
    )
}

export function CardTitle({ children, className = '' }) {
    return (
        <h3 className={cn('text-xl font-bold gradient-text', className)}>
            {children}
        </h3>
    )
}

export function CardDescription({ children, className = '' }) {
    return (
        <p className={cn('text-text-secondary text-sm mt-1', className)}>
            {children}
        </p>
    )
}

export function CardContent({ children, className = '' }) {
    return (
        <div className={cn('', className)}>
            {children}
        </div>
    )
}

export function CardFooter({ children, className = '' }) {
    return (
        <div className={cn('mt-4 flex items-center gap-3', className)}>
            {children}
        </div>
    )
}
