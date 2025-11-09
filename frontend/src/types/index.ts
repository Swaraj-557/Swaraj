// Voice Interface Types
export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';
export type Expression = 'neutral' | 'happy' | 'focused' | 'confident';
export type Language = 'en' | 'hi' | 'auto';

// Message Types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  language: Language;
  timestamp: number;
  intent?: Intent;
  actionResult?: ActionResult;
}

// Intent Types
export interface Intent {
  action: string;
  entities: Record<string, any>;
  confidence: number;
  requiresConfirmation: boolean;
}

// Action Types
export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}

// User Preferences
export interface UserPreferences {
  language: Language;
  voiceSpeed: number;
  theme: 'default' | 'custom';
  autoExecute: boolean;
}

// Conversation Context
export interface ConversationContext {
  messages: Message[];
  preferences: UserPreferences;
  sessionId: string;
  timestamp: number;
}
