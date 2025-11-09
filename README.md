# Swaraj AI - Digital Reflection Assistant

A voice-based AI assistant with an anime-inspired futuristic interface, designed to think, talk, and behave like Swaraj Satyam. Features real-time voice conversations, agentic capabilities, and a stunning cyberpunk UI.

## 🌟 Features

- **Natural Voice Conversations**: Bilingual support (English/Hindi) with automatic language detection
- **Agentic Capabilities**: Execute real-world actions through natural commands
- **Futuristic UI**: Anime-inspired cyberpunk interface with neon gradients and animations
- **Real-time Interaction**: Sub-second response times with WebSocket communication
- **Personality-Driven**: Maintains Swaraj's calm, logical, and confident personality
- **Privacy-First**: Encrypted data, explicit confirmations for sensitive actions

## 🏗️ Architecture

### Frontend
- React 18 + TypeScript + Vite
- TailwindCSS with custom cyberpunk theme
- Framer Motion for animations
- Socket.io for real-time communication
- Web Speech API for voice input/output

### Backend
- Node.js + Express + TypeScript
- Socket.io for WebSocket server
- Google Gemini API for NLP
- Google Cloud Text-to-Speech for voice synthesis
- Redis for session management
- Firebase for persistent storage

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Cloud account with API keys
- Firebase project

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd swaraj-ai
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Install backend dependencies**
```bash
cd ../backend
npm install
```

4. **Configure environment variables**

Frontend `.env` file is already configured with your Firebase credentials.
Backend `.env` file is already configured with your API keys.

### Running the Application

1. **Start the backend server**
```bash
cd backend
npm run dev
```

2. **Start the frontend (in a new terminal)**
```bash
cd frontend
npm run dev
```

3. **Open your browser**
Navigate to `http://localhost:5173`

## 📁 Project Structure

```
swaraj-ai/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API and service clients
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript type definitions
│   └── package.json
├── backend/                  # Node.js backend server
│   ├── src/
│   │   ├── services/        # Business logic services
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript type definitions
│   └── package.json
└── .kiro/specs/             # Project specifications
```

## 🎯 Voice Commands

Swaraj AI understands natural language. Try these commands:

- "Hey Swaraj, open YouTube"
- "Search for AI news"
- "Play some lofi beats"
- "What's the system temperature?"
- "Tell me about yourself"

## 🔑 API Keys Required

- **Google Gemini API**: For natural language understanding
- **Google Cloud Text-to-Speech**: For voice synthesis
- **Google Custom Search API**: For web search (optional)
- **Firebase**: For data persistence

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm run dev
```

### Backend Development
```bash
cd backend
npm run dev
```

### Build for Production
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
npm start
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📝 License

ISC

## 👤 Author

Swaraj Satyam - Founder of Cyra Company

## 🙏 Acknowledgments

- Google Cloud for AI and TTS services
- Firebase for backend infrastructure
- The open-source community

---

**Tagline**: "A calm mind, a clear vision, and a code that speaks for itself."
