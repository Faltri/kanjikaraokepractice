import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Check, X } from 'lucide-react'
import { cn } from '../../utils/helpers'
import { GAME_CONFIG } from '../../utils/constants'

export default function Flashcard({
    token,
    isFlipped,
    onFlip,
    onCorrect,
    onIncorrect,
    showActions = true
}) {
    if (!token) {
        return (
            <div className="w-full aspect-[3/4] max-w-xs mx-auto glass rounded-2xl flex items-center justify-center">
                <p className="text-text-secondary">No card available</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-xs mx-auto perspective-1000">
            <motion.div
                className="relative w-full aspect-[3/4] cursor-pointer preserve-3d"
                onClick={onFlip}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: GAME_CONFIG.ANKI.FLIP_DURATION / 1000, ease: 'easeInOut' }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front - Kanji */}
                <div
                    className={cn(
                        'absolute inset-0 backface-hidden',
                        'glass neon-border-cyan rounded-2xl',
                        'flex flex-col items-center justify-center p-6'
                    )}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <span className="text-7xl sm:text-8xl jp-text font-bold gradient-text">
                        {token.text}
                    </span>
                    <p className="mt-6 text-text-secondary text-sm">
                        Tap to reveal reading
                    </p>
                </div>

                {/* Back - Reading */}
                <div
                    className={cn(
                        'absolute inset-0 backface-hidden',
                        'glass neon-border-pink rounded-2xl',
                        'flex flex-col items-center justify-center p-6'
                    )}
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                    }}
                >
                    <span className="text-4xl sm:text-5xl jp-text text-accent-cyan text-center">
                        {token.reading || token.text}
                    </span>
                    {!token.reading && (
                        <p className="text-xs text-text-muted mt-1 italic">Reading unavailable</p>
                    )}
                    {token.romaji && token.romaji !== token.reading && (
                        <span className="text-xl text-text-secondary mt-2">
                            {token.romaji}
                        </span>
                    )}


                    {token.definition ? (
                        <div className="mt-4 w-full px-4 py-3 rounded-xl bg-bg-tertiary border border-accent-gold/20 shadow-[inset_0_0_10px_rgba(255,215,0,0.1)]">
                            <p className="text-xs text-text-muted uppercase tracking-wider mb-1 text-center">Meaning</p>
                            <p className="text-base font-medium text-accent-gold text-center leading-snug break-all">
                                {token.definition}
                            </p>
                        </div>
                    ) : isTranslating ? (
                        <div className="mt-4 w-full px-4 py-3 rounded-xl bg-bg-tertiary border border-accent-gold/20 flex flex-col items-center justify-center animate-pulse">
                            <p className="text-xs text-text-muted uppercase tracking-wider mb-1 text-center">Meaning</p>
                            <p className="text-sm font-medium text-accent-gold/70 text-center italic">
                                Loading translation...
                            </p>
                        </div>
                    ) : null}
                    <div className="mt-4 p-3 rounded-xl bg-bg-tertiary/50">
                        <span className="text-5xl sm:text-6xl jp-text gradient-text font-bold">
                            {token.text}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Action Buttons */}
            {showActions && isFlipped && (
                <motion.div
                    className="flex items-center justify-center gap-4 mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onIncorrect?.()
                        }}
                        className={cn(
                            'p-4 rounded-full',
                            'bg-accent-red/20 text-accent-red',
                            'hover:bg-accent-red/30 active:scale-95',
                            'transition-all'
                        )}
                    >
                        <X size={28} />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onFlip?.()
                        }}
                        className={cn(
                            'p-3 rounded-full',
                            'bg-white/10 text-text-secondary',
                            'hover:bg-white/20 active:scale-95',
                            'transition-all'
                        )}
                    >
                        <RotateCcw size={20} />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onCorrect?.()
                        }}
                        className={cn(
                            'p-4 rounded-full',
                            'bg-accent-green/20 text-accent-green',
                            'hover:bg-accent-green/30 active:scale-95',
                            'transition-all'
                        )}
                    >
                        <Check size={28} />
                    </button>
                </motion.div>
            )}
        </div>
    )
}
