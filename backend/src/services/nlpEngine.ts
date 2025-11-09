import { GeminiService } from './geminiService';
import { Intent, ConversationContext } from '../types';

export class NLPEngine {
  private geminiService: GeminiService;
  private readonly CONFIDENCE_THRESHOLD = 0.7;

  constructor() {
    this.geminiService = new GeminiService();
  }

  async parseIntent(text: string, context?: ConversationContext): Promise<Intent> {
    try {
      console.log(`🧠 Parsing intent for: "${text}"`);
      
      const intent = await this.geminiService.parseIntent(text, context);
      
      // Log the parsed intent
      console.log(`✅ Intent parsed: ${intent.action} (confidence: ${intent.confidence})`);
      
      // Check confidence threshold
      if (intent.confidence < this.CONFIDENCE_THRESHOLD) {
        console.log(`⚠️  Low confidence (${intent.confidence}), may need clarification`);
        intent.requiresConfirmation = true;
      }
      
      return intent;
    } catch (error) {
      console.error('Error in parseIntent:', error);
      
      // Return fallback intent for error cases
      return {
        action: 'error',
        entities: { originalText: text, error: 'Failed to parse intent' },
        confidence: 0,
        requiresConfirmation: false,
      };
    }
  }

  async generateResponse(
    intent: Intent,
    actionResult?: any,
    context?: ConversationContext
  ): Promise<string> {
    try {
      // Build the message for response generation
      let message = '';
      
      if (intent.action === 'general_conversation') {
        message = intent.entities.topic || 'Hello';
      } else if (actionResult) {
        message = `The action "${intent.action}" was executed. Result: ${JSON.stringify(actionResult)}`;
      } else {
        message = `I'm about to execute: ${intent.action}`;
      }
      
      const response = await this.geminiService.generateResponse(message, context, actionResult);
      
      return response;
    } catch (error) {
      console.error('Error generating response:', error);
      return "Sorry bhai, I'm having trouble generating a response right now. Let me try again.";
    }
  }

  detectLanguage(text: string): 'en' | 'hi' | 'mixed' {
    return this.geminiService.detectLanguage(text);
  }

  async handleLowConfidenceIntent(intent: Intent, originalText: string): Promise<string> {
    // Generate a clarification question
    const clarificationPrompts: Record<string, string> = {
      open_website: "Which website would you like me to open?",
      search_web: "What would you like me to search for?",
      play_media: "What kind of music or video would you like to play?",
      get_system_info: "What system information do you need? CPU, memory, or temperature?",
      get_news: "What news topic are you interested in?",
    };
    
    const clarification = clarificationPrompts[intent.action] || 
      `I'm not quite sure what you want me to do. Could you rephrase that?`;
    
    return clarification;
  }

  async streamResponse(
    userMessage: string,
    context?: ConversationContext
  ): Promise<AsyncGenerator<string>> {
    return this.geminiService.generateStreamingResponse(userMessage, context);
  }

  // Validate intent before execution
  validateIntent(intent: Intent): { valid: boolean; reason?: string } {
    // Check if action is supported
    const supportedActions = [
      'open_website',
      'search_web',
      'play_media',
      'get_system_info',
      'get_news',
      'general_conversation',
    ];
    
    if (!supportedActions.includes(intent.action)) {
      return {
        valid: false,
        reason: `Action "${intent.action}" is not supported`,
      };
    }
    
    // Check if required entities are present
    if (intent.action === 'open_website' && !intent.entities.url) {
      return {
        valid: false,
        reason: 'Missing required parameter: url',
      };
    }
    
    if (intent.action === 'search_web' && !intent.entities.query) {
      return {
        valid: false,
        reason: 'Missing required parameter: query',
      };
    }
    
    return { valid: true };
  }

  // Extract keywords from text for better intent matching
  extractKeywords(text: string): string[] {
    const keywords: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Website keywords
    if (lowerText.includes('youtube')) keywords.push('youtube');
    if (lowerText.includes('google')) keywords.push('google');
    if (lowerText.includes('github')) keywords.push('github');
    
    // Action keywords
    if (lowerText.match(/\b(open|launch|start)\b/)) keywords.push('open');
    if (lowerText.match(/\b(search|find|look)\b/)) keywords.push('search');
    if (lowerText.match(/\b(play|music|song|video)\b/)) keywords.push('play');
    if (lowerText.match(/\b(system|cpu|memory|temperature)\b/)) keywords.push('system');
    if (lowerText.match(/\b(news|latest|update)\b/)) keywords.push('news');
    
    return keywords;
  }
}
