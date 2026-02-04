import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, BookOpen, Zap, Sparkles } from 'lucide-react'
import PageContainer, { PageTitle } from '../components/layout/PageContainer'
import LyricInput from '../components/lyrics/LyricInput'
import LyricDisplay from '../components/lyrics/LyricDisplay'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useLyricStore } from '../stores/useLyricStore'
import { ROUTES } from '../utils/constants'
import { cn } from '../utils/helpers'

export default function HomePage() {
    const navigate = useNavigate()
    const { parsedLines, kanjiTokens, currentSong } = useLyricStore()
    const [showLyrics, setShowLyrics] = useState(false)

    const hasParsedLyrics = parsedLines.length > 0

    const handleParsed = () => {
        setShowLyrics(true)
    }

    const modeCards = [
        {
            icon: Mic,
            title: 'Karaoke Mode',
            description: 'Synchronized lyrics with bouncing ball highlight',
            route: ROUTES.KARAOKE,
            color: 'accent-cyan'
        },
        {
            icon: BookOpen,
            title: 'Anki Mode',
            description: 'Flashcard practice with mastery tracking',
            route: ROUTES.ANKI,
            color: 'accent-pink'
        },
        {
            icon: Zap,
            title: 'Speed Runner',
            description: 'Race against time to match kanji readings',
            route: ROUTES.SPEED_RUNNER,
            color: 'accent-gold'
        }
    ]

    return (
        <PageContainer>
            <PageTitle subtitle="Transform song lyrics into kanji mastery">
                <span className="inline-flex items-center gap-2">
                    <Sparkles className="text-accent-gold" size={28} />
                    Karaoke Sensei
                </span>
            </PageTitle>

            {/* Lyric Input */}
            <section className="mb-8">
                <LyricInput onParsed={handleParsed} />
            </section>

            {/* Parsed Lyrics Preview */}
            {hasParsedLyrics && (
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">
                            Parsed Lyrics
                            {currentSong && (
                                <span className="text-text-secondary font-normal ml-2">
                                    - {currentSong.title}
                                </span>
                            )}
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowLyrics(!showLyrics)}
                        >
                            {showLyrics ? 'Hide' : 'Show'}
                        </Button>
                    </div>

                    {showLyrics && <LyricDisplay showStats />}

                    {!showLyrics && (
                        <Card variant="dark" className="text-center py-4">
                            <div className="flex items-center justify-center gap-6 text-sm">
                                <div>
                                    <span className="text-2xl font-bold text-accent-cyan">{parsedLines.length}</span>
                                    <span className="text-text-muted ml-1">lines</span>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-accent-pink">{kanjiTokens.length}</span>
                                    <span className="text-text-muted ml-1">kanji</span>
                                </div>
                            </div>
                        </Card>
                    )}
                </section>
            )}

            {/* Mode Selection */}
            <section>
                <h2 className="text-lg font-semibold mb-4">Practice Modes</h2>
                <div className="grid gap-4">
                    {modeCards.map(({ icon: Icon, title, description, route, color }) => (
                        <Card
                            key={route}
                            variant="dark"
                            hover
                            onClick={() => navigate(route)}
                            className={cn(
                                'flex items-center gap-4',
                                !hasParsedLyrics && 'opacity-50 pointer-events-none'
                            )}
                        >
                            <div className={cn(
                                'p-3 rounded-xl',
                                `bg-${color}/20`
                            )}>
                                <Icon size={28} className={`text-${color}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-text-primary">{title}</h3>
                                <p className="text-sm text-text-secondary">{description}</p>
                            </div>
                        </Card>
                    ))}
                </div>

                {!hasParsedLyrics && (
                    <p className="text-center text-text-muted text-sm mt-4">
                        Parse lyrics above to unlock practice modes
                    </p>
                )}
            </section>
        </PageContainer>
    )
}
