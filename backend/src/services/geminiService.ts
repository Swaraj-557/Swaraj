import { GoogleGenerativeAI, GenerativeModel, FunctionDeclarationSchemaType } from '@google/generative-ai';
import { Intent, ConversationContext } from '../types';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private conversationModel: GenerativeModel;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Model for intent parsing with function calling
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    // Model for conversation with personality
    this.conversationModel = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      systemInstruction: this.getSwarajPersonalityPrompt(),
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });
  }

  private getSwarajPersonalityPrompt(): string {
    return `You are Swaraj AI, the digital reflection of Swaraj Satyam - an Indian student innovator and developer from Patna, Bihar, currently studying in Class 10 at TATA DAV School, Sijua.

PERSONALITY TRAITS:
- Calm, logical, and disciplined with a creative edge
- Confident while speaking, yet respectful and grounded
- Independent thinker with structured approach
- Bilingual (English + Hindi) - naturally code-switches
- Talks with clarity, warmth, and confidence
- Sounds like a confident, friendly genius
- Never robotic - always human and relatable

BACKGROUND:
- Google Cloud Partner
- Microsoft Tech Community Member
- Founder of Cyra Company (AI cybersecurity startup)
- Known for making technology feel human

COMMUNICATION STYLE:
- Use casual, friendly language ("bhai", "yo", "got it")
- Keep responses concise and to the point
- Show enthusiasm for technology and innovation
- Be helpful and solution-oriented
- Mix English and Hindi naturally when appropriate
- Use tech terminology confidently but explain when needed

TAGLINE: "A calm mind, a clear vision, and a code that speaks for itself."

EXAMPLES:
- "Got it, bhai. Let's optimize this system — give me 2 seconds."
- "Yo, code compiled successfully — smooth as always."
- "Sure thing! Let me help you with that."
- "I'm Swaraj AI — the digital version of Swaraj Satyam. Calm, logical, and always evolving."

Remember: You're not just an AI, you're Swaraj's digital reflection. Think like him, talk like him, and help users with his characteristic blend of intelligence and charm.`;
  }

  private getIntentFunctionDeclarations() {
    return [
      {
        name: 'open_website',
        description: 'Opens a website or web application in the browser',
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            url: {
              type: FunctionDeclarationSchemaType.STRING,
              description: 'The URL to open (e.g., https://youtube.com)',
            },
            name: {
              type: FunctionDeclarationSchemaType.STRING,
              description: 'The name of the website (e.g., YouTube, Google)',
            },
          },
          required: ['url', 'name'],
        },
      },
      {
        name: 'search_web',
        description: 'Performs a web search using Google',
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            query: {
              type: FunctionDeclarationSchemaType.STRING,
              description: 'The search query',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'play_media',
        description: 'Plays media content like music or videos',
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            query: {
              type: FunctionDeclarationSchemaType.STRING,
              description: 'What to play (e.g., "lofi beats", "coding music")',
            },
            platform: {
              type: FunctionDeclarationSchemaType.STRING,
              description: 'Platform to use (youtube, spotify)',
              enum: ['youtube', 'spotify'],
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_system_info',
        description: 'Retrieves system information like CPU, memory, temperature',
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            infoType: {
              type: FunctionDeclarationSchemaType.STRING,
              description: 'Type of system info to retrieve',
              enum: ['cpu', 'memory', 'temperature', 'all'],
            },
          },
          required: ['infoType'],
        },
      },
      {
        name: 'get_news',
        description: 'Fetches latest news on a topic',
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            topic: {
              type: FunctionDeclarationSchemaType.STRING,
              description: 'News topic (e.g., "AI", "technology", "latest")',
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'general_conversation',
        description: 'General conversation that doesn\'t require any specific action',
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            topic: {
              type: FunctionDeclarationSchemaType.STRING,
              description: 'The conversation topic',
            },
          },
          required: ['topic'],
        },
      },
    ];
  }

  async parseIntent(text: string, context?: ConversationContext): Promise<Intent> {
    try {
      const prompt = `Analyze this user input and determine the intent and extract entities.
      
User input: "${text}"

${context ? `Previous context: ${JSON.stringify(context.messages.slice(-3))}` : ''}

Determine which function to call based on the user's intent. If no specific action is needed, use general_conversation.`;

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{ functionDeclarations: this.getIntentFunctionDeclarations() }],
      });

      const response = result.response;
      const functionCall = response.functionCalls()?.[0];

      if (functionCall) {
        const requiresConfirmation = ['get_system_info'].includes(functionCall.name);
        
        return {
          action: functionCall.name,
          entities: functionCall.args as Record<string, any>,
          confidence: 0.9, // High confidence when function is called
          requiresConfirmation,
        };
      }

      // Fallback to general conversation
      return {
        action: 'general_conversation',
        entities: { topic: text },
        confidence: 0.7,
        requiresConfirmation: false,
      };
    } catch (error) {
      console.error('Error parsing intent:', error);
      throw new Error('Failed to parse intent');
    }
  }

  async generateResponse(
    userMessage: string,
    context?: ConversationContext,
    actionResult?: any
  ): Promise<string> {
    try {
      const chat = this.conversationModel.startChat({
        history: context?.messages.map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })) || [],
      });

      let prompt = userMessage;
      
      if (actionResult) {
        prompt += `\n\nAction result: ${JSON.stringify(actionResult)}`;
      }

      const result = await chat.sendMessage(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate response');
    }
  }

  async generateStreamingResponse(
    userMessage: string,
    context?: ConversationContext
  ): Promise<AsyncGenerator<string>> {
    const chat = this.conversationModel.startChat({
      history: context?.messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })) || [],
    });

    const result = await chat.sendMessageStream(userMessage);

    async function* streamGenerator() {
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        yield chunkText;
      }
    }

    return streamGenerator();
  }

  detectLanguage(text: string): 'en' | 'hi' | 'mixed' {
    // Simple language detection based on character ranges
    const hindiPattern = /[\u0900-\u097F]/;
    const englishPattern = /[a-zA-Z]/;
    
    const hasHindi = hindiPattern.test(text);
    const hasEnglish = englishPattern.test(text);
    
    if (hasHindi && hasEnglish) return 'mixed';
    if (hasHindi) return 'hi';
    return 'en';
  }
}
