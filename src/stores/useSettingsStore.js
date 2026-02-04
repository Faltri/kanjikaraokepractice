import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../utils/constants'

const defaultSettings = {
    theme: 'dark',
    showRomaji: false,
    showFurigana: true,
    defaultSpeed: 1.0,
    soundEnabled: true,
    hapticEnabled: true,
    difficulty: 'MEDIUM',
    geminiApiKey: '',
    geminiModel: 'gemini-1.5-flash',
    useAIRefinement: false
}

export const useSettingsStore = create(
    persist(
        (set) => ({
            ...defaultSettings,

            setShowRomaji: (show) => set({ showRomaji: show }),
            setShowFurigana: (show) => set({ showFurigana: show }),
            setDefaultSpeed: (speed) => set({ defaultSpeed: speed }),
            setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
            setHapticEnabled: (enabled) => set({ hapticEnabled: enabled }),
            setDifficulty: (difficulty) => set({ difficulty }),
            setLanguage: (language) => set({ language }),
            setGeminiApiKey: (key) => set({ geminiApiKey: key }),
            setGeminiModel: (model) => set({ geminiModel: model }),
            setUseAIRefinement: (use) => set({ useAIRefinement: use }),

            resetSettings: () => set(defaultSettings)
        }),
        {
            name: STORAGE_KEYS.SETTINGS
        }
    )
)
