import { Minus, Plus } from 'lucide-react'
import { useGameStore } from '../../stores/useGameStore'
import Slider from '../ui/Slider'
import Button from '../ui/Button'
import { cn } from '../../utils/helpers'

export default function SpeedControl({ compact = false }) {
    const { speed, setSpeed, incrementSpeed, decrementSpeed } = useGameStore()

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={decrementSpeed}
                    className="p-1"
                >
                    <Minus size={16} />
                </Button>

                <span className="text-sm font-bold text-accent-cyan min-w-[3rem] text-center">
                    {speed.toFixed(1)}x
                </span>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={incrementSpeed}
                    className="p-1"
                >
                    <Plus size={16} />
                </Button>
            </div>
        )
    }

    return (
        <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={decrementSpeed}
                    className="shrink-0"
                >
                    <Minus size={18} />
                </Button>

                <Slider
                    value={speed}
                    onChange={setSpeed}
                    label="Playback Speed"
                    className="flex-1"
                />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={incrementSpeed}
                    className="shrink-0"
                >
                    <Plus size={18} />
                </Button>
            </div>
        </div>
    )
}
