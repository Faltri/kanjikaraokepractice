// Game configuration constants
export const GAME_CONFIG = {
    // Speed Runner settings
    SPEED_RUNNER: {
        BASE_TIME_PER_KANJI: 5000, // ms
        MIN_TIME: 1000,
        MAX_TIME: 10000,
        FALL_DURATION: 3000, // ms
        OPTIONS_COUNT: 4,
        COMBO_MULTIPLIER: 0.5,
        MAX_COMBO_BONUS: 3,
        DIFFICULTY: {
            EASY: { speedMultiplier: 0.7, timeBonus: 2000 },
            MEDIUM: { speedMultiplier: 1.0, timeBonus: 0 },
            HARD: { speedMultiplier: 1.5, timeBonus: -1000 }
        }
    },

    // Karaoke mode settings
    KARAOKE: {
        MIN_SPEED: 0.5,
        MAX_SPEED: 2.0,
        SPEED_STEP: 0.1,
        DEFAULT_SPEED: 1.0,
        LINE_DURATION: 4000, // ms per line at 1x speed
        HIGHLIGHT_TRANSITION: 300 // ms
    },

    // Anki mode settings
    ANKI: {
        MASTERY_THRESHOLD: 3, // correct reviews to master
        SESSION_SIZE: 10,
        FLIP_DURATION: 600 // ms
    }
}

// LocalStorage keys
export const STORAGE_KEYS = {
    SETTINGS: 'karaoke-sensei-settings',
    ANKI_PROGRESS: 'karaoke-sensei-anki',
    DECKS: 'karaoke-sensei-decks',
    HIGH_SCORES: 'karaoke-sensei-scores',
    RECENT_SONGS: 'karaoke-sensei-recent'
}

// Token types
export const TOKEN_TYPES = {
    KANJI: 'kanji',
    HIRAGANA: 'hiragana',
    KATAKANA: 'katakana',
    PUNCTUATION: 'punctuation',
    NUMBER: 'number',
    LATIN: 'latin'
}

// Routes
export const ROUTES = {
    HOME: '/',
    KARAOKE: '/karaoke',
    ANKI: '/anki',
    SPEED_RUNNER: '/speed-runner',
    SETTINGS: '/settings'
}

// Hiragana chart for answer generation
export const HIRAGANA_CHART = [
    'あ', 'い', 'う', 'え', 'お',
    'か', 'き', 'く', 'け', 'こ',
    'さ', 'し', 'す', 'せ', 'そ',
    'た', 'ち', 'つ', 'て', 'と',
    'な', 'に', 'ぬ', 'ね', 'の',
    'は', 'ひ', 'ふ', 'へ', 'ほ',
    'ま', 'み', 'む', 'め', 'も',
    'や', 'ゆ', 'よ',
    'ら', 'り', 'る', 'れ', 'ろ',
    'わ', 'を', 'ん'
]

// Common kanji readings for distractors
export const COMMON_READINGS = [
    'かん', 'じ', 'がく', 'せい', 'にほん', 'ご',
    'ひと', 'くに', 'やま', 'かわ', 'みず', 'ひ',
    'つき', 'た', 'うえ', 'した', 'なか', 'そと',
    'まえ', 'うしろ', 'みぎ', 'ひだり', 'おお', 'ちい'
]
