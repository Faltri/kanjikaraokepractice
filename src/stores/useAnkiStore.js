import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS, GAME_CONFIG } from '../utils/constants'
import { shuffleArray } from '../utils/helpers'

const initialState = {
    decks: {}, // { songId: { tokens: [], createdAt: Date } }
    masteredKanji: [], // Array of kanji strings
    reviewHistory: {}, // { kanji: { correct: number, incorrect: number, lastReview: Date } }
    currentDeckId: null,
    currentCardIndex: 0,
    showReading: false,
    sessionCards: [] // Shuffled cards for current session
}

export const useAnkiStore = create(
    persist(
        (set, get) => ({
            ...initialState,

            // Deck management
            createDeck: (songId, tokens) => {
                set(state => ({
                    decks: {
                        ...state.decks,
                        [songId]: {
                            tokens,
                            createdAt: Date.now()
                        }
                    }
                }))
            },

            deleteDeck: (songId) => {
                set(state => {
                    const { [songId]: removed, ...rest } = state.decks
                    return { decks: rest }
                })
            },

            // Session management
            startSession: (deckId) => {
                const deck = get().decks[deckId]
                if (!deck) return

                const masteredSet = new Set(get().masteredKanji)
                const unmasteredCards = deck.tokens.filter(t => !masteredSet.has(t.text))
                const sessionCards = shuffleArray(unmasteredCards).slice(0, GAME_CONFIG.ANKI.SESSION_SIZE)

                set({
                    currentDeckId: deckId,
                    currentCardIndex: 0,
                    showReading: false,
                    sessionCards
                })
            },

            // Card navigation
            nextCard: () => {
                const state = get()
                if (state.currentCardIndex < state.sessionCards.length - 1) {
                    set({
                        currentCardIndex: state.currentCardIndex + 1,
                        showReading: false
                    })
                }
            },

            previousCard: () => {
                const state = get()
                if (state.currentCardIndex > 0) {
                    set({
                        currentCardIndex: state.currentCardIndex - 1,
                        showReading: false
                    })
                }
            },

            toggleReading: () => set(state => ({ showReading: !state.showReading })),

            revealReading: () => set({ showReading: true }),

            hideReading: () => set({ showReading: false }),

            // Mastery tracking
            markCorrect: (kanji) => {
                set(state => {
                    const history = state.reviewHistory[kanji] || { correct: 0, incorrect: 0 }
                    const newCorrect = history.correct + 1
                    const newHistory = {
                        ...state.reviewHistory,
                        [kanji]: {
                            ...history,
                            correct: newCorrect,
                            lastReview: Date.now()
                        }
                    }

                    // Check if now mastered
                    const isMastered = newCorrect >= GAME_CONFIG.ANKI.MASTERY_THRESHOLD
                    const newMastered = isMastered && !state.masteredKanji.includes(kanji)
                        ? [...state.masteredKanji, kanji]
                        : state.masteredKanji

                    return {
                        reviewHistory: newHistory,
                        masteredKanji: newMastered
                    }
                })
            },

            markIncorrect: (kanji) => {
                set(state => {
                    const history = state.reviewHistory[kanji] || { correct: 0, incorrect: 0 }
                    return {
                        reviewHistory: {
                            ...state.reviewHistory,
                            [kanji]: {
                                ...history,
                                incorrect: history.incorrect + 1,
                                lastReview: Date.now()
                            }
                        }
                    }
                })
            },

            toggleMastered: (kanji) => {
                set(state => {
                    const isMastered = state.masteredKanji.includes(kanji)
                    return {
                        masteredKanji: isMastered
                            ? state.masteredKanji.filter(k => k !== kanji)
                            : [...state.masteredKanji, kanji]
                    }
                })
            },

            // Shuffle current session
            shuffleDeck: () => {
                set(state => ({
                    sessionCards: shuffleArray(state.sessionCards),
                    currentCardIndex: 0,
                    showReading: false
                }))
            },

            updateCard: (text, updates) => {
                set(state => {
                    const newSessionCards = state.sessionCards.map(card =>
                        card.text === text ? { ...card, ...updates } : card
                    )

                    // Also update the card in the stored deck if possible
                    const newDecks = { ...state.decks }
                    if (state.currentDeckId && newDecks[state.currentDeckId]) {
                        newDecks[state.currentDeckId] = {
                            ...newDecks[state.currentDeckId],
                            tokens: newDecks[state.currentDeckId].tokens.map(token =>
                                token.text === text ? { ...token, ...updates } : token
                            )
                        }
                    }

                    return {
                        sessionCards: newSessionCards,
                        decks: newDecks
                    }
                })
            },

            // Reset session
            endSession: () => {
                set({
                    currentDeckId: null,
                    currentCardIndex: 0,
                    showReading: false,
                    sessionCards: []
                })
            },

            // Stats
            getDeckStats: (deckId) => {
                const state = get()
                const deck = state.decks[deckId]
                if (!deck) return null

                const masteredSet = new Set(state.masteredKanji)
                const mastered = deck.tokens.filter(t => masteredSet.has(t.text)).length

                return {
                    total: deck.tokens.length,
                    mastered,
                    learning: deck.tokens.length - mastered,
                    progress: deck.tokens.length > 0 ? Math.round((mastered / deck.tokens.length) * 100) : 0
                }
            },

            getCurrentCard: () => {
                const state = get()
                return state.sessionCards[state.currentCardIndex] || null
            },

            getSessionProgress: () => {
                const state = get()
                return {
                    current: state.currentCardIndex + 1,
                    total: state.sessionCards.length
                }
            }
        }),
        {
            name: STORAGE_KEYS.ANKI_PROGRESS
        }
    )
)
