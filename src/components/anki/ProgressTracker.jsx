import { useAnkiStore } from '../../stores/useAnkiStore'
import { useLyricStore } from '../../stores/useLyricStore'
import Card from '../ui/Card'
import { cn } from '../../utils/helpers'

export default function ProgressTracker({ compact = false }) {
    const { masteredKanji, reviewHistory, currentDeckId, getDeckStats } = useAnkiStore()
    const { kanjiTokens, currentSong } = useLyricStore()

    const deckId = currentDeckId || currentSong?.id
    const stats = deckId ? getDeckStats(deckId) : null

    // Calculate overall stats
    const totalReviews = Object.values(reviewHistory).reduce(
        (acc, h) => acc + h.correct + h.incorrect,
        0
    )
    const totalCorrect = Object.values(reviewHistory).reduce(
        (acc, h) => acc + h.correct,
        0
    )
    const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0

    if (compact) {
        return (
            <div className="flex items-center justify-center gap-6 text-sm">
                <div className="text-center">
                    <div className="text-xl font-bold text-accent-green">{masteredKanji.length}</div>
                    <div className="text-text-muted text-xs">Mastered</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-accent-cyan">{accuracy}%</div>
                    <div className="text-text-muted text-xs">Accuracy</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-accent-pink">{totalReviews}</div>
                    <div className="text-text-muted text-xs">Reviews</div>
                </div>
            </div>
        )
    }

    return (
        <Card variant="dark">
            <h3 className="text-lg font-semibold mb-4">Progress</h3>

            {stats && (
                <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-text-secondary">Current Deck</span>
                            <span className="text-accent-cyan font-medium">{stats.progress}%</span>
                        </div>
                        <div className="h-3 rounded-full bg-bg-tertiary overflow-hidden flex">
                            <div
                                className="h-full bg-accent-green transition-all"
                                style={{ width: `${stats.progress}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-xs text-text-muted mt-1">
                            <span>{stats.mastered} mastered</span>
                            <span>{stats.learning} learning</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-accent-green">{masteredKanji.length}</div>
                            <div className="text-text-muted text-xs">Total Mastered</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-accent-cyan">{accuracy}%</div>
                            <div className="text-text-muted text-xs">Accuracy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-accent-pink">{totalReviews}</div>
                            <div className="text-text-muted text-xs">Total Reviews</div>
                        </div>
                    </div>
                </div>
            )}

            {!stats && (
                <p className="text-text-secondary text-sm">
                    No deck loaded. Start a session to track progress.
                </p>
            )}
        </Card>
    )
}
