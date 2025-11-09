import { Intent, ActionResult, ConversationContext } from '../types';
import { GeminiService } from './geminiService';

type Language = 'en' | 'hi' | 'mixed';

// Response generator for Swaraj AI
export class ResponseGenerator {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = new GeminiService();
  }

  async generateResponse(
    intent: Intent,
    actionResult: ActionResult,
    context?: ConversationContext,
    language: Language = 'en'
  ): Promise<string> {
    try {
      // Handle different response scenarios
      if (!actionResult.success) {
        return this.generateErrorResponse(intent, actionResult, language);
      }

      if (intent.requiresConfirmation && !actionResult.data?.confirmed) {
        return this.generateConfirmationRequest(intent, language);
      }

      // Generate success response based on action type
      return await this.generateSuccessResponse(intent, actionResult, context, language);
    } catch (error) {
      console.error('Error generating response:', error);
      return this.getFallbackResponse(language);
    }
  }

  private async generateSuccessResponse(
    intent: Intent,
    actionResult: ActionResult,
    context?: ConversationContext,
    language: Language = 'en'
  ): Promise<string> {
    // Use Gemini for context-aware response generation
    const prompt = this.buildPromptForAction(intent, actionResult);
    
    try {
      const response = await this.geminiService.generateResponse(prompt, context);
      return response;
    } catch (error) {
      // Fallback to template-based responses
      return this.getTemplateResponse(intent, actionResult, language);
    }
  }

  private buildPromptForAction(intent: Intent, actionResult: ActionResult): string {
    const actionDescriptions: Record<string, string> = {
      open_website: `I just opened ${actionResult.data?.name || actionResult.data?.url} for the user.`,
      search_web: `I'm searching for "${actionResult.data?.query}" on Google.`,
      play_media: `I'm playing ${actionResult.data?.query} on ${actionResult.data?.platform || 'YouTube'}.`,
      get_system_info: `Here's the system information: ${JSON.stringify(actionResult.data)}`,
      get_news: `I'm fetching news about ${actionResult.data?.topic}.`,
      general_conversation: `The user said something that doesn't require a specific action.`,
    };

    const description = actionDescriptions[intent.action] || `I executed the action: ${intent.action}`;
    
    return `${description} Respond naturally and conversationally, maintaining Swaraj's personality.`;
  }

  private getTemplateResponse(
    intent: Intent,
    actionResult: ActionResult,
    language: Language
  ): string {
    const templates: Record<string, Record<Language, string[]>> = {
      open_website: {
        en: [
          `Got it, bhai. Opening ${actionResult.data?.name || 'that'} for you.`,
          `Sure thing! ${actionResult.data?.name || 'Website'} coming right up.`,
          `On it! Opening ${actionResult.data?.name || 'the site'} now.`,
        ],
        hi: [
          `हो गया भाई। ${actionResult.data?.name || 'वो'} खोल रहा हूं।`,
          `बिल्कुल! ${actionResult.data?.name || 'वेबसाइट'} खुल रही है।`,
        ],
        mixed: [
          `Got it, bhai. ${actionResult.data?.name || 'Website'} खोल रहा हूं।`,
        ],
      },
      search_web: {
        en: [
          `Searching for "${actionResult.data?.query}" — let's see what we find.`,
          `On it! Looking up ${actionResult.data?.query} for you.`,
          `Got it, searching for ${actionResult.data?.query} now.`,
        ],
        hi: [
          `"${actionResult.data?.query}" ढूंढ रहा हूं — देखते हैं क्या मिलता है।`,
        ],
        mixed: [
          `Searching for "${actionResult.data?.query}" — देखते हैं क्या मिलता है।`,
        ],
      },
      play_media: {
        en: [
          `Playing ${actionResult.data?.query} — enjoy the vibes! 🎧`,
          `Got it! ${actionResult.data?.query} coming up on ${actionResult.data?.platform || 'YouTube'}.`,
          `Sure thing, loading ${actionResult.data?.query} for you.`,
        ],
        hi: [
          `${actionResult.data?.query} चला रहा हूं — मज़े करो! 🎧`,
        ],
        mixed: [
          `Playing ${actionResult.data?.query} — मज़े करो! 🎧`,
        ],
      },
      get_system_info: {
        en: [
          `Here's your system info. Everything looking smooth!`,
          `Got the system stats for you. All good!`,
        ],
        hi: [
          `यह रहा आपका सिस्टम इन्फो। सब ठीक चल रहा है!`,
        ],
        mixed: [
          `Here's your system info — सब ठीक चल रहा है!`,
        ],
      },
      get_news: {
        en: [
          `Fetching the latest on ${actionResult.data?.topic} — let's stay updated!`,
          `Got it! Looking up news about ${actionResult.data?.topic}.`,
        ],
        hi: [
          `${actionResult.data?.topic} की ताज़ा खबरें ला रहा हूं।`,
        ],
        mixed: [
          `Fetching latest news on ${actionResult.data?.topic} — ताज़ा खबरें आ रही हैं।`,
        ],
      },
      general_conversation: {
        en: [
          `I'm here to help! What would you like to do?`,
          `Sure, I'm listening. What's on your mind?`,
          `Yo, what can I do for you?`,
        ],
        hi: [
          `मैं यहां हूं मदद के लिए! क्या करना है?`,
        ],
        mixed: [
          `I'm here, bhai! क्या करना है?`,
        ],
      },
    };

    const actionTemplates = templates[intent.action];
    if (!actionTemplates) {
      return actionResult.message;
    }

    const languageTemplates = actionTemplates[language] || actionTemplates.en;
    const randomTemplate = languageTemplates[Math.floor(Math.random() * languageTemplates.length)];
    
    return randomTemplate;
  }

  private generateErrorResponse(
    intent: Intent,
    actionResult: ActionResult,
    language: Language
  ): string {
    const errorTemplates: Record<Language, string[]> = {
      en: [
        `Hmm, ran into an issue: ${actionResult.message}. Let me try another way.`,
        `Oops, something went wrong: ${actionResult.message}. Want to try again?`,
        `Sorry bhai, couldn't complete that: ${actionResult.message}`,
      ],
      hi: [
        `अरे, कुछ गड़बड़ हो गई: ${actionResult.message}। फिर से कोशिश करें?`,
      ],
      mixed: [
        `Sorry bhai, कुछ गड़बड़ हो गई: ${actionResult.message}`,
      ],
    };

    const templates = errorTemplates[language] || errorTemplates.en;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateConfirmationRequest(intent: Intent, language: Language): string {
    const confirmationTemplates: Record<string, Record<Language, string>> = {
      get_system_info: {
        en: `Just to confirm — you want me to access your system information (CPU, memory, etc.)? Say yes to proceed.`,
        hi: `कन्फर्म करना है — आप चाहते हैं कि मैं आपकी सिस्टम जानकारी देखूं? हां बोलें।`,
        mixed: `Just to confirm — आप चाहते हैं system info? Say yes.`,
      },
    };

    const actionConfirmations = confirmationTemplates[intent.action];
    if (!actionConfirmations) {
      return `Do you want me to proceed with ${intent.action}? Please confirm.`;
    }

    return actionConfirmations[language] || actionConfirmations.en;
  }

  private getFallbackResponse(language: Language): string {
    const fallbacks: Record<Language, string> = {
      en: "I'm here, but something went wrong on my end. Let's try that again?",
      hi: "मैं यहां हूं, पर कुछ गड़बड़ हो गई। फिर से कोशिश करें?",
      mixed: "I'm here, bhai, पर कुछ गड़बड़ हो गई। Try again?",
    };

    return fallbacks[language] || fallbacks.en;
  }

  // Generate responses for specific scenarios

  generateGreeting(language: Language = 'en'): string {
    const greetings: Record<Language, string[]> = {
      en: [
        "Yo! Swaraj AI here. Ready to build something cool?",
        "Hey there! What can I help you with today?",
        "What's up? I'm here to assist — just say the word.",
      ],
      hi: [
        "नमस्ते! Swaraj AI यहां है। क्या करना है?",
        "हेलो! मैं यहां हूं मदद के लिए।",
      ],
      mixed: [
        "Yo! Swaraj AI here. क्या करना है?",
        "Hey bhai! Ready to help — बोलो क्या चाहिए?",
      ],
    };

    const templates = greetings[language] || greetings.en;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  generateGoodbye(language: Language = 'en'): string {
    const goodbyes: Record<Language, string[]> = {
      en: [
        "Catch you later! Stay awesome. 🚀",
        "See you soon, bhai! Keep coding.",
        "Alright, signing off. Hit me up anytime!",
      ],
      hi: [
        "फिर मिलेंगे! अच्छा रहो। 🚀",
        "बाद में मिलते हैं भाई!",
      ],
      mixed: [
        "Catch you later, bhai! Stay awesome. 🚀",
        "See you soon! फिर मिलेंगे।",
      ],
    };

    const templates = goodbyes[language] || goodbyes.en;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  generateClarificationRequest(originalText: string, language: Language = 'en'): string {
    const clarifications: Record<Language, string[]> = {
      en: [
        "I didn't quite catch that. Could you rephrase?",
        "Hmm, not sure what you mean. Can you say that differently?",
        "Sorry bhai, didn't understand. Try again?",
      ],
      hi: [
        "समझ नहीं आया। फिर से बोलें?",
        "क्षमा करें, समझ नहीं आया। दोबारा कहें?",
      ],
      mixed: [
        "Sorry bhai, समझ नहीं आया। Try again?",
      ],
    };

    const templates = clarifications[language] || clarifications.en;
    return templates[Math.floor(Math.random() * templates.length)];
  }
}
