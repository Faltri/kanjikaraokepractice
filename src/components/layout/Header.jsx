import { Link, useLocation } from 'react-router-dom'
import { Music, Settings } from 'lucide-react'
import { ROUTES } from '../../utils/constants'
import { cn } from '../../utils/helpers'

export default function Header() {
    const location = useLocation()

    return (
        <header className="fixed top-0 left-0 right-0 z-40 safe-top">
            <div className="glass-dark border-b border-white/5">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        to={ROUTES.HOME}
                        className="flex items-center gap-2 text-xl font-bold group"
                    >
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-pink group-hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-shadow">
                            <Music size={20} className="text-bg-primary" />
                        </div>
                        <span className="gradient-text hidden sm:inline">Karaoke Sensei</span>
                        <span className="gradient-text sm:hidden">KS</span>
                    </Link>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        <Link
                            to={ROUTES.SETTINGS}
                            className={cn(
                                'p-2 rounded-lg transition-all',
                                location.pathname === ROUTES.SETTINGS
                                    ? 'bg-accent-cyan/20 text-accent-cyan'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                            )}
                        >
                            <Settings size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    )
}
