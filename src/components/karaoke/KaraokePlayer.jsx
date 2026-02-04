import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import ReactPlayer from 'react-player'
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Languages } from 'lucide-react'
import { useLyricStore } from '../../stores/useLyricStore'
import { useGameStore } from '../../stores/useGameStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Modal from '../ui/Modal'
import LoadingSpinner from '../ui/LoadingSpinner'
import { aiService } from '../../engines/AIService'
import SpeedControl from './SpeedControl'
import ProgressBar from './ProgressBar'
import LyricLine from '../lyrics/LyricLine'
import { cn } from '../../utils/helpers'
import { GAME_CONFIG } from '../../utils/constants'

export default function KaraokePlayer() {
    const { parsedLines, currentSong, audioUrl, lineTranslations, updateToken } = useLyricStore()
    const [showTranslation, setShowTranslation] = useState(false)
    const {
        mode,
        speed,
        currentLineIndex,
        currentTokenIndex,
        isAutoPlaying,
        isRecording,
        startGame,
        pauseGame,
        resumeGame,
        resetGame,
        nextLine,
        previousLine,
        nextToken,
        toggleAutoPlay,
        setLineIndex
    } = useGameStore()

    const playerRef = useRef(null)
    const timerRef = useRef(null)
    const containerRef = useRef(null)

    // Auto-advance logic
    useEffect(() => {
        const isPlaying = mode === 'playing' && isAutoPlaying

        if (!isPlaying) {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
            return
        }

        const currentLine = parsedLines[currentLineIndex]
        if (!currentLine) return

        const tokenDuration = (GAME_CONFIG.KARAOKE.LINE_DURATION / currentLine.length) / speed

        timerRef.current = setInterval(() => {
            const line = parsedLines[currentLineIndex]
            if (currentTokenIndex >= line.length - 1) {
                if (currentLineIndex >= parsedLines.length - 1) {
                    pauseGame()
                    toggleAutoPlay()
                } else {
                    nextLine()
                }
            } else {
                nextToken()
            }
        }, tokenDuration)

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [isAutoPlaying, mode, speed, currentLineIndex, currentTokenIndex, parsedLines])

    // Scroll to current line
    useEffect(() => {
        if (containerRef.current) {
            const activeElement = containerRef.current.querySelector('[data-active="true"]')
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }
    }, [currentLineIndex])

    const handlePlayPause = () => {
        if (mode === 'idle') {
            startGame()
            toggleAutoPlay()
        } else if (mode === 'playing') {
            if (isAutoPlaying) {
                toggleAutoPlay()
            }
            pauseGame()
        } else if (mode === 'paused') {
            resumeGame()
            if (!isAutoPlaying) {
                toggleAutoPlay()
            }
        }
    }

    const handleRestart = () => {
        if (playerRef.current) {
            playerRef.current.seekTo(0)
        }
        resetGame()
        startGame()
        if (!isAutoPlaying) {
            toggleAutoPlay()
        }
    }

    const handleLineClick = (lineIndex, e) => {
        e?.stopPropagation()
        setLineIndex(lineIndex)
        // If we had timestamps, we would seek audio here
        // if (playerRef.current && lineTimings[lineIndex]) playerRef.current.seekTo(lineTimings[lineIndex])
    }

    const [selectedToken, setSelectedToken] = useState(null)
    const [verificationData, setVerificationData] = useState(null)
    const [verifying, setVerifying] = useState(false)

    const handleBackgroundClick = (e) => {
        // Ignore if clicking interactive elements
        // .jp-text is usage in TokenBlock
        if (e.target.closest('button') || e.target.closest('.modal-content') || e.target.closest('.jp-text')) return
        nextLine()
    }

    // ... (keep verifyTokenWithAI and handleTokenClick same)

    const verifyTokenWithAI = async (token) => {
        setVerifying(true)

        // Ensure API Key and Model are set
        const { geminiApiKey, geminiModel } = useSettingsStore.getState()
        if (geminiApiKey) {
            aiService.setApiKey(geminiApiKey)
        }
        if (geminiModel) {
            aiService.setModel(geminiModel)
        }

        const context = parsedLines[token.position.line].map(t => t.text).join('')
        let data = await aiService.verifyToken(token.text, context)

        // Local Fallback Algorithm: Use existing token data if AI fails
        if (!data) {
            console.warn('AI Verification failed, using local fallback.')
            data = {
                reading: token.reading, // From Kuroshiro / Local Parser
                definition: 'Definition unavailable (AI offline).',
                notes: 'Local dictionary fallback'
            }
        }

        setVerificationData(data)

        if (data && data.reading) {
            updateToken(token.id, {
                reading: data.reading,
                definition: data.definition
            })
        }
        setVerifying(false)
    }

    const handleTokenClick = (token) => {
        if (token.type !== 'kanji') return

        setSelectedToken(token)
        setVerificationData(null)

        if (token.definition) {
            setVerificationData({
                reading: token.reading,
                definition: token.definition,
                notes: token.notes || 'From text analysis'
            })
        } else {
            verifyTokenWithAI(token)
        }
    }

    const progress = parsedLines.length > 0
        ? ((currentLineIndex + (currentTokenIndex / (parsedLines[currentLineIndex]?.length || 1))) / parsedLines.length) * 100
        : 0

    if (parsedLines.length === 0) {
        return (
            <Card variant="dark" className="text-center py-12">
                <p className="text-text-secondary">
                    Load lyrics from the Home page to start karaoke mode!
                </p>
            </Card>
        )
    }

    return (
        <div className="space-y-4" onClick={handleBackgroundClick}>
            {/* Audio/Video Player */}
            {audioUrl && (
                <div className="fixed bottom-4 right-4 z-50 opacity-80 hover:opacity-100 transition-opacity rounded-xl overflow-hidden shadow-2xl border border-white/20 w-48 h-28 hidden sm:block">
                    <ReactPlayer
                        ref={playerRef}
                        url={audioUrl}
                        playing={mode === 'playing' && isAutoPlaying}
                        playbackRate={speed}
                        width="100%"
                        height="100%"
                        controls={false}
                        onEnded={() => {
                            pauseGame()
                            if (isAutoPlaying) toggleAutoPlay()
                        }}
                        onError={(e) => console.error("Player Error:", e)}
                    />
                </div>
            )}
            {/* Hidden player for mobile/audio-only fallback if needed, or just let the above handle it. 
                Actually, putting it visible is better for debugging and user trust if it is a video. 
                I made it small fixed bottom-right. */}

            {/* Only rendering one player instance. If on mobile, it might need different styling. 
                For now, let's keep it simple: If audioUrl exists, render ReactPlayer. 
                The fixed positioning ensures it doesn't break layout but is inspectable.
            */}



            {/* Song Info */}
            <div className="flex items-center justify-between">
                <div className="text-left">
                    <h2 className="text-xl font-bold gradient-text">
                        {currentSong?.title || 'Untitled Song'}
                    </h2>
                    <p className="text-text-secondary">
                        {currentSong?.artist || 'Unknown Artist'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant={isRecording ? "neon-red" : "ghost"}
                        size="sm"
                        onClick={() => {
                            useGameStore.getState().setIsRecording(!isRecording)
                            if (!isRecording) {
                                // Start recording: Set start time for current line
                                useGameStore.getState().setStartTime(Date.now())
                            } else {
                                // Stop recording
                                useGameStore.getState().setStartTime(null)
                            }
                        }}
                        className={cn(
                            "transition-colors",
                            isRecording && "animate-pulse"
                        )}
                        title={isRecording ? "Stop Recording Timings" : "Record Line Timings"}
                    >
                        <div className={cn("w-3 h-3 rounded-full mr-2", isRecording ? "bg-red-500" : "bg-text-secondary")} />
                        {isRecording ? "REC" : "Timing"}
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                            const newShow = !showTranslation
                            setShowTranslation(newShow)

                            // If showing and translations are missing/empty, try to generate them
                            if (newShow && (!lineTranslations || lineTranslations.length === 0 || lineTranslations.every(t => !t))) {
                                const apiKey = useSettingsStore.getState().geminiApiKey
                                if (!apiKey) return

                                const parsedLines = useLyricStore.getState().parsedLines
                                const lines = parsedLines.map(line => line.map(t => t.text).join(''))

                                aiService.setApiKey(apiKey)

                                const translations = await aiService.generateTranslations(lines)
                                if (translations) {
                                    useLyricStore.getState().setParsedData(
                                        parsedLines,
                                        useLyricStore.getState().allTokens,
                                        useLyricStore.getState().kanjiTokens,
                                        translations
                                    )
                                }
                            }
                        }}
                        className={cn(
                            "transition-colors",
                            showTranslation ? "text-accent-cyan bg-accent-cyan/10" : "text-text-secondary hover:text-text-primary"
                        )}
                        title="Toggle English Translation"
                    >
                        <Languages size={20} />
                    </Button>
                    {audioUrl && (
                        <div className="px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-medium animate-pulse">
                            Audio Sync Active
                        </div>
                    )}
                </div>
            </div>

            {/* Progress */}
            <ProgressBar
                progress={progress}
                currentLine={currentLineIndex + 1}
                totalLines={parsedLines.length}
            />

            {/* Lyrics Display */}
            <Card variant="dark" padding="none" className="overflow-hidden border-white/5">
                <div
                    ref={containerRef}
                    className="h-[45vh] overflow-y-auto py-12 px-6 scroll-smooth lyric-container group"
                >
                    <style>{`
                        .lyric-container:not(:hover) .furigana-text,
                        .lyric-container:not(:hover) .romaji-text {
                            opacity: 0;
                            transition: opacity 0.3s ease-out;
                        }
                        .lyric-container:hover .furigana-text,
                        .lyric-container:hover .romaji-text {
                            opacity: 1;
                            transition: opacity 0.2s ease-in;
                        }
                    `}</style>
                    <div className="max-w-2xl mx-auto space-y-6">
                        {parsedLines.map((tokens, lineIndex) => (
                            <motion.div
                                key={lineIndex}
                                data-active={lineIndex === currentLineIndex}
                                onClick={(e) => handleLineClick(lineIndex, e)}
                                className={cn(
                                    'transition-all duration-500 rounded-xl p-4',
                                    lineIndex === currentLineIndex
                                        ? 'bg-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]'
                                        : 'opacity-20 blur-[1px] hover:blur-0 hover:opacity-50'
                                )}
                                animate={{
                                    scale: lineIndex === currentLineIndex ? 1.05 : 1,
                                    y: lineIndex === currentLineIndex ? -5 : 0
                                }}
                            >
                                <LyricLine
                                    tokens={tokens}
                                    isActive={lineIndex === currentLineIndex}
                                    highlightedTokenIndex={
                                        lineIndex === currentLineIndex ? currentTokenIndex : -1
                                    }
                                    onTokenClick={handleTokenClick}
                                />
                                {showTranslation && (
                                    <p className="text-sm text-text-secondary/80 mt-2 text-center font-medium italic">
                                        {lineTranslations[lineIndex] || 'Translation not available'}
                                    </p>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Speed Control */}
            <SpeedControl />

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 pt-2">
                <Button
                    variant="ghost"
                    size="lg"
                    onClick={previousLine}
                    disabled={currentLineIndex === 0}
                    className="rounded-full w-12 h-12 p-0"
                >
                    <SkipBack size={24} />
                </Button>

                <Button
                    size="xl"
                    onClick={handlePlayPause}
                    variant="neon"
                    className="w-20 h-20 rounded-full shadow-cyan-glow"
                >
                    {mode === 'playing' && isAutoPlaying ? (
                        <Pause size={32} fill="currentColor" />
                    ) : (
                        <Play size={32} className="ml-1" fill="currentColor" />
                    )}
                </Button>

                <Button
                    variant="ghost"
                    size="lg"
                    onClick={nextLine}
                    disabled={currentLineIndex >= parsedLines.length - 1}
                    className="rounded-full w-12 h-12 p-0"
                >
                    <SkipForward size={24} />
                </Button>

                <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleRestart}
                    className="rounded-full w-12 h-12 p-0"
                >
                    <RotateCcw size={20} />
                </Button>
            </div>

            {!audioUrl && (
                <p className="text-center text-xs text-text-muted italic">
                    Note: Add an audio URL in the Home page to hear music during karaoke.
                </p>
            )}

            {/* Verification Modal */}
            <Modal
                isOpen={!!selectedToken}
                onClose={() => setSelectedToken(null)}
                title={`Kanji Verification: ${selectedToken?.text || ''}`}
                showClose={true}
            >
                <div className="space-y-4 p-2">
                    {verifying ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-4">
                            <LoadingSpinner size={32} />
                            <p className="text-text-secondary animate-pulse">Analyzing context...</p>
                        </div>
                    ) : verificationData ? (
                        <>
                            {/* Reading */}
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">Reading</p>
                                <p className="text-2xl font-bold text-accent-cyan">{verificationData.reading}</p>
                            </div>
                            {/* Meaning */}
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">Meaning (Contextual)</p>
                                <p className="text-lg text-text-primary">{verificationData.definition}</p>
                            </div>
                            {/* Notes */}
                            {verificationData.notes && (
                                <div className="text-sm text-text-muted italic border-l-2 border-accent-pink/50 pl-3">
                                    {verificationData.notes}
                                </div>
                            )}

                            <div className="pt-2 flex justify-end">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => verifyTokenWithAI(selectedToken)}
                                    disabled={verifying}
                                >
                                    <span className="text-accent-pink">Re-Verify with AI</span>
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 text-text-secondary">
                            Could not retrieve data.
                            <Button onClick={() => verifyTokenWithAI(selectedToken)} className="mt-4">Try Again</Button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    )
}

