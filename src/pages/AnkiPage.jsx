import PageContainer, { PageTitle } from '../components/layout/PageContainer'
import FlashcardDeck from '../components/anki/FlashcardDeck'

export default function AnkiPage() {
    return (
        <PageContainer>
            <PageTitle subtitle="Flashcard practice with mastery tracking">
                Anki Mode
            </PageTitle>

            <FlashcardDeck />
        </PageContainer>
    )
}
