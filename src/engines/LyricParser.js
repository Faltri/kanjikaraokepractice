import Kuroshiro from 'kuroshiro'
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji'
import { generateId, isKanji, isHiragana, isKatakana, getCharType } from '../utils/helpers'
import { TOKEN_TYPES } from '../utils/constants'
import { aiService } from './AIService'

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

            // Use CDN for dictionary files to avoid local serving issues with .gz files
            const dictPath = 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/'
            console.log('Initializing Kuromoji with CDN dictPath:', dictPath)

            this.analyzer = new KuromojiAnalyzer({
                dictPath: dictPath
            })

            await this.kuroshiro.init(this.analyzer)

            this.initialized = true
            this.onProgress?.('Dictionary loaded!')
            return true
        } catch (error) {
            console.error('Failed to initialize Kuroshiro:', error)
            this.onProgress?.('Failed to load dictionary')
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
                console.error('AI Refinement failed:', e)
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

        // Get reading for the entire line first
        const hiragana = await this.kuroshiro.convert(line, { to: 'hiragana' })
        const romaji = await this.kuroshiro.convert(line, { to: 'romaji' })

        // Tokenize by character groups
        let currentGroup = { text: '', type: null }
        let charIndex = 0

        for (const char of line) {
            const charType = getCharType(char)

            if (charType !== currentGroup.type && currentGroup.text) {
                // Save current group and start new one
                const token = await this.createToken(
                    currentGroup.text,
                    currentGroup.type,
                    lineIndex,
                    startTokenIndex + tokens.length
                )
                tokens.push(token)
                currentGroup = { text: '', type: null }
            }

            currentGroup.text += char
            currentGroup.type = charType
            charIndex++
        }

        // Don't forget the last group
        if (currentGroup.text) {
            const token = await this.createToken(
                currentGroup.text,
                currentGroup.type,
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
                console.warn('Failed to convert:', text, e)
            }
        } else if (type === TOKEN_TYPES.HIRAGANA) {
            try {
                romaji = await this.kuroshiro.convert(text, { to: 'romaji' })
            } catch (e) {
                console.warn('Failed to convert to romaji:', text, e)
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
