import fetch from 'node-fetch';

if (!process.env.ELEVENLABS_API_KEY) {
  throw new Error('ELEVENLABS_API_KEY is not set in environment variables');
}

if (!process.env.ELEVENLABS_VOICE_ID) {
  throw new Error('ELEVENLABS_VOICE_ID is not set in environment variables');
}

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

export interface TTSOptions {
  text: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export async function generateSpeech(options: TTSOptions): Promise<Buffer> {
  const {
    text,
    stability = 0.45,
    similarityBoost = 0.8,
    style = 0.4,
    useSpeakerBoost = true,
  } = options;

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: useSpeakerBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('ElevenLabs TTS Error:', error);
    throw new Error('Failed to generate speech with ElevenLabs');
  }
}

// Stream speech (for real-time response)
export async function generateSpeechStream(options: TTSOptions): Promise<NodeJS.ReadableStream> {
  const {
    text,
    stability = 0.45,
    similarityBoost = 0.8,
    style = 0.4,
    useSpeakerBoost = true,
  } = options;

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: useSpeakerBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    return response.body as NodeJS.ReadableStream;
  } catch (error) {
    console.error('ElevenLabs TTS Stream Error:', error);
    throw new Error('Failed to stream speech with ElevenLabs');
  }
}
