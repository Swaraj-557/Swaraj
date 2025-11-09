# 🎯 Swaraj AI - Voice-Based AI Assistant

> **"Code. Secure. Create."**

A futuristic voice-based AI assistant powered by **Google Gemini** for intelligence, **ElevenLabs** for natural voice synthesis, and featuring an **anime-inspired UI** with real-time animations.

![Swaraj AI](https://img.shields.io/badge/Swaraj-AI-blue?style=for-the-badge&logo=robot)
![Gemini](https://img.shields.io/badge/Google-Gemini-orange?style=for-the-badge&logo=google)
![ElevenLabs](https://img.shields.io/badge/ElevenLabs-Voice-purple?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

---

## ✨ Features

- 🎙️ **Voice Input** - Speak naturally using Web Speech API
- 🧠 **Gemini AI Brain** - Intelligent responses with context memory
- 🔊 **ElevenLabs Voice** - Natural, human-like voice synthesis
- 🎨 **Anime UI** - Futuristic design with smooth animations
- 🛠️ **Agentic Tools** - Open YouTube, play music, get time, save notes, and more
- 📊 **Real-time Visualization** - Audio waveform during speech
- 💬 **Conversation History** - Track your chat with Swaraj AI
- 🌐 **Fully Local** - No external search APIs, runs locally

---

## 🎬 Demo

**Talk to Swaraj AI:**
- "Hey Swaraj, open YouTube"
- "Play some lo-fi music"
- "What time is it?"
- "Remember this: buy groceries tomorrow"
- "Show my notes"

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **API Keys**:
  - [Google Gemini API Key](https://makersuite.google.com/app/apikey)
  - [ElevenLabs API Key](https://elevenlabs.io/app/settings)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Swaraj-557/Swaraj-AI.git
cd Swaraj-AI
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**

Create a `.env` file in the root directory:

```env
PORT=8080
NODE_ENV=development

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# ElevenLabs API
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here

# Optional: News API
NEWS_API_KEY=optional_news_api_key_here
```

4. **Run the application**

Development mode (runs both frontend and backend):
```bash
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:web
```

5. **Open in browser**
```
http://localhost:3000
```

---

## 🔑 Getting API Keys

### Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key
5. Add it to `.env` as `GEMINI_API_KEY`

### ElevenLabs API Key & Voice ID

1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up for a free account
3. Navigate to **Profile Settings** → **API Keys**
4. Copy your API key
5. Go to **Voice Lab** to find your Voice ID
   - You can use a premade voice or clone your own voice
   - Copy the Voice ID
6. Add both to `.env`

**Optional:** Create a custom "Swaraj" voice:
- Record 30-60 seconds of clear speech
- Upload to ElevenLabs Voice Lab
- Name it "SwarajSatyam"
- Use the generated Voice ID

---

## 📂 Project Structure

```
swaraj-ai/
├── apps/
│   ├── web/                    # React Frontend
│   │   ├── src/
│   │   │   ├── components/     # UI Components
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Waveform.tsx
│   │   │   │   ├── MicButton.tsx
│   │   │   │   ├── ChatBubble.tsx
│   │   │   │   └── ToolNotification.tsx
│   │   │   ├── pages/
│   │   │   │   └── Home.tsx
│   │   │   ├── lib/
│   │   │   │   ├── api.ts      # API client
│   │   │   │   ├── audio.ts    # Web Speech API
│   │   │   │   └── store.ts    # Zustand state
│   │   │   ├── styles/
│   │   │   │   └── index.css
│   │   │   └── main.tsx
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── server/                 # Node.js Backend
│       ├── src/
│       │   ├── core/
│       │   │   ├── gemini.ts   # Gemini integration
│       │   │   ├── elevenlabs.ts # TTS integration
│       │   │   ├── agent.ts    # Tool execution
│       │   │   └── prompts/
│       │   │       └── system-swaraj.txt
│       │   ├── routes/
│       │   │   ├── chat.ts
│       │   │   ├── tts.ts
│       │   │   └── tools.ts
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🛠️ Available Tools

| Tool | Trigger | Action |
|------|---------|--------|
| **Open YouTube** | "Open YouTube" | Opens YouTube in new tab |
| **Play Lo-fi** | "Play lo-fi music" | Opens lo-fi playlist |
| **Show Time** | "What time is it?" | Returns current time |
| **Add Note** | "Remember this: [note]" | Saves note in session |
| **Get Notes** | "Show my notes" | Lists all saved notes |
| **Fetch News** | "Give me today's news" | Shows news headlines (requires NEWS_API_KEY) |

---

## 🎨 Customization

### Change Avatar Style

Edit `apps/web/src/components/Avatar.tsx`:
- Modify colors in `getStateConfig()`
- Change animation patterns
- Replace the "S" with an image or icon

### Customize Theme

Edit `apps/web/tailwind.config.ts`:
```typescript
colors: {
  'neon-blue': '#00d4ff',    // Change to your color
  'neon-purple': '#b877ff',
  'neon-pink': '#ff0080',
  'dark-bg': '#0a0a1a',
  'dark-surface': '#1a1a2e',
}
```

### Modify System Prompt

Edit `apps/server/src/core/prompts/system-swaraj.txt` to change:
- Personality and tone
- Response style
- Bilingual behavior
- Voice characteristics

---

## 🌐 Deployment

### Deploy Backend (Railway/Render)

1. Push code to GitHub
2. Connect to Railway or Render
3. Set environment variables
4. Deploy from `apps/server`

### Deploy Frontend (Vercel/Netlify)

1. Build the frontend:
```bash
npm run build:web
```

2. Deploy `apps/web/dist` folder
3. Set API endpoint in `apps/web/src/lib/api.ts`

---

## 🧪 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing fast dev server
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **Web Speech API** for voice input
- **Web Audio API** for visualization

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Google Gemini API** for AI reasoning
- **ElevenLabs API** for voice synthesis
- **In-memory storage** (no database needed)

---

## 🐛 Troubleshooting

### Voice recognition not working
- **Chrome/Edge**: Allow microphone permissions
- **Safari**: May have limited support
- **Firefox**: Not fully supported, use Chrome

### ElevenLabs API errors
- Check your API key is correct
- Verify Voice ID exists in your account
- Free tier has character limits (10,000/month)

### Gemini API errors
- Ensure API key is valid
- Check internet connection
- Verify API quota hasn't exceeded

---

## 📜 License

MIT License - feel free to use this project for learning or personal use.

---

## 👨‍💻 About Swaraj Satyam

**Swaraj Satyam** is a Class 10 student from Patna, Bihar, India, who's building cutting-edge AI systems:

- 🏢 Founder of **Cyra Company** - AI Cybersecurity startup
- 🔐 Google Cybersecurity Professional Certified
- 🌍 Google Cloud Partner | Microsoft Tech Community Member
- 🤖 Creator of **Bankai**, **Cyra**, and **Raju AI**

### Connect

- 🌐 Website: [cyra-assistant.tech](https://cyra-assistant.tech)
- 📧 Email: cyra@cyra-assistant.tech
- 📸 Instagram: [@bankai_877](https://instagram.com/bankai_877)

---

## 🙏 Acknowledgments

- **Google Gemini** for the AI brain
- **ElevenLabs** for natural voice synthesis
- **React & Vite** for the amazing frontend experience
- **Framer Motion** for smooth animations

---

## 💡 Future Enhancements

- [ ] Multi-language support (Hindi, Spanish, etc.)
- [ ] Vision capabilities with camera input
- [ ] Mobile app (React Native)
- [ ] More agentic tools (calendar, weather, etc.)
- [ ] Voice cloning for personalized experience
- [ ] Conversation export/import

---

**Built with ❤️ by Swaraj Satyam**

*"A calm mind, a clear vision, and a code that speaks for itself."*
