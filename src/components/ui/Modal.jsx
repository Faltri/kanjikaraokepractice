import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../utils/helpers'

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showClose = true,
    className = ''
}) {
    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-[90vw] max-h-[90vh]'
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className={cn(
                            'fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
                            'w-full p-4',
                            sizes[size]
                        )}
                    >
                        <div
                            className={cn(
                                'glass-dark rounded-2xl overflow-hidden',
                                'border border-white/10',
                                className
                            )}
                        >
                            {/* Header */}
                            {(title || showClose) && (
                                <div className="flex items-center justify-between p-4 border-b border-white/10">
                                    {title && (
                                        <h2 className="text-xl font-bold gradient-text">{title}</h2>
                                    )}
                                    {showClose && (
                                        <button
                                            onClick={onClose}
                                            className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Body */}
                            <div className="p-4">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
