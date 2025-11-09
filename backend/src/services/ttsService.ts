import textToSpeech from '@google-cloud/text-to-speech';
import { google } from '@google-cloud/text-to-speech/build/protos/protos';
import crypto from 'crypto';

type Language = 'en' | 'hi';

interface TTSOptions {
  language?: Language;
  voiceSpeed?: number;
  useSSML?: boolean;
}

interface CachedAudio {
  audio: Buffer;
  timestamp: number;
}

export class TTSService {
  private client: textToSpeech.TextToSpeechClient;
  private audioCache: Map<string, CachedAudio> = new Map();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 100;

  constructor() {
    // Initialize the TTS client with API key
    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    
    if (!apiKey) {
      throw new Error('GOOGLE_TTS_API_KEY is not configured');
    }

    this.client = new textToSpeech.TextToSpeechClient({
      apiKey: apiKey,
    });

    // Start cache cleanup interval
    this.startCacheCleanup();
  }

  async synthesizeSpeech(text: string, options: TTSOptions = {}): Promise<Buffer> {
    const {
      language = 'en',
      voiceSpeed = 1.0,
      useSSML = false,
    } = options;

    // Check cache first
    const cacheKey = this.generateCacheKey(text, language, voiceSpeed);
    const cached = this.audioCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`🎵 Using cached audio for: "${text.substring(0, 30)}..."`);
      return cached.audio;
    }

    try {
      // Prepare the request
      const request: google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
        input: useSSML ? { ssml: text } : { text },
        voice: this.getVoiceConfig(language),
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: voiceSpeed,
          pitch: 0,
          volumeGainDb: 0,
          effectsProfileId: ['headphone-class-device'],
        },
      };

      console.log(`🎤 Synthesizing speech: "${text.substring(0, 50)}..." (${language})`);
      
      const [response] = await this.client.synthesizeSpeech(request);
      
      if (!response.audioContent) {
        throw new Error('No audio content received from TTS service');
      }

      const audioBuffer = Buffer.from(response.audioContent as Uint8Array);
      
      // Cache the result
      this.cacheAudio(cacheKey, audioBuffer);
      
      return audioBuffer;
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      throw new Error('Failed to synthesize speech');
    }
  }

  async synthesizeWithSSML(text: string, language: Language = 'en', voiceSpeed: number = 1.0): Promise<Buffer> {
    // Add SSML tags for natural pauses and emphasis
    const ssml = this.addSSMLTags(text);
    return this.synthesizeSpeech(ssml, { language, voiceSpeed, useSSML: true });
  }

  private getVoiceConfig(language: Language): google.cloud.texttospeech.v1.IVoiceSelectionParams {
    const voiceConfigs = {
      en: {
        languageCode: 'en-IN',
        name: 'en-IN-Neural2-B', // Male voice, calm and confident
        ssmlGender: 'MALE' as google.cloud.texttospeech.v1.SsmlVoiceGender,
      },
      hi: {
        languageCode: 'hi-IN',
        name: 'hi-IN-Neural2-B', // Male Hindi voice
        ssmlGender: 'MALE' as google.cloud.texttospeech.v1.SsmlVoiceGender,
      },
    };

    return voiceConfigs[language];
  }

  private addSSMLTags(text: string): string {
    // Add natural pauses and emphasis
    let ssml = `<speak>${text}`;
    
    // Add pauses after punctuation
    ssml = ssml.replace(/\./g, '.<break time="300ms"/>');
    ssml = ssml.replace(/,/g, ',<break time="200ms"/>');
    ssml = ssml.replace(/\?/g, '?<break time="400ms"/>');
    ssml = ssml.replace(/!/g, '!<break time="400ms"/>');
    
    // Add emphasis to certain words
    ssml = ssml.replace(/\b(bhai|yo|got it|sure|awesome|cool)\b/gi, '<emphasis level="moderate">$1</emphasis>');
    
    ssml += '</speak>';
    return ssml;
  }

  private generateCacheKey(text: string, language: Language, voiceSpeed: number): string {
    const data = `${text}_${language}_${voiceSpeed}`;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  private cacheAudio(key: string, audio: Buffer): void {
    // Implement LRU-like cache eviction
    if (this.audioCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.audioCache.keys().next().value;
      this.audioCache.delete(oldestKey);
    }

    this.audioCache.set(key, {
      audio,
      timestamp: Date.now(),
    });
  }

  private startCacheCleanup(): void {
    // Clean up expired cache entries every hour
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.audioCache.entries()) {
        if (now - value.timestamp > this.CACHE_TTL) {
          this.audioCache.delete(key);
        }
      }
      console.log(`🧹 Cache cleanup: ${this.audioCache.size} items remaining`);
    }, 60 * 60 * 1000);
  }

  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.audioCache.size,
      maxSize: this.MAX_CACHE_SIZE,
    };
  }

  clearCache(): void {
    this.audioCache.clear();
    console.log('🗑️  TTS cache cleared');
  }
}
