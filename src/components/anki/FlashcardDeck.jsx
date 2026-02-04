import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, ArrowLeft, ArrowRight } from 'lucide-react'
import { useAnkiStore } from '../../stores/useAnkiStore'
import { useLyricStore } from '../../stores/useLyricStore'
import Flashcard from './Flashcard'
import Button from '../ui/Button'
import ProgressTracker from './ProgressTracker'
import { cn } from '../../utils/helpers'

export default function FlashcardDeck() {
    const [isFlipped, setIsFlipped] = useState(false)

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

    const { kanjiTokens, currentSong } = useLyricStore()

    const currentCard = sessionCards[currentCardIndex]
    const progress = getSessionProgress()

    // Auto-start session if we have kanji and (no session OR deck mismatch)
    useEffect(() => {
        if (kanjiTokens.length > 0 && currentSong?.id) {
            if (sessionCards.length === 0 || currentDeckId !== currentSong.id) {
                // Create deck/ensure deck exists and start session
                useAnkiStore.getState().createDeck(currentSong.id, kanjiTokens)
                startSession(currentSong.id)
            }
        }
    }, [kanjiTokens, currentSong, currentDeckId, sessionCards.length, startSession])

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
