import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, RotateCcw } from 'lucide-react'
import { useGameStore } from '../../stores/useGameStore'
import { useLyricStore } from '../../stores/useLyricStore'
import TokenAnalyzer from '../../engines/TokenAnalyzer'
import FallingKanji from './FallingKanji'
import AnswerPanel from './AnswerPanel'
import ScoreBoard from './ScoreBoard'
import GameOverScreen from './GameOverScreen'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { GAME_CONFIG } from '../../utils/constants'
import { cn } from '../../utils/helpers'

export default function GameArena() {
    const [quizQueue, setQuizQueue] = useState([])
    const [currentKanji, setCurrentKanji] = useState(null)
    const [options, setOptions] = useState([])
    const [timeProgress, setTimeProgress] = useState(1)
    const [feedback, setFeedback] = useState(null) // 'correct' | 'incorrect' | null

    const timerRef = useRef(null)
    const startTimeRef = useRef(null)

    const {
        mode,
        speed,
        difficulty,
        score,
        combo,
        currentKanjiIndex,
        startGame,
        endGame,
        resetGame,
        submitAnswer,
        setDifficulty
    } = useGameStore()

    const { allTokens, kanjiTokens, currentSong } = useLyricStore()

    // Initialize quiz queue
    const initializeGame = useCallback(() => {
        const queue = TokenAnalyzer.createQuizQueue(kanjiTokens, { shuffle: true })
        setQuizQueue(queue)

        if (queue.length > 0) {
            loadKanji(queue[0], queue)
        }
    }, [kanjiTokens])

    // Load a kanji and generate options
    const loadKanji = (kanji, queue = quizQueue) => {
        if (!kanji) return

        setCurrentKanji(kanji)
        const generatedOptions = TokenAnalyzer.generateAnswerOptions(kanji, allTokens)
        setOptions(generatedOptions)
        setTimeProgress(1)
        setFeedback(null)
        startTimeRef.current = Date.now()
    }

    // Timer logic
    useEffect(() => {
        if (mode !== 'playing' || !currentKanji || feedback) {
            if (timerRef.current) {
                cancelAnimationFrame(timerRef.current)
            }
            return
        }

        const config = GAME_CONFIG.SPEED_RUNNER.DIFFICULTY[difficulty]
        const maxTime = GAME_CONFIG.SPEED_RUNNER.BASE_TIME_PER_KANJI + config.timeBonus

        const updateTimer = () => {
            const elapsed = Date.now() - startTimeRef.current
            const adjustedMaxTime = maxTime / speed
            const remaining = 1 - (elapsed / adjustedMaxTime)

            if (remaining <= 0) {
                // Time's up!
                handleAnswer(null, false)
                return
            }

            setTimeProgress(remaining)
            timerRef.current = requestAnimationFrame(updateTimer)
        }

        timerRef.current = requestAnimationFrame(updateTimer)

        return () => {
            if (timerRef.current) {
                cancelAnimationFrame(timerRef.current)
            }
        }
    }, [mode, currentKanji, speed, difficulty, feedback])

    // Handle answer selection
    const handleAnswer = (answer, isCorrect) => {
        setFeedback(isCorrect ? 'correct' : 'incorrect')
        submitAnswer(isCorrect)

        // Show feedback briefly then move to next
        setTimeout(() => {
            const nextIndex = currentKanjiIndex + 1

            if (nextIndex >= quizQueue.length) {
                endGame()
            } else {
                loadKanji(quizQueue[nextIndex])
            }
        }, 500)
    }

    // Start game
    const handleStart = () => {
        resetGame()
        initializeGame()
        startGame()
    }

    // Restart game
    const handleRestart = () => {
        resetGame()
        initializeGame()
        startGame()
    }

    // Idle state
    if (mode === 'idle') {
        return (
            <Card variant="dark" className="text-center py-12 space-y-6">
                {kanjiTokens.length === 0 ? (
                    <>
                        <p className="text-text-secondary">
                            No kanji loaded! Parse lyrics first to play Speed Runner.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold gradient-text">Speed Runner</h3>
                            <p className="text-text-secondary">
                                {kanjiTokens.length} kanji ready from "{currentSong?.title || 'current lyrics'}"
                            </p>
                        </div>

                        {/* Difficulty Selection */}
                        <div className="space-y-2">
                            <p className="text-sm text-text-secondary">Select Difficulty</p>
                            <div className="flex items-center justify-center gap-2">
                                {['EASY', 'MEDIUM', 'HARD'].map((diff) => (
                                    <Button
                                        key={diff}
                                        variant={difficulty === diff ? 'primary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setDifficulty(diff)}
                                    >
                                        {diff}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Button size="lg" onClick={handleStart}>
                            <Play size={24} />
                            Start Game
                        </Button>
                    </>
                )}
            </Card>
        )
    }

    // Game Over state
    if (mode === 'gameover') {
        return (
            <GameOverScreen
                onRestart={handleRestart}
                totalKanji={quizQueue.length}
            />
        )
    }

    // Playing state
    return (
        <div className="space-y-4">
            {/* Score Board */}
            <ScoreBoard timeProgress={timeProgress} />

            {/* Game Area */}
            <Card variant="dark" padding="lg" className="min-h-[300px] relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {currentKanji && (
                        <FallingKanji
                            key={currentKanji.id}
                            kanji={currentKanji}
                            timeProgress={timeProgress}
                            feedback={feedback}
                        />
                    )}
                </AnimatePresence>
            </Card>

            {/* Answer Panel */}
            <AnswerPanel
                options={options}
                onAnswer={handleAnswer}
                disabled={feedback !== null}
                feedback={feedback}
            />

            {/* Progress */}
            <div className="text-center text-sm text-text-secondary">
                {currentKanjiIndex + 1} / {quizQueue.length}
            </div>
        </div>
    )
}
