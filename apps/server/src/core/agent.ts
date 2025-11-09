// In-memory storage for session notes
const sessionNotes = new Map<string, string[]>();

export interface ToolResult {
  result: string;
  speakable: string;
  action?: string;
}

export async function executeTool(name: string, args: any, sessionId: string = 'default'): Promise<ToolResult> {
  switch (name) {
    case 'open_youtube':
      return openYouTube();
    
    case 'play_lofi':
      return playLofi();
    
    case 'show_time':
      return showTime();
    
    case 'add_note':
      return addNote(args.content, sessionId);
    
    case 'get_notes':
      return getNotes(sessionId);
    
    case 'fetch_news':
      return fetchNews();
    
    default:
      return {
        result: 'Unknown tool',
        speakable: 'Sorry, I don\'t know how to do that yet.',
      };
  }
}

function openYouTube(): ToolResult {
  return {
    result: 'Opening YouTube',
    speakable: 'Got it, bro. Opening YouTube for you.',
    action: 'open_url:https://www.youtube.com',
  };
}

function playLofi(): ToolResult {
  return {
    result: 'Playing lo-fi music',
    speakable: 'Lo-fi mode activated. Chill vibes incoming.',
    action: 'open_url:https://www.youtube.com/watch?v=jfKfPfyJRdk',
  };
}

function showTime(): ToolResult {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return {
    result: `${timeStr} on ${dateStr}`,
    speakable: `It's ${timeStr}. ${dateStr}.`,
  };
}

function addNote(content: string, sessionId: string): ToolResult {
  if (!sessionNotes.has(sessionId)) {
    sessionNotes.set(sessionId, []);
  }
  
  const notes = sessionNotes.get(sessionId)!;
  notes.push(content);
  
  return {
    result: `Note added: "${content}"`,
    speakable: 'Got it. Note saved in memory.',
  };
}

function getNotes(sessionId: string): ToolResult {
  const notes = sessionNotes.get(sessionId) || [];
  
  if (notes.length === 0) {
    return {
      result: 'No notes found',
      speakable: 'You haven\'t saved any notes yet, bro.',
    };
  }
  
  const notesList = notes.map((note, i) => `${i + 1}. ${note}`).join('\n');
  const speakableNotes = notes.length === 1 
    ? `You have one note: ${notes[0]}`
    : `You have ${notes.length} notes. ${notes.join('. ')}`;
  
  return {
    result: notesList,
    speakable: speakableNotes,
  };
}

async function fetchNews(): Promise<ToolResult> {
  // Optional: If NEWS_API_KEY is provided, fetch real news
  if (process.env.NEWS_API_KEY) {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=in&pageSize=3&apiKey=${process.env.NEWS_API_KEY}`
      );
      
      if (response.ok) {
        const data: any = await response.json();
        const headlines = data.articles
          .slice(0, 3)
          .map((article: any, i: number) => `${i + 1}. ${article.title}`)
          .join('\n');
        
        const speakable = data.articles
          .slice(0, 3)
          .map((article: any) => article.title)
          .join('. ');
        
        return {
          result: headlines,
          speakable: `Here are today's top headlines. ${speakable}`,
        };
      }
    } catch (error) {
      console.error('News API Error:', error);
    }
  }
  
  // Fallback: Generic response
  return {
    result: 'News feature requires API key',
    speakable: 'News feature isn\'t configured yet, bro. Set up NEWS_API_KEY to enable it.',
  };
}

export function clearSessionNotes(sessionId: string) {
  sessionNotes.delete(sessionId);
}
