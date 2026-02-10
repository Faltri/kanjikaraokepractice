import { memo } from 'react'
import { cn } from '../../utils/helpers'
import TokenBlock from './TokenBlock'

function LyricLine({
    tokens,
    isActive = false,
    highlightedTokenIndex = -1,
    onTokenClick,
    className = ''
}) {
    return (
        <p
            className={cn(
                'text-xl sm:text-2xl leading-[3] py-2 transition-all duration-300',
                isActive ? 'opacity-100' : 'opacity-50',
                isActive && 'scale-[1.02]',
                className
            )}
        >
            {tokens.map((token, index) => (
                <TokenBlock
                    key={token.id}
                    token={token}
                    isHighlighted={isActive && index === highlightedTokenIndex}
                    onClick={onTokenClick}
                />
            ))}
        </p>
    )
}

// Memoize to prevent unnecessary re-renders when props haven't changed
export default memo(LyricLine)
