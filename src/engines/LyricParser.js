import Kuroshiro from 'kuroshiro'
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji'
import { generateId, isKanji, isHiragana, isKatakana, getCharType } from '../utils/helpers'
import { TOKEN_TYPES } from '../utils/constants'
import { aiService } from './AIService'
import { logger } from '../utils/logger'

class LyricParser {
    constructor() {
        this.kuroshiro = null
        this.analyzer = null
        this.initialized = false
        this.initializing = false
        this.onProgress = null
    }

    setProgressCallback(callback) {
        this.onProgress = callback
    }

    async initialize() {
        if (this.initialized) return true
        if (this.initializing) {
            // Wait for ongoing initialization
            while (this.initializing) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }
            return this.initialized
        }

        this.initializing = true
        this.onProgress?.('Loading Japanese dictionary...')

        try {
            this.kuroshiro = new Kuroshiro()

            // Use local dictionary files instead of CDN for reliability
            // This requires copying node_modules/kuromoji/dict/*.dat.gz to public/dict/
            const dictPath = '/dict/'
            logger.debug('Initializing Kuromoji with local dictPath:', dictPath)

            this.analyzer = new KuromojiAnalyzer({
                dictPath: dictPath
            })

            // Add timeout to prevent indefinite hanging
            const initPromise = this.kuroshiro.init(this.analyzer)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Japanese dictionary initialization timed out (60s)')), 60000)
            )

            await Promise.race([initPromise, timeoutPromise])

            this.initialized = true
            this.onProgress?.('Dictionary loaded!')
            return true
        } catch (error) {
            logger.error('Failed to initialize Kuroshiro:', error)
            this.onProgress?.('Failed to load dictionary: ' + error.message)
            // Cleanup on failure so we can retry later
            this.initialized = false
            this.kuroshiro = null
            this.analyzer = null
            throw error
        } finally {
            this.initializing = false
        }
    }

    async parse(text, options = {}) {
        await this.initialize()

        const lines = text.split('\n').filter(line => line.trim())
        let parsedLines = []
        const allTokens = []
        const kanjiTokens = []
        let lineTranslations = []

        let tokenIndex = 0

        this.onProgress?.('Tokenizing lyrics...')
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex]
            const lineTokens = await this.tokenizeLine(line, lineIndex, tokenIndex)
            parsedLines.push(lineTokens)
            tokenIndex += lineTokens.length
        }

        // AI Refinement Step
        if (options.useAI && options.apiKey) {
            this.onProgress?.('AI Refinement in progress...')
            try {
                aiService.setApiKey(options.apiKey)
                if (options.model) aiService.setModel(options.model)
                const result = await aiService.refineReadings(text, parsedLines)

                // Handle new object return or legacy array
                if (result.parsedLines) {
                    parsedLines = result.parsedLines
                    lineTranslations = result.translations || []
                } else if (Array.isArray(result)) {
                    parsedLines = result
                }
            } catch (e) {
                logger.error('AI Refinement failed:', e)
                // Fallback to original parsedLines, but warn user
            }
        }

        // Flatten and collect stats
        for (const lineTokens of parsedLines) {
            for (const token of lineTokens) {
                allTokens.push(token)
                if (token.type === TOKEN_TYPES.KANJI) {
                    kanjiTokens.push(token)
                }
            }
        }

        return { parsedLines, allTokens, kanjiTokens, lineTranslations }
    }

    async tokenizeLine(line, lineIndex, startTokenIndex) {
        const tokens = []

        // Tokenize by character groups with simple okurigana support
        let currentGroup = { text: '', type: null }

        for (const char of line) {
            const charType = getCharType(char)

            // Logic to merge Okurigana (Kanji + Hiragana suffixes)
            // If current char is Hiragana and current group is Kanji, 
            // OR if current char is Hiragana and current group is already mixed Kanji/Hiragana
            const isOkurigana = (charType === TOKEN_TYPES.HIRAGANA) &&
                (currentGroup.type === TOKEN_TYPES.KANJI || currentGroup.type === 'mixed')

            if (charType !== currentGroup.type && currentGroup.text && !isOkurigana) {
                // Save current group and start new one
                const token = await this.createToken(
                    currentGroup.text,
                    currentGroup.type === 'mixed' ? TOKEN_TYPES.KANJI : currentGroup.type, // Treat mixed as Kanji for verification
                    lineIndex,
                    startTokenIndex + tokens.length
                )
                tokens.push(token)
                currentGroup = { text: '', type: null }
            }

            // Update type if we are merging
            if (isOkurigana) {
                currentGroup.type = 'mixed'
            } else if (!currentGroup.text) {
                currentGroup.type = charType
            }

            currentGroup.text += char
            // Remove charIndex++ since it was unused and caused lint error
        }

        // Don't forget the last group
        if (currentGroup.text) {
            const token = await this.createToken(
                currentGroup.text,
                currentGroup.type === 'mixed' ? TOKEN_TYPES.KANJI : currentGroup.type,
                lineIndex,
                startTokenIndex + tokens.length
            )
            tokens.push(token)
        }

        return tokens
    }

    async createToken(text, type, lineIndex, tokenIndex) {
        let reading = text
        let romaji = text

        if (type === TOKEN_TYPES.KANJI || type === TOKEN_TYPES.KATAKANA) {
            try {
                reading = await this.kuroshiro.convert(text, { to: 'hiragana' })
                romaji = await this.kuroshiro.convert(text, { to: 'romaji' })
            } catch (e) {
                logger.warn('Failed to convert:', text, e)
            }
        } else if (type === TOKEN_TYPES.HIRAGANA) {
            try {
                romaji = await this.kuroshiro.convert(text, { to: 'romaji' })
            } catch (e) {
                logger.warn('Failed to convert to romaji:', text, e)
            }
        }

        return {
            id: generateId('token'),
            text,
            reading,
            romaji,
            type,
            position: {
                line: lineIndex,
                index: tokenIndex
            }
        }
    }

    async getReading(text) {
        await this.initialize()
        return this.kuroshiro.convert(text, { to: 'hiragana' })
    }

    async getRomaji(text) {
        await this.initialize()
        return this.kuroshiro.convert(text, { to: 'romaji' })
    }

    isReady() {
        return this.initialized
    }
}

// Singleton instance
export const lyricParser = new LyricParser()
export default LyricParser
