import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, ArrowLeft, ArrowRight } from 'lucide-react'
import { useAnkiStore } from '../../stores/useAnkiStore'
import { useLyricStore } from '../../stores/useLyricStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { aiService } from '../../engines/AIService'
import Flashcard from './Flashcard'
import Button from '../ui/Button'
import ProgressTracker from './ProgressTracker'
import { cn } from '../../utils/helpers'

export default function FlashcardDeck() {
    const [isFlipped, setIsFlipped] = useState(false)
    const [isTranslating, setIsTranslating] = useState(false)

    const {
        sessionCards,
        currentCardIndex,
        currentDeckId,
        nextCard,
        previousCard,
        shuffleDeck,
        markCorrect,
        markIncorrect,
        getSessionProgress,
        startSession,
        endSession
    } = useAnkiStore()

    const { kanjiTokens, currentSong, parsedLines, updateToken } = useLyricStore()
    const { geminiApiKey, geminiModel } = useSettingsStore()

    const currentCard = sessionCards[currentCardIndex]
    const progress = getSessionProgress()

    // Auto-start session if we have kanji and (no session OR deck mismatch)
    useEffect(() => {
        if (kanjiTokens.length > 0 && currentSong?.id) {
            if (sessionCards.length === 0 || currentDeckId !== currentSong.id) {
                useAnkiStore.getState().createDeck(currentSong.id, kanjiTokens)
                startSession(currentSong.id)
            }
        }
    }, [kanjiTokens, currentSong, currentDeckId, sessionCards.length, startSession])

    // On-demand verification when flipped if missing definition
    useEffect(() => {
        const verify = async () => {
            if (isFlipped && currentCard && !currentCard.definition) {
                // Find context
                let context = ''
                if (currentCard.position) {
                    const line = parsedLines[currentCard.position.line]
                    if (line) context = line.map(t => t.text).join('')
                }

                if (geminiApiKey) {
                    setIsTranslating(true)
                    try {
                        aiService.setApiKey(geminiApiKey)
                        if (geminiModel) aiService.setModel(geminiModel)

                        // Helper to find the token in the store to update
                        // We need to update both LyricStore (source of truth) and AnkiStore (current session view)
                        // Ideally AnkiStore cards should update if LyricStore updates, but they might be decoupled copies.

                        const data = await aiService.verifyToken(currentCard.text, context)
                        if (data) {
                            // Update LyricStore
                            if (currentCard.id) {
                                updateToken(currentCard.id, {
                                    reading: data.reading,
                                    definition: data.definition
                                })

                                // Update AnkiStore (We need a method for this, or just update the local object via mutation if zustand allows, or custom action)
                                // For now, let's assume we need to update the session card directly.
                                useAnkiStore.getState().updateCard(currentCard.text, {
                                    reading: data.reading,
                                    definition: data.definition
                                })
                            }
                        }
                    } finally {
                        setIsTranslating(false)
                    }
                }
            }
        }
        verify()
    }, [isFlipped, currentCard, geminiApiKey, geminiModel, parsedLines, updateToken])

    const handleFlip = () => {
        setIsFlipped(!isFlipped)
    }

    const handleCorrect = () => {
        if (currentCard) {
            markCorrect(currentCard.text)
        }
        setIsFlipped(false)
        if (currentCardIndex < sessionCards.length - 1) {
            nextCard()
        }
    }

    const handleIncorrect = () => {
        if (currentCard) {
            markIncorrect(currentCard.text)
        }
        setIsFlipped(false)
        if (currentCardIndex < sessionCards.length - 1) {
            nextCard()
        }
    }

    const handlePrevious = () => {
        setIsFlipped(false)
        previousCard()
    }

    const handleNext = () => {
        setIsFlipped(false)
        nextCard()
    }

    const handleShuffle = () => {
        setIsFlipped(false)
        shuffleDeck()
    }

    if (sessionCards.length === 0) {
        return (
            <div className="text-center py-12 space-y-4">
                <p className="text-text-secondary">
                    No flashcards available. Parse lyrics first to create a deck!
                </p>
                {kanjiTokens.length > 0 && currentSong && (
                    <Button
                        onClick={() => {
                            useAnkiStore.getState().createDeck(currentSong.id, kanjiTokens)
                            startSession(currentSong.id)
                        }}
                    >
                        Create Deck from Current Lyrics
                    </Button>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">
                        Card {progress.current} of {progress.total}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShuffle}
                        className="gap-1"
                    >
                        <Shuffle size={14} />
                        Shuffle
                    </Button>
                </div>
                <div className="h-1 rounded-full bg-bg-tertiary overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-accent-cyan to-accent-pink"
                        initial={{ width: 0 }}
                        animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                </div>
            </div>

            {/* Flashcard */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentCardIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                >
                    <Flashcard
                        token={currentCard}
                        isFlipped={isFlipped}
                        onFlip={handleFlip}
                        onCorrect={handleCorrect}
                        onIncorrect={handleIncorrect}
                        isTranslating={isTranslating}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-8">
                <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={currentCardIndex === 0}
                >
                    <ArrowLeft size={20} />
                    Previous
                </Button>

                <Button
                    variant="ghost"
                    onClick={handleNext}
                    disabled={currentCardIndex >= sessionCards.length - 1}
                >
                    Next
                    <ArrowRight size={20} />
                </Button>
            </div>

            {/* Stats */}
            <ProgressTracker compact />
        </div>
    )
}
