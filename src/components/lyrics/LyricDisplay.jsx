import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLyricStore } from '../../stores/useLyricStore'
import { useGameStore } from '../../stores/useGameStore'
import LyricLine from './LyricLine'
import Card from '../ui/Card'
import { cn } from '../../utils/helpers'
import TokenAnalyzer from '../../engines/TokenAnalyzer'

export default function LyricDisplay({
    onTokenClick,
    autoScroll = true,
    showStats = true
}) {
    const { parsedLines, allTokens, currentSong } = useLyricStore()
    const { currentLineIndex, currentTokenIndex } = useGameStore()
    const containerRef = useRef(null)
    const activeLineRef = useRef(null)

    // Auto-scroll to active line
    useEffect(() => {
        if (autoScroll && activeLineRef.current && containerRef.current) {
            activeLineRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }
    }, [currentLineIndex, autoScroll])

    if (parsedLines.length === 0) {
        return (
            <Card variant="dark" className="text-center py-12">
                <p className="text-text-secondary">
                    No lyrics loaded yet. Enter lyrics above to get started!
                </p>
            </Card>
        )
    }

    const stats = TokenAnalyzer.getStats(allTokens)

    return (
        <div className="space-y-4">
            {/* Song Info */}
            {currentSong && (
                <div className="text-center">
                    <h2 className="text-xl font-bold gradient-text">{currentSong.title}</h2>
                    <p className="text-text-secondary">{currentSong.artist}</p>
                </div>
            )}

            {/* Stats */}
            {showStats && (
                <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-accent-cyan">{stats.uniqueKanjiCount}</div>
                        <div className="text-text-muted">Unique Kanji</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-accent-pink">{parsedLines.length}</div>
                        <div className="text-text-muted">Lines</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-accent-gold">{stats.totalTokens}</div>
                        <div className="text-text-muted">Tokens</div>
                    </div>
                </div>
            )}

            {/* Lyrics Container */}
            <Card variant="dark" padding="lg">
                <div
                    ref={containerRef}
                    className="max-h-[50vh] overflow-y-auto space-y-1 jp-text pt-6 px-2"
                >
                    {parsedLines.map((tokens, lineIndex) => (
                        <motion.div
                            key={lineIndex}
                            ref={lineIndex === currentLineIndex ? activeLineRef : null}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: lineIndex * 0.05 }}
                        >
                            <LyricLine
                                tokens={tokens}
                                isActive={lineIndex === currentLineIndex}
                                highlightedTokenIndex={
                                    lineIndex === currentLineIndex ? currentTokenIndex : -1
                                }
                                onTokenClick={onTokenClick}
                            />
                        </motion.div>
                    ))}
                </div>
            </Card>
        </div>
    )
}
