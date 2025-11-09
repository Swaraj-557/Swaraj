# Swaraj AI Assistant - Design Document

## Overview

Swaraj AI is a web-based voice assistant application that provides a natural, conversational interface with agentic capabilities. The system is built as a progressive web app (PWA) that runs in modern browsers, combining real-time voice processing, natural language understanding, and an anime-inspired futuristic user interface. The architecture emphasizes modularity, real-time responsiveness, and seamless integration of voice, AI, and visual components.

### Key Design Principles

- **Real-time First**: All voice interactions and UI feedback operate with sub-second latency
- **Progressive Enhancement**: Core functionality works in all modern browsers, with enhanced features for supported platforms
- **Modular Architecture**: Components are loosely coupled and can be independently upgraded or replaced
- **Privacy by Design**: User data is encrypted, minimized, and controlled by explicit permissions
- **Personality Consistency**: All responses maintain Swaraj's calm, confident, and logical personality

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Web Browser                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Frontend Application               │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │   Avatar    │  │  Waveform    │  │  Command    │  │  │
│  │  │  Component  │  │  Visualizer  │  │  Feedback   │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────┘  │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │         Voice Interface Manager                  │ │  │
│  │  │  (Web Speech API / Google Cloud Speech)         │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services (Node.js)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     NLP      │  │    Agent     │  │   Memory     │      │
│  │   Engine     │  │  Controller  │  │    Layer     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         External API Integration Layer              │  │
│  │  (OpenAI/Gemini, Google TTS, Web Search, etc.)     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18+ with TypeScript for type safety and component architecture
- TailwindCSS for utility-first styling with custom theme
- Framer Motion for smooth animations and transitions
- Three.js or Lottie for avatar animations
- Web Speech API for browser-native speech recognition (fallback to Google Cloud Speech)
- Howler.js for audio playback management

**Backend:**
- Node.js with Express for REST API and WebSocket server
- Socket.io for real-time bidirectional communication
- Redis for session management and conversation caching
- Firebase Firestore or MongoDB for persistent storage
- Google Cloud Text-to-Speech API for voice synthesis
- Google Gemini API for natural language understanding and conversation

**Infrastructure:**
- Vercel or Netlify for frontend hosting
- Google Cloud Run or Railway for backend deployment
- Cloud CDN for static asset delivery
- Environment-based configuration for API keys and secrets

## Components and Interfaces

### 1. Voice Interface Manager

**Purpose**: Handles all voice input/output operations and manages audio streams

**Key Responsibilities:**
- Capture microphone input using Web Audio API
- Convert speech to text using Web Speech API or Google Cloud Speech-to-Text
- Detect language automatically (English/Hindi)
- Play synthesized speech responses
- Manage audio permissions and error states

**Interface:**
```typescript
interface VoiceInterfaceManager {
  startListening(): Promise<void>;
  stopListening(): void;
  speak(text: string, language: 'en' | 'hi'): Promise<void>;
  onTranscript(callback: (text: string, language: string) => void): void;
  onError(callback: (error: Error) => void): void;
  getAudioLevel(): number; // For waveform visualization
}
```

**Implementation Details:**
- Use Web Speech API's `SpeechRecognition` for browser-native speech input
- Implement fallback to Google Cloud Speech-to-Text API for better accuracy
- Use Google Cloud Text-to-Speech with Neural2 voices (en-IN-Neural2-B for male voice)
- Implement audio buffering to prevent choppy playback
- Add voice activity detection (VAD) to automatically start/stop listening

### 2. NLP Engine

**Purpose**: Interprets user intent from transcribed text and generates appropriate responses

**Key Responsibilities:**
- Parse natural language commands into structured intents
- Extract entities (app names, search queries, parameters)
- Generate contextually appropriate responses
- Maintain personality consistency in all outputs
- Handle ambiguous or unclear commands

**Interface:**
```typescript
interface NLPEngine {
  parseIntent(text: string, context: ConversationContext): Promise<Intent>;
  generateResponse(intent: Intent, actionResult?: any): Promise<string>;
  detectLanguage(text: string): 'en' | 'hi' | 'mixed';
}

interface Intent {
  action: string; // e.g., 'open_app', 'search_web', 'get_info'
  entities: Record<string, any>;
  confidence: number;
  requiresConfirmation: boolean;
}
```

**Implementation Details:**
- Use Google Gemini API (gemini-pro or gemini-1.5-pro) with custom system prompts defining Swaraj's personality
- Implement intent classification using few-shot learning examples in the system instruction
- Create a command registry mapping intents to agent actions
- Add confidence thresholding (below 0.7 triggers clarification)
- Implement bilingual support with language-specific prompt templates
- Use Gemini's function calling feature for structured intent extraction

### 3. Agent Controller

**Purpose**: Executes real-world actions based on interpreted intents

**Key Responsibilities:**
- Open websites and applications
- Perform web searches
- Retrieve system information (via backend APIs)
- Manage tasks and reminders
- Control media playback

**Interface:**
```typescript
interface AgentController {
  executeAction(intent: Intent): Promise<ActionResult>;
  registerAction(actionType: string, handler: ActionHandler): void;
  getAvailableActions(): string[];
}

interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}

type ActionHandler = (entities: Record<string, any>) => Promise<ActionResult>;
```

**Implementation Details:**
- Implement action handlers as plugins for extensibility
- Use `window.open()` for opening URLs in new tabs
- Create backend endpoints for system information retrieval
- Implement rate limiting to prevent abuse
- Add action logging for debugging and analytics

**Supported Actions:**
- `open_website`: Opens specified URL (YouTube, Google, etc.)
- `search_web`: Performs Google search with query
- `play_media`: Opens media URL (YouTube video, Spotify)
- `get_system_info`: Retrieves CPU, memory, temperature data
- `set_reminder`: Creates a timed reminder
- `get_news`: Fetches latest news from APIs
- `get_weather`: Retrieves weather information

### 4. Avatar Component

**Purpose**: Provides visual representation of Swaraj AI with reactive animations

**Key Responsibilities:**
- Render anime-style avatar
- Animate based on AI state (listening, thinking, speaking)
- Display emotional expressions
- Sync animations with voice output

**Interface:**
```typescript
interface AvatarComponent {
  setState(state: AvatarState): void;
  setExpression(expression: Expression): void;
  syncWithAudio(audioLevel: number): void;
}

type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';
type Expression = 'neutral' | 'happy' | 'focused' | 'confident';
```

**Implementation Details:**
- Use Lottie animations for lightweight, scalable avatar graphics
- Alternative: Three.js for 3D avatar with more complex animations
- Implement state machine for smooth transitions between states
- Add lip-sync approximation based on audio amplitude
- Create expression presets matching Swaraj's personality traits

### 5. UI Frontend

**Purpose**: Orchestrates all visual components and manages application state

**Key Responsibilities:**
- Render futuristic anime-themed interface
- Display command feedback and status messages
- Manage application routing and navigation
- Handle user interactions and permissions

**Component Structure:**
```
App
├── ThemeProvider (Dark mode with neon gradients)
├── VoicePermissionGate (Request microphone access)
├── MainInterface
│   ├── BackgroundCanvas (Animated gradient background)
│   ├── AvatarDisplay (Avatar component wrapper)
│   ├── WaveformVisualizer (Real-time audio visualization)
│   ├── CommandFeedback (Floating status messages)
│   ├── ConversationHistory (Optional chat log)
│   └── ControlPanel (Settings, mute, etc.)
└── ErrorBoundary (Graceful error handling)
```

**Styling Approach:**
- Custom TailwindCSS theme with cyberpunk color palette
- CSS variables for dynamic theming
- Framer Motion for all animations and transitions
- Glassmorphism effects for UI cards
- Neon glow effects using CSS filters and box-shadows

### 6. Memory Layer

**Purpose**: Maintains conversation context and user preferences

**Key Responsibilities:**
- Store conversation history
- Track user preferences and settings
- Maintain session state
- Provide context for NLP engine

**Interface:**
```typescript
interface MemoryLayer {
  addMessage(role: 'user' | 'assistant', content: string): void;
  getContext(maxMessages?: number): ConversationContext;
  savePreference(key: string, value: any): Promise<void>;
  getPreference(key: string): Promise<any>;
  clearSession(): void;
}

interface ConversationContext {
  messages: Message[];
  preferences: Record<string, any>;
  sessionId: string;
  timestamp: number;
}
```

**Implementation Details:**
- Use Redis for fast session storage with TTL
- Implement conversation summarization for long sessions
- Store user preferences in Firestore for persistence
- Encrypt sensitive data using AES-256
- Implement automatic session cleanup after 24 hours

## Data Models

### Message Model
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  language: 'en' | 'hi';
  timestamp: number;
  intent?: Intent;
  actionResult?: ActionResult;
}
```

### User Profile Model
```typescript
interface UserProfile {
  userId: string;
  preferences: {
    language: 'en' | 'hi' | 'auto';
    voiceSpeed: number; // 0.8 - 1.2
    theme: 'default' | 'custom';
    autoExecute: boolean; // Skip confirmations for safe actions
  };
  conversationHistory: Message[];
  createdAt: number;
  lastActive: number;
}
```

### Action Registry Model
```typescript
interface ActionDefinition {
  type: string;
  description: string;
  parameters: ParameterSchema[];
  requiresConfirmation: boolean;
  handler: ActionHandler;
}

interface ParameterSchema {
  name: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  description: string;
}
```

## Error Handling

### Error Categories

1. **Voice Input Errors**
   - Microphone permission denied → Show permission request UI
   - Speech recognition failure → Retry with fallback to text input
   - Network timeout → Cache and retry with exponential backoff

2. **NLP Processing Errors**
   - Low confidence intent → Ask clarifying question
   - API rate limit → Queue request and notify user
   - Invalid response → Use fallback response templates

3. **Action Execution Errors**
   - Action not found → Suggest similar actions
   - Action failed → Provide error message and alternative
   - Permission denied → Request confirmation or explain limitation

4. **UI Rendering Errors**
   - Animation failure → Fallback to static UI
   - Audio playback error → Show text response
   - WebGL not supported → Use 2D avatar fallback

### Error Recovery Strategy

- Implement graceful degradation for all features
- Provide clear, conversational error messages
- Log errors to backend for monitoring
- Offer manual alternatives when automation fails
- Never leave user in broken state without feedback

## Testing Strategy

### Unit Testing
- Test individual components in isolation
- Mock external APIs and services
- Verify state management logic
- Test utility functions and helpers
- Target: 80% code coverage

**Tools**: Jest, React Testing Library

### Integration Testing
- Test voice input → NLP → action execution flow
- Verify API integrations with real endpoints
- Test WebSocket communication
- Validate data persistence and retrieval
- Test error handling across component boundaries

**Tools**: Jest, Supertest, Playwright

### End-to-End Testing
- Simulate complete user conversations
- Test voice input and output in browser
- Verify UI animations and transitions
- Test cross-browser compatibility
- Validate mobile responsiveness

**Tools**: Playwright, Cypress

### Performance Testing
- Measure voice recognition latency
- Test response generation speed
- Monitor memory usage during long sessions
- Verify animation frame rates
- Load test backend APIs

**Tools**: Lighthouse, Chrome DevTools, k6

### User Acceptance Testing
- Test with real users for personality consistency
- Validate natural language understanding accuracy
- Gather feedback on UI/UX experience
- Test bilingual conversation flows
- Verify accessibility compliance

## Security Considerations

1. **API Key Protection**
   - Store all API keys in environment variables
   - Never expose keys in frontend code
   - Implement backend proxy for all external API calls
   - Rotate keys regularly

2. **Data Encryption**
   - Use HTTPS for all communications
   - Encrypt conversation data at rest
   - Implement secure WebSocket connections (WSS)
   - Hash sensitive user information

3. **Input Validation**
   - Sanitize all user inputs before processing
   - Implement rate limiting on API endpoints
   - Validate action parameters before execution
   - Prevent command injection attacks

4. **Permission Management**
   - Request microphone access explicitly
   - Confirm before accessing sensitive data
   - Implement action whitelisting
   - Allow users to revoke permissions

## Performance Optimization

1. **Voice Processing**
   - Use Web Speech API for low-latency recognition
   - Implement audio streaming for faster TTS
   - Cache common responses
   - Preload voice models

2. **UI Rendering**
   - Use React.memo for expensive components
   - Implement virtual scrolling for conversation history
   - Lazy load avatar animations
   - Optimize animation frame rates

3. **Network Optimization**
   - Implement request debouncing
   - Use WebSocket for real-time communication
   - Cache API responses with TTL
   - Compress data payloads

4. **Asset Optimization**
   - Use WebP images with fallbacks
   - Implement code splitting
   - Lazy load non-critical components
   - Minify and compress all assets

## Deployment Architecture

### Frontend Deployment
- Host on Vercel with automatic deployments from Git
- Configure custom domain with SSL
- Enable CDN for global distribution
- Implement PWA manifest for installability

### Backend Deployment
- Deploy on Google Cloud Run for auto-scaling
- Configure environment variables for API keys
- Set up Cloud SQL or Firestore for database
- Implement health checks and monitoring

### CI/CD Pipeline
- Automated testing on pull requests
- Staging environment for pre-production testing
- Automated deployment on main branch merge
- Rollback capability for failed deployments

## Future Enhancements

1. **Custom Voice Cloning**: Integrate Azure Custom Neural Voice to clone Swaraj's actual voice
2. **Multi-modal Input**: Add text chat alongside voice for flexibility
3. **Advanced Agentic Capabilities**: Email sending, calendar management, code execution
4. **Mobile App**: Native iOS/Android apps using React Native
5. **Offline Mode**: Local speech recognition and cached responses
6. **Multi-user Support**: User accounts with personalized experiences
7. **Plugin Marketplace**: Allow third-party action plugins
8. **Analytics Dashboard**: Track usage patterns and improve AI responses
