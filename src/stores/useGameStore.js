import { create } from 'zustand'
import { GAME_CONFIG } from '../utils/constants'
import { useLyricStore } from './useLyricStore'

const initialState = {
    mode: 'idle', // 'idle' | 'playing' | 'paused' | 'gameover'
    speed: GAME_CONFIG.KARAOKE.DEFAULT_SPEED,
    difficulty: 'MEDIUM',
    isRecording: false, // New state for timing recording mode

    // Karaoke state
    currentLineIndex: 0,
    currentTokenIndex: 0,
    isAutoPlaying: false,

    // Speed Runner state
    score: 0,
    combo: 0,
    maxCombo: 0,
    correctCount: 0,
    incorrectCount: 0,
    currentKanjiIndex: 0,
    timeRemaining: GAME_CONFIG.SPEED_RUNNER.BASE_TIME_PER_KANJI,
    fallingKanji: [],

    // Session stats
    sessionStartTime: null,
    sessionEndTime: null
}

export const useGameStore = create((set, get) => ({
    ...initialState,

    // Speed control
    setSpeed: (speed) => set({
        speed: Math.max(GAME_CONFIG.KARAOKE.MIN_SPEED,
            Math.min(GAME_CONFIG.KARAOKE.MAX_SPEED, speed))
    }),

    incrementSpeed: () => {
        const current = get().speed
        const newSpeed = Math.min(GAME_CONFIG.KARAOKE.MAX_SPEED, current + GAME_CONFIG.KARAOKE.SPEED_STEP)
        set({ speed: Math.round(newSpeed * 10) / 10 })
    },

    decrementSpeed: () => {
        const current = get().speed
        const newSpeed = Math.max(GAME_CONFIG.KARAOKE.MIN_SPEED, current - GAME_CONFIG.KARAOKE.SPEED_STEP)
        set({ speed: Math.round(newSpeed * 10) / 10 })
    },

    // Difficulty control
    setDifficulty: (difficulty) => set({ difficulty }),

    // Game flow
    startGame: () => set({
        mode: 'playing',
        score: 0,
        combo: 0,
        maxCombo: 0,
        correctCount: 0,
        incorrectCount: 0,
        currentKanjiIndex: 0,
        currentLineIndex: 0,
        currentTokenIndex: 0,
        timeRemaining: GAME_CONFIG.SPEED_RUNNER.BASE_TIME_PER_KANJI,
        sessionStartTime: Date.now(),
        sessionEndTime: null
    }),

    pauseGame: () => set({ mode: 'paused' }),

    resumeGame: () => set({ mode: 'playing' }),

    endGame: () => set({
        mode: 'gameover',
        sessionEndTime: Date.now()
    }),

    resetGame: () => set(initialState),

    // Karaoke mode
    nextLine: () => {
        const state = get()

        // Timing Recording Logic
        if (state.isRecording && state.sessionStartTime) {
            const duration = Date.now() - state.sessionStartTime
            useLyricStore.getState().updateLineTiming(state.currentLineIndex, duration)
            console.log(`Recorded timing for line ${state.currentLineIndex}: ${duration}ms`)

            // Reset start time for the next line
            set({ sessionStartTime: Date.now() })
        }

        set({
            currentLineIndex: state.currentLineIndex + 1,
            currentTokenIndex: 0
        })
    },

    previousLine: () => {
        const state = get()
        if (state.currentLineIndex > 0) {
            set({
                currentLineIndex: state.currentLineIndex - 1,
                currentTokenIndex: 0
            })
        }
    },

    setLineIndex: (index) => set({ currentLineIndex: index, currentTokenIndex: 0 }),

    nextToken: () => {
        set(state => ({ currentTokenIndex: state.currentTokenIndex + 1 }))
    },

    toggleAutoPlay: () => set(state => ({ isAutoPlaying: !state.isAutoPlaying })),

    setIsRecording: (isRecording) => set({ isRecording }),

    setStartTime: (time) => set({ sessionStartTime: time }),

    // Speed Runner mode
    submitAnswer: (isCorrect) => {
        const state = get()
        const difficultyConfig = GAME_CONFIG.SPEED_RUNNER.DIFFICULTY[state.difficulty]

        if (isCorrect) {
            const comboBonus = Math.min(state.combo * GAME_CONFIG.SPEED_RUNNER.COMBO_MULTIPLIER, GAME_CONFIG.SPEED_RUNNER.MAX_COMBO_BONUS)
            const baseScore = 100
            const scoreGain = Math.floor(baseScore * (1 + comboBonus) * difficultyConfig.speedMultiplier)

            set({
                score: state.score + scoreGain,
                combo: state.combo + 1,
                maxCombo: Math.max(state.maxCombo, state.combo + 1),
                correctCount: state.correctCount + 1,
                currentKanjiIndex: state.currentKanjiIndex + 1,
                timeRemaining: GAME_CONFIG.SPEED_RUNNER.BASE_TIME_PER_KANJI + difficultyConfig.timeBonus
            })
        } else {
            set({
                combo: 0,
                incorrectCount: state.incorrectCount + 1,
                currentKanjiIndex: state.currentKanjiIndex + 1,
                timeRemaining: GAME_CONFIG.SPEED_RUNNER.BASE_TIME_PER_KANJI + difficultyConfig.timeBonus
            })
        }
    },

    updateTimeRemaining: (delta) => {
        const state = get()
        const newTime = state.timeRemaining - delta
        if (newTime <= 0) {
            // Time's up - count as incorrect
            set({
                combo: 0,
                incorrectCount: state.incorrectCount + 1,
                currentKanjiIndex: state.currentKanjiIndex + 1,
                timeRemaining: GAME_CONFIG.SPEED_RUNNER.BASE_TIME_PER_KANJI
            })
        } else {
            set({ timeRemaining: newTime })
        }
    },

    setFallingKanji: (kanji) => set({ fallingKanji: kanji }),

    // Computed
    getAccuracy: () => {
        const { correctCount, incorrectCount } = get()
        const total = correctCount + incorrectCount
        return total === 0 ? 0 : Math.round((correctCount / total) * 100)
    },

    getSessionDuration: () => {
        const { sessionStartTime, sessionEndTime } = get()
        if (!sessionStartTime) return 0
        const endTime = sessionEndTime || Date.now()
        return endTime - sessionStartTime
    }
}))
