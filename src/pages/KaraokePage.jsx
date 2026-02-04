import PageContainer, { PageTitle } from '../components/layout/PageContainer'
import KaraokePlayer from '../components/karaoke/KaraokePlayer'

export default function KaraokePage() {
    return (
        <PageContainer>
            <PageTitle subtitle="Synchronized lyric practice">
                Karaoke Mode
            </PageTitle>

            <KaraokePlayer />
        </PageContainer>
    )
}
