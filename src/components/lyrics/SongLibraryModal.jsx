import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Music2, Play, Search } from 'lucide-react'
import { SONG_LIBRARY } from '../../data/songLibrary'
import Button from '../ui/Button'
import { cn } from '../../utils/helpers'

export default function SongLibraryModal({ isOpen, onClose, onSelect }) {
    const modalRef = useRef(null)
    const [searchQuery, setSearchQuery] = useState('')

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            // Reset search on open
            setSearchQuery('')
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    // Filter and Sort Songs
    const filteredSongs = SONG_LIBRARY
        .filter(song => {
            const query = searchQuery.toLowerCase()
            return song.title.toLowerCase().includes(query) ||
                song.artist.toLowerCase().includes(query)
        })
        .sort((a, b) => a.title.localeCompare(b.title))

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <motion.div
                    ref={modalRef}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-2xl max-h-[80vh] overflow-hidden bg-[#0A0B14] border border-white/10 rounded-2xl shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gradient-to-r from-bg-secondary to-bg-tertiary">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-accent-cyan/20 text-accent-cyan">
                                <Music2 size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Song Library</h2>
                                <p className="text-sm text-text-muted">Choose a pre-loaded popular song</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-text-secondary hover:text-white transition-colors rounded-full hover:bg-white/5"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="p-4 border-b border-white/5 bg-bg-secondary/30">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="text"
                                placeholder="Search by title or artist..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/50 bg-[#1A1B26]"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto p-6 space-y-4 custom-scrollbar flex-1">
                        {filteredSongs.length > 0 ? (
                            filteredSongs.map((song) => (
                                <button
                                    key={song.id}
                                    onClick={() => {
                                        onSelect(song)
                                        onClose()
                                    }}
                                    className="w-full group flex items-center gap-4 p-4 rounded-xl bg-bg-tertiary/30 border border-white/5 hover:bg-bg-tertiary hover:border-accent-cyan/30 transition-all text-left"
                                >
                                    <div className="w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform border border-white/10 group-hover:border-accent-cyan/50">
                                        <Play size={20} className="ml-1 text-text-secondary group-hover:text-accent-cyan" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-text-primary group-hover:text-accent-cyan transition-colors">
                                            {song.title}
                                        </h3>
                                        <p className="text-sm text-text-secondary">
                                            {song.artist}
                                        </p>
                                    </div>
                                    <div className="text-xs px-2 py-1 rounded bg-white/5 text-text-muted">
                                        YouTube
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-8 text-text-muted">
                                <p>No songs found matching "{searchQuery}"</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/5 bg-bg-secondary/50 text-center text-xs text-text-muted">
                        Select a song to auto-fill lyrics and audio
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
