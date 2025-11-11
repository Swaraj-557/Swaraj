import fetch from 'node-fetch';

if (!process.env.AZURE_SPEECH_KEY) {
  console.warn('AZURE_SPEECH_KEY is not set in environment variables');
}

if (!process.env.AZURE_SPEECH_REGION) {
  console.warn('AZURE_SPEECH_REGION is not set - defaulting to eastus');
}

const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY || '';
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION || 'eastus';

export interface TTSOptions {
  text: string;
  voice?: string;
  style?: string;
  rate?: string;
  pitch?: string;
}

export async function generateSpeech(options: TTSOptions): Promise<Buffer> {
  const {
    text,
    voice = 'en-US-AdamMultilingualNeural',
    style = 'friendly',
    rate = '0%',
    pitch = '0%',
  } = options;

  if (!AZURE_SPEECH_KEY) {
    throw new Error('AZURE_SPEECH_KEY is not configured');
  }

  console.log('Azure TTS Config:', {
    region: AZURE_SPEECH_REGION,
    voice,
    style,
    textLength: text.length
  });

  try {
    // Get access token
    const tokenResponse = await fetch(
      `https://${AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
        },
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token error:', errorText);
      throw new Error(`Failed to get access token: ${tokenResponse.status} - ${errorText}`);
    }

    const accessToken = await tokenResponse.text();
    console.log('Access token obtained successfully');

    // Generate SSML
    const ssml = `<speak version='1.0' xml:lang='en-US' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='https://www.w3.org/2001/mstts'>
  <voice name='${voice}'>
    <mstts:express-as style='${style}'>
      <prosody rate='${rate}' pitch='${pitch}'>
        ${escapeXml(text)}
      </prosody>
    </mstts:express-as>
  </voice>
</speak>`;

    console.log('Generated SSML length:', ssml.length);

    // Call TTS API
    const ttsResponse = await fetch(
      `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          'User-Agent': 'SwarajAI',
        },
        body: ssml,
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('TTS API error:', errorText);
      throw new Error(`Azure TTS API error: ${ttsResponse.status} - ${errorText}`);
    }

    const arrayBuffer = await ttsResponse.arrayBuffer();
    console.log('Audio generated successfully, size:', arrayBuffer.byteLength);
    return Buffer.from(arrayBuffer);
  } catch (error: any) {
    console.error('Azure TTS Error:', error);
    throw new Error(`Failed to generate speech with Azure TTS: ${error.message}`);
  }
}

// Helper function to escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Stream speech (for real-time response)
export async function generateSpeechStream(options: TTSOptions): Promise<NodeJS.ReadableStream> {
  // Azure TTS streaming works similarly but returns the stream directly
  const {
    text,
    voice = 'en-US-AdamMultilingualNeural',
    style = 'friendly',
    rate = '0%',
    pitch = '0%',
  } = options;

  if (!AZURE_SPEECH_KEY) {
    throw new Error('AZURE_SPEECH_KEY is not configured');
  }

  try {
    // Get access token
    const tokenResponse = await fetch(
      `https://${AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
        },
      }
    );

    if (!tokenResponse.ok) {
      throw new Error(`Failed to get access token: ${tokenResponse.status}`);
    }

    const accessToken = await tokenResponse.text();

    // Generate SSML
    const ssml = `
      <speak version='1.0' xml:lang='en-US'>
        <voice name='${voice}'>
          <mstts:express-as style='${style}'>
            <prosody rate='${rate}' pitch='${pitch}'>
              ${escapeXml(text)}
            </prosody>
          </mstts:express-as>
        </voice>
      </speak>
    `;

    // Call TTS API
    const ttsResponse = await fetch(
      `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          'User-Agent': 'SwarajAI',
        },
        body: ssml,
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      throw new Error(`Azure TTS API error: ${ttsResponse.status} - ${errorText}`);
    }

    return ttsResponse.body as NodeJS.ReadableStream;
  } catch (error) {
    console.error('Azure TTS Stream Error:', error);
    throw new Error('Failed to stream speech with Azure TTS');
  }
}
