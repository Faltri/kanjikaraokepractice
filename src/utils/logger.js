/**
 * Centralized logging utility
 * Provides consistent logging with environment-based levels
 */

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
}

// Determine log level based on environment
const getLogLevel = () => {
    if (process.env.NODE_ENV === 'production') {
        return LOG_LEVELS.ERROR // Only errors in production
    }
    return LOG_LEVELS.DEBUG // All logs in development
}

const currentLogLevel = getLogLevel()

/**
 * Logger class
 */
class Logger {
    debug(...args) {
        if (currentLogLevel <= LOG_LEVELS.DEBUG) {
            console.debug('[DEBUG]', ...args)
        }
    }

    info(...args) {
        if (currentLogLevel <= LOG_LEVELS.INFO) {
            console.info('[INFO]', ...args)
        }
    }

    warn(...args) {
        if (currentLogLevel <= LOG_LEVELS.WARN) {
            console.warn('[WARN]', ...args)
        }
    }

    error(...args) {
        if (currentLogLevel <= LOG_LEVELS.ERROR) {
            console.error('[ERROR]', ...args)
        }
    }

    /**
     * Log with context (useful for tracking operations)
     */
    logWithContext(context, level, ...args) {
        const message = `[${context}]`
        switch (level) {
            case 'debug':
                this.debug(message, ...args)
                break
            case 'info':
                this.info(message, ...args)
                break
            case 'warn':
                this.warn(message, ...args)
                break
            case 'error':
                this.error(message, ...args)
                break
            default:
                this.info(message, ...args)
        }
    }
}

// Export singleton instance
export const logger = new Logger()

// Export convenience functions
export const logDebug = (...args) => logger.debug(...args)
export const logInfo = (...args) => logger.info(...args)
export const logWarn = (...args) => logger.warn(...args)
export const logError = (...args) => logger.error(...args)

export default logger
