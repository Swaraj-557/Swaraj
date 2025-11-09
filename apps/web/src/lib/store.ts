import { create } from 'zustand';

export type AIState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ToolNotification {
  id: string;
  message: string;
  timestamp: number;
}

interface AppState {
  // AI State
  aiState: AIState;
  setAIState: (state: AIState) => void;

  // Conversation
  messages: Message[];
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  clearMessages: () => void;

  // Audio
  isAudioPlaying: boolean;
  setIsAudioPlaying: (playing: boolean) => void;
  audioVolume: number;
  setAudioVolume: (volume: number) => void;

  // Tool Notifications
  toolNotifications: ToolNotification[];
  addToolNotification: (message: string) => void;
  clearToolNotifications: () => void;

  // Session
  sessionId: string;
  generateNewSession: () => void;
}

export const useStore = create<AppState>((set) => ({
  // AI State
  aiState: 'idle',
  setAIState: (state) => set({ aiState: state }),

  // Conversation
  messages: [],
  addMessage: (role, content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Math.random().toString(36).substring(7),
          role,
          content,
          timestamp: Date.now(),
        },
      ],
    })),
  clearMessages: () => set({ messages: [] }),

  // Audio
  isAudioPlaying: false,
  setIsAudioPlaying: (playing) => set({ isAudioPlaying: playing }),
  audioVolume: 0,
  setAudioVolume: (volume) => set({ audioVolume: volume }),

  // Tool Notifications
  toolNotifications: [],
  addToolNotification: (message) =>
    set((state) => ({
      toolNotifications: [
        ...state.toolNotifications,
        {
          id: Math.random().toString(36).substring(7),
          message,
          timestamp: Date.now(),
        },
      ],
    })),
  clearToolNotifications: () => set({ toolNotifications: [] }),

  // Session
  sessionId: Math.random().toString(36).substring(7),
  generateNewSession: () =>
    set({ sessionId: Math.random().toString(36).substring(7), messages: [] }),
}));
