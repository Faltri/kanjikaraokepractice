# 🎤 Karaoke Sensei

A modern Japanese Kanji practice platform that transforms song lyrics into an interactive learning suite. Master Japanese vocabulary and Kanji through your favorite songs!

## ✨ Features

### 🎵 Interactive Karaoke Player
- **Synchronized Lyrics**: Plays music videos (via YouTube) with synchronized lyrics
- **Kanji Learning**: Provides readings (furigana) and translations for study
- **Song Library**: Curated collection of popular Japanese tracks
- **Auto-advance**: Automatic lyric highlighting synchronized with playback

### 📚 Study Modes

#### Flashcard Deck (`/anki`)
- Spaced repetition learning for vocabulary found in songs
- Mastery tracking system
- Helps memorize Kanji characters before or after singing

#### Falling Kanji Game (`/speedrunner`)
- Gamified rapid Kanji recognition practice
- Race against time to match kanji readings
- Score tracking and difficulty levels

#### Lyric Input
- Active recall practice
- AI-powered lyric refinement (optional)
- Manual or AI-assisted lyric parsing

## 🛠️ Technology Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **Japanese Text Processing**: Kuroshiro / Kuromoji (for tokenization and furigana generation)
- **State Management**: Zustand
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📖 Usage

### Basic Workflow

1. **Add Lyrics**: Go to the Home page and enter song lyrics manually or use AI auto-fill
2. **Parse Lyrics**: Click "Parse Lyrics" to tokenize and analyze the text
3. **Choose Mode**: Select from Karaoke, Anki, or Speed Runner modes
4. **Practice**: Start learning and practicing Kanji!

### AI Features (Optional)

To use AI-powered features:
1. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Go to Settings and enter your API key
3. Enable "Use AI Refinement" for better readings and translations

## 🎯 Project Structure

```
src/
├── components/      # React components
│   ├── anki/       # Flashcard components
│   ├── karaoke/    # Karaoke player components
│   ├── layout/     # Layout components
│   ├── lyrics/     # Lyric display components
│   ├── speedrunner/# Game components
│   └── ui/         # Reusable UI components
├── engines/        # Core business logic
│   ├── AIService.js      # AI integration
│   ├── LyricParser.js    # Text parsing
│   ├── StorageManager.js # Local storage
│   └── TokenAnalyzer.js  # Token analysis
├── pages/          # Page components
├── stores/         # Zustand state stores
├── utils/          # Utility functions
└── data/          # Static data
```

## 🔒 Security & Privacy

- **API Keys**: User-provided API keys are stored locally in localStorage
- **Data**: All data is stored locally in your browser
- **No Backend**: This is a client-side application with no server-side data collection

## 🐛 Known Issues & Limitations

- API keys are stored in localStorage (consider using a backend proxy for production)
- Large lyrics files may take time to parse
- AI features require an active internet connection

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Kuroshiro and Kuromoji for Japanese text processing
- React Player for media playback
- All the amazing Japanese music artists whose songs make learning fun!

---

**Made with ❤️ for Japanese language learners**
