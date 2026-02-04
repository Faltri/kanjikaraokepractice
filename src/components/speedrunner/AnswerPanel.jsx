import { motion } from 'framer-motion'
import { cn } from '../../utils/helpers'

export default function AnswerPanel({ options, onAnswer, disabled, feedback }) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {options.map((option, index) => (
                <motion.button
                    key={`${option.text}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => !disabled && onAnswer(option.text, option.isCorrect)}
                    disabled={disabled}
                    className={cn(
                        'p-4 rounded-xl text-2xl jp-text font-medium',
                        'transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-accent-cyan/50',

                        // Default state
                        !disabled && !feedback && [
                            'glass border border-white/10',
                            'hover:border-accent-cyan hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]',
                            'active:scale-95'
                        ],

                        // Disabled during feedback
                        disabled && !option.isCorrect && 'opacity-50',

                        // Correct answer highlight
                        feedback && option.isCorrect && [
                            'bg-accent-green/30 border-2 border-accent-green',
                            'text-accent-green shadow-[0_0_20px_rgba(0,255,136,0.5)]'
                        ],

                        // Incorrect answer (selected wrong)
                        feedback === 'incorrect' && !option.isCorrect && disabled && [
                            'opacity-30'
                        ]
                    )}
                >
                    {option.text}
                </motion.button>
            ))}
        </div>
    )
}
