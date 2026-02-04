import { STORAGE_KEYS } from '../utils/constants'

class StorageManager {
    static get(key) {
        try {
            const item = localStorage.getItem(key)
            return item ? JSON.parse(item) : null
        } catch (error) {
            console.error(`Error reading from localStorage (${key}):`, error)
            return null
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value))
            return true
        } catch (error) {
            console.error(`Error writing to localStorage (${key}):`, error)
            return false
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key)
            return true
        } catch (error) {
            console.error(`Error removing from localStorage (${key}):`, error)
            return false
        }
    }

    static clear() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key)
            })
            return true
        } catch (error) {
            console.error('Error clearing localStorage:', error)
            return false
        }
    }

    // High scores management
    static getHighScores() {
        return this.get(STORAGE_KEYS.HIGH_SCORES) || []
    }

    static addHighScore(score) {
        const scores = this.getHighScores()
        scores.push({
            ...score,
            date: Date.now()
        })

        // Sort by score descending, keep top 10
        scores.sort((a, b) => b.score - a.score)
        const topScores = scores.slice(0, 10)

        this.set(STORAGE_KEYS.HIGH_SCORES, topScores)
        return topScores
    }

    // Recent songs management
    static getRecentSongs() {
        return this.get(STORAGE_KEYS.RECENT_SONGS) || []
    }

    static addRecentSong(song) {
        const songs = this.getRecentSongs()

        // Remove if already exists
        const filtered = songs.filter(s => s.id !== song.id)

        // Add to front
        filtered.unshift({
            ...song,
            lastPlayed: Date.now()
        })

        // Keep only last 10
        const recent = filtered.slice(0, 10)

        this.set(STORAGE_KEYS.RECENT_SONGS, recent)
        return recent
    }

    // Export/Import functionality
    static exportData() {
        const data = {}

        Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
            data[name] = this.get(key)
        })

        return {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            data
        }
    }

    static importData(exportedData) {
        try {
            if (!exportedData.version || !exportedData.data) {
                throw new Error('Invalid export format')
            }

            Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
                if (exportedData.data[name]) {
                    this.set(key, exportedData.data[name])
                }
            })

            return true
        } catch (error) {
            console.error('Error importing data:', error)
            return false
        }
    }

    // Storage usage info
    static getStorageUsage() {
        let totalSize = 0

        Object.values(STORAGE_KEYS).forEach(key => {
            const item = localStorage.getItem(key)
            if (item) {
                totalSize += item.length * 2 // UTF-16 characters = 2 bytes each
            }
        })

        return {
            bytes: totalSize,
            kilobytes: (totalSize / 1024).toFixed(2),
            megabytes: (totalSize / (1024 * 1024)).toFixed(4)
        }
    }
}

export default StorageManager
