import { motion } from 'framer-motion'
import { cn } from '../../utils/helpers'

export default function FallingKanji({ kanji, timeProgress, feedback }) {
    // Calculate position based on time progress
    // Fall distance in pixels (approx container height)
    const yPosition = (1 - timeProgress) * 350

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{
                opacity: 1,
                scale: 1,
                y: yPosition
            }}
            exit={{
                opacity: 0,
                scale: feedback === 'correct' ? 1.5 : 0.8,
                y: feedback === 'correct' ? -30 : 30
            }}
            transition={{
                y: { duration: 0.1 },
                scale: { type: 'spring', stiffness: 300 },
                exit: { duration: 0.3 }
            }}
            className="absolute inset-x-0 flex items-center justify-center"
            style={{ top: '20%' }}
        >
            <div
                className={cn(
                    'relative p-8 rounded-2xl transition-all duration-200',
                    feedback === 'correct' && 'bg-accent-green/20 shadow-[0_0_40px_rgba(0,255,136,0.5)]',
                    feedback === 'incorrect' && 'bg-accent-red/20 shadow-[0_0_40px_rgba(255,68,102,0.5)] animate-shake',
                    !feedback && 'glass neon-border-cyan'
                )}
            >
                {/* Kanji Character */}
                <span
                    className={cn(
                        'text-7xl sm:text-8xl font-bold jp-text',
                        feedback === 'correct' && 'text-accent-green',
                        feedback === 'incorrect' && 'text-accent-red',
                        !feedback && 'gradient-text'
                    )}
                >
                    {kanji.text}
                </span>

                {/* Urgency indicator */}
                {!feedback && timeProgress < 0.3 && (
                    <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-accent-red"
                        animate={{
                            opacity: [0.5, 1, 0.5],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{
                            duration: 0.3,
                            repeat: Infinity
                        }}
                    />
                )}
            </div>
        </motion.div>
    )
}
