import { cn } from '../../utils/helpers'

export default function PageContainer({
    children,
    className = '',
    noPadding = false,
    fullHeight = true
}) {
    return (
        <main
            className={cn(
                'pt-16 pb-20', // Account for header and bottom nav
                fullHeight && 'min-h-screen',
                !noPadding && 'px-4',
                className
            )}
        >
            <div className="container mx-auto max-w-2xl">
                {children}
            </div>
        </main>
    )
}

export function PageTitle({ children, subtitle, className = '' }) {
    return (
        <div className={cn('py-6', className)}>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
                {children}
            </h1>
            {subtitle && (
                <p className="text-text-secondary mt-2">
                    {subtitle}
                </p>
            )}
        </div>
    )
}

export function PageSection({ children, title, className = '' }) {
    return (
        <section className={cn('mb-6', className)}>
            {title && (
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                    {title}
                </h2>
            )}
            {children}
        </section>
    )
}
