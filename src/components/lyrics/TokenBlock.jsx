import { memo } from 'react'
import { cn } from '../../utils/helpers'
import { TOKEN_TYPES } from '../../utils/constants'
import { useSettingsStore } from '../../stores/useSettingsStore'

function TokenBlock({
    token,
    isHighlighted = false,
    onClick,
    showFurigana: showFuriganaProp
}) {
    const { showFurigana: showFuriganaSetting, showRomaji } = useSettingsStore()
    const showFurigana = showFuriganaProp ?? showFuriganaSetting

    const isKanji = token.type === TOKEN_TYPES.KANJI
    const needsFurigana = isKanji && token.reading !== token.text

    return (
        <span
            onClick={(e) => {
                e.stopPropagation()
                onClick?.(token)
            }}
            className={cn(
                'inline-block transition-all duration-200 jp-text',
                onClick && 'cursor-pointer hover:text-accent-cyan',
                isHighlighted && 'text-accent-cyan animate-glow-text scale-110'
            )}
        >
            {needsFurigana && showFurigana ? (
                <ruby className="relative">
                    <span className={cn(
                        'text-inherit',
                        isHighlighted && 'font-bold'
                    )}>
                        {token.text}
                    </span>
                    <rt className={cn(
                        'text-[0.5em] font-normal furigana-text',
                        isHighlighted ? 'text-accent-pink' : 'text-text-secondary'
                    )}>
                        {token.reading}
                    </rt>
                </ruby>
            ) : (
                <span className={cn(isHighlighted && 'font-bold')}>
                    {token.text}
                </span>
            )}

            {Boolean(showRomaji) && token.romaji && token.romaji !== token.text && (
                <span className="block text-[0.4em] text-text-muted text-center romaji-text">
                    {token.romaji}
                </span>
            )}
        </span>
    )
}

// Memoize to prevent unnecessary re-renders
export default memo(TokenBlock)
