import { motion } from 'framer-motion'
import { cn } from '../../utils/helpers'

export default function ProgressBar({
    progress,
    currentLine,
    totalLines,
    showLabels = true
}) {
    return (
        <div className="space-y-2">
            {showLabels && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">
                        Line {currentLine} of {totalLines}
                    </span>
                    <span className="text-accent-cyan font-medium">
                        {Math.round(progress)}%
                    </span>
                </div>
            )}

            <div className="relative h-2 rounded-full bg-bg-tertiary overflow-hidden">
                <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-cyan to-accent-pink"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                />

                {/* Glow effect at the leading edge */}
                <motion.div
                    className="absolute inset-y-0 w-4 rounded-full"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.5), transparent)',
                        filter: 'blur(4px)'
                    }}
                    animate={{ left: `calc(${progress}% - 8px)` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                />
            </div>
        </div>
    )
}

export function CircularProgress({ progress, size = 60, strokeWidth = 4 }) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (progress / 100) * circumference

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-bg-tertiary"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.3 }}
                />
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--color-accent-cyan)" />
                        <stop offset="100%" stopColor="var(--color-accent-pink)" />
                    </linearGradient>
                </defs>
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-accent-cyan">
                    {Math.round(progress)}%
                </span>
            </div>
        </div>
    )
}
