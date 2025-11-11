import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Load system prompt
const systemPromptPath = path.join(__dirname, 'prompts', 'system-swaraj.txt');
let SYSTEM_PROMPT = '';

try {
  SYSTEM_PROMPT = fs.readFileSync(systemPromptPath, 'utf-8');
  console.log('✅ System prompt loaded successfully');
  console.log('📝 Prompt length:', SYSTEM_PROMPT.length, 'characters');
  console.log('🎯 First 100 chars:', SYSTEM_PROMPT.substring(0, 100));
} catch (error) {
  console.warn('⚠️ Warning: Could not load system-swaraj.txt, using default prompt');
  console.error('Error details:', error);
  SYSTEM_PROMPT = `You are Swaraj AI - the digital voice of Swaraj Satyam. You're calm, confident, logical, and creative. Speak naturally in a bilingual style (English/Hinglish). Keep responses concise for voice output.`;
}

// In-memory conversation history (per session)
const conversationHistory = new Map<string, any[]>();

export interface ChatResponse {
  reply: string;
  tool?: {
    name: string;
    args: any;
  };
}

export async function chat(userMessage: string, sessionId: string = 'default'): Promise<ChatResponse> {
  try {
    // Get or create conversation history
    if (!conversationHistory.has(sessionId)) {
      conversationHistory.set(sessionId, []);
    }
    
    const history = conversationHistory.get(sessionId)!;
    
    // Initialize model with system instruction - Using Gemini 2.5 Flash for best bilingual support
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });
    
    console.log('🤖 Gemini model initialized with system instruction');
    console.log('📊 Session:', sessionId, '| History length:', history.length);

    // Build conversation context
    const chatHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    // Start chat with history
    const chat = model.startChat({
      history: chatHistory,
    });

    // Send message
    const result = await chat.sendMessage(userMessage);
    const responseText = result.response.text();

    // Store in history
    history.push({ role: 'user', content: userMessage });
    history.push({ role: 'model', content: responseText });

    // Keep only last 10 exchanges (20 messages)
    if (history.length > 20) {
      conversationHistory.set(sessionId, history.slice(-20));
    }

    // Check for tool usage patterns
    const tool = detectToolUsage(responseText, userMessage);

    return {
      reply: responseText,
      tool,
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to get response from Gemini');
  }
}

// Simple tool detection based on keywords
function detectToolUsage(response: string, userMessage: string): ChatResponse['tool'] {
  const lowerMsg = userMessage.toLowerCase();
  const lowerRes = response.toLowerCase();

  // YouTube detection
  if (lowerMsg.includes('youtube') || lowerMsg.includes('video')) {
    return { name: 'open_youtube', args: {} };
  }

  // Music/Lo-fi detection
  if (lowerMsg.includes('play') && (lowerMsg.includes('music') || lowerMsg.includes('lofi') || lowerMsg.includes('lo-fi'))) {
    return { name: 'play_lofi', args: {} };
  }

  // Time detection
  if (lowerMsg.includes('time') || lowerMsg.includes('clock')) {
    return { name: 'show_time', args: {} };
  }

  // Note-taking detection
  if ((lowerMsg.includes('remember') || lowerMsg.includes('note')) && !lowerMsg.includes('show')) {
    const noteContent = userMessage.replace(/remember|note|this|that/gi, '').trim();
    return { name: 'add_note', args: { content: noteContent } };
  }

  // Get notes detection
  if (lowerMsg.includes('show') && (lowerMsg.includes('note') || lowerMsg.includes('remember'))) {
    return { name: 'get_notes', args: {} };
  }

  // News detection
  if (lowerMsg.includes('news') || lowerMsg.includes('headline')) {
    return { name: 'fetch_news', args: {} };
  }

  return undefined;
}

// Clear conversation for a session
export function clearSession(sessionId: string = 'default') {
  conversationHistory.delete(sessionId);
}
