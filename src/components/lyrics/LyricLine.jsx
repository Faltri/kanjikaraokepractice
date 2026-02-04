import { cn } from '../../utils/helpers'
import TokenBlock from './TokenBlock'

export default function LyricLine({
    tokens,
    isActive = false,
    highlightedTokenIndex = -1,
    onTokenClick,
    className = ''
}) {
    return (
        <p
            className={cn(
                'text-xl sm:text-2xl leading-loose py-2 transition-all duration-300',
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
