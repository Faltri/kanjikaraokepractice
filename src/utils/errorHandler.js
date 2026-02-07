/**
 * Centralized error handling utility
 * Provides consistent error formatting and user-friendly messages
 */

/**
 * Error types for categorization
 */
export const ERROR_TYPES = {
    NETWORK: 'network',
    API: 'api',
    VALIDATION: 'validation',
    PARSING: 'parsing',
    STORAGE: 'storage',
    UNKNOWN: 'unknown'
}

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
    [ERROR_TYPES.NETWORK]: {
        timeout: 'Request timed out. Please check your internet connection and try again.',
        offline: 'You appear to be offline. Please check your internet connection.',
        failed: 'Network request failed. Please try again later.',
        default: 'A network error occurred. Please try again.'
    },
    [ERROR_TYPES.API]: {
        unauthorized: 'API key is invalid or expired. Please check your settings.',
        forbidden: 'Access denied. Please check your API key permissions.',
        notFound: 'The requested resource was not found.',
        rateLimit: 'Too many requests. Please wait a moment and try again.',
        serverError: 'The API server encountered an error. Please try again later.',
        default: 'An API error occurred. Please check your settings and try again.'
    },
    [ERROR_TYPES.VALIDATION]: {
        empty: 'This field cannot be empty.',
        invalid: 'Invalid input. Please check your input and try again.',
        tooLong: 'Input is too long. Please shorten it.',
        default: 'Validation failed. Please check your input.'
    },
    [ERROR_TYPES.PARSING]: {
        invalidFormat: 'Invalid format. Please check your input.',
        parseError: 'Failed to parse the data. Please check the format.',
        default: 'A parsing error occurred. Please check your input.'
    },
    [ERROR_TYPES.STORAGE]: {
        quotaExceeded: 'Storage quota exceeded. Please clear some data and try again.',
        unavailable: 'Storage is unavailable. Some features may not work.',
        default: 'A storage error occurred.'
    },
    [ERROR_TYPES.UNKNOWN]: {
        default: 'An unexpected error occurred. Please try again or contact support.'
    }
}

/**
 * Categorize an error
 */
function categorizeError(error) {
    if (!error) return ERROR_TYPES.UNKNOWN

    const errorMessage = error.message?.toLowerCase() || ''
    const errorName = error.name?.toLowerCase() || ''

    // Network errors
    if (errorName === 'aborterror' || errorMessage.includes('timeout') || errorMessage.includes('network')) {
        return ERROR_TYPES.NETWORK
    }

    // API errors
    if (errorMessage.includes('api') || errorMessage.includes('unauthorized') || 
        errorMessage.includes('forbidden') || errorMessage.includes('rate limit')) {
        return ERROR_TYPES.API
    }

    // Storage errors
    if (errorName === 'quotaexceedederror' || errorMessage.includes('quota') || 
        errorMessage.includes('storage')) {
        return ERROR_TYPES.STORAGE
    }

    // Validation errors
    if (errorMessage.includes('invalid') || errorMessage.includes('validation') || 
        errorMessage.includes('required')) {
        return ERROR_TYPES.VALIDATION
    }

    // Parsing errors
    if (errorMessage.includes('parse') || errorMessage.includes('json') || 
        errorName === 'syntaxerror') {
        return ERROR_TYPES.PARSING
    }

    return ERROR_TYPES.UNKNOWN
}

/**
 * Get user-friendly error message
 */
function getUserMessage(error, type) {
    const category = type || categorizeError(error)
    const messages = ERROR_MESSAGES[category] || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN]
    const errorMessage = error?.message?.toLowerCase() || ''

    // Check for specific error patterns
    if (category === ERROR_TYPES.NETWORK) {
        if (error?.name === 'AbortError' || errorMessage.includes('timeout')) {
            return messages.timeout
        }
        if (errorMessage.includes('offline') || !navigator.onLine) {
            return messages.offline
        }
        return messages.failed
    }

    if (category === ERROR_TYPES.API) {
        if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
            return messages.unauthorized
        }
        if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
            return messages.forbidden
        }
        if (errorMessage.includes('not found') || errorMessage.includes('404')) {
            return messages.notFound
        }
        if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
            return messages.rateLimit
        }
        if (errorMessage.includes('500') || errorMessage.includes('server')) {
            return messages.serverError
        }
        return messages.default
    }

    if (category === ERROR_TYPES.STORAGE) {
        if (error?.name === 'QuotaExceededError' || errorMessage.includes('quota')) {
            return messages.quotaExceeded
        }
        return messages.unavailable
    }

    return messages.default
}

/**
 * Format error for display
 * @param {Error|string} error - The error object or message
 * @param {string} type - Optional error type override
 * @returns {Object} Formatted error object with user-friendly message
 */
export function formatError(error, type = null) {
    if (typeof error === 'string') {
        error = new Error(error)
    }

    const category = type || categorizeError(error)
    const userMessage = getUserMessage(error, category)

    return {
        type: category,
        message: userMessage,
        originalError: error,
        timestamp: Date.now()
    }
}

/**
 * Log error with context
 */
export function logError(error, context = '') {
    const formatted = formatError(error)
    
    if (process.env.NODE_ENV === 'development') {
        console.group(`[Error] ${context || 'Unhandled Error'}`)
        console.error('Type:', formatted.type)
        console.error('User Message:', formatted.message)
        console.error('Original Error:', formatted.originalError)
        console.groupEnd()
    } else {
        // In production, you might want to send to error tracking service
        console.error(`[${formatted.type}] ${formatted.message}`, formatted.originalError)
    }

    return formatted
}

/**
 * Handle error and return user-friendly message
 * Use this in try-catch blocks
 */
export function handleError(error, context = '') {
    const formatted = logError(error, context)
    return formatted.message
}
