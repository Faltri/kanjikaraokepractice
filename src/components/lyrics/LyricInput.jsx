import { useState, useEffect, useRef } from 'react'
import { Search, Music2, Loader2, Sparkles, Book } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import SongLibraryModal from './SongLibraryModal'
import { cn } from '../../utils/helpers'
import { useLyricStore } from '../../stores/useLyricStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { lyricParser } from '../../engines/LyricParser'
import { aiService } from '../../engines/AIService'
import { handleError } from '../../utils/errorHandler'
import { sanitizeLyrics, sanitizeSongMetadata, sanitizeURL, isValidYouTubeURL } from '../../utils/sanitize'
import { debounce } from '../../utils/helpers'

export default function LyricInput({ onParsed }) {

    const { rawLyrics, setRawLyrics, setAudioUrl, setSongInfo, setParsedData, setLoading, setError, isLoading } = useLyricStore()
    const { useAIRefinement, geminiApiKey, geminiModel, setUseAIRefinement } = useSettingsStore()

    const [title, setTitle] = useState(useLyricStore.getState().currentSong?.title || '')
    const [artist, setArtist] = useState(useLyricStore.getState().currentSong?.artist || '')
    const [contextInfo, setContextInfo] = useState('')
    const [audioUrl, setAudioUrlInput] = useState(useLyricStore.getState().audioUrl || '')
    const [lyrics, setLyrics] = useState(rawLyrics || '') // Initialize with persisted lyrics
    const [loadingMessage, setLoadingMessage] = useState('')
    const [isLibraryOpen, setIsLibraryOpen] = useState(false)
    const blobUrlRef = useRef(null) // Track blob URLs for cleanup

    // Sync local state with store when store updates
    useEffect(() => {
        const storeState = useLyricStore.getState()
        if (storeState.rawLyrics !== lyrics && storeState.rawLyrics) {
            setLyrics(storeState.rawLyrics)
        }
        if (storeState.audioUrl !== audioUrl && storeState.audioUrl) {
            setAudioUrlInput(storeState.audioUrl)
        }
        if (storeState.currentSong) {
            if (storeState.currentSong.title !== title) {
                setTitle(storeState.currentSong.title)
            }
            if (storeState.currentSong.artist !== artist) {
                setArtist(storeState.currentSong.artist)
            }
        }
    }, []) // Only run on mount

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current)
                blobUrlRef.current = null
            }
        }
    }, [])

    // Debounced function for updating store (keeps UI responsive)
    const debouncedSetRawLyricsRef = useRef(
        debounce((text) => {
            setRawLyrics(text)
        }, 300)
    )

    const handleLyricsChange = (e) => {
        const text = sanitizeLyrics(e.target.value)
        setLyrics(text) // Update local state immediately for responsive UI
        debouncedSetRawLyricsRef.current(text) // Debounce store update
    }

    const handleSubmit = async (e) => {
        e?.preventDefault()

        if (!lyrics.trim()) return

        setLoading(true)
        // Optimistically update store with current input
        setRawLyrics(lyrics)
        setAudioUrl(audioUrl)

        if (title || artist) {
            setSongInfo(title || 'Unknown', artist || 'Unknown')
        }

        try {
            // Sanitize inputs before processing
            const sanitizedLyrics = sanitizeLyrics(lyrics)
            if (!sanitizedLyrics.trim()) {
                setError('Please enter valid lyrics')
                setLoading(false)
                return
            }

            lyricParser.setProgressCallback(setLoadingMessage)

            // Parallel execution: Parse Lyrics AND Search for Audio (if missing)
            const tasks = [
                lyricParser.parse(sanitizedLyrics, {
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

            // Update Audio if found and valid
            if (foundAudioUrl) {
                const sanitizedAudioUrl = sanitizeURL(foundAudioUrl)
                if (sanitizedAudioUrl) {
                    setAudioUrl(sanitizedAudioUrl)
                    setAudioUrlInput(sanitizedAudioUrl)
                }
            }

            setParsedData(parsedLines, allTokens, kanjiTokens, lineTranslations)
            setLoadingMessage('')
            setError(null) // Clear any previous errors
            onParsed?.()
        } catch (error) {
            const errorMessage = handleError(error, 'Lyric parsing')
            setError(errorMessage)
            setLoadingMessage('')
        } finally {
            setLoading(false)
        }
    }

    const handleAutoFill = async () => {
        if (!title && !artist) return

        const apiKey = useSettingsStore.getState().geminiApiKey
        if (!apiKey) {
            setError('Gemini API Key is required. Please set it in Settings.')
            return
        }

        setLoading(true)
        setLoadingMessage('AI is searching for lyrics...')

        try {
            aiService.setApiKey(apiKey)
            if (geminiModel) aiService.setModel(geminiModel)

            // Fix: Use correct state variable contextInfo instead of undefined referenceUrl
            const result = await aiService.fetchSongDetails(title || 'Unknown Song', artist || 'Unknown Artist', contextInfo)

            if (result.lyrics) setLyrics(result.lyrics)
            if (result.audioUrl) setAudioUrlInput(result.audioUrl)

        } catch (error) {
            const errorMessage = handleError(error, 'Auto-fill song details')
            setError(errorMessage)
        } finally {
            setLoading(false)
            setLoadingMessage('')
        }
    }

    const handleLibrarySelect = (song) => {
        setTitle(song.title)
        setArtist(song.artist)
        setAudioUrlInput(song.audioUrl)
        setLyrics(song.lyrics)

        // Auto-update store so we can "Submit" immediately if desired
        setSongInfo(song.title, song.artist)
        setAudioUrl(song.audioUrl)
        setRawLyrics(song.lyrics)
    }

    const handleAudioFile = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/webm']
        const isValidType = validAudioTypes.includes(file.type) || 
                           /\.(mp3|wav|ogg|m4a|aac|webm)$/i.test(file.name)
        
        if (!isValidType) {
            setError('Please select a valid audio file (MP3, WAV, OGG, M4A, AAC, or WebM)')
            return
        }

        // Revoke previous blob URL if exists
        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current)
        }

        // Create new blob URL
        const url = URL.createObjectURL(file)
        blobUrlRef.current = url
        setAudioUrlInput(url)
        setError(null) // Clear any previous errors
    }

    const handleClear = () => {
        // Revoke blob URL if exists
        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current)
            blobUrlRef.current = null
        }
        
        setTitle('')
        setArtist('')
        setContextInfo('')
        setAudioUrlInput('')
        setLyrics('')
        setError(null)
    }

    // Sample lyrics for testing
    const loadSample = () => {
        setTitle('Lemon')
        setArtist('米津玄師')
        setAudioUrlInput('https://www.youtube.com/watch?v=SX_ViT4Ra7k') // Official YouTube
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
            <SongLibraryModal
                isOpen={isLibraryOpen}
                onClose={() => setIsLibraryOpen(false)}
                onSelect={handleLibrarySelect}
            />

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Header Section */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Music2 size={20} className="text-accent-cyan" />
                            New Song Details
                        </h3>
                        <p className="text-xs text-text-muted">Enter details manually or choose from library</p>
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsLibraryOpen(true)}
                        className="bg-accent-gold/10 text-accent-gold hover:bg-accent-gold/20 border-accent-gold/20"
                    >
                        <Book size={16} className="mr-2" />
                        Open Song Library
                    </Button>
                </div>

                {/* Song Info */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm text-text-secondary mb-1.5">
                            Song Title
                        </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    const sanitized = sanitizeSongMetadata(e.target.value) || ''
                                    setTitle(sanitized)
                                }}
                                placeholder="例: Lemon"
                                maxLength={200}
                                aria-label="Song title"
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
                                onChange={(e) => {
                                    const sanitized = sanitizeSongMetadata(e.target.value) || ''
                                    setArtist(sanitized)
                                }}
                                placeholder="例: 米津玄師"
                                maxLength={200}
                                aria-label="Artist name"
                                className={cn(
                                    'flex-1 px-3 py-2.5 rounded-xl min-w-0',
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
                            <div className="flex items-center gap-2 mt-1 ml-1">
                                <p className="text-xs text-accent-pink shake-animation">
                                    {useLyricStore.getState().error}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => useLyricStore.getState().setError(null)}
                                    className="text-xs text-text-muted hover:text-text-primary"
                                    aria-label="Dismiss error"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Audio Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                        <label className="block text-sm text-text-secondary mb-1.5">
                            Audio URL (Optional)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={audioUrl}
                                onChange={(e) => {
                                    const url = e.target.value
                                    // Allow empty or valid URLs
                                    if (!url || isValidYouTubeURL(url) || sanitizeURL(url)) {
                                        setAudioUrlInput(url)
                                    }
                                }}
                                placeholder="YouTube URL..."
                                aria-label="Audio URL (YouTube)"
                                className={cn(
                                    'flex-1 px-3 py-2.5 rounded-xl min-w-0',
                                    'bg-bg-tertiary/50 border border-white/10',
                                    'text-text-primary placeholder:text-text-muted',
                                    'focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30',
                                    'transition-all',
                                    audioUrl && !isValidYouTubeURL(audioUrl) && !sanitizeURL(audioUrl) && 'border-accent-pink/50'
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
                            accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.webm"
                            onChange={handleAudioFile}
                            aria-label="Upload audio file"
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
                        <p className="text-xs text-text-muted mt-1">
                            Supported formats: MP3, WAV, OGG, M4A, AAC, WebM
                        </p>
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
                        aria-label="Song lyrics"
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
