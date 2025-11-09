import { NLPEngine } from './nlpEngine';
import { AgentController } from './agentController';
import { ResponseGenerator } from './responseGenerator';
import { TTSService } from './ttsService';
import { MemoryLayer } from './memoryLayer';
import { Intent, ActionResult } from '../types';

export class ConversationOrchestrator {
  private nlpEngine: NLPEngine;
  private agentController: AgentController;
  private responseGenerator: ResponseGenerator;
  private ttsService: TTSService;
  private memoryLayer: MemoryLayer;

  constructor() {
    this.nlpEngine = new NLPEngine();
    this.agentController = new AgentController();
    this.responseGenerator = new ResponseGenerator();
    this.ttsService = new TTSService();
    this.memoryLayer = new MemoryLayer();
  }

  async processUserInput(
    sessionId: string,
    text: string,
    language: string = 'en'
  ): Promise<{ text: string; audio?: Buffer; actionData?: any }> {
    try {
      // 1. Save user message
      await this.memoryLayer.addMessage(sessionId, 'user', text, language);

      // 2. Get conversation context
      const context = await this.memoryLayer.getContext(sessionId);

      // 3. Parse intent
      const intent = await this.nlpEngine.parseIntent(text, context);

      // 4. Validate intent
      const validation = this.nlpEngine.validateIntent(intent);
      if (!validation.valid) {
        const errorResponse = `Sorry, ${validation.reason}`;
        return { text: errorResponse };
      }

      // 5. Check if confirmation is required
      if (intent.requiresConfirmation) {
        const confirmationText = await this.responseGenerator.generateResponse(
          intent,
          { success: true, message: 'Confirmation required', data: { confirmed: false } },
          context,
          language as any
        );
        return { text: confirmationText };
      }

      // 6. Execute action
      const actionResult = await this.agentController.executeAction(intent);

      // 7. Generate response
      const responseText = await this.responseGenerator.generateResponse(
        intent,
        actionResult,
        context,
        language as any
      );

      // 8. Save assistant message
      await this.memoryLayer.addMessage(sessionId, 'assistant', responseText, language);

      // 9. Generate audio
      let audioBuffer: Buffer | undefined;
      try {
        audioBuffer = await this.ttsService.synthesizeWithSSML(
          responseText,
          language as any,
          1.0
        );
      } catch (error) {
        console.error('TTS error:', error);
        // Continue without audio
      }

      return {
        text: responseText,
        audio: audioBuffer,
        actionData: actionResult.success ? actionResult.data : null,
      };
    } catch (error) {
      console.error('Conversation processing error:', error);
      const fallbackText = this.responseGenerator.generateClarificationRequest(text, language as any);
      return { text: fallbackText };
    }
  }

  async handleGreeting(sessionId: string, language: string = 'en'): Promise<{ text: string; audio?: Buffer }> {
    const greetingText = this.responseGenerator.generateGreeting(language as any);
    
    let audioBuffer: Buffer | undefined;
    try {
      audioBuffer = await this.ttsService.synthesizeWithSSML(greetingText, language as any);
    } catch (error) {
      console.error('TTS error:', error);
    }

    return { text: greetingText, audio: audioBuffer };
  }

  async handleGoodbye(sessionId: string, language: string = 'en'): Promise<{ text: string; audio?: Buffer }> {
    const goodbyeText = this.responseGenerator.generateGoodbye(language as any);
    
    let audioBuffer: Buffer | undefined;
    try {
      audioBuffer = await this.ttsService.synthesizeWithSSML(goodbyeText, language as any);
    } catch (error) {
      console.error('TTS error:', error);
    }

    // Clear session
    await this.memoryLayer.clearSession(sessionId);

    return { text: goodbyeText, audio: audioBuffer };
  }

  async getConversationSummary(sessionId: string): Promise<string> {
    return await this.memoryLayer.summarizeConversation(sessionId);
  }
}
