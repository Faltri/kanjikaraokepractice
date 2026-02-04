import { GAME_CONFIG } from '../utils/constants'

class GameEngine {
    constructor() {
        this.isRunning = false
        this.lastTimestamp = 0
        this.animationFrameId = null
        this.callbacks = {
            onTick: null,
            onTimeUp: null,
            onSpeedChange: null
        }
        this.speed = GAME_CONFIG.KARAOKE.DEFAULT_SPEED
        this.accumulatedTime = 0
    }

    setCallbacks({ onTick, onTimeUp, onSpeedChange }) {
        this.callbacks = { onTick, onTimeUp, onSpeedChange }
    }

    setSpeed(speed) {
        this.speed = Math.max(
            GAME_CONFIG.KARAOKE.MIN_SPEED,
            Math.min(GAME_CONFIG.KARAOKE.MAX_SPEED, speed)
        )
        this.callbacks.onSpeedChange?.(this.speed)
    }

    getSpeed() {
        return this.speed
    }

    start() {
        if (this.isRunning) return

        this.isRunning = true
        this.lastTimestamp = performance.now()
        this.accumulatedTime = 0
        this.loop()
    }

    pause() {
        this.isRunning = false
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId)
            this.animationFrameId = null
        }
    }

    resume() {
        if (this.isRunning) return

        this.isRunning = true
        this.lastTimestamp = performance.now()
        this.loop()
    }

    stop() {
        this.pause()
        this.accumulatedTime = 0
    }

    loop() {
        if (!this.isRunning) return

        const now = performance.now()
        const rawDelta = now - this.lastTimestamp
        const delta = rawDelta * this.speed // Apply speed multiplier

        this.lastTimestamp = now
        this.accumulatedTime += delta

        this.callbacks.onTick?.(delta, this.accumulatedTime)

        this.animationFrameId = requestAnimationFrame(() => this.loop())
    }

    // Calculate time remaining with speed adjustment
    getAdjustedTime(baseTime) {
        return baseTime / this.speed
    }

    // Calculate adjusted duration
    getAdjustedDuration(baseDuration) {
        return baseDuration / this.speed
    }
}

// Speed Runner specific engine
class SpeedRunnerEngine extends GameEngine {
    constructor() {
        super()
        this.timeRemaining = GAME_CONFIG.SPEED_RUNNER.BASE_TIME_PER_KANJI
        this.difficulty = 'MEDIUM'
        this.callbacks = {
            ...this.callbacks,
            onTimeUpdate: null,
            onKanjiExpired: null
        }
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty
        const config = GAME_CONFIG.SPEED_RUNNER.DIFFICULTY[difficulty]
        this.setSpeed(config.speedMultiplier)
    }

    resetTimer() {
        const config = GAME_CONFIG.SPEED_RUNNER.DIFFICULTY[this.difficulty]
        this.timeRemaining = GAME_CONFIG.SPEED_RUNNER.BASE_TIME_PER_KANJI + config.timeBonus
        this.accumulatedTime = 0
    }

    loop() {
        if (!this.isRunning) return

        const now = performance.now()
        const rawDelta = now - this.lastTimestamp
        const delta = rawDelta * this.speed

        this.lastTimestamp = now
        this.accumulatedTime += delta
        this.timeRemaining -= delta

        this.callbacks.onTick?.(delta, this.accumulatedTime)
        this.callbacks.onTimeUpdate?.(this.timeRemaining)

        if (this.timeRemaining <= 0) {
            this.callbacks.onKanjiExpired?.()
            this.resetTimer()
        }

        this.animationFrameId = requestAnimationFrame(() => this.loop())
    }

    getTimeRemaining() {
        return Math.max(0, this.timeRemaining)
    }

    getTimeProgress() {
        const config = GAME_CONFIG.SPEED_RUNNER.DIFFICULTY[this.difficulty]
        const maxTime = GAME_CONFIG.SPEED_RUNNER.BASE_TIME_PER_KANJI + config.timeBonus
        return Math.max(0, this.timeRemaining / maxTime)
    }
}

// Karaoke specific engine
class KaraokeEngine extends GameEngine {
    constructor() {
        super()
        this.currentLineTime = 0
        this.lineStartTime = 0
        this.callbacks = {
            ...this.callbacks,
            onLineProgress: null,
            onLineComplete: null
        }
    }

    setLineDuration(duration) {
        this.lineDuration = duration
    }

    startLine() {
        this.lineStartTime = this.accumulatedTime
        this.currentLineTime = 0
    }

    loop() {
        if (!this.isRunning) return

        const now = performance.now()
        const rawDelta = now - this.lastTimestamp
        const delta = rawDelta * this.speed

        this.lastTimestamp = now
        this.accumulatedTime += delta
        this.currentLineTime = this.accumulatedTime - this.lineStartTime

        const lineDuration = GAME_CONFIG.KARAOKE.LINE_DURATION / this.speed
        const progress = Math.min(1, this.currentLineTime / lineDuration)

        this.callbacks.onTick?.(delta, this.accumulatedTime)
        this.callbacks.onLineProgress?.(progress, this.currentLineTime)

        if (progress >= 1) {
            this.callbacks.onLineComplete?.()
            this.startLine()
        }

        this.animationFrameId = requestAnimationFrame(() => this.loop())
    }

    getLineProgress() {
        const lineDuration = GAME_CONFIG.KARAOKE.LINE_DURATION / this.speed
        return Math.min(1, this.currentLineTime / lineDuration)
    }
}

// Factory exports
export const createGameEngine = () => new GameEngine()
export const createSpeedRunnerEngine = () => new SpeedRunnerEngine()
export const createKaraokeEngine = () => new KaraokeEngine()

export { GameEngine, SpeedRunnerEngine, KaraokeEngine }
