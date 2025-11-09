import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { SocketEvents } from '../types';
import { ConversationOrchestrator } from './conversationOrchestrator';

export class SocketService {
  private io: SocketIOServer;
  private activeSessions: Map<string, string> = new Map(); // socketId -> sessionId
  private conversationOrchestrator: ConversationOrchestrator;

  constructor(httpServer: HTTPServer) {
    this.conversationOrchestrator = new ConversationOrchestrator();
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`✅ Client connected: ${socket.id}`);

      // Handle session start
      socket.on('session:start', () => {
        this.handleSessionStart(socket);
      });

      // Handle voice transcript
      socket.on('voice:transcript', (data: { text: string; language: string }) => {
        this.handleVoiceTranscript(socket, data);
      });

      // Handle action execution
      socket.on('action:execute', (intent: any) => {
        this.handleActionExecute(socket, intent);
      });

      // Handle session end
      socket.on('session:end', () => {
        this.handleSessionEnd(socket);
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`❌ Client disconnected: ${socket.id} - Reason: ${reason}`);
        this.activeSessions.delete(socket.id);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
        this.emitError(socket, 'SOCKET_ERROR', 'An error occurred with the connection');
      });
    });
  }

  private handleSessionStart(socket: Socket): void {
    const sessionId = this.generateSessionId();
    this.activeSessions.set(socket.id, sessionId);
    
    console.log(`🎯 Session started: ${sessionId} for socket ${socket.id}`);
    
    socket.emit('status', {
      state: 'session_started',
      message: 'Session initialized successfully',
      sessionId,
    });
  }

  private async handleVoiceTranscript(socket: Socket, data: { text: string; language: string }): Promise<void> {
    const sessionId = this.activeSessions.get(socket.id);
    
    if (!sessionId) {
      this.emitError(socket, 'NO_SESSION', 'No active session found');
      return;
    }

    console.log(`🎤 Transcript received from ${sessionId}: "${data.text}" (${data.language})`);
    
    // Emit status to show processing
    socket.emit('status', {
      state: 'processing',
      message: 'Processing your request...',
    });

    try {
      // Process through conversation orchestrator
      const result = await this.conversationOrchestrator.processUserInput(
        sessionId,
        data.text,
        data.language
      );

      // Send response
      socket.emit('voice:response', {
        text: result.text,
        audioBase64: result.audio ? result.audio.toString('base64') : undefined,
        language: data.language,
      });

      // If there's action data (like URL to open), send it
      if (result.actionData) {
        socket.emit('action:result', {
          success: true,
          message: 'Action executed',
          data: result.actionData,
        });
      }
    } catch (error) {
      console.error('Error processing transcript:', error);
      this.emitError(socket, 'PROCESSING_ERROR', 'Failed to process your request');
    }
  }

  private handleActionExecute(socket: Socket, intent: any): void {
    const sessionId = this.activeSessions.get(socket.id);
    
    if (!sessionId) {
      this.emitError(socket, 'NO_SESSION', 'No active session found');
      return;
    }

    console.log(`⚡ Action execution requested: ${intent.action}`);
    
    // TODO: Execute action through Agent Controller
    // For now, send mock response
    socket.emit('action:result', {
      success: true,
      message: `Action ${intent.action} executed successfully`,
      data: null,
    });
  }

  private handleSessionEnd(socket: Socket): void {
    const sessionId = this.activeSessions.get(socket.id);
    
    if (sessionId) {
      console.log(`🛑 Session ended: ${sessionId}`);
      this.activeSessions.delete(socket.id);
      
      socket.emit('status', {
        state: 'session_ended',
        message: 'Session ended successfully',
      });
    }
  }

  private emitError(socket: Socket, code: string, message: string): void {
    socket.emit('error', {
      code,
      message,
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for external use
  public emitToSession(sessionId: string, event: string, data: any): void {
    const socketId = Array.from(this.activeSessions.entries())
      .find(([_, sid]) => sid === sessionId)?.[0];
    
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  public getActiveSessions(): number {
    return this.activeSessions.size;
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}
