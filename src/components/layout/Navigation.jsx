import { NavLink } from 'react-router-dom'
import { Home, Mic, BookOpen, Zap } from 'lucide-react'
import { ROUTES } from '../../utils/constants'
import { cn } from '../../utils/helpers'
import { useLyricStore } from '../../stores/useLyricStore'

const navItems = [
    { path: ROUTES.HOME, icon: Home, label: 'Home' },
    { path: ROUTES.KARAOKE, icon: Mic, label: 'Karaoke' },
    { path: ROUTES.ANKI, icon: BookOpen, label: 'Anki' },
    { path: ROUTES.SPEED_RUNNER, icon: Zap, label: 'Speed' }
]



export default function Navigation() {
    const hasLyrics = useLyricStore(state => state.parsedLines.length > 0)

    const handleNavClick = (e, path) => {
        if (path !== ROUTES.HOME && !hasLyrics) {
            e.preventDefault()
            alert("Please parse lyrics first!")
        }
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
            <div className="glass-dark border-t border-white/5">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-around h-16">
                        {navItems.map(({ path, icon: Icon, label }) => (
                            <NavLink
                                key={path}
                                to={path}
                                onClick={(e) => handleNavClick(e, path)}
                                className={({ isActive }) => cn(
                                    'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
                                    'min-w-[4rem] touch-manipulation',
                                    isActive
                                        ? 'text-accent-cyan'
                                        : 'text-text-secondary hover:text-text-primary',
                                    // Visual feedback for disabled state (optional but nice)
                                    !hasLyrics && path !== ROUTES.HOME && 'opacity-50'
                                )}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={cn(
                                            'p-2 rounded-xl transition-all',
                                            isActive && 'bg-accent-cyan/20 shadow-[0_0_10px_rgba(0,255,255,0.3)]'
                                        )}>
                                            <Icon size={22} />
                                        </div>
                                        <span className="text-xs font-medium">{label}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    )
}
