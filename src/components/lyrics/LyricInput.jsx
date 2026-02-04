import { useState } from 'react'
import { Search, Music2, Loader2, Sparkles } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { cn } from '../../utils/helpers'
import { useLyricStore } from '../../stores/useLyricStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { lyricParser } from '../../engines/LyricParser'
import { aiService } from '../../engines/AIService'

export default function LyricInput({ onParsed }) {

    const { rawLyrics, setRawLyrics, setAudioUrl, setSongInfo, setParsedData, setLoading, setError, isLoading } = useLyricStore()
    const { useAIRefinement, geminiApiKey, geminiModel, setUseAIRefinement } = useSettingsStore()

    const [title, setTitle] = useState(useLyricStore.getState().currentSong?.title || '')
    const [artist, setArtist] = useState(useLyricStore.getState().currentSong?.artist || '')
    const [contextInfo, setContextInfo] = useState('')
    const [audioUrl, setAudioUrlInput] = useState(useLyricStore.getState().audioUrl || '')
    const [lyrics, setLyrics] = useState(rawLyrics || '') // Initialize with persisted lyrics
    const [loadingMessage, setLoadingMessage] = useState('')

    const handleLyricsChange = (e) => {
        const text = e.target.value
        setLyrics(text)
        setRawLyrics(text)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!lyrics.trim()) return

        setLoading(true)
        // Optimistically update store with current input
        setRawLyrics(lyrics)
        if (audioUrl) setAudioUrl(audioUrl)

        if (title || artist) {
            setSongInfo(title || 'Unknown', artist || 'Unknown')
        }

        try {
            lyricParser.setProgressCallback(setLoadingMessage)

            // Parallel execution: Parse Lyrics AND Search for Audio (if missing)
            const tasks = [
                lyricParser.parse(lyrics, {
                    useAI: useAIRefinement,
                    apiKey: geminiApiKey,
                    model: geminiModel
                })
            ]

            let searchingAudio = false
            if (useAIRefinement && !audioUrl && title && artist && geminiApiKey) {
                searchingAudio = true
                aiService.setApiKey(geminiApiKey)
                tasks.push(aiService.findAudio(title, artist))
            }

            const results = await Promise.all(tasks)
            const { parsedLines, allTokens, kanjiTokens, lineTranslations } = results[0]
            const foundAudioUrl = searchingAudio ? results[1] : null

            // Update Audio if found
            if (foundAudioUrl) {
                console.log('AI found audio URL:', foundAudioUrl)
                setAudioUrl(foundAudioUrl)
                setAudioUrlInput(foundAudioUrl) // Update local input too
            }

            setParsedData(parsedLines, allTokens, kanjiTokens, lineTranslations)
            setLoadingMessage('')
            onParsed?.()
        } catch (error) {
            console.error('Parse error:', error)
            setError(error.message)
            setLoadingMessage('')
        } finally {
            setLoading(false)
        }
    }

    const handleAutoFill = async () => {
        if (!title && !artist) return

        setLoading(true)
        setLoadingMessage('AI is searching for lyrics...')

        try {
            aiService.setApiKey(geminiApiKey)
            if (geminiModel) aiService.setModel(geminiModel)

            // Fix: Use correct state variable contextInfo instead of undefined referenceUrl
            const result = await aiService.fetchSongDetails(title || 'Unknown Song', artist || 'Unknown Artist', contextInfo)

            if (result.lyrics) setLyrics(result.lyrics)
            if (result.audioUrl) setAudioUrlInput(result.audioUrl)

        } catch (error) {
            console.error('Auto-fill error:', error)
            setError('Could not fetch song details: ' + error.message)
        } finally {
            setLoading(false)
            setLoadingMessage('')
        }
    }

    const handleAudioFile = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setAudioUrlInput(url)
        }
    }

    const handleClear = () => {
        setTitle('')
        setArtist('')
        setContextInfo('') // Fix: Use correct setter
        setAudioUrlInput('')
        setLyrics('')
    }

    // Sample lyrics for testing
    const loadSample = () => {
        setTitle('Lemon')
        setArtist('米津玄師')
        setAudioUrlInput('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3') // Placeholder audio
        setLyrics(`夢ならばどれほどよかったでしょう
未だにあなたのことを夢にみる
忘れた物を取りに帰るように
古びた思い出の埃を払う

戻らない幸せがあることを
最後にあなたが教えてくれた
言えずに隠してた昏い過去も
あなたがいなきゃ永遠に昏いまま`)
    }

    return (
        <Card variant="dark" className="w-full">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Song Info */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm text-text-secondary mb-1.5">
                            Song Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="例: Lemon"
                            className={cn(
                                'w-full px-3 py-2.5 rounded-xl',
                                'bg-bg-tertiary/50 border border-white/10',
                                'text-text-primary placeholder:text-text-muted',
                                'focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30',
                                'transition-all'
                            )}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-text-secondary mb-1.5">
                            Artist
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={artist}
                                onChange={(e) => setArtist(e.target.value)}
                                placeholder="例: 米津玄師"
                                className={cn(
                                    'flex-1 px-3 py-2.5 rounded-xl min-w-0', // Use flex-1 and min-w-0 to prevent overflow
                                    'bg-bg-tertiary/50 border border-white/10',
                                    'text-text-primary placeholder:text-text-muted',
                                    'focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30',
                                    'transition-all'
                                )}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleAutoFill}
                                disabled={isLoading || (!title && !artist)}
                                title="Draft lyrics using AI"
                                className="px-3 shrink-0"
                            >
                                <Sparkles size={18} />
                            </Button>
                        </div>
                        {/* Local Error Display */}
                        {useLyricStore.getState().error && (
                            <p className="text-xs text-accent-pink mt-1 ml-1 shake-animation">
                                {useLyricStore.getState().error}
                            </p>
                        )}
                    </div>
                </div>

                {/* Specific Info / Context (Reverted from Ref URL) */}
                <div>
                    <label className="block text-sm text-text-secondary mb-1.5">
                        Specific Info (Optional) - <span className="text-text-muted text-xs">Album, Context, or Version</span>
                    </label>
                    <input
                        type="text"
                        value={contextInfo}
                        onChange={(e) => setContextInfo(e.target.value)}
                        placeholder="e.g. 'Album: STRAY SHEEP' or 'Live Version'"
                        className={cn(
                            'w-full px-3 py-2.5 rounded-xl',
                            'bg-bg-tertiary/50 border border-white/10',
                            'text-text-primary placeholder:text-text-muted',
                            'focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30',
                            'transition-all'
                        )}
                    />
                </div>

                {/* Audio Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm text-text-secondary mb-1.5">
                            Audio URL (Optional)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={audioUrl}
                                onChange={(e) => setAudioUrlInput(e.target.value)}
                                placeholder="https://example.com/song.mp3"
                                className={cn(
                                    'flex-1 px-3 py-2.5 rounded-xl min-w-0',
                                    'bg-bg-tertiary/50 border border-white/10',
                                    'text-text-primary placeholder:text-text-muted',
                                    'focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30',
                                    'transition-all'
                                )}
                            />
                            <a
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${artist}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center px-3 rounded-xl bg-bg-tertiary border border-white/10 text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/50 transition-all shrink-0"
                                title="Search on YouTube"
                            >
                                <Search size={18} />
                            </a>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-text-secondary mb-1.5">
                            Or Upload Audio File
                        </label>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={handleAudioFile}
                            className={cn(
                                'w-full px-3 py-[7px] rounded-xl',
                                'bg-bg-tertiary/50 border border-white/10',
                                'text-text-secondary text-sm cursor-pointer',
                                'file:mr-4 file:py-1 file:px-2',
                                'file:rounded-lg file:border-0',
                                'file:text-xs file:font-semibold',
                                'file:bg-accent-cyan/20 file:text-accent-cyan',
                                'hover:file:bg-accent-cyan/30'
                            )}
                        />
                    </div>
                </div>

                {/* Lyrics Input */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm text-text-secondary">
                            Lyrics (歌詞)
                        </label>
                        <div className="flex items-center gap-4">
                            <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(`${title} ${artist} 歌詞`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-text-muted hover:text-accent-cyan transition-colors"
                            >
                                Search Lyrics <Search size={12} />
                            </a>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={useAIRefinement}
                                    onChange={(e) => setUseAIRefinement(e.target.checked)}
                                    className="w-4 h-4 rounded border-white/10 bg-bg-tertiary text-accent-cyan focus:ring-accent-cyan/30"
                                />
                                <span className="text-xs text-text-muted group-hover:text-accent-cyan transition-colors">
                                    Use AI Refinement
                                </span>
                            </label>
                            <button
                                type="button"
                                onClick={loadSample}
                                className="text-xs text-accent-cyan hover:text-accent-pink transition-colors"
                            >
                                Load Sample
                            </button>
                        </div>
                    </div>

                    {useAIRefinement && !geminiApiKey && (
                        <div className="mb-3 p-3 rounded-xl bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-xs leading-relaxed">
                            <p className="font-bold mb-1">AI Refinement requires a Gemini API Key</p>
                            <p>
                                Set your key in the <a href="/settings" className="underline font-bold">Settings</a> page.
                                You can get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-bold">Google AI Studio</a>.
                            </p>
                        </div>
                    )}

                    <textarea
                        value={lyrics}
                        onChange={handleLyricsChange}
                        placeholder="ここに歌詞を貼り付けてください...&#10;Paste lyrics here..."
                        rows={6}
                        className={cn(
                            'w-full px-4 py-3 rounded-xl resize-none',
                            'bg-bg-tertiary/50 border border-white/10',
                            'text-text-primary placeholder:text-text-muted',
                            'focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30',
                            'transition-all jp-text',
                            'text-lg leading-relaxed'
                        )}
                    />
                </div>

                {/* Loading Message */}
                {loadingMessage && (
                    <div className="flex items-center gap-2 text-sm text-accent-cyan">
                        <Loader2 size={16} className="animate-spin" />
                        <span>{loadingMessage}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        type="submit"
                        disabled={!lyrics.trim() || isLoading}
                        loading={isLoading}
                        fullWidth
                    >
                        <Search size={18} />
                        Parse Lyrics
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleClear}
                        disabled={isLoading}
                    >
                        Clear
                    </Button>
                </div>
            </form>
        </Card>
    )
}
