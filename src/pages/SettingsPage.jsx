import { useState } from 'react'
import { Download, Upload, Trash2, RotateCcw } from 'lucide-react'
import PageContainer, { PageTitle, PageSection } from '../components/layout/PageContainer'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useAnkiStore } from '../stores/useAnkiStore'
import StorageManager from '../engines/StorageManager'
import { cn } from '../utils/helpers'

export default function SettingsPage() {
    const [exportMessage, setExportMessage] = useState('')

    const {
        showRomaji,
        showFurigana,
        defaultSpeed,
        soundEnabled,
        hapticEnabled,
        difficulty,
        geminiApiKey,
        geminiModel,
        useAIRefinement,
        setShowRomaji,
        setShowFurigana,
        setDefaultSpeed,
        setSoundEnabled,
        setHapticEnabled,
        setDifficulty,
        setGeminiApiKey,
        setGeminiModel,
        setUseAIRefinement,
        resetSettings
    } = useSettingsStore()

    const { masteredKanji } = useAnkiStore()
    const storageUsage = StorageManager.getStorageUsage()

    // Default safe models
    const defaultModels = [
        { id: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash' },
        { id: 'gemini-1.5-flash-latest', displayName: 'Gemini 1.5 Flash (Latest)' },
        { id: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash' },
        { id: 'gemini-2.0-flash-exp', displayName: 'Gemini 2.0 Flash (Exp)' },
        { id: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro' },
        { id: 'gemini-pro', displayName: 'Gemini 1.0 Pro' } // Legacy model that often works when others don't
    ]

    const [availableModels, setAvailableModels] = useState(defaultModels)
    const [loadingModels, setLoadingModels] = useState(false)

    const handleFetchModels = async () => {
        if (!geminiApiKey) return
        setLoadingModels(true)
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`)
            const data = await response.json()

            if (!response.ok) throw new Error(data.error?.message || 'Failed to fetch models')

            if (data.models) {
                const filtered = data.models
                    .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
                    .map(m => ({
                        id: m.name.replace('models/', ''),
                        displayName: m.displayName || m.name
                    }))
                    .sort((a, b) => b.id.localeCompare(a.id)) // Sort newer versions to top roughly

                if (filtered.length > 0) {
                    setAvailableModels(filtered)
                    // If current model is not in list, switch to first available
                    if (!filtered.find(m => m.id === geminiModel)) {
                        setGeminiModel(filtered[0].id)
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch models:', error)
            alert('Could not fetch models. Check your API key.\n\nError: ' + error.message)
        } finally {
            setLoadingModels(false)
        }
    }

    const handleExport = () => {
        const data = StorageManager.exportData()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `karaoke-sensei-backup-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        setExportMessage('Data exported successfully!')
        setTimeout(() => setExportMessage(''), 3000)
    }

    const handleImport = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.onchange = async (e) => {
            const file = e.target.files?.[0]
            if (!file) return

            try {
                const text = await file.text()
                const data = JSON.parse(text)
                StorageManager.importData(data)
                setExportMessage('Data imported successfully! Refresh to see changes.')
                setTimeout(() => setExportMessage(''), 3000)
            } catch (error) {
                setExportMessage('Failed to import data.')
                setTimeout(() => setExportMessage(''), 3000)
            }
        }
        input.click()
    }

    const handleClearAll = () => {
        if (confirm('Are you sure? This will delete all progress and settings.')) {
            StorageManager.clear()
            resetSettings()
            window.location.reload()
        }
    }

    return (
        <PageContainer>
            <PageTitle subtitle="Customize your learning experience">
                Settings
            </PageTitle>

            {/* Display Settings */}
            <PageSection title="Display">
                <Card variant="dark" className="space-y-4">
                    <ToggleSetting
                        label="Show Furigana"
                        description="Display readings above kanji"
                        value={showFurigana}
                        onChange={setShowFurigana}
                    />
                    <ToggleSetting
                        label="Show Romaji"
                        description="Display romanized readings"
                        value={showRomaji}
                        onChange={setShowRomaji}
                    />
                </Card>
            </PageSection>

            {/* Game Settings */}
            <PageSection title="Game">
                <Card variant="dark" className="space-y-4">
                    <div>
                        <label className="text-sm text-text-secondary">Default Difficulty</label>
                        <div className="flex gap-2 mt-2">
                            {['EASY', 'MEDIUM', 'HARD'].map((diff) => (
                                <Button
                                    key={diff}
                                    variant={difficulty === diff ? 'primary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setDifficulty(diff)}
                                >
                                    {diff}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-text-secondary">Default Speed</label>
                        <div className="flex items-center gap-2 mt-2">
                            {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                                <Button
                                    key={speed}
                                    variant={defaultSpeed === speed ? 'primary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setDefaultSpeed(speed)}
                                >
                                    {speed}x
                                </Button>
                            ))}
                        </div>
                    </div>

                    <ToggleSetting
                        label="Sound Effects"
                        description="Play sounds for correct/incorrect answers"
                        value={soundEnabled}
                        onChange={setSoundEnabled}
                    />

                    <ToggleSetting
                        label="Haptic Feedback"
                        description="Vibration on interactions (if supported)"
                        value={hapticEnabled}
                        onChange={setHapticEnabled}
                    />
                </Card>
            </PageSection>

            {/* AI Settings */}
            <PageSection title="AI Refinement">
                <Card variant="dark" className="space-y-6">
                    <ToggleSetting
                        label="Enable AI Refinement"
                        description="Use Google Gemini to ensure correct Kanji readings in context"
                        value={useAIRefinement}
                        onChange={setUseAIRefinement}
                    />

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-text-secondary">Gemini API Key</label>
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-accent-cyan hover:underline"
                                >
                                    Get a free key
                                </a>
                            </div>
                            <input
                                type="password"
                                value={geminiApiKey}
                                onChange={(e) => setGeminiApiKey(e.target.value)}
                                placeholder="Enter your Gemini API key"
                                className={cn(
                                    'w-full px-3 py-2.5 rounded-xl',
                                    'bg-bg-tertiary/50 border border-white/10',
                                    'text-text-primary placeholder:text-text-muted',
                                    'focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30',
                                    'transition-all'
                                )}
                            />
                            <TestConnectionButton apiKey={geminiApiKey} model={geminiModel} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-text-secondary">AI Model</label>
                            <div className="flex gap-2">
                                <select
                                    value={geminiModel}
                                    onChange={(e) => setGeminiModel(e.target.value)}
                                    className={cn(
                                        'flex-1 px-3 py-2.5 rounded-xl appearance-none',
                                        'bg-bg-tertiary/50 border border-white/10',
                                        'text-text-primary',
                                        'focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30',
                                        'transition-all cursor-pointer'
                                    )}
                                >
                                    {availableModels.map(model => (
                                        <option key={model.id} value={model.id}>
                                            {model.displayName} ({model.id})
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleFetchModels}
                                    disabled={!geminiApiKey || loadingModels}
                                    className="shrink-0"
                                    title="Fetch available models from API"
                                >
                                    {loadingModels ? <RotateCcw className="animate-spin" size={16} /> : <RotateCcw size={16} />}
                                </Button>
                            </div>
                            <p className="text-[10px] text-text-muted leading-relaxed">
                                Default: gemini-1.5-flash. If it fails, click the refresh button to see which models your key can access.
                            </p>
                        </div>

                        <p className="text-[10px] text-text-muted leading-relaxed border-t border-white/5 pt-4">
                            Your API key is stored locally in your browser and never sent to our servers.
                            It is only used to call the Google Gemini API directly from your device via the v1beta endpoint.
                        </p>
                    </div>
                </Card>
            </PageSection>

            {/* Progress Stats */}
            <PageSection title="Progress">
                <Card variant="dark">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-accent-cyan">{masteredKanji.length}</div>
                            <div className="text-text-muted text-sm">Kanji Mastered</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-accent-pink">{storageUsage.kilobytes} KB</div>
                            <div className="text-text-muted text-sm">Storage Used</div>
                        </div>
                    </div>
                </Card>
            </PageSection>

            {/* Data Management */}
            <PageSection title="Data">
                <Card variant="dark" className="space-y-4">
                    {exportMessage && (
                        <p className="text-sm text-accent-green">{exportMessage}</p>
                    )}

                    <div className="flex flex-wrap gap-3">
                        <Button variant="secondary" onClick={handleExport}>
                            <Download size={16} />
                            Export Data
                        </Button>
                        <Button variant="secondary" onClick={handleImport}>
                            <Upload size={16} />
                            Import Data
                        </Button>
                    </div>

                    <hr className="border-white/10" />

                    <div className="flex flex-wrap gap-3">
                        <Button variant="ghost" onClick={resetSettings}>
                            <RotateCcw size={16} />
                            Reset Settings
                        </Button>
                        <Button variant="danger" onClick={handleClearAll}>
                            <Trash2 size={16} />
                            Clear All Data
                        </Button>
                    </div>
                </Card>
            </PageSection>

            {/* About */}
            <PageSection title="About">
                <Card variant="dark">
                    <p className="text-text-secondary text-sm">
                        <strong className="text-text-primary">Karaoke Sensei</strong> transforms Japanese song lyrics
                        into an interactive kanji learning experience. Practice with karaoke mode, flashcards,
                        or the fast-paced speed runner game.
                    </p>
                    <p className="text-text-muted text-xs mt-4">
                        Version 1.0.0 • Made with ❤️ for Japanese learners
                    </p>
                </Card>
            </PageSection>
        </PageContainer>
    )
}

function ToggleSetting({ label, description, value, onChange }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="font-medium text-text-primary">{label}</p>
                <p className="text-sm text-text-muted">{description}</p>
            </div>
            <button
                onClick={() => onChange(!value)}
                className={cn(
                    'relative w-12 h-7 rounded-full transition-colors',
                    value ? 'bg-accent-cyan' : 'bg-bg-tertiary'
                )}
            >
                <span
                    className={cn(
                        'absolute top-1 w-5 h-5 rounded-full bg-white transition-transform',
                        value ? 'left-6' : 'left-1'
                    )}
                />
            </button>
        </div>
    )
}

function TestConnectionButton({ apiKey, model }) {
    const [status, setStatus] = useState(null) // 'loading', 'success', 'error'
    const [message, setMessage] = useState('')

    const handleTest = async () => {
        if (!apiKey) {
            setStatus('error')
            setMessage('Please enter an API Key first.')
            return
        }

        setStatus('loading')
        setMessage('Testing connection...')

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Say 'OK'" }] }]
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error?.message || `Error ${response.status}: ${response.statusText}`)
            }

            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                setStatus('success')
                setMessage('Connection Successful! ✅')
            } else {
                throw new Error('Invalid response structure')
            }
        } catch (error) {
            console.error('Test failed', error)
            setStatus('error')
            setMessage(error.message)
        }
    }

    return (
        <div className="space-y-2">
            <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleTest}
                disabled={status === 'loading'}
                className="w-full"
            >
                {status === 'loading' ? (
                    'Testing...'
                ) : (
                    'Test Connection'
                )}
            </Button>
            {message && (
                <div className={cn(
                    'text-xs p-2 rounded-lg border',
                    status === 'success' ? 'bg-accent-green/10 border-accent-green/30 text-accent-green' :
                        status === 'error' ? 'bg-accent-pink/10 border-accent-pink/30 text-accent-pink' :
                            'bg-bg-tertiary border-white/10 text-text-muted'
                )}>
                    {message}
                </div>
            )}
        </div>
    )
}
