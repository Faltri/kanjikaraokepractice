import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { UI_CONSTANTS } from './constants'

/**
 * Merge Tailwind classes with proper precedence
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

/**
 * Generate a unique ID
 */
export function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

/**
 * Pick random items from an array
 */
export function pickRandom(array, count) {
    const shuffled = shuffleArray(array)
    return shuffled.slice(0, count)
}

/**
 * Check if a character is a kanji
 */
export function isKanji(char) {
    const code = char.charCodeAt(0)
    const { CHAR_CODES } = UI_CONSTANTS
    return (code >= CHAR_CODES.KANJI_START && code <= CHAR_CODES.KANJI_END) || // CJK Unified Ideographs
        (code >= CHAR_CODES.KANJI_EXT_A_START && code <= CHAR_CODES.KANJI_EXT_A_END)    // CJK Unified Ideographs Extension A
}

/**
 * Check if a character is hiragana
 */
export function isHiragana(char) {
    const code = char.charCodeAt(0)
    const { CHAR_CODES } = UI_CONSTANTS
    return code >= CHAR_CODES.HIRAGANA_START && code <= CHAR_CODES.HIRAGANA_END
}

/**
 * Check if a character is katakana
 */
export function isKatakana(char) {
    const code = char.charCodeAt(0)
    const { CHAR_CODES } = UI_CONSTANTS
    return code >= CHAR_CODES.KATAKANA_START && code <= CHAR_CODES.KATAKANA_END
}

/**
 * Get the type of a Japanese character
 */
export function getCharType(char) {
    if (isKanji(char)) return 'kanji'
    if (isHiragana(char)) return 'hiragana'
    if (isKatakana(char)) return 'katakana'
    if (/[0-9０-９]/.test(char)) return 'number'
    if (/[a-zA-Zａ-ｚＡ-Ｚ]/.test(char)) return 'latin'
    return 'punctuation'
}

/**
 * Format time in MM:SS format
 */
export function formatTime(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Format score with commas
 */
export function formatScore(score) {
    return score.toLocaleString()
}

/**
 * Debounce function
 */
export function debounce(fn, delay) {
    let timeoutId
    return (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn(...args), delay)
    }
}

/**
 * Throttle function
 */
export function throttle(fn, limit) {
    let inThrottle
    return (...args) => {
        if (!inThrottle) {
            fn(...args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}

/**
 * Sleep for a given duration
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
}

/**
 * Linear interpolation
 */
export function lerp(start, end, progress) {
    return start + (end - start) * progress
}

/**
 * Ease out cubic for smooth animations
 */
export function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3)
}

/**
 * Convert katakana to hiragana
 */
export function toHiragana(str) {
    if (!str) return str
    return str.replace(/[\u30a1-\u30f6]/g, function (match) {
        var chr = match.charCodeAt(0) - 0x60
        return String.fromCharCode(chr)
    })
}
