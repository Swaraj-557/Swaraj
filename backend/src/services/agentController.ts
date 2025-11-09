import { Intent, ActionResult, ActionHandler, ActionDefinition } from '../types';
import os from 'os';

export class AgentController {
  private actions: Map<string, ActionDefinition> = new Map();
  private actionHistory: Array<{ intent: Intent; result: ActionResult; timestamp: number }> = [];

  constructor() {
    this.registerDefaultActions();
  }

  private registerDefaultActions(): void {
    // Register open_website action
    this.registerAction({
      type: 'open_website',
      description: 'Opens a website in the browser',
      parameters: [
        { name: 'url', type: 'string', required: true, description: 'Website URL' },
        { name: 'name', type: 'string', required: false, description: 'Website name' },
      ],
      requiresConfirmation: false,
      handler: this.handleOpenWebsite.bind(this),
    });

    // Register search_web action
    this.registerAction({
      type: 'search_web',
      description: 'Performs a web search',
      parameters: [
        { name: 'query', type: 'string', required: true, description: 'Search query' },
      ],
      requiresConfirmation: false,
      handler: this.handleSearchWeb.bind(this),
    });

    // Register play_media action
    this.registerAction({
      type: 'play_media',
      description: 'Plays media content',
      parameters: [
        { name: 'query', type: 'string', required: true, description: 'What to play' },
        { name: 'platform', type: 'string', required: false, description: 'Platform (youtube/spotify)' },
      ],
      requiresConfirmation: false,
      handler: this.handlePlayMedia.bind(this),
    });

    // Register get_system_info action
    this.registerAction({
      type: 'get_system_info',
      description: 'Retrieves system information',
      parameters: [
        { name: 'infoType', type: 'string', required: true, description: 'Type of info (cpu/memory/temperature/all)' },
      ],
      requiresConfirmation: true,
      handler: this.handleGetSystemInfo.bind(this),
    });

    // Register get_news action
    this.registerAction({
      type: 'get_news',
      description: 'Fetches latest news',
      parameters: [
        { name: 'topic', type: 'string', required: true, description: 'News topic' },
      ],
      requiresConfirmation: false,
      handler: this.handleGetNews.bind(this),
    });

    // Register general_conversation action
    this.registerAction({
      type: 'general_conversation',
      description: 'General conversation without specific action',
      parameters: [
        { name: 'topic', type: 'string', required: false, description: 'Conversation topic' },
      ],
      requiresConfirmation: false,
      handler: this.handleGeneralConversation.bind(this),
    });

    console.log(`✅ Registered ${this.actions.size} default actions`);
  }

  registerAction(definition: ActionDefinition): void {
    this.actions.set(definition.type, definition);
    console.log(`📝 Registered action: ${definition.type}`);
  }

  async executeAction(intent: Intent): Promise<ActionResult> {
    try {
      const action = this.actions.get(intent.action);

      if (!action) {
        return {
          success: false,
          message: `Action "${intent.action}" not found`,
          data: null,
        };
      }

      console.log(`⚡ Executing action: ${intent.action}`);
      console.log(`📦 Entities:`, intent.entities);

      // Validate required parameters
      const validation = this.validateParameters(action, intent.entities);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.reason || 'Invalid parameters',
          data: null,
        };
      }

      // Execute the action handler
      const result = await action.handler(intent.entities);

      // Log to history
      this.actionHistory.push({
        intent,
        result,
        timestamp: Date.now(),
      });

      // Keep only last 100 actions
      if (this.actionHistory.length > 100) {
        this.actionHistory.shift();
      }

      return result;
    } catch (error) {
      console.error(`Error executing action ${intent.action}:`, error);
      return {
        success: false,
        message: `Failed to execute action: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null,
      };
    }
  }

  private validateParameters(
    action: ActionDefinition,
    entities: Record<string, any>
  ): { valid: boolean; reason?: string } {
    for (const param of action.parameters) {
      if (param.required && !entities[param.name]) {
        return {
          valid: false,
          reason: `Missing required parameter: ${param.name}`,
        };
      }
    }
    return { valid: true };
  }

  // Action Handlers

  private async handleOpenWebsite(entities: Record<string, any>): Promise<ActionResult> {
    const { url, name } = entities;

    // Validate URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return {
        success: false,
        message: 'Invalid URL format. URL must start with http:// or https://',
        data: null,
      };
    }

    return {
      success: true,
      message: `Opening ${name || url}`,
      data: { url, name, action: 'open_url' },
    };
  }

  private async handleSearchWeb(entities: Record<string, any>): Promise<ActionResult> {
    const { query } = entities;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    return {
      success: true,
      message: `Searching for: ${query}`,
      data: { url: searchUrl, query, action: 'open_url' },
    };
  }

  private async handlePlayMedia(entities: Record<string, any>): Promise<ActionResult> {
    const { query, platform = 'youtube' } = entities;

    let url: string;
    if (platform === 'youtube') {
      url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    } else if (platform === 'spotify') {
      url = `https://open.spotify.com/search/${encodeURIComponent(query)}`;
    } else {
      url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    }

    return {
      success: true,
      message: `Playing ${query} on ${platform}`,
      data: { url, query, platform, action: 'open_url' },
    };
  }

  private async handleGetSystemInfo(entities: Record<string, any>): Promise<ActionResult> {
    const { infoType } = entities;

    const systemInfo: Record<string, any> = {};

    if (infoType === 'cpu' || infoType === 'all') {
      const cpus = os.cpus();
      systemInfo.cpu = {
        model: cpus[0].model,
        cores: cpus.length,
        speed: `${cpus[0].speed} MHz`,
      };
    }

    if (infoType === 'memory' || infoType === 'all') {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      
      systemInfo.memory = {
        total: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        used: `${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        free: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        usagePercent: `${((usedMem / totalMem) * 100).toFixed(1)}%`,
      };
    }

    if (infoType === 'temperature' || infoType === 'all') {
      // Note: Temperature monitoring requires additional system-specific libraries
      systemInfo.temperature = {
        note: 'Temperature monitoring requires additional system access',
        available: false,
      };
    }

    if (infoType === 'all') {
      systemInfo.platform = os.platform();
      systemInfo.hostname = os.hostname();
      systemInfo.uptime = `${(os.uptime() / 3600).toFixed(2)} hours`;
    }

    return {
      success: true,
      message: `System information retrieved`,
      data: systemInfo,
    };
  }

  private async handleGetNews(entities: Record<string, any>): Promise<ActionResult> {
    const { topic } = entities;

    // For now, return a Google News search URL
    // In a full implementation, this would call NewsAPI
    const newsUrl = `https://news.google.com/search?q=${encodeURIComponent(topic)}`;

    return {
      success: true,
      message: `Fetching news about: ${topic}`,
      data: {
        url: newsUrl,
        topic,
        action: 'open_url',
        note: 'Opening Google News. For full API integration, configure NewsAPI key.',
      },
    };
  }

  private async handleGeneralConversation(entities: Record<string, any>): Promise<ActionResult> {
    return {
      success: true,
      message: 'Conversation response',
      data: { topic: entities.topic },
    };
  }

  // Utility methods

  getAvailableActions(): string[] {
    return Array.from(this.actions.keys());
  }

  getActionDefinition(actionType: string): ActionDefinition | undefined {
    return this.actions.get(actionType);
  }

  getActionHistory(limit: number = 10): Array<{ intent: Intent; result: ActionResult; timestamp: number }> {
    return this.actionHistory.slice(-limit);
  }

  clearHistory(): void {
    this.actionHistory = [];
    console.log('🗑️  Action history cleared');
  }
}
