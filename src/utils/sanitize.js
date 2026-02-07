import { UI_CONSTANTS } from './constants'

/**
 * Input sanitization utilities
 * Prevents XSS and validates user inputs
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
    if (!html) return ''
    
    const div = document.createElement('div')
    div.textContent = html
    return div.innerHTML
}

/**
 * Sanitize text input (removes potentially dangerous characters)
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeText(text) {
    if (!text) return ''
    
    // Remove null bytes and control characters (except newlines and tabs)
    return text
        .replace(/\0/g, '')
        .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .trim()
}

/**
 * Validate and sanitize URL
 * @param {string} url - URL to validate
 * @returns {string|null} Validated URL or null if invalid
 */
export function sanitizeURL(url) {
    if (!url) return null
    
    const trimmed = url.trim()
    if (!trimmed) return null
    
    try {
        const urlObj = new URL(trimmed)
        
        // Only allow http, https protocols
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return null
        }
        
        // Check for common dangerous patterns
        const dangerousPatterns = [
            /javascript:/i,
            /data:/i,
            /vbscript:/i,
            /on\w+\s*=/i // Event handlers like onclick=
        ]
        
        for (const pattern of dangerousPatterns) {
            if (pattern.test(trimmed)) {
                return null
            }
        }
        
        return trimmed
    } catch (e) {
        // Invalid URL format
        return null
    }
}

/**
 * Validate YouTube URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid YouTube URL
 */
export function isValidYouTubeURL(url) {
    if (!url) return false
    
    const sanitized = sanitizeURL(url)
    if (!sanitized) return false
    
    try {
        const urlObj = new URL(sanitized)
        const hostname = urlObj.hostname.toLowerCase()
        
        // Allow youtube.com and youtu.be domains
        return hostname === 'www.youtube.com' || 
               hostname === 'youtube.com' || 
               hostname === 'youtu.be' ||
               hostname === 'm.youtube.com'
    } catch {
        return false
    }
}

/**
 * Sanitize lyrics input
 * Allows Japanese characters, newlines, and basic punctuation
 * @param {string} lyrics - Lyrics text
 * @returns {string} Sanitized lyrics
 */
export function sanitizeLyrics(lyrics) {
    if (!lyrics) return ''
    
    // Remove null bytes and control characters (keep newlines, tabs, carriage returns)
    return lyrics
        .replace(/\0/g, '')
        .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Limit length to prevent DoS
        .slice(0, UI_CONSTANTS.INPUT.MAX_LYRICS_LENGTH)
}

/**
 * Validate song title/artist input
 * @param {string} input - Input to validate
 * @param {number} maxLength - Maximum length (default: from constants)
 * @returns {string|null} Sanitized input or null if invalid
 */
export function sanitizeSongMetadata(input, maxLength = UI_CONSTANTS.INPUT.MAX_SONG_TITLE_LENGTH) {
    if (!input) return null
    
    const sanitized = sanitizeText(input)
    
    if (sanitized.length === 0) return null
    if (sanitized.length > maxLength) return null
    
    return sanitized
}

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
export function escapeRegex(string) {
    if (!string) return ''
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Validate API key format (basic check)
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if format looks valid
 */
export function isValidAPIKeyFormat(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') return false
    
    // Basic format check - adjust based on your API provider
    // Gemini API keys are typically alphanumeric and quite long
    return apiKey.trim().length >= UI_CONSTANTS.INPUT.MIN_API_KEY_LENGTH && /^[A-Za-z0-9_-]+$/.test(apiKey)
}
