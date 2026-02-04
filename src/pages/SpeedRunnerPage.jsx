import { useEffect } from 'react'
import PageContainer, { PageTitle } from '../components/layout/PageContainer'
import GameArena from '../components/speedrunner/GameArena'
import { useGameStore } from '../stores/useGameStore'

export default function SpeedRunnerPage() {
    const resetGame = useGameStore(state => state.resetGame)

    useEffect(() => {
        return () => {
            resetGame()
        }
    }, [resetGame])

    return (
        <PageContainer>
            <PageTitle subtitle="Race against time to match kanji readings">
                Speed Runner
            </PageTitle>

            <GameArena />
        </PageContainer>
    )
}
