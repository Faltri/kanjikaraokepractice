import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../utils/constants'

const initialState = {
    rawLyrics: '',
    audioUrl: '',    // URL or data URI for the song audio
    parsedLines: [], // Array of arrays of tokens
    lineTranslations: [], // Array of strings (matches parsedLines index)
    lineTimings: [], // Array of timings for each line (milliseconds)
    allTokens: [],   // Flat array of all tokens
    kanjiTokens: [], // Only kanji tokens for Anki/Speed Runner
    currentSong: null,
    isLoading: false,
    isInitialized: false,
    error: null
}
export const useLyricStore = create(
    persist(
        (set, get) => ({
            ...initialState,

            setRawLyrics: (text) => set({ rawLyrics: text }),

            setAudioUrl: (url) => set({ audioUrl: url }),

            setSongInfo: (title, artist) => set({
                currentSong: { title, artist, id: `${artist}-${title}`.toLowerCase().replace(/\s+/g, '-') }
            }),

            setParsedData: (parsedLines, allTokens, kanjiTokens, lineTranslations = []) => set({
                parsedLines,
                allTokens,
                kanjiTokens,
                lineTranslations,
                isLoading: false,
                error: null
            }),

            setLoading: (loading) => set({ isLoading: loading }),

            setInitialized: (initialized) => set({ isInitialized: initialized }),

            setError: (error) => set({ error, isLoading: false }),

            clearLyrics: () => set(initialState),

            updateToken: (tokenId, updates) => set(state => {
                // Deep update parsedLines
                const newParsedLines = state.parsedLines.map(line =>
                    line.map(token =>
                        token.id === tokenId ? { ...token, ...updates } : token
                    )
                )

                // Re-derive lists to ensure consistency and triggers updates
                const newAllTokens = []
                const newKanjiTokens = []

                for (const line of newParsedLines) {
                    for (const token of line) {
                        newAllTokens.push(token)
                        if (token.type === 'kanji') newKanjiTokens.push(token)
                    }
                }

                return {
                    parsedLines: newParsedLines,
                    allTokens: newAllTokens,
                    kanjiTokens: newKanjiTokens
                }
            }),

            setLineTimings: (timings) => set({ lineTimings: timings }),

            updateLineTiming: (index, timing) => set(state => {
                const newTimings = [...(state.lineTimings || [])]
                newTimings[index] = timing
                return { lineTimings: newTimings }
            }),

            // Computed values
            getLineCount: () => get().parsedLines.length,

            getKanjiCount: () => get().kanjiTokens.length,

            getUniqueKanji: () => {
                const tokens = get().kanjiTokens
                const seen = new Set()
                return tokens.filter(token => {
                    if (seen.has(token.text)) return false
                    seen.add(token.text)
                    return true
                })
            }
        }),
        {
            name: STORAGE_KEYS.LYRICS || 'lyric-storage', // Fallback key if constant missing
            partialize: (state) => ({
                rawLyrics: state.rawLyrics,
                audioUrl: state.audioUrl,
                parsedLines: state.parsedLines,
                lineTranslations: state.lineTranslations,
                lineTimings: state.lineTimings,
                allTokens: state.allTokens,
                kanjiTokens: state.kanjiTokens,
                currentSong: state.currentSong
            }) // Only persist data, not loading states or errors
        }
    )
)
