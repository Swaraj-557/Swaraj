const API_BASE = '/api';

export interface ChatResponse {
  reply: string;
  tool?: {
    name: string;
    args: any;
  };
}

export interface ToolResult {
  result: string;
  speakable: string;
  action?: string;
}

export async function sendMessage(text: string, sessionId: string): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, sessionId }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
}

export async function generateSpeech(text: string): Promise<string> {
  const response = await fetch(`${API_BASE}/tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate speech');
  }

  const data = await response.json();
  return `data:audio/mpeg;base64,${data.audio}`;
}

export async function executeTool(
  name: string,
  args: any,
  sessionId: string
): Promise<ToolResult> {
  const response = await fetch(`${API_BASE}/tools/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, args, sessionId }),
  });

  if (!response.ok) {
    throw new Error('Failed to execute tool');
  }

  return response.json();
}
