import textToSpeech from '@google-cloud/text-to-speech';
import { protos } from '@google-cloud/text-to-speech';

// Google TTS client - will use Firebase credentials when deployed
const client = new textToSpeech.TextToSpeechClient();

export interface TTSOptions {
  text: string;
  voice?: string;
  languageCode?: string;
  ssmlGender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
  speakingRate?: number;
  pitch?: number;
}

export async function generateSpeech(options: TTSOptions): Promise<Buffer> {
  const {
    text,
    voice = 'hi-IN-Neural2-A',
    languageCode = 'hi-IN',
    ssmlGender = 'MALE',
    speakingRate = 1.0,
    pitch = 0,
  } = options;

  console.log('🎤 Google TTS Config:', {
    voice,
    languageCode,
    textLength: text.length,
    speakingRate,
    pitch
  });

  try {
    // Detect language and adjust voice accordingly
    const hasHindi = /[\u0900-\u097F]/.test(text);
    const hasEnglish = /[a-zA-Z]/.test(text);
    
    let selectedVoice = voice;
    let selectedLanguage = languageCode;
    
    // For mixed Hindi-English (Hinglish), use Hindi neural voice
    if (hasHindi || (hasHindi && hasEnglish)) {
      selectedVoice = 'hi-IN-Neural2-B'; // Male Hindi Neural voice
      selectedLanguage = 'hi-IN';
    } else if (hasEnglish) {
      selectedVoice = 'en-IN-Neural2-A'; // Male Indian English Neural voice
      selectedLanguage = 'en-IN';
    }

    console.log('🗣️ Selected voice:', selectedVoice, 'Language:', selectedLanguage);

    const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
      input: { text },
      voice: {
        languageCode: selectedLanguage,
        name: selectedVoice,
        ssmlGender: ssmlGender as any,
      },
      audioConfig: {
        audioEncoding: 'MP3' as any,
        speakingRate,
        pitch,
        effectsProfileId: ['handset-class-device'],
        sampleRateHertz: 24000,
      },
    };

    const [response] = await client.synthesizeSpeech(request);

    if (!response.audioContent) {
      throw new Error('No audio content in response');
    }

    const audioBuffer = Buffer.from(response.audioContent as Uint8Array);
    console.log('✅ Audio generated successfully, size:', audioBuffer.length);
    
    return audioBuffer;
  } catch (error: any) {
    console.error('❌ Google TTS Error:', error);
    throw new Error(`Failed to generate speech with Google TTS: ${error.message}`);
  }
}

// Stream is not needed for Google TTS as it returns the complete audio
export async function generateSpeechStream(options: TTSOptions): Promise<Buffer> {
  // Google Cloud TTS doesn't support streaming in the same way
  // Return the complete audio buffer
  return generateSpeech(options);
}
