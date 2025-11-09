// Voice Interface Types
export type Language = 'en' | 'hi' | 'mixed';

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

export type ActionHandler = (entities: Record<string, any>) => Promise<ActionResult>;

export interface ActionDefinition {
  type: string;
  description: string;
  parameters: ParameterSchema[];
  requiresConfirmation: boolean;
  handler: ActionHandler;
}

export interface ParameterSchema {
  name: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  description: string;
}

// User Profile Types
export interface UserProfile {
  userId: string;
  preferences: UserPreferences;
  conversationHistory: Message[];
  createdAt: number;
  lastActive: number;
}

export interface UserPreferences {
  language: 'en' | 'hi' | 'auto';
  voiceSpeed: number;
  theme: 'default' | 'custom';
  autoExecute: boolean;
}

// Conversation Context
export interface ConversationContext {
  messages: Message[];
  preferences: Record<string, any>;
  sessionId: string;
  timestamp: number;
}

// WebSocket Event Types
export interface SocketEvents {
  // Client to Server
  'voice:transcript': (data: { text: string; language: Language }) => void;
  'action:execute': (intent: Intent) => void;
  'session:start': () => void;
  'session:end': () => void;

  // Server to Client
  'voice:response': (data: { text: string; audioUrl?: string }) => void;
  'action:result': (result: ActionResult) => void;
  'error': (error: { message: string; code: string }) => void;
  'status': (status: { state: string; message: string }) => void;
}
