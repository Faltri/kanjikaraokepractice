import { cn } from '../../utils/helpers'
import { GAME_CONFIG } from '../../utils/constants'

export default function Slider({
    value,
    onChange,
    min = GAME_CONFIG.KARAOKE.MIN_SPEED,
    max = GAME_CONFIG.KARAOKE.MAX_SPEED,
    step = GAME_CONFIG.KARAOKE.SPEED_STEP,
    label,
    showValue = true,
    formatValue = (v) => `${v}x`,
    className = ''
}) {
    const percentage = ((value - min) / (max - min)) * 100

    const handleChange = (e) => {
        onChange(parseFloat(e.target.value))
    }

    return (
        <div className={cn('w-full', className)}>
            {(label || showValue) && (
                <div className="flex items-center justify-between mb-2">
                    {label && (
                        <label className="text-sm font-medium text-text-secondary">
                            {label}
                        </label>
                    )}
                    {showValue && (
                        <span className="text-sm font-bold text-accent-cyan">
                            {formatValue(value)}
                        </span>
                    )}
                </div>
            )}

            <div className="relative">
                <div className="absolute inset-0 h-2 top-1/2 -translate-y-1/2 rounded-full bg-bg-tertiary" />
                <div
                    className="absolute h-2 top-1/2 -translate-y-1/2 rounded-full bg-linear-to-r from-accent-cyan to-accent-pink"
                    style={{ width: `${percentage}%` }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={handleChange}
                    className={cn(
                        'relative w-full h-2 appearance-none bg-transparent cursor-pointer z-10',
                        '[&::-webkit-slider-thumb]:appearance-none',
                        '[&::-webkit-slider-thumb]:w-5',
                        '[&::-webkit-slider-thumb]:h-5',
                        '[&::-webkit-slider-thumb]:rounded-full',
                        '[&::-webkit-slider-thumb]:bg-accent-cyan',
                        '[&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,255,255,0.8)]',
                        '[&::-webkit-slider-thumb]:cursor-pointer',
                        '[&::-webkit-slider-thumb]:transition-all',
                        '[&::-webkit-slider-thumb]:duration-200',
                        '[&::-webkit-slider-thumb]:hover:scale-110',
                        '[&::-webkit-slider-thumb]:hover:shadow-[0_0_20px_rgba(0,255,255,1)]',
                        '[&::-moz-range-thumb]:w-5',
                        '[&::-moz-range-thumb]:h-5',
                        '[&::-moz-range-thumb]:rounded-full',
                        '[&::-moz-range-thumb]:bg-accent-cyan',
                        '[&::-moz-range-thumb]:border-none',
                        '[&::-moz-range-thumb]:cursor-pointer'
                    )}
                />
            </div>

            <div className="flex justify-between mt-1 text-xs text-text-muted">
                <span>{formatValue(min)}</span>
                <span>{formatValue(max)}</span>
            </div>
        </div>
    )
}
