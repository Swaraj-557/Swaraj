import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
    
    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventHandlers();
    return this.socket;
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
      this.reconnectAttempts = 0;
      this.socket?.emit('session:start');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
    });
  }

  sendTranscript(text: string, language: string) {
    this.socket?.emit('voice:transcript', { text, language });
  }

  executeAction(intent: any) {
    this.socket?.emit('action:execute', intent);
  }

  onVoiceResponse(callback: (data: any) => void) {
    this.socket?.on('voice:response', callback);
  }

  onActionResult(callback: (data: any) => void) {
    this.socket?.on('action:result', callback);
  }

  onStatus(callback: (data: any) => void) {
    this.socket?.on('status', callback);
  }

  onError(callback: (data: any) => void) {
    this.socket?.on('error', callback);
  }

  disconnect() {
    this.socket?.emit('session:end');
    this.socket?.disconnect();
  }

  getSocket() {
    return this.socket;
  }
}

export const socketClient = new SocketClient();
