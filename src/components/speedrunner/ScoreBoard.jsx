import { motion } from 'framer-motion'
import { useGameStore } from '../../stores/useGameStore'
import { cn, formatScore } from '../../utils/helpers'

export default function ScoreBoard({ timeProgress }) {
    const { score, combo, maxCombo, correctCount, incorrectCount } = useGameStore()

    return (
        <div className="space-y-3">
            {/* Main Stats */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {/* Score */}
                    <div className="text-left">
                        <div className="text-xs text-text-muted uppercase tracking-wide">Score</div>
                        <motion.div
                            className="text-2xl font-bold gradient-text"
                            key={score}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                        >
                            {formatScore(score)}
                        </motion.div>
                    </div>

                    {/* Combo */}
                    <div className="text-left">
                        <div className="text-xs text-text-muted uppercase tracking-wide">Combo</div>
                        <motion.div
                            className={cn(
                                'text-2xl font-bold',
                                combo >= 5 ? 'text-accent-gold animate-glow-text' :
                                    combo >= 3 ? 'text-accent-pink' :
                                        'text-accent-cyan'
                            )}
                            key={combo}
                            initial={{ scale: combo > 0 ? 1.3 : 1 }}
                            animate={{ scale: 1 }}
                        >
                            {combo}x
                        </motion.div>
                    </div>
                </div>

                {/* Accuracy */}
                <div className="text-right">
                    <div className="text-xs text-text-muted uppercase tracking-wide">Accuracy</div>
                    <div className="text-lg font-medium">
                        <span className="text-accent-green">{correctCount}</span>
                        <span className="text-text-muted mx-1">/</span>
                        <span className="text-accent-red">{incorrectCount}</span>
                    </div>
                </div>
            </div>

            {/* Timer Bar */}
            <div className="relative h-3 rounded-full bg-bg-tertiary overflow-hidden">
                <motion.div
                    className={cn(
                        'absolute inset-y-0 left-0 rounded-full transition-colors duration-200',
                        timeProgress > 0.5 ? 'bg-gradient-to-r from-accent-cyan to-accent-pink' :
                            timeProgress > 0.25 ? 'bg-accent-gold' :
                                'bg-accent-red'
                    )}
                    style={{ width: `${timeProgress * 100}%` }}
                    transition={{ duration: 0.05 }}
                />

                {/* Pulse effect when low */}
                {timeProgress < 0.25 && (
                    <motion.div
                        className="absolute inset-0 bg-accent-red/30"
                        animate={{ opacity: [0, 0.5, 0] }}
                        transition={{ duration: 0.3, repeat: Infinity }}
                    />
                )}
            </div>
        </div>
    )
}
