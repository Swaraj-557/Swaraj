import { Message, ConversationContext, UserPreferences } from '../types';
import { FirestoreService } from './firestoreService';
import crypto from 'crypto';

export class MemoryLayer {
  private firestoreService: FirestoreService;
  private encryptionKey: string;

  constructor() {
    this.firestoreService = new FirestoreService();
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
  }

  async addMessage(sessionId: string, role: 'user' | 'assistant', content: string, language: string = 'en'): Promise<void> {
    const message: Message = {
      id: this.generateMessageId(),
      role,
      content: this.encrypt(content),
      language: language as any,
      timestamp: Date.now(),
    };

    await this.firestoreService.saveMessage(sessionId, message);
  }

  async getContext(sessionId: string, maxMessages: number = 10): Promise<ConversationContext> {
    const messages = await this.firestoreService.getMessages(sessionId, maxMessages);
    
    // Decrypt messages
    const decryptedMessages = messages.map(msg => ({
      ...msg,
      content: this.decrypt(msg.content),
    }));

    const preferences = await this.getPreferences(sessionId);

    return {
      messages: decryptedMessages,
      preferences: preferences || this.getDefaultPreferences(),
      sessionId,
      timestamp: Date.now(),
    };
  }

  async savePreference(sessionId: string, key: string, value: any): Promise<void> {
    const currentPrefs = await this.getPreferences(sessionId) || this.getDefaultPreferences();
    currentPrefs[key] = value;
    await this.firestoreService.savePreferences(sessionId, currentPrefs);
  }

  async getPreference(sessionId: string, key: string): Promise<any> {
    const prefs = await this.getPreferences(sessionId);
    return prefs?.[key];
  }

  async getPreferences(sessionId: string): Promise<Record<string, any> | null> {
    return await this.firestoreService.getPreferences(sessionId);
  }

  async clearSession(sessionId: string): Promise<void> {
    await this.firestoreService.deleteSession(sessionId);
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      language: 'auto',
      voiceSpeed: 1.0,
      theme: 'default',
      autoExecute: false,
    };
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Encryption utilities
  private encrypt(text: string): string {
    try {
      const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return text; // Fallback to unencrypted in case of error
    }
  }

  private decrypt(encryptedText: string): string {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedText; // Fallback to encrypted text
    }
  }

  // Conversation summarization for long sessions
  async summarizeConversation(sessionId: string): Promise<string> {
    const context = await this.getContext(sessionId, 50);
    
    if (context.messages.length < 10) {
      return 'Short conversation, no summary needed';
    }

    // Simple summarization - in production, use Gemini for this
    const topics = new Set<string>();
    context.messages.forEach(msg => {
      if (msg.intent?.action) {
        topics.add(msg.intent.action);
      }
    });

    return `Conversation with ${context.messages.length} messages covering: ${Array.from(topics).join(', ')}`;
  }
}
