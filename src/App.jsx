import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/layout/Header'
import Navigation from './components/layout/Navigation'
import HomePage from './pages/HomePage'
import KaraokePage from './pages/KaraokePage'
import AnkiPage from './pages/AnkiPage'
import SpeedRunnerPage from './pages/SpeedRunnerPage'
import SettingsPage from './pages/SettingsPage'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { ROUTES } from './utils/constants'
import { useLyricStore } from './stores/useLyricStore'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { parsedLines } = useLyricStore()
  const hasLyrics = parsedLines.length > 0

  if (!hasLyrics) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return children
}

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-accent-cyan/30 selection:text-accent-cyan">
                    <Header />

                    <Routes>
                        <Route path={ROUTES.HOME} element={<HomePage />} />

                        <Route
                            path={ROUTES.KARAOKE}
                            element={
                                <ProtectedRoute>
                                    <KaraokePage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path={ROUTES.ANKI}
                            element={
                                <ProtectedRoute>
                                    <AnkiPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path={ROUTES.SPEED_RUNNER}
                            element={
                                <ProtectedRoute>
                                    <SpeedRunnerPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
                    </Routes>

                    <Navigation />
                </div>
            </Router>
        </ErrorBoundary>
    )
}

export default App
