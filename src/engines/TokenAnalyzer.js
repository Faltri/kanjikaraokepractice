import { TOKEN_TYPES, COMMON_READINGS } from '../utils/constants'
import { shuffleArray, pickRandom } from '../utils/helpers'

class TokenAnalyzer {
    /**
     * Extract unique kanji tokens from parsed data
     */
    static getUniqueKanji(tokens) {
        const seen = new Set()
        const unique = []

        for (const token of tokens) {
            if (token.type === TOKEN_TYPES.KANJI && !seen.has(token.text)) {
                seen.add(token.text)
                unique.push(token)
            }
        }

        return unique
    }

    /**
     * Sort kanji by estimated difficulty (simple heuristic)
     * - Shorter readings = generally more common/easier
     * - Characters that appear more frequently = easier
     */
    static sortByDifficulty(tokens, order = 'easy') {
        const frequency = new Map()

        // Count frequency
        for (const token of tokens) {
            const count = frequency.get(token.text) || 0
            frequency.set(token.text, count + 1)
        }

        const unique = this.getUniqueKanji(tokens)

        const sorted = unique.sort((a, b) => {
            // Higher frequency = easier
            const freqDiff = frequency.get(b.text) - frequency.get(a.text)
            if (freqDiff !== 0) return freqDiff

            // Shorter reading = probably more common
            return a.reading.length - b.reading.length
        })

        return order === 'hard' ? sorted.reverse() : sorted
    }

    /**
     * Generate distractor readings for a kanji
     * Returns array of wrong answer choices
     */
    static generateDistractors(correctReading, count = 3, allTokens = []) {
        const distractors = new Set()

        // Try to use readings from other kanji in the same lyrics first
        const otherReadings = allTokens
            .filter(t => t.type === TOKEN_TYPES.KANJI && t.reading !== correctReading)
            .map(t => t.reading)

        const shuffledOthers = shuffleArray(otherReadings)
        for (const reading of shuffledOthers) {
            if (distractors.size >= count) break
            if (reading !== correctReading && !distractors.has(reading)) {
                distractors.add(reading)
            }
        }

        // Fill remaining with common readings
        if (distractors.size < count) {
            const shuffledCommon = shuffleArray(COMMON_READINGS)
            for (const reading of shuffledCommon) {
                if (distractors.size >= count) break
                if (reading !== correctReading && !distractors.has(reading)) {
                    distractors.add(reading)
                }
            }
        }

        return Array.from(distractors).slice(0, count)
    }

    /**
     * Generate answer options for a kanji token
     * Returns shuffled array with correct answer included
     */
    static generateAnswerOptions(token, allTokens = [], optionsCount = 4) {
        const correctReading = token.reading
        const distractors = this.generateDistractors(
            correctReading,
            optionsCount - 1,
            allTokens
        )

        const options = [
            { text: correctReading, isCorrect: true },
            ...distractors.map(text => ({ text, isCorrect: false }))
        ]

        return shuffleArray(options)
    }

    /**
     * Group tokens by type for statistics
     */
    static groupByType(tokens) {
        const groups = {
            [TOKEN_TYPES.KANJI]: [],
            [TOKEN_TYPES.HIRAGANA]: [],
            [TOKEN_TYPES.KATAKANA]: [],
            [TOKEN_TYPES.PUNCTUATION]: [],
            [TOKEN_TYPES.NUMBER]: [],
            [TOKEN_TYPES.LATIN]: []
        }

        for (const token of tokens) {
            if (groups[token.type]) {
                groups[token.type].push(token)
            }
        }

        return groups
    }

    /**
     * Get statistics about parsed tokens
     */
    static getStats(tokens) {
        const groups = this.groupByType(tokens)
        const uniqueKanji = this.getUniqueKanji(tokens)

        return {
            totalTokens: tokens.length,
            kanjiCount: groups[TOKEN_TYPES.KANJI].length,
            uniqueKanjiCount: uniqueKanji.length,
            hiraganaCount: groups[TOKEN_TYPES.HIRAGANA].length,
            katakanaCount: groups[TOKEN_TYPES.KATAKANA].length,
            otherCount:
                groups[TOKEN_TYPES.PUNCTUATION].length +
                groups[TOKEN_TYPES.NUMBER].length +
                groups[TOKEN_TYPES.LATIN].length
        }
    }

    /**
     * Filter tokens for Speed Runner game
     * Only returns kanji tokens that have valid readings
     */
    static getPlayableKanji(tokens) {
        return tokens.filter(token =>
            token.type === TOKEN_TYPES.KANJI &&
            token.reading &&
            token.reading !== token.text &&
            token.reading.length > 0
        )
    }

    /**
     * Create a quiz queue from tokens
     */
    static createQuizQueue(tokens, options = {}) {
        const { shuffle = true, limit = null, excludeKanji = [] } = options

        let playable = this.getPlayableKanji(tokens)

        // Remove excluded kanji
        if (excludeKanji.length > 0) {
            const excluded = new Set(excludeKanji)
            playable = playable.filter(t => !excluded.has(t.text))
        }

        // Get unique
        const unique = this.getUniqueKanji(playable)

        // Shuffle if requested
        let queue = shuffle ? shuffleArray(unique) : unique

        // Apply limit if specified
        if (limit && limit < queue.length) {
            queue = queue.slice(0, limit)
        }

        return queue
    }
}

export default TokenAnalyzer
