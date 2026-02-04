import { motion } from 'framer-motion'
import { Trophy, RotateCcw, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../../stores/useGameStore'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { formatScore, formatTime } from '../../utils/helpers'
import { ROUTES } from '../../utils/constants'
import StorageManager from '../../engines/StorageManager'

export default function GameOverScreen({ onRestart, totalKanji }) {
    const navigate = useNavigate()
    const {
        score,
        maxCombo,
        correctCount,
        incorrectCount,
        getAccuracy,
        getSessionDuration
    } = useGameStore()

    const accuracy = getAccuracy()
    const duration = getSessionDuration()

    // Determine rank
    const getRank = () => {
        if (accuracy >= 95 && maxCombo >= totalKanji * 0.5) return { rank: 'S', color: 'text-accent-gold' }
        if (accuracy >= 85) return { rank: 'A', color: 'text-accent-cyan' }
        if (accuracy >= 70) return { rank: 'B', color: 'text-accent-green' }
        if (accuracy >= 50) return { rank: 'C', color: 'text-accent-pink' }
        return { rank: 'D', color: 'text-accent-red' }
    }

    const { rank, color } = getRank()

    // Save high score
    const saveHighScore = () => {
        StorageManager.addHighScore({
            score,
            accuracy,
            maxCombo,
            totalKanji,
            duration
        })
    }

    // Save on mount
    useState(() => {
        saveHighScore()
    })

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Card variant="neon" className="text-center space-y-6">
                {/* Trophy Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-flex p-4 rounded-full bg-gradient-to-br from-accent-gold/20 to-accent-cyan/20"
                >
                    <Trophy size={48} className="text-accent-gold" />
                </motion.div>

                <h2 className="text-2xl font-bold gradient-text">Game Complete!</h2>

                {/* Rank */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                    className={`text-8xl font-black ${color}`}
                    style={{ textShadow: '0 0 30px currentColor' }}
                >
                    {rank}
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass rounded-xl p-4">
                        <div className="text-3xl font-bold gradient-text">{formatScore(score)}</div>
                        <div className="text-text-muted text-sm">Final Score</div>
                    </div>
                    <div className="glass rounded-xl p-4">
                        <div className="text-3xl font-bold text-accent-cyan">{accuracy}%</div>
                        <div className="text-text-muted text-sm">Accuracy</div>
                    </div>
                    <div className="glass rounded-xl p-4">
                        <div className="text-3xl font-bold text-accent-pink">{maxCombo}x</div>
                        <div className="text-text-muted text-sm">Max Combo</div>
                    </div>
                    <div className="glass rounded-xl p-4">
                        <div className="text-3xl font-bold text-accent-gold">{formatTime(duration)}</div>
                        <div className="text-text-muted text-sm">Time</div>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="flex items-center justify-center gap-8 text-sm">
                    <div>
                        <span className="text-accent-green font-bold">{correctCount}</span>
                        <span className="text-text-muted ml-1">Correct</span>
                    </div>
                    <div>
                        <span className="text-accent-red font-bold">{incorrectCount}</span>
                        <span className="text-text-muted ml-1">Incorrect</span>
                    </div>
                    <div>
                        <span className="text-text-primary font-bold">{totalKanji}</span>
                        <span className="text-text-muted ml-1">Total</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-4 pt-4">
                    <Button variant="secondary" onClick={() => navigate(ROUTES.HOME)}>
                        <Home size={18} />
                        Home
                    </Button>
                    <Button onClick={onRestart}>
                        <RotateCcw size={18} />
                        Play Again
                    </Button>
                </div>
            </Card>
        </motion.div>
    )
}
